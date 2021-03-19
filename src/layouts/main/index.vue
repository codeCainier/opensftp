<template>
    <q-layout view="lHh Lpr lFf">
        <q-header ref="header" elevated class="header" :class="{ 'bg-dark': $q.dark.isActive }">
            <header-bar-mac v-if="$q.platform.is.mac"/>
            <header-bar-win v-if="$q.platform.is.win"/>
        </q-header>

        <q-page-container>
            <q-page :style-fn="layoutTweak">
                <!-- keep-alive 结合 vue-router 实现 session 路由缓存 -->
                <keep-alive>
                    <router-view v-if="$route.meta.keepAlive"/>
                </keep-alive>
                <router-view v-if="!$route.meta.keepAlive"/>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import headerBarMac from 'src/components/headerBar/mac'
import headerBarWin from 'src/components/headerBar/win'

export default {
    name: 'MainLayout',
    components: {
        'header-bar-mac': headerBarMac,
        'header-bar-win': headerBarWin,
    },
    computed: {
        containerSize() {
            return () => this.$store.commit('layout/UPDATE_CONT_SIZE', this.$refs.header.$el)
        },
        layoutTweak () {
            return offset => ({ height: offset ? `calc(100vh - ${offset}px)` : '100vh' })
        },
    },
    mounted() {
        this.containerSize()
        window.addEventListener('resize', () => {
            this.containerSize()
        })
    },
};
</script>

<style scoped lang="sass">
.header
    transition: all .3s
    z-index: 99999
</style>
