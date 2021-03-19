import Vue    from 'vue'
import utils  from 'src/utils'
import notify from 'src/utils/notify'

Vue.prototype.tools  = utils
Vue.prototype.notify = notify

// "async" is optional
export default async ({ app, router, Vue }) => {
    // something to do
};
