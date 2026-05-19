<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input
          v-model="query.qrcode"
          clearable
          size="small"
          placeholder="气瓶编号"
          style="width: 160px"
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
          v-model="query.operation"
          clearable
          size="small"
          placeholder="操作类型"
          class="filter-item"
          style="width: 120px"
        >
          <el-option label="入库" value="IN" />
          <el-option label="加气" value="INFLATE" />
          <el-option label="年检" value="INSPECTION" />
          <el-option label="出库" value="OUT" />
          <el-option label="生产入库" value="PRODUCE" />
          <el-option label="维修" value="REPAIR" />
          <el-option label="报废" value="SCRAP" />
        </el-select>

        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>

    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%">
      <!-- <el-table-column prop="id" label="ID" width="80" /> -->
      <el-table-column label="气瓶编号" min-width="160">
        <template slot-scope="scope">
          <el-link type="primary" @click="showDetail(scope.row)">
            {{ getCylinderCode(scope.row) }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="operationName" label="操作类型">
        <template slot-scope="scope">
          <el-tag :type="getOperationTagType(scope.row.operation)" size="mini">
            {{ scope.row.operationName || getOperationName(scope.row.operation) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="操作时间" />
      <el-table-column prop="username" label="操作人" />
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="showDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination />

    <el-drawer title="扫描记录详情" :visible.sync="detailDrawer" direction="rtl" size="650px" append-to-body>
      <div style="padding: 20px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="单次操作详情" name="basic">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="气瓶编号">
                {{ getCylinderCode(detailData) }}
              </el-descriptions-item>
              <el-descriptions-item label="操作类型">
                {{ detailData.operationName || getOperationName(detailData.operation) }}
              </el-descriptions-item>
              <el-descriptions-item label="操作时间">
                {{ detailData.createTime || '-' }}
              </el-descriptions-item>
              <el-descriptions-item v-if="getFromCompanyName(detailData)" label="来源企业">
                {{ getFromCompanyName(detailData) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="hasCompanyName(detailData)" label="去向企业">
                {{ getCompanyName(detailData) }}
              </el-descriptions-item>
              <el-descriptions-item label="操作人">
                {{ detailData.username || '-' }}
              </el-descriptions-item>
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
      url: 'api/admin/log/operation/page',
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
    getCylinderCode(row) {
      return row && row.cylinderInfo && row.cylinderInfo.code ? row.cylinderInfo.code : '-'
    },
    getCompanyName(row) {
      return row && row.cylinderInfo && row.cylinderInfo.toCompanyName ? row.cylinderInfo.toCompanyName : '-'
    },
    getFromCompanyName(row) {
      return row && row.cylinderInfo && row.cylinderInfo.fromCompanyName ? row.cylinderInfo.fromCompanyName : ''
    },
    hasCompanyName(row) {
      return !!(row && row.cylinderInfo && row.cylinderInfo.toCompanyName)
    },
    getOperationName(type) {
      const typeMap = {
        IN: '入库',
        INFLATE: '加气',
        INSPECTION: '年检',
        OUT: '出库',
        PRODUCE: '生产入库',
        REPAIR: '维修',
        SCRAP: '报废'
      }
      return typeMap[type] || '-'
    },
    getOperationTagType(type) {
      const typeMap = {
        IN: 'success',
        INFLATE: 'primary',
        INSPECTION: 'warning',
        OUT: 'info',
        PRODUCE: 'primary',
        REPAIR: 'danger',
        SCRAP: 'danger'
      }
      return typeMap[type] || 'info'
    },
    [CRUD.HOOK.beforeRefresh]() {
      this.crud.params.targetType = 'CYLINDER'
      return true
    }
  }
}
</script>

<style scoped></style>
