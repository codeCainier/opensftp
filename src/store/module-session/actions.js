import Connect from 'src/core/connect'
import tools   from 'src/utils'

/**
 * 快速连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {Object}    sessionInfo     会话信息
 */
export function QUICK_LOGIN({ state, commit, getters }, sessionInfo) {
    const { host, port, username } = sessionInfo
    const existSession  = getters.sessionInfo({ host, port, username })

    sessionInfo = existSession || sessionInfo

    const connect = new Connect(sessionInfo)

    return new Promise((resolve, reject) => {
        connect
            .init()
            .then(() => {
                // 若会话池不存在会话信息，则保存会话信息
                if (!existSession) {
                    // 保存会话信息
                    commit('CREATE_SESSION', {
                        name: sessionInfo.host,
                        ...sessionInfo,
                    })
                }
                // 使用已存在的会话信息
                sessionInfo = getters.sessionInfo({ host, port, username })
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
