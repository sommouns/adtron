import request from '@/utils/request'

// 查询打开分时调价列表
export function listTime(query) {
  return request({
    url: '/campaigns/time/list',
    method: 'get',
    params: query
  })
}


// 新增打开分时调价
export function addTime(campaignId) {
  return request({
    url: '/campaigns/time/'+campaignId,
    method: 'get'
  })
}

// 删除打开分时调价
export function delTime(id) {
  return request({
    url: '/campaigns/time/' + id,
    method: 'delete'
  })
}


// 修改状态
export function changeType(data) {
  return request({
    url: '/campaigns/time/changeType',
    method: 'post',
    data: data
  })
}
