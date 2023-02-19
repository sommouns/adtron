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

      <el-form-item label="ASIN" prop="asin">
        <el-input
          v-model="queryParams.asin"
          placeholder="请输入ASIN"
          clearable
          size="mini"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="SKU" prop="sku">
        <el-input
          v-model="queryParams.sku"
          placeholder="请输入SKU"
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

      <el-form-item label="汇总">
        <el-radio v-model="queryParams.summaryStatus" label="1">是</el-radio>
        <el-radio v-model="queryParams.summaryStatus" label="2">否</el-radio>
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
          content="运营报表暂不包含品牌广告数据,已推广报告暂不支持SB、SD广告"
          placement="top"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="salesDataList"
      style="width: 100%"
      max-height="650"
      border
      :span-method="objectSpanMethod"
      :summary-method="getSummaries"
      show-summary
      ref="multipleTable"
    >
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column
        label="ASIN"
        align="center"
        prop="asin"
        width="120"
        fixed
      />
      <el-table-column
        label="账号"
        align="center"
        prop="accountName"
        width="100"
        :show-overflow-tooltip="true"
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
        label="SKU"
        align="center"
        prop="sku"
        width="100"
        fixed
      />
      <el-table-column
        label="时间"
        align="center"
        prop="orderTime"
        width="95"
        fixed
      />
      <el-table-column label="库存数据" align="center">
        <el-table-column
          label="FBA库存"
          align="center"
          prop="inventoryQuantity"
          width="80"
        />
        <el-table-column
          label="可售天数"
          align="center"
          prop="availableDays"
          width="80"
        />
      </el-table-column>
      <el-table-column label="销售数据" align="center">
        <el-table-column
          label="订单量"
          align="center"
          prop="orderQuantity"
          width="60"
        />
        <el-table-column
          label="销量"
          align="center"
          prop="salesVolume"
          width="60"
        />
        <el-table-column
          label="币种"
          align="center"
          prop="currency"
          width="70"
        />
        <el-table-column label="单价" align="center" prop="price" width="70">
          <template slot-scope="scope">
            <span>{{
              scope.row.price != null ? scope.row.price.toFixed(2) : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="销售金额"
          align="center"
          prop="salesAmount"
          width="100"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.salesAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="近30天日均"
          align="center"
          prop="average"
          width="90"
        />
      </el-table-column>
      <el-table-column label="广告数据" align="center">
        <el-table-column
          label="展现量"
          align="center"
          prop="impressions"
          width="80"
        />
        <el-table-column
          label="点击量"
          align="center"
          prop="clicks"
          width="80"
        />
        <el-table-column label="点击率" align="center" prop="clickPercent">
          <template slot-scope="scope">
            <span>{{
              scope.row.clickPercent != null ? scope.row.clickPercent + "%" : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="广告花费"
          align="center"
          prop="fees"
          width="80"
        />
        <el-table-column
          label="广告销售额"
          align="center"
          prop="salesFees"
          width="90"
        />
        <el-table-column
          label="单次点击费用"
          align="center"
          prop="cpcFee"
          width="100"
        />
        <el-table-column label="ACOS" align="center" prop="acos">
          <template slot-scope="scope">
            <span>{{
              scope.row.acos != null ? scope.row.acos + "%" : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="TACOS" align="center" prop="tacos">
          <template slot-scope="scope">
            <span>{{
              scope.row.tacos != null ? scope.row.tacos + "%" : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="广告订单数"
          align="center"
          prop="advOrder"
          width="90"
        />
        <el-table-column label="转化率" align="center" prop="changeRate">
          <template slot-scope="scope">
            <span>{{
              scope.row.changeRate != null ? scope.row.changeRate + "%" : ""
            }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="自然数据" align="center">
        <el-table-column
          label="自然订单数"
          align="center"
          prop="naturalOrder"
          width="90"
        />
        <el-table-column
          label="自然订单占比"
          align="center"
          prop="naturalOrderPercent "
          width="100"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.naturalOrderPercent != null
                ? scope.row.naturalOrderPercent + "%"
                : ""
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="自然流量"
          align="center"
          prop="sessions"
          width="90"
        />
        <el-table-column
          label="自然转换率"
          align="center"
          prop="naturalChangePercent "
          width="100"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.naturalChangePercent != null
                ? scope.row.naturalChangePercent + "%"
                : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="自然流量占比"
          align="center"
          prop="naturalPercentage "
          width="100"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.naturalPercentage != null
                ? scope.row.naturalPercentage + "%"
                : ""
            }}</span>
          </template>
        </el-table-column>
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
import { listSalesData } from "@/api/amazon/salesData";
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
      //总订单数量
      totalOrderQuantity: 0,
      //总销售数量
      totalSalesVolume: 0,
      //总销售金额
      totalSalesAmount: 0,
      //总展现量
      totalImpressions: 0,
      //总点击量
      totalClicks: 0,
      //总点击率
      totalClickPercent: 0,
      //总每次点价花费
      totalCpcFee: 0,
      //总广告花费
      totalFees: 0,
      //总广告销售额
      totalSalesFees: 0,
      //总广告成本销售比(ACoS)
      totalAcos: 0,
      totalTAcos: 0,
      //总广告订单数
      totalAdvOrder: 0,
      //总转化率
      totalChangeRate: 0,
      //总自然订单数
      totalNaturalOrder: 0,
      //总自然订单数占比
      totalNaturalOrderPercent: 0,
      //总自然转化率
      totalNaturalChangePercent: 0,
      //总自然单量
      totalSessions: 0,
      //总自然流量占比
      totalNaturalPercentage: 0,
      salesDataList: [],
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
        asin: undefined,
        sku: undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
        summaryStatus: "2",
      },

      // 表单参数
      form: {},
    };
  },
  created() {
    this.initTime();
    this.allAccountList();
    this.getList();
  },
  watch:{
    "salesDataList":{
      handler(){
        this.$nextTick(()=>{
          this.$refs.multipleTable.doLayout();
        });
      }
    },
    deep:true
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

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      let arr = [
        "asin",
        "sku",
        "inventoryQuantity",
        "availableDays",
        "currency",
      ];
      if (arr.indexOf(column.property) != -1) {
        const dataProvider = this.salesDataList;
        const cellValue = row[column.property];
        if (cellValue) {
          // 上一条数据
          const prevRow = dataProvider[rowIndex - 1];
          // 下一条数据
          let nextRow = dataProvider[rowIndex + 1];
          // 当上一条数据等于下一条数据
          if (prevRow && prevRow[column.property] == cellValue) {
            return { rowspan: 0, colspan: 0 };
          } else {
            let rowspan = 1;
            while (nextRow && nextRow[column.property] == cellValue) {
              rowspan++;
              nextRow = dataProvider[rowspan + rowIndex];
            }
            if (rowspan > 1) {
              return { rowspan, colspan: 1 };
            }
          }
        }
      }
      //只有当sku相同时才合并
      let accountArr = ["accountName", "average", "price"];
      if (accountArr.indexOf(column.property) != -1) {
        const dataProvider = this.salesDataList;
        const cellValue = row.sku + row.site;
        if (cellValue) {
          // 上一条数据
          const prevRow = dataProvider[rowIndex - 1];
          // 下一条数据
          let nextRow = dataProvider[rowIndex + 1];
          // 当上一条数据等于下一条数据sku
          if (prevRow && prevRow.sku + prevRow.site == cellValue) {
            return { rowspan: 0, colspan: 0 };
          } else {
            let rowspan = 1;
            while (nextRow && nextRow.sku + nextRow.site == cellValue) {
              rowspan++;
              nextRow = dataProvider[rowspan + rowIndex];
            }
            if (rowspan > 1) {
              return { rowspan, colspan: 1 };
            }
          }
        }
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
      listSalesData(this.queryParams).then((response) => {
        this.salesDataList = response.rows;
        console.log(this.salesDataList);
        this.total = response.total;
        this.loading = false;
        this.totalOrderQuantity = response.totalOrderQuantity;
        this.totalSalesVolume = response.totalSalesVolume;
        this.totalSalesAmount = response.totalSalesAmount;
        this.totalImpressions = response.totalImpressions;
        this.totalClicks = response.totalClicks;
        this.totalClickPercent = response.totalClickPercent;
        this.totalCpcFee = response.totalCpcFee;
        this.totalFees = response.totalFees;
        this.totalSalesFees = response.totalSalesFees;
        this.totalAcos = response.totalAcos;
        this.totalTAcos = response.totalTAcos;
        this.totalAdvOrder = response.totalAdvOrder;
        this.totalChangeRate = response.totalChangeRate;
        this.totalNaturalOrder = response.totalNaturalOrder;
        this.totalNaturalOrderPercent = response.totalNaturalOrderPercent;
        this.totalSessions = response.totalSessions;
        this.totalNaturalPercentage = response.totalNaturalPercentage;
        this.totalNaturalChangePercent = response.totalNaturalChangePercent;
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
      this.queryParams.summaryStatus = "2";
      this.initTime();
      this.handleQuery();
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index === 4 || index === 5 || index === 9 || index === 11) {
          return;
        }
        //订单量
        if (index === 6) {
          sums[index] = this.totalOrderQuantity;
        } else if (index === 7) {
          //销量
          sums[index] = this.totalSalesVolume;
        } else if (index === 10) {
          //销售金额
          sums[index] = this.totalSalesAmount;
        } else if (index === 12) {
          //展现量
          sums[index] = this.totalImpressions;
        } else if (index === 13) {
          //点击量
          sums[index] = this.totalClicks;
        }
        //点击率
        else if (index === 14) {
          sums[index] = this.totalClickPercent + "%";
        } else if (index === 15) {
          //广告花费
          sums[index] = this.totalFees;
        } else if (index === 16) {
          //广告销售额
          sums[index] = this.totalSalesFees;
        } else if (index === 17) {
          //单次点击费用
          sums[index] = this.totalCpcFee;
        } else if (index === 18) {
          //acos
          sums[index] = this.totalAcos + "%";
        } else if (index === 19) {
          //tacos
          sums[index] = this.totalTAcos + "%";
        } else if (index === 20) {
          //广告订单数
          sums[index] = this.totalAdvOrder;
        } else if (index === 21) {
          //转化率
          sums[index] = this.totalChangeRate + "%";
        } else if (index === 22) {
          //自然订单
          sums[index] = this.totalNaturalOrder;
        } else if (index == 23) {
          //自然单占比
          sums[index] = this.totalNaturalOrderPercent + "%";
        } else if (index == 24) {
          //总流量
          sums[index] = this.totalSessions;
        } else if (index == 25) {
          //自然转化率
          sums[index] = this.totalNaturalChangePercent + "%";
        } else if (index == 26) {
          //总自然流量占比
          sums[index] = this.totalNaturalPercentage + "%";
        }
      });
      return sums;
    },
  },
};
</script>
