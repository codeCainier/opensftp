<template>
    <div class="session full-height">
        <q-splitter class="sftp full-height" v-model="splitterModel">
            <template v-slot:before>
                <local ref="local"
                       :connectId="connectId"
                       :connect="connect"
                       :pwdRemote="state.pwdRemote"
                       @update-pwd="pwd => state.pwdLocal = pwd"
                       @refresh-remote="$refs.remote.getFileList('.')"/>
            </template>
            <template v-slot:after>
                <remote ref="remote"
                        :connectId="connectId"
                        :connect="connect"
                        :pwdLocal="state.pwdLocal"
                        @update-pwd="pwd => state.pwdRemote = pwd"
                        @refresh-local="$refs.local.getFileList('.')"/>
            </template>
        </q-splitter>
        <ssh :connect="connect"/>
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
            connectId: String,
            connect: Object,
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
        methods: {
        },
    }
</script>

<style lang="sass" scoped>
.session
    display: flex
    flex-direction: column
</style>
