import request from '@/utils/request'

// 查询广告组数据
export function adgroupList(query) {
  return request({
    url: '/advertising/info/adgroup',
    method: 'get',
    params: query
  })
}

// 新增广告组数据
export function addGroup(data) {
  return request({
    url: '/advertising/info/adgroup/add',
    method: 'post',
    data: data
  })
}

// 修改广告组数据
export function updateGroup(data) {
  return request({
    url: '/advertising/info/adgroup/update',
    method: 'post',
    data: data
  })
}

// 查询广告位
export function placementList(query) {
  return request({
    url: '/advertising/info/placement',
    method: 'get',
    params: query
  })
}

// 查询广告组广告产品
export function productadList(query) {
  return request({
    url: '/advertising/info/productads',
    method: 'get',
    params: query
  })
}

// 查询广告组-关键词
export function keywordList(query) {
  return request({
    url: '/advertising/info/keyword',
    method: 'get',
    params: query
  })
}

// 查询广告组-投放表达式
export function targetList(query) {
  return request({
    url: '/advertising/info/target',
    method: 'get',
    params: query
  })
}

// 查询广告组-否定关键词
export function negativeKeywordList(query) {
  return request({
    url: '/advertising/info/negativeKeyword',
    method: 'get',
    params: query
  })
}
// 广告组-批量修改否定关键词
export function updateNegativeKeywordList(data) {
  return request({
    url: '/advertising/info/negativeKeyword/update',
    method: 'post',
    data: data
  })
}

// 广告组-批量新增否定关键词
export function addNegativeKeywordList(data) {
  return request({
    url: '/advertising/info/negativeKeyword/add',
    method: 'post',
    data: data
  })
}

// 查询广告活动-否定关键词
export function campaignnegativeKeywordList(query) {
  return request({
    url: '/advertising/info/campaign/negative/keyword',
    method: 'get',
    params: query
  })
}

// 获取活动下的所有广告组

// 广告活动-批量修改否定关键词
export function updateCampaignNegativeKeywordList(data) {
  return request({
    url: '/advertising/info/campaign/negative/keyword/update',
    method: 'post',
    data: data
  })
}

// 广告活动-批量新增否定关键词
export function addCampaignNegativeKeywordList(data) {
  return request({
    url: '/advertising/info/campaign/negative/keyword/add',
    method: 'post',
    data: data
  })
}
export function adGroupFrameList(data) {
  return request({
    url: '/advertising/info/adgroupFrame',
    method: 'get',
    params: data
  })
}

// 批量修改关键词的竞价
export function changeKeywordsPrice(data) {
  return request({
    url: '/advertising/info/changeKeywordsPrice',
    method: 'post',
    data: data
  })
}

// 批量修改关键词状态
export function changeKeywordsState(data) {
  return request({
    url: '/advertising/info/changeKeywordsState',
    method: 'post',
    data: data
  })
}

//批量查询新关键词竞价
export function adGroupKeywordBid(data) {
  return request({
    url: '/system/h10keyword/adGroupKeywordBid',
    method: 'post',
    data: data
  })
}

//批量查询新投放出价
export function adGroupTargetBid(data) {
  return request({
    url: '/system/h10keyword/adGroupTargetBid',
    method: 'post',
    data: data
  })
}

// 批量新增关键词
export function batchAddKeywords(data) {
  return request({
    url: '/advertising/info/batchAddKeywords',
    method: 'post',
    data: data
  })
}

// 查询广告组-分时调价
export function campaignTimePriceList(query) {
  return request({
    url: '/advertising/info/campaignTimePriceList',
    method: 'get',
    params: query
  })
}

// 新增分时调价
export function addCampaignTimePrice(data) {
  return request({
    url: '/advertising/info/addCampaignTimePrice',
    method: 'post',
    data: data
  })
}

// 查询广告组-分时调价状态
export function queryCampaignTimeState(query) {
  return request({
    url: '/advertising/info/queryCampaignTimeState',
    method: 'get',
    params: query
  })
}



// 删除分时调价
export function deleteCampaignTimePrice(data) {
  return request({
    url: '/advertising/info/deleteCampaignTimePrice',
    method: 'post',
    data: data
  })
}

// 删除分时调价
export function updatePriceState(data) {
  return request({
    url: '/advertising/info/updatePriceState',
    method: 'post',
    data: data
  })
}


// 修改广告位策略以及溢价
export function updatePlacementBidding(data) {
  return request({
    url: '/advertising/info/updatePlacementBidding',
    method: 'post',
    data: data
  })
}

// 批量修改投放的出价
export function changeTargetPrice(data) {
  return request({
    url: '/advertising/info/changeTargetPrice',
    method: 'post',
    data: data
  })
}

// 批量修改投放状态
export function changeTargetState(data) {
  return request({
    url: '/advertising/info/changeTargetState',
    method: 'post',
    data: data
  })
}

// 批量新增投放
export function batchAddTarget(data) {
  return request({
    url: '/advertising/info/batchAddTarget',
    method: 'post',
    data: data
  })
}

// 查询门店下的所有ASIN 并且去除当前广告组下的ASIN
export function queryProductAsin(data) {
  return request({
    url: '/advertising/info/queryProductAsin',
    method: 'get',
    params: data
  })
}

// 新增广告产品ASIN
export function batchAddProduce(data) {
  return request({
    url: '/advertising/info/batchAddProduce',
    method: 'post',
    data: data
  })
}

// 修改广告产品ASIN状态
export function changeProduceState(data) {
  return request({
    url: '/advertising/info/changeProduceState',
    method: 'post',
    data: data
  })
}

// 根据活动ID查询活动预算情况
export function campaignBudgetUsageList(data) {
  return request({
    url: '/advertising/info/campaignBudgetUsageList',
    method: 'get',
    params: data
  })
}

// 投放词打标暂停
export function labKeywordStopList(data){
  return request({
    url: '/advertising/info/labKeywordStopList',
    method: 'get',
    params: data
  })
}

// 批量修改暂停关键词状态
export function batchLabKeywordStop(data) {
  return request({
    url: '/advertising/info/batchLabKeywordStop',
    method: 'post',
    data: data
  })
}

// 投放词打标调价
export function labKeywordChangePriceList(data){
  return request({
    url: '/advertising/info/labKeywordChangePriceList',
    method: 'get',
    params: data
  })
}

// 批量修改关键词调价
export function batchLabKeywordChangePrice(data) {
  return request({
    url: '/advertising/info/batchLabKeywordChangePrice',
    method: 'post',
    data: data
  })
}

// 搜索词投放列表
export function labKeywordTargetList(data){
  return request({
    url: '/advertising/info/labKeywordTargetList',
    method: 'get',
    params: data
  })
}

// 创建广告组
export function addKeywordTarget(data){
  return request({
    url: '/system/target/addGroup/'+data,
    method: 'get'
  })
}

// 月度结算列表
export function monthSettlementList(data){
  return request({
    url: '/advertising/info/monthSettlementList',
    method: 'get',
    params: data
  })
}

// 广告活动调价列表
export function labCampaignsBudgetList(data){
  return request({
    url: '/advertising/info/labCampaignsBudgetList',
    method: 'get',
    params: data
  })
}

// 批量修改关键词调价
export function batchLabCampaignsBudget(data) {
  return request({
    url: '/advertising/info/batchLabCampaignsBudget',
    method: 'post',
    data: data
  })
}

// 首页接口
export function queryBiReport(data) {
  return request({
    url: '/message/chart/line/data/asin',
    method: 'post',
    data: data
  })
}

//
export function labKeywordLaunchList(data) {
  return request({
    url: '/keywordsRanking/api/labKeywordLaunchList',
    method: 'post',
    data: data
  })
}

// 首页报表获取top10活动销售额
export function queryTop10Campaign(data) {
  return request({
    url: '/message/chart/line/data/campaign',
    method: 'post',
    data: data
  })
}
