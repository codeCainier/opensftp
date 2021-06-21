import { ipcRenderer, remote } from 'electron'
import { alert, confirm } from 'src/utils/dialog'
import notify from 'src/utils/notify'
import store from 'src/store'
import config from 'src/config'

class Updater {
    constructor() {
    }

    /**
     * 自动更新
     */
    autoUpdate() {
        ipcRenderer.send('autoUpdate')
    }

    /**
     * 手动检查更新
     */
    checkUpdate() {
        ipcRenderer.send('checkUpdate')
        ipcRenderer.once('update-available', async (event, args) => {
            const data = JSON.parse(args)
            // 若不存在更新，则弹窗提示
            if (!data.cancellationToken) return await alert('当前为最新版本')
            // 若存在更新，通知渲染进程
            if (data.cancellationToken) {
                // FIXME: 确定使用 versionInfo 还是 updateInfo
                const { version } = data.versionInfo
                const { autoUpdate } = store.state.setting
                confirm({
                    message: `新版本的 OpenSFTP 已经发布`,
                    detail: `OpenSFTP v${version} 可供下载，您现在的版本是 v${config.version}，要现在更新吗？`,
                    // 若系统设置中为开启自动更新功能，则在此处提示勾选
                    checkbox: autoUpdate ? '' : '以后自动下载并安装更新',
                })
                    .then(res => {
                        if (res.checkboxChecked) {
                            store.commit('setting/UPDATE', { autoUpdate: true })
                            notify.info('已开启自动更新版本功能')
                        }
                        this.downloadUpdate()
                    })
                    .catch(() => notify.info('在系统设置中可以关闭版本检查'))
            }
        })
    }

    /**
     * 下载更新包
     */
    downloadUpdate() {
        // 下载进度初始化
        this.downloadProgress = 0
        // 更新进度方法
        const updateProgress = (event, progress) => this.downloadProgress = progress
        // 向主进程发送下载更新请求
        ipcRenderer.send('download-update')
        // 监听更新包下载进度
        ipcRenderer.on('updater-download-progress', updateProgress)
        // 监听更新包下载成功
        ipcRenderer.once('updater-download-success', async () => {
            // 取消监听下载进度
            ipcRenderer.removeListener('updater-download-progress', updateProgress)
            // 下载更新成功提示
            confirm({
                message: '更新成功，重启后生效',
                textConfirm: '立即重启',
                textCancel: '稍后重启',
            })
                .then(() => {
                    ipcRenderer.send('quit-and-install')
                })
                .catch(() => {

                })
        })
        // 监听更新包下载失败
        ipcRenderer.once('updater-download-error', async () => {
            // 取消监听下载进度
            ipcRenderer.removeListener('updater-download-progress', updateProgress)
            // 下载更新失败提示
            await alert('更新失败')
        })
    }
}

export default new Updater()
