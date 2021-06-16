<template>
    <div class="full-height relative-position">
        <session v-for="conn in $store.state.session.connectedList"
                 v-show="conn.id === $store.state.session.active"
                 :key="conn.id"
                 :conn="conn"/>
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
                    style.opacity = this.$store.state.setting.sftpOpacity / 100
                    return style
                }
            }
        },
    }
</script>
