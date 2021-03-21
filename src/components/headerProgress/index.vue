<template>
    <q-btn v-if="progress"
           class="relative-position full-height no-border-radius"
           unelevated no-caps>
        <div class="ellipsis text-left" style="width: 150px">
            <q-spinner-gears class="q-mr-sm"/>
            {{ progressLabel() }}
        </div>
        <q-linear-progress :value="progress.transferring.percent"
                           :color="$q.dark.isActive ? 'primary' : 'positive'"
                           style="z-index: -1"
                           class="progress-bar absolute-top-left full-height full-width"/>
        <q-skeleton type="rect"
                    style="z-index: -1"
                    class="absolute-top-left full-height full-width no-border-radius"/>
    </q-btn>
</template>

<script>
export default {
    name: 'DarkProgress',
    data() {
        return {
            progress: null,
        };
    },
    watch: {
        '$store.state.transfer.listener': function () {
            this.progress = this.$store.state.transfer.list[this.$store.state.session.active.id]
        }
    },
    computed: {
        progressLabel() {
            return () => `正在${this.progress.action === 'download' ? '下载': '上传'} ${this.progress.transferring.pathname.split('/').pop()}`
        },
        progressValue() {
            return () => this.progress.transferring.percent * 100
        }
    },
}
</script>
