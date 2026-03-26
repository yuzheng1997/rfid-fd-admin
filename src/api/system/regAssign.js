import request from '@/utils/request'

export function getRegList(params) {
  return request({
    url: 'api/registrations',
    method: 'get',
    params
  })
}

export function assignAccount(data) {
  return request({
    url: 'api/registrations/assign',
    method: 'post',
    data
  })
}

export default { getRegList, assignAccount }
