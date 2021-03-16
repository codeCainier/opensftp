<template>
    <div class="row full-height">
        <q-btn v-show="tagList.length"
               icon="home" flat
               class="no-border-radius"
               @click="backHome"/>
        <q-btn v-for="item in tagList"
               :key="item.id"
               :color="$store.state.session.active.id === item.id ? 'teal-7' : 'blue-10'"
               class="no-border-radius"
               style="margin-right: 1px"
               unelevated no-caps
               @click="changeTag(item)">
            <q-icon name="dns"/>
            <div class="label q-mx-sm" style="font-size: .85rem">{{ item.params.name }}</div>
            <q-space/>
            <q-btn flat round size="xs" icon="close" @click="closeTag(item.id)"/>
        </q-btn>
    </div>
</template>

<script>
    import { uid } from 'quasar'
    export default {
        name: 'SessionTag',
        data() {
            return {
                tagList: [],
            }
        },
        watch: {
            '$store.state.session.tags': function (newVal) {
                this.tagList = newVal
            }
        },
        methods: {
            closeTag(id) {
                this.$store.commit('session/TAGS_DEL', id)
            },
            backHome() {
                this.$store.commit('session/SET_ACTIVE', {})
                this.$router.push({ path: '/', query: { t: uid() } })
            },
            changeTag(item) {
                if (this.$store.state.session.active.id === item.id) return this.closeTerm()
                this.$store.commit('session/SET_ACTIVE', item)
                this.$router.push({ path: '/sftp', query: { t: uid() } })
            },
            closeTerm() {
                this.$store.commit('sftp/CLOSE_TERM')
            },
        },
        created() {
        },
    };
</script>

<style lang="sass" scoped>
</style>
