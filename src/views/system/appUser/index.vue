<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input
          v-model="query.blurry"
          clearable
          size="small"
          placeholder="输入账号、邮箱或手机号搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="roleDialogVisible"
      title="分配角色"
      width="500px"
    >
      <el-form ref="roleForm" :model="roleForm" size="small" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="roleForm.username" disabled style="width: 380px;" />
        </el-form-item>
        <el-form-item label="分配角色">
          <el-select
            v-model="roleForm.roleIds"
            multiple
            placeholder="请选择角色"
            style="width: 380px;"
          >
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="roleDialogVisible = false">取消</el-button>
        <el-button :loading="bindRoleLoading" type="primary" @click="submitBindRoles">确认</el-button>
      </div>
    </el-dialog>
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="账号" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="账号状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'INACTIVE' ? 'success' : 'danger'">
            {{ scope.row.status === 'INACTIVE' ? '已激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300px" align="center">
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.status === 'ACTIVE'"
            :ref="scope.row.id"
            placement="top"
            width="180"
          >
            <p>确定激活该账号吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="toggleLoading" type="primary" size="mini" @click="handleToggle(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="success" size="mini">激活</el-button>
          </el-popover>
          <!-- <el-popover
            v-if="scope.row.status === 'INACTIVE'"
            :ref="scope.row.id"
            placement="top"
            width="180"
          >
            <p>确定重置密码吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="toggleLoading" type="primary" size="mini" @click="handleToggle(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" type="primary" size="mini">重置</el-button>
          </el-popover> -->
          <el-button v-if="scope.row.status === 'INACTIVE'" type="warning" size="mini" icon="el-icon-setting" @click="handleAssignRole(scope.row)">分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination />
  </div>
</template>

<script>
import appUserApi from '@/api/system/appUser'
import appRoleApi from '@/api/system/appRole'
import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

export default {
  name: 'AppUserActivation',
  components: { pagination, crudOperation, rrOperation },
  cruds() {
    return CRUD({
      title: 'APP账号激活',
      url: '/api/admin/user/list',
      method: 'post',
      crudMethod: { ...appUserApi },
      optShow: { add: false, edit: false, del: false, download: false, reset: true }
    })
  },
  mixins: [presenter(), header(), crud()],
  data() {
    return {
      toggleLoading: false,
      roleDialogVisible: false,
      bindRoleLoading: false,
      roleList: [],
      roleForm: {
        userId: null,
        username: '',
        roleIds: []
      },
      permission: {
        add: ['admin', 'appUser:add'],
        edit: ['admin', 'appUser:edit'],
        del: ['admin', 'appUser:del']
      }
    }
  },
  created() {
    this.loadRoleList()
  },
  methods: {
    handleToggle(row) {
      this.toggleLoading = true
      appUserApi.toggleStatus({ id: row.id }).then(() => {
        this.$notify({
          title: '激活成功',
          type: 'success',
          duration: 2500
        })
        this.$refs[row.id].doClose()
        this.toggleLoading = false
        crud.refresh()
      }).catch(() => {
        this.toggleLoading = false
      })
    },
    loadRoleList() {
      appRoleApi.getList({ page: 0, pageSize: 999 }).then(res => {
        this.roleList = res.content || res.data || []
      })
    },
    handleAssignRole(row) {
      this.roleForm = {
        userId: row.id,
        username: row.username,
        roleIds: []
      }
      this.roleDialogVisible = true
    },
    submitBindRoles() {
      this.bindRoleLoading = true
      appUserApi.bindRoles({
        userId: this.roleForm.userId,
        roleIds: this.roleForm.roleIds
      }).then(() => {
        this.$notify({
          title: '分配成功',
          type: 'success',
          duration: 2500
        })
        this.roleDialogVisible = false
        this.bindRoleLoading = false
        crud.refresh()
      }).catch(() => {
        this.bindRoleLoading = false
      })
    }
  }
}
</script>

<style scoped>
</style>
