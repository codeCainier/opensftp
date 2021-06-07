<template>
    <q-dialog v-model="show"
              :no-backdrop-dismiss="true"
              :no-esc-dismiss="false"
              transition-show="slide-up"
              transition-hide="slide-down">
        <q-card class="card-panel">
            <q-card-section class="card-header">
                <div class="full-width">
                    <div class="text-subtitle2 q-mb-xs">{{ updateItem ? '更新会话' : '创建会话' }}</div>
                    <div class="intro">可以在这里进行详细的会话配置</div>
                </div>
                <q-btn flat>
                    <q-avatar size="42px" square>
                        <img :src="icon">
                    </q-avatar>
                    <icon-select @select="iconPath => this.icon = iconPath "/>
                </q-btn>
            </q-card-section>

            <q-card-section class="card-section">

                <div class="form-row q-mb-sm">
                    <div class="form-label">会话名称:</div>
                    <div class="form-component full-width q-pl-sm">
                        <input type="text"
                               spellcheck="false"
                               class="form-input full-width"
                               v-model.trim="name" autofocus>
                    </div>
                </div>

                <div class="form-row q-mb-sm">
                    <div class="form-label">地址与端口:</div>
                    <div class="form-component full-width q-pl-sm">
                        <input type="text"
                               class="form-input full-width q-mr-sm"
                               v-model.trim="host"
                               spellcheck="false"
                               placeholder="支持域名 / IPv4 / IPv6">
                        <input type="text"
                               class="form-input q-ml-sm" v
                               v-model.trim="port"
                               style="width: 100px"
                               placeholder="22">
                    </div>
                </div>

                <div class="form-row q-mb-sm">
                    <div class="form-label">用户:</div>
                    <div class="form-component full-width q-pl-sm">
                        <input type="text"
                               class="form-input full-width"
                               spellcheck="false"
                               v-model.trim="username"
                               placeholder="root">
                    </div>
                </div>

                <div class="form-row q-mb-sm">
                    <div class="form-label">选择认证方式</div>
                    <div class="form-component full-width q-pl-sm">
                        <select class="form-select full-width" v-model="authMode">
                            <option value="password">使用密码进行认证</option>
                            <option value="sshKey">使用 SSH Key 进行认证</option>
                        </select>
                    </div>
                </div>

                <div class="form-row q-mb-sm" v-if="authMode === 'password'">
                    <div class="form-label">密码:</div>
                    <div class="form-component full-width q-pl-sm">
                        <input type="password"
                               class="form-input full-width q-mr-sm"
                               v-model.trim="password"
                               @keydown.enter="createQuick">
                    </div>
                </div>

                <div class="form-row q-mb-sm" v-if="authMode === 'sshKey'">
                    <div class="form-label">SSH Key 路径:</div>
                    <div class="form-component full-width q-pl-sm">
                        <input type="text"
                               readonly
                               spellcheck="false"
                               class="form-input full-width q-mr-sm"
                               v-model="privateKey"
                               placeholder="请选择 SSH Key 路径">
                        <button class="input-slot-btn q-ml-sm"
                                type="button"
                                v-ripple
                                @click="selectPrivateKey">
                            <q-icon name="folder"/>
                        </button>
                    </div>
                </div>

                <q-separator spaced="xl"/>

                <div class="form-row q-mb-sm">
                    <div class="form-label">默认进入的远程目录:</div>
                    <div class="form-component full-width q-pl-sm">
                        <input type="text"
                               class="form-input full-width"
                               spellcheck="false"
                               v-model.trim="remotePath"
                               placeholder="/">
                    </div>
                </div>

                <q-separator spaced="xl"/>

                <div class="form-row q-mb-sm">
                    <div class="form-label">默认打开的本地目录:</div>
                    <div class="form-component full-width q-pl-sm">
                        <input type="text"
                               readonly
                               class="form-input full-width q-mr-sm"
                               v-model="localPath"
                               spellcheck="false">
                        <button class="input-slot-btn q-ml-sm"
                                type="button"
                                v-ripple
                                @click="selectLocalPath">
                            <q-icon name="folder"/>
                        </button>
                    </div>
                </div>

            </q-card-section>

            <q-card-actions class="card-footer">
                <!--<q-btn label="高级选项" flat/>-->
                <q-space/>
                <q-btn flat v-close-popup>取消</q-btn>
                <q-btn v-if="!updateItem" flat @click="create">创建</q-btn>
                <q-btn v-if="updateItem"  flat @click="update">更新</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import path from 'path'
import { uid } from 'quasar'

export default {
    name: 'SessionDetail',
    data() {
        return {
            show        : false,
            updateItem  : null,
            authMode    : 'password',
            name        : '',
            icon        : './statics/icons/server-icons/default.svg',
            host        : '',
            port        : '22',
            username    : 'root',
            password    : '',
            privateKey  : path.join(this.$q.electron.remote.app.getPath('home'), '.ssh', 'id_rsa.pub'),
            remotePath  : '/',
            localPath   : path.join(this.$q.electron.remote.app.getPath('home')),
        }
    },
    watch: {
        show(newVal) {
            if (!newVal) this.$emit('close')
        }
    },
    methods: {
        open(item) {
            if (item) {
                this.updateItem = item
                this.name       = item.name
                this.icon       = item.icon
                this.host       = item.detail.host
                this.port       = item.detail.port
                this.authMode   = item.detail.authMode
                this.username   = item.detail.username
                this.password   = this.tools.aesDecode(item.detail.password)
                this.privateKey = item.detail.privateKey
                this.remotePath = item.detail.remotePath
                this.localPath  = item.detail.localPath
            }
            this.show = true
        },
        create() {
            const id = uid()
            // TODO: 证书 SSH 认证的原理，是否需要把证书复制到 Open SFTP 目录下
            this.$store.commit('session/CREATE_SESSION', {
                id,
                name        : this.name,
                icon        : this.icon,
                host        : this.host,
                port        : this.port,
                username    : this.username,
                password    : this.authMode === 'password' ? this.password : '',
                privateKey  : this.authMode === 'sshKey' ? this.privateKey : '',
                authMode    : this.authMode,
                localPath   : this.localPath,
                remotePath  : this.remotePath,
            })
            this.show = false
            const sessionItem = this.$store.getters['session/sessionInfo']({ id })
            this.confirm(`会话创建成功，是否连接 ${sessionItem.name}？`)
                .then(() => {
                    this.$store.dispatch('session/CONNECT', sessionItem)
                })
        },
        update() {
            this.$store.commit('session/UPDATE', {
                id: this.updateItem.id,
                updateItem: {
                    name        : this.name,
                    icon        : this.icon,
                    host        : this.host,
                    port        : this.port,
                    username    : this.username,
                    password    : this.password,
                    privateKey  : this.privateKey,
                    authMode    : this.authMode,
                    localPath   : this.localPath,
                    remotePath  : this.remotePath,
                },
            })
            this.show = false
        },
        selectPrivateKey() {
            this.$q.electron.remote.dialog.showOpenDialog({
                defaultPath: path.dirname(this.privateKey),
                properties: [ 'openFile', 'showHiddenFiles' ],
                message: '选择 SSH Key',
                buttonLabel: '确认'
            })
                .then(res => {
                    if (res.canceled) return
                    [this.privateKey] = res.filePaths
                })
                .catch(err => console.error(err))
        },
        selectLocalPath() {
            this.$q.electron.remote.dialog.showOpenDialog({
                defaultPath: this.localPath,
                properties: [ 'openDirectory' ],
                message: '选择默认进入的本地目录',
                buttonLabel: '确认'
            })
                .then(res => {
                    if (res.canceled) return
                    [this.localPath] = res.filePaths
                })
                .catch(err => console.error(err))
        },
        createQuick() {
            // 创建模式
            if (!this.updateItem) {
                this.confirm({
                    message: '是否进行创建？',
                    confirm: () => this.create(),
                    cancel: () => {},
                })
            }
            // 编辑模式
            if (this.updateItem) {
                this.confirm({
                    message: '是否保存编辑？',
                    confirm: () => this.update(),
                    cancel: () => {},
                })
            }
        },
    },
};
</script>

<style scoped lang="sass">
.body--light
    .card-header
        background: #EEEEEE
        border-bottom: 1px solid #DDDDDD
    .card-section
        background: rgba(#FFFFFF, .7)
        .form-input,
        .form-select
            background: rgba($dark, .1)
            color: $dark
        .input-slot-btn
            background: rgba($primary ,.8)
    .card-footer
        background: #EEEEEE
        border-top: 1px solid #DDDDDD

.body--dark
    .card-header
        background: #282828
        border-bottom: 1px solid #000000
    .card-section
        background: rgba($dark, .7)
        .form-input,
        .form-select
            background: rgba(#FFFFFF, .1)
            color: #FFFFFF
        .input-slot-btn
            background: rgba($primary ,.3)
    .card-footer
        background: #282828
        border-top: 1px solid #000000

.card-panel
    overflow: unset
    background: transparent
    box-shadow: $shadow-20 !important
    .card-header
        display: flex
        align-items: center
        justify-content: space-between
        .intro
            color: #888888
            font-size: 12px
    .card-section
        backdrop-filter: blur(10px)
        .form-row
            display: flex
            align-items: center
        .form-component
            position: relative
            display: flex
            align-items: center
            width: 300px
        .form-label
            width: 200px
            text-align: right
        .form-input
            padding: 0 5px
            border: 2px solid transparent
            outline: none
            height: 30px
            border-radius: 4px
            &:focus
                border-color: $primary
            &::-webkit-input-placeholder
                font-size: 14px
        .form-select
            padding: 0 5px
            border: 2px solid transparent
            outline: none
            height: 30px
            border: 2px solid transparent
            border-radius: 4px
            &:focus
                border-color: $primary
        .input-slot-btn
            position: relative
            display: flex
            height: 30px
            align-items: center
            justify-content: center
            padding: 0 10px
            border: 2px solid transparent
            outline: none
            color: #FFFFFF
            border-radius: 4px
            white-space: nowrap
            cursor: pointer
            box-sizing: border-box
            transition: all .3s
            &:focus
                border-color: $primary
            &:hover
                background: $primary
            &:active
                background: $primary
</style>
