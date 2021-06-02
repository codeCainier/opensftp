import path     from 'path'
import fs       from 'fs'
import { exec } from'child_process'
import { uid, debounce } from 'quasar'
import tools    from 'src/utils'

const { Client } = require('ssh2')

class Connect {
    constructor() {
    }

    async auth(sessionInfo) {
        this.sessionInfo = tools.clone(sessionInfo)
        await this.initConn()
        await this.initSFTP()
    }

    exit() {
        this.ssh.end()
        this.conn.end()
    }

    initConn() {
        const { host, port, username, authMode } = this.sessionInfo
        const password   = authMode === 'password' ? tools.aesDecode(this.sessionInfo.password)   : ''
        const privateKey = authMode === 'sshKey'   ? fs.readFileSync(this.sessionInfo.privateKey) : ''

        return new Promise((resolve, reject) => {
            const conn = new Client()
            conn
                .on('ready', () => {
                    this.conn = conn
                    resolve(conn)
                })
                .on('error', err => reject(err))
                .connect({
                    host,
                    port,
                    username,
                    password,
                    privateKey,
                })
        })
    }

    initSFTP() {
        return new Promise((resolve, reject) => {
            this.conn.sftp((err, sftp) => {
                if (err) return reject(err)
                this.sftp = sftp
                resolve(sftp)
            })
        })
    }

    shell(window, options) {
        return new Promise((resolve, reject) => {
            this.conn.shell(window, options, (err, stream) => {
                if (err) return reject(err)
                this.ssh = stream
                resolve(stream)
            })
        })
    }

    /**
     * SFTP 下载
     * @param   {String}    remotePath      远程路径
     * @param   {String}    localPath       本地路径
     * @param   {Function}  progress        完成 size
     */
    async download(remotePath, localPath, progress = () => {}) {
        const stats = await this.remoteStat(remotePath)
        const idDir = stats.isDirectory()

        if (!idDir) return this.downloadFile(remotePath, localPath, progress)
        if (idDir)  return this.downloadDir(remotePath, localPath, progress)
    }

    async downloadFile(remotePath, localPath, progress) {
        const options = {
            step: (saved, chunk, total) => {
                progress(remotePath, saved, total)
            },
        }
        return new Promise((resolve, reject) => {
            this.sftp.fastGet(remotePath, localPath, options, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    async downloadDir(remotePath, localPath, progress) {
        const fileList = await this.remoteList(remotePath)

        await this.localMkdir(localPath)

        for (const file of fileList) {

            if (file.type === 'd') {
                let newSrc = path.join(remotePath, file.name)
                let newDst = path.join(localPath, file.name)
                await this.downloadDir(newSrc, newDst, progress)
            }

            if (file.type === '-') {
                let src = path.join(remotePath, file.name)
                let dst = path.join(localPath, file.name)
                await this.downloadFile(src, dst, progress)
            }
        }
    }

    async upload(localPath, remotePath, progress = () => {}) {
        const stats = await this.localStat(localPath)
        const idDir = stats.isDirectory()

        if (!idDir) return this.uploadFile(localPath, remotePath, progress)
        if (idDir)  return this.uploadDir(localPath, remotePath, progress)
    }

    async uploadFile(localPath, remotePath, progress) {
        const options = {
            step: (saved, chunk, total) => {
                progress(localPath, saved, total)
            },
        }
        return new Promise((resolve, reject) => {
            this.sftp.fastPut(localPath, remotePath, options, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    async uploadDir(localPath, remotePath, progress) {
        const fileList = await this.localList(localPath)

        await this.remoteMkdir(remotePath)

        for (const file of fileList) {

            if (file.type === 'd') {
                let newSrc = path.join(localPath, file.name)
                let newDst = path.join(remotePath, file.name)
                await this.uploadDir(newSrc, newDst, progress)
            }

            if (file.type === '-') {
                let src = path.join(localPath, file.name)
                let dst = path.join(remotePath, file.name)
                await this.uploadFile(src, dst, progress)
            }
        }
    }

    /**
     * 远程 列出目录下文件
     * @method
     * @param   {String}    cwd     远程目录地址
     */
    remoteList(cwd) {
        return new Promise((resolve, reject) => {
            this.sftp.readdir(cwd, (err, list) => {
                if (err) return reject(err)
                resolve(this.listFormatRemote(cwd, list))
            })
        })
    }

    /**
     * 远程 删除
     * @method
     * @param   {String}    pathName     要删除的文件地址
     */
    remoteRm(pathName) {
        return new Promise((resolve, reject) => {
            const cmd = `rm -rf "${pathName}"`
            this.conn.exec(cmd, (err, stream) => {
                if (err) return reject(err)
                stream
                    .on('data', data => {})
                    .on('end', () => resolve())
                    .stderr.on('data', err => reject(err))
            })
        })
    }

    /**
     * 远程 创建目录
     * @method
     * @param   {String}    pathName     要创建的目录地址
     */
    async remoteMkdir(pathName) {
        return new Promise((resolve, reject) => {
            // 若目录已存在，则跳过创建
            this.remoteStat(pathName)
                .then(() => resolve())
                .catch(() => this.sftp.mkdir(pathName, err => {
                    if (err) reject(err)
                    resolve()
                }))
        })
    }

    /**
     * 远程 重命名
     * @method
     * @param   {String}    pathOld      重命名前的文件地址
     * @param   {String}    pathNew      重命名后的文件地址
     */
    remoteRename(pathOld, pathNew) {
        return new Promise((resolve, reject) => {
            this.sftp.rename(pathOld, pathNew, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    /**
     * 远程 文件状态
     * @method
     * @param   {String}    pathName     要查询状态的文件地址
     */
    remoteStat(pathName) {
        return new Promise((resolve, reject) => {
            this.sftp.stat(pathName, (err, stats) => {
                if (err) return reject(err)
                resolve(stats)
            })
        })
    }

    /**
     * 远程 创建文件
     * @method
     * @param   {String}    pathName     要创建的文件地址
     */
    remoteWriteFile(pathName) {
        return new Promise((resolve, reject) => {
            this.sftp.writeFile(pathName, '', 'utf-8', err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    localList(cwd) {
        return new Promise((resolve, reject) => {
            fs.readdir(cwd, (err, list) => {
                if (err) return reject(err)
                resolve(this.listFormatLocal(cwd, list))
            })
        })
    }

    localRm(pathName) {
        return new Promise((resolve, reject) => {
            fs.rmdir(pathName, { recursive: true }, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    localMkdir(pathName) {
        return new Promise((resolve, reject) => {
            fs.mkdir(pathName, { recursive: true }, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    localRename(pathOld, pathNew) {
        return new Promise((resolve, reject) => {
            fs.rename(pathOld, pathNew, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    localStat(pathName) {
        return new Promise((resolve, reject) => {
            fs.stat(pathName, (err, stats) => {
                if (err) return reject(err)
                resolve(stats)
            })
        })
    }

    localWriteFile(pathName) {
        return new Promise((resolve, reject) => {
            fs.writeFile(pathName, '', 'utf-8', err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    listFormatRemote(cwd, list) {
        const arr = []
        list.forEach(item => {
            const { size, atime } = item.attrs
            const longNameArr = item.longname.split(' ').filter(tempItem => tempItem)
            const [ permission, fileNum, owner, group ] = longNameArr
            arr.push({
                // 文件名称
                name: item.filename,
                // 文件类型
                type: permission.substring(0, 1),
                // 创建日期
                date: atime,
                // 文件数量 包含 . 与 ..
                fileNum,
                // 所有者
                owner,
                // 所在群组
                group,
                // 文件大小
                size,
            })
        })
        return arr
    }

    listFormatLocal(cwd, fileList) {
        const list = []

        for (const filename of fileList) {
            // FIXME: stat / lstat / fstat
            try {
                const stats = fs.lstatSync(path.join(cwd, filename))
                let type = ''

                if (stats.isFile())            type = '-'
                if (stats.isDirectory())       type = 'd'
                if (stats.isSymbolicLink())    type = 'l'
                if (stats.isFIFO())            type = 'p'
                if (stats.isBlockDevice())     type = 'b'
                if (stats.isCharacterDevice()) type = 'c'
                if (stats.isSocket())          type = 's'

                list.push({
                    name: filename,
                    type,
                    date: stats.mtime.getTime(),
                    fileNum: stats.nlink,
                    owner: stats.uid,
                    group: stats.gid,
                    size: stats.size,
                })
            } catch (e) {
                list.push({
                    name: filename,
                    // FIXME: temp
                    type: '-',
                    // FIXME: temp
                    date: '-',
                    // FIXME: temp
                    fileNum: 0,
                    // FIXME: temp
                    owner: '-',
                    // FIXME: temp
                    group: '-',
                    // FIXME: temp
                    size: 0,
                })
            }
        }

        return list
    }

    async remoteEditFile(remotePath, editorPath, callback = () => {}) {
        const filename  = path.basename(remotePath)
        const cacheDir  = path.join(__statics, '../cache', uid())
        const localPath = path.join(cacheDir, filename)
        const cmd       = `${editorPath.replace(/ /g, '\\ ')} ${localPath}`
        await this.localMkdir(cacheDir)
        await this.download(remotePath, localPath)
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) return reject(error)
                const watcher = fs.watch(localPath)
                const changeCallback = async (eventType, filename) => {
                    await this.upload(localPath, remotePath)
                    callback()
                }
                // 1000ms 防抖
                watcher.on('change', debounce(changeCallback, 1000))
            })
        })
    }
}

export default Connect
