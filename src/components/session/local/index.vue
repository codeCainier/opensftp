<template>
    <div class="fs-system">
        <!-- Loading -->
        <q-inner-loading :showing="loading" style="z-index: 100">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        <!-- 文件系统 - 控制栏 -->
        <div class="fs-control">
            <label>
                <input class="pwd-input" type="text"
                       spellcheck="false"
                       v-model.trim="pwdInput"
                       @keydown.enter="getFileList(null, pwdInput)">
            </label>
            <div class="btn-group">
                <button type="button" v-ripple class="btn-enter" @click="getFileList(null, pwdInput)">
                    <q-icon name="chevron_right"/>
                    <q-tooltip :offset="[0, 10]">转到</q-tooltip>
                </button>
                <button type="button" v-ripple class="btn-enter" @click="getFileList('.')">
                    <q-icon name="refresh"/>
                    <q-tooltip :offset="[0, 10]">刷新</q-tooltip>
                </button>
            </div>
        </div>
        <!-- 文件系统 - 标题栏 -->
        <div class="fs-head">
            <div class="item select-all"></div>
            <div class="row item name" v-ripple @click="sortSet('name')">
                <div>文件名称</div>
                <q-space/>
                <q-icon v-show="sortBy === 'name'"
                        class="icon q-mr-sm"
                        :class="{ desc : sortMode === 'desc' }"
                        name="ion-ios-arrow-up"/>
            </div>
            <div class="row item size" v-ripple @click="sortSet('size')">
                <div>文件大小</div>
                <q-space/>
                <q-icon v-show="sortBy === 'size'"
                        class="icon q-mr-sm"
                        :class="{ desc : sortMode === 'desc' }"
                        name="ion-ios-arrow-up"/>
            </div>
            <div class="row item date" v-ripple @click="sortSet('date')">
                <div>修改日期</div>
                <q-space/>
                <q-icon v-show="sortBy === 'date'"
                        class="icon q-mr-sm"
                        :class="{ desc : sortMode === 'desc' }"
                        name="ion-ios-arrow-up"/>
            </div>
            <!--<div class="item owner">所有者</div>-->
            <!--<div class="item group">群组</div>-->
        </div>
        <!-- 文件系统 - 文件列表 -->
        <div class="fs-body full-height">
            <q-scroll-area ref="scrollArea"
                           class="fs-scroll-area full-height"
                           :class="{ 'drag-enter': dragEnterItem === '.' }"
                           @click.native="selected = null"
                           @dragover.native.prevent="dragOver({ name: '.' })"
                           @dragleave.native="dragLeave"
                           @drop.native="dropFile($event)">
                <div class="q-pl-sm q-pt-sm q-pb-xl q-pr-md">
                    <!-- File .. -->
                    <div v-show="pwd !== '/'"
                         class="fs-item" tabindex="0"
                         :class="{ 'drag-enter': dragEnterItem === '..' }"
                         @click="selected = null"
                         @dblclick="getFileList('..')"
                         @keydown.exact.enter="getFileList('..')"
                         @dragover.prevent.stop="dragOver({ name: '..' })"
                         @dragleave.stop="dragLeave">
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
                         @click.right="showFileMenu(item, index)"
                         @dblclick="dirEnter(item)"
                         @dragstart="dragStart($event, item, index, 'local')"
                         @dragover.prevent.stop="dragOver(item)"
                         @dragleave.stop="dragLeave"
                         @drop.stop="dropFile($event, item)"
                         @dragend="dragEnd"
                         @keydown.enter="dirEnter(item)"
                         @keydown.exact.delete="removeFile('local', item)"
                         @keydown.f2="renameOpen(item, index)"
                         @keydown.prevent.up="moveFocus('up')"
                         @keydown.prevent.down="moveFocus('down')">
                        <div class="item icon">
                            <img :src="getFileIcon(item)" alt="">
                        </div>
                        <div class="item name">
                            <div v-show="renameItem.name !== item.name">{{ item.name }}</div>
                            <label>
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
                            </label>
                        </div>
                        <div class="item size">{{ fileSize(item) }}</div>
                        <div class="item date">{{ fileCreatedTime(item.date) }}</div>
                        <!--div class="item owner">{{ item.owner }}</div>-->
                        <!--<div class="item group">{{ item.group }}</div>-->
                        <!-- 右键菜单 -->
                        <!--<menu-list action="local"-->
                        <!--           :listItem="item"-->
                        <!--           :showHideFile="showHideFile"-->
                        <!--           @show="selected = openMenu = item.name"-->
                        <!--           @close="fileFocus(index)"-->
                        <!--           @upload="uploadByMenu(item)"-->
                        <!--           @rename="renameOpen(item, index)"-->
                        <!--           @remove="removeFile('local', item)"-->
                        <!--           @mkdir="mkdirLocal"-->
                        <!--           @edit="editFile('local', item, $event)"-->
                        <!--           @write-file="writeFileLocal"-->
                        <!--           @refresh="getFileList('.')"-->
                        <!--           @show-hide="showHideFile = !showHideFile"/>-->
                    </div>
                </div>
            </q-scroll-area>
            <!-- 拖动安全区域 -->
            <div class="drag-safe-area"
                 :class="{ active: dragEnterItem !== null }"
                 @dragover.prevent="dragOver({ name: '.' })"
                 @dragleave="dragLeave"
                 @drop="dropFile($event)">
            </div>
            <!-- 空白处右键菜单 -->
            <pwd-menu ref="pwdMenu" action="local"
                      :showHideFile="showHideFile"
                      @before-show="pwdMenuBeforeShow"
                      @mkdir="mkdirLocal"
                      @write-file="writeFileLocal"
                      @refresh="getFileList('.')"
                      @show-hide="showHideFile = !showHideFile"/>
        </div>
    </div>
</template>

<script>
/**
 * SFTP Local 本地文件系统
 * Linux 思想，一切皆文件
 */
import path      from 'path'
import menuList  from 'src/components/session/menuList'
import iconMatch from 'src/utils/iconMatch'
import pwdMenu   from 'src/components/session/pwdMenu'
import session   from 'src/core/Session'

export default {
    name: 'SFTPLocal',
    components: {
        'menu-list': menuList,
        'pwd-menu' : pwdMenu,
    },
    props: {
        pwdRemote: String,
        connectId: String,
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
            pwd: '',
            // pwd 输入框
            pwdInput: '',
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
            // 被拖动文件名称
            dragFileName: null,
            // 拖动进入元素
            dragEnterItem: null,
            // 拖动进入计时器
            dragIntoTimer: null,
            // 排序字段
            sortBy: 'name',
            // 排序方式
            sortMode: 'asc',
            fileMenu: null,
            fileMenuItem: null,
            fileMenuIndex: null,
        }
    },
    watch: {
        pwd(newVal) {
            this.pwdInput = newVal
            this.$emit('update-pwd', newVal)
        },
        dragEnterItem(newVal) {
            clearTimeout(this.dragIntoTimer)
            if (newVal === null) return
            if (newVal === '.')  return
            if (newVal === this.dragFileName) return

            this.dragIntoTimer = setTimeout(() => {
                this.getFileList(newVal)
            }, 1000)
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
            this.connect.renameLocal(path.join(this.pwd, this.renameItem.name), path.join(this.pwd, this.renameItem.newName))
                .then(() => {
                    this.getFileList('.', null, this.renameItem.newName)
                })
                .catch(err => {
                    this.tools.confirm(err)
                    this.loading = false
                })
        },
        // 读取目录下文件列表
        getFileList(dirname, pathName, focusFile) {
            this.loading = true

            const cwd = pathName || path.join(this.pwd, dirname)

            this.connect.listLocal(cwd)
                .then(list => {
                    this.list = this.sort(list)
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
        // 拖动完成
        dropFile(event, item) {
            this.dragEnterItem = null

            if (item && item.type === '-') return

            const action  = event.dataTransfer.getData('action')
            const info    = JSON.parse(event.dataTransfer.getData('info'))
            const oldPath = event.dataTransfer.getData('oldPath')
            const newPath = path.join(this.pwd, item ? item.name : '', info.name)

            // 若文件来自 local 视为移动操作
            if (action === 'local')  this.mvFile('local', oldPath, newPath)
            // 若文件来自 remote，视为下载操作
            if (action === 'remote') this.transmit('download', oldPath, newPath)
        },
    },
    created() {
        this.createFileMenu('local')
        this.pwd = this.$q.electron.remote.app.getPath('home')
        this.getFileList('.')
    }
}
</script>

<style lang="sass" scoped>
    @import "/src/css/fs.sass"
</style>
