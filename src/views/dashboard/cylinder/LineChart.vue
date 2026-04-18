<template>
  <div class="box-card" shadow="never">
    <div class="clearfix">
      <span style="font-weight: bold; color: #f56c6c;">加气趋势</span>
    </div>
    <div ref="chartRef" class="chart-wrapper" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '../mixins/resize'
import { trendFill } from '@/api/dashboard/index'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },

    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        data: [],
        xData: []
      }
    }
  },

  mounted() {
    trendFill().then(res => {
      if (res) {
        const data = []
        const xData = []
        ;(res).forEach(element => {
          data.push(element.value)
          xData.push(element.date)
        })
        this.setOptions({ data, xData })
      }
    }).catch(() => {
      console.log('获取数据失败')
    })
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
    initChart() {
      this.chart = echarts.init(this.$refs.chartRef, 'macarons')
      if (this.chartData.data && this.chartData.data.length > 0) {
        this.setOptions(this.chartData)
      }
    },
    setOptions({ data, xData } = {}) {
      this.chart.setOption({
        xAxis: {
          type: 'category',
          data: xData

        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        series: [{
          name: '充气数', itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
                width: 2
              }
            }
          },
          smooth: true,
          type: 'line',
          data: data,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        }]
      })
    }
  }
}
</script>
<style lang="scss">
.box-card {
  height: 100%;
  display: flex;
  background: #fff;
  flex-direction: column;
  .clearfix {
    padding: 0 20px;
    height: 45px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f2f5;
  }
  .chart-wrapper {
    flex: 1;
  }
}
</style>
