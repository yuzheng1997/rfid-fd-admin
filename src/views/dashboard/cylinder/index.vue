<template>
  <div class="dashboard-container">
    <div class="dashboard-editor-container">
      <!-- 1. 关键指标卡片 -->
      <panel-group />

      <!-- 2. 中间区域：加气趋势与状态分布 -->
      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :lg="16">
          <div class="chart-wrapper">
            <line-chart :chart-data="lineChartData" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <pie-chart :data="pieChartData" title="气瓶状态分布" series-name="状态分布" />
          </div>
        </el-col>
      </el-row>

      <!-- 3. 底部区域：地图分布与预警列表/操作日志 -->
      <el-row :gutter="32">
        <!-- 地理分布 -->
        <el-col :xs="24" :sm="24" :lg="16">
          <div class="chart-wrapper" style="height: 800px; padding: 16px;">
            <map-chart height="750px" />
          </div>
        </el-col>
        <!-- 右侧两块 -->
        <el-col :xs="24" :sm="24" :lg="8">
          <!-- 过期提醒 -->
          <expiration-table />
          <!-- 操作日志 -->
          <operation-log />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import PanelGroup from './PanelGroup'
import LineChart from '../LineChart'
import PieChart from '@/components/Echarts/PieChart'
import ExpirationTable from './ExpirationTable'
import OperationLog from './OperationLog'
import MapChart from './MapChart'

export default {
  name: 'CylinderDashboard',
  components: {
    PanelGroup,
    LineChart,
    PieChart,
    ExpirationTable,
    OperationLog,
    MapChart
  },
  data() {
    return {
      lineChartData: {
        expectedData: [28500, 31000, 29800, 32500, 27400, 32500, 34000]
      },
      pieChartData: [
        { value: 8420, name: '正常' },
        { value: 1200, name: '充气中' },
        { value: 2640, name: '运输中' },
        { value: 240, name: '故障' },
        { value: 100, name: '待报废' }
      ]
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-container {
  background-color: rgb(240, 242, 245);
  padding: 32px;
  min-height: calc(100vh - 84px);
}

.dashboard-editor-container {
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
