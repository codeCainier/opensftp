<template>
    <div id='q-app'
         v-if="isMainRenderProcess"
         :class="{ 'disable-aero-blur': !$store.state.setting.aeroEnable }">
        <router-view/>
    </div>
</template>

<script>
    import path from 'path'
    import connect from 'src/process/connect'
    import { remote } from 'electron'

    export default {
        name: 'App',
        data() {
            return {
                // 是否为主渲染进程
                isMainRenderProcess: true,
            }
        },
        methods: {
            // 关闭所有会话连接
            closeAllConnect() {
                const closeAllConnect = event => {
                    const { connectingList, connectedList } = this.$store.state.session
                    connectingList.forEach(item => item.close())
                    connectedList.forEach(item => item.close())
                    window.removeEventListener('beforeunload', closeAllConnect);
                }
                window.addEventListener('beforeunload', closeAllConnect);
                if (remote.BrowserWindow.getAllWindows().length !== 1) this.alert('窗口错误')
            },
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
            // TODO: 要做到主渲染进程刷新时，关闭所有后期开启的 window
        },
        mounted() {
            // IMPORTANT! 注意，生命周期中的代码若不加以判断，所有渲染进程中都会执行
            if (this.isMainRenderProcess) {
                this.closeAllConnect()
            }
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
