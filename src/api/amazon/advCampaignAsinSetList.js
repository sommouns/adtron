import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function advCampaignAsinSetPageList(data) {
  return request({
    url: '/advertising/api/advCampaignAsinSetPageList',
    method: 'post',
    data: data
  })
}

export function saveAdvCampaignAsinSet(data) {
  return request({
    url: '/advertising/api/saveAdvCampaignAsinSet',
    method: 'post',
    data: data
  })
}

export function deleteAdvCampaignAsinSet(data) {
  return request({
    url: '/advertising/api/deleteAdvCampaignAsinSet',
    method: 'post',
    data: data
  })
}

export function queryId(id) {
  return request({
    url: '/advertising/api/query/'+id,
    method: 'get',
  })
}


// 修改客户设置活动asin广告信息
export function updateList(data) {
  return request({
    url: '/advertising/api/update',
    method: 'put',
    data: data
  })
}
