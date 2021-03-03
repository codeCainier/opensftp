// import something here
import terminal from 'src/components/terminal';

// "async" is optional
export default async ({ app, router, Vue }) => {
    // something to do
    Vue.component('terminal', terminal);
};
