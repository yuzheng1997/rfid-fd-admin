import request from '@/utils/request'

export function fetchGeoJSON(url) {
  return request({
    url,
    method: 'get',
    responseType: 'text',
    transformResponse: [d => d]
  }).then(data => {
    const text = typeof data === 'string' ? data.replace(/^\uFEFF/, '') : ''
    return text ? JSON.parse(text) : data
  })
}

export function getChinaGeoJSON() {
  return fetchGeoJSON('/map/china.json')
}

export function getProvinceGeoJSON(provinceId) {
  return fetchGeoJSON(`/map/citys/${provinceId}.json`)
}

export function getCityCountiesGeoJSON(cityId) {
  return fetchGeoJSON(`/map/citys/${cityId}.json`)
}

export function fetchLocation() {
  return fetchGeoJSON('/map/location.json')
}

export function fetchLocationSimplified() {
  return fetchGeoJSON('/map/location-simplified.json')
}

export default { fetchGeoJSON, getChinaGeoJSON, getProvinceGeoJSON, getCityCountiesGeoJSON, fetchLocation, fetchLocationSimplified }

