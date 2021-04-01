<template>
    <q-dialog v-model="show"
              content-class="session-poster-container"
              @keydown.space="show = false">
        <q-card class="session-poster text-white"
                :style="{
                    'background-image': `url('./images/session.jpeg')`
                }">
            <div class="bg-mask absolute-top-left full-height full-width"></div>
            <q-card-section class="q-mb-md">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">{{ sessionInfo.name }}</div>
                <div class="text-subtitle2">
                    <span>{{ sessionInfo.username }}</span>
                    <span>@</span>
                    <span>{{ sessionInfo.host }}</span>
                    <span>:</span>
                    <span>{{ sessionInfo.port }}</span>
                </div>
            </q-card-section>
            <q-card-actions>
                <q-btn flat>
                    <q-icon name="event" class="q-mr-sm"/>
                    更新于 {{ tools.formatDate(sessionInfo.updateTime, 'yyyy-MM-dd') }}
                </q-btn>
                <q-space/>
                <q-btn flat round icon="ion-md-trash">
                    <q-tooltip>删除会话</q-tooltip>
                </q-btn>
                <q-btn flat round icon="ion-ios-copy">
                    <q-tooltip>复制到命令行</q-tooltip>
                </q-btn>
                <q-btn flat round icon="ion-md-share">
                    <q-tooltip>分享会话</q-tooltip>
                </q-btn>
            </q-card-actions>
            <!--<div class="absolute-top-left full-width full-height" ref="chart-ping"></div>-->
        </q-card>
    </q-dialog>
</template>

<script>
import ping from 'ping'

export default {
    name: 'SessionPoster',
    props: {
    },
    data() {
        return {
            show: false,
            // 会话信息
            sessionInfo: {},
            // 单次 ping 等待时间
            pingTime: '-',
            // ping 间隔
            interval: 1000,
            // ping 等待时间数组
            // length 超出阈值后删除第一位，保证长度固定
            pingArr: [],
            // 全部 ping 等待时间数组
            pingArrAll: [],
            // ping 等待时间总和
            // 单独计算，防止每一次 ping 都进行整个数组求和
            pingArrTotal: 0,
            // ping 数组限制长度
            pingArrLimit: 30,
            // ping 计时器
            timer: '',
            // echarts 图表
            chart: '',
        }
    },
    watch: {
        show(newVal) {
            if (!newVal) {
                clearInterval(this.timer)
            }
        },
    },
    methods: {
        open(item) {
            this.show = true
            this.sessionInfo = item
            // this.$nextTick(() => {
            //     this.chart = this.echarts.init(this.$refs['chart-ping'])
            //     this.pingStart()
            // })
        },
        pingStart() {
            this.pingTime = '-'
            this.pingArr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            this.pingArrAll = []
            this.pingArrTotal = 0
            clearInterval(this.timer)
            this.timer = setInterval(() => this.ping(), this.interval)
        },
        async ping() {
            if (this.pingArr.length === this.pingArrLimit) this.pingArr.splice(0, 1)
            const { time }   = (await ping.promise.probe(this.sessionInfo.host, { timeout: this.interval / 1000 }))
            const timeFormat = time === 'unknown' ? 0 : time
            this.pingTime = timeFormat ? `${time}ms` : 'Timeout'
            this.pingArr.push(timeFormat)
            this.pingArrAll.push(timeFormat)
            this.pingArrTotal += timeFormat
            this.pingRender()
        },
        pingRender() {
            const option = {
                animation: false,
                grid: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                },
                xAxis: {
                    show: false,
                    type: 'category',
                },
                yAxis: {
                    show: false,
                    type: 'value',
                },
                series: [{
                    data: this.pingArr,
                    type: 'line',
                    symbol: 'none',
                    smooth: true
                }]
            }
            this.chart.setOption(option)
        },
    },
}
</script>

<style scoped lang="sass">
.session-poster-container
    .q-dialog__backdrop
        background: transparent !important

.session-poster
    position: relative
    width: 400px
    border-radius: 10px
    background: no-repeat center center / cover
    box-shadow: $shadow-24
    .bg-mask
        backdrop-filter: blur(7px)
</style>
