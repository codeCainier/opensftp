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

    export default {
        name: 'App',
        data() {
            return {
                // 是否为主渲染进程
                isMainRenderProcess: true,
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
            // TODO: 要做到主渲染进程刷新时，关闭所有后期开启的 window
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
