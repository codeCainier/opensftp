import { LocalStorage } from 'quasar'

const state = {
    // 保存的 session 会话 - 会话池（树形结构）
    pool: LocalStorage.getItem('sessionPool') || [],
    // 当前的 session 会话 - 连接 id
    active: '',
    // 正在连接的会话列表
    connectingList: [],
    // 已连接会话列表
    connectedList: [],
}

export default function () {
    return state
}
