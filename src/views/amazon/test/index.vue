<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="店铺账号" prop="accountId">
        <el-select
          v-model="queryParams.accountId"
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
      <el-form-item label="ASIN" prop="campaignIds">
        <el-input
          v-model="queryParams.campaignIds"
          placeholder="请输入ASIN"
          clearable
          size="small"
        />
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
    <el-table v-loading="loading" :data="crList">
      <el-table-column label="词类型" align="center" prop="type" />
      <el-table-column label="核心词根" align="center" prop="keyword" />
      <el-table-column label="词频" align="center" prop="num" />
      <el-table-column label="否定词" align="center" prop="negative" />
      <el-table-column label="花费" align="center" prop="fees" />
      <el-table-column label="备注" align="center" prop="remark" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="page"
      :limit.sync="size"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { test } from "@/api/amazon/cr";
import { allAccount } from "@/api/amazon/account";
export default {
  name: "Cr",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      crList: [],
      accountList: [],
      // 查询参数
      queryParams: {
        accountId: null,
        campaignIds: null,
      },
      page:0,
      size:10,
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.allAccountList();
  },
  methods: {
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },
    getList() {
      // this.loading = true;
      test(this.queryParams).then((response) => {
        this.crList = response.data;
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
        shopId: null,
        campaignId: null,
        conversionRate: null,
        clickNum: null,
        createTime: null,
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
  },
};
</script>
