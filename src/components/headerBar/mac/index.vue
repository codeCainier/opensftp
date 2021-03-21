<template>
    <q-bar class="q-electron-drag">
        <q-btn dense flat round icon="lens" size="8.5px" color="red"    @click="closeApp"/>
        <q-btn dense flat round icon="lens" size="8.5px" color="yellow" @click="minimize"/>
        <q-btn dense flat round icon="lens" size="8.5px" color="green"  @click="maximize"/>
        <session-tag/>
        <q-space />
        <transfer-progress/>
        <dark-toggle/>
    </q-bar>
</template>

<script>
import sessionTag from 'src/components/sessionTag'
import headerMenu from 'src/components/headerMenu'
import darkToggle from 'src/components/headerDarkToggle'
import transferProgress from 'src/components/headerProgress'

export default {
    name: 'HeaderBarMac',
    components: {
        'session-tag': sessionTag,
        'header-menu': headerMenu,
        'dark-toggle': darkToggle,
        'transfer-progress': transferProgress,
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
    },
}
</script>
