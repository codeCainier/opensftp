import tools                from 'src/utils'
import { alert, confirm }   from 'src/utils/dialog'
import router               from 'src/router'
import electron             from 'electron'
import { uid }              from 'quasar'
import path                 from 'path'

class SessionConnect {
    constructor(sessionId) {
        // 会话 ID
        this.id = uid()
        // 会话信息 ID
        this.sessionId = sessionId
        // 当前窗口 ID
        this.winId = electron.remote.BrowserWindow.getFocusedWindow().id
        // 请求频道名称
        this.reqChannelName = 'req-' + this.id
        // 响应频道名称
        this.resChannelName = 'res-' + this.id
        // 使用创建新窗口方法，创建会话进程
        this.win = new electron.remote.BrowserWindow({
            show   : false,
            // TODO: parent 参数必要性需讨论
            parent : this.winId,
            width  : 300,
            height : 300,
            webPreferences: {
                // FIXME: 校验安全度
                nodeIntegration: true,
            },
        })
        // connect html 路径
        this.loadUrlPath = process.env.NODE_ENV === 'development'
            ? path.join(location.origin, 'connect.html')
            : location.origin + path.join(path.dirname(location.pathname), 'connect.html')
        // TODO: 开发模式开启 DevTools
        // this.win.webContents.openDevTools()
        // data Map
        this.dataMap = new Map()
        // 长连接动作
        this.keepAction = [
            'auth',
            'download',
            'upload',
        ]
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            // 加载 connect 文件
            await this.win.loadURL(this.loadUrlPath)
            // 通知进程进行初始化
            this.win.webContents.send('connect-init-req', this.id, this.winId)
            // 监听进程初始化完成 (一次性)
            electron.ipcRenderer.once('connect-init-res', () => resolve())
            // 监听来自响应频道的响应消息
            electron.ipcRenderer.on(this.resChannelName,  (event, response) => {
                const { mid } = response.head
                const { request } = this.dataMap.get(mid)
                // data Map 写入响应
                this.dataMap.set(mid, {
                    ...{ request },
                    ...{ response },
                })
            })
        })
    }

    send(action, params) {
        const mid = uid()
        const request = {
            head: {
                mid,
                action,
                time: Date.now(),
            },
            body: { ...params },
        }
        return new Promise((resolve, reject) => {
            // data Map 写入请求与进度回调
            this.dataMap.set(mid, { request })
            // 向请求频道发送信息
            this.win.webContents.send(this.reqChannelName, request, this.winId)
            // 监听来自响应频道的响应消息
            const timer = setInterval(() => {
                // 查询是否接到响应
                const { response } = this.dataMap.get(mid)
                // 若接到响应
                if (response) {
                    const { type, data, message } = response.body
                    clearInterval(timer)
                    this.dataMap.delete(mid)
                    if (type === 'success')  resolve(data)
                    if (type === 'error')    reject(message)
                }
                // TODO: 系统设置可配置 - 监听来自响应频道的响应消息
            }, 100)
            // 为非 download / upload 等长请求，设置 10s 超时
            if (!this.keepAction.includes(action)) {
                setTimeout(() => {
                    clearInterval(timer)
                    this.dataMap.delete(mid)
                    reject('Timeout')
                    // TODO: 系统设置可配置 - 超时时间，慎重
                }, 10000)
            }
        })
    }

    close() {
        // 关闭 win 窗口
        this.win.close()
    }
}

/**
 * 会话建立连接
 * @param   {Object}    sessionItem     会话信息对象
 */
export function CONNECT({ state, commit }, sessionItem) {
    return new Promise(async (resolve, reject) => {
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
            resolve()
        } catch (err) {
            // 认证失败 给出提示
            await alert(err)
            // 关闭会话连接
            conn.close()
            // vuex 正在连接会话列表 remove
            commit('CONNECTING_DEL', sessionId)
            reject()
        }
    })
}

/**
 * 会话快速建立连接
 * @param   {Object}    sessionInfo             会话连接信息
 * @param   {String}    sessionInfo.host        地址
 * @param   {String}    sessionInfo.port        端口
 * @param   {String}    sessionInfo.username    用户
 * @param   {String}    sessionInfo.password    密码
 */
export function CONNECT_QUICK({ state, commit, getters }, sessionInfo) {
    return new Promise((resolve, reject) => {
        const { host, port, username, password } = sessionInfo
        const homePath = path.join(electron.remote.app.getPath('home'))
        const iconPath = 'statics/icons/server-icons/default.svg'
        const existSession = getters['sessionInfo'](sessionInfo)
        const sessionItem = existSession || {
            id         : uid(),
            type       : 'session',
            name       : host,
            icon       : iconPath,
            detail     : {
                host       : host,
                port       : port,
                username   : username,
                password   : tools.aesEncode(password),
                privateKey : '',
                authMode   : 'password',
                localPath  : homePath,
                remotePath : '/',
            },
            createTime : Date.now(),
            updateTime : Date.now(),
        }

        // 若不存在相同会话，则进行创建
        if (!existSession) commit('CREATE_SESSION_QUICK', sessionItem)

        CONNECT({ state, commit }, sessionItem)
            .then(() => resolve())
            .catch(() => {
                // TODO: 若开启 - 快速连接会话 - 连接失败不保存会话功能
                // commit('DELETE', sessionItem.id)
                reject()
            })
    })
}

/**
 * 会话取消连接（正在连接会话）
 * @param   {Object}    sessionItem     会话信息对象
 */
export function CONNECT_CANCEL({ state, commit }, sessionId) {
    const conn = state.connectingList.find(item => item.sessionId === sessionId)
    // vuex 正在连接会话列表 remove
    commit('CONNECTING_DEL', sessionId)
    // 关闭会话连接
    conn.close()
}

/**
 * 会话断开连接（已连接会话）
 * @param   {Object}    sessionItem     会话信息对象
 */
export async function CONNECT_EXIT({ state, commit }, conn) {
    const { id } = conn
    // 获取要关闭的连接在 connectedList 中所处的位置
    const index  = state.connectedList.findIndex(item => item.id === id)

    // vuex 已连接会话列表 remove
    commit('CONNECTED_DEL', conn.id)
    // 关闭会话连接
    conn.close()

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
    state.connectedList.forEach(conn => conn.close())
    // vuex 已连接会话列表清空
    commit('CONNECTED_DEL_ALL')
    // 回到首页
    if (router.app.$route.path !== '/') await router.push('/')
}
