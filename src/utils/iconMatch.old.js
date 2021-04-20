// export default item => {
//     const { type, name } = item
//     // 文件后缀
//     const suffix = type === '-' ? name.split('.').pop() : ''
//
//     // 目录
//     if (type === 'd') return require('src/assets/sftp-icons/folder.svg')
//     // 链接
//     if (type === 'l') return require('src/assets/sftp-icons/folder-shared.svg')
//     // TODO 管理文件
//     if (type === 'p') return require('src/assets/sftp-icons/document.svg')
//     // TODO 设备文件
//     if (type === 'b') return require('src/assets/sftp-icons/document.svg')
//     // TODO 字符设备文件
//     if (type === 'c') return require('src/assets/sftp-icons/document.svg')
//     // TODO 套接字文件
//     if (type === 's') return require('src/assets/sftp-icons/document.svg')
//     // 根据后缀匹配
//     if (suffix === 'html')  return require('src/assets/sftp-icons/html.svg')
//     // CSS
//     if (suffix === 'css')   return require('src/assets/sftp-icons/css.svg')
//     // Javascript
//     if (suffix === 'js')    return require('src/assets/sftp-icons/javascript.svg')
//     // Markdown
//     if (suffix === 'md')    return require('src/assets/sftp-icons/readme.svg')
//     // Shell
//     if (suffix === 'sh')    return require('src/assets/sftp-icons/console.svg')
//     // GO
//     if (suffix === 'go')    return require('src/assets/sftp-icons/go.svg')
//     // PHP
//     if (suffix === 'php')   return require('src/assets/sftp-icons/php.svg')
//
//     // 图片文件
//     if (['png', 'jpg', 'jpeg', 'gif', 'tiff', 'ico', 'icns'].includes(suffix))
//         return require('src/assets/sftp-icons/image.svg')
//     // 配置文件
//     if (['ini', 'conf'].includes(suffix))
//         return require('src/assets/sftp-icons/settings.svg')
//     // 压缩文件
//     if (['tar', 'gz', 'tgz', 'zip', 'rar', '7z'].includes(suffix))
//         return require('src/assets/sftp-icons/zip.svg')
//     // 普通文件
//     if (type === '-')
//         return require('src/assets/sftp-icons/document.svg')
// }
