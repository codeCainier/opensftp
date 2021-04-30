<template>
    <div class="full-height q-pa-md flex flex-center">
        <div class="container text-center">
            <svg-quickLink class="illustration"/>
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
    </div>
</template>

<script>
    import svgQuickLink from 'src/components/svg/quickLink'

    export default {
        name: 'QuickLink',
        components: {
            'svg-quickLink': svgQuickLink
        },
        data() {
            return {
                loading: false,
                showPwd: false,
                host: '192.168.0.152',
                port: '22',
                username: 'root',
                password: 'srunsoft@xian',
                conn: null,
            };
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

                this.$store.dispatch('session/QUICK_LOGIN', {
                    host,
                    port,
                    username,
                    password,
                })
                    .then(() => this.$router.push({ path: '/session' }))
                    .catch(err => this.alert(err))
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
