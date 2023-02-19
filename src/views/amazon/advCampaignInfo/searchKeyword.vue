<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="时间">
        <div class="block">
          <el-date-picker
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
      <el-form-item label="搜索词">
        <el-input
          v-model="queryParams.query"
          placeholder="请输入搜索词"
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
          v-hasPermi="['term:report:list']"
        >搜索</el-button
        >
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleTermExport"
          v-hasPermi="['term:report:export']"
        >导出</el-button
        >
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableList" :summary-method="getSummaries" show-summary :default-sort="defaultSort"
              @sort-change="handleSortChange">
      <el-table-column
        label="活动名称"
        align="center"
        prop="campaignName"
        width="300"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="关键字"
        align="center"
        prop="keywordText"
        width="170"
      />
      <el-table-column
        label="搜索词"
        align="center"
        prop="query"
        width="170"
      />
      <el-table-column label="曝光量" align="center" prop="impressions" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row != undefined">{{
                  scope.row.impressions
                }}</span>
          <span v-if="scope.row == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="点击量" align="center" prop="clicks" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                <span v-if="scope.row != undefined">{{
                    scope.row.clicks
                  }}</span>
          <span v-if="scope.row == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="点击率" align="center" prop="clickPercent" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row != undefined">{{
                  scope.row.clickPercent != null
                    ? scope.row.clickPercent + "%"
                    : "0%"
                }}</span>
          <span v-if="scope.row == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column label="订单量" align="center" prop="totalOrder" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                  <span v-if="scope.row != undefined">{{
                      scope.row.totalOrder
                    }}</span>
          <span v-if="scope.row == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="转化率" align="center" prop="changeRate"  sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row != undefined">{{
                  scope.row.changeRate != null
                    ? scope.row.changeRate + "%"
                    : "0%"
                }}</span>
          <span v-if="scope.row == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column label="销售额" align="center" prop="salesFees"  sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                    <span v-if="scope.row != undefined">{{
                        scope.row.salesFees
                      }}</span>
          <span v-if="scope.row == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="广告花费" align="center" prop="fees" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                      <span v-if="scope.row != undefined">{{
                          scope.row.fees
                        }}</span>
          <span v-if="scope.row == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="CPC" align="center" prop="cpcFee"  sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                        <span v-if="scope.row != undefined">{{
                            scope.row.cpcFee
                          }}</span>
          <span v-if="scope.row == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="ACOS" align="center" prop="feesPercent"  sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row != undefined">{{
                  scope.row.feesPercent != null
                    ? scope.row.feesPercent + "%"
                    : "0%"
                }}</span>
          <span v-if="scope.row == undefined">0%</span>
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
import { listSumReport } from "@/api/amazon/searchTermReport";
export default {
  name: "keywords",
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
      // 字典表格数据
      tableList: [],
      //曝光量
      impressions: 0,
      //点击量
      clicks: 0,
      //点击率
      clickPercent: 0,
      //订单量
      totalOrder: 0,
      //转化率
      changeRate: 0,
      //每次点价花费/销售额
      cpcFee: 0,
      //广告花费
      fees: 0,
      //广告销售额
      salesFees: 0,
      //acos
      acos: 0,
      defaultSort: { prop: "keywordText", order: "descending" },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        adGroupId: undefined,
        campaignId:undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined
      }
    };
  },
  created() {
    let cam = this.$route.params.campaignId.split(",");
    this.queryParams.campaignId = cam[0];
    this.queryParams.startDate = cam[1];
    this.queryParams.endDate = cam[2];
    this.queryParams.dateTime = [cam[1], cam[2]];
    //this.initTime();
    this.getList();
  },
  methods: {
    /** 查询字典类型列表 */
    getList() {
      if (
        this.queryParams.dateTime != undefined &&
        this.queryParams.dateTime != null
      ) {
        this.queryParams.startDate = this.queryParams.dateTime[0];
        this.queryParams.endDate = this.queryParams.dateTime[1];
      } else {
        this.V.startDate = null;
        this.queryParams.endDate = null;
      }
      this.loading = true;
      listSumReport(this.queryParams).then(response => {
          this.tableList = response.list;
          this.total = response.total;
          this.loading = false;
          this.impressions = response.totalImpressions;
          this.clicks = response.totalClicks;
          this.clickPercent = response.totalClickPercent;
          this.totalOrder = response.allTotalOrder;
          this.changeRate = response.totalChangeRate;
          this.cpcFee = response.totalCpcFee;
          this.fees = response.totalFees;
          this.salesFees = response.totalSalesFees;
          this.acos = response.totalAcos;
        }
      );
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index >= 1 && index <= 2) {
          return;
        }
        //曝光量
        if (index === 3) {
          sums[index] = this.impressions;
        }
        //点击量
        if (index === 4) {
          sums[index] = this.clicks;
        }
        //点击率
        if (index === 5) {
          sums[index] = (this.clickPercent * 100).toFixed(2) + "%";
        }
        //订单量
        if (index === 6) {
          sums[index] = this.totalOrder;
        }
        //转化率
        if (index === 7) {
          sums[index] = (this.changeRate * 100).toFixed(2) + "%";
        }
        //广告销售额
        if (index === 8) {
          sums[index] = this.salesFees;
        }
        //广告花费
        if (index === 9) {
          sums[index] = this.fees;
        }
        //每次点价花费/销售额
        if (index === 10) {
          sums[index] = this.cpcFee.toFixed(2);
        }
        //acos
        if (index === 11) {
          sums[index] = (this.acos*100).toFixed(2) + "%";
        }
      });
      return sums;
    },
    initTime() {
      const now = new Date();
      const day7 = new Date(now.getTime() - 7 * 3600 * 1000 * 24);
      const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
      let time1 = this.parseTime(day7, "{y}-{m}-{d}");
      let time2 = this.parseTime(now, "{y}-{m}-{d}");
      this.queryParams.dateTime = [time1, time2];
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
      this.getTime()
    },
    getTime() {
      if (
        this.queryParams.dateTime != undefined &&
        this.queryParams.dateTime != null
      ) {
        this.queryParams.startDate = this.queryParams.dateTime[0];
        this.queryParams.endDate = this.queryParams.dateTime[1];
      } else {
        this.queryParams.startDate = null;
        this.queryParams.endDate = null;
      }
    },
    handleTermExport() {
      this.download(
        "/advertising/term/report/export",
        {
          ...this.reportQueryParams,
        },
        `搜索词报告_${new Date().getTime()}.xlsx`
      );
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      if (null != column.order) {
        this.queryParams.isAsc = column.order;
        this.getList();
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    }
  }
};
</script>


