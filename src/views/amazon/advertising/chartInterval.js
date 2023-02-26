/**
 * @param arrLeft:左y轴的数据
 * @param arrRight:右y轴的数据
 * @param splitNumber:刻度数
 * @returns [{max:左y轴最大值,min:左y轴最小值,interval:左y轴刻度间隔},
 *             {max:右y轴最大值,min:右y轴最小值,interval:右y轴刻度间隔}]
 */
 export function getInterval(arrLeft, arrRight, splitNumber) {
    var leftYScale = getIntervalNum(arrLeft, splitNumber);
    var rightYScale = getIntervalNum(arrRight, splitNumber);
    var leftYNum = leftYScale.intervalNum
    var rightYNum = rightYScale.intervalNum
    //当左右两边的刻度数不一致是,开始做校正
    if (leftYNum != rightYNum) {
        if (leftYNum > rightYNum) {
            var diffVal = leftYNum - rightYNum;
            return [leftYScale, addMaxAndMin(diffVal, rightYScale)]
        } else {
            var diffVal = rightYNum - leftYNum;
            return [addMaxAndMin(diffVal, leftYScale), rightYScale]
        }
    } else {
        return [leftYScale, rightYScale];
    }

}
function getIntervalByY3(arrLeft0, arrLeft1, arrRight, splitNumber) {
    return getInterval(arrLeft0.concat(arrLeft1), arrRight, splitNumber)
}
/**
 * echarts中求刻度间隔的方法
 * @param t
 * @param e
 * @returns
 */
function Vo(t, e) {
    var i, n = Bo(t), o = Math.pow(10, n), a = t / o;
    return i = e ? a < 1.5 ? 1 : a < 2.5 ? 2 : a < 4 ? 3 : a < 7 ? 5 : 10 : a < 1 ? 1 : a < 2 ? 2 : a < 3 ? 3 : a < 5 ? 5 : 10,
        t = i * o,
        n >= -20 ? +t.toFixed(n < 0 ? -n : 0) : t
}
function Bo(t) {
    return Math.floor(Math.log(t) / Math.LN10)
}
function Ao(t, e, i) {
    return null == e && (e = 10),
        e = Math.min(Math.max(0, e), 20),
        t = (+t).toFixed(e),
        i ? t : +t
}
/**
 * @param arr y轴的数据
 * @returns 未校正的y轴{max:y轴最大值,min:y轴最小值,interval:y轴刻度间隔,intervalNum:刻度数}
 */
function getIntervalNum(arr, splitNumber) {
    arr = arrToNull(arr);
    var max = Math.max(...arr);//这中方法数组里面有undiffe会出错
    var min = Math.min(...arr);
    if (min > 0) min = 0;
    if (max < 0) max = 0;
    if (splitNumber) {
        var o = Vo((max - min) / splitNumber, 0);//刻度间隔
    } else {
        var o = Vo((max - min) / 5, !0);//刻度间隔
    }
    max = Ao(Math.ceil(max / o) * o);
    min = Ao(Math.floor(min / o) * o);
    var yScale = {};
    yScale.max = max;
    yScale.min = min;
    yScale.interval = o;
    yScale.intervalNum = ((max - min) / o).toFixed(2);
    return yScale;
}
/**
 * 增加最大刻度和最下刻度
 * @param num 要增加的数
 * @param yScale y轴对象
 * @returns
 */
function addMaxAndMin(num, yScale) {
    for (var i = 0; i < num; i++) {
        if (!(i % 2)) {//是2的倍数时
            yScale.max += yScale.interval;
        } else {//不是2的倍数时
            if (yScale.min == 0) {
                yScale.max += yScale.interval;
            } else {
                yScale.min -= yScale.interval;
            }
        }
    }
    return yScale;
}
/**
 * 数组中的undefined转为null
 * @param arr
 * @returns
 */
function arrToNull(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === undefined) {
            arr[i] = null;
        }
    }
    return arr;
}