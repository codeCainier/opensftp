/**
 * 创建任务
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.id        传输任务 ID
 * @param   {String}    props.connId    会话连接 ID
 * @param   {String}    props.dir       目标目录
 * @param   {String}    props.name      任务名称
 * @param   {String}    props.icon      任务图标    TODO: 暂未加入
 * @param   {String}    props.action    传输模式    download || upload
 */
export function TASK_INIT(state, props) {
    const { id, connId, dir, name, icon, action } = props
    state.list.push({
        id,                     // 传输任务 ID
        connId,                 // 会话连接 ID
        dir,                    // 目标目录
        name,                   // 任务名称
        icon,                   // 任务图标
        action,                 // 传输模式
        status: 'working',      // 任务状态
        taskFinish: [],         // 已完成任务
        startTime: Date.now(),  // 任务开始时间
        endTime: 0,             // 任务结束时间
        transferring: {             // 正在传输文件信息
            pathname  : '',         // 文件路径
            saved     : 0,          // 完成 size
            total     : 0,          // 总计 size
            percent   : 0,          // 完成百分比
            speed     : 0,          // 传输速度
            startTime : 0,          // 开始时间
            endTime   : 0,          // 结束时间
        },
    })
}

/**
 * 更新任务
 * @param   {Object}    state
 * @param   {Object}    props
 * @param   {String}    props.id        传输任务 ID
 * @param   {String}    props.pathname  文件路径
 * @param   {Number}    props.saved     完成 size
 * @param   {Number}    props.total     总计 size
 */
export function TASK_UPDATE(state, props) {
    const { id, pathname, saved, total } = props
    const index = state.list.findIndex(item => item.id === id)
    const task  = state.list[index]
    // const task = state.list.find(item => item.id === id)
    // 传输时间（秒）
    const timeS = (Date.now() - task.transferring.startTime) / 1000

    // 若文件路径不是当前传输文件路径，则代表文件传输完成
    if (task.transferring.pathname !== pathname) {
        // 将已完成的传输文件移入已完成任务 Array
        task.transferring.endTime = Date.now()
        task.taskFinish.push(task.transferring)
        // 初始化正在传输文件信息
        task.transferring.pathname  = pathname
        task.transferring.saved     = 0
        task.transferring.total     = total
        task.transferring.percent   = 0
        task.transferring.speed     = 0
        task.transferring.startTime = Date.now()
        task.transferring.endTime   = 0
    }

    // 更新传输进度
    task.transferring.saved    = saved
    task.transferring.percent  = Number((saved / total).toFixed(2))
    task.transferring.speed    = Number((saved / timeS).toFixed(0))
}

/**
 * 完成任务
 * @param   {Object}    state
 * @param   {String}    id      传输任务 ID
 */
export function TASK_FINISH(state, id) {
    const task = state.list.find(item => item.id === id)
    task.status = 'finish'
    state.finishListener = id
}

