<template>
    <div>
        <!-- 拖动辅助线 -->
        <div class="separator" :class="{ active : sessionTree.dragMove === nodeItem.id }">
            <hr/>
        </div>
        <!-- 树项目 -->
        <div class="tree-item relative-position no-outline"
             tabindex="0"
             draggable="true"
             :ref="'tree-item-' + nodeItem.id"
             :class="{
                 'focus-temp'  : sessionTree.selected === nodeItem.id || sessionTree.renameItem.id === nodeItem.id || sessionTree.openMenu === nodeItem.id,
                 'drag-enter'  : nodeItem.type === 'dir' && sessionTree.dragInto === nodeItem.id,
             }"
             @click            = "handleItemFocus(nodeItem.id)"
             @click.right      = "handleShowMenu(nodeItem)"
             @dblclick         = "handleLogin(nodeItem)"
             @dragstart        = "handleDragStart($event, nodeItem, nodeIndex)"
             @dragover.prevent = "handleDragOver($event, nodeItem, nodeIndex, group)"
             @drop             = "handleDrop($event, nodeItem, nodeIndex)"
             @dragleave        = "handleDragCancel"
             @dragend          = "handleDragCancel"
             @keydown.enter    = "handleLogin(nodeItem)"
             @keydown.space    = "handleShowPoster(nodeItem)"
             @keydown.f2       = "handleRenameOpen(nodeItem)"
             @keydown.delete   = "handleRemoveItem(nodeItem)"
             @keydown.up       = "handleMoveFocus('up')"
             @keydown.down     = "handleMoveFocus('down')">
            <!-- item 图标 -->
            <q-btn class="session-icon"
                   flat
                   size="sm">
                <q-avatar size="sm" square>
                    <img :src="nodeItem.icon">
                </q-avatar>
            </q-btn>
            <!-- item 名称 -->
            <div class="session-name full-width">
                <div v-show="sessionTree.renameItem.id !== nodeItem.id" class="text-name">{{ nodeItem.name }}</div>
                <input v-model="sessionTree.renameItem.name"
                       v-show="sessionTree.renameItem.id === nodeItem.id"
                       type="text"
                       :ref="'rename-input-' + nodeItem.id"
                       class="rename-input no-outline no-border full-width"
                       :placeholder="nodeItem.name"
                       spellcheck="false"
                       @blur="handleRenameClose"
                       @click.stop=""
                       @dblclick.stop=""
                       @keydown.esc="handleRenameCancel(nodeItem.id)"
                       @keydown.stop.delete=""
                       @keydown.stop.space=""
                       @keydown.stop.up=""
                       @keydown.stop.down=""
                       @keydown.stop.alt.r=""
                       @keydown.stop.enter="handleRenameFinish(nodeItem.id)"
                       @compositionstart="preventKeydown = true"
                       @compositionend="preventKeydown = false">
            </div>
            <!-- item 简介 -->
            <div class="session-site text-right ellipsis q-pr-sm">
                <div v-if="nodeItem.type === 'session'">{{ $store.state.sessionTree.loading === nodeItem.id ? '正在连接...' : nodeItem.detail.host }}</div>
                <div v-if="nodeItem.type === 'dir'">
                    <q-btn flat size="sm" @click="showItemChild = !showItemChild">
                        <q-icon name="ion-ios-arrow-back" class="icon" :class="{ open: showItemChild }"/>
                    </q-btn>
                </div>
            </div>
        </div>
        <q-slide-transition>
            <!-- 组件递归 -->
            <session-tree v-if="nodeItem.type === 'dir'"
                          v-show="showItemChild"
                          :group         = "nodeItem.children"
                          :recursionNum  = "recursionNum + 1"/>
        </q-slide-transition>
    </div>
</template>

<script>
export default {
    name: 'sessionTreeNode',
    props: {
        group        : Array,
        nodeItem     : Object,
        nodeIndex    : Number,
        recursionNum : Number,
    },
    data() {
        return {
            sessionTree   : this.$store.state.sessionTree,
            preventKeydown: false,
            showItemChild : true,
        }
    },
    computed: {
        isDragItemChild() {
            return id => {
                const { dragItem } = this.$store.state.sessionTree
                if (dragItem.type === 'session') return false
                let isChild = false
                const recursionCheck = group => {
                    for (const item of group) {
                        if (item.id === id) return isChild = true
                        if (item.type === 'dir') recursionCheck(item.children)
                    }
                }
                recursionCheck(dragItem.children)
                return isChild
            }
        },
    },
    watch: {
    },
    methods: {
        /**
         * 显示右键菜单
         * @param   {Object}    item    要显示右键菜单项目对象
         */
        handleShowMenu(item) {
            // 更新当前选择会话
            this.$store.commit('sessionTree/SET_SELECTED', item.id)
            // 更新开启了右键菜单的项目
            this.$store.commit('sessionTree/SET_OPEN_MENU', item.id)

            const { remote } = this.$q.electron
            const menu = new remote.Menu()

            if (item.type === 'session') menu.append(new remote.MenuItem({
                label: `连接会话 “${item.name}”`,
                click: () => this.handleLogin(item),
            }))

            menu.append(new remote.MenuItem({ type: 'separator' }))

            menu.append(new remote.MenuItem({
                label: '删除',
                click: () => this.handleRemoveItem(item),
            }))

            menu.append(new remote.MenuItem({
                label: '重命名',
                click: () => this.handleRenameOpen(item),
            }))

            menu.append(new remote.MenuItem({ type: 'separator' }))

            menu.append(new remote.MenuItem({
                label: '卡片展示',
                click: () => this.handleShowPoster(item),
            }))

            if (item.type === 'session') menu.append(new remote.MenuItem({
                label: '编辑会话',
                click: () => this.handleOpenDetail(item),
            }))

            menu.popup({
                callback: () => this.handleItemFocus(item.id),
            })
        },
        /**
         * 选择节点
         * @param   {String}    id      被选择节点的节点 ID
         */
        handleItemFocus(id) {
            this.$store.commit('sessionTree/SET_SELECTED', id)
            // 清除开启右键菜单的项目
            this.$store.commit('sessionTree/SET_OPEN_MENU', null)
            // dom 更新后对选中项目执行 focus 操作
            this.$nextTick(() => {
                try {
                    this.$refs[`tree-item-${id}`].focus()
                } catch (error) {
                }
            })
        },
        /**
         * 连接会话
         * @param   {Object}    item    要连接会话的节点对象
         */
        handleLogin(item) {
            if (item.type === 'dir') return this.showItemChild = !this.showItemChild

            this.$store.commit('sessionTree/SET_LOADING', item.id)
            this.$store.dispatch('session/LOGIN', item)
                .then(() => this.$router.push({ path: '/session' }))
                .catch(err => this.confirm(err))
                .finally(() => this.$store.commit('sessionTree/SET_LOADING', null))
        },
        /**
         * 拖动开始
         * @param   {Object}    event   拖动事件对象
         * @param   {Object}    item    要拖动项目的对象
         * @param   {Number}    index   要拖动项目的索引
         */
        handleDragStart(event, item, index) {
            this.$store.commit('sessionTree/SET_DRAG_ITEM', item)
            // 更新选择项目
            this.$store.commit('sessionTree/SET_SELECTED', item.id)
            // 拖动事件对象设置 Ghost 图像，内容为拖动对象 dom，x y 轴不进行偏移
            event.dataTransfer.setDragImage(this.$refs[`tree-item-${item.id}`],0,0)
        },
        /**
         * 拖动经过
         * @param   {Object}    event   拖动事件对象
         * @param   {Object}    item    拖动经过的项目对象
         * @param   {Number}    index   拖动经过的项目索引
         */
        handleDragOver(event, item, index, group) {
            const { selected } = this.$store.state.sessionTree
            // 不允许拖动到自身
            if (selected === item.id) return
            // 目录不允许拖动到自身子级内
            if (this.isDragItemChild(item.id)) return
            // 获取鼠标位于拖动经过项目的 Y 轴坐标
            const { layerY } = event
            // 分界阈值
            const { clientHeight } = this.$refs[`tree-item-${item.id}`]
            // 上 - 位于 1/3 以上，视为将元素移动到经过目标的上方
            if (layerY <= clientHeight * (1/3)) {
                if (index !== 0 && selected === group[index - 1].id) return
                // 更新移动到该会话项目 ID 前
                this.$store.commit('sessionTree/SET_DRAG_MOVE', item.id)
                // 清除移入到该会话目录 ID 内
                this.$store.commit('sessionTree/SET_DRAG_INTO', null)
                return
            }
            // 下 - 位于 1/3 以下，视为将元素移动到经过目标的上方
            if (layerY >= clientHeight * (2/3)) {
                // 拖到被拖动元素上一位的下方，不做响应
                if (index !== group.length - 1 && selected === group[index + 1].id) return
                // 拖到目录类型项目的下方不做响应，视为移动至目录内
                if (item.type === 'dir') return
                // 若经过项目不为当前会话所在目录的最后一位，则更新移动到下一个会话项目 ID 前
                if (index !== group.length - 1) this.$store.commit('sessionTree/SET_DRAG_MOVE', group[index + 1].id)
                // TODO：应该移动到末位
                // 若经过项目为当前会话所在目录的最后一位，则更新移动到该会话项目 ID 前
                if (index === group.length - 1) this.$store.commit('sessionTree/SET_DRAG_MOVE', item.id)
                // 清除移入到该会话目录 ID 内
                this.$store.commit('sessionTree/SET_DRAG_INTO', null)
                return
            }
            // 中 - 位于 1/3 - 2/3 区域，且经过项目类型为目录，视为将项目移动至经过目录内
            if (item.type === 'dir') {
                // 清除移动到该会话项目 ID 前
                this.$store.commit('sessionTree/SET_DRAG_MOVE', null)
                // 更新移入到该会话目录 ID 内
                this.$store.commit('sessionTree/SET_DRAG_INTO', item.id)
            }
        },
        /**
         * 取消拖动
         */
        handleDragCancel() {
            // 清除移动到该会话项目 ID 前
            this.$store.commit('sessionTree/SET_DRAG_MOVE', null)
            // 清除移入到该会话目录 ID 内
            this.$store.commit('sessionTree/SET_DRAG_INTO', null)
        },
        /**
         * 拖动完成
         * @param   {Object}    event   拖动完成事件对象
         * @param   {Object}    item    拖动完成所在的项目对象
         * @param   {Number}    index   拖动完成所在的项目索引
         */
        handleDrop(event, item, index) {
            const { dragInto, dragMove, dragItem } = this.$store.state.sessionTree
            let action
            // 若为被阻止的行为
            if (!dragInto && !dragMove) return
            // 若为拖入事件
            if (dragInto) action = 'into'
            // 若为移动事件
            if (dragMove) action = 'move'
            // 通过 vuex 移动元素
            this.$store.commit('session/MOVE', {
                action,
                target: dragItem.id,
                position: dragMove || dragInto,
            })
        },
        /**
         * 显示节点卡片
         * @param   {Object}    item    要显示卡片的节点对象
         */
        handleShowPoster(item) {
            this.$store.commit('sessionTree/SHOW_POSTER', item)
        },
        /**
         * 重命名开始
         * @param   {Object}    item    重命名节点对象
         */
        handleRenameOpen(item) {
            this.$store.commit('sessionTree/RENAME_START', item)
            setTimeout(() => this.$refs[`rename-input-${item.id}`].focus(), 100)
        },
        /**
         * 重命名结束
         */
        handleRenameClose() {
            const { id, name } = this.$store.state.sessionTree.renameItem
            this.$store.commit('session/UPDATE', {
                id,
                updateItem: { name },
            })
            this.$store.commit('sessionTree/RENAME_CLOSE')
            this.handleItemFocus(id)
        },
        /**
         * 重命名取消
         * @param   {String}    id      重命名节点 ID
         */
        handleRenameCancel(id) {
            this.$store.commit('sessionTree/RENAME_CANCEL')
            this.$refs[`rename-input-${id}`].blur()
        },
        /**
         * 重命名完成
         * @param   {String}    id      重命名节点 ID
         */
        handleRenameFinish(id) {
            if (!this.preventKeydown) this.$refs[`rename-input-${id}`].blur()
        },
        /**
         * 删除节点
         * @param   {Object}    item    要删除的节点对象
         */
        handleRemoveItem(item) {
            this.tools.confirm({
                message: item.type === 'session'
                    ? `确定要删除会话 ${item.name} 吗？`
                    : `确定要删除文件夹 ${item.name} 吗？文件夹下的会话将全部删除！`,
                confirm: () => {
                    this.$store.commit('session/DELETE', item.id)
                },
                cancel: () => {}
            })
        },
        /**
         * 显示节点详情
         * @param   {Object}    item    要显示详情的节点对象
         */
        handleOpenDetail(item) {
            this.$store.commit('sessionTree/SHOW_DETAIL', item)
        },
        /**
         * 移动聚焦元素
         * TODO:
         * @param   {String}    action  移动方向
         */
        handleMoveFocus(action) {
            console.log('move focus ' + action)
        },
    },
}
</script>

<style scoped lang="sass">
.body--light
    .tree-item
        .session-icon
            color: $primary

.body--dark
    .tree-item
        .session-icon
            color: $positive

.flip-list-move
    transition: transform .3s

.separator
    padding: 1px 0
    opacity: 0
    transition: all .3s
    hr
        margin: 0
        border: 0
        height: 1px
        background: #FFFFFF
    &.active
        opacity: 1

.list-item
    .tree-item
        display: flex
        flex-direction: row
        border-radius: 4px
        transition: all .3s
        &::before,&::after
            content: ''
            position: absolute
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
        .text-name
            padding: 0 2px
        input
            padding: 0 2px

    .session-site
        line-height: 36px
        font-size: .8rem
        color: #999999
        min-width: 120px
        .icon
            font-size: 12px
            transition: all .3s
            &.open
                transform: rotate(-90deg)
</style>
