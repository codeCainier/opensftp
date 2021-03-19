import { Notify } from 'quasar'

const notify = (props) => {
    const title    = props.title || ''
    const message  = typeof props === 'string' ? props : props.message
    const callback = props.callback || function () {

    }

    const myNotification = new Notification(title, {
        body: message
    })

    myNotification.onclick = () => callback()
}

notify.success = message => createQuasarNotify(message, 'positive')
notify.error   = message => createQuasarNotify(message, 'negative')
notify.warning = message => createQuasarNotify(message, 'warning')
notify.info    = message => createQuasarNotify(message, 'danger')

function createQuasarNotify(message, color) {
    Notify.create({
        color,
        message,
        progress: true,
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
}

export default notify
