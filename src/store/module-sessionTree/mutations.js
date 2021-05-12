import tools from 'src/utils'
import { uid } from 'quasar'

export function STOP_BLUR(state, action) {
    state.stopBlur = action
}

export function SET_SELECTED(state, selected) {
    state.selected = tools.clone(selected)
}

export function SET_SELECTED_ADD(state, selected) {
    state.selected = {
        ...state.selected,
        ...selected,
    }
}

export function SET_SELECTED_REMOVE(state, id) {
    const selected = tools.clone(state.selected)
    delete selected[id]
    state.selected = selected
}

export function SET_SELECTED_CACHE(state, selected) {
    state.selectedCache = selected ? tools.clone(selected) : {}
}

export function SET_UNSELECTED_ALL(state) {
    state.selected = {}
}

export function SET_OPEN_MENU(state, id) {
    state.openMenu = id
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
