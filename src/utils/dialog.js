import { Dialog } from 'quasar'
import electron from 'electron'

/**
 * 弹窗组件
 * @param   {String}    props               直接传入提示消息
 * @param   {Object}    props               传入参数对象
 * @param   {String}    props.message       提示消息
 * @param   {String}    props.detail        详情
 * @param   {String}    props.title         标题 未使用
 * @param   {String}    props.textConfirm   确认文字
 * @param   {String}    props.checkbox      勾选文字
 */
export function alert (props) {
    if (typeof props === 'string') props = {
        message: props,
    }

    if (typeof props === 'object' && !props.message) props = {
        message: JSON.stringify(props)
    }

    return new Promise((resolve, reject) => {
        electron.remote.dialog.showMessageBox({
            // type: '',
            // icon: '',
            // title: '',
            message         : props.message,
            detail          : props.detail,
            buttons         : [props.textConfirm || '好'],
            checkboxLabel   : props.checkbox,
            defaultId       : 0,
        })
            .then(res => resolve(res))
            .catch(err => console.error(err))
    })
}

/**
 * 确认框组件
 * @param   {String}    props               直接传入提示消息
 * @param   {Object}    props               传入参数对象
 * @param   {String}    props.message       提示消息
 * @param   {String}    props.detail        详情
 * @param   {String}    props.title         标题 未使用
 * @param   {String}    props.textConfirm   确认文字
 * @param   {String}    props.textCancel    取消文字
 * @param   {String}    props.checkbox      勾选文字
 */
export function confirm (props) {
    if (typeof props === 'string') props = {
        message: props,
    }

    return new Promise((resolve, reject) => {
        electron.remote.dialog.showMessageBox({
            // type: '',
            // icon: '',
            // title: '',
            message         : props.message,
            detail          : props.detail,
            buttons         : [props.textConfirm || '好', props.textCancel || '取消'],
            checkboxLabel   : props.checkbox,
            defaultId       : 0,
            cancelId        : 1,
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
