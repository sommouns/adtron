import request from '@/utils/request'

// 查询运营数据列表
export function listNegativeData(data) {
  return request({
    url: '/negative/data/list',
    method: 'post',
    data: data
  })
}

