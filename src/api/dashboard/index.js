import request from '@/utils/request'

export function trendFill() {
  return request({
    url: 'api/admin/dashboard/trend/fill',
    method: 'get',
    params: { days: 30 }
  })
}
export function distribution() {
  return request({
    url: 'api/admin/dashboard/map/distribution',
    method: 'get'
  })
}

