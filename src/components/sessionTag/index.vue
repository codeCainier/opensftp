<template>
    <div class="row full-height">
        <!-- 返回主页按钮 -->
        <q-btn v-show="$store.state.session.conn.length"
               icon="home" flat
               class="no-border-radius"
               @click="backHome"/>
        <!-- 会话标签 -->
        <q-btn v-for="item in $store.state.session.conn"
               :key="item.id"
               :color="$store.state.session.active === item.id ? 'teal-7' : 'blue-10'"
               class="no-border-radius"
               style="margin-right: 1px"
               unelevated no-caps
               @click="changeTag(item)">
            <!-- 会话图标 -->
            <q-icon name="dns"/>
            <!-- 会话名称 -->
            <div class="label q-mx-sm ellipsis" style="width: 100px; font-size: .85rem">{{ item.sessionInfo.name }}</div>
            <q-space/>
            <!-- 关闭按钮 -->
            <q-btn flat round size="xs" icon="close" @click="closeTag(item.id)"/>
            <!-- 当会话连接存在传输任务时 -->
            <q-skeleton v-if="taskList(item.id).length"
                        type="rect"
                        style="z-index: -1"
                        class="absolute-top-left full-height full-width no-border-radius"/>
            <!-- 传输任务详情 -->
            <q-popup-proxy :offset="[0, 10]" :content-class="['bg-transparent']">
                <q-card class="bg-aero">
                    <q-list bordered separator>
                        <div class="relative-position" v-for="task in taskList(item.id)" :key="task.id">
                            <q-item clickable v-ripple class="relative-position" style="z-index: 3">
                                <!-- 图标 -->
                                <q-item-section avatar top class="no-padding">
                                    <q-item-section avatar top>
                                        <q-avatar icon="ion-md-cloud-download" color="white" text-color="primary" />
                                    </q-item-section>
                                </q-item-section>
                                <!-- 任务信息 -->
                                <q-item-section style="width: 200px">
                                    <q-item-label class="ellipsis">{{ task.name }}</q-item-label>
                                    <q-item-label caption class="ellipsis">{{ progressLabel(task) }}</q-item-label>
                                </q-item-section>
                                <!-- 传输进度 -->
                                <q-item-section side style="width: 100px">
                                    <q-item-label caption>{{ speedFormat(task.transferring.speed) }}/s</q-item-label>
                                    <q-item-label caption>{{ percentFormat(task.transferring.percent) }}</q-item-label>
                                </q-item-section>
                            </q-item>
                            <!-- 传输进度 -->
                            <q-linear-progress :value="task.transferring.percent"
                                               :color="$q.dark.isActive ? 'primary' : 'positive'"
                                               style="z-index: 1"
                                               class="absolute-top-left full-height full-width no-border-radius"/>
                            <q-skeleton type="rect"
                                        style="z-index: 2"
                                        class="absolute-top-left full-height full-width no-border-radius"/>
                        </div>
                    </q-list>
                </q-card>
            </q-popup-proxy>
        </q-btn>
    </div>
</template>

<script>
    import path from 'path'
    import { throttle } from 'quasar'

    export default {
        name: 'SessionTag',
        data() {
            return {

            }
        },
        watch: {
            '$store.state.session.conn': function (newVal) {
                if (!newVal.length) this.backHome()
            },
            '$store.state.transfer.list': {
                deep: true,
                handler(newVal) {
                }
            }
        },
        computed: {
            taskList() {
                return id => this.$store.getters['transfer/CONNECT_TRANSFER'](id)
            },
            progressLabel() {
                return task => {
                    const filename = path.basename(task.transferring.pathname)
                    let text
                    if (task.action === 'download') text = '正在下载'
                    if (task.action === 'upload')   text = '正在上传'
                    return `${text} ${filename}`
                }
            },
            percentFormat() {
                return num => (num * 100).toFixed(0) + '%'
            },
        },
        methods: {
            closeTag(id) {
                this.$store.dispatch('session/EXIT', id)
            },
            backHome() {
                if (this.$route.path === '/home') return
                this.$store.commit('session/SET_ACTIVE', null)
                this.$router.push({ path: '/' })
            },
            changeTag(item) {
                if (this.$store.state.session.active === item.id) return this.$store.commit('sftp/CLOSE_TERM')
                this.$store.commit('session/SET_ACTIVE', item.id)
                if (this.$route.path !== '/session') this.$router.push({ path: '/session' })
            },
            speedFormat(speed) {
                return this.tools.formatFlow(speed)
            },
        },
        created() {
            this.speedFormat = throttle(this.speedFormat, 1000)
        },
    };
</script>

<style lang="sass" scoped>
</style>
