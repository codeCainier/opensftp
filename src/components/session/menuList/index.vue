<template>
    <q-menu touch-position
            context-menu
            ref="menu"
            @before-show="$emit('show')"
            @before-hide="$emit('close')"
            @keydown.f2="emitHandle('rename')"
            @keydown.delete="emitHandle('delete')">
        <q-list dense style="min-width: 150px">
            <!--<q-item clickable v-close-popup v-show="listItem.type === '-'">-->
            <!--    <q-item-section>以 Webstorm 编辑</q-item-section>-->
            <!--</q-item>-->
            <q-item clickable v-close-popup
                    @click="emitHandle(action === 'local' ? 'upload' : 'download')">
                <q-item-section>{{ action === 'local' ? '上传' : '下载' }}</q-item-section>
            </q-item>
            <q-item clickable v-show="enableEdit()">
                <q-item-section>选择编辑方式</q-item-section>
                <q-item-section side>
                    <q-icon name="keyboard_arrow_right" size="1em"/>
                </q-item-section>
                <q-menu anchor="top end" self="top start" :offset="[5, 0]">
                    <q-list style="width: 150px" dense>
                        <q-item clickable v-close-popup
                                v-for="item in $store.getters['editor/EDITOR_LIST']()"
                                :key="item.name"
                                @click="emitHandle('edit', item)">
                            <q-item-section>{{ item.name }}</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-item>
            <q-separator />
            <q-item clickable>
                <q-item-section>新建</q-item-section>
                <q-item-section side>
                    <q-icon name="keyboard_arrow_right" size="1em"/>
                </q-item-section>
                <q-menu anchor="top end" self="top start" :offset="[5, 0]">
                    <q-list style="width: 150px" dense>
                        <q-item clickable v-close-popup @click="emitHandle('mkdir')">
                            <q-item-section>新建文件夹</q-item-section>
                            <!--<q-item-section side>-->
                            <!--    <q-item-label caption>F</q-item-label>-->
                            <!--</q-item-section>-->
                        </q-item>
                        <q-item clickable v-close-popup @click="emitHandle('write-file')">
                            <q-item-section>新建文件</q-item-section>
                            <!--<q-item-section side>-->
                            <!--    <q-item-label caption>D</q-item-label>-->
                            <!--</q-item-section>-->
                        </q-item>
                    </q-list>
                </q-menu>
            </q-item>
            <!--<q-item clickable v-close-popup>-->
            <!--    <q-item-section>复制</q-item-section>-->
            <!--</q-item>-->
            <!--<q-item clickable v-close-popup>-->
            <!--    <q-item-section>粘贴</q-item-section>-->
            <!--</q-item>-->
            <q-item clickable v-close-popup @click="emitHandle('refresh')">
                <q-item-section>刷新</q-item-section>
                <!--<q-item-section side>-->
                <!--    <q-item-label caption>R</q-item-label>-->
                <!--</q-item-section>-->
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('rename')">
                <q-item-section>重命名</q-item-section>
                <q-item-section side>
                    <q-item-label caption>F2</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('remove')">
                <q-item-section>删除</q-item-section>
                <q-item-section side>
                    <q-item-label caption>Delete</q-item-label>
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="emitHandle('show-hide')">
                <q-item-section>{{ showHideFile ? '不显示隐藏文件' : '显示隐藏文件' }}</q-item-section>
                <!--<q-item-section side>-->
                <!--    <q-item-label caption>H</q-item-label>-->
                <!--</q-item-section>-->
            </q-item>
            <!--<q-item clickable v-close-popup>-->
            <!--    <q-item-section>修改权限</q-item-section>-->
            <!--</q-item>-->
            <!--<q-separator/>-->
            <!--<q-item clickable v-close-popup>-->
            <!--    <q-item-section>属性</q-item-section>-->
            <!--</q-item>-->
        </q-list>
    </q-menu>
</template>

<script>
    import path from 'path'

    export default {
        name: 'SFTPMenuList',
        props: {
            action: String,
            listItem: Object,
            showHideFile: Boolean,
        },
        computed: {
            enableEdit() {
                return () => {
                    // FIXME: 本地文件下系统编辑暂未开放
                    if (this.action === 'local') return false
                    // 目录、链接类型文件不允许编辑
                    if (['d', 'l'].includes(this.listItem.type)) return false
                    // 文件大小大于 10 MB 不允许编辑
                    if (this.listItem.size > 10 * 1024 ** 2) return false
                    // 文件后缀
                    const suffix = path.extname(this.listItem.name)
                    // 不可编辑文件
                    if ([
                        // 压缩文件
                        '.rar', '.zip', '.tar', '.tgz', '.tar.gz', '.7z',
                        // 图片文件
                        '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ai', '.psd', '.tiff',
                        // 图标文件
                        '.ico', '.icon',
                        // 音频文件
                        '.mp3',
                        // 视频文件
                        '.mp4', '.avi', '.ts',
                        // 可执行程序
                        '.exe', '.dmg',
                    ].includes(suffix)) return false
                    // 其他默认允许编辑
                    return true
                }
            },
        },
        methods: {
            emitHandle(action, props) {
                this.$emit(action, props)
                this.$refs.menu.hide()
            },
        },
    }
</script>
