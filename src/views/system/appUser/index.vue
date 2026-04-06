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
          placeholder="输入账号、邮箱或手机号搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="username" label="账号" />
      <!-- <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="nickName" label="联系人" /> -->
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="账号状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ scope.row.status === 'ACTIVE' ? '已激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <!-- <el-tag type="success" size="mini">已激活</el-tag> -->
          <el-popover
            v-if="scope.row.status === 'INACTIVE'"
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
          <el-popover
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
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import appUserApi from '@/api/system/appUser'
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
      permission: {
        add: ['admin', 'appUser:add'],
        edit: ['admin', 'appUser:edit'],
        del: ['admin', 'appUser:del']
      }
    }
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
        row.status = 'ACTIVE'
      }).catch(() => {
        this.toggleLoading = false
      })
    }
  }
}
</script>

<style scoped>
</style>
