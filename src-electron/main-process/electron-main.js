import {
    app,
    BrowserWindow,
    nativeTheme,
    ipcMain
} from 'electron'

import os from 'os'

// node-pty 只能在主进程内引入
const pty = require('node-pty')
const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL']
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
})

try {
    if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
        require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
    }
} catch (_) {}

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
    global.__statics = __dirname
}

let mainWindow

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        useContentSize: true,
        frame: false,
        transparent: true,
        webPreferences: {
            // Change from /quasar.conf.js > electron > nodeIntegration;
            // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
            nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
            nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

            // More info: /quasar-cli/developing-electron-apps/electron-preload-script
            // preload: path.resolve(__dirname, 'electron-preload.js')
        }
    })

    mainWindow.loadURL(process.env.APP_URL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on('terminal', (event, arg) => {
    ptyProcess.write(arg)
})

ptyProcess.on('data', data => {
    mainWindow.webContents.send('terminal', data);
})