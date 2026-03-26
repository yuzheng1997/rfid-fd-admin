<template>
  <div class="map-container">
    <el-button
      v-if="mapStack.length > 1"
      size="mini"
      type="primary"
      icon="el-icon-back"
      class="back-btn"
      @click="goBack"
    >返回上级</el-button>
    <div ref="mapChart" :class="className" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../mixins/resize'
import { fetchGeoJSON } from '@/api/geojson'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '700px'
    }
  },
  data() {
    return {
      chart: null,
      mapStack: [],
      currentMapName: 'china',
      registeredMaps: new Set()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    async initChart() {
      this.chart = echarts.init(this.$refs.mapChart, 'macarons')

      // 初始加载中国地图
      await this.loadAndRegisterMap('china', '/china-geojson-master/china.json')
      this.renderMap('china')

      // 点击下钻
      this.chart.on('click', (params) => {
        if (params.componentType === 'series' && params.seriesType === 'map') {
          const { id, name } = params.data
          if (id) {
            this.drillDown(id, name)
          }
        }
      })
    },

    async loadAndRegisterMap(mapName, url) {
      if (this.registeredMaps.has(mapName)) return
      try {
        const geoJson = await fetchGeoJSON(url)
        echarts.registerMap(mapName, geoJson)
        this.registeredMaps.add(mapName)
      } catch (error) {
        console.error('Failed to load map data:', error)
        this.$message.error('地图数据加载失败')
      }
    },

    async drillDown(id, name) {
      // 判断是省还是市
      let url = ''
      const mapName = id
      if (id.length === 2) {
        // 省级下钻到市级
        url = `/china-geojson-master/geometryProvince/${id}.json`
      } else if (id.length === 6) {
        // 市级下钻到县级
        url = `/china-geojson-master/geometryCouties/${id}.json`
      } else {
        return // 不支持进一步下钻
      }

      await this.loadAndRegisterMap(mapName, url)
      this.renderMap(mapName)
    },

    goBack() {
      if (this.mapStack.length > 1) {
        this.mapStack.pop() // 弹出当前的
        const prev = this.mapStack.pop() // 获取上一个
        this.renderMap(prev.mapName, false)
      }
    },

    renderMap(mapName, pushStack = true) {
      if (pushStack) {
        this.mapStack.push({ mapName })
      }
      this.currentMapName = mapName

      const option = {
        title: {
          text: '气瓶地理分布 (可点击下钻)',
          left: 'center',
          top: 20
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
        },
        geo: {
          map: mapName,
          roam: true,
          label: {
            emphasis: {
              show: true,
              color: '#fff'
            }
          },
          itemStyle: {
            normal: {
              areaColor: '#323c48',
              borderColor: '#111'
            },
            emphasis: {
              areaColor: '#2a333d'
            }
          }
        },
        series: [
          {
            type: 'map',
            geoIndex: 0,
            data: this.getMapData(mapName)
          },
          {
            type: 'graph',
            coordinateSystem: 'geo',
            data: [
              { name: '站点A', value: [116.40, 39.90] },
              { name: '站点B', value: [121.47, 31.23] },
              { name: '站点C', value: [113.27, 23.13] },
              { name: '站点D', value: [114.07, 22.62] }
            ],
            edges: [
              { source: '站点A', target: '站点B' },
              { source: '站点B', target: '站点C' },
              { source: '站点C', target: '站点D' }
            ],
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: 5,
            lineStyle: {
              color: '#409EFF',
              opacity: 0.6,
              curveness: 0.2
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{b}'
            }
          }
        ]
      }
      this.chart.setOption(option, true)
    },

    getMapData(mapName) {
      // 这里应该根据当前地图级别返回对应的数据
      // 演示：从 registeredMap 的 features 中提取 id 和 name
      const map = echarts.getMap(mapName)
      if (!map) return []
      return map.geoJson.features.map(f => ({
        name: f.properties.name,
        id: f.properties.id || f.properties.adcode
      }))
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
}
.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
}
</style>
