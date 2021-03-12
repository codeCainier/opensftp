// 新增 SSH 会话
export function UPDATE_CONT_SIZE(state, headerDom) {
    state.contWidth = window.innerWidth
    state.contHeight = window.innerHeight - headerDom.clientHeight
}
