<template>
    <q-dialog v-model="show"
              :no-backdrop-dismiss="true"
              :no-esc-dismiss="false"
              transition-show="slide-up"
              transition-hide="slide-down">
        <q-card class="attr-panel">
            <q-bar :class="{ 'bg-primary text-white': !$q.dark.isActive }">
                <div>{{ panelName }}</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup/>
            </q-bar>
            <q-card-section>
                <div>
                    <q-input label="会话名称" v-model="session.name" :placeholder="session.host"/>
                        <q-input label="地址" v-model="session.host">
                        <template v-slot:after>
                            <q-input style="width: 80px" v-model="session.port" label="端口" />
                        </template>
                    </q-input>
                    <q-input label="密码" v-model="session.password"
                            :type="showPwd ? 'text' : 'password'">
                        <template v-slot:append>
                            <q-btn v-show="session.password"
                                   :icon="showPwd ? 'visibility' : 'visibility_off'"
                                   flat round
                                   size="sm"
                                   @click="showPwd = !showPwd"/>
                        </template>
                    </q-input>
                </div>
                <div class="row q-mt-lg">创建于 {{ tools.formatDate(session.addTime, 'yyyy-MM-dd HH:mm:ss') }}</div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat v-close-popup>取消</q-btn>
                <q-btn flat color="primary" @click="confirm">确认</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: 'AttrPanel',
    components: {
    },
    data() {
        return {
            show: false,
            showPwd: false,
            session: {},
            panelName: '',
        }
    },
    computed: {
    },
    watch: {
    },
    methods: {
        open(item) {
            this.session = this.tools.clone(item)
            this.show = true
            this.panelName = `${this.session.name} 属性`
        },
        confirm() {
            this.$store.commit('session/SESSION_UPDATE', {
                sessionKey: this.session.sessionKey,
                updateItem: {
                    name: this.session.name,
                    host: this.session.host,
                    port: this.session.port,
                    username: this.session.username,
                    password: this.session.password,
                },
            })
            this.$emit('update')
            this.show = false
        },
    },
    created() {
    },
};
</script>

<style scoped lang="sass">
.attr-panel
    width: 400px
</style>
