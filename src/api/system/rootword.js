import request from '@/utils/request'

// 查询否定-活动集词根拆解列表
export function listRootword(query) {
  return request({
    url: '/system/rootword/list',
    method: 'get',
    params: query
  })
}