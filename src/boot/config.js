import Vue    from 'vue'
import config from 'src/config'

Vue.prototype.config = config

// "async" is optional
export default async ({ app, router, Vue }) => {
    // something to do
};
