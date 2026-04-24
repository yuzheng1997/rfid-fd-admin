<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.code"
          clearable
          size="small"
          placeholder="输入编号搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <!-- <date-range-picker v-model="query.manufactureDate" class="date-item" /> -->
        <el-select
          v-model="query.currentStatus"
          clearable
          size="small"
          placeholder="状态筛选"
          class="filter-item"
          style="width: 120px"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in cylinderStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <rrOperation />
      </div>
      <crudOperation v-permission="['admin','cylinder:import']">
        <el-upload
          slot="right"
          :action="cylinderUploadApi"
          :headers="headers"
          :show-file-list="false"
          accept=".xlsx,.xls"
          :on-success="handleSuccess"
          class="upload-demo"
        >
          <el-button

            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-upload2"
          >导入
          </el-button>
        </el-upload>

      </crudOperation>
    </div>
    <!-- 详情抽屉 -->

    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;">

      <!-- <el-table-column type="selection" width="55" /> -->
      <el-table-column prop="qrcode" label="编号" />
      <el-table-column prop="createTime" label="制造时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="model" label="气瓶型号" /> -->
      <el-table-column prop="currentCompanyName" label="所属企业" />

      <el-table-column prop="manufacturerName" label="制造商" />
      <el-table-column prop="spec" label="规格" />
      <el-table-column prop="currentStatus" label="当前状态">
        <template slot-scope="scope">
          {{ getCylinderStatusLabel(scope.row.currentStatus) }}
        </template>
      </el-table-column>
      <el-table-column prop="nextInspectionDate" label="年检日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.nextInspectionDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="showDetail(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />

    <el-drawer
      title="气瓶详情"
      :visible.sync="detailDrawer"
      direction="rtl"
      size="600px"
      append-to-body
    >
      <div style="padding: 0 20px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-card class="box-card" shadow="never" style="margin-bottom: 20px">
              <div slot="header" class="clearfix">
                <span>制造信息</span>
              </div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="制造唯一性编号">{{ detailData.code }}</el-descriptions-item>
                <el-descriptions-item label="生产日期">
                  {{ parseTime(detailData.manufactureDate, '{y}-{m}-{d}') }}
                </el-descriptions-item>
                <el-descriptions-item label="生产批号">{{ detailData.batchNo }}</el-descriptions-item>
                <el-descriptions-item label="气瓶型号">{{ detailData.spec }}</el-descriptions-item>
                <el-descriptions-item label="公称水容积">{{ detailData.volume }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card class="box-card" shadow="never" style="margin-bottom: 20px">
              <div slot="header" class="clearfix">
                <span>年检/报废提醒</span>
              </div>
              <el-alert
                v-if="detailData.nextInspectionDate"
                :title="'下次年检时间：' + parseTime(detailData.nextInspectionDate, '{y}-{m}-{d}')"
                type="warning"
                :closable="false"
                show-icon
                style="margin-bottom: 10px"
              />
              <el-alert
                v-if="detailData.scrappedDate"
                :title="'报废日期：' + parseTime(detailData.scrappedDate, '{y}-{m}-{d}')"
                type="error"
                :closable="false"
                show-icon
              />
              <div v-if="!detailData.nextInspectionDate && !detailData.scrappedDate" style="color: #909399; text-align: center; padding: 10px 0;">
                暂无提醒信息
              </div>
            </el-card>

            <el-card class="box-card" shadow="never">
              <div slot="header" class="clearfix">
                <span>所属用户</span>
              </div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="当前归属">{{ detailData.currentCompanyName || '无' }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-tab-pane>

          <!-- <el-tab-pane label="操作记录" name="history">
            <el-table :data="historyList" size="small" border style="width: 100%">
              <el-table-column prop="manufactureDate" label="操作时间" width="160" />
              <el-table-column prop="operator" label="操作人" width="100" />
              <el-table-column prop="operation" label="操作内容" />
            </el-table>
          </el-tab-pane> -->

          <el-tab-pane label="状态变更" name="timeline">
            <div style="padding: 20px">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in timelineList"
                  :key="index"
                  :timestamp="activity.eventTime"
                >
                  <div>{{ `操作员： ${activity.operatorName} ` }}</div>
                  <div style="margin-top: 4px;">{{ `操作内容： ${activity.remark}` }}</div>

                </el-timeline-item>
              </el-timeline>
              <div v-if="timelineList.length === 0" style="color: #909399; text-align: center; padding: 20px 0;">
                暂无状态变更记录
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { cylinderTrace } from '@/api/cylinder'
import CRUD, { crud, form, header, presenter } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import rrOperation from '@crud/RR.operation'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'

const defaultForm = {
  id: null,
  code: null,
  productNumber: null,
  spec: null,
  manufactureDate: null,
  productionBatch: null,
  designLife: null,
  model: null,
  nominalVolume: null,
  currentCompanyName: null,
  nextInspectionDate: null,
  scrappedDate: null,
  status: null,
  fillingCount: 0,
  isNormal: true,
  statusDescription: null
}

const CYLINDER_STATUS_MAP = {
  PRODUCED: '已建档',
  IN_STOCK: '在库',
  TRANSIT: '运输/流转中',
  WAIT_INSPECT: '待检',
  SCRAP: '已报废',
  FAULT: '故障'
}
export default {
  name: 'Cylinder',
  components: { pagination, crudOperation, rrOperation },
  cruds() {
    return CRUD({
      title: '气瓶',
      url: '/api/admin/cylinder/page',
      method: 'post',
      optShow: { add: false, edit: false, del: false, download: false, reset: true }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['cylinder_status', 'cylinder_type'],
  data() {
    return {
      headers: {
        Authorization: getToken()
      },
      detailDrawer: false,
      activeTab: 'basic',
      detailData: {},
      historyList: [],
      timelineList: [],
      permission: {
      },
      rules: {
        code: [
          { required: true, message: '制造唯一性编号不能为空', trigger: 'blur' }
        ],
        manufactureDate: [
          { required: true, message: '制造日期不能为空', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '气瓶型号不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    cylinderStatusOptions() {
      return Object.keys(CYLINDER_STATUS_MAP).map(key => ({
        value: key,
        label: CYLINDER_STATUS_MAP[key]
      }))
    },
    ...mapGetters(['cylinderUploadApi'])
  },
  methods: {
    getCylinderStatusLabel(status) {
      return CYLINDER_STATUS_MAP[status] || this.dict.label.cylinder_status[status] || status
    },
    showDetail(row) {
      this.detailDrawer = true
      this.activeTab = 'basic'
      cylinderTrace(row.id).then(res => {
        this.detailData = res
        this.errorInfo = res.exception
        this.timelineList = res.timeline
      })

      // 模拟获取时间线
    },
    triggerUpload() {
      this.$refs.uploadRef.click()
    },
    handleSuccess(res) {
      if (res.code !== 200) {
        return this.$message({
          message: res.message,
          type: 'error'
        })
      }
      this.$message({
        message: '导入成功',
        type: 'success'
      })
      this.crud.toQuery()
    },
    // 钩子：在获取表格数据之前执行，如果有需要可以再此处理查询参数
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>
</style>
