import request from '@/utils/request'

// 查询否定-基准点击率列表
export function listCampaignscr(query) {
  return request({
    url: '/system/campaignscr/list',
    method: 'get',
    params: query
  })
}
