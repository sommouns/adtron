import request from '@/utils/request'

// 根据账户获得活动
export function accountCampaign(data) {
  return request({
    url: '/campaign/list/account',
    method: 'post',
    data: data
  })
}

// 根据asin获得活动
export function asinCampaign(data) {
  return request({
    url: '/campaign/list/asin',
    method: 'post',
    data: data
  })
}
