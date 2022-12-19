<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动集id" prop="campaignsId">
        <el-input
          v-model="queryParams.campaignsId"
          placeholder="请输入活动集id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动集标题" prop="campaignsName">
        <el-input
          v-model="queryParams.campaignsName"
          placeholder="请输入活动集标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="词根" prop="rootWord">
        <el-input
          v-model="queryParams.rootWord"
          placeholder="请输入词根"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="点击数" prop="clickNum">
        <el-input
          v-model="queryParams.clickNum"
          placeholder="请输入点击数"
          clearable
          size="small"
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
          v-hasPermi="['system:rootword:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:rootword:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:rootword:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:rootword:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="rootwordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="${comment}" align="center" prop="id" />
      <el-table-column label="活动集id" align="center" prop="campaignsId" />
      <el-table-column label="活动集标题" align="center" prop="campaignsName" />
      <el-table-column label="词根" align="center" prop="rootWord" />
      <el-table-column label="点击数" align="center" prop="clickNum" />
      <el-table-column label="搜索词" align="center" prop="searchKeyword" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:rootword:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:rootword:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改否定-活动集词根拆解对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动集id" prop="campaignsId">
          <el-input v-model="form.campaignsId" placeholder="请输入活动集id" />
        </el-form-item>
        <el-form-item label="活动集标题" prop="campaignsName">
          <el-input v-model="form.campaignsName" placeholder="请输入活动集标题" />
        </el-form-item>
        <el-form-item label="词根" prop="rootWord">
          <el-input v-model="form.rootWord" placeholder="请输入词根" />
        </el-form-item>
        <el-form-item label="点击数" prop="clickNum">
          <el-input v-model="form.clickNum" placeholder="请输入点击数" />
        </el-form-item>
        <el-form-item label="搜索词" prop="searchKeyword">
          <el-input v-model="form.searchKeyword" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRootword, getRootword, delRootword, addRootword, updateRootword } from "@/api/system/rootword";

export default {
  name: "Rootword",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 否定-活动集词根拆解表格数据
      rootwordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        campaignsId: null,
        campaignsName: null,
        rootWord: null,
        clickNum: null,
        searchKeyword: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        campaignsId: [
          { required: true, message: "活动集id不能为空", trigger: "blur" }
        ],
        rootWord: [
          { required: true, message: "词根不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询否定-活动集词根拆解列表 */
    getList() {
      this.loading = true;
      listRootword(this.queryParams).then(response => {
        this.rootwordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        campaignsId: null,
        campaignsName: null,
        rootWord: null,
        clickNum: null,
        searchKeyword: null,
        createTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加否定-活动集词根拆解";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRootword(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改否定-活动集词根拆解";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRootword(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRootword(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除否定-活动集词根拆解编号为"' + ids + '"的数据项？').then(function() {
        return delRootword(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/rootword/export', {
        ...this.queryParams
      }, `rootword_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
