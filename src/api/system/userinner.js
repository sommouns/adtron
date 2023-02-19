import request from '@/utils/request'

// 查询子用户列表
export function listinneruser(data) {
  return request({
    url: '/system/user/inner/list',
    method: 'get',
    params: data
  })
}

// 添加子用户
export function addinneruser(data) {
  return request({
    url: '/system/user/inner',
    method: 'post',
    data: data
  })
}

// 获取子用户关联asin
export function getuserasin(data) {
  return request({
    url: '/system/user/inner/asin?userId=' + data,
    method: 'get'
  })
}


// 获取可选asin
export function getselectasin(data) {
  return request({
    url: '/system/user/inner/asin/select?userId=' + data,
    method: 'get'
  })
}

// 保存asin
export function saveasin(data) {
  return request({
    url: '/system/user/inner/asin/save',
    method: 'post',
    data: data
  })
}

// 删除asin
export function delasin(data) {
  return request({
    url: '/system/user/inner/asin/del',
    method: 'post',
    data: data
  })
}