import { LocalStorage, Dialog, uid } from 'quasar'
import tools from 'src/utils'

// 会话池 新增会话
export function SESSION_ADD(state, obj) {
    const { host, port, username, password, callback } = obj
    // 使用 Base64 加密生成 Session Key
    const sessionKey = tools.base64En(`${username}@${host}:${port}`)
    // 判断会话是否已存在
    const session = state.pool.get(sessionKey)
    // 已存在则更新会话
    if (session) return setData()
    // 不存在则弹窗提示输入会话名称
    Dialog.create({
        message: '这是一个新的会话，请创建会话名称',
        prompt: {
            model: host,
            type: 'text',
        },
        persistent: true
    }).onOk(name => setData(name))
    
    function setData(name) {
        state.pool.set(sessionKey, {
            name: session ? session.name : name,
            host,
            port,
            username,
            password,
            addTime: session ? session.addTime : Date.now(),
        })
        // 写入 LocalStorage
        LocalStorage.set('sessionPool', [...state.pool])
        // 若存在回调函数则执行回调
        if (callback) callback(sessionKey)   
    }
}

// 会话池 更新会话
export function SESSION_UPDATE(state, obj) {
    // 解构获取 sessionKey 与要更新的项目
    const { sessionKey, updateItem } = obj
    // 读取 session 信息
    const sessionInfo = state.pool.get(sessionKey)
    // 更新 session 信息
    Object.keys(updateItem).forEach(key => sessionInfo[key] = updateItem[key])
    state.pool.set(sessionKey, sessionInfo)
    LocalStorage.set('sessionPool', [...state.pool])
}

// 会话池 删除会话
export function SESSION_DEL(state, sessionKey) {
    state.pool.delete(sessionKey)
    LocalStorage.set('sessionPool', [...state.pool])
}

// 标签池 新增会话
export function TAGS_ADD(state, sessionKey) {
    const id = uid()
    const sessionInfo = state.pool.get(sessionKey)
    state.tags.push({
        id,
        sessionInfo,
    })
    SET_ACTIVE(state, id)
}

// 标签池 删除会话
export function TAGS_DEL(state, id) {
    for (let i = 0; i < state.tags.length; i += 1 ) {
        if (state.tags[i].id === id) {
            state.tags.splice(i, 1)
            break
        }
    }
    SET_ACTIVE(state, state[0].id)
}

// 更换当前会话
export function SET_ACTIVE(state, id) {
    state.active = id
}