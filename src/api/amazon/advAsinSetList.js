import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function advAsinSetPageList(data) {
  return request({
    url: '/advertising/api/advAsinSetPageList',
    method: 'post',
    data: data
  })
}

export function saveAdvAsinSet(data) {
  return request({
    url: '/advertising/api/saveAdvAsinSet',
    method: 'post',
    data: data
  })
}

export function deleteAdvAsinSet(data) {
  return request({
    url: '/advertising/api/deleteAdvAsinSet',
    method: 'post',
    data: data
  })
}

export function updateCampaignAsinSetChangePrice(data) {
  return request({
    url: '/advertising/api/campaign/changPrice',
    method: 'post',
    data: data
  })
}

export function updateCampaignAsinSetChangePriceSingle(data) {
  return request({
    url: '/advertising/api/single/campaign/changPrice',
    method: 'post',
    data: data
  })
}

