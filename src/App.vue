<template>
    <div id='q-app'
         v-if="isMainRenderProcess"
         :class="{ 'disable-aero-blur': !$store.state.setting.aeroEnable }">
        <!--<router-view/>-->
        <button type="button" @click="test">Open process connect</button>
    </div>
</template>

<script>
    import electron from 'electron'
    import path from 'path'
    import connect from 'src/process/connect'

    export default {
        name: 'App',
        data() {
            return {
                // 是否为主渲染进程
                isMainRenderProcess: true,
            }
        },
        methods: {
            test() {
                // 当前窗口 ID
                this.winId = electron.remote.BrowserWindow.getFocusedWindow().id
                // 使用创建新窗口方法，创建会话进程
                this.win = new electron.remote.BrowserWindow({
                    show   : false,
                    width  : 300,
                    height : 300,
                    webPreferences: {
                        nodeIntegration: true,
                    },
                })
                const loadURL = process.env.NODE_ENV === 'development'
                    ? path.join(location.origin, 'connect.html')
                    : location.origin + path.join(path.dirname(location.pathname), 'connect.html')

                this.win.loadURL(loadURL)
            }
        },
        beforeCreate() {
            this.$router.push({ path: '/' })
        },
        created() {
            // 读取模版名称
            const templateName = path.basename(location.pathname, '.html')
            // 根据模版名称得出是否为主渲染进程
            this.isMainRenderProcess = templateName === '' || templateName === 'index'

            // 根据不同模版，执行不同渲染进程所需代码
            // 若模版为 connect
            if (templateName === 'connect') connect()
        },
        mounted() {
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
