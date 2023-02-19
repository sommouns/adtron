import request from '@/utils/request'

// 查询用户消息提醒列表
export function listMessage(query) {
  return request({
    url: '/system/message/user/list',
    method: 'get',
    params: query
  })
}

// 查询用户消息提醒详细
export function getMessage(messageId) {
  return request({
    url: '/system/message/' + messageId,
    method: 'get'
  })
}

// 用户未读取数量
export function unReadMessage() {
  return request({
    url: '/system/message/user/unread/count',
    method: 'get',
  })
}

// 用户未读取数量
export function stockUnReadMessage() {
  return request({
    url: '/system/message/user/unread/count',
    method: 'get',
  })
}

// 改变用户消息提醒为已读
export function readMessage(messageId) {
  return request({
    url: '/system/message/read/' + messageId,
    method: 'put'
  })
}

// 改变用户消息提醒为已读
export function readAllMessage() {
  return request({
    url: '/system/message/readAll',
    method: 'put'
  })
}

// 新增用户公告
export function addNotice(data) {
  return request({
    url: '/system/message/addNotice',
    method: 'post',
    data: data
  })
}
