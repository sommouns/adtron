import request from '@/utils/request'

// 查询流量跳出分析列表
export function outList(data) {
  return request({
    url: '/flow/analysis/out/list',
    method: 'post',
    data: data
  })
}

// 查询流量跳入分析列表
export function inList(data) {
  return request({
    url: '/flow/analysis/in/list',
    method: 'post',
    data: data
  })
}

// 查询流量跳入分析列表
export function inAsin(data) {
  return request({
    url: '/flow/analysis/in/asin',
    method: 'post',
    data: data
  })
}


// 查询流量跳入分析列表
export function outAsin(data) {
  return request({
    url: '/flow/analysis/out/asin',
    method: 'post',
    data: data
  })
}
