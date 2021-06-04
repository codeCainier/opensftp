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

    send(resData) {
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
        const resData = {
            head: { mid },
            body: {
                // 默认为 error 状态
                type: 'error',
                // 默认没有响应 data
                data: null,
                // 默认状态消息
                message: '响应未处理',
            },
        }

        try {
            resData.body.type = 'success'
            resData.body.message = '操作成功'

            if (action === 'auth')              resData.body.data = await conn.auth(sessionInfo)
            if (action === 'shell')             resData.body.data = await conn.shell(window, options)
            if (action === 'download')          resData.body.data = await conn.download(remotePath, localPath, progress)
            if (action === 'upload')            resData.body.data = await conn.upload(localPath, remotePath, progress)

            if (action === 'remoteList')        resData.body.data = await conn.remoteList(cwd)
            if (action === 'remoteRm')          resData.body.data = await conn.remoteRm(pathName)
            if (action === 'remoteMkdir')       resData.body.data = await conn.remoteMkdir(pathName)
            if (action === 'remoteRename')      resData.body.data = await conn.remoteRename(pathOld, pathNew)
            if (action === 'remoteStat')        resData.body.data = await conn.remoteStat(pathName)
            if (action === 'remoteWriteFile')   resData.body.data = await conn.remoteWriteFile(pathName)
            if (action === 'remoteEditFile')    resData.body.data = await conn.remoteEditFile(remotePath, editorPath, callback)

            if (action === 'localList')         resData.body.data = await conn.localList(cwd)
            if (action === 'localRm')           resData.body.data = await conn.localRm(pathName)
            if (action === 'localMkdir')        resData.body.data = await conn.localMkdir(pathName)
            if (action === 'localRename')       resData.body.data = await conn.localRename(pathOld, pathNew)
            if (action === 'localStat')         resData.body.data = await conn.localStat(pathName)
            if (action === 'localWriteFile')    resData.body.data = await conn.localWriteFile(pathName)

            // if (action === 'exit')              resData.body.data = await conn.exit()

        } catch (err) {
            resData.body.type = 'error'
            resData.body.data = null
            resData.body.message = err
        }

        conn.send(resData)
    })
})

export default () => {}
