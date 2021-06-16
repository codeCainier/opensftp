<template>
    <q-dialog v-model="show" maximized position="right">
        <div style="padding-top: 32px">
            <div class="panel-setting full-height">
                <div class="navigation shadow-20 q-py-sm">
                    <div class="title q-pl-lg q-my-lg">系统设置</div>
                    <q-list class="setting-item-list q-pr-md">
                        <q-item v-for="item in settingList"
                                :key="item.name"
                                clickable v-ripple
                                class="setting-item q-mb-sm"
                                :class="{ active: activeItem === item.name }"
                                @click="activeItem = item.name">
                            <q-item-section avatar>
                                <q-icon :name="item.icon" size="1.25em"/>
                            </q-item-section>

                            <q-item-section class="{}">{{ item.label }}</q-item-section>
                        </q-item>
                    </q-list>
                </div>
                <div class="container q-pa-sm">
                    <q-tab-panels v-model="activeItem" animated
                                  class="bg-transparent full-height"
                                  transition-prev="slide-down"
                                  transition-next="slide-up">
                        <q-tab-panel class="full-height" name="user">
                            <div class="title-main q-my-md">Hi， {{ nickname }}</div>
                            <div class="title-sec q-mb-md">What will you learn today?</div>
                        </q-tab-panel>

                        <q-tab-panel class="full-height" name="ui">
                            <div class="title-main q-my-md">Open SFTP UI</div>
                            <div class="title-sec q-mb-md">外观设置</div>
                            <div class="row q-col-gutter-md">
                                <div class="col-6">
                                    <q-card class="setting-card shadow-transition">
                                        <q-card-section>
                                            <div class="row">
                                                <div class="text-subtitle2 flex items-center">毛玻璃效果</div>
                                                <q-space/>
                                                <q-toggle v-model="aeroEnable" color="blue" size="sm"/>
                                            </div>
                                            <!--<div class="text-subtitle2 text-weight-regular text-grey">关闭毛玻璃效果，则半透明效果一同关闭</div>-->
                                        </q-card-section>
                                        <q-slide-transition>
                                            <div v-show="$store.state.setting.aeroEnable">
                                                <q-separator/>
                                                <q-card-section>
                                                    <div class="row">
                                                        <div class="text-subtitle2 flex items-center">会话列表不透明度</div>
                                                        <q-space/>
                                                        <div class="text-subtitle1">{{ sessionPoolOpacity }}%</div>
                                                    </div>
                                                    <q-slider v-model="sessionPoolOpacity" :min="0" :max="100" :step="5" label/>
                                                </q-card-section>
                                                <q-card-section>
                                                    <div class="row">
                                                        <div class="text-subtitle2 flex items-center">快速连接不透明度</div>
                                                        <q-space/>
                                                        <div class="text-subtitle1">{{ quickLinkOpacity }}%</div>
                                                    </div>
                                                    <q-slider v-model="quickLinkOpacity" :min="0" :max="100" :step="5" label/>
                                                </q-card-section>
                                                <q-card-section>
                                                    <div class="row">
                                                        <div class="text-subtitle2 flex items-center">SFTP 面板</div>
                                                        <q-space/>
                                                        <div class="text-subtitle1">{{ sftpOpacity }}%</div>
                                                    </div>
                                                    <q-slider v-model="sftpOpacity" :min="0" :max="100" :step="5" label/>
                                                </q-card-section>
                                            </div>
                                        </q-slide-transition>
                                    </q-card>
                                </div>
                            </div>
                        </q-tab-panel>

                        <q-tab-panel class="full-height" name="sftp"></q-tab-panel>

                        <q-tab-panel class="full-height" name="ssh">
                            <div class="title-main q-my-md">SSH Terminal 设置</div>
                            <div class="row q-col-gutter-md">
                                <div class="col-6 q-gutter-md">
                                    <div class="title-sec">外观设置</div>
                                    <q-card class="setting-card shadow-transition">
                                        <q-card-section>
                                            <div class="row">
                                                <div class="text-subtitle2 flex items-center">面板背景颜色</div>
                                                <q-space/>
                                                <q-btn icon="view_module" flat size="sm" :style="{ background: sshBackground }">
                                                    <q-tooltip>{{ sshBackground.toLocaleUpperCase() }}</q-tooltip>
                                                    <q-popup-proxy>
                                                        <q-color v-model="sshBackground"
                                                                 no-header
                                                                 no-footer
                                                                 v-close-popup
                                                                 default-view="palette"/>
                                                    </q-popup-proxy>
                                                </q-btn>
                                            </div>
                                        </q-card-section>
                                        <q-card-section>
                                            <div class="row">
                                                <div class="text-subtitle2 flex items-center">面板背景不透明度</div>
                                                <q-space/>
                                                <div class="text-subtitle1">{{ sshOpacity }}%</div>
                                            </div>
                                            <q-slider v-model="sshOpacity" :min="0" :max="100" :step="5" label/>
                                        </q-card-section>
                                    </q-card>
                                    <!--<q-card class="setting-card shadow-transition">-->
                                    <!--    <q-card-section>-->
                                    <!--        <div class="row">-->
                                    <!--            <div class="text-subtitle2 flex items-center">文字颜色</div>-->
                                    <!--            <q-space/>-->
                                    <!--            <q-btn icon="view_module" flat size="sm" :style="{ background: sshTextColor }">-->
                                    <!--                <q-tooltip>{{ sshTextColor.toLocaleUpperCase() }}</q-tooltip>-->
                                    <!--                <q-popup-proxy>-->
                                    <!--                    <q-color v-model="sshTextColor"-->
                                    <!--                             no-header-->
                                    <!--                             no-footer-->
                                    <!--                             v-close-popup-->
                                    <!--                             default-view="palette"/>-->
                                    <!--                </q-popup-proxy>-->
                                    <!--            </q-btn>-->
                                    <!--        </div>-->
                                    <!--    </q-card-section>-->
                                    <!--</q-card>-->
                                </div>
                                <div class="col-6">
                                </div>
                            </div>
                        </q-tab-panel>

                        <q-tab-panel class="full-height" name="other">
                        </q-tab-panel>
                    </q-tab-panels>

                </div>
            </div>
        </div>
    </q-dialog>
</template>

<script>
export default {
    name: 'Setting',
    components: {
    },
    data() {
        return {
            show: false,
            activeItem: 'user',
            settingList: [
                { name: 'user',   label: '用户',  icon: 'ion-md-person' },
                { name: 'ui',     label: '界面',  icon: 'ion-md-shirt' },
                { name: 'sftp',   label: 'SFTP', icon: 'ion-md-folder' },
                { name: 'ssh',    label: 'SSH',  icon: 'ion-md-text' },
                { name: 'other',  label: '其他',  icon: 'ion-md-cube' },
            ],
            nickname: 'Test User',
            aeroBlur: {
                enable: true,
            },
        };
    },
    watch: {
        '$store.state.setting.show': function (newVal) {
            this.show = newVal
        },
        show(newVal) {
            if (!newVal) this.$store.commit('setting/SETTING_TOGGLE', false)
        },
    },
    computed: {
        aeroEnable: {
            get () {
                return this.$store.state.setting.aeroEnable
            },
            set (aeroEnable) {
                this.$store.commit('setting/UPDATE', { aeroEnable })
            },
        },
        sessionPoolOpacity: {
            get () {
                return this.$store.state.setting.sessionPoolOpacity
            },
            set (sessionPoolOpacity) {
                this.$store.commit('setting/UPDATE', { sessionPoolOpacity })
            },
        },
        quickLinkOpacity: {
            get () {
                return this.$store.state.setting.quickLinkOpacity
            },
            set (quickLinkOpacity) {
                this.$store.commit('setting/UPDATE', { quickLinkOpacity })
            },
        },
        sftpOpacity: {
            get () {
                return this.$store.state.setting.sftpOpacity
            },
            set (sftpOpacity) {
                this.$store.commit('setting/UPDATE', { sftpOpacity })
            },
        },
        sshBackground: {
            get () {
                return this.$store.state.setting.sshBackground
            },
            set (sshBackground) {
                this.$store.commit('setting/UPDATE', { sshBackground })
            },
        },
        sshOpacity: {
            get () {
                return this.$store.state.setting.sshOpacity
            },
            set (sshOpacity) {
                this.$store.commit('setting/UPDATE', { sshOpacity })
            },
        },
        sshTextColor: {
            get () {
                return this.$store.state.setting.sshTextColor
            },
            set (sshTextColor) {
                this.$store.commit('setting/UPDATE', { sshTextColor })
            },
        },
    },
}
</script>

<style lang="sass" scoped>
.body--light
    .panel-setting
        color: $dark
    .navigation
        background: #FFFFFF
        color: rgba($dark, .7)
        .title
            color: $dark
        .setting-item
            &:hover
                color: $dark
    .container
        background: rgba(#FFFFFF, .8)
        .setting-card
            background: #FFFFFF

.body--dark
    .panel-setting
        color: #FFFFFF
    .navigation
        background: $dark
        color: rgba(#FFFFFF, .2)
        .title
            color: #FFFFFF
        .setting-item
            &:hover
                color: #FFFFFF
    .container
        background: rgba($dark, .8)
        .setting-card
            background: rgba(#FFFFFF, .1)

.panel-setting
    display: flex
    flex-direction: row
    width: 90vw
.navigation
    width: 300px
    height: 100%
    .title
        font-size: 24px
        font-weight: 700
    .setting-item
        border-radius: 0 10px 10px 0
        .q-item__section--avatar
            min-width: 35px
        &.active
            background: $primary
            color: #FFFFFF
            box-shadow: $shadow-3
            &:hover
                color: #FFFFFF
        &:hover
            color: #FFFFFF
.container
    width: 100%
    height: 100%
    .title-main
        font-size: 18px
        font-weight: 700
    .title-sec
        font-size: 27px
    .setting-card
        border-radius: 10px
        &:hover
            box-shadow: $shadow-10
</style>
