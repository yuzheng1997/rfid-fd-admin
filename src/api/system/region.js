import request from '@/utils/request'

export function getRegionTree(params) {
  return request({
    url: '/api/sys/region/tree',
    method: 'get',
    params
  })
}

export function getRegionTreeLazy(pid) {
  return request({
    url: '/api/sys/region/tree',
    method: 'get',
    params: { pid }
  })
}

export default { getRegionTree, getRegionTreeLazy }
