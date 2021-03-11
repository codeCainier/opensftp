import store from 'src/store'
import { uid } from 'quasar'

export function TASK_INIT(state, action) {
    const { id } = store.state.session.active

    state.list[id] = {
        action,
        saved: 0,
        total: 0,
        percent: 0,
        transferring: {
            remotePath: '',
            saved: 0,
            total: 0,
            percent: 0,
            startTime: 0,
            endTime: 0,
        },
        taskFinish: [],
        startTime: Date.now(),
        endTime: 0,
    }
}

export function TASK_UPDATE(state, params) {
    const { id } = store.state.session.active
    const { remotePath, saved, total } = params
    const info = state.list[id]

    if (info.transferring.remotePath === remotePath) {
        info.transferring.saved = saved
        info.transferring.percent = Number((saved / total).toFixed(2))
    }

    if (info.transferring.remotePath !== remotePath) {
        info.total += total
        info.percent = Number((info.saved / info.total).toFixed(2))

        info.transferring.remotePath = remotePath
        info.transferring.saved = 0
        info.transferring.total = total
        info.transferring.percent = 0
        info.transferring.startTime = Date.now()
    }

    state.list[id] = info
    state.listener = uid()
}

export function TASK_FINISH(state) {
    const { id } = store.state.session.active
    const info = state.list[id]

    info.saved += info.transferring.total
    info.percent = Number((info.saved / info.total).toFixed(2))

    info.transferring.saved = info.transferring.total
    info.transferring.percent = 1
    info.transferring.endTime = Date.now()

    info.taskFinish.push(info.transferring)

    state.list[id] = info
    state.listener = uid()
}

export function TASK_CLOSE(state) {
    const { id } = store.state.session.active
    setTimeout(() => {
        state.list[id] = null
        state.listener = uid()
    }, 500)
}

