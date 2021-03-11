import Session from 'src/core/session'

const fs = require('fs')
const { join } = require('path')

class SFTP extends Session {
    constructor(action) {
        super()
        this.action = action
    }

    async init(sessionInfo) {
        await super.init(sessionInfo)
        return new Promise((resolve, reject) => {
            this.conn.sftp((err, sftp) => {
                if (err) return reject(err)
                this.sftp = sftp
                resolve()
            })
        })
    }

    async list(cwd) {
        if (this.action === 'remote') return await this.remoteList(cwd)
        if (this.action === 'local')  return await this.localList(cwd)
    }

    async rm(pathName) {
        if (this.action === 'remote') return await this.remoteRm(pathName)
        if (this.action === 'local')  return await this.localRm(pathName)
    }

    async rename(pathOld, pathNew) {
        if (this.action === 'remote') return await this.remoteRename(pathOld, pathNew)
        if (this.action === 'local')  return await this.localRename(pathOld, pathNew)
    }

    async stat(pathName) {
        if (this.action === 'remote') return await this.remoteStat(pathName)
        if (this.action === 'local')  return await this.localStat(pathName)
    }

    async download(remotePath, localPath, progress) {
        const stats = await this.remoteStat(remotePath)
        const idDir = stats.isDirectory()

        if (!idDir) return this.downloadFile(remotePath, localPath, progress)
        if (idDir)  return this.downloadDir(remotePath, localPath, progress)
    }

    async downloadFile(remotePath, localPath, progress) {
        const options = {
            step: (saved, chunk, total) => {
                progress('download', { remotePath, saved, total })
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
        const fileList = await this.list(remotePath, localPath)

        fs.mkdirSync(localPath, { recursive: true })

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

    remoteList(cwd) {
        return new Promise((resolve, reject) => {
            this.sftp.readdir(cwd, (err, list) => {
                if (err) return reject(err)
                resolve(this.#listFormat(cwd, list))
            })
        })
    }

    remoteRm(pathName) {
        return new Promise((resolve, reject) => {
            const cmd = `rm -rf "${pathName}"`
            this.conn.exec(cmd, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    remoteRename(pathOld, PathNew) {
        return new Promise((resolve, reject) => {
            this.sftp.rename(pathOld, PathNew, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    remoteStat(remotePath) {
        return new Promise((resolve, reject) => {
            this.sftp.stat(remotePath, (err, stats) => {
                if (err) return reject(err)
                resolve(stats)
            })
        })
    }

    localList(cwd) {
        return new Promise((resolve, reject) => {
            fs.readdir(cwd, (err, list) => {
                if (err) return reject(err)
                resolve(this.#listFormat(cwd, list))
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

    localRename(pathOld, PathNew) {
        return new Promise((resolve, reject) => {
            fs.rename(pathOld, PathNew, err => {
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

    #listFormat = (cwd, list) => {
        if (this.action === 'remote') list = this.remoteListFormat(list)
        if (this.action === 'local')  list = this.localListFormat(cwd, list)
        return list
    }

    remoteListFormat(list) {
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

    localListFormat(cwd, fileList) {
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

export default SFTP
