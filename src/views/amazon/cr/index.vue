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
      <el-table-column label="店铺账号" align="center" prop="accountName">
        <template slot-scope="scope">
          <span>{{ scope.row.accountName }}-{{ scope.row.site }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动名称" align="center" prop="campaignName" />
      <el-table-column label="活动类型" align="center" prop="campaignType">
        <template slot-scope="scope">
          <span v-if="scope.row.campaignType == '1'">sponsoredProducts</span>
          <span v-if="scope.row.campaignType == '2'">sponsoredDisplay</span>
          <span v-if="scope.row.campaignType == '3'">sponsoredBrands</span>
        </template>
      </el-table-column>
      <el-table-column label="投放类型" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type == '1'">手动广告</span>
          <span v-if="scope.row.type == '2'">自动广告</span>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" prop="state">
        <template slot-scope="scope">
          <span v-if="scope.row.state == '1'">启用</span>
          <span v-if="scope.row.state == '2'">已暂停</span>
          <span v-if="scope.row.state == '3'">已存档</span>
        </template>
      </el-table-column>
      <el-table-column label="转化率" align="center" prop="conversionRate">
        <template slot-scope="scope">
          <span>{{
            scope.row.conversionRate != null
              ? scope.row.conversionRate + "%"
              : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ACOS" align="center" prop="acos">
        <template slot-scope="scope">
          <span>{{
            scope.row.acos != null
              ? scope.row.acos + "%"
              : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="点击数" align="center" prop="clickNum" />
      <el-table-column label="预算活跃占比" align="center" prop="budgetPercent" >
        <template slot-scope="scope">
          <span>{{(scope.row.budgetPercent * 100).toFixed(2)}}%</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
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
  </div>
</template>

<script>
import { listCr } from "@/api/amazon/cr";
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
      // 调价基准转化率表格数据
      crList: [],
      accountList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopId: null,
        campaignName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.allAccountList();
    this.getList();
  },
  methods: {
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },
    /** 查询调价基准转化率列表 */
    getList() {
      this.loading = true;
      listCr(this.queryParams).then((response) => {
        this.crList = response.rows;
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
