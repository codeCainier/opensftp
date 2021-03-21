<template>
    <q-menu touch-position
            context-menu
            ref="menu"
            @before-show    ="$emit('click')"
            @before-hide    ="$emit('close')"
            @keydown.enter  ="emitHandle('login')"
            @keydown.delete ="emitHandle('remove')"
            @keydown.f2     ="emitHandle('rename')"
            @keydown.alt.r  ="emitHandle('showAttr')">
        <q-list dense style="min-width: 150px">
            <q-item clickable v-close-popup @click="emitHandle('login')">
                <q-item-section>连接</q-item-section>
                <q-item-section side>
                    <q-item-label caption>Enter</q-item-label>
                </q-item-section>
            </q-item>
            <q-separator/>
            <q-item clickable v-close-popup @click="emitHandle('remove')">
                <q-item-section>删除</q-item-section>
                <q-item-section side>
                    <q-item-label caption>Delete</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('rename')">
                <q-item-section>重命名</q-item-section>
                <q-item-section side>
                    <q-item-label caption>F2</q-item-label>
                </q-item-section>
            </q-item>
            <q-separator/>
            <q-item clickable v-close-popup @click="emitHandle('showAttr')">
                <q-item-section>属性</q-item-section>
                <q-item-section side>
                    <q-item-label caption>Alt + R</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-menu>
</template>

<script>
export default {
    name: 'SessionItemMenuList',
    methods: {
        emitHandle(action) {
            this.$emit(action)
            this.$refs.menu.hide()
        },
    },
}
</script>
