import electron from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

const { ipcMain, app } = electron

// 开发模式下
if (process.env.NODE_ENV === 'development') {
    app.getVersion = () => require('../../package.json').version
}

log.transports.file.level = 'debug'

// 使用 electron-log 作为日志工具
autoUpdater.logger = log
// 禁止自动下载
autoUpdater.autoDownload = false
// 开启退出 App 后自动安装更新
autoUpdater.autoInstallOnAppQuit = true
// 禁止下载安装未发行的更新
autoUpdater.allowPrerelease = false
// 关闭完整日志
autoUpdater.fullChangelog = false
// 禁止降级
autoUpdater.allowDowngrade = false

let UpdateCheckResult

export default () => {
    // 监听来自渲染进程的自动更新请求
    // 询问服务器是否有更新，下载并通知是否有更新
    ipcMain.on('autoUpdate', () => {
        // 开启自动下载
        autoUpdater.autoDownload = true
        // 检查版本
        autoUpdater.checkForUpdatesAndNotify().then()
    })

    // 监听来自渲染进程的手动检查更新请求
    // 询问服务器是否有更新
    ipcMain.on('checkUpdate', event => {
        // 禁止自动下载
        autoUpdater.autoDownload = false
        // 检查版本
        autoUpdater.checkForUpdates()
            .then(data => {
                UpdateCheckResult = data
                event.reply('update-available', JSON.stringify(data))
            })
    })

    // 监听来自渲染进程的下载更新请求
    // 从向服务器下载更新
    ipcMain.on('download-update', event => {
        // autoUpdater.downloadUpdate(UpdateCheckResult.cancellationToken)
        autoUpdater.downloadUpdate()
            .then(() => event.reply('updater-download-success'))
            .catch(err => event.reply('updater-download-error'))
    })

    // 监听来自渲染进程的安装更新请求
    // 重启并安装更新
    ipcMain.on('quit-and-install', event => {
        autoUpdater.quitAndInstall(true, true)
    })

    autoUpdater.on('download-progress', progressObj => {
        let log_message = "Download speed: " + progressObj.bytesPerSecond;
        log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
        log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
        log.info(log_message);
        log.info(progressObj)
    })
}
