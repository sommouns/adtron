import request from '@/utils/request'

// 根据账户获得asin
export function accountAsin(data) {
  return request({
    url: '/asin/list/account',
    method: 'post',
    data: data
  })
}

// 根据活动获得asin
export function campaignAsin(data) {
  return request({
    url: '/asin/list/campaign',
    method: 'post',
    data: data
  })
}
