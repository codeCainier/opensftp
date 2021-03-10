import Session from 'src/core/session'

const fs = require('fs')
const { join, parse } = require('path')

class SFTP extends Session {
    constructor() {
        super()
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
        return new Promise((resolve, reject) => {
            this.sftp.readdir(cwd, (err, list) => {
                if (err) return reject(err)
                resolve(this.listFormat(list))
            })
        })
    }

    async rm(remotePath) {
        return new Promise((resolve, reject) => {
            const cmd = `rm -rf "${remotePath}"`
            this.conn.exec(cmd, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    async rename(remotePathOld, remotePathNew) {
        return new Promise((resolve, reject) => {
            this.sftp.rename(remotePathOld, remotePathNew, err => {
                if (err) return reject(err)
                resolve()
            })
        })
    }

    async stat(remotePath) {
        return new Promise((resolve, reject) => {
            this.sftp.stat(remotePath, (err, stats) => {
                if (err) return reject(err)
                resolve(stats)
            })
        })
    }

    async download(remotePath, localPath, progress) {
        const stats = await this.stat(remotePath)
        const idDir = stats.isDirectory()

        if (!idDir) return this.downloadFile(remotePath, localPath, progress)
        if (idDir)  return this.downloadDir(remotePath, localPath, progress)
    }

    async downloadFile(remotePath, localPath, progress) {
        const options = {
            step: (saved, chunk, total) => {
                progress('download', {
                    remotePath,
                    saved,
                    total,
                })
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

    listFormat(list) {
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
                // 文件数量
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
}

export default SFTP
