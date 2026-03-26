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
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="nickName" label="联系人" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column label="账号状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
            {{ scope.row.enabled ? '已激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-popover
            :ref="scope.row.id"
            v-permission="['admin','appUser:edit']"
            placement="top"
            width="180"
          >
            <p>确定{{ scope.row.enabled ? '停用' : '激活' }}该账号吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="toggleLoading" type="primary" size="mini" @click="handleToggle(scope.row)">确定</el-button>
            </div>
            <el-button slot="reference" :type="scope.row.enabled ? 'danger' : 'success'" size="mini">
              {{ scope.row.enabled ? '停用' : '激活' }}
            </el-button>
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
      url: 'api/appUsers',
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
  mounted() {
    // 模拟假数据用于测试
    const mockData = [
      {
        id: 1,
        username: 'app_user_001',
        email: 'user1@example.com',
        nickName: '张小明',
        phone: '13811112222',
        enabled: false
      },
      {
        id: 2,
        username: 'app_user_002',
        email: 'user2@example.com',
        nickName: '李美红',
        phone: '13933334444',
        enabled: true
      },
      {
        id: 3,
        username: 'station_op_01',
        email: 'station@example.com',
        nickName: '王建国',
        phone: '13755556666',
        enabled: false
      }
    ]
    this.crud.data = mockData
    this.crud.page.total = mockData.length
    this.crud.loading = false
  },
  methods: {
    handleToggle(row) {
      this.toggleLoading = true
      const newStatus = !row.enabled
      appUserApi.toggleStatus({ id: row.id, enabled: newStatus }).then(() => {
        this.$notify({
          title: newStatus ? '激活成功' : '停用成功',
          type: 'success',
          duration: 2500
        })
        this.$refs[row.id].doClose()
        this.toggleLoading = false
        // 模拟更新本地状态
        row.enabled = newStatus
      }).catch(() => {
        this.toggleLoading = false
      })
    }
  }
}
</script>

<style scoped>
</style>
