<template>
    <q-dialog v-model="show" maximized position="bottom">
        <q-card class="terminal-container">
            <div ref="terminal" class="full-height overflow-hidden q-pa-sm"></div>
        </q-card>
    </q-dialog>
</template>

<script>
    import { debounce, uid } from 'quasar'
    import { Terminal } from 'xterm'
    import { WebLinksAddon } from 'xterm-addon-web-links'
    import { FitAddon } from 'xterm-addon-fit'
    import { SearchAddon } from 'xterm-addon-search'
    import { AttachAddon } from 'xterm-addon-attach'
    import { Unicode11Addon } from 'xterm-addon-unicode11'
    import 'xterm/css/xterm.css'

    export default {
        name: 'Terminal',
        components: {
        },
        data() {
            return {
                show: false,
                term: '',
                ipcRenderer: '',
                option: {
                    // 鼠标右键选择
                    rightClickSelectsWord: true,
                    // 允许透明度
                    allowTransparency: false,
                    // 字体大小
                    fontSize: 14,
                    // 渲染方式 canvas || dom
                    rendererType: 'canvas',
                    // 行高
                    lineHeight: 1.2,
                    // 字体
                    // TODO: 确定字体可选值
                    // fontFamily: 'PingFang SC',
                    // TODO: 回滚行数
                    // scrollback: '',
                    // 主题
                    theme: {
                        // 背景颜色 hax || rgb || rgba || transparent
                        background: '#000000',
                        // 文字颜色
                        foreground: '#FFFFFF',
                        // 光标颜色
                        cursor: '#FFFFFF',
                        // 选中颜色
                        selection: '#F81DE5',
                        // TODO: The accent color of the cursor (fg color for a block cursor)
                        cursorAccent: '#FF0000',
                    },
                }
            }
        },
        watch: {
            show(newVal) {
                if (!newVal) this.termClose()
            },
        },
        computed: {
            termSize() {
                return () => ({
                    // TODO: 确认 16 是否为 line-height 基数
                    rows: parseInt((this.$refs.terminal.clientHeight - 16) / (16 * this.option.lineHeight), 0),
                    // TODO: 确认 cols 计算方式
                    cols: parseInt(100, 0),
                })
            }
        },
        methods: {
            // Terminal 初始化
            termInit() {
                // 计算 rows & cols
                const { rows, cols }  = this.termSize()
                this.option.rows = rows
                // this.option.cols = cols
                // Terminal 实例化
                const term            = new Terminal(this.option)
                // 为 xterm 提供终端的尺寸适合包含元素功能
                const fitAddon        = new FitAddon()
                // 为 xterm 提供搜索缓冲区功能
                const searchAddon     = new SearchAddon()
                // 为 xterm 提供 Unicode 版本 11 规则
                const unicode11Addon  = new Unicode11Addon()
                // Electron 渲染进程
                const { ipcRenderer } = this.$q.electron

                term.loadAddon(unicode11Addon)
                term.loadAddon(fitAddon)
                term.loadAddon(searchAddon)

                // 设置 Unicode 版本为 11
                term.unicode.activeVersion = '11'

                // TODO: 参数 true 含义
                term.open(this.$refs.terminal, true)
                // 监听 Terminal Focus
                term.textarea.addEventListener('focus', this.listenerTermFocus)
                // 监听 Terminal Blur
                term.textarea.addEventListener('blur', this.listenerTermBlur)
                // 监听 Terminal Title Change
                term.onTitleChange(this.listenerTermTitle)
                // 监听 Terminal Selection Change
                term.onSelectionChange(this.listenerTermSelection)

                // 监听 Terminal 内容
                term.onData(data => ipcRenderer.send('terminal', data))

                // 监听 Window 窗口 Resize
                window.addEventListener('resize', () => this.termResize())

                // 监听主进程
                ipcRenderer.on('terminal', (event, args) => term.write(args))
                // 传入 Enter 来初始化 Terminal
                ipcRenderer.send('terminal', 'clear\n')

                // Terminal Focus
                term.focus()

                this.term = term
                this.ipcRenderer = ipcRenderer
            },
            // Terminal Focus 事件
            listenerTermFocus() {
                console.log('Terminal Focus');                    
            },
            // Terminal Blur 事件
            listenerTermBlur() {
                console.log('Terminal Blur');
            },
            // Termianl Change Title 事件
            listenerTermTitle() {

            },
            // Termianl Change Selection 事件
            listenerTermSelection() {

            },
            // Terminal Resize 事件
            termResize() {
                this.$nextTick(() => {
                    const { rows, cols }  = this.termSize()
                    this.term.resize(cols, rows)
                })
            },
            // Terminal Close 事件
            termClose() {
                // 关闭 Terminal
                // this.ipcRenderer.send('terminalKill', this.uid)
                // 移除 Window 窗口 Resize 监听
                window.removeEventListener('resize', () => this.termResize())
            },
            // Terminal Dialog Open
            open() {
                this.show = true
                this.$nextTick(() => this.termInit())
            },
        },
        beforeCreate() {
        },
        created() {
            // Term Resize 事件 防抖
            this.termResize = debounce(this.termResize, 500)
        },
        mounted() {
        },
        beforeDestroy() {
        },
        destroyed() {
            this.termClose()
        },
    }
</script>

<style lang="sass" scope>
.terminal-container
    background: transparent
    background: #000000
    height: calc(100vh - 32px) !important
</style>