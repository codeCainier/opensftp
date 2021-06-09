import path from 'path'
import fs from 'fs'
import electron from 'electron'

const { app } = electron.remote

export default async item => {
    // 目录文件 / 链接文件，使用系统文件夹图标进行匹配
    if (['d', 'l'].includes(item.type)) return `./statics/icons/system-icons/mac/GenericFolderIcon.png`
    // 文件后缀
    const extname = path.extname(item.name)
    // 缓存目录
    const cacheDir = path.join(global.__statics, '../cache')
    // 临时缓存文件
    const cacheFile = path.join(cacheDir, `temp${extname}`)
    // 创建缓存目录
    fs.mkdirSync(cacheDir, { recursive: true })
    // 若缓存文件未存在则创建缓存文件
    if (!fs.existsSync(cacheFile)) fs.writeFileSync(cacheFile, '', { flag: '' })
    // 读取缓存文件
    const nativeImage = await app.getFileIcon(cacheFile)
    // 获取缓存文件图标
    return nativeImage.toDataURL()
}
