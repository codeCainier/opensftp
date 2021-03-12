<template>
    <page>
        <q-splitter v-model="splitterModel" :limits="[40, 60]" class="full-height">

            <template v-slot:before>
                <div class="q-pa-sm full-height">
                    <session-pool/>
                </div>
            </template>

            <template v-slot:after>
                <quick-link/>
            </template>

        </q-splitter>
    </page>
</template>

<script>
import sessionPool from 'src/components/sessionPool'
import quickLink from 'src/components/quickLink'

export default {
    name: "Home",
    components: {
        'quick-link': quickLink,
        'session-pool': sessionPool,
    },
    data() {
        return {
            splitterModel: 40,
        }
    },
    methods: {
    },
};
</script>
