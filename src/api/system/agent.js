import request from '@/utils/request'

// 查询代理商列表
export function listAgent(query) {
  return request({
    url: '/system/agent/list',
    method: 'get',
    params: query
  })
}

// 查询代理商详细
export function getAgent(agentId) {
  return request({
    url: '/system/agent/' + agentId,
    method: 'get'
  })
}

// 新增代理商
export function addAgent(data) {
  return request({
    url: '/system/agent',
    method: 'post',
    data: data
  })
}

// 修改代理商
export function updateAgent(data) {
  return request({
    url: '/system/agent',
    method: 'put',
    data: data
  })
}

// 删除代理商
export function delAgent(agentId) {
  return request({
    url: '/system/agent/' + agentId,
    method: 'delete'
  })
}
