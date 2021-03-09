<template>
    <div class="fs-system">
        <q-inner-loading :showing="loading" style="z-index: 100">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
        <div class="fs-control flex">
            <input class="pwd-input" type="text" v-model.trim="pwdInput" 
                   @keydown.enter="getFileList(null, pwdInput)">
            <q-space/>
            <button type="button" class="btn-enter" @click="getFileList(null, pwdInput)">
                <q-icon name="chevron_right"/>
            </button>
            <button type="button" class="btn-enter" @click="getFileList('.')">
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
                <!-- File .. -->
                <div v-show="pwd !== '/'"
                     class="fs-item" tabindex="0" 
                     @dblclick="getFileList('..')"
                     @keydown.exact.enter="getFileList('..')">
                    <div class="item icon">
                        <img src="~/assets/sftp-icons/folder-other.svg" alt="">
                    </div>
                    <div class="item name">..</div>
                </div>
                <!-- File List -->
                <div v-for="(item, index) in list" 
                     class="fs-item"
                     tabindex="0"
                     :ref="'file-item-' + index"
                     :key="item.name" 
                     :class="{ 
                         hidden: hideItem(item),
                         'focus-temp': openMenu === index || renameItem.name === item.name,
                     }"
                     @click="fileFocus(index)"
                     @dblclick="getFileList(item.name)"
                     @keydown.enter="getFileList(item.name)"
                     @keydown.exact.delete="removeFile(item)"
                     @keydown.f2="renameOpen(item, index)"
                     @keydown.prevent.up="moveFocus('up')"
                     @keydown.prevent.down="moveFocus('down')">
                    <div class="item icon">
                        <img :src="getFileIcon(item)" alt="">
                    </div>
                    <div class="item name">
                        <div v-show="renameItem.name !== item.name">{{ item.name }}</div>
                        <input v-model="renameItem.newName"
                               v-show="renameItem.name === item.name"
                               type="text"
                               tabindex="0"
                               :ref="'rename-input-' + index"
                               class="rename-input no-outline no-border no-padding"
                               :placeholder="item.name"
                               @blur="renameClose(index)"
                               @click.stop=""
                               @dblclick.stop=""
                               @keydown.esc="renameCancel(index)"
                               @keydown.stop.delete=""
                               @keydown.stop.up=""
                               @keydown.stop.down=""
                               @keydown.stop.alt.r=""
                               @keydown.stop.enter="$refs[`rename-input-${index}`][0].blur()">
                    </div>
                    <div class="item size">{{ fileSize(item) }}</div>
                    <div class="item date">{{ fileCreatedTime(item.date) }}</div>
                    <div class="item owner">{{ item.owner }}</div>
                    <div class="item group">{{ item.group }}</div>
                    <!-- 右键菜单 -->
                    <menu-list action="remote"
                               :listItem="item"
                               @click="openMenu = index"
                               @close="fileFocus(index)"
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
import { uid } from 'quasar'
import fs from 'fs'
import path from 'path'
import menuList from '../menuList'

const Client = require('ssh2').Client

export default {
    name: 'SFTPRemote',
    components: {
        'menu-list': menuList,
    },
    data() {
        return {
            // 是否显示隐藏项目
            showHideFile: false,
            // 全选
            selectAll: false,
            // 当前所在目录
            pwd: '',
            // pwd 输入框
            pwdInput: '',
            list: [],
            loading: false,
            selected: null,
            openMenu: null,
            renameItem: {},
        }
    },
    watch: {
        pwd(newVal) {
            this.pwdInput = newVal
        },
    },
    computed: {
        hideItem() {
            // 文件名以 . 开头为隐藏文件
            return item => item.name.startsWith('.') && !this.showHideFile
        },
        fileSize() {
            // 只有文件类型才有文件大小概念
            return item => item.type === 'd' ? '-' : this.tools.formatFlow(item.size, 1024, 'B', 1024, 0)
        },
        listFormat() {
            return list => {
                const arr = []
                list.forEach(item => {
                    const { size, atime } = item.attrs
                    const longnameArr = item.longname.split(' ').filter(tempItem => tempItem)
                    const [ permission, childNum, owner, group ] = longnameArr
                    arr.push({
                        // 文件名称
                        name: item.filename,
                        // 文件类型
                        type: permission.substring(0, 1),
                        // 创建日期
                        date: atime,
                        // 文件数量
                        childNum,
                        // 所有者
                        owner,
                        // 所在群组
                        group,
                        // 文件大小
                        size,
                    })
                })
                return arr
            }
        },
        getFileIcon() {
            return item => {
                const { type, name } = item
                const suffix = type === '-' ? name.split('.').pop() : ''
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
            return time => this.tools.formatDate(time, 'MM-dd HH:mm')
        },
    },
    methods: {
        // 下载
        async download(item) {
            this.transferId = uid()
            // 初始化传输任务
            this.$store.commit('transfer/TASK_INIT', {
                id: this.transferId,
                action: 'download',
                tag: this.$store.state.session.active,
            })
            // 创建下载任务
            await this.createDownloadTask({
                id         : this.transferId,
                remotePath : this.pwd, 
                localPath  : path.join('/Users/xingrong/Downloads'), 
                fileName   : item.name, 
                fileSize   : item.size,
                isDir      : item.type === 'd', 
            })
        },
        // 重命名开始
        renameOpen(item, index) {
            this.renameItem = this.tools.clone(item)
            this.renameItem.newName = this.renameItem.name
            // TODO: nextTick 无效
            setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
        },
        // 重命名结束
        renameClose(index) {
            // 新名称与旧名称相同 或 新名称为空 相当于取消重命名
            if (this.renameItem.name === this.renameItem.newName || !this.renameItem.newName) {
                this.renameItem = {}
                this.fileFocus()
                return
            }
            // 新名称存在
             if (this.list.filter(item => item.name === this.renameItem.newName).length === 1) {
                // TODO: 由 keydown enter 触发的事件，会影响 confirm 组件
                return setTimeout(() => {
                    this.tools.confirm({
                        message: `已存在文件 ${this.renameItem.newName}`,
                        confirm: () => {
                            setTimeout(() => this.$refs[`rename-input-${index}`][0].focus(), 100)
                        }
                    })
                }, 500);
            }
            // 重命名
            this.loading = true
            this.sftpRename()
                .then(() => {
                    this.getFileList('.', null, this.renameItem.newName)
                })
                .catch(err => {
                    this.tools.confirm(err)
                    this.loading = false
                })
        },
        // 重命名取消
        renameCancel(index) {
            this.renameItem = {}
            this.$refs[`rename-input-${index}`][0].blur()
            this.fileFocus()
        },
        // 删除文件
        removeFile(item) {
            // TODO: 弹出删除对话框时，文件 Focus 状态应使用 class 补充
            this.tools.confirm({
                message: `您确定要删除 ${item.name} 吗？注意，删除无法恢复！`,
                confirm: () => {
                    this.loading = true
                    this.sftpRm(item)
                        .then(() => {
                            this.getFileList('.')
                        })
                        .catch(err => {
                            this.tools.confirm(err)
                            this.loading = false
                        })
                },
                cancel: () => {},
            })
        },
        // 读取目录下文件列表
        getFileList(dirName, pathName, focusFile) {
            this.loading = true
            
            const newPath = pathName || path.join(this.pwd, dirName)

            this.sftpList(newPath)
                .then(list => {
                    this.list = this.listFormat(list)
                    // 更新最后访问目录
                    this.pwd = newPath
                    // 若指定聚焦文件
                    if (typeof focusFile === 'string') {
                        this.list.forEach((item, index) => {
                            if (item.name === focusFile) this.selected = index
                        })
                    } else {
                        // 默认不选择元素
                        this.selected = null
                        document.activeElement.blur()
                    }
                    // 清除重命名元素
                    this.renameItem = {}
                    this.fileFocus()
                    this.loading = false
                })
                .catch(err => {
                    this.loading = false
                    this.pwdInput = this.pwd
                    this.tools.confirm(err)
                })
        },
        // 选择文件
        fileFocus(index = this.selected) {
            this.selected = index
            this.openMenu = null
            this.$nextTick(() => {
                try {
                    // TODO: 使用 this.$refs['file-item'][index] 的形式有 refs 数组索引错位的问题
                    this.$refs[`file-item-${index}`][0].focus()
                } catch (error) {
                }
            })
        },
        // 移动聚焦元素
        moveFocus(action) {
            if (action === 'up' && this.selected !== 0) this.selected -= 1
            if (action === 'down' && this.selected !== this.list.length - 1) this.selected += 1
            // 若不显示隐藏文件，判断当前 selected 元素是否为隐藏文件
            // 若为隐藏文件，则递归移动聚焦元素
            if (!this.showHideFile && this.hideItem(this.list[this.selected])) return this.moveFocus(action)
            this.fileFocus()
        },
        // SFTP 文件列表
        async sftpList(cwd) {
            const conn = new Client()
            return new Promise((resolve, reject) => {
                conn
                    .on('ready', () => {
                        conn.sftp((err, sftp) => {
                            if (err) return reject(err)
                            sftp.readdir(cwd, (err, list) => {
                                if (err) return reject(err)
                                console.log(list);
                                resolve(list)
                                conn.end()
                            })
                        })
                    })
                    .on('error', () => reject())
                    .connect(this.sessionInfo)
            })
        },
        // SFTP 删除文件
        async sftpRm(item) {
            const conn = new Client()
            const mode = item.type === 'd' ? 'rmdir' : 'unlink'
            const file = path.join(this.pwd, item.name)
            return new Promise((resolve, reject) => {
                conn
                    .on('ready', () => {
                        conn.sftp((err, sftp) => {
                            if (err) return reject(err)
                            sftp[rmMode](file, err => {
                                if (err) return reject(err)
                                resolve()
                                conn.end()
                            })
                        })
                    })
                    .on('error', () => reject())
                    .connect(this.sessionInfo)
            })
        },
        // SFTP 文件重命名
        async sftpRename() {
            const conn = new Client()
            const file = path.join(this.pwd, this.renameItem.name)
            const dist = path.join(this.pwd, this.renameItem.newName)

            return new Promise((resolve, reject) => {
                conn
                    .on('ready', () => {
                        conn.sftp((err, sftp) => {
                            if (err) return reject(err)
                            sftp.rename(file, dist, err => {
                                if (err) return reject(err)
                                resolve()
                                conn.end()
                            })
                        })
                    })
                    .on('error', () => reject())
                    .connect(this.sessionInfo)
            })
        },
        // SFTP 文件下载
        async sftpDownload(params) {
            const { remote, local, isDir, progress } = params

            if (isDir) return fs.mkdirSync(local, { recursive: true })

            const conn = new Client()
            const option = {
                step: (finish, chunk, total) => {
                    if (progress) progress(finish, chunk, total)
                    const percent = (finish / total).toFixed(2)
                },
            }

            return new Promise((resolve, reject) => {
                conn
                    .on('ready', () => {
                        conn.sftp((err, sftp) => {
                            if (err) return reject(err)
                            sftp.fastGet(remote, local, option, err => {
                                if (err) return reject(err)
                                resolve()
                                conn.end()
                            })
                        })
                    })
                    .on('error', () => reject())
                    .connect(this.sessionInfo)
            })
        },
        // 创建下载任务
        async createDownloadTask(params) {
            // find . -print 2>/dev/null|awk '!/\.$/ {for (i=1;i<NF;i++){d=length($i);if ( d < 50 && i != 1 )d=2;printf("%"d"s","|")}print "---"$NF}' FS='/'
            const {
                id,
                remotePath, 
                localPath, 
                fileName, 
                fileSize,
                isDir,
            } = params
            const task = {}
            const tid = uid()
            // 文件的远程地址
            const fileRemotePath = path.join(remotePath, fileName)
            // 文件的本地地址
            const fileLocalPath  = path.join(localPath, fileName)
            // 文件名称
            task.name       = fileName
            task.size       = fileSize
            task.remotePath = fileRemotePath
            task.localPath  = fileLocalPath
            // 若文件非目录类型
            if (!isDir) {
                this.$store.commit('transfer/TASK_ADD', { id, tid, task })
                // 下载文件
                await this.sftpDownload({
                    remote   : task.remotePath,
                    local    : task.localPath,
                    isDir    : false,
                    progress : finish => {
                        this.$store.commit('transfer/TASK_UPDATE', { id, tid, finish })
                    },
                })
            }
            // 若文件为目录类型
            if (isDir) {
                // 下载文件
                await this.sftpDownload({
                    remote   : task.remotePath,
                    local    : task.localPath,
                    isDir    : true,
                })
                task.list = []
                // 目录下的文件列表
                const fileList = await this.sftpList(fileRemotePath)
                // 遍历文件列表
                for(const item of fileList) {
                    task.list.push(await this.createDownloadTask({
                        id,
                        remotePath : fileRemotePath, 
                        localPath  : fileLocalPath, 
                        fileName   : item.filename, 
                        fileSize   : item.attrs.size,
                        isDir      : item.longname.substring(0, 1) === 'd',
                    }))
                }
            }
        },
    },
    created() {
        this.sessionInfo = this.$store.state.session.active.params
        this.getFileList('/')
    }
}
</script>