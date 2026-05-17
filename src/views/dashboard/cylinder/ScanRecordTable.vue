
<template>
  <div class="box-card" shadow="never">
    <div class="clearfix">
      <span style="font-weight: bold; color: #f56c6c;">操作记录列表</span>
    </div>
    <div ref="tableWrapper" class="table-wrapper">
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" :height="tableHeight" size="small" style="width: 100%">
        <el-table-column prop="cylinderCode" label="气瓶编号" width="140" />
        <el-table-column prop="scanType" label="操作类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getScanTypeTagType(scope.row.scanType)" size="mini">
              {{ scope.row.scanTypeName || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="scanTime" label="操作时间" width="160">
          <template slot-scope="scope">
            {{ formatDate(scope.row.scanTime) }}
          </template>
        </el-table-column>
      </el-table>
      <div ref="paginationWrapper" class="pagination-wrapper">
        <pagination />
      </div>
    </div>
  </div>
</template>

<script>
import CRUD, { presenter } from '@crud/crud'
import pagination from '@crud/Pagination'

const SCAN_TYPE_TAG_MAP = {
  0: 'info',
  1: 'success',
  2: 'warning',
  3: 'danger',
  4: 'info',
  5: 'danger'
}

export default {
  name: 'ScanRecordTable',
  components: { pagination },
  mixins: [presenter()],
  data() {
    return {
      tableHeight: 240
    }
  },
  cruds() {
    return CRUD({
      title: '操作记录',
      url: '/api/admin/scan-record/page',
      method: 'post'
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTableHeight()
      window.addEventListener('resize', this.updateTableHeight)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateTableHeight)
  },
  methods: {
    updateTableHeight() {
      this.$nextTick(() => {
        const tableWrapper = this.$refs.tableWrapper
        const paginationWrapper = this.$refs.paginationWrapper
        if (!tableWrapper || !paginationWrapper) return
        const height = tableWrapper.clientHeight - paginationWrapper.offsetHeight - 8
        this.tableHeight = height > 120 ? height : 120
      })
    },
    [CRUD.HOOK.afterRefresh]() {
      this.updateTableHeight()
    },
    getScanTypeTagType(type) {
      return SCAN_TYPE_TAG_MAP[type] || 'info'
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString()
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
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .pagination-wrapper {
    flex-shrink: 0;
    padding-top: 8px;
  }
}
</style>
