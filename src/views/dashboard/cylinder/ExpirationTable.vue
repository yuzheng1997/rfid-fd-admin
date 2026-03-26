<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="clearfix">
      <span style="font-weight: bold; color: #f56c6c;">即将过期提醒 (年检/报废)</span>
    </div>
    <el-table :data="list" size="small" style="width: 100%">
      <el-table-column prop="serialNumber" label="气瓶编号" width="120" />
      <el-table-column prop="type" label="类型" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type === '年检' ? 'warning' : 'danger'" size="mini">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="到期日期" width="100" />
      <el-table-column prop="days" label="剩余天数">
        <template slot-scope="scope">
          <span :style="{ color: scope.row.days <= 7 ? '#f56c6c' : '#e6a23c', fontWeight: 'bold' }">
            {{ scope.row.days }} 天
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleAction(scope.row)">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      list: [
        { serialNumber: 'GP-2026-0004', type: '年检', date: '2026-05-12', days: 50 },
        { serialNumber: 'GP-2023-0812', type: '报废', date: '2026-03-30', days: 7 },
        { serialNumber: 'GP-2024-1105', type: '年检', date: '2025-11-05', days: -138 },
        { serialNumber: 'GP-2026-1201', type: '年检', date: '2026-04-01', days: 9 },
        { serialNumber: 'GP-2022-0515', type: '报废', date: '2026-03-25', days: 2 }
      ]
    }
  },
  methods: {
    handleAction(row) {
      this.$message.info('跳转至气瓶处理流程: ' + row.serialNumber)
    }
  }
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
</style>
