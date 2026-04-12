import request from '@/utils/request'

/**
 * Get list of countries
 * @param {string} lang - Language code, default: 'zh-CN'
 */
export function getCountries(lang = 'zh-CN') {
  return request({
    url: '/api/common/region/countries',
    method: 'get',
    params: { lang }
  })
}

/**
 * Get list of states/provinces by country ID
 * @param {string} countryId - Country ID
 * @param {string} lang - Language code, default: 'zh-CN'
 */
export function getStates(countryId, lang = 'zh-CN') {
  return request({
    url: '/api/common/region/states',
    method: 'get',
    params: { countryId, lang }
  })
}

/**
 * Get list of cities by state/province ID
 * @param {string} stateId - State/province ID
 * @param {string} lang - Language code, default: 'zh-CN'
 */
export function getCities(stateId, lang = 'zh-CN') {
  return request({
    url: '/api/common/region/cities',
    method: 'get',
    params: { stateId, lang }
  })
}

export default {
  getCountries,
  getStates,
  getCities
}
