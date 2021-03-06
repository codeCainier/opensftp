import { LocalStorage, uid }    from 'quasar'
import tools                    from 'src/utils'

/**
 * 创建会话
 * @param   {String}    props.id            节点 ID
 * @param   {String}    props.name          节点名称
 * @param   {String}    props.icon          节点图标
 * @param   {String}    props.host          地址
 * @param   {String}    props.port          端口
 * @param   {String}    props.username      账号
 * @param   {String}    props.password      密码
 * @param   {String}    props.privateKey    SSH Key
 * @param   {String}    props.authMode      默认的认证方式 password || sshKey
 * @param   {String}    props.localPath     默认的 Local 目录
 * @param   {String}    props.remotePath    默认的 Remote 目录
 */
export function CREATE_SESSION(state, props) {
    const nodeInfo = {
        id         : props.id,                                  // 节点 ID
        type       : 'session',                                 // 节点类型 session || dir
        name       : props.name,                                // 节点名称
        icon       : props.icon,                                // 节点图标
        detail     : {
            host       : props.host,                            // 地址
            port       : props.port,                            // 端口
            username   : props.username,                        // 账号
            password   : tools.aesEncode(props.password),       // 密码
            privateKey : props.privateKey,                      // SSH Key
            authMode   : props.authMode,                        // 默认的认证方式  password || sshKey
            localPath  : props.localPath,                       // 默认的 Local 目录
            remotePath : props.remotePath,                      // 默认的 Remote 目录
        },
        createTime : Date.now(),                                // 创建时间
        updateTime : Date.now(),                                // 更新时间
    }

    state.pool.splice(0, 0, nodeInfo)
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 快速创建会话
 * @param   {String}    props.sessionItem   会话项目
 */
export function CREATE_SESSION_QUICK(state, sessionItem) {
    state.pool.splice(0, 0, sessionItem)
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 创建文件夹
 * @param   {String}    props.id        节点 ID
 * @param   {String}    props.name      节点名称
 */
export function CREATE_DIR(state, props) {
    const folderInfo = {
        id         : props.id || uid(),
        type       : 'dir',
        name       : props.name,
        icon       : 'statics/icons/server-icons/folder.svg',
        children   : [],
        createTime : Date.now(),
        updateTime : Date.now(),
    }

    state.pool.splice(0, 0, folderInfo)
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 更新会话
 * @param   {String}    props.id                    会话信息 ID
 * @param   {Object}    props.updateItem            更新项目
 */
export function UPDATE(state, props) {
    const { id, updateItem } = props

    // 递归更新
    function recursionUpdate(group) {
        for (let index = 0; index < group.length; index += 1) {
            const item = group[index]
            if (item.id === id) {
                Object.keys(updateItem).forEach(key => {
                    if (key === 'name')         item.name               = updateItem.name
                    if (key === 'icon')         item.icon               = updateItem.icon
                    if (key === 'host')         item.detail.host        = updateItem.host
                    if (key === 'port')         item.detail.port        = updateItem.port
                    if (key === 'username')     item.detail.username    = updateItem.username
                    if (key === 'password')     item.detail.password    = tools.aesEncode(updateItem.password)
                    if (key === 'privateKey')   item.detail.privateKey  = updateItem.privateKey
                    if (key === 'authMode')     item.detail.authMode    = updateItem.authMode
                    if (key === 'remotePath')   item.detail.remotePath  = updateItem.remotePath
                    if (key === 'localPath')    item.detail.localPath   = updateItem.localPath
                })
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
 * 更换当前会话
 * @param   {String}    id      会话连接 ID
 */
export function SET_ACTIVE(state, id) {
    state.active = id
}

/**
 * 移动会话
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

/**
 * 新增正在连接中的会话
 */
export function CONNECTING_ADD(state, conn) {
    state.connectingList.push(conn)
}

/**
 * 移除正在连接中的会话
 *   1. 连接成功
 *   2. 连接失败
 *   3. 取消连接
 */
export function CONNECTING_DEL(state, sessionId) {
    const index = state.connectingList.findIndex(conn => conn.sessionId === sessionId)
    state.connectingList.splice(index, 1)
}

/**
 * 新增已连接的会话
 */
export function CONNECTED_ADD(state, conn) {
    state.connectedList.push(conn)
}

/**
 * 移除已连接的会话
 */
export function CONNECTED_DEL(state, connectId) {
    const index = state.connectedList.findIndex(conn => conn.id === connectId)
    state.connectedList.splice(index, 1)
}

/**
 * 移除已连接的所有会话
 */
export function CONNECTED_DEL_ALL(state) {
    state.connectedList = []
}
