import { Dialog } from 'quasar'
import electron from 'electron'

/**
 * 弹窗组件
 * @param   {String}    obj.message     提示消息
 * @param   {String}    obj.detail      详情
 * @param   {String}    obj.title       标题 未使用
 * @param   {String}    obj.textConfirm 确认文字
 * @param   {String}    obj.checkbox    勾选文字
 */
export function alert (obj) {
    if (typeof obj === 'string') obj = {
        message: obj,
    }

    if (typeof obj === 'object' && !obj.message) obj = {
        message: JSON.stringify(obj)
    }

    return new Promise((resolve, reject) => {
        electron.remote.dialog.showMessageBox({
            // type: '',
            // icon: '',
            // title: '',
            message: obj.message,
            detail: obj.detail,
            buttons: [obj.textConfirm || '好'],
            checkboxLabel: obj.checkbox,
            defaultId: 0,
        })
            .then(res => resolve(res))
            .catch(err => console.error(err))
    })
}

/**
 * 确认框组件
 * @param   {String}    obj.message     提示消息
 * @param   {String}    obj.detail      详情
 * @param   {String}    obj.title       标题 未使用
 * @param   {String}    obj.textConfirm 确认文字
 * @param   {String}    obj.textCancel  取消文字
 * @param   {String}    obj.checkbox    勾选文字
 */
export function confirm (obj) {
    if (typeof obj === 'string') obj = {
        message: obj,
    }

    return new Promise((resolve, reject) => {
        electron.remote.dialog.showMessageBox({
            // type: '',
            // icon: '',
            // title: '',
            message: obj.message,
            detail: obj.detail,
            buttons: [obj.textConfirm || '好', obj.textCancel || '取消'],
            checkboxLabel: obj.checkbox,
            defaultId: 0,
            cancelId: 1,
        })
            .then(res => {
                // 确认回调
                if (res.response === 0) return resolve(res)
                // 取消回调
                if (res.response === 1) return reject(res)
            })
            .catch(err => console.error(err))
    })
}

// Dialog.create({
//     title: obj.title || '提示',
//     message: obj.message || '',
//     cancel: !obj.cancel ? '' : '取消',
//     'no-backdrop-dismiss': true,
//     'no-esc-dismiss': false,
// })
//     .onOk(() => {
//         if (obj.confirm) obj.confirm();
//     })
//     .onOk(() => {
//     })
//     .onCancel(() => {
//         if (obj.cancel) obj.cancel();
//     })
//     .onDismiss(() => {
//         if (obj.close) obj.close();
//     });
