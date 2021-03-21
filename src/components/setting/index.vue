<template>
    <q-dialog v-model="show" maximized position="right">
        <div style="padding-top: 32px">
            <div class="panel-setting full-height">
                <div class="navigation q-py-sm">
                    <div class="title q-pl-lg q-my-lg">Setting</div>
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
                            <div class="title-main q-my-md">Hi， 莫愁</div>
                            <div class="title-sec q-mb-md">What will you learn today?</div>
                        </q-tab-panel>

                        <q-tab-panel class="full-height" name="ui">
                            <div class="title-main q-my-md">Open SFTP UI</div>
                            <div class="title-sec q-mb-md">外观设置</div>
                            <div class="row q-col-gutter-md">
                                <div class="col-6">
                                    <q-card class="setting-card shadow-10">
                                        <q-card-section>
                                            <div class="text-h6">Our Changing Planet</div>
                                            <div class="text-subtitle2">by John Doe</div>
                                        </q-card-section>
                                    </q-card>
                                </div>
                                <div class="col-6">
                                    <q-card class="setting-card shadow-10">
                                        <q-card-section>
                                            <div class="text-h6">Our Changing Planet</div>
                                            <div class="text-subtitle2">by John Doe</div>
                                        </q-card-section>
                                    </q-card>
                                </div>
                            </div>
                        </q-tab-panel>

                        <q-tab-panel class="full-height" name="sftp">
                        </q-tab-panel>

                        <q-tab-panel class="full-height" name="ssh">
                        </q-tab-panel>

                        <q-tab-panel class="full-height" name="update">
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
                { name: 'update', label: '更新',  icon: 'ion-md-cube' },
            ]
        };
    },
    methods: {
    }
}
</script>

<style lang="sass" scoped>
.panel-setting
    display: flex
    flex-direction: row
    width: 90vw
    color: #FFFFFF
.navigation
    width: 300px
    height: 100%
    background: $dark
    color: rgba(#FFFFFF, .2)
    .title
        font-size: 24px
        font-weight: 700
        color: #FFFFFF
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
.container
    width: 100%
    height: 100%
    background: rgba($dark, .8)
    .title-main
        font-size: 18px
        font-weight: 700
    .title-sec
        font-size: 27px
    .setting-card
        border-radius: 10px
        background: rgba($primary, .2)
</style>
