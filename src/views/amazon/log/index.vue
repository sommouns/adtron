<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户账号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模块" prop="model">
        <el-select
          v-model="queryParams.model"
          placeholder="模块"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in modelList"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in typeList"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="日期">
        <div class="block">
          <el-date-picker
            style="width: 240px"
            @change="getTime"
            v-model="queryParams.dateTime"
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

    <el-table v-loading="loading" :data="logList">
      <el-table-column label="用户账号" align="center" prop="userName" />
      <el-table-column label="模块" align="center" prop="model">
        <template slot-scope="scope">
          <span v-if="scope.row.model == '1'">广告活动</span>
          <span v-if="scope.row.model == '2'">广告组</span>
          <span v-if="scope.row.model == '3'">广告位</span>
          <span v-if="scope.row.model == '4'">广告活动否定</span>
          <span v-if="scope.row.model == '5'">广告</span>
          <span v-if="scope.row.model == '6'">关键词</span>
          <span v-if="scope.row.model == '7'">投放</span>
          <span v-if="scope.row.model == '8'">广告组否词</span>
          <span v-if="scope.row.model == '9'">标签管理</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type == '1'">新增</span>
          <span v-if="scope.row.type == '2'">修改</span>
          <span v-if="scope.row.type == '3'">调价</span>
          <span v-if="scope.row.type == '4'">暂停</span>
          <span v-if="scope.row.type == '5'">否词</span>
        </template>
      </el-table-column>
      <el-table-column label="修改内容" align="center" prop="changeComment" :show-overflow-tooltip="true"/>
      <el-table-column label="操作日期" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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
import { listLog, getLog } from "@/api/amazon/log";

export default {
  name: "Log",
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
      // 用户操作记录表格数据
      logList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        userName: null,
        model: null,
        type: null,
        changeComment: null,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
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
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
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
      modelList: [
        { value: "1", label: "广告活动" },
        { value: "2", label: "广告组" },
        { value: "3", label: "广告位" },
        { value: "4", label: "广告活动否定" },
        { value: "5", label: "广告" },
        { value: "6", label: "关键词" },
        { value: "7", label: "投放" },
        { value: "8", label: "广告组否词" },
        { value: "9", label: "标签管理" },
      ],
      typeList: [
        { value: "1", label: "新增" },
        { value: "2", label: "修改" },
        { value: "3", label: "调价" },
        { value: "4", label: "暂停" },
        { value: "5", label: "否词" },
      ],
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户操作记录列表 */
    getList() {
      this.loading = true;
      listLog(this.queryParams).then((response) => {
        this.logList = response.rows;
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
        userName: null,
        model: null,
        type: null,
        changeComment: null,
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用户操作记录";
    },

    initTime() {
      const start = new Date(new Date().getTime() - 3600 * 1000 * 24 * 1);
      let startTime = this.parseTime(start, "{y}-{m}-{d}");
      let endTime = this.parseTime(new Date().getTime(), "{y}-{m}-{d}");
      this.queryParams.dateTime = [
        startTime + " 00:00:00",
        endTime + " 23:59:59",
      ];
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
    },

    getTime() {
      if (
        this.queryParams.dateTime != undefined &&
        this.queryParams.dateTime != null
      ) {
        this.queryParams.startDate = this.queryParams.dateTime[0] + " 00:00:00";
        this.queryParams.endDate = this.queryParams.dateTime[1] + " 23:59:59";
      } else {
        this.queryParams.startDate = null;
        this.queryParams.endDate = null;
      }
    },
  },
};
</script>
