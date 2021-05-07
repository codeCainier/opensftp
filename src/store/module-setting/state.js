import { LocalStorage, Dark } from 'quasar'
import { remote } from 'electron'

const state = {
    show       : false,
    autoUpdate : true,
    dark       : 'auto',
    aero : {
        enable: true,
        sessionPool: 85,
        quickLink: 65,
        sftp: 80,
        ssh: 90,
    },
    ssh: {
        background: 'rgba(0, 0, 0, .7)',
    }
}

Object.keys(state).forEach(key => state[key] = LocalStorage.getItem(key) === null ? state[key] : LocalStorage.getItem(key))

Dark.set(state.dark)
remote.getCurrentWindow().setVibrancy(state.dark ? 'dark' : 'light')
state.dark = Dark.isActive

export default function () {
    return state
}
