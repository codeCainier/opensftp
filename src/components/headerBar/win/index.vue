<template>
    <q-bar class="q-electron-drag">
        <q-btn style="font-size: 1rem" class="no-border-radius" flat no-caps>Open SftpJs
            <header-menu/>
        </q-btn>
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

export default {
    name: 'HeaderBarWin',
    components: {
        'session-tag': sessionTag,
        'header-menu': headerMenu,
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
