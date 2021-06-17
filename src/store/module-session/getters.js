import tools from 'src/utils'

export function sessionPool (state) {
    return () => {
        return tools.clone(state.pool)
    }
}

/**
 * 获取会话数量
 */
export function sessionNodeNum (state) {
    /**
     * @param   {String}    id          目录 ID
     * @return  {Number}                目录下会话数量，若未传入目录 ID，则为全部会话数量
     */
    return id => {
        const dirItem = id
            ? sessionInfo(state)({ id })
            : state.pool
        let num = 0
        function recursionCount(group) {
            for (let index = 0; index < group.length; index += 1) {
                const item = group[index]
                if (item.type === 'session') num += 1
                if (item.type === 'dir') recursionCount(item.children)
            }
        }
        recursionCount(dirItem)
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
                        const condMatch = (field === 'id' && item.id === cond.id)
                        || (field === 'host' && item.detail.host === cond.host)
                        || (field === 'port' && item.detail.port === cond.port)
                        || (field === 'username' && item.detail.username === cond.username)
                        || (field === 'password' && item.detail.password === tools.aesEncode(cond.password))
                        if (condMatch) condMatchNum += 1
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
        const list = {}
        function recursionRead(group) {
            group.forEach(item => {
                list[item.id] = item
                if (item.type === 'dir') recursionRead(item.children)
            })
        }
        recursionRead(state.pool)
        return list
    }
}

export function sessionItem (state) {
    return id => {
        let sessionInfo
        function recursionFind(group) {
            for (let index = 0; index < group.length; index += 1) {
                const item = group[index]
                if (item.id === id) return sessionInfo = item
                if (item.type === 'dir') recursionFind(item.children)
            }
        }
        recursionFind(state.pool)
        return sessionInfo
    }
}

/**
 * 判断节点关系
 */
export function isChildOf () {
    /**
     * @param   {String}    childId     节点 ID
     * @param   {Object}    parentItem  节点对象
     * @return  {Boolean}               节点是否为另一节点的子节点
     */
    return (childId, parentItem) => {
        let isChild = false
        function recursionCheck (group) {
            for (let index = 0; index < group.length; index += 1) {
                const item = group[index]
                if (item.id === childId) return isChild = true
                if (item.type === 'dir') recursionCheck(item.children)
            }
        }
        recursionCheck(parentItem.children)
        return isChild
    }
}
