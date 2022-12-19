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

      <el-form-item
        label="广告活动名称"
        label-width="100px"
        prop="campaignName"
      >
        <el-input
          v-model="queryParams.campaignName"
          placeholder="请输入广告活动名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告组名称" label-width="100px" prop="advGroupName">
        <el-input
          v-model="queryParams.advGroupName"
          placeholder="请输入广告组名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="投放词" label-width="70px" prop="query">
        <el-input
          v-model="queryParams.keywordText"
          placeholder="请输入投放词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="搜索词" label-width="70px" prop="query">
        <el-input
          v-model="queryParams.query"
          placeholder="请输入搜索词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="否定状态" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择否定类型"
          size="small"
          style="width: 80px"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="时间">
        <div class="block">
          <el-date-picker
            style="width: 240px"
            @change="getTime"
            v-model="queryParams.dateTimeString"
            type="daterange"
            align="right"
            size="small"
            unlink-panels
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </div>
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
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="suspend"
          >一键否定</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="queryList"
      @selection-change="handleSelectionChange"
      height="650"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="账户名称" align="center" prop="accountName" />
      <el-table-column label="活动" align="center" prop="campaignName" />
      <el-table-column label="广告组名称" align="center" prop="advGroupName" />
      <el-table-column label="投放词" align="center" prop="keywordText" />
      <el-table-column label="搜索词" align="center" prop="query" />
      <el-table-column label="投放词标签" align="center" prop="keywordLabel" />
      <el-table-column label="搜索词标签" align="center" prop="queryLabel" />
      <el-table-column label="时间" align="center" prop="dateTime" />
      <el-table-column label="是否否定" align="center" prop="type">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_lab_negative_yes_no" :value="scope.row.type"/>
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
import { listQuery, suspend } from "@/api/amazon/labSearch";
import { allAccount } from "@/api/amazon/account";

export default {
  name: "Query",
  dicts: ['sys_show_hide', 'sys_lab_negative_yes_no'],
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
      // 打标否定关键字表格数据
      queryList: [],
      accountList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accountId: null,
        campaignName: null,
        advGroupName: null,
        negativeType: null,
        query: null,
        keywordText: null,
        dateTimeString:undefined,
      },
      // 表单参数
      form: {},

      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "昨天",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      typeList: [
        { label: "全部", value: null },
        { label: "否", value: 0 },
        { label: "是", value: 1 },
      ],
    };
  },
  created() {
    const now = new Date();
    const day7 = new Date(now.getTime() - 6 * 3600 * 1000 * 24);
    const yesteday = new Date(now.getTime());
    let time1 = this.parseTime(day7, "{y}-{m}-{d}");
    let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
    this.queryParams.startDate = time1;
    this.queryParams.endDate = time2;
    this.queryParams.dateTimeString = [time1, time2];
    allAccount().then((response) => {
      this.accountList = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询打标否定关键字列表 */
    getList() {
      this.loading = true;
      listQuery(this.queryParams).then((response) => {
        this.queryList = response.rows;
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
        campaignName: null,
        advGroupName: null,
        negativeType: null,
        query: null,
         keywordText: null,
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    getTime() {
      if (
        this.queryParams.dateTimeString != undefined &&
        this.queryParams.dateTimeString != null
      ) {
        this.queryParams.startDate = this.queryParams.dateTimeString[0];
        this.queryParams.endDate = this.queryParams.dateTimeString[1];
      } else {
        this.queryParams.startDate = null;
        this.queryParams.endDate = null;
      }
    },
    suspend() {
      if (this.ids.length == 0) {
        this.$modal.msgError("请选择需要否定的数据");
        return;
      }
      suspend(this.ids).then(() => {
        this.getList();
        this.$message.success("执行成功");
      }).catch(() => {});
    },
  },
};
</script>
