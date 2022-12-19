import request from '@/utils/request'


export function listH10Filter(query) {
  return request({
    url: '/system/filter/list',
    method: 'get',
    params: query
  })
}


export function addH10Filter(data) {
  return request({
    url: '/system/filter',
    method: 'post',
    data: data
  })
}


export function delH10Filter(id) {
  return request({
    url: '/system/filter/' + id,
    method: 'delete'
  })
}
