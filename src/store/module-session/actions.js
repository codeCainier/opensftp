import Connect   from 'src/core/connect'
import tools     from 'src/utils'
import { alert } from 'src/utils/dialog'
import router    from 'src/router'
import electron  from 'electron'
import { uid }   from 'quasar'
import path      from 'path'

class SessionConnect {
    constructor(sessionId) {
        // 会话 ID
        this.id = uid()
        // 会话信息 ID
        this.sessionId = sessionId
        // 当前窗口 ID
        this.winId = electron.remote.BrowserWindow.getFocusedWindow().id
        // 使用创建新窗口方法，创建会话进程
        this.win = new electron.remote.BrowserWindow({
            show   : true,
            width  : 300,
            height : 300,
            webPreferences: {
                nodeIntegration: true,
            },
        })
        // connect html 路径
        this.loadUrlPath = process.env.NODE_ENV === 'development'
            ? path.join(location.origin, 'connect.html')
            : location.origin + path.join(path.dirname(location.pathname), 'connect.html')
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            // 加载 connect 文件
            await this.win.loadURL(this.loadUrlPath)
            // 通知进程进行初始化
            this.win.webContents.send('connect-init-req', this.id, this.winId)
            // 监听进程初始化完成 (一次性)
            electron.ipcRenderer.once('connect-init-res', () => resolve())
        })
    }

    send(action, params) {
        // 请求频道名称
        const reqChannelName = 'req-' + this.id
        // 响应频道名称
        const resChannelName = 'res-' + this.id
        const mid = uid()
        const reqData = {
            head: { mid, action },
            body: { ...params },
        }

        return new Promise((resolve, reject) => {
            // 向请求频道发送信息
            this.win.webContents.send(reqChannelName, reqData, this.winId)
            // 监听来自响应频道的响应消息
            electron.ipcRenderer.on(resChannelName, listener)
            // 监听器
            function listener(event, resData) {
                // 若消息 ID 不一致则不做处理
                if (resData.head.mid !== mid) return
                // 解构赋值
                const { type, data, message } = resData.body
                // 根据处理状态进行操作
                if (type === 'success') resolve(data)
                if (type === 'error')   reject(message)
            }
        })
    }
}

/**
 * 登录连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {Object}    sessionInfo     会话信息
 */
export function LOGIN({ state, commit }, sessionInfo) {
    const connect = new Connect(sessionInfo)
    return new Promise((resolve, reject) => {
        connect
            .init()
            .then(() => {
                // 创建会话标签
                commit('CONNECT', connect)
                resolve()
            })
            .catch(err => reject(err))
    })
}

/**
 * 快速连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {Object}    sessionInfo     会话信息
 */
export function LOGIN_QUICK({ state, commit, getters }, sessionInfo) {
    const { host, port, username, password } = sessionInfo

    const connect = new Connect({
        detail: {
            host,
            port,
            username,
            password: tools.aesEncode(password),
            authMode: 'password',
        }
    })

    return new Promise((resolve, reject) => {
        connect
            .init()
            .then(() => {
                // 若会话池不存在会话信息，则保存会话信息
                if (!getters.sessionInfo({ host, port, username })) commit('CREATE_SESSION', {
                    name: host,
                    host,
                    port,
                    username,
                    password,
                    authMode: 'password',
                })
                // 更新 connect 对象中会话信息
                connect.sessionInfo = tools.clone(getters.sessionInfo({ host, port, username }))
                // 使用会话信息创建会话标签
                commit('CONNECT', connect)
                resolve()
            })
            .catch(err => reject(err))
    })
}

/**
 * 取消连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {String}    sessionId       会话 ID
 */
export function LOGIN_CANCEL({ state, commit }, sessionId) {

}

/**
 * 断开连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {String}    id              会话连接 ID
 */
export function EXIT({ state, commit }, id) {
    const index  = state.conn.findIndex(item => item.id === id)
    let nextId

    return new Promise((resolve, reject) => {
        try {
            commit('END', id)

            if (state.conn.length && index === state.conn.length) nextId = state.conn[index - 1].id
            if (state.conn.length && index !== state.conn.length) nextId = state.conn[index].id
            if (!state.conn.length) nextId = null

            commit('SET_ACTIVE', nextId)
            resolve()
        } catch (err) {
            reject(err)
        }
    })
}


/**
 * 登录连接
 * @param   {Object}    sessionItem     会话信息对象
 */
export async function CONNECT({ state, commit }, sessionItem) {
    const sessionId   = sessionItem.id
    const sessionInfo = sessionItem.detail
    // 创建会话对象
    const conn = new SessionConnect(sessionId)
    // vuex 正在连接会话列表 push
    commit('CONNECTING_ADD', conn)
    // 发起认证
    try {
        // 连接初始化
        await conn.init()
        // 发起认证
        await conn.send('auth', { sessionInfo })
        // 认证成功 vuex 已连接会话列表 push
        commit('CONNECTED_ADD', conn)
        // 设置为活跃会话
        commit('SET_ACTIVE', conn.id)
        // vuex 正在连接会话列表 remove
        commit('CONNECTING_DEL', sessionId)
        // 若没有在正在连接的会话，则跳转路由
        if (state.connectingList.length === 0) {
            // 跳转路由
            if (router.app.$route.path !== '/session') await router.push('/session')
        }
    } catch (err) {
        // 认证失败 给出提示
        await alert(err)
        // 关闭会话连接
        conn.win.close()
        // vuex 正在连接会话列表 remove
        commit('CONNECTING_DEL', sessionId)
    }
}

export function CONNECT_CANCEL({ state, commit }, sessionId) {
    const conn = state.connectingList.find(item => item.sessionId === sessionId)
    // vuex 正在连接会话列表 remove
    commit('CONNECTING_DEL', sessionId)
    // 关闭会话连接
    conn.win.close()
}

export async function CONNECT_EXIT({ state, commit }, conn) {
    const { id } = conn
    // 获取要关闭的连接在 connectedList 中所处的位置
    const index  = state.connectedList.findIndex(item => item.id === id)

    // vuex 已连接会话列表 remove
    commit('CONNECTED_DEL', conn.id)
    // 关闭会话连接
    conn.win.close()

    // 若关闭的连接是当前活跃标签，且已连接会话数量不为 0，则更换活跃标签
    if (id === state.active && state.connectedList.length !== 0) {
        try {
            commit('SET_ACTIVE', state.connectedList[index].id)
        } catch (err) {
            commit('SET_ACTIVE', state.connectedList[index - 1].id)
        }
    }
    // 若关闭的连接是当前活跃标签，且已连接会话数量为 0，则回到首页
    if (id === state.active && state.connectedList.length === 0) {
        commit('SET_ACTIVE', null)
        if (router.app.$route.path !== '/') await router.push('/')
    }
}

/**
 * 关闭所有已连接会话
 */
export async function CONNECT_EXIT_ALL({ state, commit }) {
    // 关闭所有会话连接
    state.connectedList.forEach(conn => conn.win.close())
    // vuex 已连接会话列表清空
    commit('CONNECTED_DEL_ALL')
    // 回到首页
    if (router.app.$route.path !== '/') await router.push('/')
}
