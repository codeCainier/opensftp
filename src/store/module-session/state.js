import { LocalStorage } from 'quasar'

const state = {
    // 保存的 session 会话 - 会话池
    pool: LocalStorage.getItem('sessionPool') || [],
    // 连接的 session 会话 - 连接池
    conn: [],
    // 当前的 session 会话 - 连接 id
    active: '',
}

export default function () {
    return state
}
