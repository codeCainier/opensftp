import { ipcMain } from 'electron'
import os from 'os'

// node-pty 只能在主进程内引入
const pty = require('node-pty')

const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL']

class Terminal {
    constructor(mainWindow) {
        this.mainWindow = mainWindow
        this.pool = new Map()
    }

    init(uid) {
        const ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.cwd(),
            env: process.env
        })
        
        ptyProcess.on('data', data => mainWindow.webContents.send('terminal', data))
        ipcMain.on('terminal', (event, arg) => ptyProcess.write(arg))

        this.pool.set(uid, ptyProcess)
    }

    kill(uid) {
        this.pool.get(uid).kill()
    }
}

export default (mainWindow) => {
    const terminal = new Terminal(mainWindow)

    ipcMain.on('terminalInit', (event, arg) => terminal.init(arg))
    ipcMain.on('terminalKill', (event, arg) => terminal.kill(arg))
}