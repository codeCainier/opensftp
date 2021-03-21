<template>
    <q-toggle v-model="dark"
              class="q-electron-drag--exception"
              color="dark"
              checked-icon="ion-md-moon"
              unchecked-icon="ion-md-sunny"
              icon-color="light-blue"
              dense/>
</template>

<script>
export default {
    name: 'DarkToggle',
    computed: {
        dark: {
            get () {
                return this.$store.state.setting.dark
            },
            set () {
                this.$store.commit('setting/DARK_TOGGLE')
            },
        },
    },
}
</script>
