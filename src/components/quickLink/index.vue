<template>
    <div class="full-height q-pa-md flex flex-center">
        <div class="container text-center">
            <svg-quickLink class="illustration"/>
            <q-input label="地址" v-model.trim="host">
                <template v-slot:after>
                    <q-input style="width: 80px" v-model.trim="port" label="端口" type="number"/>
                </template>
            </q-input>
            <q-input label="用户" v-model.trim="username"/>
            <q-input label="密码" v-model.trim="password"
                     :type="showPwd ? 'text' : 'password'"
                     @keydown.enter="login">
                <template v-slot:append>
                    <q-btn v-show="password"
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
    import { uid } from 'quasar'
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
                host: '',
                port: '',
                username: '',
                password: '',
                conn: null,
            };
        },
        methods: {
            // 连接会话
            login() {
                this.loading = true

                const id = uid()

                this.$store.commit('session/CREATE', {
                    id,
                    host     : this.host,
                    port     : this.port,
                    username : this.username,
                    password : this.password,
                })

                this.$store.dispatch('session/LOGIN', id)
                    .then(() => {
                        this.loading = false
                        this.$router.push({ path: '/session' })
                    })
                    .catch(err => {
                        this.loading = false
                        this.confirm(err)
                    })
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
