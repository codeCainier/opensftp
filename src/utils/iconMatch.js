import path from 'path'
import fs from 'fs'
import electron from 'electron'

const { app } = electron.remote

// Mac 下系统原生图标资源路径
const MacIconResourcesPath = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/'

export default async (pwd, item) => {
    const { type, name } = item

    const filepath = path.join(pwd, name)

    const nativeImage = await app.getFileIcon(filepath)
    return nativeImage.toDataURL()
    // if (type === '-') {
    //     const nativeImage = await app.getFileIcon(filepath)
    //     return nativeImage.toDataURL()
    // }
    //
    // if (type === 'd') return getMacFolderIcon(filepath, name)
}
