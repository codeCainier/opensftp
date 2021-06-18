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
import electron from 'electron'
import fs from 'fs'

const { remote } = electron

// FIXME: 本地删除大目录时，可能出现处理时间过长导致进程间 timeout 情况
// FIXME: Confirm 组件取消回调 Promise 报错
// FIXME: 苹果 App 开发者不受信任问题
// FIXME: SSH 连接后，默认信息展示
// FIXME: SSH cat 命令结尾换行问题
// FIXME: SSH 切换输入法导致的字符重复问题
// FIXME: Session 断开重连
// FIXME: Header 双击全屏
// FIXME: Header 窗口控制按钮样式
// FIXME: Header 半透明毛玻璃
// FIXME: Header Home 按钮优化

// TODO: Transmit 中断功能
// TODO: windows 安装路径选择

// FIXME: 新创建的 Quasar Electron 项目，开发环境中，__statics 有值，但 F12 Console __statics 为空
if (process.env.NODE_ENV === 'development') global.__statics = __statics
// FIXME: 新创建的 Quasar Electron 项目，生产环境中，__statics 为空，但 F12 Console __statics 有值
if (process.env.NODE_ENV !== 'development') global.__statics = __dirname

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
            if (remote.BrowserWindow.getAllWindows().length !== 1) this.alert('窗口错误，点击刷新窗口')
                .then(() => {
                    location.reload()
                })
        },
        // 清除编辑远程文件产生的缓存
        clearEditRemoteCache() {
            const cacheDir  = path.join(global.__statics, '../cache/remoteEdit')
            fs.rmdirSync(cacheDir, { recursive: true })
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
        // 若不是主渲染进程，则不执行后续函数
        if (!this.isMainRenderProcess) return
        this.closeAllConnect()
        this.clearEditRemoteCache()
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
