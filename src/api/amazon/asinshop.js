import request from '@/utils/request'

// 查询调价绑定asin和店铺列表
export function listShop(query) {
  return request({
    url: '/bid/shop/asin/select',
    method: 'get',
    params: query
  })
}


// 新增调价绑定asin和店铺
export function addShop(data) {
  return request({
    url: '/bid/shop/asin/save',
    method: 'post',
    data: data
  })
}


// 删除调价绑定asin和店铺
export function delShop(data) {
  return request({
    url: '/bid/shop/asin/del',
    method: 'post',
    data: data
  })
}
