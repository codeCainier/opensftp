import { Platform, LocalStorage } from 'quasar'
import path from 'path'
import fs from 'fs'

class Editor {
    constructor(list) {
        this.list = list
        this.checkExist()
    }

    checkExist() {
        Object.values(this.list).forEach(item => {
            if (Platform.is.win) this.checkWinEditor(item)
            if (Platform.is.mac) this.checkMacEditor(item)
        })
        LocalStorage.set('editorList', this.list)
    }

    checkWinEditor(item) {
        const { winInstallDir, winBinPath } = item
        // 若安装路径为空，则直接认为未安装
        if (!winInstallDir) return item.isInstalled = false
        // 通过检查目录是否存在，判断编辑器是否已经安装
        try {
            const winFullPath = path.join(winInstallDir, winBinPath)
            fs.statSync(winFullPath)
            // 更改编辑器存在状态
            item.isInstalled = true
            // 拼接完整启动路径
            item.winFullPath = winFullPath
        } catch (e) {
            item.isInstalled = false
        }
    }

    checkMacEditor(item) {
        // 拼接 Mac 下编辑器安装目录（固定值）
        const macAppPath = `/Applications/${item.name}.app`
        // 通过检查目录是否存在，判断编辑器是否已经安装
        try {
            fs.statSync(macAppPath)
            item.isInstalled = true
        } catch (e) {
            item.isInstalled = false
        }
    }
}

const editor = new Editor(LocalStorage.getItem('editorList') || {
    'Visual Studio Code': {
        // Mac 通过 /Applications + name + .app 进行安装校验，也可以使用 name 进行启动
        name: 'Visual Studio Code',
        // 是否已安装，默认为 false
        isInstalled: false,
        // Windows 下的安装目录（用户自定义安装目录）
        winInstallDir: '',
        // Windows 下启动文件（固定）
        // FIXME: 这个地址问题吧
        winBinPath: 'bin/code',
        // Windows 下完整启动路径
        winFullPath: '',
        // 使用次数
        useNum: 0,
    },
    'WebStorm': {
        name: 'WebStorm',
        isInstalled: false,
        winInstallDir: '',
        winBinPath: 'bin/webstorm64.exe',
        winFullPath: '',
        useNum: 0,
    },
})

const state = {
    list: editor.list,
}

export default function () {
    return state
}
