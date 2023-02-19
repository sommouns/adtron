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

// 查询客户托管页面数据
export function queryAdvTrusteeshipList(data) {
  return request({
    url: '/advPortfolio/list',
    method: 'get',
    params: data
  })
}

// 新增客户托管集合
export function addAdvTrusteeshipList(data) {
  return request({
    url: '/advPortfolio/addPortfolio',
    method: 'post',
    data: data
  })
}

// 修改客户托管集合
export function updateAdvTrusteeshipList(data) {
  return request({
    url: '/advPortfolio/updatePortfolio',
    method: 'post',
    data: data
  })
}

// 删除托管集合
export function delAdvTrusteeshipList(data) {
  return request({
    url: '/advPortfolio/delPortfolio',
    method: 'post',
    data: data
  })
}

// 删除客户托管集合下的广告活动
export function delPortfolioCampaign(data) {
  return request({
    url: '/advPortfolio/delPortfolioCampaign',
    method: 'post',
    data: data
  })
}

export function queryThisPortfolioList(data){
  return request({
    url: '/advPortfolio/queryThisPortfolioList',
    method: 'get',
    params: data
  })
}

// 移动到指定的客户托管集合
export function moveToPortfolio(data) {
  return request({
    url: '/advPortfolio/moveToPortfolio',
    method: 'post',
    data: data
  })
}

// 批量移动到指定的客户托管集合
export function moveBatchToPortfolio(data) {
  return request({
    url: '/advPortfolio/moveBatchToPortfolio',
    method: 'post',
    data: data
  })
}


