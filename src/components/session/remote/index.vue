<template>
    <div class="fs-system">
        <!-- Loading -->
        <q-inner-loading :showing="loading" style="z-index: 100">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        <!-- 文件系统 - 控制栏 -->
        <div class="fs-control">
            <input class="pwd-input" type="text"
                   spellcheck="false"
                   v-model.trim="pwdInput"
                   @keydown.enter="getFileList(null, pwdInput)">
            <div class="btn-group">
                <button type="button" v-ripple class="btn-enter" @click="getFileList(null, pwdInput)">
                    <q-icon name="chevron_right"/>
                </button>
                <button type="button" v-ripple class="btn-enter" @click="getFileList('.')">
                    <q-icon name="refresh"/>
                </button>
            </div>
        </div>
        <!-- 文件系统 - 标题栏 -->
        <div class="fs-head">
            <div class="item select-all"></div>
            <div class="item name">文件名称</div>
            <div class="item size">文件大小</div>
            <div class="item date">修改日期</div>
            <!--<div class="item owner">所有者</div>-->
            <!--<div class="item group">群组</div>-->
        </div>
        <!-- 文件系统 - 文件列表 -->
        <div class="fs-body full-height">
            <q-scroll-area ref="scrollArea" class="full-height"
                           @click.native="selected = null"
                           @dragover.native.prevent="dragOver($event)"
                           @dragenter.native=""
                           @dragleave.native="dragLeave"
                           @drop.native="dropFile($event)">
                <div class="q-pl-sm q-pt-sm q-pb-xl q-pr-md">
                    <!-- File .. -->
                    <div v-show="pwd !== '/'"
                         class="fs-item" tabindex="0"
                         @click="selected = null"
                         @dblclick="getFileList('..')"
                         @keydown.exact.enter="getFileList('..')">
                        <div class="item icon">
                            <img src="~/assets/sftp-icons/folder-other.svg" alt="">
                        </div>
                        <div class="item name">..</div>
                    </div>
                    <!-- File List -->
                    <div v-for="(item, index) in list"
                         class="fs-item"
                         tabindex="0"
                         draggable="true"
                         :ref="'file-item-' + index"
                         :key="item.name"
                         :class="{
                             selected: selected === index,
                             hidden: hideItem(item),
                             'drag-enter': dragEnterItem === item.name,
                             'focus-temp': openMenu === item.name || renameItem.name === item.name,
                         }"
                         @click.stop="fileFocus(index)"
                         @dblclick="dirEnter(item)"
                         @dragstart="dragStart($event, item, index)"
                         @dragover.prevent.stop="dragOver($event, item)"
                         @dragenter.stop=""
                         @dragleave.stop="dragLeave"
                         @drop.stop="dropFile($event, item)"
                         @dragend="dragEnd($event, item)"
                         @keydown.enter="dirEnter(item)"
                         @keydown.exact.delete="removeFile(item)"
                         @keydown.f2="renameOpen(item, index)"
                         @keydown.prevent.up="moveFocus('up')"
                         @keydown.prevent.down="moveFocus('down')">
                        <div class="item icon">
                            <img :src="getFileIcon(item)" alt="">
                        </div>
                        <div class="item name">
                            <div v-show="renameItem.name !== item.name">{{ item.name }}</div>
                            <input v-model="renameItem.newName"
                                   v-show="renameItem.name === item.name"
                                   type="text"
                                   tabindex="0"
                                   :ref="'rename-input-' + index"
                                   class="rename-input no-outline no-border no-padding"
                                   :placeholder="item.name"
                                   spellcheck="false"
                                   @blur="renameClose(index)"
                                   @click.stop=""
                                   @dblclick.stop=""
                                   @keydown.esc="renameCancel(index)"
                                   @keydown.stop.delete=""
                                   @keydown.stop.up=""
                                   @keydown.stop.down=""
                                   @keydown.stop.alt.r=""
                                   @keydown.stop.enter="$refs[`rename-input-${index}`][0].blur()">
                        </div>
                        <div class="item size">{{ fileSize(item) }}</div>
                        <div class="item date">{{ fileCreatedTime(item.date) }}</div>
                        <!--<div class="item owner">{{ item.owner }}</div>-->
                        <!--<div class="item group">{{ item.group }}</div>-->
                        <!-- 右键菜单 -->
                        <menu-list action="remote"
                                   :listItem="item"
                                   :showHideFile="showHideFile"
                                   @show="selected = openMenu = item.name"
                                   @close="fileFocus(index)"
                                   @download="download(item)"
                                   @rename="renameOpen(item, index)"
                                   @remove="removeFile(item)"
                                   @mkdir="mkdirRemote"
                                   @write-file="writeFileRemote"
                                   @refresh="getFileList('.')"
                                   @show-hide="showHideFile = !showHideFile"/>
                    </div>
                </div>
            </q-scroll-area>
            <pwd-menu ref="pwdMenu" action="local"
                      :showHideFile="showHideFile"
                      @before-show="pwdMenuBeforeShow"
                      @mkdir="mkdirRemote"
                      @write-file="writeFileRemote"
                      @refresh="getFileList('.')"
                      @show-hide="showHideFile = !showHideFile"/>
        </div>
    </div>
</template>

<script>
/**
 * SFTP Remote / Linux 思想，一切皆文件
 */
import path      from 'path'
import menuList  from 'src/components/session/menuList'
import iconMatch from 'src/utils/iconMatch'
import pwdMenu   from 'src/components/session/pwdMenu'
import session   from 'src/core/Session'

export default {
    name: 'SFTPRemote',
    components: {
        'menu-list': menuList,
        'pwd-menu' : pwdMenu,
    },
    props: {
        connect: Object,
    },
    data() {
        return {
            session: null,
            // 是否显示隐藏项目
            showHideFile: false,
            // 全选
            selectAll: false,
            // 当前所在目录
            pwd: this.$store.state.sftp.pwdRemote,
            // pwd 输入框
            pwdInput: this.$store.state.sftp.pwdRemote,
            // 文件列表
            list: [],
            // loading 状态
            loading: false,
            // 当前 Focus 文件
            selected: null,
            // 当前开启右键菜单的文件名称
            openMenu: null,
            // 重命名项目
            renameItem: {},
            // 拖动进入元素
            dragEnterItem: null,
        }
    },
    watch: {
        pwd(newVal) {
            this.pwdInput = newVal
            this.$store.commit('sftp/CHANGE_PWD_REMOTE', newVal)
        },
        '$store.state.sftp.refreshListenerRemote': function () {
            this.getFileList('.')
        },
    },
    computed: {
        hideItem() {
            // 文件名以 . 开头为隐藏文件
            return item => item.name.startsWith('.') && !this.showHideFile
        },
        fileSize() {
            // 只有文件类型才有文件大小概念
            return item => item.type === 'd' ? '-' : this.tools.formatFlow(item.size, 1024, 'B', 1024, 0)
        },
        getFileIcon() {
            return item => iconMatch(item)
        },
        fileCreatedTime() {
            return time => this.tools.formatDate(time, 'MM-dd HH:mm')
        },
    },
    methods: {
        ...session,
        // 进入目录
        dirEnter(item) {
            if (['d', 'l'].includes(item.type)) this.getFileList(item.name)
        },
        // 下载
        download(item, localPath = this.$store.state.sftp.pwdLocal) {
            this.connect.statLocal(path.join(localPath, item.name))
                .then(() => {
                    this.tools.confirm({
                        message: `${item === '-' ? '文件' : '目录'} ${item.name} 已存在，是否进行覆盖？`,
                        confirm: () => {
                            this.sftpDownload(item, localPath)
                        },
                        cancel: () => {
                        },
                    })
                })
                .catch(() => {
                    this.sftpDownload(item, localPath)
                })
        },
        // SFTP 下载
        async sftpDownload(item, localPath) {
            this.$store.commit('transfer/TASK_INIT', 'download')

            await this.connect.download(
                path.posix.join(this.pwd, item.name),
                path.join(localPath, item.name),
                this.progressStep,
            )

            if (localPath === this.$store.state.sftp.pwdLocal) this.$store.commit('sftp/REFRESH_FS_LOCAL')

            this.notify(`${item.type === '-' ? '文件' : '目录'} ${item.name} 下载成功`)
            this.$store.commit('transfer/TASK_CLOSE')
        },
        // 更新传输进度
        progressStep(action, params) {
            if (action === 'download') {
                const { pathname, saved, total } = params
                this.$store.commit('transfer/TASK_UPDATE', { pathname, saved, total })
            }
            if (action === 'finish') {
                this.$store.commit('transfer/TASK_FINISH')
            }
        },
        // 重命名开始
        renameOpen(item, index) {
            this.renameItem = this.tools.clone(item)
            this.renameItem.newName = this.renameItem.name
            // TODO: nextTick 无效
            setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
        },
        // 重命名结束
        renameClose(index) {
            // 新名称与旧名称相同 或 新名称为空 相当于取消重命名
            if (this.renameItem.name === this.renameItem.newName || !this.renameItem.newName) {
                this.renameItem = {}
                this.fileFocus()
                return
            }
            // 新名称存在
             if (this.list.filter(item => item.name === this.renameItem.newName).length === 1) {
                // TODO: 由 keydown enter 触发的事件，会影响 confirm 组件
                return setTimeout(() => {
                    this.tools.confirm({
                        message: `已存在文件 ${this.renameItem.newName}`,
                        confirm: () => {
                            setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
                        }
                    })
                }, 500);
            }
            // 重命名
            this.loading = true
            this.connect.renameRemote(path.posix.join(this.pwd, this.renameItem.name), path.posix.join(this.pwd, this.renameItem.newName))
                .then(() => {
                    this.getFileList('.', null, this.renameItem.newName)
                })
                .catch(err => {
                    this.tools.confirm(err)
                    this.loading = false
                })
        },
        // 重命名取消
        renameCancel(index) {
            this.renameItem = {}
            this.$refs[`rename-input-${index}`][0].blur()
            this.fileFocus()
        },
        // 删除文件
        removeFile(item) {
            // TODO: 弹出删除对话框时，文件 Focus 状态应使用 class 补充
            this.tools.confirm({
                message: `您确定要删除 ${item.name} 吗？注意，删除无法恢复！`,
                confirm: () => {
                    this.loading = true
                    this.connect.rmRemote(path.posix.join(this.pwd, item.name))
                        .then(() => {
                            this.getFileList('.')
                        })
                        .catch(err => {
                            this.tools.confirm(err)
                            this.loading = false
                        })
                },
                cancel: () => {},
            })
        },
        // 读取目录下文件列表
        getFileList(dirname = '.', pathName, focusFile) {
            this.loading = true

            const cwd = pathName || path.posix.join(this.pwd, dirname)

            this.connect.listRemote(cwd)
                .then(list => {
                    this.list = list
                    // 更新最后访问目录
                    this.pwd = cwd
                    // 若指定聚焦文件
                    if (focusFile) {
                        this.selected = this.list.findIndex(item => item.name === focusFile)
                    } else {
                        // 默认不选择元素
                        this.selected = null
                        document.activeElement.blur()
                    }
                    // 清除重命名元素
                    this.renameItem = {}
                    this.fileFocus()
                    this.$refs.scrollArea.setScrollPosition(0)
                    this.loading = false
                })
                .catch(err => {
                    this.loading = false
                    this.pwdInput = this.pwd
                    this.tools.confirm(err)
                })
        },
        // 选择文件
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
        // 移动聚焦元素
        moveFocus(action) {
            if (action === 'up' && this.selected !== 0) this.selected -= 1
            if (action === 'down' && this.selected !== this.list.length - 1) this.selected += 1
            // 若不显示隐藏文件，判断当前 selected 元素是否为隐藏文件
            // 若为隐藏文件，则递归移动聚焦元素
            if (!this.showHideFile && this.hideItem(this.list[this.selected])) return this.moveFocus(action)
            this.fileFocus()
        },
        // 开始拖动
        dragStart(event, item, index) {
            this.selected = index
            event.dataTransfer.setData('action', 'remote')
            event.dataTransfer.setData('info', JSON.stringify(item))
            event.dataTransfer.setData('oldPath', path.posix.join(this.pwd, item.name))
            event.dataTransfer.setDragImage(this.$refs[`file-item-${index}`][0],0,0)
        },
        // 拖动进入
        dragEnter(event, item) {
            this.dragEnterItem = item ? item.name : null
        },
        // 拖动经过
        dragOver(event, item) {
            this.dragEnterItem = item ? item.name : null
        },
        // 拖动完成
        dropFile(event, item) {
            this.dragEnterItem = null

            if (item && item.type === '-') return

            const action  = event.dataTransfer.getData('action')
            const info    = JSON.parse(event.dataTransfer.getData('info'))
            const oldPath = event.dataTransfer.getData('oldPath')
            const newPath = path.posix.join(this.pwd, item ? item.name : '', info.name)

            console.log(oldPath)
            console.log(newPath)

            // 若文件来自 remote 视为移动操作
            if (action === 'remote') {
                this.mvFile('remote', oldPath, newPath)
            }
            // 若文件来自 local，视为上传操作
            if (action === 'local') {
            }
        },
        // 拖动结束
        dragEnd(event, item) {
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
    },
    created() {
        // this.session = Session(this)
        this.getFileList()
    },
}
</script>

<style lang="sass" scoped>
    @import "/src/css/fs.sass"
</style>
