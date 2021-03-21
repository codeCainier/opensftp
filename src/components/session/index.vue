<template>
    <div class="session full-height">
        <q-splitter class="sftp full-height" v-model="splitterModel">
            <template v-slot:before>
                <local ref="local" :connect="connect"/>
            </template>
            <template v-slot:after>
                <remote ref="remote" :connect="connect"/>
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
            id: String,
            connect: Object,
        },
        data() {
            return {
                splitterModel: 50,
            }
        },
    }
</script>

<style lang="sass" scoped>
.session
    display: flex
    flex-direction: column
</style>
