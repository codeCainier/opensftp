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
                if (item.type === 'session') return num += 1
                if (item.type === 'dir') {
                    recursionCount(item.children)
                }
            }
        }
        recursionCount(state.pool)
        return num
    }
}
