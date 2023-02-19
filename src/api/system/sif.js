import request from '@/utils/request'

// 查询sif 关键词列表
export function listSif(query) {
  return request({
    url: '/sif/list',
    method: 'get',
    params: query
  })
}



