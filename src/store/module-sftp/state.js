import electron  from 'electron'

const state = {
    // 本地 pwd
    pwdLocal: electron.remote.app.getPath('home'),
    // 远程 pwd
    pwdRemote: '/',
    // 远程 文件系统刷新监听器
    refreshListenerRemote: '',
    // 本地 文件系统刷新监听器
    refreshListenerLocal: '',
}

export default function () {
    return state
}
