<template>
    <div id='q-app' :class="{ 'disable-aero-blur': !$store.state.setting.aeroEnable }">
        <router-view/>
    </div>
</template>

<script>
    import {LocalStorage} from "quasar";

    export default {
        name: 'App',
        beforeCreate() {
            this.$router.push({ path: '/' })
        },
        mounted() {
            // const cache = LocalStorage.getItem('sessionPool')
            // console.log(JSON.stringify(cache));
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
