<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.blurry"
          clearable
          size="small"
          placeholder="输入编号或型号搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <el-select
          v-model="query.status"
          clearable
          size="small"
          placeholder="状态筛选"
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
        <el-select
          v-model="query.type"
          clearable
          size="small"
          placeholder="气瓶品种筛选"
          class="filter-item"
          style="width: 140px"
          @change="crud.toQuery"
        >
          <el-option
            v-for="item in dict.cylinder_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表单渲染-->
    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="580px">
      <el-form ref="form" :inline="true" :model="form" :rules="rules" size="small" label-width="120px">
        <el-form-item label="制造唯一性编号" prop="serialNumber">
          <el-input v-model="form.serialNumber" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="制造年份+月份" prop="manufacturingDate">
          <el-date-picker v-model="form.manufacturingDate" type="month" style="width: 370px;" placeholder="选择年月" />
        </el-form-item>
        <el-form-item label="气瓶型号" prop="model">
          <el-input v-model="form.model" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="当前归属用户" prop="owner">
          <el-input v-model="form.owner" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="当前状态" prop="status">
          <el-select v-model="form.status" style="width: 370px;" placeholder="请选择状态">
            <el-option
              v-for="item in dict.cylinder_status"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="充气计数" prop="fillingCount">
          <el-input-number v-model.number="form.fillingCount" :min="0" style="width: 370px;" />
        </el-form-item>
        <el-form-item label="是否正常使用" prop="isNormal">
          <el-radio-group v-model="form.isNormal" style="width: 370px;">
            <el-radio :label="true">正常</el-radio>
            <el-radio :label="false">异常</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态描述" prop="statusDescription">
          <el-input v-model="form.statusDescription" type="textarea" style="width: 370px;" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <!-- 详情抽屉 -->
    <el-drawer
      title="气瓶详情"
      :visible.sync="detailDrawer"
      direction="rtl"
      size="600px"
      append-to-body
    >
      <div style="padding: 20px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-card class="box-card" shadow="never" style="margin-bottom: 20px">
              <div slot="header" class="clearfix">
                <span>制造信息</span>
              </div>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="制造唯一性编号">{{ detailData.serialNumber }}</el-descriptions-item>
                <el-descriptions-item label="产品序号">{{ detailData.productNumber }}</el-descriptions-item>
                <el-descriptions-item label="气瓶品种码">{{ detailData.cylinderTypeCode }}</el-descriptions-item>
                <el-descriptions-item label="制造年份+月份">
                  {{ parseTime(detailData.manufacturingDate, '{y}-{m}') }}
                </el-descriptions-item>
                <el-descriptions-item label="生产批号">{{ detailData.productionBatch }}</el-descriptions-item>
                <el-descriptions-item label="设计使用年限">{{ detailData.designLife }}</el-descriptions-item>
                <el-descriptions-item label="气瓶型号">{{ detailData.model }}</el-descriptions-item>
                <el-descriptions-item label="公称水容积">{{ detailData.nominalVolume }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card class="box-card" shadow="never" style="margin-bottom: 20px">
              <div slot="header" class="clearfix">
                <span>所属用户信息</span>
              </div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="当前归属">{{ detailData.owner || '无' }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-card class="box-card" shadow="never">
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
          </el-tab-pane>

          <el-tab-pane label="操作记录" name="history">
            <el-table :data="historyList" size="small" border style="width: 100%">
              <el-table-column prop="createTime" label="操作时间" width="160" />
              <el-table-column prop="operator" label="操作人" width="100" />
              <el-table-column prop="operation" label="操作内容" />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="状态变更" name="timeline">
            <div style="padding: 20px">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in timelineList"
                  :key="index"
                  :timestamp="activity.timestamp"
                  :type="activity.type"
                  :color="activity.color"
                  :size="activity.size"
                >
                  {{ activity.content }}
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
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="serialNumber" label="制造唯一性编号">
        <template slot-scope="scope">
          <el-link type="primary" @click="showDetail(scope.row)">{{ scope.row.serialNumber }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="manufacturingDate" label="制造年份+月份">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.manufacturingDate, '{y}-{m}') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="model" label="气瓶型号" />
      <el-table-column prop="owner" label="当前归属用户" />
      <el-table-column prop="status" label="当前状态">
        <template slot-scope="scope">
          {{ dict.label.cylinder_status[scope.row.status] }}
        </template>
      </el-table-column>
      <el-table-column prop="lastFillingTime" label="最后充气时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastFillingTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fillingCount" label="充气计数" />
      <el-table-column prop="isNormal" label="是否正常使用">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isNormal ? 'success' : 'danger'">
            {{ scope.row.isNormal ? '正常' : '异常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="statusDescription" label="状态描述" :show-overflow-tooltip="true" />
      <el-table-column v-if="checkPer(['admin','cylinder:edit','cylinder:del'])" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import crudCylinder from '@/api/cylinder'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = {
  id: null,
  serialNumber: null,
  productNumber: null,
  cylinderTypeCode: null,
  manufacturingDate: null,
  productionBatch: null,
  designLife: null,
  model: null,
  nominalVolume: null,
  owner: null,
  nextInspectionDate: null,
  scrappedDate: null,
  status: null,
  lastFillingTime: null,
  fillingCount: 0,
  isNormal: true,
  statusDescription: null
}
export default {
  name: 'Cylinder',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  cruds() {
    return CRUD({ title: '气瓶', url: 'api/cylinders', crudMethod: { ...crudCylinder }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['cylinder_status', 'cylinder_type'],
  data() {
    return {
      detailDrawer: false,
      activeTab: 'basic',
      detailData: {},
      historyList: [],
      timelineList: [],
      permission: {
        add: ['admin', 'cylinder:add'],
        edit: ['admin', 'cylinder:edit'],
        del: ['admin', 'cylinder:del']
      },
      rules: {
        serialNumber: [
          { required: true, message: '制造唯一性编号不能为空', trigger: 'blur' }
        ],
        manufacturingDate: [
          { required: true, message: '制造日期不能为空', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '气瓶型号不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    // 制造假数据用于测试
    const mockData = [
      {
        id: 1,
        serialNumber: 'GP-2026-0001',
        productNumber: 'PN8899001',
        cylinderTypeCode: 'LPG-C50',
        manufacturingDate: '2025-01-15',
        productionBatch: 'B2501-A',
        designLife: '15年',
        model: 'YSP35.5',
        nominalVolume: '35.5L',
        owner: '城南分销中心',
        status: '1',
        lastFillingTime: '2026-03-22 15:30:00',
        fillingCount: 125,
        isNormal: true,
        statusDescription: '日常检查正常，漆面完好',
        nextInspectionDate: '2027-01-15',
        scrappedDate: '2040-01-15'
      },
      {
        id: 2,
        serialNumber: 'GP-2026-0002',
        productNumber: 'PN8899002',
        cylinderTypeCode: 'LPG-C50',
        manufacturingDate: '2025-02-20',
        productionBatch: 'B2502-B',
        designLife: '15年',
        model: 'YSP35.5',
        nominalVolume: '35.5L',
        owner: '河西加气站',
        status: '2',
        lastFillingTime: '2026-03-21 09:00:00',
        fillingCount: 88,
        isNormal: true,
        statusDescription: '气门轻微磨损，不影响使用',
        nextInspectionDate: '2027-02-20',
        scrappedDate: '2040-02-20'
      },
      {
        id: 3,
        serialNumber: 'GP-2026-0003',
        productNumber: 'PN8899003',
        cylinderTypeCode: 'CNG-D80',
        manufacturingDate: '2024-11-05',
        productionBatch: 'B2411-C',
        designLife: '20年',
        model: 'CNG-2-80L',
        nominalVolume: '80L',
        owner: '公交集团三分公司',
        status: '1',
        lastFillingTime: '2026-03-23 08:20:00',
        fillingCount: 450,
        isNormal: true,
        statusDescription: '定期维护保养中',
        nextInspectionDate: '2025-11-05',
        scrappedDate: '2044-11-05'
      },
      {
        id: 4,
        serialNumber: 'GP-2026-0004',
        productNumber: 'PN8899004',
        cylinderTypeCode: 'LPG-C50',
        manufacturingDate: '2023-05-12',
        productionBatch: 'B2305-A',
        designLife: '15年',
        model: 'YSP35.5',
        nominalVolume: '35.5L',
        owner: '个人用户-张大勇',
        status: '3',
        lastFillingTime: '2025-12-10 11:45:00',
        fillingCount: 15,
        isNormal: false,
        statusDescription: '瓶身有明显锈迹，建议送检',
        nextInspectionDate: '2026-05-12',
        scrappedDate: '2038-05-12'
      },
      {
        id: 5,
        serialNumber: 'GP-2026-0005',
        productNumber: 'PN8899005',
        cylinderTypeCode: 'LPG-C50',
        manufacturingDate: '2025-03-01',
        productionBatch: 'B2503-A',
        designLife: '15年',
        model: 'YSP35.5',
        nominalVolume: '35.5L',
        owner: '城东仓库',
        status: '1',
        lastFillingTime: null,
        fillingCount: 0,
        isNormal: true,
        statusDescription: '新瓶入库',
        nextInspectionDate: '2027-03-01',
        scrappedDate: '2040-03-01'
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
        { createTime: '2026-03-23 10:00:00', operator: 'admin', operation: '新增气瓶' },
        { createTime: '2026-03-23 14:30:00', operator: 'operator01', operation: '修改状态：正常 -> 充气中' }
      ]
      // 模拟获取时间线
      this.timelineList = [
        { timestamp: '2026-03-23 14:30:00', content: '状态变更为：充气中', type: 'primary', color: '#409EFF', size: 'large' },
        { timestamp: '2026-03-23 10:00:00', content: '气瓶入库', type: 'success', color: '#67C23A' }
      ]
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
