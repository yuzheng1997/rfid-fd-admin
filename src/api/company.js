import request from '@/utils/request'

export function registerCompany(data) {
  return request({
    url: 'api/admin/company/register',
    method: 'post',
    data
  })
}

export function listAllCompanies(data) {
  return request({
    url: 'api/app/company/listAll',
    method: 'post',
    data
  })
}

export default { registerCompany, listAllCompanies }

