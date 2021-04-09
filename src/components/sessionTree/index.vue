<template>
    <transition-group name="flip-list" tag="div">
        <div v-for="(item, index) in group"
             :key="item.id"
             class="list-item"
             :style="{ 'padding-left': recursionNum * 20 + 'px' }">
            <tree-node :group="group"
                       :nodeItem="item"
                       :nodeIndex="index"
                       :recursionNum="recursionNum"/>
        </div>
    </transition-group>
</template>

<script>
import treeNode from 'src/components/sessionTree/treeNode'

export default {
    name: 'SessionTree',
    components: {
        'tree-node': treeNode,
    },
    props: {
        group : Array,
        recursionNum: {
            type: Number,
            default: 0,
        },
    },
}
</script>

<style scoped lang="sass">
.flip-list-move
    transition: transform .3s
</style>
