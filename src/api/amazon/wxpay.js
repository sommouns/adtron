import request from '@/utils/request'

// 统一下单
export function unifiedOrder(data) {
  return request({
    url: '/wxpay/unifiedOrder',
    method: 'post',
    data: data
  })
}

// 申请退款
export function refund(data) {
  return request({
    url: '/wxpay/refund?outTradeNo=' + data,
    method: 'get'
  })
}
