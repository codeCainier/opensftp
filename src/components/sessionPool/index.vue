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
            <session-tree :group="$store.state.session.pool"
                          :renameItem="renameItem"
                          :loading="loading"
                          :dragMove="dragMove"
                          :dragInto="dragInto"
                          :openMenu="openMenu"
                          :selected="selected"
                          @menu="showMenu"
                          @focus="sessionFocus"
                          @login="login"
                          @drag-start="dragStart"
                          @drag-over="dragOver"
                          @drag-leave="cancelMove"
                          @drag-end="cancelMove"
                          @drop="drop"
                          @show-poster="showPoster"
                          @rename-open="renameOpen"
                          @rename-close="renameClose"
                          @rename-cancel="renameCancel"
                          @rename-finish="renameFinish"
                          @remove-item="removeItem"
                          @open-detail="showAttr"
                          @move-focus="moveFocus"/>
        </div>
        <!-- 高级设置 -->
        <attr-panel ref="attr-panel"/>
        <!-- 会话卡片 -->
        <session-poster ref="session-poster"/>
    </div>
</template>

<script>
import attrPanel     from 'src/components/sessionPool/attrPanel'
import sessionPoster from 'src/components/sessionPoster'
import sessionTree   from 'src/components/sessionTree'

export default {
    name: 'SessionPool',
    components: {
        'attr-panel'     : attrPanel,
        'session-poster' : sessionPoster,
        'session-tree'   : sessionTree,
    },
    data() {
        return {
            loading         : null,     // 当前处于 Loading 状态的会话 ID
            selected        : null,     // 当前处于选择状态的元素 ID
            openMenu        : null,     // 当前右键菜单属于开启状态的元素 ID
            renameItem      : {},       // 当前处于重命名状态的元素对象
            showSearch      : false,    // 会话搜索模块显示状态
            searchValue     : '',       // 会话搜索内容
            sessionFilter   : [],       // 会话搜索结果
            dragMove        : null,     // 移动到该会话项目前
            dragInto        : null,     // 移动到该会话目录内
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
            // FIXME:
            // if (action === 'up' && this.selected !== 0) this.selected -= 1
            // if (action === 'down' && this.selected !== this.$store.state.session.pool.length - 1) this.selected += 1
            // this.sessionFocus()
        },
        // 显示会话卡片展示
        showPoster(item) {
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
            // if (!this.sessionFilter.length) return
            // this.selected = this.$store.state.session.pool.findIndex(item => item.id === this.sessionFilter[0].id)
            // this.sessionFocus()
        },
        // 创建目录
        createSessionDir() {
            this.$store.commit('session/CREATE_DIR', {})
        },
        /**
         * 显示右键菜单
         * @param   {Object}    item    要显示右键菜单项目对象
         * @param   {Number}    index   要显示右键菜单项目的索引
         */
        showMenu(item, index) {
            this.selected = item.id     // 更新当前选择会话
            this.openMenu = item.name   // 更新开启了右键菜单的项目

            // 若未创建右键菜单，则创建右键菜单
            if (!item.menu) {
                const { remote } = this.$q.electron
                const menu = new remote.Menu()

                if (item.type === 'session') menu.append(new remote.MenuItem({
                    label: '连接' + `“${item.name}”`,
                    click: () => this.login(item),
                }))

                menu.append(new remote.MenuItem({ type: 'separator' }))

                menu.append(new remote.MenuItem({
                    label: '删除',
                    click: () => this.removeItem(item),
                }))

                menu.append(new remote.MenuItem({
                    label: '重命名',
                    click: () => this.renameOpen(item, index),
                }))

                menu.append(new remote.MenuItem({ type: 'separator' }))

                menu.append(new remote.MenuItem({
                    label: '卡片展示',
                    click: () => this.showPoster(item),
                }))

                menu.append(new remote.MenuItem({
                    label: '高级设置',
                    click: () => this.showAttr(item),
                }))

                item.menu = menu
            }

            item.menu.popup({
                callback: () => this.sessionFocus(),
            })
        },
        /**
         * 选择项目
         */
        sessionFocus() {
            // 清除开启右键菜单的项目
            this.openMenu = null
            // dom 更新后对选中项目执行 focus 操作
            this.$nextTick(() => {
                // TODO：try catch 防止？
                try {
                    this.$refs[`session-item-${this.selected}`][0].focus()
                } catch (error) {
                }
            })
        },
        /**
         * 拖动开始
         * @param   {Object}    event   拖动事件对象
         * @param   {Object}    item    要拖动项目的对象
         * @param   {Number}    index   要拖动项目的索引
         */
        dragStart(event, item, index) {
            // 克隆对象解除关联
            const dragItem = this.tools.clone(item)

            // 删除克隆结果的右键菜单
            delete dragItem.menu

            // 更新选择项目
            this.selected = item.id

            // 拖动事件对象写入传递信息
            event.dataTransfer.setData('info', JSON.stringify(dragItem))
            // 拖动事件对象设置 Ghost 图像，内容为拖动对象 dom，x y 轴不进行偏移
            event.dataTransfer.setDragImage(this.$refs[`session-item-${item.id}`][0],0,0)
        },
        /**
         * 拖动经过
         * @param   {Object}    event   拖动事件对象
         * @param   {Object}    item    拖动经过的项目对象
         * @param   {Number}    index   拖动经过的项目索引
         */
        dragOver(event, item, index, group) {
            // 获取鼠标位于拖动经过项目的 Y 轴坐标
            const { layerY } = event
            // 分界阈值
            const { clientHeight } = this.$refs[`session-item-${item.id}`][0]
            // 上 - 位于 1/3 以上，视为将元素移动到经过目标的上方
            if (layerY <= clientHeight * (1/3)) {
                this.dragMove = item.id     // 更新移动到该会话项目 ID 前
                this.dragInto = null        // 清除移入到该会话目录 ID 内
                return
            }
            // 下 - 位于 1/3 以下，视为将元素移动到经过目标的上方
            if (layerY >= clientHeight * (2/3)) {
                // 若经过项目不为当前会话所在目录的最后一位，则更新移动到下一个会话项目 ID 前
                if (index !== group.length - 1) this.dragMove = group[index + 1].id
                // TODO：应该移动到末位
                // 若经过项目为当前会话所在目录的最后一位，则更新移动到该会话项目 ID 前
                if (index === group.length - 1) this.dragMove = item.id
                // 清除移入到该会话目录 ID 内
                this.dragInto = null
                return
            }
            // 中 - 位于 1/3 - 2/3 区域，且经过项目类型为目录，视为将项目移动至经过目录内
            if (item.type === 'dir') {
                this.dragMove = null        // 清除移动到该会话项目 ID 前
                this.dragInto = item.id     // 更新移入到该会话目录 ID 内
            }
        },
        /**
         * 取消移动
         */
        cancelMove() {
            this.dragMove = null    // 清除移动到该会话项目 ID 前
            this.dragInto = null    // 清除移入到该会话目录 ID 内
        },
        /**
         * 拖动完成
         * @param   {Object}    event   拖动完成事件对象
         * @param   {Object}    item    拖动完成所在的项目对象
         * @param   {Number}    index   拖动完成所在的项目索引
         */
        drop(event, item, index) {
            // 不允许拖动到自身
            if (this.selected === item.id) return
            // 从拖动对象传递到信息中读取拖动元素对象
            const info = JSON.parse(event.dataTransfer.getData('info'))
            // 若为拖入事件
            if (this.dragInto !== null) {

            }
            // 若为移动事件
            if (this.dragMove) {
                this.$store.commit('session/MOVE', {
                    info,
                    target: info.id,
                    position: this.dragMoveBefore,
                })
            }
        },
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
</style>
