import request from '@/utils/request'

// 查询发票开具返回结果列表
export function listResponse(query) {
  return request({
    url: '/invoice/response/list',
    method: 'get',
    params: query
  })
}

// 新增发票开具返回结果
export function addResponse(data) {
  return request({
    url: '/invoice/response/create',
    method: 'post',
    data: data
  })
}

// 新增发票开具返回结果
export function cancelResponse(data) {
  return request({
    url: '/invoice/response/createRed',
    method: 'post',
    data: data
  })
}

// 根据企业名称模糊搜索返回结果列表
export function queryListByGmfMc(query) {
  return request({
    url: '/system/information/queryListByGmfMc',
    method: 'get',
    params: query
  })
}


