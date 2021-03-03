<template>
    <div id='q-app' class="disable-copy">
        <router-view />
    </div>
</template>

<script>
    export default {
        name: 'App',
        watch: {
        },
        data() {
            return {
            }
        },
        methods: {
        },
        beforeCreate() {
            this.$router.push({ path: '/' })
        },
        created() {
        },
        mounted() {
        },
    }
</script>
