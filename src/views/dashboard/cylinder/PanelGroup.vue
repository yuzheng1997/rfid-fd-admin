<template>
  <el-row :gutter="20" class="panel-group">
    <!-- 第一行：气瓶状态指标（所有角色可见） -->
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-total">
          <svg-icon icon-class="index" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">气瓶总数</div>
          <count-to :start-val="0" :end-val="statistics.totalCount" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-in-stock">
          <svg-icon icon-class="database" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">在库气瓶</div>
          <count-to :start-val="0" :end-val="statistics.inStockCount" :duration="3000" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-outbound">
          <svg-icon icon-class="deploy" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">出库/流转中</div>
          <count-to :start-val="0" :end-val="statistics.flowingCount" :duration="3200" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-fault">
          <svg-icon icon-class="error" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">故障/待检</div>
          <count-to :start-val="0" :end-val="statistics.brokenCount" :duration="3600" class="card-panel-num" />
        </div>
      </div>
    </el-col>

    <template v-if="isRefueling">
      <!-- 加气统计指标（仅充气商角色可见） -->
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-history">
            <svg-icon icon-class="chart" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">历史加气总次数</div>
            <count-to :start-val="0" :end-val="statistics.totalFillCount" :duration="2600" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-today">
            <svg-icon icon-class="date" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">当日加气次数</div>
            <count-to :start-val="0" :end-val="statistics.todayFillCount" :duration="3000" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-month">
            <svg-icon icon-class="log" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">本月加气次数</div>
            <count-to :start-val="0" :end-val="statistics.monthFillCount" :duration="3200" class="card-panel-num" />
          </div>
        </div>
      </el-col>
    </template>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'
import { mapGetters } from 'vuex'
import { getIndicatorCards } from '@/api/dashboard/index'

export default {
  components: {
    CountTo
  },
  props: {
    isRefueling: {
      type: Boolean
    }
  },
  data() {
    return {
      statistics: {
        totalCount: 0,
        inStockCount: 0,
        flowingCount: 0,
        brokenCount: 0,
        expiringCount: 0,
        criticalOverdueCount: 0,
        sleepingCount: 0,
        totalFillCount: 0,
        todayFillCount: 0,
        monthFillCount: 0
      }
    }
  },
  computed: {
    ...mapGetters(['roles']),
    userRole() {
      if (this.roles.includes('ROLE_ADMIN')) return 'admin'
      if (this.roles.includes('RETAILER')) return 'refueling'
      if (this.roles.includes('DISTRIBUTOR')) return 'distributor'
      return 'manufacturer' // Default
    },
    showRefuelingMetrics() {
      // Show refueling metrics only for refueling stations and admins
      return this.userRole === 'refueling' || this.userRole === 'admin'
    }
  },
  mounted() {
    this.loadStatistics()
  },
  methods: {
    async loadStatistics() {
      try {
        const res = await getIndicatorCards()
        if (res) {
          this.statistics = {
            totalCount: res.totalCount || 0,
            inStockCount: res.inStockCount || 0,
            flowingCount: res.flowingCount || 0,
            brokenCount: res.brokenCount || 0,
            expiringCount: res.expiringCount || 0,
            criticalOverdueCount: res.criticalOverdueCount || 0,
            sleepingCount: res.sleepingCount || 0,
            totalFillCount: res.totalFillCount || 0,
            todayFillCount: res.todayFillCount || 0,
            monthFillCount: res.monthFillCount || 0
          }
        }
      } catch (error) {
        console.error('Failed to load statistics:', error)
        // Keep using default values if API fails
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-total {
        background: #40c9c6;
      }

      .icon-in-stock {
        background: #36a3f7;
      }

      .icon-outbound {
        background: #f4516c;
      }

      .icon-fault {
        background: #34bfa3;
      }

      .icon-expiration {
        background: #e6a23c;
      }

      .icon-history {
        background: #7266ba;
      }

      .icon-today {
        background: #f6d365;
      }

      .icon-month {
        background: #23b7e5;
      }
    }

    .icon-total { color: #40c9c6; }
    .icon-in-stock { color: #36a3f7; }
    .icon-outbound { color: #f4516c; }
    .icon-fault { color: #34bfa3; }
    .icon-expiration { color: #e6a23c; }
    .icon-history { color: #7266ba; }
    .icon-today { color: #f6d365; }
    .icon-month { color: #23b7e5; }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
