<template>
    <div id='q-app' class="disable-copy">
        <!-- <router-view /> -->
        <div ref="terminal" id="terminal"></div>
    </div>
</template>
<script>
    import { Terminal } from 'xterm'
    import { WebLinksAddon } from 'xterm-addon-web-links'
    import { FitAddon } from 'xterm-addon-fit'
    import { AttachAddon } from 'xterm-addon-attach'
    import os from 'os'

    import 'xterm/css/xterm.css'

    const pty = require('node-pty')

    export default {
        name: 'App',
        watch: {
        },
        methods: {
        },
        created() {
        },
        mounted() {
        },
    }
</script>
