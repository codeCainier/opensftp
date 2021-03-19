<template>
    <div class="session full-height">
        <q-splitter class="sftp full-height" v-model="splitterModel">
            <template v-slot:before>
                <local/>
            </template>
            <template v-slot:after>
                <remote/>
            </template>
        </q-splitter>
        <ssh/>
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
        data() {
            return {
                splitterModel: 50,
            }
        },
    }
</script>

<style lang="sass" scope>
@import "/src/css/fs.sass"

.session
    display: flex
    flex-direction: column
</style>
