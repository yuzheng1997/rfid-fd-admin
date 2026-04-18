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

// Get dashboard statistics based on user role
export function getStatistics() {
  return request({
    url: 'api/admin/dashboard/statistics',
    method: 'get'
  })
}

// Get operation records for dashboard
export function getOperationRecords(params) {
  return request({
    url: 'api/admin/dashboard/operations',
    method: 'get',
    params: { limit: 10, ...params }
  })
}

// Get expiration alerts
export function getExpirationAlerts() {
  return request({
    url: 'api/admin/dashboard/expiration',
    method: 'get'
  })
}

// Get status pie chart data
export function statusPie() {
  return request({
    url: 'api/admin/dashboard/charts/status-pie',
    method: 'get'
  })
}

// Get indicator cards data
export function getIndicatorCards() {
  return request({
    url: 'api/admin/dashboard/cards',
    method: 'get'
  })
}

// Get scan record page data
export function scanRecordPage(params) {
  return request({
    url: 'api/admin/scan-record/page',
    method: 'get',
    params
  })
}

