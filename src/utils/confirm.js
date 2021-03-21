import { Dialog } from 'quasar'

export default function (obj) {
    if (typeof obj === 'string') obj = {
        message: obj
    }
    Dialog.create({
        title: obj.title || '提示',
        message: obj.message || '',
        cancel: !obj.cancel ? '' : '取消',
        'no-backdrop-dismiss': true,
        'no-esc-dismiss': false,
    })
        .onOk(() => {
            if (obj.confirm) obj.confirm();
        })
        .onOk(() => {
        })
        .onCancel(() => {
            if (obj.cancel) obj.cancel();
        })
        .onDismiss(() => {
            if (obj.close) obj.close();
        });
}
