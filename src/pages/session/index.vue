<template>
    <div class="full-height">
        <session v-for="item in $store.state.session.conn"
                 v-show="item.id === $store.state.session.active"
                 :key="item.id"
                 :id="item.id"
                 :connect="item.connect"/>
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
