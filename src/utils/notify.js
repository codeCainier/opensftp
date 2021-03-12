import { Notify } from 'quasar'

export default {
    success(message) {
        Notify.create({
            message,
            progress: true,
            color: 'positive',
            icon: 'ion-md-checkmark',
            classes: 'q-notify',
            actions: [
                {
                    label: '关闭',
                    color: 'white',
                    handler: () => {
                        /* ... */
                    },
                },
            ],
        });
    },
    warning(message) {
        Notify.create({
            message,
            progress: true,
            color: 'warning',
            icon: 'ion-md-warning',
            classes: 'q-notify',
            actions: [
                {
                    label: '关闭',
                    color: 'white',
                    handler: () => {
                        /* ... */
                    },
                },
            ],
        });
    },
    error(message) {
        Notify.create({
            message,
            progress: true,
            color: 'negative',
            icon: 'ion-md-close',
            classes: 'q-notify',
            actions: [
                {
                    label: '关闭',
                    color: 'white',
                    handler: () => {
                        /* ... */
                    },
                },
            ],
        });
    },
    info(message) {
        Notify.create({
            message,
            progress: true,
            color: 'danger',
            icon: 'announcement',
            classes: 'q-notify',
            actions: [
                {
                    label: '关闭',
                    color: 'white',
                    handler: () => {
                        /* ... */
                    },
                },
            ],
        });
    },
}
