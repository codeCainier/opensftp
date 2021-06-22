import Vue    from 'vue'

const config = require('src/config')

Vue.prototype.config = config

// "async" is optional
export default async ({ app, router, Vue }) => {
    // something to do
};
