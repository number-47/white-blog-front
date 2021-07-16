<template>
  <el-form ref="dataForm" status-icon :rules="rules" :model="ruleForm" label-position="left" label-width="80px">
    <el-form-item v-if="false" label="id" prop="id">
      <el-input v-model="ruleForm.id" :disabled="disabled" />
    </el-form-item>
    <el-form-item v-if="false" label="登录名" prop="username">
      <el-input v-model="ruleForm.username" :disabled="disabled" />
    </el-form-item>
    <el-form-item label="旧密码" prop="oldPass">
      <el-input v-model="ruleForm.oldPass" type="password" autocomplete="off" />
    </el-form-item>
    <el-form-item label="密码" prop="pass">
      <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
    </el-form-item>
    <el-form-item label="确认密码" prop="checkPass">
      <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">更新</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { modifyPass } from '@/api/user'
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          id: '',
          username: '',
          name: '',
          email: '',
          avatar: '',
          phone: ''
        }
      }
    }
  },
  data() {
    var validateOldPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入旧密码'))
      } else {
        callback()
      }
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.dataForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      ruleForm: {
        id: undefined,
        username: '',
        oldPass: '',
        pass: '',
        checkPass: ''
      },
      rules: {
        oldPass: [
          { validator: validateOldPass, trigger: 'blur' }
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      console.log('我要更新')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.ruleForm.id = this.user.id
          this.ruleForm.username = this.user.username
          const tempData = Object.assign({}, this.ruleForm)
          modifyPass(tempData).then(() => {
            this.$notify({
              title: 'Success',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
