import { ipcRenderer, remote } from 'electron'
import { alert, confirm } from 'src/utils/dialog'

class Updater {
    constructor(setting) {
        this.downloadProgress = 0
        this.enableAutoUpdate = true
    }

    /**
     * 自动更新
     */
    autoUpdate() {
        if (this.enableAutoUpdate) ipcRenderer.send('autoUpdate')
    }

    /**
     * 手动检查更新
     */
    checkUpdate() {
        ipcRenderer.send('checkUpdate')
        ipcRenderer.once('update-available', (event, args) => {
            const data = JSON.parse(args)
            const { version } = data.UpdateInfo
            confirm({
                message: `发现版本 v${version}，是否进行更新？`,
                checkbox: '开启自动更新'
            })
                .then(async () => await this.downloadUpdate(data))
                .catch(async () => await alert('在系统设置中可以关闭版本检查'))
        })
    }

    /**
     * 下载更新包
     */
    downloadUpdate(data) {
        return new Promise((resolve, reject) => {
            // 向主进程发送下载更新请求
            ipcRenderer.send('download-update', JSON.stringify(data))
            // 监听更新包下载进度
            ipcRenderer.on('updater-download-progress', (event, progress) => this.downloadProgress = progress)
            // 监听更新包下载成功
            ipcRenderer.once('updater-download-success', () => resolve())
            // 监听更新包下载失败
            ipcRenderer.once('updater-download-error', () => reject())
            // TODO: 不论下载成功还是失败，结束后取消监听
        })
    }
}

export default Updater
