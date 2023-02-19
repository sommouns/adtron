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
    <el-table v-loading="loading" row-key="id" :data="crList" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column key="na" width="500" label="类目名称" align="left" prop="na" />
      <el-table-column key="ta" width="200" label="是否能投放" align="left" prop="ta" >
        <template slot-scope="scope">
          <span v-if="scope.row.ta == true">可投放</span>
        </template>
      </el-table-column>
      <el-table-column key="id"  label="类目ID" align="left" prop="id" /> 
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
import { categoryList } from "@/api/amazon/category";
import { allAccount } from "@/api/amazon/account";
export default {
  name: "Cr",
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      crList: [],
      accountList: [],
      // 查询参数
      queryParams: {
        shopId: null,
        pageNum : 1,
        pageSize : 10,
      },
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
      if(this.queryParams.shopId==null){
        this.$modal.msgWarning("请选择店铺");
        return ;
      }
      this.loading = true;
      categoryList(this.queryParams).then((response) => {
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
