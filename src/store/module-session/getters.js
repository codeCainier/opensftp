import tools from 'src/utils'

export function sessionPool (state) {
    return () => {
        return tools.clone(state.pool)
    }
}

export function sessionNodeNum (state) {
    // TODO: 传入指定目录节点 ID，返回目录节点下会话子节点的数量
    return id => {
        let num = 0
        function recursionCount(group) {
            for (let index = 0; index < group.length; index += 1) {
                const item = group[index]
                if (item.type === 'session') num += 1
                if (item.type === 'dir') recursionCount(item.children)
            }
        }
        recursionCount(state.pool)
        return num
    }
}

export function sessionInfo (state) {
    return cond => {
        let info
        function recursionFind(group) {
            for (let index = 0; index < group.length; index += 1) {
                const item = group[index]
                if (item.type === 'dir') recursionFind(item.children)
                if (item.type === 'session') {
                    let condMatchNum = 0
                    Object.keys(cond).forEach(field => {
                        if (field === 'id'       && item.id === cond.id)                    condMatchNum += 1
                        if (field === 'host'     && item.detail.host === cond.host)         condMatchNum += 1
                        if (field === 'port'     && item.detail.port === cond.port)         condMatchNum += 1
                        if (field === 'username' && item.detail.username === cond.username) condMatchNum += 1
                    })
                    if (condMatchNum === Object.keys(cond).length) return info = item
                }
            }
        }
        recursionFind(state.pool)
        return info
    }
}

export function sessionFilter (state) {
    return str => {
        str = str.trim().toLocaleLowerCase()
        const arr = []
        function recursionFilter(group) {
            for (let index = 0; index < group.length; index += 1) {
                const item = group[index]
                if (item.type === 'dir') recursionFilter(item.children)
                if (item.type === 'session') {
                    const include = item.name.toLocaleLowerCase().includes(str)
                        || item.detail.host.toLocaleLowerCase().includes(str)
                        || item.detail.port.includes(str)
                    if (include) arr.push(item)
                }
            }
        }
        recursionFilter(state.pool)
        return arr
    }
}

export function sessionNodeList (state) {
    return () => {
        const list = []
        function recursionRead(group) {
            group.forEach(item => {
                list.push({ [item.id]: item })
                if (item.type === 'dir') recursionRead(item.children)
            })
        }
        recursionRead(state.pool)
        return list
    }
}
