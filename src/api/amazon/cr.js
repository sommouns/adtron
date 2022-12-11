import request from '@/utils/request'

// 查询调价基准转化率列表
export function listCr(query) {
  return request({
    url: '/system/cr/list',
    method: 'get',
    params: query
  })
}


export function test(query) {
  return request({
    url: '/negative/keyword',
    method: 'get',
    params: query
  })
}
