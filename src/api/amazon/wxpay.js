import request from '@/utils/request'

// 统一下单
export function unifiedOrder(data) {
  return request({
    url: '/wxpay/unifiedOrder',
    method: 'post',
    data: data
  })
}
