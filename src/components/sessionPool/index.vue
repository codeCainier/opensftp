<template>
    <div class="session-pool full-height relative-position">
        <!-- 会话池控制中心 -->
        <div class="pool-control q-ma-sm q-mt-md" @click="selectedCancel">
            <div class="row">
                <div class="session-num" :class="{ active: !showSearch }">
                    <span class="text-h6 text-weight-light q-mx-xs">{{ $store.getters["session/sessionNodeNum"]() }}</span>
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
                           @keydown.esc="handleToggleSearch(false)"
                           @keydown.down="searchResFocus">
                </div>
                <q-space/>
                <q-btn class="btn-control btn-search"
                       :icon="showSearch ? 'close' : 'search'"
                       flat round
                       size="sm"
                       @click="handleToggleSearch(!showSearch)"/>
                <q-btn class="btn-control btn-add"
                       icon="add"
                       flat round
                       size="sm">
                    <q-menu content-class="bg-transparent">
                        <q-list class="bg-aero" dense style="min-width: 120px">
                            <q-item clickable v-close-popup @click="createSession">
                                <q-item-section>新建会话</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="createSessionDir">
                                <q-item-section>新建文件夹</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </div>
        </div>
        <!-- 会话池列表 -->
        <div class="session-list full-height scroll q-pa-sm"
             tabindex="-1"
             @focus             = "selectedCancel"
             @contextmenu       = "showMenu"
             @keydown.meta.a    = "selectAll"
             @keydown.meta.f    = "handleToggleSearch(true)"
             @keydown.up.self   = "showFocus('up')"
             @keydown.down.self = "showFocus('down')">
            <!-- 过滤结果列表 -->
            <div v-if="showSearch">
                <session-node v-for="(item, index) in sessionFilter"
                              :key="item.id"
                              :data-node-filter="item.id"
                              :item="item"
                              :index="index"/>
            </div>
            <!-- 会话池树形结构 -->
            <session-tree v-else ref="session-tree" :group="$store.state.session.pool"/>
        </div>
        <!-- 会话卡片 -->
        <session-poster ref="session-poster"/>
        <!-- 会话详情 -->
        <session-detail ref="session-detail" :key="sessionDetailKey" @close="refreshSessionDetail"/>
        <!-- 模块背景 -->
        <div class="module-background" :style="moduleBg()"></div>
    </div>
</template>

<script>
import sessionPoster from 'src/components/sessionPoster'
import sessionDetail from 'src/components/sessionDetail'
import sessionNode   from 'src/components/sessionTree/treeNode'
import { uid, debounce } from 'quasar'

export default {
    name: 'SessionPool',
    components: {
        'session-poster' : sessionPoster,
        'session-detail' : sessionDetail,
        'session-node'   : sessionNode,
    },
    data() {
        return {
            showSearch      : false,    // 会话搜索模块显示状态
            searchValue     : '',       // 会话搜索内容
            sessionFilter   : [],       // 会话搜索结果
            sessionDetailKey: uid(),
        }
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
        },
        '$store.state.sessionTree.showPoster': function ([newVal]) {
            this.$refs['session-poster'].open(newVal)
        },
        '$store.state.sessionTree.showDetail': function ([newVal]) {
            this.$refs['session-detail'].open(newVal)
        },
    },
    computed: {
        moduleBg() {
            return () => {
                const style = {}
                style.opacity = this.$store.state.setting.sessionPoolOpacity / 100
                return style
            }
        }
    },
    methods: {
        // 搜索会话
        searchSession() {
            const value = this.searchValue.trim()
            // 搜索内容为空
            if (!value) return this.sessionFilter = []
            this.sessionFilter = this.$store.getters['session/sessionFilter'](value)
        },
        // 搜素结果获取焦点
        searchResFocus() {
            if (!this.sessionFilter.length) return
            const nodeEl   = document.querySelector(`.session-list [data-node-filter] [data-node-id]`)
            const nodeId   = nodeEl.getAttribute('data-node-id')
            const nodeItem = this.$store.getters['session/sessionItem'](nodeId)
            this.$store.commit('sessionTree/SET_NODE_SELECTED', nodeItem)
            nodeEl.focus()
        },
        // 新建文件夹
        createSessionDir() {
            const id = uid()
            this.$store.commit('session/CREATE_DIR', {
                id,
                name: '新建会话目录'
            })

            this.$nextTick(() => {
                const node = this.findNode(id, this.$refs['session-tree'])
                node.handleRenameOpen()
            })
        },
        // 新建会话
        createSession() {
            this.$refs['session-detail'].open()
        },
        // 刷新会话详情面板
        refreshSessionDetail() {
            this.sessionDetailKey = uid()
        },
        // 显示容器右键菜单
        showMenu() {
            const { remote } = this.$q.electron
            const menu = new remote.Menu()

            menu.append(new remote.MenuItem({
                label: '新建',
                submenu: [
                    {
                        label: '新建会话',
                        click: () => this.createSession(),
                    }, {
                        label: '新建文件夹',
                        click: () => this.createSessionDir(),
                    },
                ],
            }))

            menu.append(new remote.MenuItem({ type: 'separator' }))

            menu.append(new remote.MenuItem({
                label: '折叠所有文件夹',
                click: () => {
                    this.alert('功能开发中')
                },
            }))

            menu.append(new remote.MenuItem({
                label: '展开所有文件夹',
                click: () => {
                    this.alert('功能开发中')
                },
            }))

            menu.popup()
        },
        // 寻找节点
        findNode(id, sessionTree) {
            const treeNodeList = sessionTree.$refs['tree-node']
            for (const item of treeNodeList) {
                if (item.item.id === id) return item
                if ('session-tree' in item.$refs && 'tree-node' in item.$refs['session-tree'].$refs) {
                    this.findNode(id, item.$refs['session-tree'])
                }
            }
        },
        // 全选节点
        selectAll() {
            // 未开启筛选时，进行的全选操作
            if (!this.showSearch) {
                const { pool } = this.$store.state.session
                const selectedNum = this.$store.getters['sessionTree/selectedNodeNum']()
                // 若节点树中没有节点，则无法进行全选
                if (!pool.length) return
                // 若当前无选中的节点，则默认会话树中第一个节点作为选中 Focus 节点
                if (!selectedNum) {
                    const nodeEl   = document.querySelector('.session-list [data-node-id]')
                    const nodeId   = nodeEl.getAttribute('data-node-id')
                    const nodeItem = this.$store.getters['session/sessionItem'](nodeId)
                    this.$store.commit('sessionTree/SET_NODE_SELECTED', nodeItem)
                    nodeEl.focus()
                }
                this.$store.commit('sessionTree/SET_NODE_SELECTED_ALL', this.$store.getters['session/sessionNodeList']())
            }
            // 开启筛选时，进行的全选操作
            if (this.showSearch) {

            }
        },
        // 取消选择
        selectedCancel() {
            this.$store.commit('sessionTree/SET_NODE_SELECTED_CLEAR')
        },
        // 移动光标
        showFocus(action) {
            const { pool } = this.$store.state.session
            // 若节点树中没有节点，则无法进行全选
            if (!pool.length) return
            // 暂时不区分 action
            if (!this.showSearch) {
                const nodeList = [...document.querySelectorAll('.session-list [data-node-id]')]
                // 方向键 up
                if (action === 'up') {
                    for (let index = nodeList.length - 1; index !== 0; index -= 1) {
                        const nodeEl = nodeList[index]
                        if (nodeEl.offsetParent !== null) {
                            const nodeId = nodeEl.getAttribute('data-node-id')
                            const nodeItem = this.$store.getters['session/sessionItem'](nodeId)
                            this.$store.commit('sessionTree/SET_NODE_SELECTED', nodeItem)
                            nodeEl.focus()
                            break
                        }
                    }
                }
                // 方向键 down
                if (action === 'down') {
                    const nodeEl = nodeList[0]
                    const nodeId = nodeEl.getAttribute('data-node-id')
                    const nodeItem = this.$store.getters['session/sessionItem'](nodeId)
                    this.$store.commit('sessionTree/SET_NODE_SELECTED', nodeItem)
                    nodeEl.focus()
                }
            }
        },
        // 搜索模式开关
        handleToggleSearch(action) {
            this.showSearch = action
            if (action) this.$store.commit('sessionTree/SET_NODE_SELECTED_CLEAR')
            if (!action) setTimeout(() => this.showFocus('down'), 300)
        },
    },
    created() {
        this.searchSession = debounce(this.searchSession, 300)
    },
};
</script>

<style scoped lang="sass">
.body--light
    .pool-control .search-input
        background: #EEEEEE
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
    .session-list
        outline: none
</style>
