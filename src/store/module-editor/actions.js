import { Platform } from 'quasar'
import fs from 'fs'
import path from 'path'

let system = ''

if (Platform.is.win)   system = 'win'
if (Platform.is.mac)   system = 'mac'
if (Platform.is.linux) system = 'linux'

/**
 * 设置编辑器路径
 * @param   {Object}    store
 * @param   {Object}    store.state
 * @param   {Function}  store.commit
 * @param   {Object}    props
 * @param   {String}    props.editorName    编辑器名称
 * @param   {String}    props.editorDir     编辑器存放路径
 */
export function SET_EDITOR_PATH ({ state, commit }, { editorName, editorDir }) {
    const binPath = state[editorName].binPath[system]
    const fullPath = path.join(editorDir, binPath)

    return new Promise((resolve, reject) => {
        fs.stat(fullPath, (err, stats) => {
            if (err) return reject(err)
            commit('SET', {
                editorName,
                editorPath: fullPath,
            })
            resolve()
        })
    })
}
