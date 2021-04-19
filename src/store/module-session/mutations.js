import { LocalStorage, uid } from 'quasar'
import tools from 'src/utils'
import electron from 'electron'
import path from "path";

/**
 * 创建会话
 * @param   {Object}    state
 * @param   {Object}    props
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
    const homePath = path.join(electron.remote.app.getPath('home'))
    const iconPath = 'icons/server-icons/default.svg'
    const nodeInfo = {
        id         : props.id || uid(),                         // 节点 ID
        type       : 'session',                                 // 节点类型 session || dir
        name       : props.name,                                // 节点名称
        icon       : props.icon || iconPath,                    // 节点图标
        detail     : {
            host       : props.host,                            // 地址
            port       : props.port,                            // 端口
            username   : props.username,                        // 账号
            password   : tools.aesEncode(props.password) || '', // 密码
            privateKey : props.privateKey || '',                // SSH Key
            authMode   : props.authMode   || 'password',        // 默认的认证方式  password || sshKey
            localPath  : props.localPath  || homePath,          // 默认的 Local 目录
            remotePath : props.remotePath || '/',               // 默认的 Remote 目录
        },
        createTime : Date.now(),                                // 创建时间
        updateTime : Date.now(),                                // 更新时间
    }

    state.pool.splice(0, 0, nodeInfo)
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 创建文件夹
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.id        节点 ID
 * @param   {String}    props.name      节点名称
 */
export function CREATE_DIR(state, props) {
    const folderInfo = {
        id         : props.id || uid(),
        type       : 'dir',
        name       : props.name,
        icon       : 'icons/server-icons/folder.svg',
        children   : [],
        createTime : Date.now(),
        updateTime : Date.now(),
    }

    state.pool.splice(0, 0, folderInfo)
    LocalStorage.set('sessionPool', state.pool)
}

/**
 * 更新会话
 * @param   {Object}    state
 * @param   {Object}    props
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
