import { LocalStorage } from 'quasar'

const state = {
    // 保存的 session 会话 - 会话池
    pool: LocalStorage.getItem('sessionPool') || [],
    // 连接的 session 会话 - 连接池
    conn: [],
    // 当前的 session 会话 - 连接 id
    active: '',
}

// LocalStorage.set('sessionPool', [
//     {
//         "id": "5c6fb28f-91aa-44b3-bbd9-fe1fe587d5ee",
//         "type": "session",
//         "name": "深澜 Portal 定制机器",
//         "host": "192.168.0.124",
//         "port": "22",
//         "username": "root",
//         "password": "e52260f2960d0a3b77d2320f49512a2e",
//         "createTime": 1617690597642,
//         "updateTime": 1617690597642,
//         "updateItem": 1617781410576
//     },
//     {
//         "id": "59f99ec3-3d4e-442d-83e1-cf1cce5226f0",
//         "type": "session",
//         "name": "192.168.0.241",
//         "host": "192.168.0.241",
//         "port": "22",
//         "username": "root",
//         "password": "e52260f2960d0a3b77d2320f49512a2e",
//         "createTime": 1617694441497,
//         "updateTime": 1617694441497,
//         "updateItem": 1617791501324
//     },
//     {
//         "id": "57fec193-bbaa-4330-986c-a5c5a37b796f",
//         "type": "session",
//         "name": "eduroam 开发机器",
//         "host": "192.168.0.152",
//         "port": "22",
//         "username": "root",
//         "password": "e52260f2960d0a3b77d2320f49512a2e",
//         "createTime": 1617690716999,
//         "updateTime": 1617690716999,
//         "updateItem": 1617781397103
//     },
//     {
//         "id": "ad27eac5-e195-4e3d-9d19-f7d10c9f7d89",
//         "type": "dir",
//         "name": "深澜产品中心",
//         "createTime": 1617690702556,
//         "updateTime": 1617690702556,
//         "children": [
//             {
//                 "id": "57fec193-bbaa-1111-986c-a5c5a37b796f",
//                 "type": "session",
//                 "name": "产品中心 - 开发环境",
//                 "host": "products.srun.com",
//                 "port": "9022",
//                 "username": "root",
//                 "password": "e52260f2960d0a3b77d2320f49512a2e",
//                 "createTime": 1617690716999,
//                 "updateTime": 1617690716999,
//                 "updateItem": 1617781397103
//             }, {
//                 "id": "57fec193-3333-4399-986c-a5c5a37b796f",
//                 "type": "session",
//                 "name": "产品中心 - 生产环境",
//                 "host": "products.srun.com",
//                 "port": "8022",
//                 "username": "root",
//                 "password": "e52260f2960d0a3b77d2320f49512a2e",
//                 "createTime": 1617690716999,
//                 "updateTime": 1617690716999,
//                 "updateItem": 1617781397103
//             }
//         ]
//     },
//     {
//         "id": "57fec193-bbaa-4399-986c-a5c5a37b796f",
//         "type": "session",
//         "name": "深澜办公室 网关",
//         "host": "192.168.0.55",
//         "port": "22",
//         "username": "root",
//         "password": "e52260f2960d0a3b77d2320f49512a2e",
//         "createTime": 1617690716999,
//         "updateTime": 1617690716999,
//         "updateItem": 1617781397103
//     }
// ])

export default function () {
    return state
}
