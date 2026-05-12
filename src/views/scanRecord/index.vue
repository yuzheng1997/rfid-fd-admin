<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input
          v-model="query.cylinderCode"
          clearable
          size="small"
          placeholder="气瓶编号"
          style="width: 160px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-input
          v-model.number="query.userId"
          clearable
          size="small"
          placeholder="用户ID"
          style="width: 120px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <el-date-picker
          v-model="query.startTime"
          clearable
          size="small"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="开始时间"
          class="date-item"
        />
        <el-date-picker
          v-model="query.endTime"
          clearable
          size="small"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="结束时间"
          class="date-item"
        />
        <el-select
          v-model="query.scanType"
          clearable
          size="small"
          placeholder="扫描类型"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option label="查询" :value="1" />
          <el-option label="出库" :value="2" />
          <el-option label="入库" :value="3" />
          <el-option label="充装" :value="4" />
          <el-option label="年检" :value="5" />
        </el-select>

        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>

    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="scanTime" label="扫描时间" width="170" />
      <el-table-column prop="scanTypeName" label="扫描类型" width="110">
        <template slot-scope="scope">
          <el-tag :type="getScanTypeTagType(scope.row.scanType)" size="mini">
            {{ scope.row.scanTypeName || getScanTypeName(scope.row.scanType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cylinderCode" label="气瓶编号" min-width="160">
        <template slot-scope="scope">
          <el-link type="primary" @click="showDetail(scope.row)">{{ scope.row.cylinderCode || '-' }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="companyName" label="公司" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column prop="username" label="扫描人" width="120" />
      <el-table-column prop="companyId" label="公司ID" width="90" />
      <el-table-column prop="cylinderId" label="气瓶ID" width="90" />
      <el-table-column prop="userId" label="用户ID" width="90" />
    </el-table>

    <!--分页组件-->
    <pagination />

    <!-- 详情抽屉 -->
    <el-drawer
      title="扫描记录详情"
      :visible.sync="detailDrawer"
      direction="rtl"
      size="650px"
      append-to-body
    >
      <div style="padding: 20px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="单次操作详情" name="basic">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="记录ID">{{ detailData.id || '-' }}</el-descriptions-item>
              <el-descriptions-item label="扫描时间">{{ detailData.scanTime || '-' }}</el-descriptions-item>
              <el-descriptions-item label="扫描类型">{{ detailData.scanTypeName || getScanTypeName(detailData.scanType) }}</el-descriptions-item>
              <el-descriptions-item label="气瓶编号">{{ detailData.cylinderCode || '-' }}</el-descriptions-item>
              <el-descriptions-item label="气瓶ID">{{ detailData.cylinderId || '-' }}</el-descriptions-item>
              <el-descriptions-item label="公司">{{ detailData.companyName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="公司ID">{{ detailData.companyId || '-' }}</el-descriptions-item>
              <el-descriptions-item label="扫描人">{{ detailData.username || '-' }}</el-descriptions-item>
              <el-descriptions-item label="用户ID">{{ detailData.userId || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import crudScanRecord from '@/api/scanRecord'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {}

export default {
  name: 'ScanRecord',
  components: { pagination, crudOperation, rrOperation },
  cruds() {
    return CRUD({
      title: '扫描记录',
      url: 'api/admin/log/scan/page',
      method: 'post',
      crudMethod: { ...crudScanRecord },
      optShow: {
        add: false,
        edit: false,
        del: false,
        download: false,
        reset: true
      }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      detailDrawer: false,
      activeTab: 'basic',
      detailData: {},
      permission: {
        add: ['admin', 'scanRecord:add'],
        edit: ['admin', 'scanRecord:edit'],
        del: ['admin', 'scanRecord:del']
      }
    }
  },
  methods: {
    showDetail(row) {
      this.detailData = row
      this.detailDrawer = true
      this.activeTab = 'basic'
    },
    getScanTypeName(type) {
      const typeMap = {
        1: '查询',
        2: '出库',
        3: '入库',
        4: '充装',
        5: '年检'
      }
      return typeMap[type] || '-'
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
    }
  }
}
</script>

<style scoped>
</style>
