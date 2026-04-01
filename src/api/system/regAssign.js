import request from '@/utils/request'

export function assignAccount(data) {
  return request({
    url: 'api/admin/company/assignAccount',
    method: 'post',
    data
  })
}

export default { assignAccount }
