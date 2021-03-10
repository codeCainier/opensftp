import { Dialog, extend } from 'quasar'
import CryptoJS from 'crypto-js'

function confirm(obj) {
    if (typeof obj === 'string') obj = {
        message: obj
    }
    Dialog.create({
        title: obj.title || '提示',
        message: obj.message || '',
        ok: obj.textConfirm || '确认',
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

function clone (obj) {
    return extend(true, {}, obj);
}

/**
 * Base64 加密
 * @method
 * @param       {String}    data    传入字符串
 * @return      {string}            加密结果
 * */
function base64En(data) {
    data = typeof data === 'string' ? data : JSON.stringify(data);
    data = CryptoJS.enc.Utf8.parse(data);
    return CryptoJS.enc.Base64.stringify(data)
        .toString();
}

/**
 * 数字字符串前拼接 0
 * @method
 * @param       {Number}    str     传入数字或字符串
 * @return      {String}            拼接结果
 */
function add0(str) {
    return Number(str) < 10 ? `0${str}` : str;
}

/**
 * 流量格式化
 * @method
 * @param       {Number}    flow        传入流量数值
 * @param       {Number}    mode        传入进位方式 (默认 1024)
 * @param       {String}    unit        传入流量单位 (默认 B)
 * @param       {Number}    promotion   传入流量转换后的对比数  (默认 1024)
 * @return      {String}                格式化结果
 */
function formatFlow(flow, mode = 1024, unit = 'B', promotion = 1024, precise = 2) {
    flow = Number(flow);
    if (!flow) return `0 ${unit}`;
    const unitList = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unitIndex = unitList.indexOf(unit.toUpperCase());
    mode      = Number(mode);
    promotion = Number(promotion);
    flow      = flow * Math.pow(mode, unitIndex);
    for (let i = 0; i < unitList.length; i += 1) {
        const min = Math.pow(mode, i);
        const max = Math.pow(mode, i + 1);
        if (min <= flow && flow < max) {
            if ((flow / min) >= promotion) return ((flow / min)/mode).toFixed(precise) + ' ' + unitList[i+1];
            if ((flow / min) < promotion)  return (flow / min).toFixed(precise) + ' ' + unitList[i];
        }
    }
}

/**
 * 日期格式化
 * @author xr@srun.com
 * @method
 * @param       {Number}    timeStamp   传入时间戳
 * @param       {String}    format      传入格式
 * @return      {String}                格式化结果
 */
function formatDate(timeStamp, format) {
    timeStamp = Number(timeStamp);
    if (String(timeStamp).length === 10) timeStamp = timeStamp * 1000;
    const time = new Date(timeStamp);
    const yyyy = time.getFullYear();
    const M = time.getMonth() + 1;
    const d = time.getDate();
    const H = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const rule = [
        { key: 'yyyy', val: yyyy },
        { key: 'yy',   val: String(yyyy).substring(2) },
        { key: 'MM',   val: add0(M) },

        { key: 'M',    val: M },
        { key: 'dd',   val: add0(d) },
        { key: 'd',    val: d },
        { key: 'HH',   val: add0(H) },
        { key: 'H',    val: H },
        { key: 'mm',   val: add0(m) },
        { key: 'm',    val: m },
        { key: 'ss',   val: add0(s) },
        { key: 's',    val: s },
    ];
    rule.forEach((item) => {
        format = format.replace(new RegExp(item.key, 'g'), item.val);
    });

    return format;
}

/**
 * 时间长度格式化
 * @method
 * @param       {Number}    time    传入时长数值
 * @param       {String}    format  时长转化格式
 * @return      {String}            格式化结果
 */
function formatTime(time, format = 'Hms') {
    // 若传入时间为 0 则直接返回 0s
    if (!time) return `0 秒`;

    // 单位数组
    const unit = [];
    // 处理结果字符串
    let result = '';

    // 传入时间规定为 Number 类型
    time = Number(time);

    if (format.includes('y')) unit.push({ label: '年',   value: 3600 * 24 * 365 });
    if (format.includes('M')) unit.push({ label: '月',   value: 3600 * 24 * 30 });
    if (format.includes('d')) unit.push({ label: '日',   value: 3600 * 24 });
    if (format.includes('H')) unit.push({ label: '小时', value: 3600 });
    if (format.includes('m')) unit.push({ label: '分',   value: 60 });
    if (format.includes('s')) unit.push({ label: '秒',   value: 1 });

    // 遍历传入的单位
    for (let i = 0; i < unit.length; i += 1) {
        const { label, value } = unit[i];
        // 若剩余时间不足单位进位值，则判断进行下一位单位
        if (time < value) continue;
        result += parseInt(String(time / value), 0) + label;
        time %= value;
    }

    return result;
}

/**
 * 获取 URL 参数值
 * @method
 * @param       {String}    url     URL
 * @param       {String}    name    参数名称
 * @return      {String}            参数值
 */
function getUrlParams(url, name) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const r = new URL(url).search.substr(1).match(reg);
    return r === null
        ? ''
        : unescape(r[2]);
}

export default {
    confirm,
    clone,
    base64En,
    add0,
    formatFlow,
    formatDate,
    formatTime,
    getUrlParams,
}
