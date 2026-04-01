import request from '@/utils/request'
import qs from 'qs'

export function initData(url, params, method = 'get') {
  if (method.toLowerCase() === 'post') {
    return request({
      url: url,
      method: 'post',
      data: params
    })
  }
  return request({
    url: url + '?' + qs.stringify(params, { indices: false }),
    method: 'get'
  })
}

export function download(url, params, method = 'get') {
  if (method.toLowerCase() === 'post') {
    return request({
      url: url,
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  }
  return request({
    url: url + '?' + qs.stringify(params, { indices: false }),
    method: 'get',
    responseType: 'blob'
  })
}
