import request from '@/utils/request'

//获取类目列表
export function categoryList(params) {
  return request({
    url: '/targets/category?shopId=' + params.shopId + '&pageSize=' + params.pageSize + '&pageNum=' + params.pageNum,
    method: 'get'
  })
}
