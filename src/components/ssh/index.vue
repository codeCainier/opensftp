<template>
    <div class="ssh row overflow-hidden">
        <q-btn icon="code" class="no-border-radius" flat size="sm" @click="openTerminal"/>
        <input v-model.trim="cmd"
               type="text"
               spellcheck="false"
               class="ssh-input col no-margin no-border"
               placeholder="SSH Terminal"
               @keydown.ctrl.u="cmd = ''"
               @keydown.enter="openTerminal(cmd)">
        <q-space/>
        <terminal ref="terminal" :connect="connect"/>
    </div>
</template>

<script>
    export default {
        name: 'SSH',
        data() {
            return {
                cmd: '',
            }
        },
        props: {
            connect: Object,
        },
        methods: {
            openTerminal(cmd) {
                this.$refs.terminal.open(typeof cmd === 'string' ? cmd : '')
                this.cmd = ''
            },
        },
    }
</script>

<style lang="sass" scoped>
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
