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
         <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            >导出</el-button
          >
      </el-form-item>

      <el-form-item>
        <el-tooltip
          type="primary"
          content="参数分析报表暂不包含SD展示型广告数据"
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
      :data="parameterDataList"
      style="width: 100%"
      max-height="650"
      border
      :span-method="objectSpanMethod"
      :summary-method="getSummaries"
      show-summary
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
        label="时间"
        align="center"
        prop="orderTime"
        width="95"
        fixed
      />

      <el-table-column
        label="展现量"
        align="center"
        prop="impressions"
        width="80"
      />
      <el-table-column label="点击量" align="center" prop="clicks" width="80" />
      <el-table-column label="点击率" align="center" prop="clickPercent">
        <template slot-scope="scope">
          <span>{{
            scope.row.clickPercent != null ? scope.row.clickPercent + "%" : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="总订单"
        align="center"
        prop="totalOder"
        width="80"
      />
      <el-table-column
        label="总销售额"
        align="center"
        prop="totalSales"
        width="90"
      />

      <el-table-column label="转化率" align="center" prop="changeRate">
        <template slot-scope="scope">
          <span>{{
            scope.row.changeRate != null ? scope.row.changeRate + "%" : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="广告转化率" align="center" prop="advChangeRate">
        <template slot-scope="scope">
          <span>{{
            scope.row.advChangeRate != null ? scope.row.advChangeRate + "%" : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="广告订单数"
        align="center"
        prop="advOrder"
        width="90"
      />
      <el-table-column
        label="广告销售额"
        align="center"
        prop="salesFees"
        width="90"
      />

      <el-table-column label="广告花费" align="center" prop="fees" width="90" />

      <el-table-column label="CPC" align="center" prop="cpcFee" width="90" />

      <el-table-column label="ACOS" align="center" prop="acos">
        <template slot-scope="scope">
          <span>{{ scope.row.acos != null ? scope.row.acos + "%" : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="TACOS" align="center" prop="roi">
        <template slot-scope="scope">
          <span>{{ scope.row.acos != null ? scope.row.roi + "%" : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ROAS" align="center" prop="roas">
        <template slot-scope="scope">
          <span>{{ scope.row.acos != null ? scope.row.roas: "" }}</span>
        </template>
      </el-table-column>

      <el-table-column label="IRR" align="center" prop="irr">
        <template slot-scope="scope">
          <span>{{ scope.row.acos != null ? scope.row.irr + "%" : "" }}</span>
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
import { listParameterDataData } from "@/api/amazon/parameterdata";
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
      //总展现量
      allImpressions: 0,

      //总点击量
      allClicks: 0,

      //总点击率
      allClickPercent: 0,

      //总订单
      allTotalOder: 0,

      //总销售额
      allTotalSales: 0,

      //总转化率
      allChangeRate: 0,

        //总广告转化率
      allAdvChangeRate: 0,

      //总广告订单数
      allAdvOrder: 0,

      //总广告花费
      allFees: 0,

      //总广告销售额
      allSalesFees: 0,

      //总每次点价花费
      allCpcFee: 0,

      //总roi
      allRoi: 0,

      //总广告成本销售比(ACoS)
      allAcos: 0,

      //总广告成本销售比(roas)
      allRoas: 0,

      //总广告成本销售比(irr)
      allIrr: 0,

      parameterDataList: [],
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
      },

      // 表单参数
      form: {},
    };
  },
  created() {
    this.initTime();
    let cam = this.$route.params.asin;
    let camTo;
    if (cam != undefined){
      camTo = cam.split(",");
      this.queryParams.asin = camTo[0];
      this.queryParams.startDate = camTo[1];
      this.queryParams.endDate = camTo[2];
      this.queryParams.dateTime = [camTo[1], camTo[2]];
    }
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

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      let arr = ["asin", "inventoryQuantity", "availableDays", "currency"];
      if (arr.indexOf(column.property) != -1) {
        const dataProvider = this.parameterDataList;
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
        const dataProvider = this.parameterDataList;
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
      listParameterDataData(this.queryParams).then((response) => {
        this.parameterDataList = response.rows;
        this.total = response.total;
        this.loading = false;
        this.allImpressions = response.allImpressions;
        this.allClicks = response.allClicks;
        this.allClickPercent = response.allClickPercent;
        this.allTotalOder = response.allTotalOder;
        this.allTotalSales = response.allTotalSales;
        this.allChangeRate = response.allChangeRate;
        this.allAdvChangeRate = response.allAdvChangeRate;
        this.allAdvOrder = response.allAdvOrder;
        this.allFees = response.allFees;
        this.allSalesFees = response.allSalesFees;
        this.allCpcFee = response.allCpcFee;
        this.allRoi = response.allRoi;
        this.allAcos = response.allAcos;
        this.allRoas = response.allRoas;
        this.allIrr = response.allIrr;
      });
    },
    handleExport() {
      this.download(
        "/store/parameterData/export",
        {
          ...this.queryParams,
        },
        `参数分析_${new Date().getTime()}.xlsx`
      );
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
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      console.info(columns);
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if ( index === 2) {
          return;
        }
        //展现量
        if (index === 3) {
          sums[index] = this.allImpressions;
        } else if (index === 4) {
          //点击量
          sums[index] = this.allClicks;
        } else if (index === 5) {
          //点击率
          sums[index] = this.allClickPercent + "%";
        } else if (index === 6) {
          //总订单
          sums[index] = this.allTotalOder;
        } else if (index === 7) {
          //总销售额
          sums[index] = this.allTotalSales;
        }
        //转化率
        else if (index == 8) {
          sums[index] = this.allChangeRate + "%";
        }
         //广告转化率
        else if (index == 9) {
          sums[index] = this.allAdvChangeRate + "%";
        }
        //广告订单数
        else if (index == 10) {
          sums[index] = this.allAdvOrder;
        }
        //广告销售额
        else if (index == 11) {
          sums[index] = this.allSalesFees ;
        }
        //广告花费
        else if (index == 12) {
          sums[index] = this.allFees ;
        }
        //cpc
        else if (index == 13) {
          sums[index] = this.allCpcFee;
        }
        //Acos
        else if (index == 14) {
          sums[index] = this.allAcos + "%";
        }
        //taocs
        else if (index == 15) {
          sums[index] = this.allRoi + "%";
        }
        //roas
        else if (index == 16) {
          sums[index] = this.allRoas;
        }
        //irr
        else if (index == 17) {
          sums[index] = this.allIrr + "%";
        }
      });
      return sums;
    },
  },
};
</script>
