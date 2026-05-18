<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input
          v-model="query.name"
          clearable
          size="small"
          placeholder="输入机构名称搜索"
          style="width: 200px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>

    <el-table
      ref="table"
      v-loading="crud.loading"
      :data="crud.data"
      style="width: 100%;"
    >
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
      <el-table-column label="绑定账号" align="center">
        <template slot-scope="scope">
          {{ getBoundUsername(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120px"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="canAssignAccount(scope.row)"
            size="mini"
            type="primary"
            icon="el-icon-user"
            @click="showCreateAccount(scope.row)"
          >账号授权</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination />

    <el-dialog
      append-to-body
      :close-on-click-modal="false"
      :visible.sync="accountDialogVisible"
      title="账号授权"
      width="555px"
      @close="resetAccountForm"
    >
      <el-form
        ref="accountForm"
        :inline="true"
        :model="accountForm"
        :rules="rules"
        size="small"
        label-width="66px"
      >
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="text" @click="accountDialogVisible = false">取消</el-button>
        <el-button :loading="accountLoading" type="primary" @click="submitCreateAccount">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { bindAccount } from '@/api/system/user'
import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import { isvalidPhone } from '@/utils/validate'

const defaultAccountForm = {
  username: null,
  nickName: null,
  gender: '男',
  email: null,
  phone: null
}

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
      accountDialogVisible: false,
      accountLoading: false,
      currentCompany: {},
      accountForm: JSON.parse(JSON.stringify(defaultAccountForm)),
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
    ...mapGetters(['user', 'roles']),
    currentUserCompanyId() {
      return this.user && this.user.companyId
    },
    isAdmin() {
      return Array.isArray(this.roles) && (this.roles.includes('admin') || this.roles.includes('ROLE_ADMIN'))
    }
  },
  watch: {
    'crud.data': {
      handler(data) {
        this.normalizeCrudRows(data)
      },
      immediate: true
    }
  },
  methods: {
    normalizeCrudRows(data) {
      if (!Array.isArray(data)) {
        return
      }
      data.forEach(row => {
        this.normalizeCompanyRow(row)
      })
    },
    normalizeCompanyRow(row) {
      if (!row || !row.company) {
        return row
      }
      Object.keys(row.company).forEach(key => {
        this.$set(row, key, row.company[key])
      })
      return row
    },
    getCompany(row) {
      if (!row) {
        return {}
      }
      return row.company || row
    },
    getPrimaryBoundAccount(row) {
      if (!row || !Array.isArray(row.boundAccounts) || row.boundAccounts.length === 0) {
        return null
      }
      return row.boundAccounts[0]
    },
    keydown(e) {
      if (e.keyCode === 32) {
        e.returnValue = false
      }
    },
    showCreateAccount(row) {
      this.normalizeCompanyRow(row)
      this.currentCompany = this.getCompany(row)
      this.resetAccountForm()
      this.accountDialogVisible = true
    },
    resetAccountForm() {
      this.accountForm = JSON.parse(JSON.stringify(defaultAccountForm))
      this.$nextTick(() => {
        if (this.$refs.accountForm) {
          this.$refs.accountForm.clearValidate()
        }
      })
    },
    submitCreateAccount() {
      this.$refs.accountForm.validate(valid => {
        if (!valid) {
          return
        }
        const form = {
          companyId: this.currentCompany.id,
          email: this.accountForm.email,
          gender: '男',
          nickName: this.accountForm.nickName,
          phone: this.accountForm.phone,
          username: this.accountForm.username
        }
        this.accountLoading = true
        bindAccount(form).then(() => {
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
    getBoundUser(row) {
      const boundAccount = this.getPrimaryBoundAccount(row)
      if (boundAccount) {
        return {
          ...boundAccount,
          id: boundAccount.id || boundAccount.userId,
          userId: boundAccount.userId || boundAccount.id,
          username: boundAccount.username || boundAccount.userName || boundAccount.accountName
        }
      }
      const user = row.user || row.account || row.targetUser || row.sysUser || row.adminUser
      if (user && (user.id || user.userId)) {
        return {
          ...user,
          id: user.id || user.userId,
          userId: user.userId || user.id,
          username: user.username || user.userName || user.accountName
        }
      }
      const userId = row.userId || row.targetUserId || row.accountId || row.bindUserId
      if (!userId) {
        return null
      }
      return {
        ...row,
        id: userId,
        userId,
        username: row.username || row.userName || row.accountName
      }
    },
    hasBoundUser(row) {
      return !!this.getBoundUser(row)
    },
    canAssignAccount(row) {
      if (this.hasBoundUser(row)) {
        return false
      }

      return String(row.parentId || '') === String(this.currentUserCompanyId || '')
    },
    getBoundUsername(row) {
      const boundUser = this.getBoundUser(row)
      return boundUser ? boundUser.username || '' : ''
    }
  }
}
</script>

<style scoped></style>
