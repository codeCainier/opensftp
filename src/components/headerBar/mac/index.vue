<template>
    <q-bar class="q-electron-drag">
        <q-btn dense flat round icon="lens" size="8.5px" color="red" @click="closeApp"/>
        <q-btn dense flat round icon="lens" size="8.5px" color="yellow" @click="minimize"/>
        <q-btn dense flat round icon="lens" size="8.5px" color="green" @click="maximize"/>
        <session-tag/>
        <q-space />
        <q-btn v-if="progress"
               class="relative-position full-height"
               unelevated no-caps>
            <div class="ellipsis text-left" style="width: 150px">
                <q-spinner-gears class="q-mr-sm"/>
                {{ progressLabel() }}
            </div>
            <q-linear-progress :value="progress.transferring.percent"
                               color="primary"
                               style="z-index: -1"
                               class="progress-bar absolute-top-left full-height full-width"/>
            <q-skeleton type="rect"
                        style="z-index: -1"
                        class="absolute-top-left full-height full-width"/>
        </q-btn>
        <q-toggle v-model="dark"
                  color="dark"
                  checked-icon="ion-md-moon"
                  unchecked-icon="ion-md-sunny"
                  icon-color="light-blue"
                  dense
                  @input="$store.commit('setting/DARK_TOGGLE')"/>
    </q-bar>
</template>

<script>
import sessionTag from 'src/components/sessionTag'
import headerMenu from 'src/components/headerMenu'

export default {
    name: 'HeaderBarMac',
    components: {
        'session-tag': sessionTag,
        'header-menu': headerMenu,
    },
    watch: {
        '$store.state.transfer.listener': function () {
            this.progress = this.$store.state.transfer.list[this.$store.state.session.active.id]
        }
    },
    computed: {
        progressLabel() {
            return () => `正在下载 ${this.progress.transferring.remotePath.split('/').pop()}`
        },
        progressValue() {
            return () => this.progress.transferring.percent * 100
        }
    },
    data() {
        return {
            dark: this.$store.state.setting.dark,
            progress: null,
        };
    },
    methods: {
        minimize() {
            this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize()
        },
        maximize() {
            const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow()
            win.isMaximized() ? win.unmaximize() : win.maximize()
        },
        closeApp() {
            this.$q.electron.remote.BrowserWindow.getFocusedWindow().close()
        },
    },
    created() {
    }
}
</script>

<style scoped lang="sass">
.progress-bar
    //transform: translateY(100%)
</style>

<style lang="sass">
//.q-linear-progress__model--determinate,
//.q-linear-progress__stripe
//    border-radius: 10px
</style>
