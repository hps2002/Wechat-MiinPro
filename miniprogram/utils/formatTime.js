//此模块用于可视化时间，返回值即可视化好的时间:年-月-日 时-分。这样子的格式
module.exports = (date) => {
    let fmt = 'yyyy-MM-dd hh:mm'
    const o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, date.getFullYear())
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            //对拿到的时间进行判断是否需要进行补0
            fmt = fmt.replace(RegExp.$1, o[k].toString().length == 1 ? '0' + o[k] : o[k])
        }
    }
    return fmt
}