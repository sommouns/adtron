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
      :data="negativeDataList"
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

      <el-table-column label="时间" align="center" prop="negativeTime" fixed />
      <el-table-column
        label="否词数量"
        align="center"
        prop="negativeCount"
        fixed
      />
      <el-table-column
        label="搜索词总数"
        align="center"
        prop="searchCount"
        fixed
      />

      <el-table-column
        label="否定比例"
        align="center"
        prop="negativePercent"
        fixed
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.negativePercent != null
              ? scope.row.negativePercent + "%"
              : ""
          }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="可节省费用"
        align="center"
        prop="negativeFee"
        fixed
      />
      <el-table-column label="广告花费" align="center" prop="totalFee" fixed />
      <el-table-column
        label="节省费用占比"
        align="center"
        prop="totalNegativeFeePercent"
        fixed
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.negativeFeePercent != null
              ? scope.row.negativeFeePercent + "%"
              : ""
          }}</span>
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
import { listNegativeData } from "@/api/amazon/negativeData";
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

      //否词总数量
      totalNegativeCount: 0,
      //否词总30天花费
      totalNegativeFee: 0,
      //30天广告总花费
      allTotalFee: 0,
      //搜索词总数
      totalSearchCount: 0,
      //否定比例
      totalNegativePercent: 0,
      //否定词花费占广告总花费比
      totalNegativeFeePercent: 0,
      negativeDataList: [],
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
      let arr = [
        "asin",
        "accountName",
      ];
      if (arr.indexOf(column.property) != -1) {
        const dataProvider = this.negativeDataList;
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
        const dataProvider = this.negativeDataList;
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
      listNegativeData(this.queryParams).then((response) => {
        this.negativeDataList = response.rows;
        console.log(this.negativeDataList);
        this.total = response.total;
        this.loading = false;
        this.totalNegativeCount = response.totalNegativeCount;
        this.totalNegativeFee = response.totalNegativeFee;
        this.allTotalFee = response.allTotalFee;
        this.totalSearchCount = response.totalSearchCount;
        this.totalNegativePercent = response.totalNegativePercent;
        this.totalNegativeFeePercent = response.totalNegativeFeePercent;
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
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index === 1 || index === 2) {
          return;
        } else if (index === 3) {
          sums[index] = this.totalNegativeCount
        } else if (index === 4) {
         sums[index] = this.totalSearchCount
        }else if (index === 5) {
          if(null!= this.totalNegativePercent){
              sums[index] = this.totalNegativePercent+"%"
          }else{
                sums[index] ="0%"
          }

        }else if (index === 6) {
         sums[index] = this.totalNegativeFee
        }else if (index === 7) {
         sums[index] = this.allTotalFee
        }else if (index === 8) {
          if(null!= this.totalNegativeFeePercent){
              sums[index] = this.totalNegativeFeePercent+"%"
          }else{
              sums[index] = "0%"
          }
        }
        });
      return sums;
    },
  },
};
</script>
