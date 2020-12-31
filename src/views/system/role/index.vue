<template>
  <div class="container">
    <div class="topFilter">
      <el-input
        v-model="roleFilter.name"
        placeholder="角色名称"
        class="search"
      />
      <el-button type="primary" icon="el-icon-search" @click="getAllroles()">搜索</el-button>
      <el-button v-has-permission="['role:add']" type="primary" icon="el-icon-plus" @click="handleCreate()">新增</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="roleList"
      height="350px"
      style="width: 100%;margin-bottom: 10px;"
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column
        prop="name"
        label="角色"
        fixed
        width="180"
      />
      <el-table-column
        prop="nameZh"
        label="角色ZH"
        width="180"
      />
      <el-table-column
        prop="icon"
        label="是否可用"
        width="100"
      >
        <template slot-scope="{row}">
          <el-tag :key="row.enabled" :type="row.enabled===true?'success':'info'">
            {{ row.enabled == true ? '启用':'禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        width="180"
      />
      <el-table-column
        prop="updateTime"
        label="更新时间"
        width="180"
      />
      <el-table-column
        label="操作"
      >
        <template slot-scope="{row,$index}">
          <el-button type="text" size="small" @click="handleClickView(row)">查看</el-button>
          <el-button v-has-permission="['role:update']" type="text" size="small" @click="handleClickUpdate(row)">编辑</el-button>
          <el-button v-has-permission="['role:update']" type="text" size="small" @click="handleDistributeUser(row)">分配用户</el-button>
          <el-button v-has-permission="['role:delete']" type="text" size="small" @click="handleClickDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getAllroles" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" :inline="true" :label-position="labelPosition" label-width="90px" size="mini">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色ZH" prop="nameZh">
          <el-input v-model="roleForm.nameZh" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled" style="width: 164px;">
          <el-switch v-model="roleForm.enabled" />
        </el-form-item>
        <el-form-item label="菜单权限" prop="menuIds" label-width="200">
          <treeselect
            v-model="roleForm.menuIds"
            style="width: 320px"
            :flat="true"
            :sort-value-by="sortValueBy"
            :default-expand-level="1"
            :multiple="true"
            :options="menuList"
            placeholder="选择菜单..."
          />
        </el-form-item>
      </el-form>
      <div v-show="dialogStatus!=='view'" slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="分配用户" :visible.sync="distributeUserFormVisible">
      <user :distribute-user-form-visible="true" @selectUsers="getUsers($event)" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="distributeUserFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="distributeUser()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAllRole, addRole, updateRole, deleteRole, distributeUser } from '@/api/roles'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getAllMenu } from '@/api/menus'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import User from '@/views/system/user/index'
export default {
  name: 'Role',
  components: { Pagination, Treeselect, User },
  data() {
    return {
      textMap: {
        update: '编辑',
        create: '新增',
        view: '查看'
      },
      dialogFormVisible: false,
      distributeUserFormVisible: false,
      dialogStatus: '',
      labelPosition: 'right',
      roleFilter: {
        name: undefined
      },
      sortValueBy: 'ORDER_SELECTED',
      menuList: [],
      roleList: [],
      roleForm: {
        id: '',
        enabled: false,
        name: '',
        nameZh: '',
        menuIds: null
      },
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: undefined
      },
      menuFilter: {
        name: undefined
      },
      data: this.menuList,
      defaultProps: {
        children: 'childrenList',
        label: 'menuName'
      },
      nodeKey: 'menuId',
      defaultCheckedKeys: [],
      users: null,
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    treeSize() {
      return this.size || 'small'
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.getAllroles()
    this.getAllMenus()
    // 注意：初始化defaultCheckedKeys时，在created里面
    // 父组件先执行自己的created，然后子组件开始执行自己的created和mounted，最后父组件再执行自己的mounted。
    // 因为此页面加载，先执行该组件自己的created，然后执行TreeSelect组件的created和mounted，最后执行该组件的mounted
    this.defaultCheckedKeys = [1000]
  },
  methods: {
    getAllMenus() {
      getAllMenu(this.menuFilter).then(response => {
        console.log(response)
        this.menuList = response.data
      })
    },
    getUsers(event) {
      this.users = event
    },
    getAllroles() {
      this.listLoading = true
      getAllRole(this.roleFilter).then(response => {
        this.roleList = response.data.list
        this.total = response.data.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    DefaultValueForm() {
      this.roleForm = {
        id: '',
        enabled: false,
        name: '',
        nameZh: '',
        menuIds: null
      }
    },
    handleCreate() {
      this.DefaultValueForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['roleForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['roleForm'].validate((valid) => {
        if (valid) {
          this.roleForm.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.roleForm.createTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
          this.roleForm.updateTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
          addRole(this.roleForm).then(() => {
            this.roleList.unshift(this.roleForm)
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
    updateData() {
      this.$refs['roleForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.roleForm)
          tempData.updateTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
          updateRole(tempData).then(() => {
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getAllroles()
            this.dialogFormVisible = false
            this.$refs['roleForm'].resetFields()
            this.selectParentrole = { id: '', name: '' }
          })
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    handleNodeClick: function(node) {
      this.selectParentMenu.id = node.id
      this.selectParentMenu.name = node.name
      this.menuForm.parentId = node.id
      this.$refs.selectReport.blur()
    },
    handleClickView(row) {
      this.roleForm = row
      this.dialogStatus = 'view'
      this.dialogFormVisible = true
    },
    handleClickUpdate(row) {
      this.roleForm = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleDistributeUser(row) {
      this.roleForm = Object.assign({}, row) // copy obj
      this.distributeUserFormVisible = true
    },
    handleClickDelete(row, index) {
      this.$confirm('此操作将永久角色，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRole(row.id).then(() => {
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.roleList.findIndex(v => v.id === row.id)
          this.roleList.splice(index, 1)
        })
      }).catch(() => {
        this.$notify({
          title: 'Info',
          message: '已取消删除',
          type: 'info',
          duration: 2000
        })
      })
    },
    distributeUser() {
      distributeUser(this.roleForm.id, this.users).then(() => {
        this.distributeUserFormVisible = false
        this.$notify({
          title: 'Success',
          message: '分配成功',
          type: 'success',
          duration: 2000
        })
      })
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
<style scoped>
.container{
  margin: 10px;
}
.topFilter{
  margin: 10px;
}
.search{
  width: 40%;
  margin-right: 10px;
}
.left {
    padding: 10px;
    float: left;
    width: 200px;
    height: 100%;
}
.right {
    padding: 10px;
    margin-left: 200px;
}
.sub{
    width:100%;
    height:100%;  /*设置div的大小*/
    text-align: center;        /*文字水平居中对齐*/
    overflow:hidden;
}
</style>
