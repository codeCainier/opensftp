import { uid } from 'quasar'
import path from 'path'

export default {
    /**
     * 删除文件
     * @method
     * @param   {String}    action  行为       remote || location
     * @param   {Object}    item    文件对象
     */
    removeFile(action, item) {
        const mode = action === 'remote' ? 'rmRemote' : 'rmLocal'
        // TODO: 弹出删除对话框时，文件 Focus 状态应使用 class 补充
        this.tools.confirm({
            message: `您确定要删除 ${item.name} 吗？注意，删除无法恢复！`,
            confirm: () => {
                this.loading = true
                this.connect[mode](action === 'remote'
                    ? path.posix.join(this.pwd, item.name)
                    : path.join(this.pwd, item.name))
                    .then(() => this.getFileList('.'))
                    .catch(err => this.tools.confirm(err))
                    .finally(() => this.loading = false)
            },
            cancel: () => {},
        })
    },
    /**
     * 文件获取焦点
     * @method
     * @param   {Number}    index   文件索引    默认为当前 selected 元素
     */
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
    /**
     * 开始拖动
     * @method
     * @param   {Object}    event   拖动事件
     * @param   {Object}    item    文件对象
     * @param   {Number}    index   文件索引
     * @param   {String}    action  行为       remote || local
     */
    dragStart(event, item, index, action) {
        this.selected = index
        this.dragFileName = item.name
        event.dataTransfer.setData('action', action)
        event.dataTransfer.setData('info', JSON.stringify(item))
        event.dataTransfer.setData('oldPath', action === 'remote'
            ? path.posix.join(this.pwd, item.name)
            : path.join(this.pwd, item.name))
        event.dataTransfer.setDragImage(this.$refs[`file-item-${index}`][0],0,0)
    },
    /**
     * 拖动结束
     * @method
     */
    dragEnd() {
        this.dragEnterItem = null
        this.dragFileName  = null
    },
    /**
     * 拖动离开
     * @method
     */
    dragLeave() {
        this.dragEnterItem = null
    },
    /**
     * 右键菜单显示判断
     * @method
     * @param   {Object}    event        事件对象
     */
    pwdMenuBeforeShow(event) {
        const a = event.target.parentElement
        const b = event.target.parentElement.parentElement.parentElement
        const scrollArea = this.$refs.scrollArea.$el
        if (a !== scrollArea && b !== scrollArea) this.$refs.pwdMenu.$refs.menu.hide()
    },
    /**
     * 进入目录
     * @method
     * @param   {Object}    item         目标目录对象
     */
    dirEnter(item) {
        if (['d', 'l'].includes(item.type)) this.getFileList(item.name)
    },
    /**
     * 开始重命名
     * @method
     * @param   {Object}    item         重命名文件对象
     * @param   {Number}    index        重命名文件索引
     */
    renameOpen(item, index) {
        this.renameItem = this.tools.clone(item)
        this.renameItem.newName = this.renameItem.name
        // TODO: nextTick 无效
        setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
    },
    /**
     * 取消重命名
     * @method
     * @param   {Number}    index        重命名文件索引
     */
    renameCancel(index) {
        this.renameItem = {}
        this.$refs[`rename-input-${index}`][0].blur()
        this.fileFocus()
    },
    /**
     * 移动聚焦元素
     * @method
     * @param   {String}    action       移动行为   up || down
     */
    moveFocus(action) {
        if (action === 'up' && this.selected !== 0) this.selected -= 1
        if (action === 'down' && this.selected !== this.list.length - 1) this.selected += 1
        // 若不显示隐藏文件，判断当前 selected 元素是否为隐藏文件
        // 若为隐藏文件，则递归移动聚焦元素
        if (!this.showHideFile && this.hideItem(this.list[this.selected])) return this.moveFocus(action)
        this.fileFocus()
    },
    /**
     * 拖动经过
     * @method
     * @param   {Object}    item         移动文件对象
     */
    dragOver(item) {
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
    /**
     * 目录排序
     * @method
     * @param   {Array}     arr     目录列表
     */
    sort(arr) {
        const { sortBy, sortMode } = this
        arr.sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = a.name.toLowerCase()
                const nameB = b.name.toLowerCase()
                if (nameA < nameB) return sortMode === 'asc' ? -1 : 1
                if (nameA > nameB) return sortMode === 'asc' ? 1 : -1
                return 0
            }
            return sortMode === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
        })
        return arr
    },
    /**
     * 设置排序方式
     * @method
     * @param   {String}    sortBy      排序方式
     */
    sortSet(sortBy) {
        // 若与当前排序方式相同，则更改排序模式
        if (this.sortBy === sortBy) this.sortMode = this.sortMode === 'asc' ? 'desc' : 'asc'
        // 若与当前排序方式不同，则更改排序方式，并将排序模式初始化为正序
        if (this.sortBy !== sortBy) {
            this.sortBy = sortBy
            this.sortMode = 'asc'
        }
        // 目录排序
        this.sort(this.list)
    },
    /**
     * 编辑文件
     * @method
     * @param   {String}    action      remote || local
     * @param   {Object}    item        编辑文件对象
     * @param   {Object}    editor      编辑器对象
     */
    async editFile(action, item, editor) {
        const remotePath = path.posix.join(this.pwd, item.name)
        await this.connect.editRemoteFile(remotePath, editor.path, () => {
            this.notify(`文件 ${item.name} 的修改已生效`)
        })
    },
    /**
     * 刷新目录
     * @method
     */
    refresh() {
        this.getFileList('.')
    },
    /**
     * 创建文件右键菜单
     * @method
     * @param   {String}    action      remote || local
     */
    createFileMenu(action) {
        const { remote } = this.$q.electron
        const fileMenu = new remote.Menu()

        fileMenu.append(new remote.MenuItem({
            label: '刷新',
            click: this.refresh,
        }))

        fileMenu.append(new remote.MenuItem({ type: 'separator' }))

        fileMenu.append(new remote.MenuItem({
            label: action === 'local' ? '上传' : '下载',
            click: () => {
                // 起始路径
                const fromPath = action === 'local'
                    ? path.join(this.pwd, this.fileMenuItem.name)
                    : path.posix.join(this.pwd, this.fileMenuItem.name)
                // 目标路径
                const distPath = action === 'local'
                    ? path.posix.join(this.pwdRemote, this.fileMenuItem.name)
                    : path.join(this.pwdRemote, this.fileMenuItem.name)
                // 调用传输
                this.transmit(action === 'local' ? 'upload' : 'download', fromPath, distPath)
            },
        }))

        fileMenu.append(new remote.MenuItem({ type: 'separator' }))

        fileMenu.append(new remote.MenuItem({
            label: '新建',
            submenu: [
                {
                    label: '新建文件',
                    click: action === 'local' ? this.writeFileLocal : this.writeFileRemote,
                }, {
                    label: '新建文件夹',
                    click: action === 'local' ? this.mkdirLocal : this.mkdirRemote,
                },
            ],
        }))

        fileMenu.append(new remote.MenuItem({
            label: '删除',
            click: () => this.removeFile(action, this.fileMenuItem),
        }))

        fileMenu.append(new remote.MenuItem({
            label: '重命名',
            click: () => this.renameOpen(this.fileMenuItem, this.fileMenuIndex),
        }))

        fileMenu.append(new remote.MenuItem({ type: 'separator' }))

        fileMenu.append(new remote.MenuItem({
            label: '显示隐藏文件',
            type: 'checkbox',
            checked: this.showHideFile,
            click: () => this.showHideFile = !this.showHideFile,
        }))

        this.fileMenu = fileMenu
    },
    /**
     * 创建容器右键菜单
     * @method
     * @param   {String}    action      remote || local
     */
    createContainerMenu(action) {
        const { remote } = this.$q.electron
        const containerMenu = new remote.Menu()

        containerMenu.append(new remote.MenuItem({
            label: '刷新',
            click: this.refresh,
        }))

        containerMenu.append(new remote.MenuItem({ type: 'separator' }))

        containerMenu.append(new remote.MenuItem({
            label: '新建',
            submenu: [
                {
                    label: '新建文件',
                    click: action === 'local' ? this.writeFileLocal : this.writeFileRemote,
                }, {
                    label: '新建文件夹',
                    click: action === 'local' ? this.mkdirLocal : this.mkdirRemote,
                },
            ],
        }))

        containerMenu.append(new remote.MenuItem({ type: 'separator' }))

        containerMenu.append(new remote.MenuItem({
            label: '显示隐藏文件',
            type: 'checkbox',
            checked: this.showHideFile,
            click: () => this.showHideFile = !this.showHideFile,
        }))

        this.containerMenu = containerMenu
    },
    // 显示文件右键菜单
    showFileMenu(item, index) {
        this.selected      = index
        this.openMenu      = item.name
        this.fileMenuItem  = item
        this.fileMenuIndex = index
        this.fileMenu.popup({
            callback: () => this.fileFocus(),
        })
    },
    showContainerMenu() {
        this.containerMenu.popup()
    },
}
