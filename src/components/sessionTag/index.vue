<template>
    <div class="row full-height">
        <q-btn v-show="$store.state.session.conn.length"
               icon="home" flat
               class="no-border-radius"
               @click="backHome"/>
        <q-btn v-for="item in $store.state.session.conn"
               :key="item.id"
               :color="$store.state.session.active === item.id ? 'teal-7' : 'blue-10'"
               class="no-border-radius"
               style="margin-right: 1px"
               unelevated no-caps
               @click="changeTag(item)">
            <q-icon name="dns"/>
            <div class="label q-mx-sm" style="font-size: .85rem">{{ item.sessionInfo.name }}</div>
            <q-space/>
            <q-btn flat round size="xs" icon="close" @click="closeTag(item.id)"/>
        </q-btn>
    </div>
</template>

<script>
    export default {
        name: 'SessionTag',
        watch: {
            '$store.state.session.conn': function (newVal) {
                if (!newVal.length) this.backHome()
            }
        },
        methods: {
            closeTag(id) {
                this.$store.dispatch('session/EXIT', id)
            },
            backHome() {
                if (this.$route.path === '/home') return
                this.$store.commit('session/SET_ACTIVE', null)
                this.$router.push({ path: '/' })
            },
            changeTag(item) {
                if (this.$store.state.session.active === item.id) return this.$store.commit('sftp/CLOSE_TERM')
                this.$store.commit('session/SET_ACTIVE', item.id)
                if (this.$route.path !== '/session') this.$router.push({ path: '/session' })
            },
        },
    };
</script>

<style lang="sass" scoped>
</style>
