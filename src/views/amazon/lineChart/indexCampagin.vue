<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="账号" prop="shopId">
        <el-select
          v-model="queryParams.shopId"
          placeholder="请选择账号"
          clearable
          filterable
          @change="selectAccount"
          size="small"
          style="width: 160px"
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
        <el-select
          v-model="queryParams.asin"
          placeholder="请输入ASIN"
          clearable
          filterable
          @change="selectAsin"
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="item in asinList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="活动" prop="campaignId">
        <el-select
          v-model="queryParams.campaignId"
          placeholder="请选择活动名称"
          clearable
          filterable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="item in campaignList"
            :key="item.id"
            :label="item.campaignName"
            :value="item.campaignId"
          />
        </el-select>
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
          @click="modifyData"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
      <div class="flexx" title="统计信息">
        <div class="flexy">
          <span>展现量</span
          ><span>{{ chartTotalResponseDto.impressions }}</span>
        </div>
        <div class="flexy">
          <span>点击量</span><span>{{ chartTotalResponseDto.clicks }}</span>
        </div>
        <div class="flexy">
          <span>点击率</span
          ><span>{{
            chartTotalResponseDto.clickPercent != null
              ? chartTotalResponseDto.clickPercent + "%"
              : ""
          }}</span>
        </div>
        <div class="flexy">
          <span>广告订单</span
          ><span>{{ chartTotalResponseDto.totalOrder }}</span>
        </div>
        <div class="flexy">
          <span>广告转化率</span
          ><span>{{
            chartTotalResponseDto.changeRate != null
              ? chartTotalResponseDto.changeRate + "%"
              : ""
          }}</span>
        </div>
        <div class="flexy">
          <span>广告销售额</span
          ><span>{{ chartTotalResponseDto.salesFees }}</span>
        </div>
        <div class="flexy">
          <span>广告花费</span><span>{{ chartTotalResponseDto.fees }}</span>
        </div>
        <div class="flexy">
          <span>CPC</span><span>{{ chartTotalResponseDto.cpcFee }}</span>
        </div>
        <div class="flexy">
          <span>ACOS</span
          ><span>{{
            chartTotalResponseDto.feesPercent != null
              ? chartTotalResponseDto.feesPercent + "%"
              : ""
          }}</span>
        </div>
      </div>
    </el-form>
    <el-form> </el-form>
    <el-form>
      <el-radio-group v-model="queryParams.selectType" @change="modifyData">
        <el-radio-button label="daily"> 每日 </el-radio-button>
        <el-radio-button label="weekly"> 每周 </el-radio-button>
        <el-radio-button label="monthly"> 每月 </el-radio-button>
      </el-radio-group>
      <el-radio-group
        v-model="queryParams.multipleData"
        style="margin-left: 20px"
        @change="modifyData"
      >
        <el-radio-button label="multiple"> 按趋势 </el-radio-button>
        <el-radio-button label="simple"> 按数值 </el-radio-button>
      </el-radio-group>
    </el-form>
    <div class="echarts">
      <div
        id="main"
        v-loading="loading"
        style="width: 100%; height: 700px"
      ></div>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
import { allAccount } from "@/api/amazon/account";
import { selectDataCampaign } from "@/api/amazon/lineChart";
import { campaignAsin, accountAsin } from "@/api/amazon/asin";
import { accountCampaign, asinCampaign } from "@/api/amazon/campaign";

export default {
  name: "LineChartCampagin",

  data() {
    return {
      // 显示搜索条件
      showSearch: true,
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
      typeList: [
        { value: "daily", label: "日报表" },
        { value: "weekly", label: "周报表" },
        { value: "monthly", label: "月报表" },
      ],
      accountList: [],
      campaignList: [],
      asinList: [],
      // 查询参数
      queryParams: {
        shopId: undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
        campaignId: undefined,
        asin: undefined,
        selectType: "daily",
        multipleData: "simple",
      },
      selectDate: [],
      selectResponseDtoList: [],
      selectMultipleResponseDtoList: [],
      chartTotalResponseDto: {
        impressions: undefined,
        clicks: undefined,
        clickPercent: undefined,
        totalOrder: undefined,
        salesFees: undefined,
        fees: undefined,
        cpcFee: undefined,
        feesPercent: undefined,
        naturalOrder: undefined,
        naturalFees: undefined,
      },
    };
  },

  created() {
    this.initTime();
    this.allAccountList();
    this.modifyData();
  },

  methods: {
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    selectAccount() {
      this.asinList = [];
      this.queryParams.campaignId = undefined;
      this.queryParams.asin = undefined;
      if (
        this.queryParams.shopId == null ||
        this.queryParams.shopId == undefined ||
        this.queryParams.shopId == ""
      ) {
        return;
      }
      accountAsin(this.queryParams.shopId).then((response) => {
        this.asinList = response.data;
        this.campaignList = [];
      });
    },

    selectAsin() {
      this.campaignList = [];
      this.queryParams.campaignId = undefined;
      if (
        this.queryParams.asin == null ||
        this.queryParams.asin == undefined ||
        this.queryParams.asin == ""
      ) {
        return;
      }
      asinCampaign(this.queryParams.asin).then((response) => {
        this.campaignList = response.data;
      });
    },

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

    modifyData() {
      if (
        this.queryParams.shopId == null ||
        this.queryParams.shopId == undefined ||
        this.queryParams.shopId == "" ||
        this.queryParams.startDate == null ||
        this.queryParams.startDate == undefined ||
        this.queryParams.startDate == "" ||
        this.queryParams.endDate == null ||
        this.queryParams.endDate == undefined ||
        this.queryParams.endDate == ""
      ) {
        return;
      }

      this.loading = true;
      selectDataCampaign(this.queryParams).then((response) => {
        this.loading = false;
        if (this.queryParams.multipleData == "multiple") {
          if (this.queryParams.selectType == "weekly") {
            this.selectDate = response.data.weeklyDate;
            this.selectResponseDtoList =
              response.data.multiplyWeeklyResponseDtoList;
            this.selectMultipleResponseDtoList =
              response.data.weeklyResponseDtoList;
          } else if (this.queryParams.selectType == "monthly") {
            this.selectDate = response.data.monthlyDate;
            this.selectResponseDtoList =
              response.data.multiplyMonthlyResponseDtoList;
            this.selectMultipleResponseDtoList =
              response.data.monthlyResponseDtoList;
          } else {
            this.selectDate = response.data.dailyDate;
            this.selectResponseDtoList =
              response.data.multiplyDailyResponseDtoList;
            this.selectMultipleResponseDtoList =
              response.data.dailyResponseDtoList;
          }
        } else {
          if (this.queryParams.selectType == "weekly") {
            this.selectDate = response.data.weeklyDate;
            this.selectResponseDtoList = response.data.weeklyResponseDtoList;
          } else if (this.queryParams.selectType == "monthly") {
            this.selectDate = response.data.monthlyDate;
            this.selectResponseDtoList = response.data.monthlyResponseDtoList;
          } else {
            this.selectDate = response.data.dailyDate;
            this.selectResponseDtoList = response.data.dailyResponseDtoList;
          }
        }

        this.chartTotalResponseDto = response.data.chartTotalResponseDto;
        this.myEcharts();
      });
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

    myEcharts() {
      var slectmultiple = this.queryParams.multipleData;
      var slectData = this.selectMultipleResponseDtoList;
      var myChart = this.$echarts.init(document.getElementById("main"));
      //配置图表
      var option = {
        tooltip: {
          trigger: "axis",
          //实例
          formatter: function (params, ticket, callback) {
            var res = "";
            //使用for可以将需要的数据全部加到res
            //注意下边的<br/>
            if (slectmultiple == "multiple") {
              for (var i = 0, l = params.length; i < l; i++) {
                var innerData = slectData[1].name;
                // if (
                //   params[i].seriesName.indexOf("时间") >= 0
                // ) {
                //   continue;
                // }
                for (var a = 0, j = slectData.length; a < j; a++) {
                  console.info(slectData[a].name + "i" + i);
                  if (slectData[a].name === params[i].seriesName) {
                    innerData = slectData[a].data[params[i].dataIndex];
                    break;
                  }
                }
                var str = "";
                if (
                  params[i].seriesName.indexOf("率") >= 0 ||
                  params[i].seriesName.indexOf("ACOS") >= 0
                ) {
                  str = "%";
                }
                res +=
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  params[i].color +
                  ';margin-right: 5px;border-radius: 50%;}"></i>' +
                  params[i].seriesName +
                  " : " +
                  (innerData === null ? 0 : innerData) +
                  str +
                  "<br/>";
              }
            } else {
              // console.info(params);
              for (var i = 0, l = params.length; i < l; i++) {
                var str = "";
                // if (
                //   params[i].seriesName.indexOf("时间") >= 0
                // ) {
                //   continue;
                // }
                if (
                  params[i].seriesName.indexOf("率") >= 0 ||
                  params[i].seriesName.indexOf("ACOS") >= 0
                ) {
                  str = "%";
                }
                res +=
                  '<i style="display: inline-block;width: 10px;height: 10px;background: ' +
                  params[i].color +
                  ';margin-right: 5px;border-radius: 50%;}"></i>' +
                  params[i].seriesName +
                  " : " +
                  (params[i].value === null ? 0 : params[i].value) +
                  str +
                  "<br/>";
              }
            }

            return res;
          },
        },
        legend: {
          data: [
            "曝光量",
            "广告点击",
            "点击率",
            "广告订单",
            "广告转化率",
            "广告销售额",
            "广告费",
            "CPC",
            "ACOS",
          ],
          selected: {
            曝光量: false,
            广告点击: false,
            点击率: false,
            广告订单: false,
            广告转化率: false,
            广告销售额: false,
            广告费: false,
            CPC: false,
            ACOS: false,
          },
        },
        xAxis: {
          data: this.selectDate,
          stack: "Total",
        },
        grid: {
          left: 50,
          right: 50,
          top: 50,
          buttom: 50,
        },
        yAxis: {},
        series: this.selectResponseDtoList,
      };
      myChart.setOption(option);
    },
  },
};
</script>
<style scoped>
.flexx {
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: left;
  flex-wrap: wrap;
}
.flexy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px;
  width: 8%;
  height: 100px;
  background-color: cadetblue;
}
</style>
