<template>
    <div id='q-app'>
        <router-view />
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
