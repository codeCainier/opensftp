import { ipcRenderer } from 'electron'
import Connect from 'src/core/Connect'
import { remote } from 'electron'

const { BrowserWindow } = remote

class ConnectProcessWindow extends Connect {
    constructor(connectId, winId) {
        super()
        this.id    = connectId
        this.winId = winId
        this.win   = BrowserWindow.fromId(this.winId)
    }

    send(resBody) {
        const resData = {
            head: {
                mid: this.mid,
            },
            body: resBody,
        }
        this.win.webContents.send('res-' + this.id, resData, this.winId)
    }
}

// 监听会话连接请求
ipcRenderer.on('connect-init-req', (event, connectId, winId) => {
    const conn = new ConnectProcessWindow(connectId, winId)
    // 初始化完成
    conn.win.webContents.send('connect-init-res', '', conn.winId)
    // 监听来自请求频道的请求信息
    ipcRenderer.on('req-' + conn.id, async (event, reqData) => {
        const { mid, action } = reqData.head
        const {
            sessionInfo,
            cwd,
            window,
            options,
            remotePath,
            localPath,
            progress,
            pathName,
            pathOld,
            pathNew,
            editorPath,
            callback,
        } = reqData.body
        const resBody = {}

        conn.mid = mid

        try {
            resBody.type = 'success'
            resBody.message = '操作成功'

            if (action === 'auth')              resBody.data = await conn.auth(sessionInfo)
            if (action === 'shell')             resBody.data = await conn.shell(window, options)
            if (action === 'download')          resBody.data = await conn.download(remotePath, localPath, progress)
            if (action === 'upload')            resBody.data = await conn.upload(localPath, remotePath, progress)

            if (action === 'remoteList')        resBody.data = await conn.remoteList(cwd)
            if (action === 'remoteRm')          resBody.data = await conn.remoteRm(pathName)
            if (action === 'remoteMkdir')       resBody.data = await conn.remoteMkdir(pathName)
            if (action === 'remoteRename')      resBody.data = await conn.remoteRename(pathOld, pathNew)
            if (action === 'remoteStat')        resBody.data = await conn.remoteStat(pathName)
            if (action === 'remoteWriteFile')   resBody.data = await conn.remoteWriteFile(pathName)
            if (action === 'remoteEditFile')    resBody.data = await conn.remoteEditFile(remotePath, editorPath, callback)

            if (action === 'localList')         resBody.data = await conn.localList(cwd)
            if (action === 'localRm')           resBody.data = await conn.localRm(pathName)
            if (action === 'localMkdir')        resBody.data = await conn.localMkdir(pathName)
            if (action === 'localRename')       resBody.data = await conn.localRename(pathOld, pathNew)
            if (action === 'localStat')         resBody.data = await conn.localStat(pathName)
            if (action === 'localWriteFile')    resBody.data = await conn.localWriteFile(pathName)

            // if (action === 'exit')              resBody.data = await conn.exit()

        } catch (err) {
            resBody.type = 'error'
            resBody.data = null
            resBody.message = err
        }

        conn.send(resBody)
    })
})

export default () => {}
