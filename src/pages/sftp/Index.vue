<template>
    <page class="page">
        <q-splitter class="sftp full-height" v-model="splitterModel">

            <template v-slot:before>
                <local :key="keys.local"/>
            </template>

            <template v-slot:after>
                <remote :key="keys.remote"/>
            </template>

        </q-splitter>

        <ssh/>
    </page>
</template>

<script>
    import { uid } from 'quasar'
    import local   from './local'
    import remote  from './remote'
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
                keys: {
                    local: uid(),
                    remote: uid(),
                },
            }
        },
        watch: {
            '$store.state.session.tags': function (newVal) {
                if (!newVal.length) return this.$router.push({ path: '/' })
            },
            '$store.state.session.active': function () {
                this.keys.remote = uid()
            },
        },
        beforeCreate() {
        },
    }
</script>

<style lang="sass" scope>
@import "/src/css/fs.sass"

.page
    display: flex
    flex-direction: column
</style>
