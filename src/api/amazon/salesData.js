import request from '@/utils/request'

// 查询运营数据列表
export function listSalesData(data) {
  return request({
    url: '/store/salesData/list',
    method: 'post',
    data: data
  })
}

// 查询父子体运营数据列表
export function listPartnerSalesData(data) {
  return request({
    url: '/store/salesData/partner/list',
    method: 'post',
    data: data
  })
}


// 每日商家数据
export function listDailySalesData(data) {
  return request({
    url: '/store/salesData/dailylist',
    method: 'post',
    data: data
  })
}