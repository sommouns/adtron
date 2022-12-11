import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function advCampaignAsinSetChangePageList(data) {
  return request({
    url: '/advertising/api/advCampaignAsinSetChangePageList',
    method: 'post',
    data: data
  })
}

export function clear(data) {
  return request({
    url: '/advertising/api/campaign/clear',
    method: 'post',
    data: data
  })
}
