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
                    <q-menu>

                    </q-menu>
                </q-btn>
            </div>
        </div>
        <!-- 会话池列表 -->
        <q-scroll-area class="full-height">
            <q-list dense>
                <q-item v-for="(item, index) in $store.state.session.pool"
                        v-show="sessionIsShow(item.id)"
                        :key="item.id"
                        :ref="'session-item-' + index"
                        :class="{ 'focus-temp': renameItem.id === item.id || openMenu === index }"
                        class="list-item cursor-inherit"
                        clickable v-ripple
                        draggable="true"
                        @click          ="sessionFocus(index)"
                        @click.right    ="showSessionMenu(item, index)"
                        @dblclick       ="login(item)"
                        @dragstart      ="dragStart($event, item, index)"
                        @keydown.enter  ="login(item)"
                        @keydown.space  ="showSessionPoster(item)"
                        @keydown.f2     ="renameOpen(item, index)"
                        @keydown.delete ="removeItem(item)"
                        @keydown.alt.r  ="showAttr(item)"
                        @keydown.up     ="moveFocus('up')"
                        @keydown.down   ="moveFocus('down')">
                    <q-item-section avatar>
                        <q-avatar rounded size="md">
                            <q-spinner-gears v-if="loading === item.id" class="session-icon" />
                            <q-btn v-else flat
                                   class="session-icon"
                                   :class="{ 'text-positive': $q.dark.isActive }"
                                   icon="dns" size="sm"/>
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-section v-show="renameItem.id !== item.id">{{ itemName(item) }}</q-item-section>
                        <input v-model="renameItem.name"
                               v-show="renameItem.id === item.id"
                               type="text"
                               :ref="'rename-input-' + index"
                               class="rename-input no-outline no-border no-padding"
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
                    </q-item-section>
                    <q-item-section side>
                        <q-item-label style="width: 100px" caption class="site-label">
                            {{ loading === item.id ? '正在连接...' : item.host }}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>

            <attr-panel ref="attr-panel"/>

            <session-poster ref="session-poster"/>

        </q-scroll-area>
    </div>
</template>

<script>
import attrPanel from 'src/components/sessionPool/attrPanel'
import sessionPoster from 'src/components/sessionPoster'
import path from "path";

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
        }
    },
    computed: {
        itemName() {
            return item => item.name || item.host
        },
        sessionIsShow() {
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
                    this.$refs[`session-item-${this.selected}`][0].$el.focus()
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

            // delete dragItem.fileMenu

            this.selected = index
            // this.dragFileName = dragItem.name
            // event.dataTransfer.setData('action', action)
            event.dataTransfer.setData('info', JSON.stringify(dragItem))
            // event.dataTransfer.setData('oldPath', action === 'remote'
            //     ? path.posix.join(this.pwd, dragItem.name)
            //     : path.join(this.pwd, dragItem.name))

            event.dataTransfer.setDragImage(this.$refs[`session-item-${index}`][0].$el,0,0)
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

.body--dark
    .pool-control .search-input
        background: #666666
        color: #FFFFFF
        &::-webkit-input-placeholder
            color: #FFFFFF

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

.list-item
    border-radius: 4px
    .session-icon
        color: $primary
    &:focus,&.focus-temp
        background: $primary
        color: #FFFFFF
        .session-icon,.site-label
            color: #FFFFFF
</style>
