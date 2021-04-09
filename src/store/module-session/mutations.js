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
export function CREATE_SESSION(state, props) {
    const sessionInfo = {
        id         : uid(),
        type       : 'session',
        name       : props.name || props.host,
        host       : props.host,
        port       : props.port,
        username   : props.username,
        password   : tools.aesEncode(props.password),
        createTime : Date.now(),
        updateTime : Date.now(),
    }

    state.pool.push(sessionInfo)
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 创建文件夹
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.id        会话信息 ID
 * @param   {String}    props.name      会话名称
 * @param   {String}    props.password  密码
 */
export function CREATE_DIR(state, props) {
    const folderInfo = {
        id         : uid(),
        type       : 'dir',
        name       : props.name,
        createTime : Date.now(),
        updateTime : Date.now(),
        children   : [],
    }

    state.pool.splice(0, 0, folderInfo)
    // state.pool.push(folderInfo)
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

    // 递归更新
    function recursionUpdate(group) {
        for (let index = 0; index < group.length; index += 1) {
            const item = group[index]
            if (item.id === id) {
                Object.keys(updateItem).forEach(key => item[key] = updateItem[key])
                item.updateItem = Date.now()
                return
            }
            if (item.type === 'dir') {
                recursionUpdate(item.children)
            }
        }
    }

    recursionUpdate(state.pool)

    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 删除节点
 * @param   {Object}    state
 * @param   {String}    id      节点 ID
 */
export function DELETE(state, id) {
    // 递归删除
    function recursionDel(group) {
        for (let index = 0; index < group.length; index += 1) {
            const item = group[index]
            if (item.id === id) {
                return group.splice(index, 1)
            }
            if (item.type === 'dir') {
                recursionDel(item.children)
            }
        }
    }
    recursionDel(state.pool)
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

/**
 * 移动会话
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.action    移动行为    move || into
 * @param   {String}    props.target    被移动的元素 ID
 * @param   {String}    props.position  要移动到位置的后一位元素的 ID
 */
export function MOVE(state, props) {
    const { action, target, position } = props
    let moveItem
    // 递归删除
    function recursionDel(group) {
        for (let index = 0; index < group.length; index += 1) {
            const item = group[index]
            if (item.id === target) {
                moveItem = item
                return group.splice(index, 1)
            }
            if (item.type === 'dir') {
                recursionDel(item.children)
            }
        }
    }
    // 递归新增
    function recursionAdd(group) {
        for (let index = 0; index < group.length; index += 1) {
            const item = group[index]
            if (item.id === position && action === 'move') return group.splice(index, 0, moveItem)
            if (item.id === position && action === 'into') return item.children.splice(0, 0, moveItem)
            if (item.type === 'dir') {
                recursionAdd(item.children)
            }
        }
    }

    recursionDel(state.pool)
    recursionAdd(state.pool)
    LocalStorage.set('sessionPool', state.pool)
}
