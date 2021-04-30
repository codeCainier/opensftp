import path from 'path'
import fs from 'fs'
import electron from 'electron'
import { Platform } from 'quasar'

const { app } = electron.remote

// Mac 下系统原生图标资源路径
const MacIconResourcesPath = '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/'

const DesktopPath  = app.getPath('desktop')
const DocumentPath = app.getPath('documents')
const DownloadPath = app.getPath('downloads')
const MusicPath    = app.getPath('music')
const PicturePath  = app.getPath('pictures')
const VideoPath    = app.getPath('videos')

function getFolderIcon(filepath) {
    if (Platform.is.mac)   return getMacFolderIcon(filepath)
    if (Platform.is.win)   return getWinFolderIcon(filepath)
    if (Platform.is.linux) return getLinuxFolderIcon(filepath)
}

function getMacFolderIcon(filepath) {
    let icon = 'GenericFolderIcon'
    if (filepath === DesktopPath)  icon = 'DesktopFolderIcon'
    if (filepath === DocumentPath) icon = 'DocumentsFolderIcon'
    if (filepath === DownloadPath) icon = 'DownloadsFolder'
    if (filepath === MusicPath)    icon = 'MusicFolderIcon'
    if (filepath === PicturePath)  icon = 'PicturesFolderIcon'
    if (filepath === VideoPath)    icon = 'MovieFolderIcon'
    return `./statics/icons/system-icons/mac/${icon}.png`
}

function getWinFolderIcon (filepath) {

}

function getLinuxFolderIcon (filepath) {

}

export default async (pwd, item) => {
    const { type, name } = item

    const filepath = path.join(pwd, name)

    // 若为文件，使用系统默认图标
    if (type === '-') {
        const nativeImage = await app.getFileIcon(filepath)
        return nativeImage.toDataURL()
    }

    if (type === 'd') return getFolderIcon(filepath)
}
