import request from '@/utils/request'

// 查询短词操作记录列表
export function listRecode(query) {
  return request({
    url: '/system/recode/list',
    method: 'get',
    params: query
  })
}

// 查询短词操作记录详细
export function getRecode(id) {
  return request({
    url: '/system/recode/' + id,
    method: 'get'
  })
}
