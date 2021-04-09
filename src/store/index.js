import Vue from 'vue'
import Vuex from 'vuex'

import sftp     from './module-sftp'
import layout   from './module-layout'
import setting  from './module-setting'
import session  from './module-session'
import transfer from './module-transfer'
import editor   from './module-editor'
import sessionTree   from './module-sessionTree'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default new Vuex.Store({
    modules: {
        sftp,
        layout,
        setting,
        session,
        transfer,
        editor,
        sessionTree,
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    // strict: process.env.DEV,
})
