export function TASK_INIT(state, params) {
    const { id, action, tag } = params
    const info = {
        id,
        action,
        tag,
        task: new Map(),
        finish: 0,
        total: 0,
        startTime: Date.now(),
    }

    state.list.set(id, info)
}

export function TASK_ADD(state, params) {
    const { id, tid, task } = params
    const info = state.list.get(id)

    info.task.set(tid, task)
    info.total += task.size

    state.list.set(id, info)
}

export function TASK_UPDATE(state, params) {
    const { id, tid, finish } = params
    const info = state.list.get(id)
    const task = info.task.get(tid)

    task.finish += finish
    info.finish += finish

    state.list.set(id, info)
}