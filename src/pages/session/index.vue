<template>
    <div class="full-height">
        <session v-for="item in $store.state.session.tags"
                 v-show="item.id === $store.state.session.active.id"
                 :key="item.id"/>
    </div>
</template>

<script>
    import session from 'src/components/session'

    export default {
        name: 'SFTP',
        components: {
            session,
        },
    }
</script>
