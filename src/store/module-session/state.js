import { LocalStorage } from 'quasar'

const state = {
    // 保存的 session 会话 - 会话池
    pool: LocalStorage.getItem('sessionPool') || [],
    // 开启的 session 会话 - 标签池
    tags: [],
    // 活跃的 session 会话 - 标签 uid
    active: '',
}

state.pool = new Map(state.pool)

export default function () {
    return state
}