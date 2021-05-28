<template>
    <div id='q-app' :class="{ 'disable-aero-blur': !$store.state.setting.aeroEnable }">
        <router-view/>
    </div>
</template>

<script>
    import {LocalStorage} from "quasar";
    import path from 'path'

    export default {
        name: 'App',
        beforeCreate() {
            this.$router.push({ path: '/' })
        },
        mounted() {
            // const cache = LocalStorage.getItem('sessionPool')
            // console.log(JSON.stringify(cache));
            const { electron } = this.$q
            const focusWinId = electron.remote.BrowserWindow.getFocusedWindow().id
            const connectWindow = new electron.remote.BrowserWindow({
                show   : true,
                width  : 300,
                height : 300,
                webPreferences: {
                    nodeIntegration: true,
                },
            })
            const connectFile = path.join('file://', __statics, 'statics', 'html', 'connect.html')
            connectWindow.loadURL(connectFile)
                .then(() => {
                    connectWindow.webContents.send('connect-request', {
                        action: 'connect',
                    }, focusWinId)
                })

            electron.ipcRenderer.on('connect-response-success', (event, conn) => {
                console.log('success')
            })

            electron.ipcRenderer.on('connect-response-error', (event, err) => {
                console.log('error')
            })
        },
    }
</script>

<style lang="sass">
body
    &.body--light
        .disable-aero-blur
            background: #FFFFFF
    &.body--dark
        .disable-aero-blur
            background: $dark
</style>
