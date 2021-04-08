import tools from 'src/utils'

export function sessionPool (state) {
    return () => {
        return tools.clone(state.pool)
    }
}
