import Connect from 'src/core/connect'
import tools   from 'src/utils'

function getExistSessionInfo ({ pool }, sessionInfo) {
    const { host, port, username } = sessionInfo
    return pool.find(item => item.host === host
        && item.port === port
        && item.username === username)
}

/**
 * 快速连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {Object}    sessionInfo     会话信息
 */
export function QUICK_LOGIN({ state, commit }, sessionInfo) {
    const connect       = new Connect(sessionInfo)
    const existSession  = getExistSessionInfo(state, sessionInfo)

    return new Promise((resolve, reject) => {
        connect
            .init()
            .then(() => {
                // 若会话池不存在会话信息，则保存会话信息
                if (!existSession) {
                    // 保存会话信息
                    commit('CREATE', sessionInfo)
                }
                // 使用已存在的会话信息
                sessionInfo = getExistSessionInfo(state, sessionInfo)
                // 创建会话标签
                commit('CONNECT', { connect, sessionInfo })
                resolve()
            })
            .catch(err => reject(err))
    })
}

/**
 * 登录连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {Object}    sessionInfo     会话信息
 */
export function LOGIN({ state, commit }, sessionInfo) {
    sessionInfo = tools.clone(sessionInfo)
    sessionInfo.password = tools.aesDecode(sessionInfo.password)

    const connect = new Connect(sessionInfo)
    return new Promise((resolve, reject) => {
        connect
            .init()
            .then(() => {
                // 创建会话标签
                commit('CONNECT', { connect, sessionInfo })
                resolve()
            })
            .catch(err => reject(err))
    })
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
