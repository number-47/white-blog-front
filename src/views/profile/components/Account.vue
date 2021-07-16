<template>
  <el-form ref="dataForm" status-icon :rules="rules" :model="temp" label-position="left" label-width="80px">
    <el-form-item label="用户名" prop="username">
      <el-input v-model.trim="temp.username" />
    </el-form-item>
    <el-form-item label="昵称" prop="name">
      <el-input v-model.trim="temp.name" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model.trim="temp.email" />
    </el-form-item>
    <el-form-item label="手机" prop="phone">
      <el-input v-model.trim="temp.phone" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">更新</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUser } from '@/api/user'
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
    return {
      temp: {
        id: undefined,
        username: '',
        name: '',
        phone: '',
        avatar: '',
        email: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在2到15个字符', trigger: 'blur' }
        ],
        name: [{ required: true, min: 1, max: 15, message: '长度在1到15个字符', trigger: 'blur' }],
        phone: [{ min: 11, max: 11, message: '手机号不正确', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
      }
    }
  },
  created() {
    this.temp = JSON.parse(JSON.stringify(this.user))
  },
  methods: {
    submit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData).then(() => {
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
      this.$emit('accountUpdate', this.temp)
    }
  }
}
</script>
