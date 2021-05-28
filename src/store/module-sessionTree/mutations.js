import tools from 'src/utils'
import { uid } from 'quasar'

export function SET_NODE_SELECTED(state, item) {
    state.focusNode = item
    state.selectedNode = {
        [item.id]: item,
    }
}

export function SET_NODE_SELECTED_ADD(state, item) {
    state.focusNode = item
    state.selectedNode = {
        ...state.selectedNode,
        ...{
            [item.id]: item,
        }
    }
}

export function SET_NODE_SELECTED_ALL(state, nodes) {
    state.selectedNode = tools.clone(nodes)
}

export function SET_NODE_SELECTED_CLEAR(state) {
    state.focusNode = null
    state.selectedNode = {}
}

export function SET_LOADING(state, id) {
    state.loading = id
}

export function SET_DRAG_LIST(state, selected) {
    state.dragList = selected ? tools.clone(selected) : {}
}

export function SET_DRAG_MOVE(state, id) {
    state.dragMove = id
}

export function SET_DRAG_INTO(state, id) {
    state.dragInto = id
}

export function RENAME_START(state, item) {
    state.renameItem = tools.clone(item)
    state.renameItem.oldname = state.renameItem.name
}

export function RENAME_CLOSE(state) {
    state.renameItem = {}
}

export function RENAME_CANCEL(state) {
    state.renameItem.name = state.renameItem.oldname
}

export function SHOW_POSTER(state, item) {
    state.showPoster = [item, uid()]
}

export function SHOW_DETAIL(state, item) {
    state.showDetail = [item, uid()]
}
