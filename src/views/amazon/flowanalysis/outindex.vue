<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="账号" prop="shopIds">
        <el-select
          v-model="queryParams.shopIds"
          placeholder="请选择账号"
          clearable
          multiple
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

      <el-form-item label="ASIN" prop="partnerAsin">
        <el-input
          v-model="queryParams.partnerAsin"
          placeholder="请输入父ASIN"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="子ASIN" prop="asin">
        <el-input
          v-model="queryParams.asin"
          placeholder="请输入ASIN"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
       <el-form-item label="活动名称" prop="campaignName">
        <el-input
          v-model="queryParams.campaignName"
          placeholder="活动名称"
          clearable
          size="mini"
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
      <el-form-item>
        <el-tooltip
          type="primary"
          content="跳出流量不包含品牌广告数据,已推广报告暂不支持SD广告"
          placement="top"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="outList"
      style="width: 100%"
      max-height="650"
      border
      :summary-method="getSummaries"
      show-summary
    >
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column
        label="账号"
        align="center"
        prop="accountName"
        width="150"
        fixed
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.site != null
              ? scope.row.accountName + "-" + scope.row.site
              : scope.row.accountName
          }}</span>
        </template>
      </el-table-column>
                        <el-table-column
        label="活动名称"
        align="center"
        prop="campaignName"
        fixed
      />
      <el-table-column
        label="ASIN"
        align="center"
        prop="asin"
        width="120"
        fixed
      />
      <el-table-column label="展现量" align="center" prop="impressions" />
      <el-table-column label="点击量" align="center" prop="clicks" width="80" />
      <el-table-column label="点击率" align="center" prop="clickPercent">
        <template slot-scope="scope">
          <span>{{
            scope.row.clickPercent != null ? scope.row.clickPercent + "%" : "0%"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总单量" align="center" prop="totalOrder" />
      <el-table-column label="转化率" align="center" prop="changeRate">
        <template slot-scope="scope">
          <span>{{
            scope.row.changeRate != null ? scope.row.changeRate + "%" : "0%"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="销售总额"
        align="center"
        prop="totalSalesAmount"
      />
      <el-table-column label="直接单量" align="center" prop="directOrder" />
      <el-table-column
        label="直接销售额"
        align="center"
        prop="directSalesAmount"
      />
      <el-table-column label="跳出单量" align="center" prop="flowOrder" />
      <el-table-column
        label="跳出销售额"
        align="center"
        prop="flowSalesAmount"
      />
      <el-table-column label="跳出率" align="center" prop="flowRate">
        <template slot-scope="scope">
          <span>{{
            scope.row.flowRate != null ? scope.row.flowRate + "%" : "0%"
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="UV价值" align="center" prop="uvValue">
        <template slot-scope="scope">
          <span>{{
            scope.row.uvValue != null ? scope.row.uvValue + "%" : "0%"
          }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="跳出asin"
        align="center"
        prop="flowAsin"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <div
            style="color: blue; cursor: pointer"
            @click="handelAsinList(scope.row)"
          >
            {{ scope.row.flowAsin }}
          </div>
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

    <el-dialog
      title="跳出ASIN列表 （标记为同一父ASIN）"
      :visible.sync="outAsin"
      width="800px"
      append-to-body
    >
      <el-table
        :data="asinList"
        style="width: 100%"
        :summary-method="getSummariesForInfo"
        show-summary
      >
        <el-table-column label="跳入asin" align="center" prop="asin">
          <template slot-scope="scope" v-if="scope.row.sameAsin">
            <div style="color: red; cursor: pointer">
              {{ scope.row.asin }}
            </div>
          </template>
          <template slot-scope="scope" v-if!="scope.row.sameAsin">
            {{ scope.row.asin }}
          </template>
        </el-table-column>
        <el-table-column label="单量" align="center" prop="orderCount" />
        <el-table-column label="销售额" align="center" prop="saleAmount" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { outList, outAsin } from "@/api/amazon/flowanalysis";
import { allAccount } from "@/api/amazon/account";

export default {
  name: "Index",
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

      allImpressions: 0,
      allClicks: 0,
      allClickPercent: 0,
      allTotalOrder: 0,
      allChangeRate: 0,
      allTotalSalesAmount: 0,
      allDirectOrder: 0,
      allDirectSalesAmount: 0,
      allFlowOrder: 0,
      allFlowSalesAmount: 0,
      allFlowRate: 0,

      infoAllCount: 0,
      infoAllSalesAmount: 0,

      outList: [],
      accountList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        shopIds: [],
        partnerAsin: undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
      outAsin: false,

      asinList: [],
      // 表单参数
      form: {},
    };
  },
  created() {
    this.initTime();
    this.allAccountList();
    this.getList();
  },
  methods: {
    initTime() {
      const start = new Date(new Date().getTime() - 3600 * 1000 * 24 * 7);
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

    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },

    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      outList(this.queryParams).then((response) => {
        this.outList = response.rows;
        console.log(this.outList);
        this.total = response.total;
        this.loading = false;
        this.allImpressions = response.allImpressions;
        this.allClicks = response.allClicks;
        this.allClickPercent = response.allClickPercent;
        this.allTotalOrder = response.allTotalOrder;
        this.allChangeRate = response.allChangeRate;
        this.allTotalSalesAmount = response.allTotalSalesAmount;
        this.allDirectOrder = response.allDirectOrder;
        this.allDirectSalesAmount = response.allDirectSalesAmount;
        this.allFlowOrder = response.allFlowOrder;
        this.allFlowSalesAmount = response.allFlowSalesAmount;
        this.allFlowRate = response.allFlowRate;
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
      this.initTime();
      this.handleQuery();
    },

    handelAsinList(row) {
      let body = {
        asin: row.asin,
        campaignId: row.campaignId,
        startDate: this.queryParams.startDate,
        endDate: this.queryParams.endDate,
      };
      outAsin(body).then((response) => {
        this.asinList = response.rows;
        this.infoAllCount = response.totalOrderCount;
        this.infoAllSalesAmount = response.totalSaleAmount;
      });
      console.info(this.asinList);
      this.outAsin = true;
    },

    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index === 1 || index === 14) {
          return;
        } else if (index === 3) {
          sums[index] = this.allImpressions;
        } else if (index === 4) {
          sums[index] = this.allClicks;
        } else if (index === 5) {
          sums[index] =
            this.allClickPercent == null ? "0%" : this.allClickPercent + "%";
        } else if (index === 6) {
          sums[index] = this.allTotalOrder;
        } else if (index === 7) {
          sums[index] =
            this.allChangeRate == null ? "0%" : this.allChangeRate + "%";
        } else if (index === 8) {
          sums[index] = this.allTotalSalesAmount;
        } else if (index === 9) {
          sums[index] = this.allDirectOrder;
        } else if (index === 10) {
          sums[index] = this.allDirectSalesAmount;
        } else if (index === 11) {
          sums[index] = this.allFlowOrder;
        } else if (index === 12) {
          sums[index] = this.allFlowSalesAmount;
        } else if (index === 13) {
          sums[index] =
            this.allFlowRate == null ? "0%" : this.allFlowRate + "%";
        }
      });
      return sums;
    },
    getSummariesForInfo(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index === 1) {
          sums[index] = this.infoAllCount;
        } else if (index === 2) {
          sums[index] = this.infoAllSalesAmount;
        }
      });
      return sums;
    },
  },
};
</script>
