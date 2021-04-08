<template>
    <transition-group name="flip-list" tag="div">
        <div v-for="(item, index) in group"
             :key="item.id"
             class="list-item"
             :style="{ 'padding-left': recursionNum * 20 + 'px' }">
            <!-- 拖动辅助线 -->
            <div class="separator" :class="{ active : dragMove === item.id }">
                <hr/>
            </div>
            <!-- 树项目 -->
            <div class="tree-item relative-position no-outline"
                 tabindex="0"
                 draggable="true"
                 :ref="'tree-item-' + item.id"
                 :class="{
                     'focus-temp'  : renameItem.id === item.id || openMenu === item.id,
                     'drag-enter'  : item.type === 'dir' && dragInto === item.id,
                 }"
                 @click            = "handleItemFocus(item.id, $refs[`tree-item-${item.id}`][0])"
                 @click.right      = "handleShowMenu(item, index, $refs)"
                 @dblclick         = "handleLogin(item)"
                 @dragstart        = "handleDragStart($event, item, index, $refs[`tree-item-${item.id}`][0])"
                 @dragover.prevent = "handleDragOver($event, item, index, group, $refs[`tree-item-${item.id}`][0])"
                 @drop             = "handleDrop($event, item, index)"
                 @dragleave        = "handleDragLeave"
                 @dragend          = "handleDragEnd"
                 @keydown.enter    = "handleLogin(item)"
                 @keydown.space    = "handleShowPoster(item)"
                 @keydown.f2       = "handleRenameOpen(item, index, $refs[`rename-input-${index}`][0])"
                 @keydown.delete   = "handleRemoveItem(item)"
                 @keydown.alt.r    = "handleOpenDetail(item)"
                 @keydown.up       = "handleMoveFocus('up')"
                 @keydown.down     = "handleMoveFocus('down')">
                <!-- item 图标 -->
                <q-btn class="session-icon"
                       :icon="item.type === 'dir' ? 'folder' : 'dns'"
                       flat
                       size="sm"/>
                <!-- item 名称 -->
                <div class="session-name full-width">
                    <div v-show="renameItem.id !== item.id" class="text-name">{{ itemName(item) }}</div>
                    <input v-model="renameItem.name"
                           v-show="renameItem.id === item.id"
                           type="text"
                           :ref="'rename-input-' + index"
                           class="rename-input no-outline no-border full-width"
                           :placeholder="item.host"
                           spellcheck="false"
                           @blur="handleRenameClose"
                           @click.stop=""
                           @dblclick.stop=""
                           @keydown.esc="handleRenameCancel(index, $refs[`rename-input-${index}`][0])"
                           @keydown.stop.delete=""
                           @keydown.stop.space=""
                           @keydown.stop.up=""
                           @keydown.stop.down=""
                           @keydown.stop.alt.r=""
                           @keydown.stop.enter="handleRenameFinish(index, $refs[`rename-input-${index}`][0])"
                           @compositionstart="renameItem.preventKeydown = true"
                           @compositionend="renameItem.preventKeydown = false">
                </div>
                <!-- item 简介 -->
                <div class="session-site text-right ellipsis q-pr-sm">{{ loading === item.id ? '正在连接...' : item.host }}</div>
            </div>
            <session-tree v-if="item.type === 'dir'"

                          :group         = "item.children"
                          :renameItem    = "renameItem"
                          :loading       = "loading"
                          :dragMove      = "dragMove"
                          :dragInto      = "dragInto"
                          :openMenu      = "openMenu"
                          :selected      = "selected"
                          :recursionNum  = "recursionNum + 1"

                          @show-menu     = "handleShowMenu"
                          @item-focus    = "handleItemFocus"
                          @login         = "handleLogin"
                          @drag-start    = "handleDragStart"
                          @drag-over     = "handleDragOver"
                          @drag-leave    = "handleDragLeave"
                          @drag-end      = "handleDragEnd"
                          @drop          = "handleDrop"
                          @show-poster   = "handleShowPoster"
                          @rename-open   = "handleRenameOpen"
                          @rename-close  = "handleRenameClose"
                          @rename-cancel = "handleRenameCancel"
                          @rename-finish = "handleRenameFinish"
                          @remove-item   = "handleRemoveItem"
                          @open-detail   = "handleOpenDetail"
                          @move-focus    = "handleMoveFocus"/>
        </div>
    </transition-group>
</template>

<script>

export default {
    name: 'SessionTree',
    props: {
        group      : Array,
        renameItem : Object,
        loading    : String,
        dragMove   : String,
        dragInto   : String,
        openMenu   : String,
        selected   : String,
        recursionNum: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
        }
    },
    computed: {
        itemName() {
            return item => item.name || item.host
        },
    },
    methods: {
        handleShowMenu(item, index, refs) {
            this.$emit('show-menu', item, index, refs)
        },
        handleItemFocus(id, treeItemEl) {
            this.$emit('item-focus', id, treeItemEl)
        },
        handleLogin(item) {
            this.$emit('login', item)
        },
        handleDragStart(event, item, index, dragEl) {
            this.$emit('drag-start', event, item, index, dragEl)
        },
        handleDragOver(event, item, index, group, dragEl) {
            this.$emit('drag-over', event, item, index, group, dragEl)
        },
        handleDragLeave() {
            this.$emit('drag-leave')
        },
        handleDragEnd() {
            this.$emit('drag-end')
        },
        handleDrop(event, item, index) {
            this.$emit('drop', event, item, index)
        },
        handleShowPoster(item) {
            this.$emit('show-poster', item)
        },
        handleRenameOpen(item, index, inputEl) {
            this.$emit('rename-open', item, index, inputEl)
        },
        handleRenameClose() {
            this.$emit('rename-close')
        },
        handleRenameCancel(index, inputEl) {
            this.$emit('rename-cancel', index, inputEl)
        },
        handleRenameFinish(index, inputEl) {
            this.$emit('rename-finish', index, inputEl)
        },
        handleRemoveItem(item) {
            this.$emit('remove-item', item)
        },
        handleOpenDetail(item) {
            this.$emit('open-detail', item)
        },
        handleMoveFocus(action) {
            this.$emit('move-focus', 'up')
        },
    },
    created() {
        console.log(this.recursionNum);
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
</style>
