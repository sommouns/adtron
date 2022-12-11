<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">


      <el-form-item label="账号" prop="shopId">
        <el-select
          v-model="queryParams.shopId"
          placeholder="请选择账号"
          clearable
          filterable
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="3" class="analysis">
      <el-row :gutter="30">
        <el-col :xs="12" :sm="12" :lg="{span: '4-8'}" class="card-panel-col">
          <el-card shadow="always">
            <div style="padding-top: 10px;text-align: center;font-size: 22px;font-weight: bolder">
              广告花费
            </div>
            <div style="padding-top: 10px;text-align: center;font-size: 46px;font-weight: bolder">
              ${{this.formatNums(this.totalFees)}}
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="{span: '4-8'}" class="card-panel-col">
          <el-card shadow="always">
            <div style="padding-top: 10px;text-align: center;font-size: 22px;font-weight: bolder">
              广告销售额
            </div>
            <div style="padding-top: 10px;text-align: center;font-size: 46px;font-weight: bolder">
              ${{this.formatNums(this.totalSalesFees)}}
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="{span: '4-8'}" class="card-panel-col">
          <el-card shadow="always">
            <div style="padding-top: 10px;text-align: center;font-size: 22px;font-weight: bolder">
              ACOS
              <el-tooltip type="primary"  placement="top">
                <div slot="content">广告花费占比（Advertising Cost of Sale）<br/>广告花费 / 广告销售额</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </div>
            <div style="padding-top: 10px;text-align: center;font-size: 46px;font-weight: bolder">
              {{this.totalAcos}}%
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="{span: '4-8'}" class="card-panel-col">
          <el-card shadow="always">
            <div style="padding-top: 10px;text-align: center;font-size: 22px;font-weight: bolder">
              ROAS
              <el-tooltip type="primary"  placement="top">
                <div slot="content">广告支出回报率（Return On Advertising Spend）<br/>广告销售额 / 广告花费</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </div>
            <div style="padding-top: 10px;text-align: center;font-size: 46px;font-weight: bolder">
              {{this.totalRoas}}
            </div>

          </el-card>
        </el-col>
        <el-col :xs="12" :sm="12" :lg="{span: '4-8'}" class="card-panel-col">
          <el-card shadow="always">
            <div style="padding-top: 10px;text-align: center;font-size: 22px;font-weight: bolder">
              TACOS
              <el-tooltip type="primary"  placement="top">
                <div slot="content">销售的总广告成本（Total Advertising Cost of Sale）<br/>广告花费 / 店铺的销售总额</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </div>
            <div style="padding-top: 10px;text-align: center;font-size: 46px;font-weight: bolder">
              {{this.totalTacos}}%
            </div>

          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="30" style="margin-top: 10px;margin-left: 1px;">
        <el-tabs type="border-card" style="width: 49%;float: left;" :stretch="true" @tab-click="handleClick" v-model="activeNameOne">
          <el-tab-pane name="first">
          <span slot="label" >
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              销售
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              ${{this.formatNums(this.totalSalesFees)}}
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainOne" style="height:300px;"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="second">
          <span slot="label">
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              广告花费
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              ${{this.formatNums(this.totalFees)}}
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainTwo" style="height:300px;"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
        <el-tabs type="border-card" style="width: 49%;float: right;margin-right: 10px" :stretch="true" @tab-click="handleClickTwo" v-model="activeNameTwo">
          <el-tab-pane name="first">
          <span slot="label">
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              ACOS
              <el-tooltip type="primary"  placement="top">
                <div slot="content">广告花费占比（Advertising Cost of Sale）<br/>广告花费 / 广告销售额</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              {{this.totalAcos}}%
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainThree" style="height:300px;"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="second">
          <span slot="label">
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              TACOS
              <el-tooltip type="primary"  placement="top">
                <div slot="content">销售的总广告成本（Total Advertising Cost of Sale）<br/>广告花费 / 店铺的销售总额</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              {{this.totalTacos}}%
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainFour" style="height:300px;"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-row>

      <el-row :gutter="30" style="margin-top: 10px;margin-left: 1px;">
        <el-tabs type="border-card" style="width: 49%;float: left;" :stretch="true" @tab-click="handleClickThree" v-model="activeNameThree">
          <el-tab-pane name="first">
          <span slot="label">
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              展示量
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              {{this.formatNums(this.totalImpressions)}}
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainFive" style="height:300px;"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="second">
          <span slot="label">
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              点击量
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              {{this.formatNums(this.totalClicks)}}
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainSix" style="height:300px;"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="third">
          <span slot="label">
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              点击率
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              {{this.totalClickPercent}}%
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainSeven" style="height:300px;"></div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="fourth">
          <span slot="label">
            <div style="text-align: center;font-size: 14px;height: 24px;font-weight: bolder">
              CPC($)
              <el-tooltip type="primary"  placement="top">
                <div slot="content">单次点击花费（Cost Per Clicks）<br/>点击量 / 广告花费</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </div>
            <div style="text-align: center;font-size: 24px;font-weight: bolder">
              {{this.totalCpc}}
            </div>
          </span>
            <div class="echarts" style="height:300px;">
              <div id="mainEight" style="height:300px;"></div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="echarts" style="width: 49%;height:400px;margin-right: 10px;float: right;box-shadow: 0 2px 22px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .06)">
          <div style="padding-left:15px;padding-top:3px;">
            <span style="font-weight: bolder;">广告活动表现</span>

            <span style="margin-left: 5px;">
              <el-tooltip type="primary"  placement="top">
                <div slot="content">广告活动销售额:面积(销售额越大面积越大)<br/>ACOS:颜色(ACOS越大颜色越深)</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </span>
          </div>
          <div id="main" style="width: 49%;height:380px;text-align: center"></div>
        </div>
      </el-row>

      <el-row :gutter="30" style="margin-top: 10px;margin-left: 1px;margin-right: -7px;box-shadow: 0 2px 22px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .06)">
        <el-radio-group v-model="queryParams.downloadType" @change="modifyData" style="margin-right: 20px;margin-bottom: 10px;">
          <el-radio-button label="1"> 每日 </el-radio-button>
          <el-radio-button label="2"> 每周 </el-radio-button>
          <el-radio-button label="3"> 每月 </el-radio-button>
        </el-radio-group>
        <el-button type="primary" icon="el-icon-download" size="mini" @click="handleExport" style="margin-bottom: 10px;">导出</el-button>
        <el-table v-loading="loading" :data="tableList" max-height="450">
          <el-table-column label="日期" align="center" prop="dateSlot" />
          <el-table-column label="展示量" align="center" prop="impressions" />
          <el-table-column label="点击量" align="center" prop="clicks" />
          <el-table-column label="点击率" align="center" prop="clickPercent" >
            <template slot-scope="scope">
            <span v-if="scope.row != undefined">{{
                scope.row.clickPercent != null
                  ? scope.row.clickPercent + "%"
                  : "0%"
              }}</span>
              <span v-if="scope.row == undefined">0%</span>
            </template>
          </el-table-column>
          <el-table-column label="CPC($)" align="center" prop="cpcFee" />
          <el-table-column label="广告花费($)" align="center" prop="fees" />
          <el-table-column label="广告销售额($)" align="center" prop="salesFees" />
          <el-table-column label="ACOS" align="center" prop="acos" >
            <template slot-scope="scope">
            <span v-if="scope.row != undefined">{{
                scope.row.acos != null
                  ? scope.row.acos + "%"
                  : "0%"
              }}</span>
              <span v-if="scope.row == undefined">0%</span>
            </template>
          </el-table-column>
          <el-table-column label="广告订单" align="center" prop="orderQuantity" />
          <el-table-column label="TACOS" align="center" prop="tacos" >
          <template slot-scope="scope">
            <span v-if="scope.row != undefined">{{
                scope.row.tacos != null
                  ? scope.row.tacos + "%"
                  : "0%"
              }}</span>
            <span v-if="scope.row == undefined">0%</span>
          </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-row>


  </div>
</template>

<script>
import * as echarts from 'echarts';
import { queryBiReport} from "@/api/amazon/campaignsinfo";
import { allAccount } from "@/api/amazon/account";
import { accountCampaign } from "@/api/amazon/campaign";
export default {
  name: "biReport",
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
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      stateList:[
        {value:'1',label:'开启'},
        {value:"2",label:'关闭'}
      ],
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
      // 字典表格数据
      tableList: [],
      dayTableList: [],
      weekTableList: [],
      monthTableList: [],
      accountList: [],
      campaignList: [],
      batchPrice:false,
      activityBudget:false,
      popName:undefined,
      totalFees:0,
      totalSales:0,
      totalSalesFees:0,
      totalAcos:0,
      totalRoas:0,
      totalTacos:0,
      totalClicks:0,
      totalImpressions:0,
      totalClickPercent:0,
      totalCpc:0,
      dayList:[],
      salesList:[],
      feesList:[],
      acosList:[],
      tacosList:[],
      impressionsList:[],
      clicksList:[],
      clickPercentList:[],
      cpcFeeList:[],
      expressionList:[],
      main: '',
      mainOne: '',
      mainTwo: '',
      mainThree: '',
      mainFour: '',
      mainFive: '',
      mainSix: '',
      mainSeven: '',
      mainEight: '',
      activeNameOne:'first',
      activeNameTwo:'first',
      activeNameThree:'first',
      // 查询参数
      queryParams: {
        shopId:undefined,
        campaignId:undefined,
        campaignName:undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
        downloadType:1
      },
    };
  },
  created() {
    const now = new Date();
    const day7 = new Date(now.getTime() - 7 * 3600 * 1000 * 24);
    const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
    let time1 = this.parseTime(day7, "{y}-{m}-{d}");
    let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
    this.queryParams.startDate = time1;
    this.queryParams.endDate = time2;
    this.queryParams.dateTime = [time1, time2];
    this.allAccountList();
    this.loading=false;
    //this.initTime();

  },
  methods: {
    formatNums(num) {
      num = num.toString().split("."); // 分隔小数点
      var arr = num[0].split("").reverse(); // 转换成字符数组并且倒序排列
      var res = [];
      for (var i = 0, len = arr.length; i < len; i++) {
        if (i % 3 === 0 && i !== 0) {
          res.push(","); // 添加分隔符
        }
        res.push(arr[i]);
      }
      res.reverse(); // 再次倒序成为正确的顺序
      if (num[1]) {
        // 如果有小数的话添加小数部分
        res = res.join("").concat("." + num[1]);
      } else {
        res = res.join("");
      }
      return res;
    },
    formatState(row, column, cellValue, index){
      for(let i=0; i<this.stateList.length;i++){
        if(cellValue == this.stateList[i].value){
          return this.stateList[i].label;
        }
      }
      return '';
    },
    initTime() {
      const now = new Date();
      const day7 = new Date(now.getTime() - 8 * 3600 * 1000 * 24);
      const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
      let time1 = this.parseTime(day7, "{y}-{m}-{d}");
      let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
      this.queryParams.dateTime = [time1, time2];
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
      this.getTime()
    },
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
        if (this.accountList != null && this.accountList.length > 0) {
          this.queryParams.shopId = this.accountList[0].id;
          this.$nextTick(() => {
            this.queryEcharts();
          })
        }
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
    queryEcharts(){
      this.queryParams.downloadType = 1;
      this.activeNameOne = 'first';
      this.activeNameTwo = 'first';
      this.activeNameThree = 'first';


      queryBiReport(this.queryParams).then((response) => {
        if (response.data.chartTotalResponseDto != null){
          this.totalFees = response.data.chartTotalResponseDto.fees;
          this.totalSales = response.data.chartTotalResponseDto.sales;
          this.totalSalesFees = response.data.chartTotalResponseDto.salesFees;
          this.totalAcos = response.data.chartTotalResponseDto.acos;
          this.totalRoas = response.data.chartTotalResponseDto.roas;
          this.totalTacos = response.data.chartTotalResponseDto.tacos;
          this.totalClicks = response.data.chartTotalResponseDto.clicks;
          this.totalImpressions = response.data.chartTotalResponseDto.impressions;
          this.totalClickPercent = response.data.chartTotalResponseDto.clickPercent;
          this.totalCpc = response.data.chartTotalResponseDto.cpcFee;
        }
        if (response.data.dailyDate != null){
          this.dayList = response.data.dailyDate;
        }
        if (response.data != null){
          this.salesList = response.data.salesFeesList;
          this.feesList = response.data.feesList;
          this.acosList = response.data.acosList;
          this.tacosList = response.data.tacosList;
          this.impressionsList = response.data.impressionsList;
          this.clicksList = response.data.clicksList;
          this.clickPercentList = response.data.clickPercentList;
          this.cpcFeeList = response.data.cpcFeeList;

          this.tableList = response.data.dailyResponseDtoList;
          this.dayTableList = response.data.dailyResponseDtoList;
          this.weekTableList = response.data.weeklyResponseDtoList;
          this.monthTableList = response.data.monthlyResponseDtoList;
          if (response.data.campaignDailyResponseDtoList != null && response.data.campaignDailyResponseDtoList.length>0){
            this.expressionList = [];
            response.data.campaignDailyResponseDtoList.forEach((column, index) => {
              let expressionData = {
                name: column.campaignName,
                value: column.saleFees,
                fees:column.fees,
                acos:column.acos,
                itemStyle: {
                  color: column.color
                },
              };
              this.expressionList.push(expressionData);
            });
          }
        }
        this.myEcharts();
        this.myEchartsOne();
        //this.myEchartsTwo();
        this.myEchartsThree();
        //this.myEchartsFour();
        this.myEchartsFive();
        //this.myEchartsSix();
        //this.myEchartsSeven();
        //this.myEchartsEight();
      });

    },
    //切换标签页时触发
    handleClick(tab, event) {
      if (tab.index == 1){
        this.$nextTick(() => {
          this.myEchartsTwo();
        })
      }
    },
    handleClickTwo(tab, event) {
      if (tab.index == 1){
        this.$nextTick(() => {
          this.myEchartsFour();
        })
      }
    },
    handleClickThree(tab, event) {
      if (tab.index == 1){
        this.$nextTick(() => {
          this.myEchartsSix();
        })
      }else if (tab.index == 2){
        this.$nextTick(() => {
          this.myEchartsSeven();
        })
      }else if (tab.index == 3){
        this.$nextTick(() => {
          this.myEchartsEight();
        })
      }
    },
    modifyData(){
      if (this.queryParams.downloadType == 1){
        this.tableList = this.dayTableList;
      }else if (this.queryParams.downloadType == 2){
        this.tableList = this.weekTableList;
      }else if (this.queryParams.downloadType == 3){
        this.tableList = this.monthTableList;
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      let dayName = "每日";
      if (this.queryParams.downloadType == 2){
        dayName = "每周";
      }else if (this.queryParams.downloadType == 3){
        dayName = "每月";
      }
      this.download(
        "/message/chart/line/export",
        {
          ...this.queryParams,
        },
        `广告数据_${dayName}_${new Date().getTime()}.xlsx`
      );
    },
    myEcharts() {
      this.main = this.$echarts.init(document.getElementById("main"));
      var option = {
        grid:{
          x:0,
          x2:0,
          y:0,
          y2:10
        },
        tooltip: {
          enterable: true, // 设置可移入气泡
          trigger: 'item',
          position: ['50%', '30%'],
          textStyle:{
            align:'left'
          },
          formatter: function (info) {
            if (info.data.name == undefined){
              return '';
            }
            return [
              '<div>' + ' 广告活动名称：'+info.data.name+'</div>',
              '<div>' + ' 总销售额($)：'+ info.data.value +'</div>',
              '<div>' + ' 花费($)：'+ info.data.fees +'</div>',
              '<div>' + ' ACOS-广告活动：'+ info.data.acos +'%</div>'
            ].join('');
          }
        },
        series: [
          {
            type: 'treemap',
            data: [
              {
                name: '广告活动表现',
                value: this.totalSalesFees,
                children: this.expressionList
              }
            ]
          }
        ]
      };
      this.main.setOption(option);
    },
    myEchartsOne() {
      this.mainOne = this.$echarts.init(document.getElementById("mainOne"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.salesList,
            type: 'line'
          }
        ]
      };
      this.mainOne.setOption(option);
    },
    myEchartsTwo() {
      this.mainTwo = this.$echarts.init(document.getElementById("mainTwo"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.feesList,
            type: 'line'
          }
        ]
      };
      this.mainTwo.setOption(option);
    },
    myEchartsThree() {
      this.mainThree = this.$echarts.init(document.getElementById("mainThree"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
          formatter: function (params) {
            var relVal = params[0].name
            for (var i = 0, l = params.length; i < l; i++) {
              relVal += '<br/>' + params[i].marker + params[i].value + '%'
            }
            return relVal;
          }
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.acosList,
            type: 'line'
          }
        ]
      };
      this.mainThree.setOption(option);

    },
    myEchartsFour() {
      this.mainFour = this.$echarts.init(document.getElementById("mainFour"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
          formatter: function (params) {
            var relVal = params[0].name
            for (var i = 0, l = params.length; i < l; i++) {
              relVal += '<br/>' + params[i].marker + params[i].value + '%'
            }
            return relVal;
          }
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.tacosList,
            type: 'line'
          }
        ]
      };
      this.mainFour.setOption(option);
    },
    myEchartsFive() {
      this.mainFive = this.$echarts.init(document.getElementById("mainFive"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.impressionsList,
            type: 'line'
          }
        ]
      };
      this.mainFive.setOption(option);
    },
    myEchartsSix() {
      this.mainSix = this.$echarts.init(document.getElementById("mainSix"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.clicksList,
            type: 'line'
          }
        ]
      };
      this.mainSix.setOption(option);
    },
    myEchartsSeven() {
      this.mainSeven = this.$echarts.init(document.getElementById("mainSeven"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
          formatter: function (params) {
            var relVal = params[0].name
            for (var i = 0, l = params.length; i < l; i++) {
              relVal += '<br/>' + params[i].marker + params[i].value + '%'
            }
            return relVal;
          }
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.clickPercentList,
            type: 'line'
          }
        ]
      };
      this.mainSeven.setOption(option);
    },
    myEchartsEight() {
      this.mainEight = this.$echarts.init(document.getElementById("mainEight"));
      var option = {
        grid:{
          x:60,
          x2:20,
          y:20,
          y2:20,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(32, 33, 36,.7)',
          borderColor: 'rgba(32, 33, 36,0.20)',
          borderWidth: 1,
          textStyle: { // 文字提示样式
            color: '#fff',
            fontSize: '22'
          },
        },
        xAxis: {
          type: 'category',
          data: this.dayList
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: this.cpcFeeList,
            type: 'line'
          }
        ]
      };
      this.mainEight.setOption(option);
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryEcharts();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    }
  }
};
</script>

<style lang="scss" scoped>

::v-deep .el-tabs__item {
  height: 70px !important;
}
::v-deep .el-card__body{
  padding:0px 10px 10px 10px !important;
}
.el-col-lg-4-8 {
  width: 20%;
}
*{
  -webkit-user-select: text !important;
  user-select: text !important;
}
</style>
