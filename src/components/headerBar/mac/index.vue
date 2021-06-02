<template>
    <q-bar class="q-electron-drag" @dblclick.self="maximize">
        <q-btn dense flat round icon="lens" size="8.5px" color="red"    @click="closeApp"/>
        <q-btn dense flat round icon="lens" size="8.5px" color="yellow" @click="minimize"/>
        <q-btn dense flat round icon="lens" size="8.5px" color="green"  @click="maximize"/>
        <!-- 返回主页按钮 -->
        <q-btn v-if="$store.state.session.connectedList.length"
               icon="home" flat
               class="no-border-radius"
               @click="backHome"/>
        <!-- 会话标签列表 -->
        <session-tag v-if="$store.state.session.connectedList.length"/>
        <q-space/>
        <!-- 切换深色浅色模式 -->
        <dark-toggle/>
        <!-- 开启系统设置 -->
        <q-btn icon="settings" flat round size="xs" @click="settingToggle"/>
    </q-bar>
</template>

<script>
import sessionTag from 'src/components/sessionTag'
import headerMenu from 'src/components/headerMenu'
import darkToggle from 'src/components/headerDarkToggle'

export default {
    name: 'HeaderBarMac',
    components: {
        'session-tag': sessionTag,
        'header-menu': headerMenu,
        'dark-toggle': darkToggle,
    },
    watch: {
        '$store.state.session.conn': function (newVal) {
            if (!newVal.length) this.backHome()
        },
    },
    methods: {
        minimize() {
            this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
        },
        maximize() {
            const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow()
            win.isMaximized() ? win.unmaximize() : win.maximize()
        },
        closeApp() {
            this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
        },
        backHome() {
            if (this.$route.path === '/home') return
            this.$store.commit('session/SET_ACTIVE', null)
            this.$router.push({ path: '/' })
        },
        settingToggle() {
            this.$store.commit('setting/SETTING_TOGGLE')
        },
    },
}
</script>
