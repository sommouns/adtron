import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function listCampaign(data) {
  return request({
    url: '/advertising/api/campaignList',
    method: 'post',
    data: data
  })
}


// 修改活动价格
export function changeCampaignPrice(data) {
  return request({
    url: '/advertising/api/changeCampaignPrice',
    method: 'post',
    data: data
  })
}

// 批量修改活动价格
export function changeCampaignState(data) {
  return request({
    url: '/advertising/api/changeCampaignState',
    method: 'post',
    data: data
  })
}
