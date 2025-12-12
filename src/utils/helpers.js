export function formatNumber(num) {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDateToROC(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]) - 1911;
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    return `${year}年${month}月${day}日`;
}

export function numberToChineseFinancial(n) {
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n)) return "數據非法";
    let unit = "仟佰拾億仟佰拾萬仟佰拾元角分";
    let str = "";
    n += "00";
    let p = n.indexOf(".");
    if (p >= 0) n = n.substring(0, p) + n.substr(p + 1, 2);
    unit = unit.substr(unit.length - n.length);
    for (let i = 0; i < n.length; i++)
        str += "零壹貳參肆伍陸柒捌玖".charAt(n.charAt(i)) + unit.charAt(i);
    return str
        .replace(/零(仟|佰|拾|角)/g, "零")
        .replace(/(零)+/g, "零")
        .replace(/零(萬|億|元)/g, "$1")
        .replace(/(億)萬|壹(拾)/g, "$1$2")
        .replace(/^元零?|零分/g, "")
        .replace(/元$/g, "元");
}