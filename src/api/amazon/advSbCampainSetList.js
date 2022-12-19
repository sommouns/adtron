import request from '@/utils/request'


export function advCampaignSetPageList(data) {
  return request({
    url: '/campaign/sb/advCampaignSetPageList',
    method: 'post',
    data: data
  })
}

export function saveAdvCampaignSet(data) {
  return request({
    url: '/campaign/sb/saveAdvCampaignSet',
    method: 'post',
    data: data
  })
}

export function deleteAdvCampaignSet(data) {
  return request({
    url: '/campaign/sb/deleteAdvCampaignSet',
    method: 'post',
    data: data
  })
}
