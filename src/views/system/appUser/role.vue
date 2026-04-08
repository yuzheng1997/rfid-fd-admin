<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input
          v-model="query.blurry"
          clearable
          size="small"
          placeholder="输入角色名称搜索"
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
      :before-close="crud.cancelCU"
      :visible.sync="crud.status.cu > 0"
      :title="crud.status.title"
      width="600px"
    >
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" style="width: 480px;" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限配置">
          <el-select
            v-model="form.permissionIds"
            multiple
            placeholder="请选择权限"
            style="width: 480px;"
          >
            <el-option
              v-for="item in permissionList"
              :key="item.id"
              :label="`${item.name} (${item.code})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="crud.cancelCU">取消</el-button>
        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
      </div>
    </el-dialog>
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="createTime" label="创建时间" width="180px" />
      <el-table-column label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <udOperation :data="scope.row" :permission="permission" />
        </template>
      </el-table-column>
    </el-table>
    <pagination />
  </div>
</template>

<script>
import appRoleApi from '@/api/system/appRole'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: '', permissionIds: [] }
export default {
  name: 'AppRole',
  components: { pagination, crudOperation, rrOperation, udOperation },
  cruds() {
    return CRUD({
      title: '角色',
      url: '/api/admin/app-rbac/role/list',
      method: 'post',
      crudMethod: { ...appRoleApi },
      optShow: { add: true, edit: true, del: true, download: false, reset: true }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  data() {
    return {
      permissionList: [],
      permission: {
        add: ['admin', 'appRole:add'],
        edit: ['admin', 'appRole:edit'],
        del: ['admin', 'appRole:del']
      },
      rules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    [CRUD.HOOK.afterRefresh]() {
      this.loadPermissionList()
    },
    [CRUD.HOOK.afterMounted]() {
      this.loadPermissionList()
    },
    [CRUD.HOOK.beforeToAdd](crud, form) {
      form.permissionIds = []
    },
    [CRUD.HOOK.beforeToEdit](crud, form) {
      if (!form.permissionIds) {
        form.permissionIds = []
      }
    },
    loadPermissionList() {
      appRoleApi.getPermissionList({ page: 1, pageSize: 999 }).then(res => {
        this.permissionList = res
      })
    }
  }
}
</script>

<style scoped>
</style>
