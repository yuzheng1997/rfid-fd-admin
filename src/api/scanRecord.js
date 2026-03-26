import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/scanRecords',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/scanRecords',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/scanRecords',
    method: 'put',
    data
  })
}

export function download(params) {
  return request({
    url: 'api/scanRecords/download',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export default { add, edit, del, download }
