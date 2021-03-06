import { extend } from 'quasar'
import crypto from 'crypto'

function clone (obj) {
    return extend(true, {}, obj);
}

/**
 * AES 加密 (aes-192-cbc)
 * @method
 * @param       {String}    str         加密前字符串
 * @param       {String}    algorithm   加密算法，默认为 aes-192-cbc
 * @param       {String}    key         密钥 24 位
 * @param       {String}    iv          向量 16 位
 * @return      {String}                加密后字符串
 */
function aesEncode(str, algorithm = 'aes-192-cbc', key= 'APP_AES_192_CBC_KEY_____', iv = 'APP_AES_IV______') {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(str, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
}

/**
 * AES 解密 (aes-192-cbc)
 * @method
 * @param       {String}    str         解密前字符串
 * @param       {String}    algorithm   加密算法，默认为 aes-192-cbc
 * @param       {String}    key         密钥 24 位
 * @param       {String}    iv          向量 16 位
 * @return      {String}                解密后字符串
 */
function aesDecode(str, algorithm = 'aes-192-cbc', key = 'APP_AES_192_CBC_KEY_____', iv = 'APP_AES_IV______') {
    const cipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = cipher.update(str, 'hex', 'utf8')
    decrypted += cipher.final('utf8')
    return decrypted
}

/**
 * Base64 加密
 * @method
 * @param       {String}    str         加密前字符串
 * @return      {String}                加密后字符串
 */
function base64Encode(str) {
    const buff = Buffer.from(str, 'utf-8')
    return buff.toString('base64')
}

/**
 * Base64 解密
 * @method
 * @param       {String}    str         解密前字符串
 * @return      {String}                解密后字符串
 */
function base64Decode(str) {
    const buff = Buffer.from(str, 'base64')
    return buff.toString('utf-8')
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

/**
 * 睡眠指定时长
 * @method
 * @param       {Number}    time    睡眠时间
 */
async function sleep(time) {
    return new Promise(resolve => setTimeout(() => resolve(), time))
}

export default {
    clone,
    add0,
    aesEncode,
    aesDecode,
    base64Encode,
    base64Decode,
    formatFlow,
    formatDate,
    formatTime,
    getUrlParams,
    sleep,
}
