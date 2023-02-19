<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="店铺账号" prop="shopId">
        <el-select
          v-model="queryParams.shopId"
          placeholder="请选择店铺账号"
          clearable
          size="mini"
        >
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :label="item.accountName + '-' + item.site"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动名称" prop="campaignName">
        <el-input
          v-model="queryParams.campaignName"
          placeholder="请输入活动名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="投放词" prop="searchText">
        <el-input
          v-model="queryParams.searchText"
          placeholder="请输入投放词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="暂停状态" prop="suspendStatus">
        <el-select
          v-model="queryParams.suspendStatus"
          placeholder="请选择暂停类型"
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in suspendStatusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:term:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleAllNegative"
          >一键暂停</el-button
        >
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleCancel"
          >取消</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="termList"  :default-sort="defaultSort"
      @sort-change="handleSortChange">
      <el-table-column label="店铺名称" align="center" prop="shopName" />
      <el-table-column label="活动名称" align="center" prop="campaignName" />
      <el-table-column label="投放词" align="center" prop="keywordText" />
      <el-table-column label="拆分词" align="center" prop="splitText" />
      <el-table-column label="拆分词次数" align="center" prop="splitCount" />
      <el-table-column label="暂停过搜索词" align="center" prop="suspendStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.suspendStatus == '0'">否</span>
          <span v-if="scope.row.suspendStatus == '1'">是</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建日期"
        align="center"
        prop="createTime"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="220"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete-solid"
            v-show="scope.row.suspendStatus === 0"
            @click="handleNegative(scope.row)"
            >暂停投放词
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page-sizes="[100, 200, 300, 500]"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 否定投放词 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="90px">
        <el-form-item label="暂停投放词" prop="cancelText">
          <el-input
            v-model="form.cancelText"
            type="textarea"
            :rows="10"
            placeholder="请输入投放词,多个逗号隔开 最多输入100个"
          />
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
import { listTerm, negative, negativeAll, cancel } from "@/api/amazon/suspend";
import { allAccount } from "@/api/amazon/account";
export default {
  name: "Term",
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
      // 否定关键字表格数据
      termList: [],
      accountList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 100,
        shopId: null,
        negativeType: null,
        negativeStatus: null,
        searchText: null,
        campaignName: null,
        keywordText: null,
      },
      // 表单参数
      form: {
        cancelText: undefined,
      },
      suspendStatusList: [
        { label: "全部", value: null },
        { label: "否", value: 0 },
        { label: "是", value: 1 },
      ],
      defaultSort: { prop: "createTime", order: "descending" },
    };
  },
  created() {
    allAccount().then((response) => {
      this.accountList = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询否定关键字列表 */
    getList() {
      this.loading = true;
      listTerm(this.queryParams).then((response) => {
        this.termList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    // 表单重置
    reset() {
      this.form = {
        id: null,
        shopId: null,
        campaignName: null,
        negativeType: null,
        keywordText: null,
      };
      this.resetForm("form");
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    handleNegative(row) {
      negative(row.id).then(() => {
        this.$modal.msgSuccess("否定关键词成功");
        getList();
      });
    },
    handleAllNegative() {
      if (this.queryParams.shopId === null) {
        this.$modal.msgError("请选择需要否定的店铺");
        return;
      }
      this.$confirm("确定要否定店铺所有投放词吗？", "提示", {
        type: "danger",
      }).then(() => {
        negativeAll(this.queryParams.shopId).then(() => {
          this.$modal.msgSuccess("一键暂停投放词成功");
          getList();
        });
      });
    },
    /** 新增按钮操作 */
    handleCancel() {
      this.open = true;
      this.title = "取消否词";
    },
    /** 提交按钮 */
    submitForm() {
      cancel(this.form.cancelText).then(() => {
        this.$modal.msgSuccess("取消暂停成功");
        getList();
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    handleSortChange(column, prop) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "/system/suspend/export",
        {
          ...this.queryParams,
        },
        `暂停记录_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
