<template>
    <div id='q-app' :class="{ 'os-win' : $q.platform.is.win }">
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'App',
        beforeCreate() {
            this.$router.push({ path: '/' })
        },
        mounted() {
        },
    }
</script>
