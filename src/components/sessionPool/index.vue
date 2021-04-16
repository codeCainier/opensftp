<template>
    <div class="session-pool full-height">
        <!-- 会话池控制中心 -->
        <div class="pool-control q-ma-sm q-mt-md">
            <div class="row">
                <div class="session-num" :class="{ active: !showSearch }">
                    <span class="text-h6 text-weight-light q-mx-xs">{{ $store.getters["session/sessionNodeNum"]() }}</span>
                    <span>会话</span>
                </div>
                <div class="search-input-container" :class="{ active: showSearch }">
                    <input type="text"
                           v-model.trim="searchValue"
                           ref="search-input"
                           class="search-input"
                           placeholder="搜索会话"
                           spellcheck="false"
                           @input="searchSession"
                           @keydown.down="searchResFocus">
                </div>
                <q-space/>
                <q-btn class="btn-control btn-search"
                       :icon="showSearch ? 'close' : 'search'"
                       flat round
                       size="sm"
                       @click="showSearch = !showSearch"/>
                <q-btn class="btn-control btn-add"
                       icon="add"
                       flat round
                       size="sm">
                    <q-menu content-class="bg-transparent">
                        <q-list class="bg-aero" dense style="min-width: 120px">
                            <q-item clickable v-close-popup @click="createSession">
                                <q-item-section>创建会话</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="createSessionDir">
                                <q-item-section>创建会话目录</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </div>
        </div>
        <!-- 会话池列表 -->
        <div class="full-height scroll q-pa-sm" v-show="!showSearch">
            <session-tree :group="$store.state.session.pool"/>
        </div>
        <!-- 会话卡片 -->
        <session-poster ref="session-poster"/>
        <!-- 会话详情 -->
        <session-detail ref="session-detail" :key="sessionDetailKey" @close="refreshSessionDetail"/>
    </div>
</template>

<script>
import sessionPoster from 'src/components/sessionPoster'
import sessionDetail from 'src/components/sessionDetail'
import { uid } from 'quasar'

export default {
    name: 'SessionPool',
    components: {
        'session-poster' : sessionPoster,
        'session-detail' : sessionDetail,
    },
    data() {
        return {
            showSearch      : false,    // 会话搜索模块显示状态
            searchValue     : '',       // 会话搜索内容
            sessionFilter   : [],       // 会话搜索结果
            sessionDetailKey: uid(),
        }
    },
    watch: {
        showSearch(newVal) {
            if (!newVal) {
                this.searchValue = ''
                this.sessionFilter = []
            }
            if (newVal) setTimeout(() => {
                this.$refs['search-input'].focus()
            }, 300)
        },
        '$store.state.sessionTree.showPoster': function ([newVal]) {
            this.$refs['session-poster'].open(newVal)
        },
        '$store.state.sessionTree.showDetail': function ([newVal]) {
            this.$refs['session-detail'].open(newVal)
        },
    },
    methods: {
        // 搜索会话
        searchSession() {
            const value = this.searchValue.trim()
            // 搜索内容为空
            if (!value) return this.sessionFilter = []
            this.sessionFilter = this.$store.state.session.pool.filter(item => {
                if (item.name.includes(value)) return true
                if (item.host.includes(value)) return true
                if (item.port.includes(value)) return true
            })
        },
        // 搜素结果获取焦点
        searchResFocus() {
            // if (!this.sessionFilter.length) return
            // this.selected = this.$store.state.session.pool.findIndex(item => item.id === this.sessionFilter[0].id)
            // this.sessionFocus()
        },
        // 创建目录
        createSessionDir() {
            this.$store.commit('session/CREATE_DIR', {
                name: '新建会话目录'
            })
        },
        createSession() {
            this.$refs['session-detail'].open()
        },
        refreshSessionDetail() {
            this.sessionDetailKey = uid()
        },
    },
};
</script>

<style scoped lang="sass">
.body--light
    .session-pool
        .pool-control .search-input
            background: rgba(#FFFFFF, .7)
            color: $dark
            &::-webkit-input-placeholder
                color: $dark

.body--dark
    .pool-control .search-input
        background: #666666
        color: #FFFFFF
        &::-webkit-input-placeholder
            color: #FFFFFF

.session-pool
    display: flex
    flex-direction: column
    .pool-control
        position: relative
        .session-num
            position: absolute
            height: 30px
            line-height: 30px
            opacity: 0
            visibility: hidden
            transform: translateX(-10px)
            transition: all .3s
            &.active
                opacity: 1
                visibility: visible
                transform: translateX(0)
        .search-input-container
            position: absolute
            opacity: 0
            visibility: hidden
            transform: translateX(10px)
            transition: all .3s
            width: calc(100% - 35px)
            height: 100%
            &.active
                opacity: 1
                visibility: visible
                transform: translateX(0)
            .search-input
                margin: 0
                padding: 0 10px
                border: 0
                outline: none
                width: 100%
                height: 100%
                border-radius: 30px
                transition: all .3s
                &:focus
                    box-shadow: $shadow-10
        .btn-control
            width: 30px
            height: 30px
            margin-left: 5px
</style>
