const { Client } = require('ssh2')
const { join }   = require('path')
const fs         = require('fs')

class Connect {
    constructor(sessionInfo) {
        this.sessionInfo = sessionInfo
    }

    async init() {
        await this.initConn()
        await this.initSFTP()
    }

    exit() {
        this.ssh.end()
        this.conn.end()
    }

    initConn() {
        return new Promise((resolve, reject) => {
            const conn = new Client()
            conn
                .on('ready', () => {
                    this.conn = conn
                    resolve(conn)
                })
                .on('error', err => reject(err))
                .connect(this.sessionInfo)
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

    async download(remotePath, localPath, progress) {
        const stats = await this.statRemote(remotePath)
        const idDir = stats.isDirectory()

        if (!idDir) return this.downloadFile(remotePath, localPath, progress)
        if (idDir)  return this.downloadDir(remotePath, localPath, progress)
    }

    async downloadFile(remotePath, localPath, progress) {
        const options = {
            step: (saved, chunk, total) => {
                progress('download', { pathname: remotePath, saved, total })
            },
        }
        return new Promise((resolve, reject) => {
            this.sftp.fastGet(remotePath, localPath, options, err => {
                if (err) return reject(err)
                resolve()
                progress('finish')
            })
        })
    }

    async downloadDir(remotePath, localPath, progress) {
        const fileList = await this.listRemote(remotePath)

        await this.mkdirLocal(localPath)

        for (const file of fileList) {

            if (file.type === 'd') {
                let newSrc = join(remotePath, file.name)
                let newDst = join(localPath, file.name)
                await this.downloadDir(newSrc, newDst, progress)
            }

            if (file.type === '-') {
                let src = join(remotePath, file.name)
                let dst = join(localPath, file.name)
                await this.downloadFile(src, dst, progress)
            }
        }
    }

    async upload(localPath, remotePath, progress) {
        const stats = await this.statLocal(localPath)
        const idDir = stats.isDirectory()

        if (!idDir) return this.uploadFile(localPath, remotePath, progress)
        if (idDir)  return this.uploadDir(localPath, remotePath, progress)
    }

    async uploadFile(localPath, remotePath, progress) {
        const options = {
            step: (saved, chunk, total) => {
                progress('upload', { pathname: localPath, saved, total })
            },
        }
        return new Promise((resolve, reject) => {
            this.sftp.fastPut(localPath, remotePath, options, err => {
                if (err) return reject(err)
                resolve()
                progress('finish')
            })
        })
    }

    async uploadDir(localPath, remotePath, progress) {
        const fileList = await this.listLocal(localPath)

        await this.mkdirRemote(remotePath)

        for (const file of fileList) {

            if (file.type === 'd') {
                let newSrc = join(localPath, file.name)
                let newDst = join(remotePath, file.name)
                await this.uploadDir(newSrc, newDst, progress)
            }

            if (file.type === '-') {
                let src = join(localPath, file.name)
                let dst = join(remotePath, file.name)
                await this.uploadFile(src, dst, progress)
            }
        }
    }

    /**
     * 远程 列出目录下文件
     * @method
     * @param   {String}    cwd     远程目录地址
     */
    listRemote(cwd) {
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
    rmRemote(pathName) {
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
    async mkdirRemote(pathName) {
        return new Promise((resolve, reject) => {
            // 若目录已存在，则跳过创建
            this.statRemote(pathName)
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
    renameRemote(pathOld, pathNew) {
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
    statRemote(pathName) {
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
    writeFileRemote(pathName) {
        return new Promise((resolve, reject) => {
            this.sftp.writeFile(pathName, '', 'utf-8', err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    listLocal(cwd) {
        return new Promise((resolve, reject) => {
            fs.readdir(cwd, (err, list) => {
                if (err) return reject(err)
                resolve(this.listFormatLocal(cwd, list))
            })
        })
    }

    rmLocal(pathName) {
        return new Promise((resolve, reject) => {
            fs.rmdir(pathName, { recursive: true }, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    mkdirLocal(pathName) {
        return new Promise((resolve, reject) => {
            fs.mkdir(pathName, { recursive: true }, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    renameLocal(pathOld, PathNew) {
        return new Promise((resolve, reject) => {
            fs.rename(pathOld, PathNew, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    statLocal(pathName) {
        return new Promise((resolve, reject) => {
            fs.stat(pathName, (err, stats) => {
                if (err) return reject(err)
                resolve(stats)
            })
        })
    }

    writeFileLocal(pathName) {
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
            const stats = fs.lstatSync(join(cwd, filename))

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
        }

        return list
    }
}

export default Connect
