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
        let mode, pathName

        if (action === 'local') {
            mode = 'localRm'
            pathName = path.posix.join(this.pwd, item.name)
        }
        if (action === 'remote') {
            mode = 'remoteRm'
            pathName = path.join(this.pwd, item.name)
        }

        this.confirm(`您确定要删除 ${item.name} 吗？注意，删除无法恢复！`)
            .then(() => {
                this.loading = true
                this.conn.send(mode, { pathName })
                    .then(() => this.getFileList('.'))
                    .catch(err => this.alert(err))
                    .finally(() => this.loading = false)
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
        const dragItem = this.tools.clone(item)

        delete dragItem.fileMenu

        this.selected = index
        this.dragFileName = dragItem.name
        event.dataTransfer.setData('action', action)
        event.dataTransfer.setData('info', JSON.stringify(dragItem))
        event.dataTransfer.setData('oldPath', action === 'remote'
            ? path.posix.join(this.pwd, dragItem.name)
            : path.join(this.pwd, dragItem.name))
        event.dataTransfer.setDragImage(this.$refs[`file-item-${index}`][0],0,0)
        this.$emit('change-drag-status', true)
    },
    /**
     * 拖动结束
     * @method
     */
    dragEnd() {
        this.dragEnterItem = null
        this.dragFileName  = null
        this.$emit('change-drag-status', false)
    },
    /**
     * 拖动离开
     * @method
     */
    dragLeave() {
        this.dragEnterItem = null
    },
    /**
     * 进入目录
     * @method
     * @param   {Object}    item         目标目录对象
     * @param   {String}    action       会话类型   remote || local
     */
    dirEnter(item,action) {
        if (['d', 'l'].includes(item.type)) this.getFileList(item.name)
        if (action === 'local' && item.type === '-') this.openFileByDefault(item)
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
     * @param   {String}    pathOld      文件移动前地址
     * @param   {String}    pathNew      文件移动后地址
     */
    mvFile(action, pathOld, pathNew) {
        let sep

        if (action === 'local')  sep = path.sep
        if (action === 'remote') sep = '/'

        // 新地址不能在旧地址内 (地址末尾需要拼接分隔符，防止出现名称相似问题)
        if ((pathNew + sep).startsWith(pathOld + sep)) return

        this.loading = true

        let mode

        if (action === 'local')  mode = 'localRename'
        if (action === 'remote') mode = 'remoteRename'

        this.checkOverwrite(action, pathOld, pathNew)
            // 确认覆盖或无需覆盖
            .then(() => {
                this.loading = true
                this.conn.send(mode, { pathOld, pathNew })
                    .then(() => this.getFileList('.'))
                    .catch(err => this.alert(err))
                    .finally(() => this.loading = false)
            })
            // 取消覆盖
            .catch(() => {})
    },
    /**
     * 检查是否需要覆盖
     * @method
     * @param   {String}    action       local || remote
     * @param   {String}    fromPath     起始路径
     * @param   {String}    distPath     目标路径
     */
    checkOverwrite(action, fromPath, distPath) {
        this.loading = true

        let fromStatMode, distStatMode, rmMode

        if (action === 'local')  {
            fromStatMode = 'remoteExist'
            distStatMode = 'localExist'
            rmMode   = 'localRm'
        }
        if (action === 'remote') {
            fromStatMode = 'localExist'
            distStatMode = 'remoteExist'
            rmMode   = 'remoteRm'
        }

        return new Promise(async (resolve, reject) => {
            const distFileStats = await this.conn.send(fromStatMode, { pathName: fromPath })

            this.conn.send(distStatMode, { pathName: distPath })
                .then(fromFileStats => {
                    if (!fromFileStats.isDir || !distFileStats.isDir) return this.confirm('文件已存在，是否进行覆盖？')
                        .then(() => resolve())
                        .catch(() => reject())

                    if (fromFileStats.isDir) this.$q.dialog({
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
                            this.conn.send(rmMode, { pathName: distPath })
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

        let mode, join, message

        if (action === 'local') {
            if (type === 'file') mode = 'localWriteFile'
            if (type === 'dir')  mode = 'localMkdir'
            join = path.join
        }

        if (action === 'remote') {
            if (type === 'file') mode = 'remoteWriteFile'
            if (type === 'dir')  mode = 'remoteMkdir'
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
            // 判断输入的文件名称是否已存在
            const isExist = Boolean(this.findItemFromList({ name: data }))
            // 输入的文件名称已存在，则给出提示
            if (isExist) return this.confirm(`已存在 ${data}`)
                .then(() => this.createFile(action, type))
            // Loading
            this.loading = true
            // 创建文件
            this.conn.send(mode, { pathName: join(this.pwd, data) })
                .then(() => this.getFileList('.', null, data))
                .catch(err => this.alert(err))
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
        this.checkOverwrite(action === 'download' ? 'local' : 'remote', fromPath, distPath)
            .then(() => {
                const id     = uid()
                const connId = this.conn.id
                const dir    = path.parse(distPath).dir
                const name   = path.basename(fromPath)
                // 创建任务
                this.$store.commit('transfer/TASK_INIT', { id, connId, dir, name, action })
                // 检查传输进度
                // TODO: 思考进度检查时间间隔是否允许配置
                const progressTimer = setInterval(() => {
                    this.conn.send('progress', { progressId: id })
                        .then(progress => {
                            if (!progress) return
                            const { pathname, saved, total } = progress
                            // 更新任务
                            this.$store.commit('transfer/TASK_UPDATE', { id, pathname, saved, total })
                        })
                        .catch(() => clearInterval(progressTimer))
                }, 100)
                // 开始传输
                this.conn.send(action, {
                    progressId: id,
                    localPath : action === 'download' ? distPath : fromPath,
                    remotePath: action === 'download' ? fromPath : distPath,
                })
                    .then(() => {
                        // 完成传输
                        this.$store.commit('transfer/TASK_FINISH', id)
                        // 通知提示
                        this.notify(this.$store.getters['transfer/TRANSMIT_INFO'](id))
                    })
                    .finally(() => clearInterval(progressTimer))
            })
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
        // 启动编辑器命令
        const editorCMD = this.$store.getters['editor/START_CMD'](editor)
        // 编辑器使用次数 +1
        this.$store.commit('editor/EDITOR_USE', editor.name)
        // 编辑本地文件
        if (action === 'local') {
            const localPath = path.posix.join(this.pwd, item.name)
            await this.conn.send('localEditFile', { localPath, editorCMD })
        }
        // 编辑远程文件
        if (action === 'remote') {
            const remotePath = path.posix.join(this.pwd, item.name)
            await this.conn.send('remoteEditFile', { remotePath, editorCMD })
        }
    },
    /**
     * 刷新目录
     * @method
     */
    refresh() {
        this.getFileList('.')
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
            label: '新建文件',
            click: action === 'local' ? this.writeFileLocal : this.writeFileRemote,
        }))

        containerMenu.append(new remote.MenuItem({
            label: '新建文件夹',
            click: action === 'local' ? this.mkdirLocal : this.mkdirRemote,
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
    /**
     * 显示文件右键菜单
     * @method
     */
    showFileMenu(action, item, index) {
        const { remote } = this.$q.electron

        this.selected = index
        this.openMenu = item.name

        // 若右键菜单未创建则创建文件右键菜单
        if (!item.fileMenu) {
            const fileMenu = new remote.Menu()

            fileMenu.append(new remote.MenuItem({
                label: '刷新',
                click: this.refresh,
            }))

            if (action === 'local' && item.type === '-') fileMenu.append(new remote.MenuItem({
                label: '使用默认方式打开',
                click: () => {
                    this.openFileByDefault(item)
                },
            }))

            fileMenu.append(new remote.MenuItem({ type: 'separator' }))

            fileMenu.append(new remote.MenuItem({
                label: '新建文件',
                click: action === 'local' ? this.writeFileLocal : this.writeFileRemote,
            }))

            fileMenu.append(new remote.MenuItem({
                label: '新建文件夹',
                click: action === 'local' ? this.mkdirLocal : this.mkdirRemote,
            }))

            if (item.type === 'd') fileMenu.append(new remote.MenuItem({
                label: `在文件夹内新建`,
                submenu: [
                    {
                        label: '新建文件',
                        click: () => {
                            this.alert('功能开发中')
                        },
                    }, {
                        label: '新建文件夹',
                        click: () => {
                            this.alert('功能开发中')
                        },
                    },
                ],
            }))

            if (action === 'local') fileMenu.append(new remote.MenuItem({
                label: '在 Finder 中显示',
                click: () => {
                    remote.shell.showItemInFolder(path.join(this.pwd, item.name))
                },
            }))

            // if (action === 'remote') fileMenu.append(new remote.MenuItem({
            //     label: '在系统终端中打开',
            //     click: () => {
            //     },
            // }))

            fileMenu.append(new remote.MenuItem({ type: 'separator' }))

            fileMenu.append(new remote.MenuItem({
                label: action === 'local' ? '上传至远程目录' : '下载到本地目录',
                click: () => {
                    // 起始路径
                    const fromPath = action === 'local'
                        ? path.join(this.pwd, item.name)
                        : path.posix.join(this.pwd, item.name)
                    // 目标路径
                    const distPath = action === 'local'
                        ? path.posix.join(this.pwdRemote, item.name)
                        : path.join(this.pwdLocal, item.name)
                    // 调用传输
                    this.transmit(action === 'local' ? 'upload' : 'download', fromPath, distPath)
                },
            }))

            // TODO: 根据后缀过滤不可编辑文件
            // 不可编辑文件
            // exe / jpg / dmg / zip / rar / 7z / tar / tgz / mp3 ......
            // 可编辑文件
            // conf / js / php / css / go / json / md
            if (item.type === '-') {
                const editorList = []
                this.$store.getters['editor/INSTALLED']().forEach(editor => {
                    editorList.push({
                        label: editor.name,
                        click: async () => {
                            // TODO: 提示优化
                            if (item.size > 10 * 1024 ** 2) return this.alert('大于 10MB 文件请离线编辑')
                            await this.editFile(action, item, editor)
                        }
                    })
                })
                fileMenu.append(new remote.MenuItem({
                    label: '编辑',
                    submenu: editorList,
                }))
            }

            fileMenu.append(new remote.MenuItem({ type: 'separator' }))

            fileMenu.append(new remote.MenuItem({
                label: '重新命名',
                click: () => this.renameOpen(item, index),
            }))

            fileMenu.append(new remote.MenuItem({
                label: '删除',
                click: () => this.removeFile(action, item),
            }))

            fileMenu.append(new remote.MenuItem({ type: 'separator' }))

            fileMenu.append(new remote.MenuItem({
                label: '显示隐藏文件',
                type: 'checkbox',
                checked: this.showHideFile,
                click: () => this.showHideFile = !this.showHideFile,
            }))

            item.fileMenu = fileMenu
        }

        item.fileMenu.popup({
            callback: () => this.fileFocus(),
        })
    },
    /**
     * 显示容器右键菜单
     * @method
     */
    showContainerMenu() {
        this.containerMenu.popup()
    },
    /**
     * 返回上级目录
     * @method
     */
    backPrevDir() {
        this.getFileList('..', '', path.basename(this.pwd))
    },
    /**
     * 使用默认方式打开本地文件
     * @method
     * @param   {Object}    item         目标目录对象
     */
    openFileByDefault(item) {
        this.$q.electron.remote.shell.openPath(path.join(this.pwd, item.name))
            .then(() => {
            })
            .catch(() => {
            })
    },
}
