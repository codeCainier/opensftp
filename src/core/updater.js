import electron from 'electron'
import { alert, confirm } from 'src/utils/dialog'
import notify from 'src/utils/notify'
import store from 'src/store'
import config from 'src/config'
import path from "path";

const { ipcRenderer, remote } = electron
const { BrowserWindow } = remote

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
        // if (data.cancellationToken) {
        //     // FIXME: 确定使用 versionInfo 还是 updateInfo
        //     const { version } = data.versionInfo
        //     const { autoUpdate } = store.state.setting
        //     await this.createUpdateWin()
        //     // confirm({
        //     //     message: `新版本的 OpenSFTP 已经发布`,
        //     //     detail: `OpenSFTP v${version} 可供下载，您现在的版本是 v${config.version}，要现在更新吗？`,
        //     //     // 若系统设置中为开启自动更新功能，则在此处提示勾选
        //     //     checkbox: autoUpdate ? '' : '以后自动下载并安装更新',
        //     // })
        //     //     .then(res => {
        //     //         if (res.checkboxChecked) {
        //     //             store.commit('setting/UPDATE', { autoUpdate: true })
        //     //             notify.info('已开启自动更新版本功能')
        //     //         }
        //     //         this.downloadUpdate()
        //     //     })
        //     //     .catch(() => notify.info('在系统设置中可以关闭版本检查'))
        // }
        // FIXME: 移除多余监听
        ipcRenderer.send('checkUpdate')
        ipcRenderer.once('update-not-available', async () => await alert('当前为最新版本'))
        ipcRenderer.once('update-available', async () => await this.createUpdateWin())
    }

    /**
     * 下载更新包
     */
    downloadUpdate() {
        // 下载进度初始化
        this.downloadProgress = null
        // 更新进度方法
        const updateProgress = (event, progressObj) => {
            this.downloadProgress = JSON.parse(progressObj)
            console.log(this.downloadProgress)
        }
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
                .then(() => ipcRenderer.send('quit-and-install'))
        })
        // 监听更新包下载失败
        ipcRenderer.once('updater-download-error', async () => {
            // 取消监听下载进度
            ipcRenderer.removeListener('updater-download-progress', updateProgress)
            // 下载更新失败提示
            await alert('更新失败')
        })
    }

    /**
     * 创建更新窗口
     */
    async createUpdateWin() {
        this.winId = electron.remote.BrowserWindow.getFocusedWindow().id
        this.win = new electron.remote.BrowserWindow({
            show   : true,
            // TODO: parent 参数必要性需讨论
            parent : this.winId,
            width  : 600,
            height : 400,
            title  : '软件更新',
            webPreferences: {
                // FIXME: 校验安全度
                nodeIntegration: true,
            },
        })
        // connect html 路径
        this.loadUrlPath = process.env.NODE_ENV === 'development'
            ? path.join(location.origin, 'update.html')
            : location.origin + path.join(path.dirname(location.pathname), 'update.html')
        // TODO: 开发模式开启 DevTools
        this.win.webContents.openDevTools()
        // 加载 connect 文件
        await this.win.loadURL(this.loadUrlPath)
    }
}

export default new Updater()
