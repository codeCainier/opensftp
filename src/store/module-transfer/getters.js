export function CONNECT_TRANSFER (state) {
    return id => {
        return state.list.filter(item => item.status === 'working' && item.connId === id)
    }
}

export function TRANSMIT_INFO (state) {
    return id => {
        const task = state.list.find(item => item.id === id)
        const { action, name } = task
        const actionText = action === 'download' ? '下载成功' : '上传成功'
        return `${name} ${actionText}`
    }
}
