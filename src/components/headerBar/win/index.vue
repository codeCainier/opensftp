<template>
    <q-bar class="q-electron-drag">
        <!--<transfer-progress/>-->
        <dark-toggle/>
        <session-tag/>
        <q-space />
        <q-btn dense flat icon="minimize" @click="minimize"/>
        <q-btn dense flat icon="crop_square" @click="maximize"/>
        <q-btn dense flat icon="close" @click="closeApp"/>
    </q-bar>
</template>

<script>
import sessionTag from 'src/components/sessionTag'
import headerMenu from 'src/components/headerMenu'
import darkToggle from 'src/components/headerDarkToggle'
// import transferProgress from 'src/components/headerProgress'

export default {
    name: 'HeaderBarWin',
    components: {
        'session-tag': sessionTag,
        'header-menu': headerMenu,
        'dark-toggle': darkToggle,
        // 'transfer-progress': transferProgress,
    },
    data() {
        return {};
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
    }
}
</script>
