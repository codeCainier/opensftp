<template>
    <div class="session full-height">
        <q-splitter class="sftp full-height overflow-hidden" v-model="splitterModel">
            <template v-slot:before>
                <local ref="local"
                       :conn="conn"
                       :pwdRemote="state.pwdRemote"
                       @update-pwd="pwd => state.pwdLocal = pwd"
                       @refresh-remote="$refs.remote.getFileList('.')"/>
            </template>
            <template v-slot:after>
                <remote ref="remote"
                        :conn="conn"
                        :pwdLocal="state.pwdLocal"
                        @update-pwd="pwd => state.pwdRemote = pwd"
                        @refresh-local="$refs.local.getFileList('.')"/>
            </template>
        </q-splitter>
        <!--<ssh :conn="conn"/>-->
    </div>
</template>

<script>
    import local   from 'src/components/session/local'
    import remote  from 'src/components/session/remote'
    import ssh     from 'src/components/ssh'

    export default {
        name: 'SFTP',
        components: {
            local,
            remote,
            ssh,
        },
        props: {
            conn: Object,
        },
        data() {
            return {
                splitterModel: 50,
                state: {
                    pwdLocal: '',
                    pwdRemote: '',
                },
            }
        },
        watch: {
            // 监听 vuex 中传输任务完成事件
            '$store.state.transfer.finishListener': function (newVal) {
                this.refreshList(newVal)
            },
        },
        methods: {
            // 刷新文件系统
            refreshList(id) {
                const task = this.$store.state.transfer.list.find(item => item.id === id)
                const { action, dir, name }   = task
                const { pwdLocal, pwdRemote } = this.state
                // 当传输模式为下载，且当前本地目录为目标目录时，刷新本地文件系统，并使下载文件获得焦点
                if (action === 'download' && dir === pwdLocal)  this.$refs.local.getFileList('.', null, name)
                // 当传输模式为上传，且当前远程目录为目标目录时，刷新远程文件系统，并使上传文件获得焦点
                if (action === 'upload'   && dir === pwdRemote) this.$refs.remote.getFileList('.', null, name)
            },
        },
    }
</script>

<style lang="sass" scoped>
.session
    display: flex
    flex-direction: column
</style>
