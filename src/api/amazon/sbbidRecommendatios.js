import request from '@/utils/request'

// sb target建议竞价
export function sbTargetBid(data) {
  return request({
    url: '/system/sb/bid/target',
    method: 'post',
    data: data
  })
}
