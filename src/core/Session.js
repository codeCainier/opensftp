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
        let sep

        if (action === 'local')  sep = path.sep
        if (action === 'remote') sep = '/'

        // 新地址不能在旧地址内 (地址末尾需要拼接分隔符，防止出现名称相似问题)
        if ((newPath + sep).startsWith(oldPath + sep)) return

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

        let statMode
        let rmMode

        if (action === 'local')  {
            statMode = 'statLocal'
            rmMode   = 'rmLocal'
        }
        if (action === 'remote') {
            statMode = 'statRemote'
            rmMode   = 'rmRemote'
        }

        return new Promise((resolve, reject) => {
            this.connect[statMode](pathname)
                .then(stats => {
                    const isDir = stats.isDirectory()

                    if (!isDir) this.confirm({
                        message: '文件已存在，是否进行覆盖？',
                        confirm: () => resolve(),
                        cancel : () => reject(),
                    })

                    if (isDir) this.$q.dialog({
                        message: '目录已存在，请选择覆盖模式',
                        options: {
                            type: 'radio',
                            model: 'ad',
                            items: [
                                { label: '增量模式：只覆盖重复文件', value: 'ad', color: 'primary' },
                                { label: '重建模式：删除旧目录并重新创建', value: 'rm', color: 'negative' },
                            ]
                        },
                        cancel: true,
                        persistent: true
                    }).onOk(data => {
                        if (data === 'rm') {
                            this.connect[rmMode](pathname)
                                .then(() => resolve())
                                .catch(() => reject())
                        }
                        if (data === 'ad') resolve()
                    }).onCancel(() => reject())
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
    },
    /**
     * 下载
     * @method
     * @param   {String}    remotePath      远程路径
     * @param   {String}    localPath       本地路径
     */
    download(remotePath, localPath) {
        // 检查本地是否已存在
        this.checkOverwrite('local', localPath)
            .then(async () => {
                // 创建下载任务
                this.$store.commit('transfer/TASK_INIT', 'download')
                // 开始下载
                await this.connect.download(remotePath, localPath, this.progressStep)
                // TODO: 刷新自己 下载成功，刷新本地文件系统
                this.$emit('refresh-local')
                // 通知提示
                this.notify('下载成功')
                // 关闭下载任务
                this.$store.commit('transfer/TASK_CLOSE')
            })
            .catch(() => {})
    },
    /**
     * 上传
     * @method
     * @param   {String}    localPath       本地路径
     * @param   {String}    remotePath      远程路径
     */
    upload(localPath, remotePath) {
        // 检查远程是否已存在
        this.checkOverwrite('remote', remotePath)
            .then(async () => {
                // 创建上传任务
                this.$store.commit('transfer/TASK_INIT', 'upload')
                // 开始上传
                await this.connect.upload(localPath, remotePath, this.progressStep)
                // TODO: 刷新自己 上传成功，刷新本地文件系统
                this.$emit('refresh-remote')
                // 通知提示
                this.notify('上传成功')
                // 关闭上传任务
                this.$store.commit('transfer/TASK_CLOSE')
            })
            .catch(() => {})
    },
    // 更新传输进度
    progressStep(action, params) {
        if (action === 'upload') {
            const { pathname, saved, total } = params
            this.$store.commit('transfer/TASK_UPDATE', { pathname, saved, total })
        }
        if (action === 'download') {
            const { pathname, saved, total } = params
            this.$store.commit('transfer/TASK_UPDATE', { pathname, saved, total })
        }
        if (action === 'finish') {
            this.$store.commit('transfer/TASK_FINISH')
        }
    },
}
