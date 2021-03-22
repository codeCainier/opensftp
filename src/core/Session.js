import path from 'path'

export default {
    /**
     * 移动文件
     * @method
     * @param   {String}    action       local || remote
     * @param   {String}    oldPath      文件移动前地址
     * @param   {String}    newPath      文件移动后地址
     */
    mvFile(action, oldPath, newPath) {
        // 新地址不能在旧地址内
        // FIXME: 文件名称包含 Bug
        if (newPath.startsWith(oldPath)) return

        this.loading = true

        let mode

        if (action === 'local')  mode = 'renameLocal'
        if (action === 'remote') mode = 'renameRemote'

        this.checkOverwrite(action, newPath)
            // 确认覆盖或无需覆盖
            .then(() => {
                this.loading = true
                this.connect[mode](oldPath, newPath)
                    .then(() => this.getFileList('.'))
                    .catch(err => this.tools.confirm(err))
                    .finally(() => this.loading = false)
            })
            // 取消覆盖
            .catch(() => {})
    },
    /**
     * 检查是否需要覆盖
     * @method
     * @param   {String}    action       local || remote
     * @param   {String}    pathname     文件地址
     */
    checkOverwrite(action, pathname) {
        this.loading = true

        let mode

        if (action === 'local')  mode = 'statLocal'
        if (action === 'remote') mode = 'statRemote'

        return new Promise((resolve, reject) => {
            this.connect[mode](pathname)
                .then(() => {
                    this.confirm({
                        message: `${pathname} 已存在，是否覆盖？`,
                        confirm: () => resolve(),
                        cancel: () => reject(),
                    })
                })
                .catch(() => resolve())
                .finally(() => this.loading = false)
        })
    },
    /**
     * 本地新建目录
     * @method
     */
    mkdirLocal() {
        this.createFile('local', 'dir')
    },
    /**
     * 本地新建文件
     * @method
     */
    writeFileLocal() {
        this.createFile('local', 'file')
    },
    /**
     * 远程新建目录
     * @method
     */
    mkdirRemote() {
        this.createFile('remote', 'dir')
    },
    /**
     * 远程新建文件
     * @method
     */
    writeFileRemote() {
        this.createFile('remote', 'file')
    },
    /**
     * 新建文件
     * @method
     * @param   {String}    action       local || remote
     * @param   {String}    type         file || dir
     * @param   {Number}    existNum     当前目录下同名文件数量（包括自身）
     */
    createFile(action, type, existNum = 1) {

        let defaultName

        if (type === 'file') defaultName = defaultName || '未命名文件'
        if (type === 'dir')  defaultName = defaultName || '未命名文件夹'
        if (existNum !== 1)  defaultName = `${defaultName} ${existNum}`

        // 若当前目录存在同名文件，则进行递归，同名文件数量后缀 + 1
        if (this.findItemFromList({ name: defaultName })) return this.createFile(action, type, existNum + 1)

        let mode
        let join
        let message

        if (action === 'local') {
            if (type === 'file') mode = 'writeFileLocal'
            if (type === 'dir')  mode = 'mkdirLocal'
            join = path.join
        }

        if (action === 'remote') {
            if (type === 'file') mode = 'writeFileRemote'
            if (type === 'dir')  mode = 'mkdirRemote'
            join = path.posix.join
        }

        if (type === 'file') message = '请输入文件名称'
        if (type === 'dir')  message = '请输入目录名称'

        this.$q.dialog({
            message,
            prompt: {
                model: '',
                type: 'text',
                attrs: {
                    placeholder: defaultName,
                },
            },
            cancel: true,
            persistent: true
        }).onOk(data => {
            // 若未输入文件名称，则使用默认名称
            if (!data) data = defaultName
            // 输入的文件名称已存在，则给出提示
            if (this.findItemFromList({ name: data })) return this.tools.confirm({
                message: `已存在 ${data}`,
                confirm: () => this.createFile(action, type),
            })
            // Loading
            this.loading = true
            // 创建文件
            this.connect[mode](join(this.pwd, data))
                .then(() => this.getFileList('.', null, data))
                .catch(err => this.confirm(err))
                .finally(() => this.loading = false)
        })
    },
    /**
     * 从 list 数组中提取 Object
     * @method
     * @param   {Object}    condition       匹配条件
     * @param   {String}    condition.name  文件名称
     * @return  {Object}                    满足条件的项目
     */
    findItemFromList({ name }) {
        // 若传入参数为文件名称
        if (name) return this.list.find(item => item.name === name)
    }
}
