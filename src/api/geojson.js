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
  return fetchGeoJSON('/china-geojson-master/china.json')
}

export function getProvinceGeoJSON(provinceId) {
  return fetchGeoJSON(`/china-geojson-master/geometryProvince/${provinceId}.json`)
}

export function getCityCountiesGeoJSON(cityId) {
  return fetchGeoJSON(`/china-geojson-master/geometryCouties/${cityId}.json`)
}

export default { fetchGeoJSON, getChinaGeoJSON, getProvinceGeoJSON, getCityCountiesGeoJSON }

