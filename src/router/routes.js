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
    }]
},

// Always leave this as last one,
// but you can also remove it
{
    path: '*',
    component: () => import('pages/error404')
}]

export default routes
