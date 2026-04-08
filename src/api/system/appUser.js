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
    url: `api/admin/user/activate/${data.id}`,
    method: 'post'
  })
}

export function bindRoles(data) {
  return request({
    url: 'api/admin/app-rbac/user/bind-roles',
    method: 'post',
    data
  })
}

export default { getAppUsers, edit, toggleStatus, bindRoles }
