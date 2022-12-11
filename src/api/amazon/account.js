import request from '@/utils/request'
import { praseStrEmpty } from "@/utils/ruoyi";
import store from '@/store'

export function hasAuthPermission(permission) {
  const all_permission = "*:*:*";
  const permissions = store.getters && store.getters.permissions;
  if (permission && permission.length > 0) {
    return permissions.some(v => {
      return all_permission === v || v === permission
    })
  } else {
    return false
  }
}

// 查询用户列表
export function listAccount(data) {
  return request({
    url: '/channel/account/accountPageList',
    method: 'post',
    data: data
  })
}

// 查询用户详细
export function getAccount(data) {
  return request({
    url: '/channel/account/getAccount',
    method: 'post',
    data: data
  })
}

// 新增用户
export function saveAccount(data) {
  return request({
    url: '/channel/account/save',
    method: 'post',
    data: data
  })
}

// 修改用户个人信息
export function updateStatus(data) {
  return request({
    url: '/channel/account/updateStatus',
    method: 'post',
    data: data
  })
}

// 修改用户个人信息
export function deleteAccount(data) {
  return request({
    url: '/channel/account/deleteAccount',
    method: 'post',
    data: data
  })
}


// 修改用户个人信息
export function toAdvertisingAuth(data) {
  return request({
    url: '/channel/account/toAdvertisingAuth',
    method: 'post',
    data: data
  })
}

export function allAccount() {
  return request({
    url: '/channel/account/accountList',
    method: 'post'
  })
}

export function syncListing(data) {
  return request({
    url: '/channel/account/syncListing',
    method: 'post',
    data: data
  })
}

export function advertisingAuthCallBack(param) {
  return request({
    url: '/channel/account/advertisingAuthCallBack?' + param,
    method: 'post'
  })
}

// 跳转店铺授权
export function toSellerCentral(country) {
  return request({
    url: '/seller/sellerInfo/toSellerCentral/' + country,
    method: 'get'
  })
}

// 修改店铺托管有效期
export function updateValidDate(data) {
  return request({
    url: '/channel/account/valid/date',
    method: 'post',
    data: data
  })
}

// 查询用户列表
export function queryAllUserList(data) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params:data
  })
}

// 店铺分配
export function updateShopUser(data) {
  return request({
    url: '/channel/account/updateShopUser',
    method: 'post',
    data: data
  })
}
