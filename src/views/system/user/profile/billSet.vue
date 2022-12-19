<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="informationList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="账号" align="center" prop="accountName" />
      <el-table-column label="企业名称" align="center" prop="gmfMc" />
      <el-table-column label="纳税人识别号" align="center" prop="gmfNsrsbh" />
      <el-table-column label="企业地址" align="center" prop="gmfDz" />
      <el-table-column label="企业电话" align="center" prop="gmfDh" />
      <el-table-column label="银行账号" align="center" prop="gmfYhzh" />
      <el-table-column label="开户行" align="center" prop="gmfYhdz" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:information:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改开票信息设置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
         <el-form-item label="账号" prop="accountId">
          <el-select
            v-model="form.accountId" placeholder="请选择账号" clearable size="small" style="width: 240px" >
            <el-option  v-for="item in accountList" :key="item.id" :label="item.accountName + '-' +  item.site"
              :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="企业名称" prop="gmfMc">
          <el-input v-model="form.gmfMc" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="纳税人识别号" prop="gmfNsrsbh">
          <el-input v-model="form.gmfNsrsbh" placeholder="请输入纳税人识别号" />
        </el-form-item>
        <el-form-item label="企业地址" prop="gmfDz">
          <el-input v-model="form.gmfDz" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="企业电话" prop="gmfDh">
          <el-input v-model="form.gmfDh" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="银行账号" prop="gmfYhzh">
          <el-input v-model="form.gmfYhzh" placeholder="请输入银行账号" />
        </el-form-item>
        <el-form-item label="开户行" prop="gmfYhdz">
          <el-input v-model="form.gmfYhdz" placeholder="请输入地址" />
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
import {
  listInformation,
  getInformation,
  delInformation,
  addInformation,
  updateInformation,
} from "@/api/amazon/billSet";
import {allAccount} from "@/api/amazon/account";

export default {
  name: "Information",
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
      // 开票信息设置表格数据
      informationList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      accountList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        accountId: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        accountId: [
          { required: true, message: "账号不能为空", trigger: "blur" },
        ],
        gmfNsrsbh: [
          { required: true, message: "纳税人识别号不能为空", trigger: "blur" },
        ],
        gmfMc: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        gmfDz: [
          { required: false, message: "地址不能为空", trigger: "blur" },
        ],
        gmfDh: [
          { required: false, message: "电话不能为空", trigger: "blur" },
        ],
        gmfSj: [{ required: false, message: "手机不能为空", trigger: "blur" }],
        gmfEmail: [
          { required: false, message: "邮箱不能为空", trigger: "blur" },
        ],
        gmfYhzh: [
          { required: false, message: "银行账号不能为空", trigger: "blur" },
        ],
        gmfYhdz: [
          { required: false, message: "开户行不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.allAccountList();
  },
  methods: {
    /** 查询开票信息设置列表 */
    getList() {
      this.loading = true;
      listInformation(this.queryParams).then((response) => {
        this.informationList = response.rows;
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
        userId: null,
        accountId: null,
        gmfNsrsbh: null,
        gmfMc: null,
        gmfDz: null,
        gmfDh: null,
        gmfSj: null,
        gmfEmail: null,
        gmfYhzh: null,
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
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加开票信息设置";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getInformation(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改开票信息设置";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateInformation(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addInformation(this.form).then((response) => {
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
      this.$modal
        .confirm('是否确认删除开票信息设置编号为"' + ids + '"的数据项？')
        .then(function () {
          return delInformation(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },

    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },
  },
};
</script>
