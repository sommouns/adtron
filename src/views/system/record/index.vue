<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="状态" prop="recordType">
        <el-select
          v-model="queryParams.recordType"
          placeholder="请选择明细类型"
          size="small"
          style="width: 240px"
        >
          <el-option label="充值记录" value="0" key="0"> </el-option>
          <el-option label="消费记录" value="1" key="1"> </el-option>
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

    <el-table v-loading="loading" :data="recordList">
      <!-- <el-table-column label="用户ID" align="center" prop="userId" /> -->
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="记录类型" align="center" prop="recordType">
        <template slot-scope="scope">
          <span v-if="scope.row.recordType == '0'">充值记录</span>
          <span v-if="scope.row.recordType == '1'">消费记录</span>
        </template>
      </el-table-column>
      <el-table-column label="消费金额(元)" align="center" prop="money" />
      <el-table-column label="记录时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
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
import { listRecord } from "@/api/system/record";

export default {
  name: "Record",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 费用明细表格数据
      recordList: [],
      // 弹出层标题
      title: "",
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        recordType: null,
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询费用明细列表 */
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then((response) => {
        this.recordList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
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
