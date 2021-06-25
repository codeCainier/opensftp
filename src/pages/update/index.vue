<template>
    <div class="update-panel q-pa-md">
        <!-- Header -->
        <div class="panel-header">
            <div class="title q-mb-sm">新版本的 OpenSFTP 已经发布</div>
            <div class="intro">OpenSFTP v{{ version }} 可供下载，您现在的版本是 v{{ config.version }}，要现在更新吗？</div>
        </div>
        <!-- Section -->
        <div class="panel-section relative-position q-my-md full-height overflow-auto">
            <!-- Loading -->
            <q-inner-loading :showing="loading" style="z-index: 100">
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
            <div class="markdown-preview" v-html="mdPreview(updateLog)"></div>
        </div>
        <!-- Progress -->
        <q-linear-progress stripe rounded size="10px" :value="progress" class="q-my-md"/>
        <!-- Footer -->
        <div class="panel-footer">
            <!-- 控制按钮 -->
            <div class="row" v-if="progress === 0">
                <div class="auto-update-switch flex items-center q-gutter-x-xs">
                    <input v-model="autoUpdate" id="auto-update-switch" type="checkbox"/>
                    <label for="auto-update-switch">以后自动下载并安装更新</label>
                </div>
                <q-space/>
                <div class="q-gutter-x-md">
                    <button type="button" @click="cancel">取消</button>
                    <button type="button" class="bg-primary" @click="startUpdate">开始更新</button>
                </div>
            </div>
            <!-- 下载信息 -->
            <div class="row" v-else>
                <div>{{ speedLabel() }}</div>
                <q-space/>
                <div>{{ progressLabel() }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import electron from 'electron'
import 'highlight.js/styles/atom-one-dark.css'
import marked from 'marked'
import hLight from 'highlight.js'
import { alert, confirm } from 'src/utils/dialog'

const { ipcRenderer } = electron

export default {
    name: 'Update',
    data() {
        return {
            version: '-',
            autoUpdate: false,
            updateLog: '',
            loading: true,
            progress: 0,
            speed: 0,
        }
    },
    computed: {
        mdPreview() {
            return markdown => {
                this.$nextTick(() => {
                    const codeList = [...document.querySelectorAll('.markdown-preview pre code')];
                    codeList.forEach((item) => hLight.highlightBlock(item));
                });
                return marked(markdown);
            }
        },
        formatFlow() {
            return flow => this.tools.formatFlow(flow)
        },
        speedLabel() {
            return () => this.formatFlow(this.speed).toLocaleLowerCase() + '/s'
        },
        progressLabel() {
            return () => (this.progress * 100).toFixed(2) + '%'
        },
    },
    methods: {
        // 获取更新日志
        getUpdateLog() {
            this.loading = true

            this.ajax.get({
                path: '/v1/version/log',
                params: {
                    version: 'v' + this.version,
                },
            })
                .then(res => {
                    this.updateLog = res.data.updateLog
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        // 取消更新
        cancel() {
            window.close()
        },
        // 开始更新
        startUpdate() {
            // 若勾选了自动更新功能
            if (this.autoUpdate) this.$store.commit('setting/UPDATE', { autoUpdate: true })
            // 下载进度初始化
            this.progress = 0
            this.speed = 0
            // 更新进度方法
            const updateProgress = (event, progressObj) => {
                progressObj = JSON.parse(progressObj)
                this.progress = Number(progressObj.percent) / 100
                this.speed = Number(progressObj.bytesPerSecond)
            }
            // 向主进程发送下载更新请求
            ipcRenderer.send('download-update')
            // 监听更新包下载进度
            ipcRenderer.on('updater-download-progress', updateProgress)
            // 监听更新包下载成功
            ipcRenderer.once('updater-download-success', async () => {
                // 取消监听下载进度
                ipcRenderer.removeListener('updater-download-progress', updateProgress)
                // 下载更新成功提示
                confirm({
                    message: '更新成功，重启后生效',
                    textConfirm: '立即重启',
                    textCancel: '稍后重启',
                })
                    .then(() => ipcRenderer.send('quit-and-install'))
                    .finally(() => window.close())
            })
            // 监听更新包下载失败
            ipcRenderer.once('updater-download-error', async () => {
                // 取消监听下载进度
                ipcRenderer.removeListener('updater-download-progress', updateProgress)
                // 下载更新失败提示
                await alert('更新失败')
            })
        },
    },
    created() {
        // 向主进程获取更新信息
        ipcRenderer.send('get-update-info-req')
        // 监听主进程返回的更新信息
        ipcRenderer.once('get-update-info-res', (event, args) => {
            const UpdateCheckResult = JSON.parse(args)
            const { version } = UpdateCheckResult.versionInfo
            const { autoUpdate } = this.$store.state.setting
            this.version = version
            this.autoUpdate = autoUpdate
            this.getUpdateLog()
        })
    },
    mounted() {
    },
};
</script>

<style scoped lang="sass">
.update-panel
    display: flex
    height: 100vh
    flex-direction: column
    font-family: '-apple-system', 'PingFang SC'
.panel-header
    .title
        font-size: 21px
    .intro
        font-size: 12px
.panel-footer
    font-size: 12px
    .auto-update-switch
    button
        padding: 0 10px
        border: 0
        border-radius: 4px
        outline: none
        background: #616161
        color: #FFFFFF
        cursor: pointer
        min-width: 70px
        &:hover
            filter: brightness(1.1)
        &:active
            filter: brightness(1)
</style>
