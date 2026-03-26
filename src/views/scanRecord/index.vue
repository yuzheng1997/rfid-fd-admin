<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.rfid"
          clearable
          size="small"
          placeholder="输入RFID编号搜索"
          style="width: 180px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <date-range-picker v-model="query.createTime" class="date-item" />
        
        <!-- 操作类型筛选 -->
        <el-select
          v-model="query.operationType"
          clearable
          size="small"
          placeholder="操作类型"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.operation_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <!-- 账户类型筛选 -->
        <el-select
          v-model="query.accountType"
          clearable
          size="small"
          placeholder="账户类型"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option label="分销商" value="distributor" />
          <el-option label="加气站" value="station" />
        </el-select>

        <el-input
          v-model="query.accountName"
          clearable
          size="small"
          placeholder="具体账户名称"
          style="width: 150px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />

        <!-- 状态筛选 -->
        <el-select
          v-model="query.status"
          clearable
          size="small"
          placeholder="气瓶状态"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.cylinder_status"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <!-- 地理位置筛选 (省市区) -->
        <el-input
          v-model="query.location"
          clearable
          size="small"
          placeholder="搜索地点(省/市/区)"
          style="width: 180px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />

        <rrOperation />
      </div>
      <crudOperation :permission="permission">
        <template slot="right">
          <el-button
            class="filter-item"
            size="mini"
            type="warning"
            icon="el-icon-download"
            @click="crud.doExport"
          >导出Excel</el-button>
        </template>
      </crudOperation>
    </div>

    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="createTime" label="时间" width="160" />
      <el-table-column prop="operationType" label="操作类型" width="100">
        <template slot-scope="scope">
          {{ dict.label.operation_type[scope.row.operationType] }}
        </template>
      </el-table-column>
      <el-table-column prop="rfid" label="气瓶编号" width="150">
        <template slot-scope="scope">
          <el-link type="primary" @click="showDetail(scope.row)">{{ scope.row.rfid }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="cylinderType" label="气瓶品种" width="100" />
      <el-table-column prop="preStatus" label="操作前状态" width="100">
        <template slot-scope="scope">
          {{ dict.label.cylinder_status[scope.row.preStatus] }}
        </template>
      </el-table-column>
      <el-table-column prop="postStatus" label="操作后状态" width="100">
        <template slot-scope="scope">
          {{ dict.label.cylinder_status[scope.row.postStatus] }}
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100" />
      <el-table-column prop="organization" label="所属机构" width="150" />
      <el-table-column prop="location" label="地点" :show-overflow-tooltip="true" />
      <el-table-column v-if="checkPer(['admin','scanRecord:edit','scanRecord:del'])" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
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
              <el-descriptions-item label="操作时间">{{ detailData.createTime }}</el-descriptions-item>
              <el-descriptions-item label="操作类型">{{ dict.label.operation_type[detailData.operationType] }}</el-descriptions-item>
              <el-descriptions-item label="气瓶编号">{{ detailData.rfid }}</el-descriptions-item>
              <el-descriptions-item label="气瓶品种">{{ detailData.cylinderType }}</el-descriptions-item>
              <el-descriptions-item label="操作人">{{ detailData.operator }}</el-descriptions-item>
              <el-descriptions-item label="所属机构">{{ detailData.organization }}</el-descriptions-item>
              <el-descriptions-item label="操作地点">{{ detailData.location }}</el-descriptions-item>
              <el-descriptions-item label="GPS坐标">{{ detailData.gps || '116.404, 39.915' }}</el-descriptions-item>
              <el-descriptions-item label="状态变更">
                {{ dict.label.cylinder_status[detailData.preStatus] }} -> {{ dict.label.cylinder_status[detailData.postStatus] }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="气瓶历史操作" name="history">
            <el-table :data="historyList" size="small" border style="width: 100%">
              <el-table-column prop="createTime" label="时间" width="160" />
              <el-table-column prop="operation" label="操作内容" />
              <el-table-column prop="operator" label="操作人" width="100" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="状态变更时间线" name="timeline">
            <div style="padding: 20px">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in timelineList"
                  :key="index"
                  :timestamp="activity.timestamp"
                  :type="activity.type"
                  :color="activity.color"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </div>
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
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = { id: null, rfid: null, operationType: null, cylinderType: null, preStatus: null, postStatus: null, operator: null, organization: null, location: null, createTime: null }

export default {
  name: 'ScanRecord',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  cruds() {
    return CRUD({ title: '扫描记录', url: 'api/scanRecords', crudMethod: { ...crudScanRecord }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['operation_type', 'cylinder_status'],
  data() {
    return {
      detailDrawer: false,
      activeTab: 'basic',
      detailData: {},
      historyList: [],
      timelineList: [],
      permission: {
        add: ['admin', 'scanRecord:add'],
        edit: ['admin', 'scanRecord:edit'],
        del: ['admin', 'scanRecord:del']
      }
    }
  },
  mounted() {
    // 制造假数据用于测试
    const mockData = [
      {
        id: 1,
        createTime: '2026-03-23 15:45:12',
        operationType: 'outbound',
        rfid: 'RFID-2026-0005',
        cylinderType: 'LPG-C50',
        preStatus: '1',
        postStatus: '3',
        operator: '张三',
        organization: '城南分销中心',
        location: '北京市朝阳区大屯路',
        gps: '116.407, 40.002'
      },
      {
        id: 2,
        createTime: '2026-03-23 14:30:45',
        operationType: 'filling',
        rfid: 'RFID-2026-0002',
        cylinderType: 'LPG-C50',
        preStatus: '1',
        postStatus: '2',
        operator: '李四',
        organization: '河西加气站',
        location: '北京市海淀区中关村',
        gps: '116.310, 39.982'
      },
      {
        id: 3,
        createTime: '2026-03-23 11:20:10',
        operationType: 'anomaly',
        rfid: 'RFID-2026-0004',
        cylinderType: 'LPG-C50',
        preStatus: '1',
        postStatus: '4',
        operator: '王五',
        organization: '个人用户-张大勇',
        location: '北京市西城区月坛',
        gps: '116.345, 39.912'
      },
      {
        id: 4,
        createTime: '2026-03-23 09:15:33',
        operationType: 'inspection',
        rfid: 'RFID-2026-0001',
        cylinderType: 'LPG-C50',
        preStatus: '4',
        postStatus: '1',
        operator: '系统自动',
        organization: '检测中心',
        location: '北京市东城区安定门',
        gps: '116.411, 39.945'
      },
      {
        id: 5,
        createTime: '2026-03-22 17:50:22',
        operationType: 'inbound',
        rfid: 'RFID-2026-0006',
        cylinderType: 'CNG-D80',
        preStatus: '0',
        postStatus: '1',
        operator: '管理员',
        organization: '城东仓库',
        location: '北京市通州区北苑',
        gps: '116.638, 39.905'
      }
    ]
    this.crud.data = mockData
    this.crud.page.total = mockData.length
    this.crud.loading = false
  },
  methods: {
    showDetail(row) {
      this.detailData = row
      this.detailDrawer = true
      this.activeTab = 'basic'
      // 模拟获取历史记录
      this.historyList = [
        { createTime: '2026-03-23 10:00:00', operator: 'admin', operation: '新增记录' },
        { createTime: row.createTime, operator: row.operator, operation: '扫描操作: ' + row.operationType }
      ]
      // 模拟获取时间线
      this.timelineList = [
        { timestamp: row.createTime, content: '状态变更: ' + row.preStatus + ' -> ' + row.postStatus, type: 'primary', color: '#409EFF' },
        { timestamp: '2026-03-23 08:00:00', content: '初始状态: ' + row.preStatus, type: 'info' }
      ]
    }
  }
}
</script>

<style scoped>
</style>
