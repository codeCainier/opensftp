<template>
    <div class="fs-system">
        <q-inner-loading :showing="loading" style="z-index: 100">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        <div class="fs-control flex">
            <input class="pwd-input" type="text" v-model.trim="pwd" 
                   @keydown.enter="la"
                   @blur="pwd = lastPwd">
            <q-space/>
            <button type="button" class="btn-enter" @click="la">
                <q-icon name="chevron_right"/>
            </button>
            <button type="button" class="btn-enter" @click="la">
                <q-icon name="refresh"/>
            </button>
        </div>
        <div class="fs-head">
            <div class="item select-all"></div>
            <div class="item name">文件名称</div>
            <div class="item size">文件大小</div>
            <div class="item date">修改日期</div>
            <div class="item owner">所有者</div>
            <div class="item group">群组</div>
        </div>
        <div class="fs-body full-height">
            <q-scroll-area class="full-height">
                <div v-for="(item, index) in list" 
                     class="fs-item"
                     tabindex="0"
                     :ref="'file-' + index"
                     :key="index" 
                     :class="{ 
                         hidden: hideItem(item),
                         'focus-temp': openMenu === index || renameItem.index === index,
                     }"
                     @click="selectFile(index)"
                     @dblclick="dirEnter"
                     @keydown.enter="dirEnter"
                     @keydown.exact.backspace="dirBack"
                     @keydown.f2="renameOpen(item, index)"
                     @keydown.meta.delete="removeFile(item)"
                     @keydown.prevent.up="moveFocus('up')"
                     @keydown.prevent.down="moveFocus('down')">
                    <div class="item icon">
                        <img :src="getFileIcon(item)" alt="">
                    </div>
                    <div class="item name">
                        <div v-show="renameItem.index !== index">{{ item.name }}</div>
                        <input v-model="renameItem.name"
                               v-show="renameItem.index === index && item.name !== '..'"
                               type="text"
                               tabindex="0"
                               ref="rename-input"
                               class="rename-input no-outline no-border no-padding"
                               :placeholder="item.oldname"
                               @blur="renameClose(index)"
                               @click.stop=""
                               @dblclick.stop=""
                               @keydown.esc="renameCancel(index)"
                               @keydown.stop.delete=""
                               @keydown.stop.up=""
                               @keydown.stop.down=""
                               @keydown.stop.delete=""
                               @keydown.stop.alt.r=""
                               @keydown.stop.enter="$refs['rename-input'][index].blur()">
                    </div>
                    <div v-if="item.name !== '..'" class="item size">{{ fileSize(item) }}</div>
                    <div v-if="item.name !== '..'" class="item date">{{ fileCreatedTime(item.date) }}</div>
                    <div v-if="item.name !== '..'" class="item owner">{{ item.owner }}</div>
                    <div v-if="item.name !== '..'" class="item group">{{ item.group }}</div>
                    <!-- 右键菜单 -->
                    <menu-list v-if="item.name !== '..'"
                               action="remote"
                               :listItem="item"
                               @click="openMenu = index"
                               @close="selectFile(index)"
                               @download="download(item)"
                               @rename="renameOpen(item, index)"
                               @remove="removeFile(item)"/>
                </div>
            </q-scroll-area>
        </div>
    </div>
</template>

<script>
/**
 * 继承自 Linux 思想，所有都是文件
 */
import fs from 'fs'
import path from 'path'
import menuList from '../menuList'

export default {
    name: 'SFTPRemote',
    components: {
        'menu-list': menuList,
    },
    data() {
        return {
            ssh: '',
            // 是否显示隐藏项目
            showHideItem: true,
            // 全选
            selectAll: false,
            // pwd
            pwd: '/',
            // 最后一次有效 pwd
            lastPwd: '',
            list: [],
            loading: false,
            selected: 0,
            openMenu: null,
            renameItem: {},
        }
    },
    computed: {
        hideItem() {
            // 文件名以 . 开头为隐藏文件
            return item => item.name.startsWith('.') && item.name !== '..'
        },
        fileSize() {
            // 只有文件类型才有文件大小概念
            return item => item.type === 'd' ? '-' : this.tools.formatFlow(item.size, 1024, 'B', 1024, 0)
        },
        listFormat() {
            return stdout => {
                const list = []
                stdout.split('\n').forEach(item => {
                    const itemArr = item.split(' ').filter(tempItem => tempItem)
                    // 忽略 total
                    if (itemArr.length < 8) return
                    // 忽略 .
                    if (itemArr[7] === '.') return
                    // push 到 list 数组
                    list.push({
                        // 文件类型
                        type    : itemArr[0].substring(0, 1),
                        // 文件数量
                        childNum: itemArr[1],
                        // 所有者
                        owner   : itemArr[2],
                        // 所在群组
                        group   : itemArr[3],
                        // 文件大小
                        size    : itemArr[4],
                        // 创建日期
                        date    : `${itemArr[5]} ${itemArr[6]}`,
                        // 文件名称
                        name    : itemArr[7],
                        // 链接地址
                        link    : itemArr[9] || ''
                    })
                })
                return list
            }
        },
        getFileIcon() {
            return item => {
                const { type, name } = item
                const suffix = type === '-' ? name.split('.').pop() : ''
                // ..
                if (name === '..') return require('src/assets/sftp-icons/folder-other.svg')
                // 目录
                if (type === 'd')  return require('src/assets/sftp-icons/folder.svg')
                // 链接
                if (type === 'l')  return require('src/assets/sftp-icons/folder-shared.svg')
                // 管理文件
                if (type === 'p')  return 'p'
                // 设备文件
                if (type === 'b')  return 'b'
                // 字符设备文件
                if (type === 'c')  return 'c'
                // 套接字文件
                if (type === 's')  return 's'
                // 根据后缀匹配
                if (suffix === 'html') return require('src/assets/sftp-icons/html.svg')
                if (suffix === 'css')  return require('src/assets/sftp-icons/css.svg')
                if (suffix === 'js')   return require('src/assets/sftp-icons/javascript.svg')
                if (suffix === 'md')   return require('src/assets/sftp-icons/readme.svg')
                if (suffix === 'sh')   return require('src/assets/sftp-icons/console.svg')
                if (suffix === 'go')   return require('src/assets/sftp-icons/go.svg')
                if (suffix === 'php')   return require('src/assets/sftp-icons/php.svg')
                if (['png', 'jpg', 'jpeg', 'gif', 'tiff', 'ico', 'icns'].includes(suffix)) return require('src/assets/sftp-icons/image.svg')
                if (['ini', 'conf'].includes(suffix)) return require('src/assets/sftp-icons/settings.svg')
                if (['tar', 'gz', 'tgz', 'zip', 'rar', '7z'].includes(suffix)) return require('src/assets/sftp-icons/zip.svg')
                // 普通文件
                if (type === '-') return require('src/assets/sftp-icons/document.svg')
            }
        },
        fileCreatedTime() {
            return time => this.tools.formatDate(new Date(time).getTime(), 'MM-dd HH:mm')
        },
    },
    methods: {
        // 列出当前路径文件列表
        la(focusFile) {
            this.loading = true
            this.ssh.execCommand('ls -la --time-style="+%Y-%m-%d %H:%I:%S"', { cwd: this.pwd })
                .then(res => {
                    this.loading = false
                    if (res.stderr) {
                        if (res.stderr.endsWith('No such file or directory')) res.stderr = `目录 ${this.pwd} 不存在`
                        this.pwd = this.lastPwd
                        return this.tools.confirm(res.stderr)
                    }
                    this.list = this.listFormat(res.stdout)
                    this.lastPwd = this.pwd
                    this.selected = 0
                    // 若指定聚焦文件
                    if (typeof focusFile === 'string') {
                        for (let index = 0; index < this.list.length; index += 1) {
                            if (this.list[index].name === focusFile) {
                                this.selected = index
                                break
                            }
                        }
                    }
                    this.$nextTick(() => {
                        this.fileFocus()
                    })
                })
        },
        // 目录进入
        dirEnter() {
            const { name } = this.list[this.selected]
            this.pwd = (() => {
                const arr = this.pwd.split('/').filter(arrItem => arrItem)
                name === '..' ? arr.pop() : arr.push(name)
                return '/' + arr.join('/')
            })()
            this.la()
        },
        // 目录返回
        dirBack() {
            this.pwd = (() => {
                const arr = this.pwd.split('/').filter(arrItem => arrItem)
                arr.pop()
                return '/' + arr.join('/')
            })()
            this.la()
        },
        // 连接 SSH
        sshLogin() {
            this.loading = true
            const { tags, active } = this.$store.state.session
            const { host, port, username, password } = tags.filter(item => item.id === active)[0].sessionInfo
            this.tools.ssh({
                params: { host, port, username, password },
                success: ssh => {
                    this.ssh     = ssh
                    this.lastPwd = ''
                    this.la()
                },
            })
        },
        // 下载
        download(item) {
            if (item.type === 'd') {
                    fs.mkdirSync(path.join('/', item.name), { recursive: true })
                this.ssh.getDirectory(path.join('/', item.name), `${this.lastPwd}/${item.name}`)
                    .then(Contents => {
                        this.notify.success(`目录 ${item.name} 下载成功`)
                        console.log(Contents);
                    }, err => {
                        this.notify.error(`目录 ${item.name} 下载失败`)
                        console.log(err)
                    });
            }
            if (item.type === '-') {
                this.ssh.getFile(path.join('/', item.name), `${this.lastPwd}/${item.name}`)
                    .then(Contents => {
                        this.notify.success(`文件 ${item.name} 下载成功`)
                        console.log(Contents);
                    }, err => {
                        this.notify.error(`文件 ${item.name} 下载失败`)
                        console.log(err)
                    })
            }
        },
        // 选择文件
        selectFile(index) {
            this.openMenu = null
            this.selected = index
            this.fileFocus()
        },
        // 文件聚焦
        fileFocus() {
            this.$refs[`file-${this.selected}`][0].focus()
        },
        // 移动聚焦元素
        moveFocus(action) {
            if (action === 'up' && this.selected !== 0) this.selected -= 1
            if (action === 'down' && this.selected !== this.list.length - 1) this.selected += 1
            // 若不显示隐藏文件，判断当前 selected 元素是否为隐藏文件
            // 若为隐藏文件，则递归移动聚焦元素
            if (!this.showHideItem && this.hideItem(this.list[this.selected])) return this.moveFocus(action)
            // 文件聚焦
            this.fileFocus()
        },
        // 重命名开始
        renameOpen(item, index) {
            this.renameItem = this.tools.clone(item)
            this.renameItem.oldname = this.renameItem.name
            this.renameItem.index = index
            // FIXME: nextTick 无效
            setTimeout(() => this.$refs['rename-input'][index].focus(), 100)
        },
        // 重命名结束
        renameClose(index) {
            // 新名称与旧名称相同
            if (this.renameItem.name === this.renameItem.oldname) {
                this.renameItem = {}
                this.fileFocus()
                return
            }
            // 新名称存在
             if (this.list.filter(item => item.name === this.renameItem.name).length === 1) {
                // FIXME: 由 keydown enter 触发的事件，会影响 confirm 组件
                return setTimeout(() => {
                    this.tools.confirm({
                        message: `已存在文件 ${this.renameItem.name}`,
                        confirm: () => {
                            setTimeout(() => this.$refs['rename-input'][index].focus(), 100)
                        }
                    })
                }, 100);
            }
            // 重命名
            this.loading = true
            this.ssh.execCommand(`mv ${this.renameItem.oldname} ${this.renameItem.name}`, { cwd: this.pwd })
                .then(res => {
                    this.loading = false
                    if (res.stderr) return this.tools.confirm(res.stderr)
                    this.la(this.renameItem.name)
                    this.renameItem = {}
                })
        },
        // 重命名取消
        renameCancel(index) {
            this.renameItem.name = this.renameItem.oldname
            this.$refs['rename-input'][index].blur()
        },
        // 删除文件
        removeFile(item) {
            this.tools.confirm({
                message: `您确定要删除 ${item.name} 吗？注意，删除无法恢复！`,
                confirm: () => {
                    this.loading = true
                    this.ssh.execCommand(`rm -rf ${item.name}`, { cwd: this.pwd })
                        .then(res => {
                            this.loading = false
                            if (res.stderr) return this.tools.confirm(res.stderr)
                            this.la()
                        })
                },
                cancel: () => {},
            })
        },
    },
    created() {
        this.sshLogin()
    }
}
</script>