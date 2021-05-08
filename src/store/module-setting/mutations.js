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

export function UPDATE(state, props) {
    Object.keys(props).forEach(key => {
        state[key] = props[key]
        LocalStorage.set(key, state[key])
    })
}

