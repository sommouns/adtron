import request from '@/utils/request'

// 查询打标否定关键字列表
export function listQuery(query) {
  return request({
    url: '/system/query/list',
    method: 'get',
    params: query
  })
}

// 否定数据
export function suspend(data) {
  return request({
    url: '/system/query/suspend/query',
    method: 'post',
    data: data
  })
}

