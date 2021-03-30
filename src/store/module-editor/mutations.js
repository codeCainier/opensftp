/**
 * 设置编辑器路径
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.editorName    编辑器名称
 * @param   {String}    props.editorPath    编辑器启动完整路径
 */
export function SET(state, props) {
    const { editorName, editorPath } = props
    state[editorName].path = editorPath
}
