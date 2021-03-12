import { uid } from 'quasar'

// 修改本地 pwd
export function CHANGE_PWD_LOCAL(state, pwd) {
    state.pwdLocal = pwd
}

// 修改远程 pwd
export function CHANGE_PWD_REMOTE(state, pwd) {
    state.pwdRemote = pwd
}

// 刷新远程文件系统
export function REFRESH_FS_REMOTE(state) {
    state.refreshListenerRemote = uid()
}

// 刷新本地文件系统
export function REFRESH_FS_LOCAL(state) {
    state.refreshListenerLocal  = uid()
}
