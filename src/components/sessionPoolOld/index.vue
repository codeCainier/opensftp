<template>
    <div class="session-pool full-height">
        <!-- 会话池控制中心 -->
        <div class="pool-control q-mt-xs q-mb-sm">
            <div class="row">
                <div class="session-num" :class="{ active: !showSearch }">
                    <span class="text-h6 text-weight-light q-mx-xs">{{ $store.state.session.pool.length }}</span>
                    <span>会话</span>
                </div>
                <div class="search-input-container" :class="{ active: showSearch }">
                    <input type="text"
                           v-model.trim="searchValue"
                           ref="search-input"
                           class="search-input"
                           placeholder="搜索会话"
                           spellcheck="false"
                           @input="searchSession"
                           @keydown.down="searchResFocus">
                </div>
                <q-space/>
                <q-btn class="btn-control btn-search"
                       :icon="showSearch ? 'close' : 'search'"
                       flat round
                       size="sm"
                       @click="showSearch = !showSearch"/>
                <q-btn class="btn-control btn-add"
                       icon="add"
                       flat round
                       size="sm">
                    <q-menu content-class="bg-transparent">
                        <q-list class="bg-aero" dense style="min-width: 120px">
                            <q-item clickable v-close-popup>
                                <q-item-section>新建会话</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="createSessionDir">
                                <q-item-section>新建目录</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </div>
        </div>
        <!-- 会话池列表 -->
        <div class="full-height scroll">
            <transition-group name="flip-list" tag="div">
                <div v-for="(item, index) in $store.state.session.pool"
                     v-show="itemIsShow(item.id)"
                     :key="item.id"
                     class="list-item">
                    <!-- 拖动辅助线 -->
                    <div class="separator" :class="{ active : dragMoveBefore === item.id }">
                        <hr/>
                    </div>
                    <!-- 会话项目 -->
                    <div class="session-item"
                         tabindex="0"
                         draggable="true"
                         :ref="'session-item-' + item.id"
                         :class="{
                             'focus-temp'  : renameItem.id === item.id || openMenu === index,
                             'drag-enter'  : item.type === 'dir' && dragTargetId === item.id,
                         }"
                         @click            ="sessionFocus(index)"
                         @click.right      ="showSessionMenu(item, index)"
                         @dblclick         ="login(item)"
                         @dragstart        ="dragStart($event, item, index)"
                         @dragover.prevent ="dragOver($event, item, index, $store.state.session.pool)"
                         @dragleave        ="dragLeave($event, item, index)"
                         @drop             ="drop($event, item, index)"
                         @dragend          ="dragLeave($event, item, index)"
                         @keydown.enter    ="login(item)"
                         @keydown.space    ="showSessionPoster(item)"
                         @keydown.f2       ="renameOpen(item, index)"
                         @keydown.delete   ="removeItem(item)"
                         @keydown.alt.r    ="showAttr(item)"
                         @keydown.up       ="moveFocus('up')"
                         @keydown.down     ="moveFocus('down')">
                        <q-btn class="session-icon" :icon="item.type === 'dir' ? 'folder' : 'dns'" flat size="sm"/>
                        <div class="session-name">
                            <div v-show="renameItem.id !== item.id" class="text-name">{{ itemName(item) }}</div>
                            <input v-model="renameItem.name"
                                   v-show="renameItem.id === item.id"
                                   type="text"
                                   :ref="'rename-input-' + index"
                                   class="rename-input no-outline no-border"
                                   :placeholder="item.host"
                                   spellcheck="false"
                                   @blur="renameClose"
                                   @click.stop=""
                                   @dblclick.stop=""
                                   @keydown.esc="renameCancel(index)"
                                   @keydown.stop.delete=""
                                   @keydown.stop.space=""
                                   @keydown.stop.up=""
                                   @keydown.stop.down=""
                                   @keydown.stop.alt.r=""
                                   @keydown.stop.enter="renameFinish(index)"
                                   @compositionstart="renameItem.preventKeydown = true"
                                   @compositionend="renameItem.preventKeydown = false">
                        </div>
                        <div class="session-site">{{ loading === item.id ? '正在连接...' : item.host }}</div>
                    </div>
                    <!-- 目录项目 -->
                    <div class="dir-item"></div>
                </div>
            </transition-group>
        </div>
        <attr-panel ref="attr-panel"/>
        <session-poster ref="session-poster"/>
    </div>
</template>

<script>
import attrPanel from 'src/components/sessionPool/attrPanel'
import sessionPoster from 'src/components/sessionPoster'

export default {
    name: 'SessionPool',
    components: {
        'attr-panel': attrPanel,
        'session-poster': sessionPoster,
    },
    data() {
        return {
            loading          : null,
            selected         : null,
            openMenu         : null,
            renameItem       : {},
            sessionMenu      : null,
            sessionMenuItem  : null,
            sessionMenuIndex : null,
            showSearch       : false,
            searchValue      : '',
            sessionFilter    : [],
            dragTargetId     : null,
            dragMoveBefore   : null,
        }
    },
    computed: {
        itemName() {
            return item => item.name || item.host
        },
        itemIsShow() {
            return id => {
                // 搜索模式关闭时全部进行显示
                if (!this.showSearch) return true
                // 搜索模式开启，搜索结果符合时进行显示
                if (this.sessionFilter.find(item => item.id === id)) return true
            }
        },
    },
    watch: {
        showSearch(newVal) {
            if (!newVal) {
                this.searchValue = ''
                this.sessionFilter = []
            }
            if (newVal) setTimeout(() => {
                this.$refs['search-input'].focus()
            }, 300)
        }
    },
    methods: {
        // 连接会话
        login(item) {
            this.loading = item.id
            this.$store.dispatch('session/LOGIN', item)
                .then(() => this.$router.push({ path: '/session' }))
                .catch(err => this.confirm(err))
                .finally(() => this.loading = false)
        },
        // 重命名开始
        renameOpen(item, index) {
            this.renameItem = this.tools.clone(item)
            this.renameItem.oldname = this.renameItem.name
            // TODO: nextTick 无效
            setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
        },
        // 重命名完成
        renameFinish(index) {
            // 防止输入法回车触发完成事件
            if (!this.renameItem.preventKeydown) this.$refs['rename-input-' + index][0].blur()
        },
        // 重命名结束
        renameClose() {
            this.$store.commit('session/UPDATE', {
                id: this.renameItem.id,
                updateItem: {
                    name: this.renameItem.name,
                },
            })
            this.renameItem = {}
            this.sessionFocus()
        },
        // 重命名取消
        renameCancel(index) {
            this.renameItem.name = this.renameItem.oldname
            this.$refs[`rename-input-${index}`][0].blur()
        },
        // 删除项目
        removeItem(item) {
            this.tools.confirm({
                message: `确定要删除会话 ${item.name} 吗？`,
                confirm: () => {
                    this.$store.commit('session/DELETE', item.id)
                },
                cancel: () => {}
            })
        },
        // 显示属性
        showAttr(item) {
            this.$refs['attr-panel'].open(item)
        },
        // 移动聚焦元素
        moveFocus(action) {
            if (action === 'up' && this.selected !== 0) this.selected -= 1
            if (action === 'down' && this.selected !== this.$store.state.session.pool.length - 1) this.selected += 1
            this.sessionFocus()
        },
        // 会话聚焦
        sessionFocus(index = this.selected) {
            this.selected = index
            this.openMenu = null
            this.$nextTick(() => {
                try {
                    // FIXME: 不适用于树状结构
                    this.$refs[`session-item-${this.selected}`][0].focus()
                } catch (error) {
                }
            })
        },
        // 创建会话菜单
        createSessionMenu() {
            const { remote } = this.$q.electron
            const sessionMenu = new remote.Menu()

            sessionMenu.append(new remote.MenuItem({
                label: '连接',
                click: () => this.login(this.sessionMenuItem),
            }))

            sessionMenu.append(new remote.MenuItem({ type: 'separator' }))

            sessionMenu.append(new remote.MenuItem({
                label: '删除',
                click: () => this.removeItem(this.sessionMenuItem),
            }))

            sessionMenu.append(new remote.MenuItem({
                label: '重命名',
                click: () => this.renameOpen(this.sessionMenuItem, this.sessionMenuIndex),
            }))

            sessionMenu.append(new remote.MenuItem({ type: 'separator' }))

            sessionMenu.append(new remote.MenuItem({
                label: '卡片展示',
                click: () => this.showSessionPoster(this.sessionMenuItem),
            }))

            sessionMenu.append(new remote.MenuItem({
                label: '高级设置',
                click: () => this.showAttr(this.sessionMenuItem),
            }))

            this.sessionMenu = sessionMenu
        },
        // 显示文件右键菜单
        showSessionMenu(item, index) {
            this.selected         = index
            this.openMenu         = item.name
            this.sessionMenuItem  = item
            this.sessionMenuIndex = index
            this.sessionMenu.popup({
                callback: () => this.sessionFocus(),
            })
        },
        // 显示会话卡片展示
        showSessionPoster(item) {
            this.$refs['session-poster'].open(item)
        },
        // 搜索会话
        searchSession() {
            const value = this.searchValue.trim()
            // 搜索内容为空
            if (!value) return this.sessionFilter = []
            this.sessionFilter = this.$store.state.session.pool.filter(item => {
                if (item.name.includes(value)) return true
                if (item.host.includes(value)) return true
                if (item.port.includes(value)) return true
            })
        },
        // 搜素结果获取焦点
        searchResFocus() {
            if (!this.sessionFilter.length) return
            this.selected = this.$store.state.session.pool.findIndex(item => item.id === this.sessionFilter[0].id)
            this.sessionFocus()
        },
        // 拖动开始
        dragStart(event, item, index) {
            const dragItem = this.tools.clone(item)

            delete dragItem.fileMenu

            this.selected = index

            event.dataTransfer.setData('info', JSON.stringify(dragItem))
            event.dataTransfer.setDragImage(this.$refs[`session-item-${item.id}`][0],0,0)
        },
        dragOver(event, item, index, group) {
            // 鼠标位于元素 Y 轴坐标
            const { layerY } = event
            // 分界阈值
            const { clientHeight } = this.$refs[`session-item-${item.id}`][0]
            // 上
            if (layerY <= clientHeight * (1/3)) {
                this.dragMoveBefore = item.id
                this.dragTargetId = null
                return
            }
            // 下
            if (layerY >= clientHeight * (2/3)) {
                if (index !== group.length - 1) {
                    this.dragMoveBefore = group[index + 1].id
                }
                if (index === group.length - 1) {
                    this.dragMoveBefore = item.id
                }
                this.dragTargetId = null
                return
            }
            // 中
            if (item.type === 'dir') {
                this.dragMoveBefore = null
                this.dragTargetId = item.id
            }
        },
        dragLeave(event, item, index) {
            this.dragTargetId = null
            this.dragMoveBefore = null
        },
        drop(event, item, index) {
            // 不允许拖动到自身
            if (this.selected === index) return
            const info = JSON.parse(event.dataTransfer.getData('info'))

            if (this.dragTargetId !== null) {

            }
            if (this.dragMoveBefore) {
                this.$store.commit('session/MOVE', {
                    info,
                    target: info.id,
                    position: this.dragMoveBefore,
                })
            }
        },
        createSessionDir() {
            this.$store.commit('session/CREATE_DIR', {})
        },
    },
    created() {
        this.createSessionMenu()
    },
};
</script>

<style scoped lang="sass">
.body--light
    .session-pool
        .pool-control .search-input
            background: rgba(#FFFFFF, .7)
            color: $dark
            &::-webkit-input-placeholder
                color: $dark
    .session-item
        .session-icon
            color: $primary

.body--dark
    .pool-control .search-input
        background: #666666
        color: #FFFFFF
        &::-webkit-input-placeholder
            color: #FFFFFF
    .session-item
        .session-icon
            color: $positive

.session-pool
    display: flex
    flex-direction: column
    .pool-control
        position: relative
        .session-num
            position: absolute
            height: 30px
            line-height: 30px
            opacity: 0
            visibility: hidden
            transform: translateX(-10px)
            transition: all .3s
            &.active
                opacity: 1
                visibility: visible
                transform: translateX(0)
        .search-input-container
            position: absolute
            opacity: 0
            visibility: hidden
            transform: translateX(10px)
            transition: all .3s
            width: calc(100% - 35px)
            height: 100%
            &.active
                opacity: 1
                visibility: visible
                transform: translateX(0)
            .search-input
                margin: 0
                padding: 0 10px
                border: 0
                outline: none
                width: 100%
                height: 100%
                border-radius: 30px
                transition: all .3s
                &:focus
                    box-shadow: $shadow-10
        .btn-control
            width: 30px
            height: 30px
            margin-left: 5px

.separator
    padding: 1px 0
    opacity: 0
    hr
        margin: 0
        border: 0
        height: 1px
        background: #FFFFFF
    &.active
        opacity: 1

.list-item
    .session-item
        position: relative
        display: flex
        flex-direction: row
        border-radius: 4px
        position: relative
        outline: none
        transition: all .3s
        &::before,&::after
            position: absolute
            content: ''
            width: 200%
            height: 1px
            background: #FFFFFF
            left: -50%
            opacity: 0
        &::before
            top: 0
            transform: scale(.5)
        &::after
            bottom: 0
            transform: scale(.5)
        &:hover
            background: rgba($primary, .3)
        &:focus,&.focus-temp
            background: $primary
            color: #FFFFFF
            .session-icon
                color: #FFFFFF
            .session-site
                color: #FFFFFF
        &.drag-enter
            background: rgba($primary, .3)
            transform: scale(1.05)

        &.move-before::before,
        &.move-after::after
            opacity: 1

    .session-icon
        width: 30px
        height: 30px
        margin: 3px

    .session-name
        line-height: 36px
        width: 100%
        .text-name
            padding: 0 2px
        input
            width: 100%
            padding: 0 2px

    .session-site
        line-height: 36px
        font-size: .8rem
        color: #999999
        min-width: 120px
        padding-right: 10px
        text-align: right
        overflow: hidden
        text-overflow: ellipsis

.flip-list-move
    transition: transform .3s
</style>
