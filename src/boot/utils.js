import Vue     from 'vue'
import utils   from 'src/utils'
import notify  from 'src/utils/notify'
import { alert, confirm } from 'src/utils/dialog'

Vue.prototype.tools   = utils
Vue.prototype.notify  = notify
Vue.prototype.alert   = alert
Vue.prototype.confirm = confirm

// "async" is optional
export default async ({ app, router, Vue }) => {
    // something to do
};
