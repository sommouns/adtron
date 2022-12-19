import request from '@/utils/request'

// 查询否定关键字列表
export function listTerm(query) {
  return request({
    url: '/system/term/list',
    method: 'get',
    params: query
  })
}

// 否定
export function negative(id) {
  return request({
    url: '/system/term/negative?id=' + id,
    method: 'get'
  })
}

// 一键否定
export function gatherList(shopId) {
  return request({
    url: '/system/term/gatherSet?shopId='+shopId,
    method: 'get'
  })
}

// 一键否定
export function negativeAll(data) {
  return request({
    url: '/system/term/negativeAll',
    method: 'post',
    data : data
  })
}

// 一键否定
export function cancel(allList) {
  return request({
    url: '/system/term/cancel?allList='+allList,
    method: 'get'
  })
}
