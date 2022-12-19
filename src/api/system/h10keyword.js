import request from '@/utils/request'

// 查询H10关键词筛选库列表
export function listH10keyword(query) {
  return request({
    url: '/system/h10keyword/list',
    method: 'get',
    params: query
  })
}

// 删除H10关键词筛选库
export function delH10keyword(id) {
  return request({
    url: '/system/h10keyword/' + id,
    method: 'delete'
  })
}

// 删除H10关键词
export function delAllH10keyword() {
  return request({
    url: '/system/h10keyword/del/all',
    method: 'delete'
  })
}
