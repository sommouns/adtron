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
      <el-form-item label="活动名称" prop="campaignName">
        <el-input
          v-model="queryParams.campaignName"
          placeholder="请输入活动"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间">
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
    <el-table v-loading="loading" :data="timeList">
      <el-table-column label="店铺名称" align="center" prop="accountName" />
      <el-table-column label="活动名称" align="center" prop="campaignName" />
      <el-table-column label="每日预算" align="center" prop="dailyBudget" />
      <el-table-column label="近21天花费" align="center" prop="fees" />
      <el-table-column
        label="类型"
        align="center"
        prop="type"
        :formatter="formatType"
      />
      <el-table-column
        label="开始时间"
        align="center"
        prop="startTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
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
            v-show="scope.row.type == 0"
            @click="handleType(scope.row)"
            >暂停</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            v-show="scope.row.type != 0"
            @click="handleAdd(scope.row)"
            >开启</el-button
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
  </div>
</template>

<script>
import { listTime, delTime, addTime, changeType } from "@/api/amazon/time";
import { allAccount } from "@/api/amazon/account";

export default {
  name: "Time",
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
      // 打开分时调价表格数据
      timeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      accountList: [],

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        campaignId: null,
        shopId: null,
        startTime: null,
        dateTime: undefined,
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
    };
  },
  created() {
    this.getList();
    this.allAccountList();
  },
  methods: {
    /** 查询打开分时调价列表 */
    getList() {
      this.loading = true;
      listTime(this.queryParams).then((response) => {
        this.timeList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
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
        campaignName: null,
        startTime: null,
        createTime: null,
        updateTime: null,
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

    formatType(row, column, cellValue, index) {
      if (cellValue == 1) {
        return "暂停";
      }
      if (cellValue == 0) {
        return "开启";
      }
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除打开分时调价编号为"' + ids + '"的数据项？')
        .then(function () {
          return delTime(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      const campaignId = row.campaignId;
      const campaignName = row.campaignName;
      this.$modal
        .confirm(
          '是否确认打开分时调价活动名称为"' + campaignName + '"的数据项？'
        )
        .then(function () {
          return addTime(campaignId);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("新增成功");
        })
        .catch(() => {});
    },

    /** 新增按钮操作 */
    handleType(row) {
      const campaignName = row.campaignName;
      const data = {
        id: row.id,
        type: 1,
      };
      this.$modal
        .confirm(
          '是否确认暂停分时调价活动名称为"' + campaignName + '"的数据项？'
        )
        .then(function () {
          return changeType(data);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("新增成功");
        })
        .catch(() => {});
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
