import request from '@/utils/request'

// 查询子用户列表
export function listsubuser(data) {
  return request({
    url: '/sub/user/list',
    method: 'get',
    params: data
  })
}

// 添加子用户
export function addsubuser(data) {
  return request({
    url: '/sub/user',
    method: 'post',
    data: data
  })
}

// 获取子用户关联asin
export function getuserasin(data) {
  return request({
    url: '/sub/user/asin?userId=' + data,
    method: 'get'
  })
}


// 获取可选asin
export function getselectasin(data) {
  return request({
    url: '/sub/user/asin/select?userId=' + data,
    method: 'get'
  })
}

// 保存asin
export function saveasin(data) {
  return request({
    url: '/sub/user/asin/save',
    method: 'post',
    data: data
  })
}

// 删除asin
export function delasin(data) {
  return request({
    url: '/sub/user/asin/del',
    method: 'post',
    data: data
  })
}