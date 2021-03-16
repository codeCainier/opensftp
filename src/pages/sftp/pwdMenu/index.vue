<template>
    <q-menu touch-position
            context-menu
            ref="menu"
            @before-show="$emit('before-show', $event)">
        <q-list dense style="min-width: 150px">
            <q-item clickable>
                <q-item-section>新建</q-item-section>
                <q-item-section side>
                    <q-icon name="keyboard_arrow_right"/>
                </q-item-section>
                <q-menu anchor="top end" self="top start" :offset="[5, 0]">
                    <q-list style="width: 150px" dense>
                        <q-item clickable v-close-popup @click="emitHandle('mkdir')">
                            <q-item-section>新建文件夹</q-item-section>
                            <q-item-section side>
                                <q-item-label caption>F</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="emitHandle('write-file')">
                            <q-item-section>新建文件</q-item-section>
                            <q-item-section side>
                                <q-item-label caption>D</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('refresh')">
                <q-item-section>刷新</q-item-section>
                <q-item-section side>
                    <q-item-label caption>R</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('show-hide')">
                <q-item-section>{{ showHideFile ? '不显示隐藏文件' : '显示隐藏文件' }}</q-item-section>
                <q-item-section side>
                    <q-item-label caption>H</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-menu>
</template>

<script>
export default {
    name: 'PwdMenu',
    props: {
        action: String,
        showHideFile: Boolean,
    },
    methods: {
        emitHandle(action) {
            this.$emit(action)
            this.$refs.menu.hide()
        },
    },
}
</script>

<style scoped>

</style>
