import { ipcRenderer } from 'electron'
import { remote } from 'electron'
import Connect  from 'src/core/Connect'

const { BrowserWindow } = remote

class ConnectProcessWindow extends Connect {
    constructor(connectId, winId) {
        super()
        this.id    = connectId
        this.winId = winId
        this.win   = BrowserWindow.fromId(this.winId)

        this.progressMap = new Map()
    }

    async remoteSSHInit(termWindow) {
        await this.initSSH(termWindow)
        await this.sshListener()
    }

    sshListener() {
        // SSH 请求频道名称
        const reqChannelName = `req-ssh-${this.id}`
        // SSH 响应频道名称
        const resChannelName = `res-ssh-${this.id}`
        // 监听 SSH 响应，发送给 Terminal
        this.ssh.on('data', data => {
            this.win.webContents.send(resChannelName, data, this.winId)
        })
        // 监听 Terminal 写入
        ipcRenderer.on(reqChannelName, async (event, data) => {
            this.ssh.write(data)
        })
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
            progressId,
            sessionInfo,
            cwd,
            termWindow,
            remotePath,
            localPath,
            pathName,
            pathOld,
            pathNew,
            editorPath,
            callback,
        } = reqData.body
        // 默认响应数据
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
        // 传输进度
        const transmitProgress = (pathname, saved, total) => {
            conn.progressMap.set(progressId, { pathname, saved, total })
        }

        try {
            resData.body.type = 'success'
            resData.body.message = '操作成功'

            if (action === 'auth')              resData.body.data = await conn.auth(sessionInfo)
            if (action === 'remoteSSHInit')     resData.body.data = await conn.remoteSSHInit(termWindow)
            if (action === 'download')          resData.body.data = await conn.download(remotePath, localPath, transmitProgress)
            if (action === 'upload')            resData.body.data = await conn.upload(localPath, remotePath, transmitProgress)

            if (action === 'progress')          resData.body.data = conn.progressMap.get(progressId)

            if (action === 'remoteList')        resData.body.data = await conn.remoteList(cwd)
            if (action === 'remoteRm')          resData.body.data = await conn.remoteRm(pathName)
            if (action === 'remoteMkdir')       resData.body.data = await conn.remoteMkdir(pathName)
            if (action === 'remoteRename')      resData.body.data = await conn.remoteRename(pathOld, pathNew)
            if (action === 'remoteExist')       resData.body.data = await conn.remoteExist(pathName)
            if (action === 'remoteWriteFile')   resData.body.data = await conn.remoteWriteFile(pathName)
            if (action === 'remoteEditFile')    resData.body.data = await conn.remoteEditFile(remotePath, editorPath, callback)

            if (action === 'localList')         resData.body.data = await conn.localList(cwd)
            if (action === 'localRm')           resData.body.data = await conn.localRm(pathName)
            if (action === 'localMkdir')        resData.body.data = await conn.localMkdir(pathName)
            if (action === 'localRename')       resData.body.data = await conn.localRename(pathOld, pathNew)
            if (action === 'localExist')        resData.body.data = await conn.localExist(pathName)
            if (action === 'localWriteFile')    resData.body.data = await conn.localWriteFile(pathName)

            // TODO: 目前关闭会话方案为直接关闭会话线程，有无可能存在的问题需进行一步发现
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
