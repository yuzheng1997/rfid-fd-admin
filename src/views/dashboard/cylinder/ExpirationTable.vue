
<template>
  <div class="box-card" shadow="never">
    <div class="clearfix">
      <span style="font-weight: bold; color: #f56c6c;">操作记录列表</span>
    </div>
    <div class="table-wrapper">
      <el-table :data="list" pagination size="small" style="width: 100%">
        <el-table-column prop="cylinderCode" label="气瓶编号" width="140" />
        <el-table-column prop="scanType" label="操作类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getScanTypeTagType(scope.row.scanType)" size="mini">
              {{ getScanTypeName(scope.row.scanType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="scanTime" label="操作时间" width="140">
          <template slot-scope="scope">
            {{ formatDate(scope.row.scanTime) }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleDetail(scope.row)">查看</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
  </div>
</template>

<script>
import { scanRecordPage } from '@/api/dashboard/index'

export default {
  data() {
    return {
      list: []
    }
  },
  mounted() {
    this.loadScanRecords()
  },
  methods: {
    async loadScanRecords() {
      try {
        const res = await scanRecordPage({
          pageSize: 5
        })
        if (res) {
          this.list = res.records || []
        }
      } catch (error) {
        console.error('获取操作记录失败:', error)
      }
    },
    getScanTypeName(type) {
      const typeMap = {
        1: '查询',
        2: '出库',
        3: '入库',
        4: '充装',
        5: '年检'
      }
      return typeMap[type] || '未知'
    },
    getScanTypeTagType(type) {
      const typeMap = {
        1: 'info',
        2: 'warning',
        3: 'success',
        4: 'primary',
        5: 'danger'
      }
      return typeMap[type] || 'info'
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString()
    },
    handleDetail(row) {
      this.$message.info('查看操作记录详情: ' + row.cylinderCode)
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
  .table-wrapper {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }
}
</style>
