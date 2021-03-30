import { Platform, LocalStorage } from 'quasar'
import electron from 'electron'
import path from 'path'
import fs from 'fs'

const home = electron.remote.app.getPath('home')

const state = LocalStorage.getItem('editorList') || {
    vscode: {
        // 编辑器存放目录 (默认地址)
        dirPath: {
            win: path.join(home, 'AppData/Local/Programs/Microsoft VS Code'),
            mac: '/Applications/Visual Studio Code.app',
            linux: '',
        },
        // 编辑器 bin 目录 (固定地址)
        binPath: {
            win: 'bin/code',
            mac: 'Contents/Resources/app/bin/code',
            linux: '',
        },
    },
    webstorm: {
        // 编辑器存放目录 (默认地址)
        dirPath: {
            win: '',
            mac: '/Applications/WebStorm.app',
            linux: '',
        },
        // 编辑器 bin 目录 (固定地址)
        binPath: {
            win: 'bin/webstorm64.exe',
            mac: 'Contents/MacOS/webstorm',
            linux: '',
        },
    }
}

let system = ''

if (Platform.is.win)   system = 'win'
if (Platform.is.mac)   system = 'mac'
if (Platform.is.linux) system = 'linux'

Object.keys(state).forEach((editorName) => {
    const { dirPath, binPath } = state[editorName]

    state[editorName].path = path.join(dirPath[system], binPath[system])

    try {
        fs.statSync(state[editorName].path)
    } catch (e) {
        console.log(e)
        state[editorName].path = null
    }
})

export default function () {
    return state
}
