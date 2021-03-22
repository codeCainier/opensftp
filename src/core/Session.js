export default instance => new class {
    constructor() {
    }

    /**
     * 移动文件
     * @method
     * @param   {String}    action       local || remote
     * @param   {String}    oldPath      文件移动前地址
     * @param   {String}    newPath      文件移动后地址
     */
    mvFile(action, oldPath, newPath) {
        instance.loading = true

        let mode

        if (action === 'local')  mode = 'renameLocal'
        if (action === 'remote') mode = 'renameRemote'

        this.checkOverwrite(action, newPath)
            // 确认覆盖或无需覆盖
            .then(() => {
                instance.loading = true
                instance.connect[mode](oldPath, newPath)
                    .then(() => instance.getFileList('.'))
                    .catch(err => instance.tools.confirm(err))
                    .finally(() => instance.loading = false)
            })
            // 取消覆盖
            .catch(() => {})
    }

    /**
     * 检查是否需要覆盖
     * @method
     * @param   {String}    action       local || remote
     * @param   {String}    pathname     文件地址
     */
    checkOverwrite(action, pathname) {
        instance.loading = true

        let mode

        if (action === 'local')  mode = 'statLocal'
        if (action === 'remote') mode = 'statRemote'

        return new Promise((resolve, reject) => {
            instance.connect[mode](pathname)
                .then(() => {
                    instance.confirm({
                        message: `${pathname} 已存在，是否覆盖？`,
                        confirm: () => resolve(),
                        cancel: () => reject(),
                    })
                })
                .catch(() => resolve())
                .finally(() => instance.loading = false)
        })
    }
}
