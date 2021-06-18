import { LocalStorage, Dark } from 'quasar'
import { remote } from 'electron'

const state = {
    show               : false,
    autoUpdate         : readCache('autoUpdate',         false),        // 自动更新
    checkUpdate        : readCache('checkUpdate',        true),         // 版本检查
    disableUpdate      : readCache('disableUpdate',      false),        // 禁止更新
    dark               : readCache('dark',               'auto'),       // 深色模式
    aeroEnable         : readCache('aeroEnable',         true),         // Aero 毛玻璃效果
    sessionPoolOpacity : readCache('sessionPoolOpacity', 85),           // 会话管理面板透明度
    quickLinkOpacity   : readCache('quickLinkOpacity',   65),           // 快速连接面板透明度
    sftpOpacity        : readCache('sftpOpacity',        80),           // SFTP 面板透明度
    sshBackground      : readCache('sshBackground',      '#000000'),    // SSH 背景颜色
    sshOpacity         : readCache('sshOpacity',         70),           // SSH 面板透明度
    sshTextColor       : readCache('sshTextColor',       '#FFFFFF'),    // SSH 文字颜色
}

/**
 * 读取 LocalStorage 缓存
 * @param   {String}    key             字段名称
 * @param   {String}    defaultValue    默认值
 * @param   {Number}    defaultValue
 * @param   {Boolean}   defaultValue
 * @return  {String}
 * @return  {Number}
 * @return  {Boolean}                   字段在 LocalStorage 中的值
 */
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
