<template>
    <q-popup-proxy content-class="bg-aero overflow-hidden" :offset="[0, 10]" @hide="reset">
        <div class="input-filter-container full-width q-pa-sm" v-if="filter">
            <q-input v-model="filterVal" placeholder="筛选图标" dense class="full-width" outlined/>
        </div>
        <div class="panel-icon-select q-pa-sm">
            <div v-show="!filterVal" class="row q-gutter-sm">
                <q-btn v-for="icon in iconList"
                       :key="icon"
                       v-close-popup
                       flat size="md"
                       @click="$emit('select', iconPath(icon))">
                    <q-avatar size="md" square>
                        <img :src="'./icons/server-icons/' + icon">
                    </q-avatar>
                </q-btn>
            </div>
            <div v-show="filterVal" class="row q-gutter-sm">
                <q-btn v-for="icon in filterList"
                       :key="icon"
                       v-close-popup
                       flat size="md"
                       @click="$emit('select', iconPath(icon))">
                    <q-avatar size="md" square>
                        <img :src="'./icons/server-icons/' + icon">
                    </q-avatar>
                </q-btn>
            </div>
        </div>
    </q-popup-proxy>
</template>

<script>
import fs from 'fs'
import path from 'path'

export default {
    name: 'IconSelect',
    props: {
        filter: {
            default: false,
            type: Boolean,
        }
    },
    data() {
        return {
            iconList: fs.readdirSync(path.join(__statics, 'icons/server-icons')),
            filterVal: '',
            filterList: [],
        }
    },
    watch: {
        filterVal(newVal) {
            this.filterList = this.iconList.filter(item => item.includes(newVal))
        },
    },
    computed: {
        iconPath() {
            return name => path.join('icons/server-icons', name)
        },
    },
    methods: {
        reset() {
            this.filterVal = ''
            this.filterList = []
        },
    },
}
</script>

<style scoped lang="sass">
.panel-icon-select
    position: relative
    width: 376px
    height: 200px
    overflow: scroll
</style>
