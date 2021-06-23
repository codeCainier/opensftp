const routes = [{
    path: '/',
    redirect: '/home',
    component: () => import('layouts/main'),
    children: [{
        path: '/home',
        component: () => import('pages/home')
    }, {
        path: '/session',
        component: () => import('pages/session'),
        meta: {
            keepAlive: true,
        },
    }],
}, {
    path: '/connect',
    component: () => import('pages/connect'),
}, {
    path: '/update',
    component: () => import('pages/update'),
},

// Always leave this as last one,
// but you can also remove it
{
    path: '*',
    component: () => import('pages/error404')
}]

export default routes
