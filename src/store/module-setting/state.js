import { LocalStorage, Dark } from 'quasar'
import { remote } from 'electron'

const state = {
    show               : false,
    autoUpdate         : readCache('autoUpdate',         true),
    dark               : readCache('dark',               'auto'),
    aeroEnable         : readCache('aeroEnable',         true),
    sessionPoolOpacity : readCache('sessionPoolOpacity', 85),
    quickLinkOpacity   : readCache('quickLinkOpacity',   65),
    sftpOpacity        : readCache('sftpOpacity',        80),
    sshBackground      : readCache('sshBackground',      '#000000'),
    sshOpacity         : readCache('sshOpacity',         70),
    sshTextColor       : readCache('sshTextColor',       '#FFFFFF'),
}

function readCache(key, defaultValue) {
    const value = LocalStorage.getItem(key)
    return value === null ? defaultValue : value
}

Dark.set(state.dark)

remote.getCurrentWindow().setVibrancy(state.dark ? 'dark' : 'light')

state.dark = Dark.isActive

export default function () {
    return state
}
