import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function advAsinSetChangePageList(data) {
  return request({
    url: '/advertising/api/advAsinSetChangePageList',
    method: 'post',
    data: data
  })
}

export function clear(data) {
  return request({
    url: '/advertising/api/clear',
    method: 'post',
    data: data
  })
}

export function getAsinCampaigns(data) {
  return request({
    url: '/advertising/api/asin/campaigns',
    method: 'post',
    data: data
  })
}
