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
        // FIXME: 移除多余监听
        ipcRenderer.send('checkUpdate')
        ipcRenderer.once('update-not-available', async () => await alert('当前为最新版本'))
        ipcRenderer.once('update-available', async () => await this.createUpdateWin())
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
        // 开发模式开启 DevTools
        // this.win.webContents.openDevTools()
        // 加载 connect 文件
        await this.win.loadURL(this.loadUrlPath)
        // 监听来自主进程更新进度的消息，并转发给更新面板进程
        // TODO: 需要解决可能存在的重复监听、移除监听的问题
        ipcRenderer.on('updater-download-progress', (event, args) => {
            this.win.webContents.send('updater-download-progress', args)
        })
    }
}

export default new Updater()
