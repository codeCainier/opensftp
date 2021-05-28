import { LocalStorage } from 'quasar'

const state = {
    // 保存的 session 会话 - 会话池（树形结构）
    pool: LocalStorage.getItem('sessionPool') || [],
    // 连接的 session 会话 - 连接池
    conn: [],
    // 当前的 session 会话 - 连接 id
    active: '',

    // 已连接会话
    connectedList: [],
}

export default function () {
    return state
}
