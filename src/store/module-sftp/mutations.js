import { uid } from 'quasar'

// 刷新本地文件系统
export function CLOSE_TERM(state) {
    state.closeTermListener  = uid()
}
