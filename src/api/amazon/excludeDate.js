import request from '@/utils/request'

// 查询调价否词-特殊日期排除列表
export function listDate(query) {
  return request({
    url: '/advertising/date/list',
    method: 'get',
    params: query
  })
}

// 查询店铺ASIN
export function getShopAsin(shopId) {
  return request({
    url: '/store/listing/shop?shopId=' + shopId,
    method: 'get'
  })
}

// 查询调价否词-特殊日期排除详细
export function getDate(id) {
  return request({
    url: '/advertising/date/' + id,
    method: 'get'
  })
}

// 新增调价否词-特殊日期排除
export function addDate(data) {
  return request({
    url: '/advertising/date',
    method: 'post',
    data: data
  })
}

// 修改调价否词-特殊日期排除
export function updateDate(data) {
  return request({
    url: '/advertising/date',
    method: 'put',
    data: data
  })
}

// 删除调价否词-特殊日期排除
export function delDate(id) {
  return request({
    url: '/advertising/date/' + id,
    method: 'delete'
  })
}
