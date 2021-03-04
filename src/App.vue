<template>
    <div id='q-app' class="disable-copy">
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
