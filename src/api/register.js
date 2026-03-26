import request from '@/utils/request'

export function registerOrg(data) {
  return request({
    url: 'auth/register',
    method: 'post',
    data
  })
}

export default { registerOrg }
