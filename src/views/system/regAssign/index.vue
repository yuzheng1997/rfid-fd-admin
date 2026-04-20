<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input
          v-model="query.name"
          clearable
          size="small"
          placeholder="输入机构名搜索"
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
        <el-descriptions-item label="企业类型">
          <span v-if="detailData.typeDealer === 1">分销商</span>
          <span v-else-if="detailData.typeFiller === 1">加气站</span>
          <span v-else-if="detailData.typeInspection === 1">年检机构</span>
          <span v-else-if="detailData.typeManufacturer === 1">制造商</span>
          <span v-else>未知</span>
        </el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ detailData.code }}</el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ detailData.legalName }}</el-descriptions-item>
        <el-descriptions-item label="联系人姓名">{{ detailData.contact }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="省市区地址">{{ detailData.province }} {{ detailData.city }} {{ detailData.district }}</el-descriptions-item>
        <el-descriptions-item label="详细地址">{{ detailData.address }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
        <!-- <el-descriptions-item label="状态">{{ detailData.status === 'ACTIVE' ? '正常' : '禁用/未分配' }}</el-descriptions-item> -->
        <!-- <el-descriptions-item label="关联账号">
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
      </el-descriptions> -->
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="detailDialog = false">关闭</el-button>
        <!-- <el-button
          :loading="assignLoading"
          type="primary"
          @click="confirmAssign"
        >确定关联</el-button> -->
        </div>
      </el-descriptions></el-dialog>
    <!--表格渲染-->
    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      style="width: 100%;"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="企业名称" />
      <el-table-column prop="creditCode" label="统一社会信用代码" />
      <el-table-column prop="address" label="详细地址" />
      <el-table-column label="企业类型">
        <template slot-scope="scope">
          <span v-if="scope.row.typeDealer === 1">分销商</span>
          <span v-else-if="scope.row.typeFiller === 1">加气站</span>
          <span v-else-if="scope.row.typeInspection === 1">年检机构</span>
          <span v-else-if="scope.row.typeManufacturer === 1">制造商</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <!-- <el-table-column
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
      </el-table-column> -->
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
// import regAssignApi from '@/api/system/regAssign'
import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

export default {
  name: 'RegAssign',
  components: { pagination, crudOperation, rrOperation },
  cruds() {
    return CRUD({
      title: '分配账号',
      url: 'api/admin/company/companyList',
      method: 'post',
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
    // 模拟假数据用于测试，按新的Company接口结构

  },
  methods: {

    showAssign(row) {
      this.detailData = row
      this.assignForm.id = row.id
      this.assignForm.userId = null
      this.detailDialog = true
    }
    // confirmAssign() {
    //   if (!this.assignForm.userId) {
    //     this.$message.warning('请选择要关联的账号')
    //     return
    //   }
    //   this.assignLoading = true
    //   regAssignApi
    //     .assignAccount(this.assignForm)
    //     .then((res) => {
    //       this.$notify({
    //         title: '关联成功',
    //         type: 'success',
    //         duration: 2500
    //       })
    //       this.detailDialog = false
    //       this.assignLoading = false
    //       this.crud.refresh()
    //     })
    //     .catch(() => {
    //       this.assignLoading = false
    //     })
    // }
  }
}
</script>

<style scoped></style>
