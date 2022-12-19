import request from '@/utils/request'

// 查询广告搜索词报告列表
export function listReport(query) {
  return request({
    url: '/advertising/term/report/list',
    method: 'get',
    params: query
  })
}

// 查询广告搜索词报告分页合计列表
export function listSumReport(query) {
  return request({
    url: '/advertising/term/report/sumList',
    method: 'get',
    params: query
  })
}

