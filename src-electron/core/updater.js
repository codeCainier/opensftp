import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { alert, confirm } from 'src/utils/dialog'
import log from 'electron-log'

log.transports.file.level = 'debug'

autoUpdater.logger = log

export default () => {
    // 监听来自渲染进程的自动更新请求
    // 询问服务器是否有更新，下载并通知是否有更新
    ipcMain.on('autoUpdate', () => autoUpdater.checkForUpdatesAndNotify().then())

    // 监听来自渲染进程的手动检查更新请求
    // 询问服务器是否有更新
    ipcMain.on('checkUpdate', event => {
        autoUpdater.checkForUpdates()
            .then(data => {
                // 若不存在更新，则弹窗提示
                if (!data.downloadPromise) return alert('当前版本为最新版本')
                // 若存在更新，通知渲染进程
                if (data.downloadPromise)  return event.reply('update-available', JSON.stringify(data))
            })
    })

    // 监听来自渲染进程的下载更新请求
    // 从向服务器下载更新
    ipcMain.on('download-update', (event, args) => {
        const data = JSON.parse(args)
        autoUpdater.downloadUpdate(data.cancellationToken)
            .then((a, b) => {
                console.log('download-update-success')
                console.log(a)
                console.log(b)
                event.reply('updater-download-success')
            })
            .catch(err => event.reply('updater-download-error'))
    })

    autoUpdater.on('download-progress', progressObj => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        log.info(log_message);
        console.log(progressObj)
    })
}
