<template>
    <div class="q-pa-md">
        <div class="text-h6">发现新版本 v{{ version }}</div>
        <button type="button">submit</button>
    </div>
</template>

<script>
import electron from 'electron'
export default {
    name: 'Update',
    data() {
        return {
            version: '-',
            autoUpdate: false,
        }
    },
    created() {
        electron.ipcRenderer.send('get-update-info-req')
        electron.ipcRenderer.once('get-update-info-res', (event, args) => {
            const UpdateCheckResult = JSON.parse(args)
            const { version } = UpdateCheckResult.versionInfo
            const { autoUpdate } = this.$store.state.setting
            this.version = version
            this.autoUpdate = autoUpdate
        })
    },
    mounted() {
    },
};
</script>
