<template>
    <q-menu touch-position
            context-menu
            ref="menu"
            @before-show="$emit('show')"
            @before-hide="$emit('close')"
            @keydown.f2="emitHandle('rename')"
            @keydown.delete="emitHandle('delete')">
        <q-list dense style="min-width: 150px">
<!--            <q-item clickable v-close-popup v-show="listItem.type === '-'">-->
<!--                <q-item-section>以 Webstorm 编辑</q-item-section>-->
<!--            </q-item>-->
            <q-item clickable v-close-popup
                    @click="emitHandle(action === 'local' ? 'upload' : 'download')">
                <q-item-section>{{ action === 'local' ? '上传' : '下载' }}</q-item-section>
            </q-item>
<!--            <q-item clickable v-show="listItem.type === '-'">-->
<!--                <q-item-section>选择打开方式</q-item-section>-->
<!--                <q-item-section side>-->
<!--                    <q-icon name="keyboard_arrow_right"/>-->
<!--                </q-item-section>-->
<!--                <q-menu anchor="top end" self="top start">-->
<!--                    <q-list style="width: 120px">-->
<!--                        <q-item dense clickable v-for="item in editorList" :key="item.name">-->
<!--                            <q-item-section>{{ item.name }}</q-item-section>-->
<!--                        </q-item>-->
<!--                    </q-list>-->
<!--                </q-menu>-->
<!--            </q-item>-->
            <q-separator />
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
<!--            <q-item clickable v-close-popup>-->
<!--                <q-item-section>复制</q-item-section>-->
<!--            </q-item>-->
<!--            <q-item clickable v-close-popup>-->
<!--                <q-item-section>粘贴</q-item-section>-->
<!--            </q-item>-->
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
            <q-item clickable v-close-popup @click="emitHandle('show-hide')">
                <q-item-section>{{ showHideFile ? '不显示隐藏文件' : '显示隐藏文件' }}</q-item-section>
                <q-item-section side>
                    <q-item-label caption>H</q-item-label>
                </q-item-section>
            </q-item>
<!--            <q-item clickable v-close-popup>-->
<!--                <q-item-section>修改权限</q-item-section>-->
<!--            </q-item>-->
<!--            <q-separator/>-->
<!--            <q-item clickable v-close-popup>-->
<!--                <q-item-section>属性</q-item-section>-->
<!--            </q-item>-->
        </q-list>
    </q-menu>
</template>

<script>
    export default {
        name: 'SFTPMenuList',
        props: {
            action: String,
            listItem: {
                type: Object,
                default: {},
            },
            showHideFile: Boolean,
        },
        data() {
            return {
                editorList: [
                    { name: 'VSCode' },
                    { name: 'Sublime' },
                    { name: 'Atom' },
                    { name: 'WebStorm' },
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
