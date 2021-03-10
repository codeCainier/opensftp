<template>
    <q-scroll-area class="full-height">
        <q-list dense>
            <q-item v-for="(item, index) in list"
                    :key="item.sessionKey"
                    :ref="'session-' + index"
                    :class="{ 'focus-temp': renameItem.sessionKey === item.sessionKey || openMenu === index }"
                    class="list-item cursor-inherit"
                    clickable v-ripple
                    @click="selectSession(index)"
                    @dblclick="login(item)"
                    @keydown.enter="login(item)"
                    @keydown.f2="renameOpen(item, index)"
                    @keydown.delete="removeItem(item)"
                    @keydown.alt.r="showAttr(item)"
                    @keydown.up="moveFocus('up')"
                    @keydown.down="moveFocus('down')">
                <q-item-section avatar>
                    <q-avatar rounded size="md">
                        <q-spinner-gears v-if="loading === item.sessionKey" class="session-icon" />
                        <q-btn v-else flat
                               class="session-icon"
                               :class="{ 'text-positive': $q.dark.isActive }"
                               icon="dns" size="sm"/>
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-section v-show="renameItem.sessionKey !== item.sessionKey">{{ itemName(item) }}</q-item-section>
                    <input v-model="renameItem.name"
                           v-show="renameItem.sessionKey === item.sessionKey"
                           type="text"
                           ref="rename-input"
                           class="rename-input no-outline no-border no-padding"
                           :placeholder="item.host"
                           @blur="renameClose"
                           @click.stop=""
                           @dblclick.stop=""
                           @keydown.esc="renameCancel(index)"
                           @keydown.stop.delete=""
                           @keydown.stop.up=""
                           @keydown.stop.down=""
                           @keydown.stop.alt.r=""
                           @keydown.stop.enter="$refs['rename-input'][index].blur()">
                </q-item-section>
                <q-item-section side>
                    <q-item-label style="width: 100px" caption class="site-label">
                        {{ loading === item.sessionKey ? '正在连接...' : item.host }}
                    </q-item-label>
                </q-item-section>
                <menu-list @click="openMenu = index"
                           @close="selectSession(index)"
                           @login="login(item)"
                           @rename="renameOpen(item, index)"
                           @remove="removeItem(item)"
                           @showAttr="showAttr(item)"/>
            </q-item>
        </q-list>
        <attr-panel ref="attr-panel" @update="getList"/>
    </q-scroll-area>
</template>

<script>
import { uid } from 'quasar'
import menuList from './menuList'
import attrPanel from './attrPanel'

export default {
    name: 'SessionPool',
    components: {
        'menu-list': menuList,
        'attr-panel': attrPanel,
    },
    data() {
        return {
            loading: null,
            selected: null,
            openMenu: null,
            renameItem: {},
            list: [],
        }
    },
    computed: {
        itemName() {
            return item => item.name || item.host
        }
    },
    watch: {
    },
    methods: {
        getList() {
            this.list = ((arr = []) => {
                this.$store.state.session.pool.forEach((sessionInfo, sessionKey) => {
                    arr.push({ sessionKey, ...sessionInfo })
                })
                return arr
            })()
        },
        // 连接会话
        login(item) {
            this.loading = item.sessionKey

            const { host, port, username, password } = item

            this.$store.commit('session/SESSION_ADD', { host, port, username, password,
                callback: sessionKey => {
                    this.$store.commit('session/TAGS_ADD', {
                        id: uid(),
                        params: this.$store.state.session.pool.get(sessionKey)
                    })
                    this.$router.push({ path: '/sftp' })
                    this.loading = null
                }
            })
        },
        // 重命名开始
        renameOpen(item, index) {
            this.renameItem = this.tools.clone(item)
            this.renameItem.oldname = this.renameItem.name
            // FIXME: nextTick 无效
            setTimeout(() => this.$refs['rename-input'][index].focus(), 100)
        },
        // 重命名结束
        renameClose() {
            this.$store.commit('session/SESSION_UPDATE', {
                sessionKey: this.renameItem.sessionKey,
                updateItem: {
                    name: this.renameItem.name,
                },
            })
            this.renameItem = {}
            this.getList()
            this.sessionFocus()
        },
        // 重命名取消
        renameCancel(index) {
            this.renameItem.name = this.renameItem.oldname
            this.$refs['rename-input'][index].blur()
        },
        // 删除项目
        removeItem(item) {
            this.tools.confirm({
                message: `确定要删除会话 [${item.name}] 吗？`,
                confirm: () => {
                    this.$store.commit('session/SESSION_DEL', item.sessionKey)
                    this.getList()
                },
                cancel: () => {}
            })
        },
        // 显示属性
        showAttr(item) {
            this.$refs['attr-panel'].open(item)
        },
        // 移动聚焦元素
        moveFocus(action) {
            if (action === 'up' && this.selected !== 0) this.selected -= 1
            if (action === 'down' && this.selected !== this.list.length - 1) this.selected += 1
            this.sessionFocus()
        },
        // 会话聚焦
        sessionFocus() {
            this.$refs[`session-${this.selected}`][0].$el.focus()
        },
        // 选择会话
        selectSession(index) {
            this.openMenu = null
            this.selected = index
            this.sessionFocus()
        },
    },
    created() {
        this.getList()
    },
};
</script>

<style scoped lang="sass">
    .list-item
        border-radius: 4px
        .session-icon
            color: $primary
        &:focus,&.focus-temp
            background: $primary
            color: #FFFFFF
            .session-icon,.site-label
                color: #FFFFFF
</style>
