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
    >
      <!-- <el-table-column type="selection" width="55" /> -->
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
      <el-table-column label="状态" align="center" prop="enabled">
        <template slot-scope="scope">
          <el-switch
            v-if="hasBoundUser(scope.row)"
            :value="normalizeEnabled(getBoundUser(scope.row).enabled)"
            :disabled="isCurrentUser(getBoundUser(scope.row))"
            active-color="#409EFF"
            inactive-color="#F56C6C"
            @change="changeEnabled(scope.row, $event)"
          />
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
      <el-table-column
        v-if="checkPer(['admin', 'user:add'])"
        label="操作"
        width="120px"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-user"
            @click="showCreateAccount(scope.row)"
          >账号授权</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />

    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="accountDialogVisible"
      title="创建账号"
      width="555px"
      @close="resetAccountForm"
    >
      <el-form ref="accountForm" :inline="true" :model="accountForm" :rules="rules" size="small" label-width="66px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="accountForm.username" @keydown.native="keydown($event)" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model.number="accountForm.phone" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="accountForm.nickName" @keydown.native="keydown($event)" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="accountForm.email" />
        </el-form-item>
        <el-form-item label="部门" prop="dept.id">
          <treeselect
            v-model="accountForm.dept.id"
            :options="depts"
            :load-options="loadDepts"
            style="width: 173px"
            placeholder="选择部门"
          />
        </el-form-item>
        <el-form-item label="岗位" prop="jobDatas" class="is-required">
          <el-select
            v-model="jobDatas"
            style="width: 172px"
            multiple
            placeholder="请选择"
            @remove-tag="deleteTag"
            @change="changeJob"
          >
            <el-option
              v-for="item in jobs"
              :key="item.name"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="accountForm.gender" style="width: 178px">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="accountForm.enabled">
            <el-radio label="true">激活</el-radio>
            <el-radio label="false">锁定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item style="margin-bottom: 0;" label="角色" prop="roleDatas" class="is-required">
          <el-select
            v-model="roleDatas"
            style="width: 426px"
            multiple
            placeholder="请选择"
            @remove-tag="deleteTag"
            @change="changeRole"
          >
            <el-option
              v-for="item in roles"
              :key="item.name"
              :disabled="level !== 1 && item.level <= level"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="accountDialogVisible = false">取消</el-button>
        <el-button :loading="accountLoading" type="primary" @click="submitCreateAccount">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import regAssignApi from '@/api/system/regAssign'
import crudUser, { bindCompany } from '@/api/system/user'
import { initData } from '@/api/data'
import { isvalidPhone } from '@/utils/validate'
import { getDepts } from '@/api/system/dept'
import { getAll, getLevel } from '@/api/system/role'
import { getAllJob } from '@/api/system/job'
import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import { mapGetters } from 'vuex'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'

let accountRoles = []
let accountJobs = []
const defaultAccountForm = {
  id: null,
  username: null,
  nickName: null,
  gender: '男',
  email: null,
  enabled: 'false',
  roles: [],
  jobs: [],
  dept: { id: null },
  phone: null
}

export default {
  name: 'RegAssign',
  components: { Treeselect, pagination, crudOperation, rrOperation },
  dicts: ['user_status'],
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
    const validPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入电话号码'))
      } else if (!isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      detailDialog: false,
      detailData: {},
      assignForm: {
        id: null,
        userId: null
      },
      assignLoading: false,
      userOptions: [],
      accountDialogVisible: false,
      accountLoading: false,
      currentCompany: {},
      accountForm: JSON.parse(JSON.stringify(defaultAccountForm)),
      depts: [],
      jobs: [],
      roles: [],
      level: 3,
      jobDatas: [],
      roleDatas: [],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        nickName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, trigger: 'blur', validator: validPhone }
        ],
        'dept.id': [
          { required: true, message: '部门不能为空', trigger: 'blur' }
        ],
        jobDatas: [
          {
            validator: (rule, value, callback) => {
              value = this.jobDatas
              if (!value || value.length === 0) {
                callback(new Error('请选择至少一个岗位'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ],
        roleDatas: [
          {
            validator: (rule, value, callback) => {
              value = this.roleDatas
              if (!value || value.length === 0) {
                callback(new Error('请选择至少一个角色'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ]
      },
      permission: {
        add: ['admin', 'reg:add'],
        edit: ['admin', 'reg:edit'],
        del: ['admin', 'reg:del']
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  mounted() {
    // 模拟假数据用于测试，按新的Company接口结构

  },
  methods: {
    keydown(e) {
      if (e.keyCode === 32) {
        e.returnValue = false
      }
    },
    showCreateAccount(row) {
      this.currentCompany = row
      this.resetAccountForm()
      this.accountDialogVisible = true
      this.getDepts()
      this.getRoles()
      this.getRoleLevel()
      this.getJobs()
    },
    resetAccountForm() {
      this.accountForm = JSON.parse(JSON.stringify(defaultAccountForm))
      this.jobDatas = []
      this.roleDatas = []
      accountRoles = []
      accountJobs = []
      this.$nextTick(() => {
        if (this.$refs.accountForm) {
          this.$refs.accountForm.clearValidate()
        }
      })
    },
    changeRole(value) {
      accountRoles = []
      value.forEach(function(data) {
        accountRoles.push({ id: data })
      })
    },
    changeJob(value) {
      accountJobs = []
      value.forEach(function(data) {
        accountJobs.push({ id: data })
      })
    },
    deleteTag(value) {
      accountRoles.forEach(function(data, index) {
        if (data.id === value) {
          accountRoles.splice(index, 1)
        }
      })
      accountJobs.forEach(function(data, index) {
        if (data.id === value) {
          accountJobs.splice(index, 1)
        }
      })
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    loadDepts({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        getDepts({ enabled: true, pid: parentNode.id }).then(res => {
          parentNode.children = res.content.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 200)
        })
      }
    },
    getRoles() {
      getAll().then(res => {
        this.roles = res
      }).catch(() => { })
    },
    getJobs() {
      getAllJob().then(res => {
        this.jobs = res.content
      }).catch(() => { })
    },
    getRoleLevel() {
      getLevel().then(res => {
        this.level = res.level
      }).catch(() => { })
    },
    submitCreateAccount() {
      this.$refs.accountForm.validate(valid => {
        if (!valid) {
          return
        }
        const form = JSON.parse(JSON.stringify(this.accountForm))
        form.roles = accountRoles
        form.jobs = accountJobs
        this.accountLoading = true
        crudUser.add(form).then(res => {
          return this.resolveCreatedUserId(res, form.username).then(userId => {
            if (!userId) {
              throw new Error('创建成功，但未获取到新账号ID')
            }
            return bindCompany(userId, this.currentCompany.id)
          })
        }).then(() => {
          this.crud.notify('账号创建并绑定企业成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
          this.accountDialogVisible = false
          this.accountLoading = false
          this.crud.refresh()
        }).catch(err => {
          this.accountLoading = false
          if (err && err.message) {
            this.$message.error(err.message)
          }
        })
      })
    },
    resolveCreatedUserId(res, username) {
      const userId = this.getUserIdFromResponse(res)
      if (userId) {
        return Promise.resolve(userId)
      }
      return initData('api/users', { blurry: username, page: 1, size: 10, pageAt: 1, pageSize: 10 }, 'get').then(data => {
        const list = data.content || []
        const user = list.find(item => item.username === username)
        return user && user.id
      })
    },
    getUserIdFromResponse(res) {
      if (!res) {
        return null
      }
      if (res.id) {
        return res.id
      }
      if (res.userId) {
        return res.userId
      }
      if (res.data) {
        return this.getUserIdFromResponse(res.data)
      }
      if (res.content) {
        return this.getUserIdFromResponse(res.content)
      }
      return null
    },
    getBoundUser(row) {
      const user = row.user || row.account || row.targetUser || row.sysUser || row.adminUser
      if (user && (user.id || user.userId)) {
        return user
      }
      const userId = row.userId || row.targetUserId || row.accountId || row.bindUserId
      if (!userId) {
        return null
      }
      return {
        ...row,
        id: userId,
        username: row.username || row.userName || row.accountName,
        enabled: row.userEnabled !== undefined ? row.userEnabled : row.enabled
      }
    },
    hasBoundUser(row) {
      return !!this.getBoundUser(row)
    },
    normalizeEnabled(enabled) {
      return enabled === true || enabled === 'true'
    },
    isCurrentUser(boundUser) {
      return boundUser && this.user && boundUser.id === this.user.id
    },
    getEnabledLabel(val) {
      const key = String(val)
      return this.dict && this.dict.label && this.dict.label.user_status
        ? this.dict.label.user_status[key]
        : (this.normalizeEnabled(val) ? '激活' : '锁定')
    },
    changeEnabled(row, val) {
      const boundUser = this.getBoundUser(row)
      if (!boundUser) {
        return
      }
      const oldValue = boundUser.enabled
      boundUser.enabled = val
      this.$confirm('此操作将 "' + this.getEnabledLabel(val) + '" ' + (boundUser.username || '') + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudUser.edit(boundUser).then(() => {
          this.syncBoundUserEnabled(row, val)
          this.crud.notify(this.getEnabledLabel(val) + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
          this.syncBoundUserEnabled(row, oldValue)
        })
      }).catch(() => {
        this.syncBoundUserEnabled(row, oldValue)
      })
    },
    syncBoundUserEnabled(row, val) {
      const user = row.user || row.account || row.targetUser || row.sysUser || row.adminUser
      if (user && (user.id || user.userId)) {
        user.enabled = val
      }
      if (row.userEnabled !== undefined) {
        row.userEnabled = val
      } else if (row.enabled !== undefined && (row.userId || row.targetUserId || row.accountId || row.bindUserId)) {
        row.enabled = val
      }
    },
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
