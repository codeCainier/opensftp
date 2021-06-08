import fs from 'fs'
import path from 'path'

/**
 * Windows 设置编辑器路径
 * @param   {String}    props.editorName    编辑器名称
 * @param   {String}    props.editorPath    编辑器安装目录
 */
export function SET_PATH ({ state, commit }, { editorName, editorPath }) {
    const editor = state.list[editorName]
    const { winBinPath } = editor
    const winFullPath = path.join(editorPath, winBinPath)

    return new Promise((resolve, reject) => {
        fs.stat(winFullPath, err => {
            if (err) return reject()
            // vuex 更改编辑器状态
            commit('SET_PATH', { editorName, editorPath })
            resolve()
        })
    })
}
