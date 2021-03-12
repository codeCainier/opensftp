<template>
    <div class="ssh row overflow-hidden">
        <q-btn icon="code" class="no-border-radius" flat size="sm" @click="openTerminal"/>
        <input v-model.trim="cmd"
               type="text"
               class="ssh-input col no-margin no-border"
               placeholder="SSH Terminal"
               @keydown.ctrl.u="cmd = ''">
        <q-space/>
        <q-btn icon="settings" class="no-border-radius" flat size="sm"/>
        <terminal ref="terminal"/>
    </div>
</template>

<script>
    export default {
        name: 'SSH',
        components: {
        },
        watch: {
        },
        data() {
            return {
                cmd: '',
            }
        },
        methods: {
            openTerminal() {
                this.$refs.terminal.open()
            },
        },
        beforeCreate() {
        },
        mounted() {
        },
    }
</script>

<style lang="sass" scope>
.body--light
    .ssh
        border-top: 1px solid rgba($dark, .1)

.body--dark
    .ssh
        background: rgba($dark, .3)
        border-top: 1px solid rgba($dark, .3)
    .ssh-input
        color: #FFFFFF

.ssh
    min-height: 30px
    .ssh-input
        outline: none
        background: none
</style>
