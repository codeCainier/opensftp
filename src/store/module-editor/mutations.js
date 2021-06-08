import { LocalStorage } from 'quasar'

/**
 * 设置 windows 编辑器路径
 * @param   {String}    props.editorName    编辑器名称
 * @param   {String}    props.editorPath    编辑器启动完整路径
 */
export function SET_PATH(state, props) {
    const { editorName, editorPath } = props
    state.list[editorName].winInstallDir = editorPath
    state.list[editorName].isInstalled = true
    LocalStorage.set('editorList', state.list)
}

export function EDITOR_USE(state, editorName) {
    state.list[editorName].useNum += 1
    LocalStorage.set('editorList', state.list)
}
