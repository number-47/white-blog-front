<template>
  <div class="container">
    <div class="topFilter">
      <el-input
        v-model="menuFilter.name"
        placeholder="菜单名称"
        class="search"
      />
      <el-button type="primary" icon="el-icon-search" @click="getAllMenus()">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate()">新增</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="menuList"
      height="450px"
      style="width: 100%;margin-bottom: 10px;"
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column
        prop="name"
        label="菜单"
        fixed
        width="180"
      />
      <el-table-column
        prop="title"
        label="标题"
        width="180"
      />
      <el-table-column
        prop="path"
        label="路径"
        width="180"
      />
      <el-table-column
        prop="type"
        label="类型"
        width="180"
      >
        <template slot-scope="{row}">
          <el-tag :key="row.type" type="info">
            {{ row.type === '0' ? '菜单':'按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="permissionDirect"
        label="权限指令"
        width="180"
      />
      <el-table-column
        prop="icon"
        label="图标"
        width="180"
      />
      <el-table-column
        prop="component"
        label="组件"
        width="180"
      />
      <el-table-column
        prop="hidden"
        label="是否隐藏"
        width="180"
      >
        <template slot-scope="{row}">
          <el-tag :key="row.hidden" :type="row.hidden===true?'success':'info'">
            {{ row.hidden == true ? '是':'否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="redirect"
        label="重定向"
        width="180"
      />
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
        fixed="right"
        label="操作"
        width="150"
      >
        <template slot-scope="{row,$index}">
          <el-button type="text" size="small" @click="handleClickView(row)">查看</el-button>
          <el-button v-has-permission="['menu:update']" type="text" size="small" @click="handleClickUpdate(row)">编辑</el-button>
          <el-button v-has-permission="['menu:delete']" type="text" size="small" @click="handleClickDelete(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="menuForm" :model="menuForm" :rules="rules" :label-position="labelPosition" label-width="90px">
        <el-form-item label="父菜单" prop="parentId">
          <treeselect
            v-model="menuForm.parentId"
            style="width: 501px"
            :flat="true"
            :sort-value-by="sortValueBy"
            :default-expand-level="1"
            :multiple="false"
            :options="selectMenuList"
            placeholder="选择父菜单..."
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="menuForm.name" />
        </el-form-item>
        <el-form-item v-if="menuForm.type === '0'" label="路径" prop="path">
          <el-input v-model="menuForm.path" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="menuForm.type">
            <el-radio label="0">菜单</el-radio>
            <el-radio label="1">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限指令" prop="permissionDirect">
          <el-input v-model="menuForm.permissionDirect" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="menuForm.title" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="menuForm.icon" />
        </el-form-item>
        <el-form-item label="是否隐藏" prop="hidden">
          <el-switch v-model="menuForm.hidden" />
        </el-form-item>
        <el-form-item v-if="menuForm.type === '0'" label="组件名" prop="component">
          <el-input v-model="menuForm.component" />
        </el-form-item>
        <el-form-item v-if="menuForm.type === '0'" label="重定向" prop="redirect">
          <el-input v-model="menuForm.redirect" />
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
  </div>
</template>

<script>
import { getAllMenu, addMenu, updateMenu, deleteMenu } from '@/api/menus'
import { parseTime } from '@/utils'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'AdminMenu',
  components: { Treeselect },
  data() {
    return {
      selectParentMenu: { id: '', name: '' },
      textMap: {
        update: '编辑',
        create: '新增',
        view: '查看'
      },
      listLoading: true,
      dialogFormVisible: false,
      dialogStatus: '',
      labelPosition: 'center',
      menuFilter: {
        name: ''
      },
      menuList: [],
      selectMenuList: [],
      sortValueBy: 'ORDER_SELECTED',
      parentMenu: {
        id: '0',
        label: '根节点',
        name: '根节点',
        parentId: 0,
        title: '根节点'
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      menuForm: {
        id: '',
        type: '0',
        component: '',
        hidden: false,
        permissionDirect: '',
        icon: '',
        name: '',
        parentId: '',
        path: '',
        redirect: '',
        sequence: 0
      },
      rules: {
        parentId: [
          { required: true, message: '请输入父菜单', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入路径', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  created() {
    this.getAllMenus()
  },
  methods: {
    getAllMenus() {
      this.listLoading = true
      getAllMenu(this.menuFilter).then(response => {
        this.menuList = response.data
        this.selectMenuList = Object.assign([], this.menuList) // copy obj
        this.selectMenuList.unshift(this.parentMenu)
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    DefaultValueForm() {
      this.menuForm = {
        id: '',
        type: '0',
        component: '',
        hidden: false,
        permissionDirect: '',
        icon: '',
        name: '',
        parentId: 0,
        path: '',
        redirect: '',
        sequence: 0
      }
      this.selectParentMenu = { id: '', name: '' }
    },
    handleCreate() {
      this.DefaultValueForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['menuForm'].validate((valid) => {
        if (valid) {
          this.menuForm.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.menuForm.createTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
          addMenu(this.menuForm).then(() => {
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getAllMenus()
            this.dialogFormVisible = false
            this.$refs['menuForm'].resetFields()
            this.selectParentMenu = { id: '', name: '' }
          })
        }
      })
    },
    updateData() {
      this.$refs['menuForm'].validate((valid) => {
        if (valid) {
          this.menuForm.updateTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
          updateMenu(this.menuForm).then(() => {
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getAllMenus()
            this.dialogFormVisible = false
            this.$refs['menuForm'].resetFields()
            this.selectParentMenu = { id: '', name: '' }
          })
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.selectParentMenu = { id: '', name: '' }
    },
    handleNodeClick: function(node) {
      this.selectParentMenu.id = node.id
      this.selectParentMenu.name = node.name
      this.menuForm.parentId = node.id
      this.$refs.selectReport.blur()
    },
    handleClickView(row) {
      this.menuForm = row
      this.dialogStatus = 'view'
      this.dialogFormVisible = true
    },
    handleClickUpdate(row) {
      this.menuForm = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    handleClickDelete(row, index) {
      if (row.children !== undefined && row.children.length !== 0) {
        this.$notify({
          title: 'Info',
          message: '请先删除子菜单',
          type: 'info',
          duration: 2000
        })
      } else {
        this.$confirm('此操作将永久菜单，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteMenu(row.id).then(() => {
            this.getAllMenus()
            this.$notify({
              title: 'Success',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
        }).catch(() => {
          this.$notify({
            title: 'Info',
            message: '已取消删除',
            type: 'info',
            duration: 2000
          })
        })
      }
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
