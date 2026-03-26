<template>
  <div class="register" :style="'background-image:url('+ Background +');'">
    <el-form ref="registerForm" :model="form" :rules="rules" label-position="left" label-width="110px" class="register-form">
      <h3 class="title">机构注册</h3>
      <el-form-item label="机构类型" prop="orgType">
        <el-select v-model="form.orgType" placeholder="请选择机构类型" style="width: 100%">
          <el-option label="分销商" value="distributor" />
          <el-option label="加气站" value="station" />
        </el-select>
      </el-form-item>
      <el-form-item label="机构名称" prop="orgName">
        <el-input v-model="form.orgName" placeholder="请输入机构名称" />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="creditCode">
        <el-input v-model="form.creditCode" placeholder="请输入18位统一社会信用代码" maxlength="18" show-word-limit />
      </el-form-item>
      <el-form-item label="联系人姓名" prop="contactName">
        <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="省市区地址" prop="regionCodes">
        <el-cascader
          ref="regionCascader"
          v-model="form.regionCodes"
          :props="regionProps"
          clearable
          filterable
          style="width: 100%"
          placeholder="请选择省/市/区"
          @change="onRegionChange"
        />
      </el-form-item>
      <el-form-item label="详细地址" prop="detailAddress">
        <el-input v-model="form.detailAddress" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
      </el-form-item>
      <el-form-item style="width:100%; margin-top: 10px;">
        <el-button :loading="loading" size="medium" type="primary" style="width:100%;" @click.native.prevent="submit">
          <span v-if="!loading">提 交 注 册</span>
          <span v-else>提 交 中...</span>
        </el-button>
      </el-form-item>
      <div class="back-entry">
        <el-link type="primary" :underline="false" @click="toLogin">已有账号，返回登录</el-link>
      </div>
    </el-form>
  </div>
</template>

<script>
import Background from '@/assets/images/background.jpeg'
import axios from 'axios'
import { registerOrg } from '@/api/register'

const USCC_CODES = '0123456789ABCDEFGHJKLMNPQRTUWXY'
const USCC_WEIGHTS = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]

export default {
  name: 'Register',
  data() {
    const validateCreditCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('统一社会信用代码不能为空'))
        return
      }
      if (!this.isValidUSCC(value)) {
        callback(new Error('统一社会信用代码格式或校验位不正确'))
        return
      }
      callback()
    }
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('联系电话不能为空'))
        return
      }
      if (!this.isValidPhone(value)) {
        callback(new Error('请输入正确的联系电话'))
        return
      }
      callback()
    }
    return {
      Background,
      loading: false,
      form: {
        orgType: '',
        orgName: '',
        creditCode: '',
        contactName: '',
        contactPhone: '',
        regionCodes: [],
        regionText: '',
        detailAddress: '',
        remark: ''
      },
      rules: {
        orgType: [{ required: true, trigger: 'change', message: '请选择机构类型' }],
        orgName: [{ required: true, trigger: 'blur', message: '请输入机构名称' }],
        creditCode: [{ validator: validateCreditCode, trigger: 'blur' }],
        contactName: [{ required: true, trigger: 'blur', message: '请输入联系人姓名' }],
        contactPhone: [{ validator: validatePhone, trigger: 'blur' }],
        regionCodes: [{ required: true, trigger: 'change', message: '请选择省市区地址' }],
        detailAddress: [{ required: true, trigger: 'blur', message: '请输入详细地址' }]
      },
      regionProps: {
        lazy: true,
        value: 'code',
        label: 'name',
        leaf: 'leaf',
        lazyLoad: (node, resolve) => this.loadRegion(node, resolve)
      }
    }
  },
  methods: {
    toLogin() {
      this.$router.push({ path: '/login' })
    },
    async fetchJson(url) {
      const res = await axios.get(url, { responseType: 'text', transformResponse: [d => d] })
      const text = typeof res.data === 'string' ? res.data.replace(/^\uFEFF/, '') : ''
      return text ? JSON.parse(text) : res.data
    },
    onRegionChange() {
      const cascader = this.$refs.regionCascader
      const nodes = cascader && cascader.getCheckedNodes ? cascader.getCheckedNodes() : []
      if (nodes && nodes.length > 0) {
        this.form.regionText = nodes[0].pathLabels.join('')
      } else {
        this.form.regionText = ''
      }
    },
    async loadRegion(node, resolve) {
      try {
        const level = node.level
        if (level === 0) {
          const data = await this.fetchJson('/china-geojson-master/china.json')
          const list = (data.features || []).map(f => ({
            code: String(f.properties.id),
            name: f.properties.name
          }))
          resolve(list)
          return
        }
        const parent = node.data
        if (level === 1) {
          const data = await this.fetchJson(`/china-geojson-master/geometryProvince/${parent.code}.json`)
          const list = (data.features || []).map(f => ({
            code: String(f.properties.id).padStart(4, '0') + '00',
            name: f.properties.name
          }))
          resolve(list)
          return
        }
        if (level === 2) {
          const data = await this.fetchJson(`/china-geojson-master/geometryCouties/${parent.code}.json`)
          const list = (data.features || []).map(f => ({
            code: String(f.properties.id),
            name: f.properties.name,
            leaf: true
          }))
          resolve(list)
          return
        }
        resolve([])
      } catch (e) {
        resolve([])
      }
    },
    isValidPhone(value) {
      const v = String(value).trim()
      const mobile = /^1[3-9]\d{9}$/
      const landline = /^0\d{2,3}-?\d{7,8}$/
      const tel = /^\d{7,13}$/
      return mobile.test(v) || landline.test(v) || tel.test(v)
    },
    isValidUSCC(value) {
      const code = String(value).trim().toUpperCase()
      if (code.length !== 18) return false
      for (let i = 0; i < 18; i++) {
        if (USCC_CODES.indexOf(code[i]) === -1) return false
      }
      let sum = 0
      for (let i = 0; i < 17; i++) {
        sum += USCC_CODES.indexOf(code[i]) * USCC_WEIGHTS[i]
      }
      let logicCheckCode = 31 - (sum % 31)
      if (logicCheckCode === 31) logicCheckCode = 0
      const checkChar = USCC_CODES[logicCheckCode]
      return code[17] === checkChar
    },
    submit() {
      this.$refs.registerForm.validate(async valid => {
        if (!valid) return
        this.loading = true
        const payload = {
          orgType: this.form.orgType,
          orgName: this.form.orgName,
          creditCode: this.form.creditCode.trim().toUpperCase(),
          contactName: this.form.contactName,
          contactPhone: this.form.contactPhone,
          regionCodes: this.form.regionCodes,
          regionText: this.form.regionText,
          detailAddress: this.form.detailAddress,
          remark: this.form.remark
        }
        try {
          await registerOrg(payload)
          this.$notify({ title: '提交成功', type: 'success', duration: 2500 })
          this.toLogin()
        } catch (e) {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}
.title {
  margin: 0 auto 18px auto;
  text-align: center;
  color: #707070;
}
.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 520px;
  padding: 25px 25px 5px 25px;
}
.back-entry {
  text-align: center;
  margin: 0 0 18px 0;
  font-size: 13px;
}
</style>
