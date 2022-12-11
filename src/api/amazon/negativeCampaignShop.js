import request from '@/utils/request'

// 查询否定搜索词关联活动和店铺列表
export function listShop(query) {
  return request({
    url: '/negative/campaign/shop/list',
    method: 'get',
    params: query
  })
}

// 查询否定搜索词关联活动和店铺详细
export function getShop(id) {
  return request({
    url: '/negative/campaign/shop/' + id,
    method: 'get'
  })
}

// 新增否定搜索词关联活动和店铺
export function addShop(data) {
  return request({
    url: '/negative/campaign/shop',
    method: 'post',
    data: data
  })
}

// 修改否定搜索词关联活动和店铺
export function updateShop(data) {
  return request({
    url: '/negative/campaign/shop',
    method: 'put',
    data: data
  })
}

// 删除否定搜索词关联活动和店铺
export function delShop(id) {
  return request({
    url: '/negative/campaign/shop/' + id,
    method: 'delete'
  })
}

// 获取所有可以参与的活动
export function getCampaigns(accountId) {
  return request({
    url: '/negative/campaign/shop/campaigns/' + accountId,
    method: 'get'
  })
}
