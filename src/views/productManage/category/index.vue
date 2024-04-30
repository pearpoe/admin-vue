<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="类目名称" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入类目名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['productManage:category:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="tableData"
      row-key="categoryId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="categoryName" label="类目名称" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['productManage:category:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['productManage:category:add']"
            >新增</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['productManage:category:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <treeselect
                v-model="form.parentId"
                :options="categoryOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="选择上级类目"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="类目名称" prop="categoryName">
              <el-input v-model="form.categoryName" placeholder="请输入类目名称" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import _ from 'lodash'
const list = [
  { categoryId: 1, categoryName: '类目1', parentId: 0, createTime: 1585228800000 },
  { categoryId: 2, categoryName: '类目2', parentId: 0, createTime: 1585228800000 },
  { categoryId: 3, categoryName: '类目2-1', parentId: 2, createTime: 1585228800000 },
  { categoryId: 4, categoryName: '类目2-2', parentId: 2, createTime: 1585228800000 }
]
export default {
  components: { Treeselect },
  props: {},
  data() {
    return {
      loading: false,
      tableData: [],
      showSearch: true,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      queryParams: {
        categoryName: ''
      },
      categoryOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        categoryName: [{ required: true, message: '类目名称不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.categoryId,
        label: node.categoryName,
        children: node.children
      }
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      setTimeout(() => {
        this.categoryOptions = []
        const menu = { categoryId: 0, categoryName: '主类目', children: [] }
        menu.children = this.handleTree(list, 'categoryId')
        this.categoryOptions.push(menu)
      }, 1000)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        categoryId: undefined,
        parentId: 0,
        categoryName: undefined
      }
      this.resetForm('form')
    },
    getList() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.tableData = this.handleTree(list, 'categoryId')
      }, 1000)
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      this.getTreeselect()
      if (row != null && row.categoryId) {
        this.form.parentId = row.categoryId
      } else {
        this.form.parentId = 0
      }
      this.open = true
      this.title = '添加类目'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      this.form = _.cloneDeep(row)
      console.log(`🚀 ~  this.form :`, this.form)

      this.open = true
      this.title = '修改类目'
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal
        .confirm('是否确认删除名称为"' + row.categoryName + '"的数据项？')
        .then(function () {
          // return delMenu(row.categoryId);
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.categoryId != undefined) {
            // updateMenu(this.form).then(response => {
            //   this.$modal.msgSuccess('修改成功')
            //   this.open = false
            //   this.getList()
            // })
          } else {
            // addMenu(this.form).then(response => {
            //   this.$modal.msgSuccess('新增成功')
            //   this.open = false
            //   this.getList()
            // })
          }
        }
      })
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
