<template>
    <q-menu touch-position
            context-menu
            ref="menu"
            @before-show="$emit('click')"
            @before-hide="$emit('close')"
            @keydown.f2="emitHandle('rename')"
            @keydown.meta.delete="emitHandle('delete')">
        <q-list dense style="min-width: 150px">
            <q-item clickable v-close-popup v-show="listItem.type === '-'">
                <q-item-section>以 Webstorm 编辑</q-item-section>
            </q-item>
            <q-item v-show="listItem.type === '-' || listItem.type === 'd'" 
                    clickable v-close-popup 
                    @click="emitHandle('download')">
                <q-item-section>{{ action === 'local' ? '上传' : '下载' }}</q-item-section>
            </q-item>
            <q-item clickable v-show="listItem.type === '-'">
                <q-item-section>选择打开方式</q-item-section>
                <q-item-section side>
                    <q-icon name="keyboard_arrow_right"/>
                </q-item-section>
                <q-menu anchor="top end" self="top start">
                    <q-list style="width: 120px">
                        <q-item dense clickable v-for="item in editorList" :key="item.name">
                            <q-item-section>{{ item.name }}</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
                <q-item-section>复制</q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
                <q-item-section>粘贴</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('remove')">
                <q-item-section>删除</q-item-section>
                <q-item-section side>
                    <q-item-label caption>Command + Delete</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('rename')">
                <q-item-section>重命名</q-item-section>
                <q-item-section side>
                    <q-item-label caption>F2</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
                <q-item-section>修改权限</q-item-section>
            </q-item>
            <q-separator/>
            <q-item clickable v-close-popup>
                <q-item-section>属性</q-item-section>
            </q-item>
        </q-list>
    </q-menu>
</template>

<script>
    export default {
        name: 'SFTPMenuList',
        props: {
            action: {
                type: String,
            },
            listItem: {
                type: Object,
                default: {},
            },
        },
        data() {
            return {
                editorList: [
                    { name: 'VSCode' },
                    { name: 'Sublime' },
                    { name: 'Atom' },
                    { name: 'Websotrm' },
                    { name: 'PHPStorm' },
                    { name: 'GoLand' },
                ],
            }
        },
        methods: {
            emitHandle(action) {
                this.$emit(action)
                this.$refs.menu.hide()
            },
        },
    }
</script>
