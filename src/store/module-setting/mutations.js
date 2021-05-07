import { LocalStorage, Dark } from 'quasar'
import { remote } from 'electron'

// 设置面板开关
export function SETTING_TOGGLE(state, status) {
    state.show = status === undefined ? !state.show : status
}

// 切换深色模式
export function DARK_TOGGLE(state) {
    state.dark = !state.dark
    LocalStorage.set('dark', state.dark)
    Dark.toggle()
    remote.getCurrentWindow().setVibrancy(state.dark ? 'dark' : 'light')
}

// 设置 AERO 毛玻璃效果
export function SET_AERO(state, props) {
    Object.keys(props).forEach(key => {
        state.aero[key] = props[key]
    })
    LocalStorage.set('aero', state.aero)
}
