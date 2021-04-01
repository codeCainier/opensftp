import { LocalStorage, uid } from 'quasar'
import tools from 'src/utils'

/**
 * 创建会话
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.id        会话信息 ID
 * @param   {String}    props.name      会话名称
 * @param   {String}    props.host      IP / 域名
 * @param   {String}    props.port      端口
 * @param   {String}    props.username  账号
 * @param   {String}    props.password  密码
 */
export function CREATE(state, props) {
    const sessionInfo = {
        id         : uid(),
        name       : props.name || props.host,
        host       : props.host,
        port       : props.port,
        username   : props.username,
        password   : tools.aesEncode(props.password),
        createTIme : Date.now(),
        updateTIme : Date.now(),
    }

    state.pool.push(sessionInfo)
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 更新会话
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.id                    会话信息 ID
 * @param   {String}    props.updateItem.host       IP / 域名
 * @param   {String}    props.updateItem.port       端口
 * @param   {String}    props.updateItem.username   账号
 * @param   {String}    props.updateItem.password   密码
 */
export function UPDATE(state, props) {
    const { id, updateItem } = props

    if (updateItem.password) updateItem.password = tools.aesEncode(updateItem.password)

    state.pool.find(item => {
        if (item.id === id) {
            Object.keys(updateItem).forEach(key => item[key] = updateItem[key])
            item.updateItem = Date.now()
        }
    })
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 删除会话
 * @param   {Object}    state
 * @param   {String}    id      会话信息 ID
 */
export function DELETE(state, id) {
    state.pool.forEach((item, index) => {
        if (item.id === id) state.pool.splice(index, 1)
    })
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 连接会话
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {Object}    props.connect       会话连接对象
 * @param   {Object}    props.sessionInfo   会话信息
 */
export function CONNECT(state, props) {
    const id = uid()
    state.conn.push({
        id,
        connect     : props.connect,
        sessionInfo : props.sessionInfo,
    })
    // 设置会话标签为活跃状态
    state.active = id
}

/**
 * 终止会话
 * @param   {Object}    state
 * @param   {String}    id      会话连接 ID
 */
export function END(state, id) {
    state.conn.forEach((item, index) => {
        if (item.id === id) {
            item.connect.sftp.end()
            item.connect.ssh.end()
            item.connect.conn.end()
            state.conn.splice(index, 1)
        }
    })
}

/**
 * 更换当前会话
 * @param   {Object}    state
 * @param   {String}    id      会话连接 ID
 */
export function SET_ACTIVE(state, id) {
    state.active = id
}
