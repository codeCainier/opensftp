import { uid } from 'quasar'
import Connect from 'src/core/connect'

/**
 * 登录连接
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {String}    id              会话信息 ID
 */
export function LOGIN({ state, commit }, id) {
    const sessionConnId = uid()
    const sessionInfo   = state.pool.find(item => item.id === id)
    const connect       = new Connect(sessionInfo)

    return new Promise((resolve, reject) => {
        connect
            .init()
            .then(() => {
                commit('CONNECT', {
                    id: sessionConnId,
                    connect,
                    sessionInfo,
                })
                commit('SET_ACTIVE', sessionConnId)
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
