import request from '@/utils/request'

// 查询店铺账单列表
export function listBill(query) {
  return request({
    url: '/bill/list',
    method: 'get',
    params: query
  })
}

// 查询店铺账单详细
export function listBillItem(query) {
  return request({
    url: '/bill/item/list',
    method: 'get',
    params: query
  })
}
