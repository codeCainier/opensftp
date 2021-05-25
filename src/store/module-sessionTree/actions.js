export function RECURSION_SHOW({ state, commit }, nodeEl) {
    const isHidden = nodeEl.offsetParent === null
    console.log(isHidden);
}
