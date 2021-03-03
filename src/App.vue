<template>
    <div id='q-app' class="disable-copy">
        <!-- <router-view /> -->
        <div ref="terminal" style="height: 100vh"></div>
    </div>
</template>
<script>
    import { Terminal } from 'xterm'
    import { WebLinksAddon } from 'xterm-addon-web-links'
    import { FitAddon } from 'xterm-addon-fit'
    import { SearchAddon } from 'xterm-addon-search'
    import { AttachAddon } from 'xterm-addon-attach'
    import { Unicode11Addon } from 'xterm-addon-unicode11'
    import os from 'os'

    import 'xterm/css/xterm.css'

    const pty = require('node-pty')

    export default {
        name: 'App',
        watch: {
        },
        data() {
            return {
                term: '',
            }
        },
        methods: {
            init() {
                const term           = new Terminal()
                // 为 xterm 提供终端的尺寸适合包含元素功能
                const fitAddon       = new FitAddon()
                // 为 xterm 提供搜索缓冲区功能
                const searchAddon    = new SearchAddon()
                // 为 xterm 提供 Unicode 版本 11 规则
                const unicode11Addon = new Unicode11Addon()

                term.loadAddon(unicode11Addon)
                term.loadAddon(fitAddon)
                term.loadAddon(searchAddon)

                // 设置 Unicode 版本为 11
                term.unicode.activeVersion = '11'

                // 参数 true 含义
                term.open(this.$refs.terminal, true)
                // 监听 Terminal Focus
                term.textarea.addEventListener('focus', this.terminalFocus)
                // 监听 Terminal Blur
                term.textarea.addEventListener('blur', this.terminalBlur)
                // 监听 Terminal Title Change
                term.onTitleChange(this.changeTitle)
                // 监听 Terminal Selection Change
                term.onSelectionChange(this.onSelection)

                this.term = term
            },
            // Terminal Focus 事件
            terminalFocus() {
                console.log('Terminal Focus');
            },
            // Terminal Blur 事件
            terminalBlur() {
                console.log('Terminal Blur');
            },
            // Termianl Change Title 事件
            changeTitle() {

            },
            // Termianl Change Selection 事件
            changeSelection() {

            },
        },
        created() {
        },
        mounted() {
            this.init()
        },
    }
</script>
