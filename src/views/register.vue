<template>
  <div class="register" :style="'background-image:url('+ Background +');'">
    <el-form ref="registerForm" :model="form" :rules="rules" label-position="right" label-width="130px" class="register-form">
      <h3 class="title">企业注册</h3>
      <el-form-item label="企业类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择企业类型" style="width: 100%" @change="onTypeChange">
          <el-option label="分销商" value="DISTRIBUTOR" />
          <el-option label="加气站" value="RETAILER" />
          <!-- <el-option label="检验机构" value="INSPECTION" />
          <el-option label="制造商" value="MANUFACTURER" /> -->
        </el-select>
      </el-form-item>
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入企业名称" />
      </el-form-item>
      <el-form-item label="上级机构" prop="parentId">
        <el-select v-model="form.parentId" placeholder="请选择上级机构" style="width: 100%" clearable filterable>
          <el-option
            v-for="item in parentOptions"
            :key="item.id"
            :label="item.name + (item.code ? ' (' + item.code + ')' : '')"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="creditCode">
        <el-input v-model="form.creditCode" placeholder="请输入18位统一社会信用代码" maxlength="18" show-word-limit />
      </el-form-item>
      <!-- <el-form-item label="法定代表人" prop="legalName">
        <el-input v-model="form.legalName" placeholder="请输入法定代表人姓名" />
      </el-form-item>
      <el-form-item label="法定代表人证件号" prop="legalCode">
        <el-input v-model="form.legalCode" placeholder="请输入法定代表人证件号" />
      </el-form-item> -->
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="联系人姓名" prop="contactName">
        <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
      </el-form-item>
      <el-form-item label="省市区地址" prop="regionCodes">
        <el-cascader
          ref="regionCascader"
          v-model="form.regionCodes"
          :props="regionProps"
          :data="regionOptions"
          clearable
          filterable
          style="width: 100%"
          placeholder="请选择省/市/区"
          @change="onRegionChange"
        />
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
      </el-form-item>

      <!-- <el-divider content-position="left">许可证上传</el-divider>
      <el-form-item v-for="item in licenseFields" :key="item.key" :label="item.label" :prop="item.key">
        <el-upload
          :action="imagesUploadApi"
          :headers="uploadHeaders"
          list-type="picture-card"
          :limit="1"
          :auto-upload="true"
          :on-success="(res) => handleUploadSuccess(item.key, res)"
          :on-remove="() => handleUploadRemove(item.key)"
          :file-list="uploadFileList[item.key]"
        >
          <i class="el-icon-plus" />
        </el-upload>
      </el-form-item> -->

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
import { getRegionTree } from '@/api/system/region'
import { registerCompany, listAllCompanies } from '@/api/company'
import { validateIdNo, validatePhoneTwo, validUSCC } from '@/utils/validate'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'

export default {
  name: 'Register',
  computed: {
    ...mapGetters(['imagesUploadApi', 'baseApi']),
    uploadHeaders() {
      const token = getToken()
      if (token) {
        return { Authorization: token }
      }
      return {}
    },
    licenseFields() {
      const base = [{ key: 'businessLicense', label: '营业执照', required: true }]
      if (this.form.type === 'DISTRIBUTOR') {
        return base.concat([{ key: 'dangerBusinessLicense', label: '危险化学品经营许可证', required: true }])
      }
      if (this.form.type === 'RETAILER') {
        return base.concat([
          { key: 'cylinderFillLicense', label: '气瓶充装许可证', required: true },
          { key: 'specialEquipmentLicense', label: '特种设备使用许可证', required: true }
        ])
      }
      return base
    }
  },
  data() {
    const validateCreditCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('统一社会信用代码不能为空'))
        return
      }
      if (!validUSCC(value)) {
        callback(new Error('统一社会信用代码格式或校验位不正确'))
        return
      }
      callback()
    }
    return {
      Background,
      loading: false,
      form: {
        type: '',
        name: '',
        parentId: null,
        creditCode: '',
        legalName: '',
        legalCode: '',
        contactName: '',
        contactPhone: '',
        regionCodes: [],
        province: '',
        city: '',
        district: '',
        address: '',
        remark: '',
        businessLicense: '123',
        cylinderFillLicense: '123',
        dangerBusinessLicense: '123',
        specialEquipmentLicense: '123'
      },
      rules: {
        type: [{ required: true, trigger: 'change', message: '请选择企业类型' }],
        name: [{ required: true, trigger: 'blur', message: '请输入企业名称' }],
        creditCode: [{ validator: validateCreditCode, trigger: 'blur' }],
        legalName: [{ required: true, trigger: 'blur', message: '请输入法定代表人姓名' }],
        legalCode: [{ validator: validateIdNo, trigger: 'blur' }],
        contactName: [{ required: true, trigger: 'blur', message: '请输入联系人姓名' }],
        contactPhone: [{ validator: validatePhoneTwo, trigger: 'blur' }],
        regionCodes: [{ required: true, trigger: 'change', message: '请选择省市区地址' }],
        address: [{ required: true, trigger: 'blur', message: '请输入详细地址' }]
      },
      regionProps: {
        value: 'value',
        label: 'label',
        children: 'children',
        checkStrictly: false
      },
      regionOptions: [],
      uploadFileList: {
        businessLicense: [],
        cylinderFillLicense: [],
        dangerBusinessLicense: [],
        specialEquipmentLicense: []
      }
    }
  },
  mounted() {
    this.fetchParents()
    this.fetchRegionData()
  },
  methods: {
    toLogin() {
      this.$router.push({ path: '/login' })
    },
    onTypeChange() {
      const allowed = this.licenseFields.map(i => i.key)
      const allKeys = ['businessLicense', 'cylinderFillLicense', 'dangerBusinessLicense', 'specialEquipmentLicense']
      allKeys.forEach(k => {
        if (allowed.indexOf(k) === -1) {
          this.form[k] = ''
          this.uploadFileList[k] = []
        }
      })
    },
    async fetchParents() {
      try {
        const res = await listAllCompanies()
        const list = Array.isArray(res) ? res : (res && (res.content || res.data)) || []
        this.parentOptions = (list || []).map(i => ({
          id: i.id,
          name: i.name,
          code: i.code
        }))
      } catch (e) {
        this.parentOptions = []
      }
    },
    onRegionChange() {
      const cascader = this.$refs.regionCascader
      const nodes = cascader && cascader.getCheckedNodes ? cascader.getCheckedNodes() : []
      if (nodes && nodes.length > 0) {
        const node = nodes[0]
        const pathLabels = node.pathLabels || []
        this.form.province = pathLabels[0] || ''
        this.form.city = pathLabels[1] || ''
        this.form.district = pathLabels[2] || ''
        // 如果需要保存地区代码，可以使用 path
        // this.form.provinceCode = path[0]
        // this.form.cityCode = path[1]
        // this.form.districtCode = path[2]
      } else {
        this.form.province = ''
        this.form.city = ''
        this.form.district = ''
      }
    },
    async fetchRegionData() {
      try {
        const res = await getRegionTree()
        this.regionOptions = Array.isArray(res) ? res : (res && res.data) || []
      } catch (e) {
        console.error('加载地区数据失败:', e)
        this.regionOptions = []
      }
    },
    buildFilePath(res) {
      if (res && res.type && res.realName) {
        return `${res.type}/${res.realName}`
      }
      if (res && res.path) {
        return res.path
      }
      if (res && res.url) {
        return res.url
      }
      return ''
    },
    buildFileUrl(path) {
      if (!path) return ''
      if (path.indexOf('http') === 0) return path
      if (path.indexOf('/file/') === 0) return this.baseApi + path
      return this.baseApi + '/file/' + path
    },
    handleUploadSuccess(key, res) {
      const path = this.buildFilePath(res)
      this.form[key] = path
      const url = this.buildFileUrl(path)
      this.uploadFileList[key] = url ? [{ name: key, url }] : []
    },
    handleUploadRemove(key) {
      this.form[key] = ''
      this.uploadFileList[key] = []
    },
    submit() {
      this.$refs.registerForm.validate(async valid => {
        if (!valid) return
        // for (let i = 0; i < this.licenseFields.length; i++) {
        //   const f = this.licenseFields[i]
        //   if (f.required && !this.form[f.key]) {
        //     this.$message.warning(`请上传${f.label}`)
        //     return
        //   }
        // }
        this.loading = true
        const payload = {
          type: this.form.type,
          name: this.form.name,
          parentId: this.form.parentId,
          creditCode: String(this.form.creditCode || '').trim().toUpperCase(),
          legalName: this.form.legalName,
          legalCode: this.form.legalCode,
          contactName: this.form.contactName,
          contactPhone: this.form.contactPhone,
          province: this.form.province,
          city: this.form.city,
          district: this.form.district,
          address: this.form.address,
          remark: this.form.remark,
          businessLicense: this.form.businessLicense,
          cylinderFillLicense: this.form.cylinderFillLicense,
          dangerBusinessLicense: this.form.dangerBusinessLicense,
          specialEquipmentLicense: this.form.specialEquipmentLicense
        }
        try {
          await registerCompany(payload)
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
  width: 620px;
  padding: 25px 25px 5px 25px;
  max-height: 80%;
  overflow-y: auto;
}
.back-entry {
  text-align: center;
  margin: 0 0 18px 0;
  font-size: 13px;
}
</style>
