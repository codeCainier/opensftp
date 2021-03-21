import { ipcMain } from 'electron'
import os from 'os'

/**
 * 该模块暂未使用
 * node-pty 只能在主进程内引入
 */
const pty = require('node-pty')

const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL']

class Terminal {
    constructor(mainWindow) {
        this.mainWindow = mainWindow
    }

    init(processId) {
        this[processId] = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        })

        this[processId].on('data', data => this.mainWindow.webContents.send(processId, data))

        ipcMain.on(processId, (event, arg) => this[processId].write(arg))
    }

    kill(processId) {
        this[processId].kill()
    }
}

export default (mainWindow) => {
    const terminal = new Terminal(mainWindow)

    ipcMain.on('terminal-add', (event, processId) => terminal.init(processId))
    ipcMain.on('terminal-del', (event, processId) => terminal.kill(processId))
}
