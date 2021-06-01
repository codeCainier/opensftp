import { alert } from 'src/utils/dialog'
import { ipcRenderer } from 'electron'
import Connect from 'src/core/Connect'

class ConnectProcessWindow extends Connect {
    constructor(sessionInfo, connectId, winId) {
        super(sessionInfo)
        this.connectId = connectId
        this.winId = winId
    }

    /**
     * 发送响应消息到请求进程
     */
    send(type, data, message) {
        this.win.webContents.send(this.id, {
            type,
            data,
            message,
        }, this.winId)
    }
}

// 监听会话连接请求
ipcRenderer.on('connect-init', (event, props, winId) => {
    const { connectId } = props
    const conn = new ConnectProcessWindow(connectId, winId)

    conn.send('init-success')

    // 监听请求
    ipcRenderer.on(conn.id, (event, props) => {
        const { action, params } = props

        conn[action]()
    })
})

export default () => {}
