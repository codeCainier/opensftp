import Connect  from 'src/core/connect'
import tools    from 'src/utils'
import electron from 'electron'
import { uid }  from 'quasar'
import path from "path";
import {sessionInfo} from "src/store/module-session/getters";

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




class Session {
    constructor(sessionInfo) {
        // 会话信息
        this.sessionInfo = sessionInfo
        // 会话 ID
        this.id = uid()
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
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            // 加载 connect 文件
            await this.win.loadURL(path.join('file://', __statics, 'statics', 'html', 'connect.html'))
            this.win.webContents.send('connect-init', {
                action: 'init',
                params: {
                    id: this.id,
                    sessionInfo: this.sessionInfo,
                },
            }, this.winId)
            // TODO: 若存在延迟则等会话进程响应初始化成功后再 resolve
            resolve()
        })
    }

    send(action, params) {
        const processNameSend = `connect-send-${this.id}`
        const processNameBack = `connect-back-${this.id}`
        return new Promise((resolve, reject) => {
            this.win.webContents.send(processNameSend, { action, params }, this.winId)
            electron.ipcRenderer.on(processNameBack, (event, data) => {
                resolve(data)
            })
        })
    }
}

export async function SESSION_CONNECT({ state, commit }, sessionInfo) {
    // 创建会话对象
    const conn = new Session(sessionInfo)
    // vuex 写入会话连接 ID
    commit('SESSION_CONNECT_ADD', conn.id)
    // 连接初始化
    await conn.init()
    // 发起认证
    conn.send({
        action: 'auth',
    })
        .then(() => {

        })
}
