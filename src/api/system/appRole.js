import request from '@/utils/request'

export function getList(data) {
  return request({
    url: 'api/admin/app-rbac/role/list',
    method: 'post',
    data
  })
}

export function add(data) {
  return request({
    url: 'api/admin/app-rbac/role/save',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: 'api/admin/app-rbac/role/save',
    method: 'post',
    data
  })
}

export function getPermissionList(data) {
  return request({
    url: 'api/admin/app-rbac/permissions',
    method: 'post',
    data
  })
}

export function del(data) {
  const roleId = Array.isArray(data) ? data[0] : (data && (data.id || data.roleId) ? data.id || data.roleId : data)
  return request({
    url: `api/admin/app-rbac/role/delete/${roleId}`,
    method: 'post'
  })
}

export default { getList, add, edit, getPermissionList, del }
