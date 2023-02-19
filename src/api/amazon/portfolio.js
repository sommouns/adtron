import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function listPortfolio(data) {
  return request({
    url: '/advertising/portfolio/portfolioList',
    method: 'post',
    data: data
  })
}

// 查询用户详细
export function getPortfolio(data) {
  return request({
    url: '/advertising/portfolio/getPortfolioDetail',
    method: 'post',
    data: data
  })
}

// 新增用户
export function savePortfolio(data) {
  return request({
    url: '/advertising/portfolio/save',
    method: 'post',
    data: data
  })
}


