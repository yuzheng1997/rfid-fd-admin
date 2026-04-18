<template>
  <div class="dashboard-container">
    <div class="dashboard-editor-container">
      <!-- 1. 关键指标卡片 -->
      <panel-group :is-refueling="isRefueling" />

      <el-row v-if="!isRefueling" style="display: flex;" :gutter="20">
        <el-col :xs="24" :sm="24" :lg="16">
          <map-chart height="500px" />
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <pie-chart title="气瓶状态分布" series-name="状态分布" />
          </div>
        </el-col>
      </el-row>

      <el-row v-if="isRefueling" style="display: flex;" :gutter="20">
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <line-chart />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <pie-chart title="气瓶状态分布" series-name="状态分布" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="8">
          <div class="chart-wrapper">
            <scan-record-table />
          </div>
        </el-col>
      </el-row>

    </div>
  </div>
</template>

<script>
import PieChart from './PieChart.vue'
import { mapGetters } from 'vuex'
import LineChart from './LineChart'
import ScanRecordTable from './ScanRecordTable'
import MapChart from './MapChart'
import PanelGroup from './PanelGroup'

export default {
  name: 'CylinderDashboard',
  components: {
    PanelGroup,
    LineChart,
    PieChart,
    ScanRecordTable,
    MapChart
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['roles']),
    isRefueling() {
      return this.roles.includes('dashboard:line')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-container {
  background-color: rgb(240, 242, 245);
  padding: 16px;
  min-height: calc(100vh - 84px);
}

.dashboard-editor-container {
  position: relative;

  .chart-wrapper {
    background: #fff;
    height: 100%;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
  }
}

</style>
