<template>
    <div class="full-height q-pa-md flex flex-center relative-position">
        <div class="container text-center">
            <img class="illustration" src="~/assets/svg/quickLink.svg" alt="">
            <q-input v-model.trim="host" label="地址" autofocus spellcheck="false">
                <template v-slot:after>
                    <q-input v-model.trim="port" label="端口"
                             style="width: 80px"
                             type="number"/>
                </template>
            </q-input>
            <q-input label="用户" v-model.trim="username" spellcheck="false"/>
            <q-input label="密码" v-model.trim="password"
                     :type="showPwd ? 'text' : 'password'"
                     @keydown.enter="login">
                <template v-slot:append>
                    <q-btn v-show="password"
                           size="sm"
                           :icon="showPwd ? 'visibility' : 'visibility_off'"
                           flat round
                           @click="showPwd = !showPwd"/>
                </template>
            </q-input>
            <q-btn color="primary"
                   unelevated
                   :loading="loading"
                   label="快速连接"
                   class="q-mt-md full-width"
                   @click="login"/>
        </div>
        <div class="module-background" :style="moduleBg()"></div>
    </div>
</template>

<script>
    export default {
        name: 'QuickLink',
        data() {
            return {
                loading: false,
                showPwd: false,
                host: '',
                port: '22',
                username: 'root',
                password: '',
                conn: null,
            };
        },
        computed: {
            moduleBg() {
                return () => {
                    const style = {}
                    style.opacity = this.$store.state.setting.quickLinkOpacity / 100
                    return style
                }
            }
        },
        methods: {
            // 连接会话
            login() {
                const { host, port, username, password } = this

                if (!host)     return this.notify.info('地址不能为空')
                if (!port)     return this.notify.info('端口不能为空')
                if (!username) return this.notify.info('用户不能为空')
                if (!password) return this.notify.info('密码不能为空')

                this.loading = true

                this.$store.dispatch('session/CONNECT_QUICK', {
                    host,
                    port,
                    username,
                    password,
                })
                    .finally(() => this.loading = false)
            },
        },
    };
</script>

<style lang="sass" scoped>
.container
    width: 300px
    .illustration
        height: 200px
</style>
