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
          placeholder="输入机构名或代码搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!-- 详情弹窗 -->
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="detailDialog"
      title="分配账号"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="机构类型">{{
          detailData.orgType === "distributor" ? "分销商" : "加气站"
        }}</el-descriptions-item>
        <el-descriptions-item label="机构名称">{{
          detailData.orgName
        }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{
          detailData.creditCode
        }}</el-descriptions-item>
        <el-descriptions-item label="联系人姓名">{{
          detailData.contactName
        }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{
          detailData.contactPhone
        }}</el-descriptions-item>
        <el-descriptions-item label="省市区地址">{{
          detailData.regionText
        }}</el-descriptions-item>
        <el-descriptions-item label="详细地址">{{
          detailData.detailAddress
        }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{
          detailData.remark || "无"
        }}</el-descriptions-item>
        <el-descriptions-item label="关联账号">
          <el-select
            v-model="assignForm.userId"
            placeholder="请选择关联账号"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="
                item.username +
                  (item.nickName ? ' (' + item.nickName + ')' : '')
              "
              :value="item.id"
            />
          </el-select>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="detailDialog = false">取消</el-button>
        <el-button
          :loading="assignLoading"
          type="primary"
          @click="confirmAssign"
        >确定关联</el-button>
      </div>
    </el-dialog>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      style="width: 100%;"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="orgName" label="机构名" />
      <el-table-column prop="creditCode" label="统一社会信用代码" />
      <el-table-column prop="contactName" label="联系人" />
      <el-table-column prop="contactPhone" label="联系人电话" />
      <el-table-column
        v-if="checkPer(['admin', 'reg:assign'])"
        label="操作"
        width="120px"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-user"
            @click="showAssign(scope.row)"
          >分配</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import regAssignApi from '@/api/system/regAssign'
import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

export default {
  name: 'RegAssign',
  components: { pagination, crudOperation, rrOperation },
  cruds() {
    return CRUD({
      title: '注册分配',
      url: 'api/registrations',
      crudMethod: { ...regAssignApi },
      optShow: {
        add: false,
        edit: false,
        del: false,
        download: false,
        reset: true
      }
    })
  },
  mixins: [presenter(), header(), crud()],
  data() {
    return {
      detailDialog: false,
      detailData: {},
      assignForm: {
        id: null,
        userId: null
      },
      assignLoading: false,
      userOptions: [],
      permission: {
        add: ['admin', 'reg:add'],
        edit: ['admin', 'reg:edit'],
        del: ['admin', 'reg:del']
      }
    }
  },
  mounted() {
    // 模拟假数据用于测试
    const mockData = [
      {
        id: 1,
        orgType: 'distributor',
        orgName: '朝阳气瓶配送中心',
        creditCode: '91110105MA01X7Y89A',
        contactName: '王大勇',
        contactPhone: '13811223344',
        regionText: '北京市朝阳区',
        detailAddress: '大屯路100号',
        remark: '优质合作伙伴'
      },
      {
        id: 2,
        orgType: 'station',
        orgName: '海淀加气站第一分站',
        creditCode: '91110108MA02Y8Z90B',
        contactName: '李建国',
        contactPhone: '13922334455',
        regionText: '北京市海淀区',
        detailAddress: '中关村东路20号',
        remark: ''
      }
    ]
    this.crud.data = mockData
    this.crud.page.total = mockData.length
    this.crud.loading = false
    this.fetchUserOptions()
  },
  methods: {
    fetchUserOptions() {
      // 实际开发中应调用后端接口，此处由于演示模拟一些账号
      this.userOptions = [
        { id: 1, username: 'admin', nickName: '系统管理员' },
        { id: 2, username: 'operator01', nickName: '调度员01' },
        { id: 3, username: 'station_user', nickName: '加气站主管' }
      ]
      // 尝试调用后端接口
      /*
      userApi.getUsers({ page: 0, size: 999 }).then(res => {
        this.userOptions = res.content
      })
      */
    },
    showAssign(row) {
      this.detailData = row
      this.assignForm.id = row.id
      this.assignForm.userId = null
      this.detailDialog = true
    },
    confirmAssign() {
      if (!this.assignForm.userId) {
        this.$message.warning('请选择要关联的账号')
        return
      }
      this.assignLoading = true
      regAssignApi
        .assignAccount(this.assignForm)
        .then((res) => {
          this.$notify({
            title: '关联成功',
            type: 'success',
            duration: 2500
          })
          this.detailDialog = false
          this.assignLoading = false
          this.crud.refresh()
        })
        .catch(() => {
          this.assignLoading = false
        })
    }
  }
}
</script>

<style scoped></style>
