import request from '@/utils/request'

// 查询开票信息设置列表
export function listInformation(query) {
  return request({
    url: '/system/information/list',
    method: 'get',
    params: query
  })
}

// 查询开票信息设置详细
export function getInformation(id) {
  return request({
    url: '/system/information/' + id,
    method: 'get'
  })
}

// 新增开票信息设置
export function addInformation(data) {
  return request({
    url: '/system/information',
    method: 'post',
    data: data
  })
}

// 修改开票信息设置
export function updateInformation(data) {
  return request({
    url: '/system/information',
    method: 'put',
    data: data
  })
}

// 删除开票信息设置
export function delInformation(id) {
  return request({
    url: '/system/information/' + id,
    method: 'delete'
  })
}
