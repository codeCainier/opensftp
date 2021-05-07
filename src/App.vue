<template>
    <div id='q-app' :class="{ 'disable-aero-blur': !$store.state.setting.aero.enable }">
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'App',
        beforeCreate() {
            this.$router.push({ path: '/' })
        },
    }
</script>

<style lang="sass">
body
    &.body--light
        .disable-aero-blur
            background: #FFFFFF
    &.body--dark
        .disable-aero-blur
            background: $dark
</style>
