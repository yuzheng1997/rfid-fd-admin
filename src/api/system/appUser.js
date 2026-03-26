import request from '@/utils/request'

export function getAppUsers(params) {
  return request({
    url: 'api/appUsers',
    method: 'get',
    params
  })
}

export function edit(data) {
  return request({
    url: 'api/appUsers',
    method: 'put',
    data
  })
}

export function toggleStatus(data) {
  return request({
    url: 'api/appUsers/toggleStatus',
    method: 'post',
    data
  })
}

export default { getAppUsers, edit, toggleStatus }
