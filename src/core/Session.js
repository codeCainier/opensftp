import { uid } from 'quasar'
import path from 'path'

export default {
    fileFocus(index = this.selected) {
        this.selected = index
        this.openMenu = null
        this.$nextTick(() => {
            try {
                // TODO: 使用 this.$refs['file-item'][index] 的形式有 refs 数组索引错位的问题
                this.$refs[`file-item-${index}`][0].focus()
            } catch (error) {
            }
        })
    },
    // 拖动结束
    dragEnd() {
        this.dragEnterItem = null
    },
    // 拖动离开
    dragLeave() {
        this.dragEnterItem = null
    },
    // 当前目录菜单显示前
    pwdMenuBeforeShow(event) {
        const a = event.target.parentElement
        const b = event.target.parentElement.parentElement.parentElement
        const scrollArea = this.$refs.scrollArea.$el
        if (a !== scrollArea && b !== scrollArea) this.$refs.pwdMenu.$refs.menu.hide()
    },
    // 进入目录
    dirEnter(item) {
        if (['d', 'l'].includes(item.type)) this.getFileList(item.name)
    },
    // 重命名开始
    renameOpen(item, index) {
        this.renameItem = this.tools.clone(item)
        this.renameItem.newName = this.renameItem.name
        // TODO: nextTick 无效
        setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
    },
    // 重命名取消
    renameCancel(index) {
        this.renameItem = {}
        this.$refs[`rename-input-${index}`][0].blur()
        this.fileFocus()
    },
    // 移动聚焦元素
    moveFocus(action) {
        if (action === 'up' && this.selected !== 0) this.selected -= 1
        if (action === 'down' && this.selected !== this.list.length - 1) this.selected += 1
        // 若不显示隐藏文件，判断当前 selected 元素是否为隐藏文件
        // 若为隐藏文件，则递归移动聚焦元素
        if (!this.showHideFile && this.hideItem(this.list[this.selected])) return this.moveFocus(action)
        this.fileFocus()
    },
    // 拖动经过
    dragOver(event, item) {
        this.dragEnterItem = item ? item.name : null
    },
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
     * 文件传输
     * @method
     * @param   {String}    action          传输模式    download || upload
     * @param   {String}    fromPath        起始路径
     * @param   {String}    distPath        目标路径
     */
    transmit(action, fromPath, distPath) {
        // 检查文件是否已存在
        this.checkOverwrite(action === 'download' ? 'local' : 'remote', distPath)
            .then(async () => {
                const id     = uid()
                const connId = this.connectId
                const dir    = path.parse(distPath).dir
                const name   = path.basename(fromPath)
                // 创建任务
                this.$store.commit('transfer/TASK_INIT', { id, connId, dir, name, action })
                // 开始传输
                await this.connect[action](fromPath, distPath, (pathname, saved, total) => {
                    // 更新任务
                    this.$store.commit('transfer/TASK_UPDATE', { id, pathname, saved, total })
                })
                // 完成传输
                this.$store.commit('transfer/TASK_FINISH', id)
                // 通知提示
                this.notify(this.$store.getters['transfer/TRANSMIT_INFO'](id))
            })
            .catch(() => {})
    },
}
