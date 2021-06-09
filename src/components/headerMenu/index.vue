<template>
    <q-menu ref="menu" content-class="bg-aero">
        <q-list dense style="min-width: 150px">
            <q-item v-close-popup clickable @click="emitHandle('rename')">
                <q-item-section>帮助</q-item-section>
                <q-item-section side>
                    <q-item-label caption>F1</q-item-label>
                </q-item-section>
            </q-item>
            <q-separator/>
            <q-item v-close-popup clickable @click="emitHandle('showAttr')">
                <q-item-section>关于</q-item-section>
                <q-item-section side>
                    <q-item-label caption>A</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-menu>
</template>

<script>
export default {
    name: 'Menu',
    data() {
        return {
        }
    },
    watch: {
    },
    computed: {
    },
    methods: {
        emitHandle(action) {
            this.$emit(action)
            this.$refs.menu.hide()
        },
    },
    created() {
    }
}
</script>
