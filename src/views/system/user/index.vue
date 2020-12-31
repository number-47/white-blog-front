<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px;margin-right:10px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.enabled" placeholder="状态" clearable class="filter-item" style="width: 130px;margin-right:10px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-show="distributeUserFormVisible===false" v-has-permission="['user:add']" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-show="distributeUserFormVisible===false" v-has-permission="['user:export']" v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      :fit="true"
      highlight-current-row
      height="350"
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="false" label="id" prop="id" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column label="用户名" prop="username" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" prop="name" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" prop="phone" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮件" width="170px" align="center" min-width="140px">
        <template slot-scope="{row}">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="90px">
        <template slot-scope="{row}">
          <el-tag :key="row.enabled" :type="row.enabled===true?'success':'info'">
            {{ row.enabled == true ? '启用':'禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="distributeUserFormVisible===false" label="操作" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-has-permission="['user:edit']" type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.enabled==true" v-has-permission="['user:update']" size="mini" type="info" @click="handleModifyStatus(row,false)">
            禁用
          </el-button>
          <el-button v-if="row.enabled==false" v-has-permission="['user:update']" size="mini" type="success" @click="handleModifyStatus(row,true)">
            启用
          </el-button>
          <el-button v-if="row.status!='deleted'" v-has-permission="['user:delete']" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" status-icon :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="状态" prop="enabled">
          <el-select v-model="temp.enabled" class="filter-item" placeholder="请选择">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="false" label="id" prop="id">
          <el-input v-model="temp.id" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <treeselect
            v-model="temp.roles"
            style="width: 320px"
            :flat="true"
            :sort-value-by="sortValueBy"
            :default-expand-level="1"
            :multiple="true"
            :options="roles"
            placeholder="选择角色..."
          />
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="邮件" prop="checkEmail">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { userList, updateUser, createUser, deleteUser } from '@/api/user'
import { getAllRoleWithoutPage } from '@/api/roles'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const calendarTypeOptions = [
  { key: false, display_name: '禁用' },
  { key: true, display_name: '启用' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'User',
  components: { Pagination, Treeselect },
  directives: { waves },
  filters: {
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  props: {
    distributeUserFormVisible: {
      type: Boolean,
      default: () => {
        return false
      }
    }
  },
  data() {
    var checkEmail = (rules, value, callback) => {
      if (!value) {
        callback()
      }
      var reg = new RegExp('^[a-z0-9A-Z]+[-|a-z0-9A-Z._]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$')
      if (!reg.test(value)) {
        return callback(new Error('邮箱格式不正确'))
      }
    }
    return {
      sortValueBy: 'ORDER_SELECTED',
      users: null,
      roles: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        username: undefined,
        enabled: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      temp: {
        id: undefined,
        username: '',
        name: '',
        phone: '',
        email: '',
        enabled: true,
        createTime: '',
        checkEmail: '',
        roles: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        enabled: [{ required: true, message: '请选择用户状态', trigger: 'change' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在2到15个字符', trigger: 'blur' }
        ],
        name: [{ min: 1, max: 15, message: '长度在1到15个字符', trigger: 'blur' }],
        phone: [{ min: 11, max: 11, message: '手机号不正确', trigger: 'blur' }],
        checkEmail: [{ validator: checkEmail, trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getAllroles()
  },
  methods: {
    getAllroles() {
      getAllRoleWithoutPage().then(response => {
        this.roles = response.data
      })
    },
    getList() {
      this.listLoading = true
      userList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      if (this.listQuery.username === '') {
        this.listQuery.username = undefined
      }
      if (this.listQuery.enabled === '') {
        this.listQuery.enabled = undefined
      }
      this.getList()
    },
    handleModifyStatus(row, status) {
      row.enabled = status
      updateUser(row).then(() => {
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: '操作成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        name: '',
        phone: '',
        email: '',
        enabled: true,
        createTime: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.createTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
          createUser(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateUser(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.id).then(() => {
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
        const index = this.list.findIndex(v => v.id === row.id)
        this.list.splice(index, 1)
      }).catch(() => {
        this.$notify({
          title: 'Info',
          message: '已取消删除',
          type: 'info',
          duration: 2000
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        console.log(j)
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    handleSelectionChange(val) {
      this.users = val
      this.$emit('selectUsers', this.users)
    }
  }
}
</script>
<style>
.el-table__body-wrapper {
    height: 200px; /* 滚动条整体高 必须项 */
    border-right: none;
    overflow-y: scroll;/* overflow-y为了不出现水平滚动条*/
}
.el-table__body-wrapper::-webkit-scrollbar {
    width: 5px;/* 滚动条的宽高 必须项 */
    height: 5px;
}
 .el-table__body-wrapper::-webkit-scrollbar-thumb {
    background-color: #bfcbd9;/* 滚动条的宽 */
    border-radius: 3px;
}
</style>
