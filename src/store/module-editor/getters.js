import { Platform } from 'quasar'

export function INSTALLED ({ list }) {
    return () => Object.values(list).filter(item => item.isInstalled)
}

export function START_CMD () {
    return editor => {
        if (Platform.is.win) return `"${editor.winFullPath}"`
        if (Platform.is.mac) return `open -a "${editor.name}"`
    }
}
