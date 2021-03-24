export function CONNECT_TRANSFER (state) {
    return id => {
        const list = JSON.parse(JSON.stringify(state.list))
        return list.filter(item => item.connId === id)
    }
}
