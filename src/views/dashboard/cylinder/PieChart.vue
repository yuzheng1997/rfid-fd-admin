<template>

  <div class="box-card" shadow="never">
    <div class="clearfix">
      <span style="font-weight: bold; color: #f56c6c;">气瓶状态分布</span>
    </div>
    <div ref="chartRef" class="chart-wrapper" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme

import resize from '../mixins/resize'
import { statusPie } from '@/api/dashboard/index'

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
      default: '100%'
    },
    title: {
      type: String,
      default: ''
    },
    seriesName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chart: null,
      chartData: []
    }
  },
  mounted() {
    statusPie().then(res => {
      if (res) {
        this.chartData = res
        this.setOptions(res)
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
      this.setOptions(this.chartData)
    },
    setOptions(data) {
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: data.map(i => i.name)
        },
        calculable: true,

        series: [
          {

            name: this.seriesName,
            type: 'pie',
            radius: [30, 110],
            label: {
              show: true,
              formatter: '{b}: {c} ({d}%)' // 展示具体数值和百分比，增加可读性
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            data: data,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
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
    height: 100%;
  }
}
</style>
