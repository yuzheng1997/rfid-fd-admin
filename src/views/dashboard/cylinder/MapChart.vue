<template>
  <div class="map-container" :style="{ height, width }">
    <div ref="mapContainer" class="map-view" />
  </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'

const DEFAULT_CENTER = [116.407387, 39.904179]
const DEFAULT_ZOOM = 11
const MOCK_POINT_LIST = [
  { name: '北京朝阳站', lng: 116.473168, lat: 39.993015, count: 126, adcode: '110105' },
  { name: '北京丰台站', lng: 116.286968, lat: 39.863642, count: 89, adcode: '110106' },
  { name: '天津西青站', lng: 117.008994, lat: 39.141811, count: 73, adcode: '120111' },
  { name: '石家庄长安站', lng: 114.54509, lat: 38.048958, count: 64, adcode: '130102' },
  { name: '济南历下站', lng: 117.120497, lat: 36.651216, count: 97, adcode: '370102' }
]

export default {
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '700px'
    },
    chartData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      AMap: null,
      map: null,
      infoWindow: null,
      markers: [],
      loading: false,
      errorMessage: '',
      showEmpty: false
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        if (this.map) {
          this.loadMapData()
        }
      }
    }
  },
  mounted() {
    this.initMap()
  },
  beforeDestroy() {
    this.clearMarkers()
    if (this.infoWindow) {
      this.infoWindow.close()
      this.infoWindow = null
    }
    if (this.map) {
      this.map.destroy()
      this.map = null
    }
  },
  methods: {
    async initMap() {
      const key = process.env.VUE_APP_AMAP_KEY
      const securityJsCode = process.env.VUE_APP_AMAP_SECURITY_KEY

      this.loading = true
      this.errorMessage = ''
      window._AMapSecurityConfig = {
        securityJsCode: securityJsCode
      }
      try {
        const AMap = await AMapLoader.load({
          key,
          version: '2.0'
        })

        this.AMap = AMap
        this.map = new AMap.Map(this.$refs.mapContainer, {
          // 设置地图容器id
          viewMode: '2D', // 是否为3D地图模式
          zoom: 11, // 初始化地图级别
          center: [116.397428, 39.90923]
        })
        this.infoWindow = new AMap.InfoWindow({
          offset: new AMap.Pixel(0, -24)
        })
        this.loadMapData()
      } catch (error) {
        console.error('Failed to initialize AMap:', error)
        this.errorMessage = '高德地图加载失败'
      } finally {
        this.loading = false
      }
    },
    loadMapData() {
      if (!this.map) {
        return
      }

      this.errorMessage = ''
      this.showEmpty = false

      let pointList = this.normalizeDistributionData(this.chartData)
      if (!pointList.length) {
        pointList = MOCK_POINT_LIST
      }
      this.renderMarkers(pointList)
    },
    normalizeDistributionData(sourceData) {
      const list = this.unwrapList(sourceData)

      return list.map(item => {
        const point = this.extractPoint(item)
        const count = this.extractCount(item)
        const name = item.name || item.regionName || item.areaName || item.cityName || item.provinceName || '未命名区域'

        return {
          name,
          lng: point.lng,
          lat: point.lat,
          count,
          adcode: item.adcode || item.code || ''
        }
      }).filter(item => Number.isFinite(item.lng) && Number.isFinite(item.lat))
    },
    unwrapList(sourceData) {
      if (Array.isArray(sourceData)) {
        return sourceData
      }

      if (!sourceData || typeof sourceData !== 'object') {
        return []
      }

      return sourceData.list || sourceData.items || sourceData.records || sourceData.content || sourceData.data || []
    },
    extractPoint(item) {
      const lng = item.lng !== undefined ? item.lng : (item.lon !== undefined ? item.lon : item.longitude)
      const lat = item.lat !== undefined ? item.lat : item.latitude

      if (lng !== undefined && lat !== undefined) {
        return {
          lng: Number(lng),
          lat: Number(lat)
        }
      }

      if (Array.isArray(item.center) && item.center.length >= 2) {
        return {
          lng: Number(item.center[0]),
          lat: Number(item.center[1])
        }
      }

      if (Array.isArray(item.location) && item.location.length >= 2) {
        return {
          lng: Number(item.location[0]),
          lat: Number(item.location[1])
        }
      }

      if (typeof item.center === 'string') {
        const [centerLng, centerLat] = item.center.split(',').map(Number)
        return {
          lng: centerLng,
          lat: centerLat
        }
      }

      return {
        lng: NaN,
        lat: NaN
      }
    },
    extractCount(item) {
      let count = item.cylinderCount
      if (item.total !== undefined) {
        count = item.total
      }
      if (item.quantity !== undefined) {
        count = item.quantity
      }
      if (item.value !== undefined) {
        count = item.value
      }
      if (item.count !== undefined) {
        count = item.count
      }
      return Number(count) || 0
    },
    getMarkerLevelClass(count) {
      if (count >= 100) {
        return 'is-high'
      }
      if (count >= 70) {
        return 'is-medium'
      }
      return 'is-low'
    },
    renderMarkers(pointList) {
      this.clearMarkers()

      if (!pointList.length) {
        this.showEmpty = true
        this.map.setZoomAndCenter(DEFAULT_ZOOM, DEFAULT_CENTER)
        return
      }

      this.markers = pointList.map(item => {
        const marker = new this.AMap.Marker({
          position: [item.lng, item.lat],
          anchor: 'bottom-center',
          offset: new this.AMap.Pixel(0, 0),
          label: {
            direction: 'top',
            offset: new this.AMap.Pixel(0, -8),
            content: this.createMarkerLabelContent(item)
          }
        })

        marker.on('click', () => {
          if (!this.infoWindow) {
            return
          }
          this.infoWindow.setContent(this.createInfoWindowContent(item))
          this.infoWindow.open(this.map, [item.lng, item.lat])
        })

        return marker
      })

      this.map.add(this.markers)
      this.map.setFitView(this.markers, false, [60, 60, 60, 60])
    },
    createMarkerLabelContent(item) {
      const levelClass = this.getMarkerLevelClass(item.count)
      return `
        <div class="cylinder-marker-label ${levelClass}">
          <div class="cylinder-marker-label__halo"></div>
          <div class="cylinder-marker-label__dot"></div>
          <div class="cylinder-marker-label__stem"></div>
          <div class="cylinder-marker-label__card">
            <div class="cylinder-marker-label__count">${item.count}</div>
            <div class="cylinder-marker-label__name">${item.name}</div>
          </div>
        </div>
      `
    },
    createInfoWindowContent(item) {
      return `
        <div class="map-info-window">
          <div class="map-info-window__title">${item.name}</div>
          <div class="map-info-window__value">气瓶数量：${item.count}</div>
        </div>
      `
    },
    clearMarkers() {
      if (this.markers.length && this.map) {
        this.map.remove(this.markers)
      }
      this.markers = []
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  min-height: 320px;
  background: #fff;
  overflow: hidden;
}

.map-view {
  width: 100%;
  height: 100%;
}

.map-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.88);
  color: #606266;
  font-size: 14px;
  z-index: 10;
}

.map-empty-tip {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  color: #606266;
  font-size: 12px;
  z-index: 10;
}

.map-info-window {
  min-width: 140px;
  line-height: 1.6;
}

.map-info-window__title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.map-info-window__value {
  color: #606266;
}
</style>

<style>
.cylinder-marker-label {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
  transform: translateY(-6px);
}

.cylinder-marker-label__halo {
  position: absolute;
  bottom: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(73, 194, 255, 0.42) 0%, rgba(73, 194, 255, 0.16) 48%, rgba(73, 194, 255, 0) 74%);
  animation: cylinder-marker-breath 3.2s ease-in-out infinite;
}

.cylinder-marker-label__dot {
  position: relative;
  z-index: 2;
  width: 10px;
  height: 10px;
  border: 2px solid rgba(255, 255, 255, 0.96);
  border-radius: 50%;
  background: linear-gradient(135deg, #6fe7ff 0%, #4ca7ff 100%);
  box-shadow: 0 0 0 4px rgba(88, 184, 255, 0.16), 0 6px 16px rgba(30, 124, 189, 0.28);
}

.cylinder-marker-label__stem {
  width: 1px;
  height: 12px;
  background: linear-gradient(180deg, rgba(120, 205, 255, 0.88) 0%, rgba(120, 205, 255, 0.18) 100%);
}

.cylinder-marker-label__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  max-width: 144px;
  padding: 10px 14px 9px;
  border: 1px solid rgba(125, 206, 255, 0.24);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(9, 24, 42, 0.92) 0%, rgba(13, 30, 52, 0.84) 100%);
  box-shadow: 0 12px 30px rgba(8, 22, 40, 0.22);
  backdrop-filter: blur(8px);
  transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
}

.cylinder-marker-label:hover .cylinder-marker-label__card {
  transform: translateY(-2px);
  border-color: rgba(125, 206, 255, 0.38);
  box-shadow: 0 16px 32px rgba(8, 22, 40, 0.28);
}

.cylinder-marker-label__count {
  color: #f5fbff;
  font-size: 18px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.cylinder-marker-label__name {
  max-width: 116px;
  margin-top: 6px;
  color: rgba(214, 235, 248, 0.78);
  font-size: 12px;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cylinder-marker-label.is-low .cylinder-marker-label__halo {
  opacity: 0.72;
}

.cylinder-marker-label.is-medium .cylinder-marker-label__halo {
  opacity: 0.9;
}

.cylinder-marker-label.is-medium .cylinder-marker-label__card {
  border-color: rgba(111, 231, 255, 0.28);
}

.cylinder-marker-label.is-high .cylinder-marker-label__halo {
  width: 22px;
  height: 22px;
  opacity: 1;
}

.cylinder-marker-label.is-high .cylinder-marker-label__dot {
  box-shadow: 0 0 0 5px rgba(88, 184, 255, 0.18), 0 8px 18px rgba(30, 124, 189, 0.34);
}

.cylinder-marker-label.is-high .cylinder-marker-label__card {
  border-color: rgba(111, 231, 255, 0.36);
  box-shadow: 0 14px 34px rgba(8, 22, 40, 0.28);
}

@keyframes cylinder-marker-breath {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.42;
  }
  50% {
    transform: scale(1.18);
    opacity: 0.72;
  }
}
</style>
