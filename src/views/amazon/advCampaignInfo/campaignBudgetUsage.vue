<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">

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

    <div class="echarts">
      <div id="main" style="height: 600px;width: 1800px;" :lazy="true"></div>
    </div>

  </div>
</template>

<script>
import * as echarts from 'echarts';
import { campaignBudgetUsageList} from "@/api/amazon/campaignsinfo";
export default {
  name: "campaignBudgetUsage",
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
      hourList: [],
      dateList: [],
      batchPrice:false,
      activityBudget:false,
      popName:undefined,
      main: '',
      // 查询参数
      queryParams: {
        campaignId:undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined
      },
    };
  },
  created() {
    let cam = this.$route.params.campaignId.split(",");
    const now = new Date();
    const day7 = new Date(now.getTime() - 8 * 3600 * 1000 * 24);
    const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
    let time1 = this.parseTime(day7, "{y}-{m}-{d}");
    let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
    this.queryParams.campaignId = cam[0];
    this.queryParams.startDate = time1;
    this.queryParams.endDate = time2;
    this.queryParams.dateTime = [time1, time2];
    //this.initTime();
    this.queryEcharts();

  },
  methods: {
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
      campaignBudgetUsageList(this.queryParams).then((response) => {
        this.hourList = response.data.amzHourList;
        this.dateList = response.data.timeList;
        this.$nextTick(() => {
          this.myEcharts();
        });
      });
    },

    myEcharts() {
      this.main = this.$echarts.init(document.getElementById("main"));

      var option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          name: '日期',
          type: 'category',
          data: this.dateList
        },
        yAxis: {
          name: '小时',
          type: 'value',
          scale: true,
          max: 24,
          min: 0
        },
        series: [
          {
            data: this.hourList,
            type: 'line'
          }
        ]
      };

      this.main.setOption(option);
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
