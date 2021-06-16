<template>
    <div class="full-width full-height row scroll-x">
        <!-- 会话标签 -->
        <q-btn v-for="conn in $store.state.session.connectedList"
               :key="conn.id"
               :color="isActive(conn.id) ? 'teal-7' : 'blue-10'"
               class="no-border-radius"
               style="margin-right: 1px"
               unelevated no-caps
               @click="connectChange(conn)"
               @contextmenu="showMenu(conn)">
            <!-- 会话信息 -->
            <q-tooltip :offset="[0, 10]">
                <div class="text-weight-bolder">{{ sessionName(conn.sessionId) }}</div>
                <div class="text-weight-bold">{{ sessionDetail(conn.sessionId) }}</div>
            </q-tooltip>
            <!-- 会话图标 -->
            <q-icon name="dns"/>
            <!-- 会话名称 -->
            <div class="label q-mx-sm ellipsis" style="width: 100px; font-size: .85rem">{{ sessionName(conn.sessionId) }}</div>
            <!-- 关闭按钮 -->
            <q-btn flat round size="xs" icon="close" @click="connectClose(conn)"/>
            <!-- 当会话连接存在传输任务时 -->
            <q-skeleton v-if="taskList(conn.id).length"
                        type="rect"
                        style="z-index: -1"
                        class="absolute-top-left full-height full-width no-border-radius"/>
            <!-- 传输任务详情 -->
            <q-popup-proxy :offset="[0, 10]" :content-class="['bg-transparent']">
                <q-card class="bg-aero">
                    <q-list bordered separator>
                        <div class="relative-position" v-for="task in taskList(conn.id)" :key="task.id">
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
        computed: {
            // 传输任务列表
            taskList() {
                return id => this.$store.getters['transfer/CONNECT_TRANSFER'](id)
            },
            // 传输进度标签
            progressLabel() {
                return task => {
                    const filename = path.basename(task.transferring.pathname)
                    let text
                    if (task.action === 'download') text = '正在下载'
                    if (task.action === 'upload')   text = '正在上传'
                    return `${text} ${filename}`
                }
            },
            // 传输进度百分比格式化
            percentFormat() {
                return num => (num * 100).toFixed(0) + '%'
            },
            // 会话名称 - Example Session
            sessionName() {
                return sessionId => this.$store.getters['session/sessionInfo']({ id: sessionId }).name
            },
            // 会话详情 - root@192.168.0.1:22
            sessionDetail() {
                return sessionId => {
                    const { username, host, port } = this.$store.getters['session/sessionInfo']({ id: sessionId }).detail
                    return `${username}@${host}:${port}`
                }
            },
            // 会话是否为活跃状态
            isActive() {
                return id => this.$store.state.session.active === id && this.$route.path === '/session'
            },
        },
        methods: {
            // 关闭会话连接
            connectClose(conn) {
                this.$store.dispatch('session/CONNECT_EXIT', conn)
            },
            // 更换会话连接
            connectChange(conn) {
                if (this.isActive(conn.id)) return this.$store.commit('sftp/CLOSE_TERM')
                this.$store.commit('session/SET_ACTIVE', conn.id)
                if (this.$route.path !== '/session') this.$router.push({ path: '/session' })
            },
            // 传输速度格式化，放在 methods 里为了节流
            speedFormat(speed) {
                return this.tools.formatFlow(speed)
            },
            // 显示右键菜单
            showMenu(conn) {
                const { remote } = this.$q.electron
                const menu = new remote.Menu()

                menu.append(new remote.MenuItem({
                    label: '新建相同会话',
                    click: () => {
                        this.alert('功能开发中')
                    },
                }))

                menu.append(new remote.MenuItem({ type: 'separator' }))

                menu.append(new remote.MenuItem({
                    label: '关闭会话',
                    click: () => this.connectClose(conn),
                }))

                menu.append(new remote.MenuItem({
                    label: '关闭其他会话',
                    click: () => {
                        this.alert('功能开发中')
                    },
                }))

                menu.append(new remote.MenuItem({
                    label: '关闭右侧会话',
                    click: () => {
                        this.alert('功能开发中')
                    },
                }))

                menu.append(new remote.MenuItem({
                    label: '关闭所有会话',
                    click: () => {
                        this.$store.dispatch('session/CONNECT_EXIT_ALL')
                    },
                }))

                menu.popup()
            },
        },
        created() {
            // 速度格式化节流
            this.speedFormat = throttle(this.speedFormat, 1000)
        },
    };
</script>

<style lang="sass" scoped>
</style>
