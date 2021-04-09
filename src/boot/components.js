// import something here
import sessionTree from 'src/components/sessionTree'
import terminal from 'src/components/terminal'

// "async" is optional
export default async ({ app, router, Vue }) => {
    // something to do
    Vue.component('session-tree', sessionTree)
    Vue.component('terminal', terminal)
}
