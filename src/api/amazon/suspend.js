import request from '@/utils/request'

// 查询否定关键字列表
export function listTerm(query) {
  return request({
    url: '/system/suspend/list',
    method: 'get',
    params: query
  })
}

// 否定
export function negative(id) {
  return request({
    url: '/system/suspend/negative?id=' + id,
    method: 'get'
  })
}

// 一键暂停
export function negativeAll(shopId) {
  return request({
    url: '/system/suspend/negativeAll?shopId='+shopId,
    method: 'get'
  })
}

// 一键暂停
export function cancel(allList) {
  return request({
    url: '/system/suspend/cancel?allList='+allList,
    method: 'get'
  })
}
