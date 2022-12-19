import request from '@/utils/request'

// sp target建议竞价
export function spTargetBid(data) {
  return request({
    url: '/bid/sp/target',
    method: 'post',
    data: data
  })
}

// sd 建议竞价
export function sdTargetBid(data) {
  return request({
    url: '/bid/sd/target',
    method: 'post',
    data: data
  })
}
