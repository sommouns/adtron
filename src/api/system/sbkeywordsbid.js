import request from '@/utils/request'

// 查询sb关键词筛选库列表
export function listSBkeyword(query) {
  return request({
    url: '/system/sb/bid//keywords/list',
    method: 'get',
    params: query
  })
}

// 删除sb关键词筛选库
export function delSBkeyword(id) {
  return request({
    url: '/system/sb/bid/' + id,
    method: 'delete'
  })
}

// 删除sb关键词
export function delAllSBkeyword() {
  return request({
    url: '/system/sb/bid/del/all',
    method: 'delete'
  })
}
