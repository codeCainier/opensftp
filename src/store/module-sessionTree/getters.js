export function selectedNodeNum ({ selectedNode }) {
    return () => Object.keys(selectedNode).length
}
