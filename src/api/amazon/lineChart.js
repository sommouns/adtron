import request from '@/utils/request'

// asin 折线图
export function selectData(data) {
  return request({
    url: '/chart/line/data/asin',
    method: 'post',
    data: data
  })
}

// 活动折线图
export function selectDataCampaign(data) {
  return request({
    url: '/chart/line/data/campaign',
    method: 'post',
    data: data
  })
}
