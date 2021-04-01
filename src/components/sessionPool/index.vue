<template>
    <q-scroll-area class="full-height">
        <q-list dense>
            <q-item v-for="(item, index) in $store.state.session.pool"
                    :key="item.id"
                    :ref="'session-' + index"
                    :class="{ 'focus-temp': renameItem.id === item.id || openMenu === index }"
                    class="list-item cursor-inherit"
                    clickable v-ripple
                    @click          ="selectSession(index)"
                    @click.right    ="showSessionMenu(item, index)"
                    @dblclick       ="login(item)"
                    @keydown.enter  ="login(item)"
                    @keydown.space  ="showSessionPoster(item)"
                    @keydown.f2     ="renameOpen(item, index)"
                    @keydown.delete ="removeItem(item)"
                    @keydown.alt.r  ="showAttr(item)"
                    @keydown.up     ="moveFocus('up')"
                    @keydown.down   ="moveFocus('down')">
                <q-item-section avatar>
                    <q-avatar rounded size="md">
                        <q-spinner-gears v-if="loading === item.id" class="session-icon" />
                        <q-btn v-else flat
                               class="session-icon"
                               :class="{ 'text-positive': $q.dark.isActive }"
                               icon="dns" size="sm"/>
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-section v-show="renameItem.id !== item.id">{{ itemName(item) }}</q-item-section>
                    <input v-model="renameItem.name"
                           v-show="renameItem.id === item.id"
                           type="text"
                           :ref="'rename-input-' + index"
                           class="rename-input no-outline no-border no-padding"
                           :placeholder="item.host"
                           spellcheck="false"
                           @blur="renameClose"
                           @click.stop=""
                           @dblclick.stop=""
                           @keydown.esc="renameCancel(index)"
                           @keydown.stop.delete=""
                           @keydown.stop.space=""
                           @keydown.stop.up=""
                           @keydown.stop.down=""
                           @keydown.stop.alt.r=""
                           @keydown.stop.enter="renameFinish(index)"
                           @compositionstart="renameItem.preventKeydown = true"
                           @compositionend="renameItem.preventKeydown = false">
                </q-item-section>
                <q-item-section side>
                    <q-item-label style="width: 100px" caption class="site-label">
                        {{ loading === item.id ? '正在连接...' : item.host }}
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
        <attr-panel ref="attr-panel"/>

        <session-poster ref="session-poster"/>

    </q-scroll-area>
</template>

<script>
import attrPanel from 'src/components/sessionPool/attrPanel'
import sessionPoster from 'src/components/sessionPoster'

export default {
    name: 'SessionPool',
    components: {
        'attr-panel': attrPanel,
        'session-poster': sessionPoster,
    },
    data() {
        return {
            loading          : null,
            selected         : null,
            openMenu         : null,
            renameItem       : {},
            sessionMenu      : null,
            sessionMenuItem  : null,
            sessionMenuIndex : null,
        }
    },
    computed: {
        itemName() {
            return item => item.name || item.host
        },
    },
    methods: {
        // 连接会话
        login(item) {
            this.loading = item.id
            this.$store.dispatch('session/LOGIN', item)
                .then(() => this.$router.push({ path: '/session' }))
                .catch(err => this.confirm(err))
                .finally(() => this.loading = false)
        },
        // 重命名开始
        renameOpen(item, index) {
            this.renameItem = this.tools.clone(item)
            this.renameItem.oldname = this.renameItem.name
            // TODO: nextTick 无效
            setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
        },
        // 重命名完成
        renameFinish(index) {
            // 防止输入法回车触发完成事件
            if (!this.renameItem.preventKeydown) this.$refs['rename-input-' + index][0].blur()
        },
        // 重命名结束
        renameClose() {
            this.$store.commit('session/UPDATE', {
                id: this.renameItem.id,
                updateItem: {
                    name: this.renameItem.name,
                },
            })
            this.renameItem = {}
            this.sessionFocus()
        },
        // 重命名取消
        renameCancel(index) {
            this.renameItem.name = this.renameItem.oldname
            this.$refs[`rename-input-${index}`][0].blur()
        },
        // 删除项目
        removeItem(item) {
            this.tools.confirm({
                message: `确定要删除会话 ${item.name} 吗？`,
                confirm: () => {
                    this.$store.commit('session/DELETE', item.id)
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
        // 创建会话菜单
        createSessionMenu() {
            const { remote } = this.$q.electron
            const sessionMenu = new remote.Menu()

            sessionMenu.append(new remote.MenuItem({
                label: '连接',
                click: () => this.login(this.sessionMenuItem),
            }))

            sessionMenu.append(new remote.MenuItem({ type: 'separator' }))

            sessionMenu.append(new remote.MenuItem({
                label: '删除',
                click: () => this.removeItem(this.sessionMenuItem),
            }))

            sessionMenu.append(new remote.MenuItem({
                label: '重命名',
                click: () => this.renameOpen(this.sessionMenuItem, this.sessionMenuIndex),
            }))

            sessionMenu.append(new remote.MenuItem({ type: 'separator' }))

            sessionMenu.append(new remote.MenuItem({
                label: '高级设置',
                click: () => this.showAttr(this.sessionMenuItem),
            }))

            this.sessionMenu = sessionMenu
        },
        // 显示文件右键菜单
        showSessionMenu(item, index) {
            this.selected         = index
            this.openMenu         = item.name
            this.sessionMenuItem  = item
            this.sessionMenuIndex = index
            this.sessionMenu.popup({
                callback: () => this.sessionFocus(),
            })
        },
        showSessionPoster(item) {
            this.$refs['session-poster'].open(item)
        },
    },
    created() {
        this.createSessionMenu()
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
