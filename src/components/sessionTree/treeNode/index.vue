<template>
    <div>
        <!-- 拖动辅助线 -->
        <div class="separator" :class="{ active : sessionTree.dragMove === item.id }">
            <hr/>
        </div>
        <!-- 树项目 -->
        <div class="tree-item relative-position no-outline"
             tabindex="0"
             draggable="true"
             :ref="'tree-item-' + item.id"
             :class="{
                 'active'     : item.id in $store.state.sessionTree.selected,
                 'rename'     : $store.state.sessionTree.renameItem.id === item.id,
                 'drag-item'  : item.id in $store.state.sessionTree.dragList,
                 'drag-enter' : item.type === 'dir' && sessionTree.dragInto === item.id,
             }"
             :data-node-id        = "item.id"
             @focus               = "handleFocus"
             @blur                = "handleBlur"
             @mousedown.meta      = "handleMultipleSelectMeta"
             @mousedown.right     = "handleBeforeShowMenu"
             @mousedown.left      = "handleBeforeClick"
             @mouseup.left        = "handleAfterClick"
             @click               = "handleClick"
             @contextmenu         = "handleShowMenu"
             @dblclick            = "handleDoubleClick"
             @dragstart           = "handleDragStart"
             @dragover.prevent    = "handleDragOver"
             @drop                = "handleDrop"
             @dragleave           = "handleDragCancel"
             @dragend             = "handleDragEnd"
             @keydown.enter       = "handleDoubleClick"
             @keydown.space       = "handleShowPoster"
             @keydown.f2          = "handleRenameOpen"
             @keydown.meta.delete = "handleRemoveItem"
             @keydown.up          = "handleMoveFocus('up')"
             @keydown.down        = "handleMoveFocus('down')"
             @keydown.left        = "handleDirToggle('close')"
             @keydown.right       = "handleDirToggle('open')">
            <!-- item 图标 -->
            <q-btn class="session-icon"
                   flat
                   size="sm">
                <q-avatar size="sm" square>
                    <img :src="item.icon">
                </q-avatar>
            </q-btn>
            <!-- item 名称 -->
            <div class="session-name full-width">
                <div v-show="sessionTree.renameItem.id !== item.id" class="text-name">{{ item.name }}</div>
                <input v-model="sessionTree.renameItem.name"
                       v-show="sessionTree.renameItem.id === item.id"
                       type="text"
                       :ref="'rename-input-' + item.id"
                       class="rename-input no-outline no-border full-width"
                       :placeholder="item.name"
                       spellcheck="false"
                       @blur="handleRenameClose"
                       @click.stop=""
                       @dblclick.stop=""
                       @keydown.esc="handleRenameCancel"
                       @keydown.stop.delete=""
                       @keydown.stop.space=""
                       @keydown.stop.up=""
                       @keydown.stop.down=""
                       @keydown.stop.alt.r=""
                       @keydown.stop.meta.a=""
                       @keydown.stop.enter="handleRenameFinish"
                       @compositionstart="preventKeydown = true"
                       @compositionend="preventKeydown = false">
            </div>
            <!-- item 简介 -->
            <div class="session-site text-right ellipsis q-pr-sm">
                <div v-if="item.type === 'session'">{{ $store.state.sessionTree.loading === item.id ? '正在连接...' : item.detail.host }}</div>
                <div v-if="item.type === 'dir'">
                    <q-btn flat size="sm" @click="showItemChild = !showItemChild">
                        <q-icon name="ion-ios-arrow-back" class="icon" :class="{ open: showItemChild }"/>
                    </q-btn>
                </div>
            </div>
        </div>
        <q-slide-transition>
            <!-- 组件递归 -->
            <session-tree v-if="item.type === 'dir'"
                          v-show="showItemChild"
                          ref="session-tree"
                          :group         = "item.children"
                          :recursionNum  = "recursionNum + 1"/>
        </q-slide-transition>
    </div>
</template>

<script>
export default {
    name: 'sessionTreeNode',
    props: {
        item  : Object,
        index : Number,
        group: {
            type: Array,
            default: () => [],
        },
        recursionNum : {
            type: Number,
            default: 0,
        },
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
                const { dragList } = this.$store.state.sessionTree

                for (const dragItemId in dragList) {
                    const dragItem = dragList[dragItemId]
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
            }
        },
    },
    watch: {
    },
    methods: {
        /**
         * 显示右键菜单
         */
        handleShowMenu() {
            const { id, type, name } = this.item

            const { remote } = this.$q.electron
            const menu = new remote.Menu()

            if (type === 'session') menu.append(new remote.MenuItem({
                label: `连接会话 “${name}”`,
                click: () => this.handleLogin(),
            }))

            if (type === 'dir') menu.append(new remote.MenuItem({
                label: `在 “${name} 下新建”`,
                submenu: [
                    {
                        label: '新建会话',
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

            menu.append(new remote.MenuItem({ type: 'separator' }))

            if (type === 'session') menu.append(new remote.MenuItem({
                label: '编辑',
                click: () => this.handleOpenDetail(),
            }))

            menu.append(new remote.MenuItem({
                label: '重新命名',
                click: () => this.handleRenameOpen(),
            }))

            menu.append(new remote.MenuItem({
                label: '删除',
                click: () => this.handleRemoveItem(),
            }))

            menu.append(new remote.MenuItem({ type: 'separator' }))

            if (type === 'session') menu.append(new remote.MenuItem({
                label: '卡片展示',
                click: () => this.handleShowPoster(),
            }))

            menu.popup({
                callback: () => {
                    this.$store.commit('sessionTree/STOP_BLUR', false)
                    this.$refs[`tree-item-${id}`].focus()
                }
            })
        },
        /**
         * 显示右键菜单前
         */
        handleBeforeShowMenu() {
            const { id } = this.item
            const selected = id in this.$store.state.sessionTree.selected
            // 更新当前选择会话
            if (!selected) this.$store.commit('sessionTree/SET_SELECTED', { [id]: this.item })
            // 开启暂停失焦
            this.$store.commit('sessionTree/STOP_BLUR', true)
        },
        /**
         * 点击节点前
         */
        handleBeforeClick() {
            const { selected } = this.$store.state.sessionTree

            // 若未开启暂停失焦，且拖动列表存在项目
            if (!this.$store.state.sessionTree.stopBlur && Object.keys(selected).length > 1) {
                this.$store.commit('sessionTree/STOP_BLUR', true)
                setTimeout(() => {
                   if (!Object.keys(this.$store.state.sessionTree.dragList).length) {
                       this.handleAfterClick()
                   }
                }, 100)
            }
        },
        /**
         * 点击节点后
         */
        handleAfterClick() {
            // 若未开启暂停失焦，则代表为正常左键点击，被点击元素成为焦点
            if (!this.$store.state.sessionTree.stopBlur) {
                this.$store.commit('sessionTree/SET_SELECTED', { [this.item.id]: this.item })
            }
            // 关闭暂停失焦
            this.$store.commit('sessionTree/STOP_BLUR', false)
        },
        /**
         * 点击节点
         */
        handleClick() {

        },
        /**
         * 节点聚焦
         */
        handleFocus() {
        },
        /**
         * 节点失焦
         */
        handleBlur() {
            // 若失焦为暂停状态
            if (this.$store.state.sessionTree.stopBlur) return
            this.$store.commit('sessionTree/SET_UNSELECTED_ALL')
        },
        /**
         * 双击节点
         */
        handleDoubleClick() {
            const { type } = this.item
            if (type === 'dir')     return this.handleDirToggle()
            if (type === 'session') return this.handleLogin()
        },
        /**
         * 连接会话
         */
        handleLogin() {
            const { id } = this.item
            this.$store.commit('sessionTree/SET_LOADING', id)
            this.$store.dispatch('session/LOGIN', this.item)
                .then(() => this.$router.push({ path: '/session' }))
                .catch(err => this.alert(err))
                .finally(() => this.$store.commit('sessionTree/SET_LOADING', null))
        },
        /**
         * 控制目录
         * @param   {String}    action  指定目录状态
         */
        handleDirToggle(action = '') {
            if (this.item.type !== 'dir') return
            if (action === 'open')  return this.showItemChild = true
            if (action === 'close') return this.showItemChild = false
            this.showItemChild = !this.showItemChild
        },
        /**
         * 拖动开始
         * @param   {Object}    event   拖动事件对象
         */
        handleDragStart(event) {
            const { id } = this.item
            const { selected } = this.$store.state.sessionTree

            if (!selected[id]) this.$store.commit('sessionTree/SET_SELECTED', { [id]: this.item })

            this.$store.commit('sessionTree/SET_DRAG_LIST', this.$store.state.sessionTree.selected)
            // 拖动事件对象设置 Ghost 图像，内容为拖动对象 dom，x y 轴不进行偏移
            event.dataTransfer.setDragImage(this.$refs[`tree-item-${id}`],0,0)
        },
        /**
         * 拖动经过
         * @param   {Object}    event   拖动事件对象
         */
        handleDragOver(event) {
            const { id, type } = this.item
            const { selected } = this.$store.state.sessionTree
            // 不允许拖动到自身
            if (id in selected) return
            // 目录不允许拖动到自身子级内
            if (this.isDragItemChild(id)) return
            // 获取鼠标位于拖动经过项目的 Y 轴坐标
            const { layerY } = event
            // 分界阈值
            const { clientHeight } = this.$refs[`tree-item-${id}`]
            // 上 - 位于 1/3 以上，视为将元素移动到经过目标的上方
            if (layerY <= clientHeight * (1/3)) {
                if (this.index !== 0 && this.group[this.index - 1].id in selected) return
                // 更新移动到该会话项目 ID 前
                this.$store.commit('sessionTree/SET_DRAG_MOVE', id)
                // 清除移入到该会话目录 ID 内
                this.$store.commit('sessionTree/SET_DRAG_INTO', null)
                return
            }
            // 下 - 位于 1/3 以下，视为将元素移动到经过目标的上方
            if (layerY >= clientHeight * (2/3)) {
                // 拖到被拖动元素上一位的下方，不做响应
                if (this.index !== this.group.length - 1 && this.group[this.index + 1].id in selected) return
                // 拖到目录类型项目的下方不做响应，视为移动至目录内
                if (type === 'dir') return
                // 若经过项目不为当前会话所在目录的最后一位，则更新移动到下一个会话项目 ID 前
                if (this.index !== this.group.length - 1) this.$store.commit('sessionTree/SET_DRAG_MOVE', this.group[this.index + 1].id)
                // TODO：应该移动到末位
                // 若经过项目为当前会话所在目录的最后一位，则更新移动到该会话项目 ID 前
                if (this.index === this.group.length - 1) this.$store.commit('sessionTree/SET_DRAG_MOVE', id)
                // 清除移入到该会话目录 ID 内
                this.$store.commit('sessionTree/SET_DRAG_INTO', null)
                return
            }
            // 中 - 位于 1/3 - 2/3 区域，且经过项目类型为目录，视为将项目移动至经过目录内
            if (type === 'dir') {
                // 清除移动到该会话项目 ID 前
                this.$store.commit('sessionTree/SET_DRAG_MOVE', null)
                // 更新移入到该会话目录 ID 内
                this.$store.commit('sessionTree/SET_DRAG_INTO', id)
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
         * 取消结束
         */
        handleDragEnd() {
            this.handleDragCancel()
            // 清除拖动项目
            this.$store.commit('sessionTree/SET_DRAG_LIST', null)
            // 关闭暂停失焦
            this.$store.commit('sessionTree/STOP_BLUR', false)
        },
        /**
         * 拖动完成
         * @param   {Object}    event   拖动完成事件对象
         */
        handleDrop(event) {
            const { dragInto, dragMove, dragList } = this.$store.state.sessionTree
            let action
            // 若为被阻止的行为
            if (!dragInto && !dragMove) return
            // 若为拖入事件
            if (dragInto) action = 'into'
            // 若为移动事件
            if (dragMove) action = 'move'
            // 通过 vuex 移动元素
            for (const target in dragList) {
                this.$store.commit('session/MOVE', {
                    action,
                    target,
                    position: dragMove || dragInto,
                })
            }
            // 清除拖动项目
            this.$store.commit('sessionTree/SET_DRAG_LIST', null)
        },
        /**
         * 显示节点卡片
         */
        handleShowPoster() {
            this.$store.commit('sessionTree/SHOW_POSTER', this.item)
        },
        /**
         * 重命名开始
         */
        handleRenameOpen() {
            this.$store.commit('sessionTree/RENAME_START', this.item)
            setTimeout(() => this.$refs[`rename-input-${this.item.id}`].focus(), 100)
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
            this.$refs[`tree-item-${id}`].focus()
        },
        /**
         * 重命名取消
         */
        handleRenameCancel() {
            this.$store.commit('sessionTree/RENAME_CANCEL')
            this.$refs[`rename-input-${this.item.id}`].blur()
        },
        /**
         * 重命名完成
         */
        handleRenameFinish() {
            if (!this.preventKeydown) this.$refs[`rename-input-${this.item.id}`].blur()
        },
        /**
         * 删除节点
         */
        handleRemoveItem() {
            const { id, type, name } = this.item
            this.confirm({
                message: `确定要删除 ${name} 吗？`,
                detail: type === 'dir' ? '文件夹下的会话将全部删除！' : ''
            })
                .then(() => {
                    this.$store.commit('session/DELETE', id)
                })
        },
        /**
         * 显示节点详情
         */
        handleOpenDetail() {
            this.$store.commit('sessionTree/SHOW_DETAIL', this.item)
        },
        /**
         * 移动聚焦元素
         * TODO:
         * @param   {String}    action  移动方向
         */
        handleMoveFocus(action) {
            // console.log('move focus ' + action)
        },
        /**
         * 多选
         */
        handleMultipleSelectMeta() {
            const { id } = this.item
            const action = id in this.$store.state.sessionTree.selected ? 'remove' : 'add'

            // 暂停失焦
            this.$store.commit('sessionTree/STOP_BLUR', true)

            if (action === 'remove') this.$store.commit('sessionTree/SET_SELECTED_REMOVE', id)
            if (action === 'add')    this.$store.commit('sessionTree/SET_SELECTED_ADD', { [id]: this.item })
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

.tree-item
    display: flex
    flex-direction: row
    border-radius: 4px
    transition: transform .3s
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
    &.active,&.rename
        background: $primary
        color: #FFFFFF
        .session-icon,.session-site
            color: #FFFFFF
    &.drag-item
        background: #888888
        color: #FFFFFF
        .session-icon,.session-site
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
