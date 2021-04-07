<template>
    <transition-group name="flip-list" tag="div">
        <div v-for="(item, index) in group"
             :key="item.id"
             class="list-item">
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
                 @click            = "$emit('focus', index)"
                 @click.right      = "$emit('menu', item, index)"
                 @dblclick         = "$emit('login', item)"
                 @dragstart        = "$emit('drag-start', $event, item, index)"
                 @dragover.prevent = "$emit('drag-over', $event, item, index, group)"
                 @drop             = "$emit('drop', $event, item, index)"
                 @dragleave        = "$emit('drag-leave')"
                 @dragend          = "$emit('drag-end')"
                 @keydown.enter    = "$emit('login', item)"
                 @keydown.space    = "$emit('show-poster', item)"
                 @keydown.f2       = "$emit('rename-open', item, index)"
                 @keydown.delete   = "$emit('remove-item', item)"
                 @keydown.alt.r    = "$emit('open-detail', item)"
                 @keydown.up       = "$emit('move-focus', 'up')"
                 @keydown.down     = "$emit('move-focus', 'down')">
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
                           @blur="$emit('rename-close')"
                           @click.stop=""
                           @dblclick.stop=""
                           @keydown.esc="$emit('rename-cancel', index)"
                           @keydown.stop.delete=""
                           @keydown.stop.space=""
                           @keydown.stop.up=""
                           @keydown.stop.down=""
                           @keydown.stop.alt.r=""
                           @keydown.stop.enter="$emit('rename-finish', index)"
                           @compositionstart="renameItem.preventKeydown = true"
                           @compositionend="renameItem.preventKeydown = false">
                </div>
                <!-- item 简介 -->
                <div class="session-site text-right ellipsis q-pr-sm">{{ loading === item.id ? '正在连接...' : item.host }}</div>
            </div>
            <session-tree v-if="item.type === 'dir'"
                          :group="item.children"
                          :renameItem="renameItem"
                          :loading="loading"
                          :dragMove="dragMove"
                          :dragInto="dragInto"
                          :openMenu="openMenu"
                          :selected="selected"
                          @menu          = "$emit('menu', item, index)"
                          @focus         = "$emit('focus', index)"
                          @login         = "$emit('login', item)"
                          @drag-start    = "$emit('drag-start', $event, item, index)"
                          @drag-over     = "$emit('drag-over', $event, item, index, group)"
                          @drag-leave    = "$emit('drag-leave')"
                          @drag-end      = "$emit('drag-end')"
                          @drop          = "$emit('drop', $event, item, index)"
                          @show-poster   = "$emit('show-poster', item)"
                          @rename-open   = "$emit('rename-open', item, index)"
                          @rename-close  = "$emit('rename-close')"
                          @rename-cancel = "$emit('rename-cancel', index)"
                          @rename-finish = "$emit('rename-finish', index)"
                          @remove-item   = "$emit('remove-item', item)"
                          @open-detail   = "$emit('open-detail', item)"
                          @move-focus    = "$emit('move-focus', 'up')"/>
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
    }
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
