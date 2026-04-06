<template>
  <div class="map-container">

    <div ref="mapChart" :style="{height:height,width:width}" />
    <el-button
      v-if="mapStack.length > 1"
      size="mini"
      type="primary"
      icon="el-icon-back"
      class="back-btn"
      @click="goBack"
    >返回上级</el-button>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '../mixins/resize'
import { fetchGeoJSON, fetchLocationSimplified } from '@/api/geojson'

// 模拟数据 - 使用 adcode 作为 key
const mockData = {
  // 中国省级数据
  china: [
    { adcode: '110000', value: 15000 },
    { adcode: '120000', value: 8000 },
    { adcode: '130000', value: 25000 },
    { adcode: '140000', value: 12000 },
    { adcode: '150000', value: 9000 },
    { adcode: '210000', value: 11000 },
    { adcode: '220000', value: 7000 },
    { adcode: '230000', value: 8500 },
    { adcode: '310000', value: 13000 },
    { adcode: '320000', value: 28000 },
    { adcode: '330000', value: 22000 },
    { adcode: '340000', value: 14000 },
    { adcode: '350000', value: 10000 },
    { adcode: '360000', value: 9500 },
    { adcode: '370000', value: 30000 },
    { adcode: '410000', value: 26000 },
    { adcode: '420000', value: 16000 },
    { adcode: '430000', value: 15000 },
    { adcode: '440000', value: 35000 },
    { adcode: '450000', value: 11000 },
    { adcode: '460000', value: 5000 },
    { adcode: '500000', value: 12000 },
    { adcode: '510000', value: 20000 },
    { adcode: '520000', value: 8000 },
    { adcode: '530000', value: 9000 },
    { adcode: '540000', value: 2000 },
    { adcode: '610000', value: 13000 },
    { adcode: '620000', value: 6000 },
    { adcode: '630000', value: 3000 },
    { adcode: '640000', value: 4000 },
    { adcode: '650000', value: 7000 },
    { adcode: '710000', value: 0 },
    { adcode: '810000', value: 0 },
    { adcode: '820000', value: 0 }
  ],
  // 北京市级数据（区县）
  '110000': [
    { adcode: '110101', value: 1200 },
    { adcode: '110102', value: 1100 },
    { adcode: '110105', value: 2500 },
    { adcode: '110106', value: 1800 },
    { adcode: '110107', value: 800 },
    { adcode: '110108', value: 2200 },
    { adcode: '110109', value: 500 },
    { adcode: '110111', value: 900 },
    { adcode: '110112', value: 1500 },
    { adcode: '110113', value: 1100 },
    { adcode: '110114', value: 1400 },
    { adcode: '110115', value: 1600 },
    { adcode: '110116', value: 400 },
    { adcode: '110117', value: 350 },
    { adcode: '110118', value: 300 },
    { adcode: '110119', value: 250 }
  ],
  // 河北省市级数据
  '130000': [
    { adcode: '130100', value: 3500 },
    { adcode: '130200', value: 2800 },
    { adcode: '130300', value: 1200 },
    { adcode: '130400', value: 2200 },
    { adcode: '130500', value: 1800 },
    { adcode: '130600', value: 2500 },
    { adcode: '130700', value: 1400 },
    { adcode: '130800', value: 900 },
    { adcode: '130900', value: 2000 },
    { adcode: '131000', value: 1600 },
    { adcode: '131100', value: 1100 }
  ]
}

export default {
  mixins: [resize],
  props: {

    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '700px'
    },
    // 外部传入的数据，格式: [{ name: '区域名', value: 数量 }]
    chartData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null,
      mapStack: [],
      currentMapName: 'china',
      registeredMaps: new Set(),
      locationData: null
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
    convertData(data) {
      // 从简化版 location 数据中直接获取各区域的中心点坐标
      if (!this.locationData) return []

      return data.map(item => {
        const center = this.locationData[item.adcode]
        if (center) {
          return {
            name: item.name,
            value: [...center, item.value]
          }
        }
      }).filter(Boolean)
    },
    async initChart() {
      this.chart = echarts.init(this.$refs.mapChart, 'macarons')

      // 获取简化版 location 数据（直接是 adcode -> center 的映射）
      try {
        this.locationData = await fetchLocationSimplified()
      } catch (error) {
        console.error('Failed to load location data:', error)
      }

      // 初始加载中国地图
      await this.loadAndRegisterMap('china', '/map/china.json')
      this.renderMap('china')

      // 点击下钻
      this.chart.on('click', (params) => {
        // geo 组件点击或 series map 点击
        if (params.componentType === 'geo') {
          // geo 组件点击，params.name 是区域名称
          const adcode = this.getAdcodeByName(this.currentMapName, params.name)
          if (adcode) {
            this.drillDown(adcode, params.name)
          }
        } else if (params.componentType === 'series' && params.seriesType === 'map') {
          const { adcode, name } = params.data
          if (adcode) {
            this.drillDown(adcode, name)
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

    async drillDown(adcode, name) {
      // adcode 为行政区划代码，6位数字字符串
      // 省级: 后4位为0000，如 130000
      // 市级: 后2位为00，如 130100
      // 区县级: 完整6位，如 130102
      const code = String(adcode)
      let url = ''
      const mapName = code

      if (code.endsWith('0000')) {
        // 省级下钻到市级
        url = `/map/province/${code}.json`
      } else if (code.endsWith('00')) {
        // 市级下钻到县级
        url = `/map/citys/${code}.json`
      } else {
        return // 区县级，不支持进一步下钻
      }

      await this.loadAndRegisterMap(mapName, url)
      this.renderMap(mapName)
    },

    goBack() {
      if (this.mapStack.length > 1) {
        this.mapStack.pop() // 弹出当前的
        const prev = this.mapStack[this.mapStack.length - 1] // 获取上一个（不弹出）
        this.renderMap(prev.mapName, false)
      }
    },

    renderMap(mapName, pushStack = true) {
      if (pushStack) {
        this.mapStack.push({ mapName })
      }
      this.currentMapName = mapName

      const data = this.getMapData(mapName)
      const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value || 0)) : 100
      const minValue = data.length > 0 ? Math.min(...data.map(d => d.value || 0)) : 0

      // 气泡大小配置
      const maxSize4Pin = 80
      const minSize4Pin = 30

      const option = {
        title: {
          text: '气瓶地理分布',
          left: 'center',
          top: 20
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            if (params.data) {
              let value = params.data.value
              // scatter 的 value 是 [lng, lat, 气瓶数量] 数组
              if (params.seriesType === 'scatter' && Array.isArray(value)) {
                value = value[2] // 取第三个元素（气瓶数量）
              }
              return `${params.name}<br/>气瓶数量: ${value || 0}`
            }
            return params.name
          }
        },
        visualMap: {
          min: 0,
          max: maxValue,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true,
          seriesIndex: [0],
          inRange: {
            color: ['#E0F3DB', '#7FCDBB', '#41B6C4', '#2C7FB8', '#253494']
          }
        },
        geo: {
          show: true,
          map: mapName,
          roam: true

        },
        series: [
          {
            type: 'map',
            map: mapName,
            geoIndex: 0,
            aspectScale: 0.75, // 长宽比
            showLegendSymbol: false, // 存在legend时显示
            data: data,
            label: {
              normal: {
                show: true
              },
              emphasis: {
                show: false,
                textStyle: {
                  color: '#fff'
                }
              }
            },
            roam: true,
            itemStyle: {
              normal: {
                areaColor: '#031525',
                borderColor: '#3B5077'
              },
              emphasis: {
                areaColor: '#2B91B7'
              }
            }
          },
          {
            symbolSize: 10,
            label: {
              normal: {
                formatter: '{b}',
                position: 'left',
                color: '#fff',
                show: true
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              normal: {
                color: '#fff',
                borderColor: '#fff',
                borderWidth: 4
              },
              emphasis: {
                color: '#fff',
                borderColor: '#fff',
                borderWidth: 4
              }
            },
            name: 'light',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: this.convertData(data)
          },
          {
            name: '点',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbol: 'pin',
            symbolSize: function(val) {
              const a = (maxSize4Pin - minSize4Pin) / (maxValue - minValue)
              const b = minSize4Pin - a * minValue
              return a * val[2] + b
            },
            itemStyle: {
              normal: {
                color: '#F62157' // 标志颜色
              }
            },
            label: {
              normal: {
                formatter: function(obj) {
                  return obj.data.value[2]
                },
                show: true,
                textStyle: {
                  color: '#fff',
                  fontSize: 9
                }
              }
            },
            zlevel: 6,
            data: this.convertData(data)
          }
        ]
      }
      this.chart.setOption(option, true)
    },

    getMapData(mapName) {
      // 从 registeredMap 的 features 中提取 adcode 和 name
      const map = echarts.getMap(mapName)
      if (!map) return []

      // 获取数据源：优先使用外部数据，其次使用模拟数据
      const dataSource = this.chartData.length > 0 ? this.chartData : (mockData[mapName] || mockData.china)

      // 创建 adcode 到数据的映射
      const dataMap = {}
      dataSource.forEach(item => {
        dataMap[item.adcode] = item.value
      })

      // 合并地图数据
      return map.geoJson.features.map(f => ({
        name: f.properties.name,
        adcode: f.properties.adcode,
        value: dataMap[f.properties.adcode] || 0
      }))
    },

    getAdcodeByName(mapName, name) {
      const map = echarts.getMap(mapName)
      if (!map) return null
      const feature = map.geoJson.features.find(f => f.properties.name === name)
      return feature ? feature.properties.adcode : null
    },

    // 刷新图表数据（供外部调用）
    refreshData() {
      this.renderMap(this.currentMapName, false)
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
}
</style>
