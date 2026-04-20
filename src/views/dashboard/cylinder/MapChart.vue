<template>
  <div class="box-card" shadow="never">
    <div class="clearfix">
      <span style="font-weight: bold; color: #f56c6c;">气瓶区域分布</span>
    </div>
    <div class="map-container" :style="{ height, width }">
      <div ref="mapContainer" class="map-view" />
    </div>
  </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import { distribution } from '@/api/dashboard/index'

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
      pointList: [],
      loading: false,
      errorMessage: ''
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

      this.loading = true
      this.errorMessage = ''

      try {
        const AMap = await AMapLoader.load({
          key,
          version: '2.0'
        })

        this.AMap = AMap
        this.map = new AMap.Map(this.$refs.mapContainer, {
          zoom: DEFAULT_ZOOM,
          center: DEFAULT_CENTER,
          viewMode: '2D'
        })

        this.infoWindow = new AMap.InfoWindow({
          offset: new AMap.Pixel(0, -30)
        })

        await this.loadMapData()
      } catch (error) {
        console.error('Failed to initialize AMap:', error)
        this.errorMessage = '地图加载失败'
      } finally {
        this.loading = false
      }
    },
    async loadMapData() {
      try {
        const res = await distribution()
        if (res && res.data) {
          this.pointList = this.normalizeDistributionData(res.data)
        }
      } catch (error) {
        console.error('获取分布数据失败:', error)
        this.pointList = MOCK_POINT_LIST
      }

      if (!this.pointList || !this.pointList.length) {
        this.pointList = MOCK_POINT_LIST
      }

      this.renderMarkers()
    },
    normalizeDistributionData(sourceData) {
      const list = Array.isArray(sourceData) ? sourceData : []
      return list.map(item => ({
        name: item.name || '未命名企业',
        lng: Number(item.lng),
        lat: Number(item.lat),
        count: Number(item.value) || 0,
        code: item.code || ''
      })).filter(item => Number.isFinite(item.lng) && Number.isFinite(item.lat))
    },
    renderMarkers() {
      this.clearMarkers()

      if (!this.pointList.length) {
        return
      }

      // 创建标记
      this.markers = this.pointList.map(item => {
        const isHighCount = item.count >= 100
        const bgColor = isHighCount ? '#f56c6c' : '#409eff'
        const borderColor = isHighCount ? '#f56c6c' : '#409eff'

        const content = `
          <div style="
            background: ${bgColor};
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            border: 2px solid ${borderColor};
            text-align: center;
            min-width: 80px;
            cursor: pointer;
          ">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 2px;">${item.count}</div>

          </div>
        `

        const marker = new this.AMap.Marker({
          position: [item.lng, item.lat],
          content: content,
          offset: new this.AMap.Pixel(-40, -30)
        })

        marker.on('click', () => {
          this.showInfoWindow(item)
        })

        marker._itemData = item

        return marker
      })

      this.map.add(this.markers)
      this.map.setFitView(this.markers, false, [60, 60, 60, 60])
    },
    showInfoWindow(item) {
      const content = `
        <div style="padding: 12px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #303133;">
            ${item.name}
          </div>
          <div style="color: #606266; font-size: 13px;">
            <div style="margin-bottom: 4px;">气瓶数量: <span style="font-weight: bold; color: #f56c6c;">${item.count}</span></div>
          </div>
        </div>
      `

      this.infoWindow.setContent(content)
      this.infoWindow.open(this.map, [item.lng, item.lat])
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

<style lang="scss">
.box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  .clearfix {
    padding: 0 20px;
    height: 45px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f2f5;
  }
  .map-container {
    flex: 1;
    position: relative;
    min-height: 320px;
    background: #fff;
    overflow: hidden;
  }
  .map-view {
    width: 100%;
    height: 100%;
  }
}
</style>
