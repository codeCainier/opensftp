<template>
    <q-card class="terminal-container fixed-top-left full-height full-width"
            :class="{ active: show }">
        <div ref="terminal" id="terminal" class="full-height overflow-hidden q-pa-sm"></div>
    </q-card>
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
    import Session from 'src/core/session'

    export default {
        name: 'Terminal',
        data() {
            return {
                show: false,
                term: '',
                session: '',
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
                    // 16 为 line-height 基数
                    rows: Number(((this.$store.state.layout.contHeight - 16) / (16 * this.option.lineHeight)).toFixed(0)),
                    // 0.6 为 font-size 基数
                    cols: Number(((this.$store.state.layout.contWidth - 16) / (0.6 * this.option.fontSize)).toFixed(0))
                })
            }
        },
        methods: {
            // SSH 初始化
            async sshLogin() {
                this.session = new Session()
                await this.session.init(this.$store.state.session.active.params)
                const sshWindow = {
                    /** The number of rows (default: `24`). */
                    rows: this.option.rows,
                    /** The number of columns (default: `80`). */
                    cols: this.option.cols,
                    /** The height in pixels (default: `480`). */
                    height: 480,
                    /** The width in pixels (default: `640`). */
                    width: 640,
                    /** The value to use for $TERM (default: `'vt100'`) */
                    term: this.term,
                }
                this.ssh = await this.session.shell(sshWindow)

                this.ssh.on('data', data => this.term.write(data))
                // 监听 Terminal 内容
                this.term.onData(data => this.ssh.write(data))
            },
            // Terminal 初始化
            init() {
                // 计算 rows & cols
                const { rows, cols }  = this.termSize()

                this.option.rows = rows
                this.option.cols = cols

                // Terminal 实例化
                const term            = new Terminal(this.option)
                // 为 xterm 提供终端的尺寸适合包含元素功能
                const fitAddon        = new FitAddon()
                // 为 xterm 提供搜索缓冲区功能
                const searchAddon     = new SearchAddon()
                // 为 xterm 提供 Unicode 版本 11 规则
                const unicode11Addon  = new Unicode11Addon()

                term.loadAddon(unicode11Addon)
                term.loadAddon(fitAddon)
                term.loadAddon(searchAddon)

                // 设置 Unicode 版本为 11
                term.unicode.activeVersion = '11'

                // TODO: 参数 true 含义
                // term.open(this.$refs.terminal)
                term.open(document.getElementById('terminal'))
                // 监听 Terminal Focus
                term.textarea.addEventListener('focus', this.listenerTermFocus)
                // 监听 Terminal Blur
                term.textarea.addEventListener('blur', this.listenerTermBlur)
                // 监听 Terminal Title Change
                term.onTitleChange(this.listenerTermTitle)
                // 监听 Terminal Selection Change
                term.onSelectionChange(this.listenerTermSelection)

                // 监听 Window 窗口 Resize
                window.addEventListener('resize', () => this.termResize())

                this.term = term
                this.sshLogin()
            },
            // Terminal Focus 事件
            listenerTermFocus() {
                console.log('Terminal Focus');
            },
            // Terminal Blur 事件
            listenerTermBlur() {
                console.log('Terminal Blur');
            },
            // Terminal Change Title 事件
            listenerTermTitle() {

            },
            // Terminal Change Selection 事件
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
                // 移除 Window 窗口 Resize 监听
                window.removeEventListener('resize', () => this.termResize())
            },
            // Terminal Dialog Open
            open() {
                this.show = true
                setTimeout(() => {
                    this.term.focus()
                }, 300)
            },
        },
        beforeCreate() {
        },
        created() {
            // Term Resize 事件 防抖
            this.termResize = debounce(this.termResize, 500)
        },
        mounted() {
            this.init()
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
    padding-top: 32px
    visibility: hidden
    opacity: 0
    transform: translateY(100%)
    z-index: 999
    transition: all .3s
    &.active
        opacity: 1
        transform: translateY(0)
        visibility: visible
</style>
