import {
    app,
    ipcMain,
    BrowserWindow,
    nativeTheme,
} from 'electron'


import { autoUpdater } from 'electron-updater'

autoUpdater.on('checking-for-update', () => {
    console.log('-------------------------------------')
    console.log('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    console.log('-------------------------------------')
    console.log('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    console.log('-------------------------------------')
    console.log('Update not available.');
})
autoUpdater.on('error', (err) => {
    console.log('-------------------------------------')
    console.log('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    console.log('-------------------------------------')
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    console.log('-------------------------------------')
    console.log('Update downloaded');
});

try {
    if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
        require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
    }
} catch (_) {}

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
// FIXME: 实测即使在新创建 Quasar Electron 项目中，也会出现时而有效时而无效的情况
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
        // win 设备不开启窗口透明
        // transparent: os.type() !== 'Windows_NT',
        transparent: false,
        webPreferences: {
            // Change from /quasar.conf.js > electron > nodeIntegration;
            // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
            // FIXME: 校验安全度
            nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
            nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

            // More info: /quasar-cli/developing-electron-apps/electron-preload-script
            // preload: path.resolve(__dirname, 'electron-preload.js')
        }
    })

    mainWindow.loadURL(process.env.APP_URL)
        .then(() => {
            autoUpdater.checkForUpdatesAndNotify()
                .then(res => {
                    console.log('------------')
                    console.log(res)
                    console.log('------------')
                })
        })

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

ipcMain.on('dragFile', (event, item) => {
    item = JSON.parse(item)

    event.sender.startDrag({
        file: `${process.cwd()}/README.md`,
        icon: `${process.cwd()}/public/icons/favicon-128x128.png`,
    })

    // if (item.rm) fs.rm(`${process.cwd()}/${item.name}`)
})
