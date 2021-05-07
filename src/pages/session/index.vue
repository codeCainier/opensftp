<template>
    <div class="full-height relative-position">
        <session v-for="item in $store.state.session.conn"
                 v-show="item.id === $store.state.session.active"
                 :key="item.id"
                 :connectId="item.id"
                 :connect="item.connect"/>
        <div class="module-background" :style="moduleBg()"></div>
    </div>
</template>

<script>
    import session from 'src/components/session'

    export default {
        name: 'SFTP',
        components: {
            session,
        },
        computed: {
            moduleBg() {
                return () => {
                    const style = {}
                    style.opacity = this.$store.state.setting.aero.sftp / 100
                    return style
                }
            }
        },
    }
</script>
