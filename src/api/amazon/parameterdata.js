import request from '@/utils/request'

// 查询运营数据列表
export function listParameterDataData(data) {
  return request({
    url: '/store/parameterData/list',
    method: 'post',
    data: data
  })
}
