<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="ASIN" prop="asin">
        <el-input
          v-model="queryParams.asin"
          placeholder="请输入ASIN"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="调价比例" prop="rate">
        <el-input
          v-model="queryParams.rate"
          placeholder="请输入调价比例"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间">
        <el-date-picker
          @change="getTime"
          v-model="queryParams.dateTime"
          type="daterange"
          align="right"
          size="mini"
          unlink-panels
          value-format="yyyy-MM-dd"
          format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        >
        </el-date-picker>
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

    <el-table
      v-loading="loading"
      :data="reportList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="广告活动" align="center" prop="campaignName" />
      <el-table-column label="ASIN" align="center" prop="asin" />
      <el-table-column label="关键字" align="center" prop="keywordText" />
      <el-table-column label="调整前价格" align="center" prop="oldBid">
        <template slot-scope="scope">
          <span>{{ scope.row.oldBid != null ? scope.row.oldBid : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调整后价格" align="center" prop="bid">
        <template slot-scope="scope">
          <span>{{ scope.row.bid != null ? scope.row.bid : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调价类型" align="center" prop="type">
        <template slot-scope="scope">
          <span style="color: GREEN;" v-if="scope.row.type == '0'">降低</span>
          <span style="color: RED;" v-if="scope.row.type == '1'">提高</span>
          <span v-if="scope.row.type == '2'">暂停</span>
        </template>
      </el-table-column>
      <el-table-column label="调价比例" align="center" prop="rate">
        <template slot-scope="scope">
          <span>{{ scope.row.rate != null ? scope.row.rate : "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="是否修改价格" align="center" prop="status">
        <template slot-scope="scope">
            <span v-if="scope.row.status == '0'">否</span>
            <span v-if="scope.row.status == '1'">是</span>
          </template>
      </el-table-column> 
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="scope" >
          <el-button size="mini" type="text" icon="el-icon-delete-solid"  v-show="scope.row.status===0" @click="handleChange(scope.row)">修改价格
          </el-button>
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
import { listReport, getReport,change } from "@/api/amazon/report";

export default {
  name: "Report",
  data() {
    return {
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
      // 竞价修改记录表格数据
      reportList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        campaignId: null,
        asin: null,
        type: null,
        rate: null,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        campaignId: [
          { required: true, message: "广告活动id不能为空", trigger: "blur" },
        ],
        asin: [
          { required: true, message: "$comment不能为空", trigger: "blur" },
        ],
        type: [
          { required: true, message: "调价类型不能为空", trigger: "change" },
        ],
        rate: [
          { required: true, message: "调价比例不能为空", trigger: "blur" },
        ],
        updateTime: [
          { required: true, message: "$comment不能为空", trigger: "blur" },
        ],
        createTime: [
          { required: true, message: "$comment不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.initTime();
    this.getList();
  },
  methods: {
    /** 查询竞价修改记录列表 */
    getList() {
      this.loading = true;
      listReport(this.queryParams).then((response) => {
        this.reportList = response.rows;
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
        campaignId: null,
        asin: null,
        type: null,
        rate: null,
        updateTime: null,
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
     handleChange(row) {
      change(row.id).then(() => {
        this.$modal.msgSuccess("修改价格成功");
        getList()
      });
    }
  },
};
</script>
