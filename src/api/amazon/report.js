import request from '@/utils/request'

// 查询竞价修改记录列表
export function listReport(data) {
  return request({
    url: '/bid/shop/report/list',
    method: 'post',
    data: data
  })
}

export function change(id) {
  return request({
    url: '/bid/shop/report/change?id=' + id,
    method: 'get'
  })
}