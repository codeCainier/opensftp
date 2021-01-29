<template>
    <div class="row full-height">
        <q-bar v-for="(item, index) in $store.state.sshInfo.sshTags"
               :key="index"
               class="tag cursor-pointer"
               :class="{ active: activeIndex === index }"
               @click="activeIndex = index">
            <q-icon name="dns"/>
            <div class="label">{{ item.host }}</div>
            <q-space/>
            <q-btn flat round size="xs" icon="close" @click="closeSSH(item)"/>
        </q-bar>
    </div>
</template>

<script>
    export default {
        name: 'SessionTag',
        data() {
            return {
                activeIndex: null,
            };
        },
        watch: {
            '$store.state.sshInfo.sshTags': function() {
                this.check()
            },
        },
        methods: {
            check() {
                const { length } = this.$store.state.sshInfo.sshTags
                this.activeIndex = length ? length - 1 : null
                this.$router.push(length ? '/sftp' : '/home')
            },
            closeSSH(item) {
                this.$store.commit('sshInfo/SSH_CLOSE', item)
            }
        },
        created() {
            this.check()
        },
    };
</script>

<style lang="sass" scoped>
.tag
    background: rgba($dark, .3)
    .label
        font-size: .85rem
    &.active
        background: rgba($positive, .5)
    &:hover
        backdrop-filter: brightness(.7)
</style>