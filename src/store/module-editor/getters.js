export function EDITOR_LIST (state) {
    return () => {
        const arr = []
        Object.keys(state).forEach(editorName => {
            if (state[editorName].path) arr.push({
                name: editorName,
                path: state[editorName].path,
            })
        })
        return arr
    }
}
