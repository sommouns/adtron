<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item>
        <el-form-item label="状态" prop="state">
        <el-select
          v-model="queryParams.state"
          placeholder="请选择状态"
          clearable
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="success" icon="el-icon-edit" size="mini" @click="batchUpdateState">修改广告策略</el-button>
      </el-form-item>
      <el-form-item>
        <el-tooltip type="primary" content="报表数据暂时只包含SP，SB的广告位报表" placement="top">
          <i class="el-icon-question"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dataList" :summary-method="getSummaries" show-summary>
      <el-table-column label="广告策略" align="center" prop="strategy" width="210" :show-overflow-tooltip="true"/>
      <el-table-column label="广告位" align="center" prop="placement"  />
      <el-table-column label="广告位溢价" align="center" prop="percentage"  />
      <el-table-column label="曝光量" align="center" prop="report.impressions"  />
      <el-table-column label="点击量" align="center" prop="report.clicks" />
      <el-table-column label="点击率" align="center" prop="report.clickPercent">
        <template slot-scope="scope">
              <span>{{
              scope.row.report.clickPercent != null
                  ? (scope.row.report.clickPercent*100).toFixed(2) + "%"
              : ""
              }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单量" align="center" prop="report.totalOrder"/>
      <el-table-column label="转化率" align="center" prop="report.changeRate" >
        <template slot-scope="scope">
              <span>{{
              scope.row.report.changeRate != null
                  ? (scope.row.report.changeRate*100).toFixed(2) + "%"
              : ""
              }}</span>
        </template>
      </el-table-column>
      <el-table-column label="销售额" align="center" prop="report.salesFees" />
      <el-table-column label="广告花费" align="center" prop="report.fees" />
      <el-table-column label="CPC" align="center" prop="report.cpcFee" />
      <el-table-column label="ACOS" align="center" prop="report.acos" >
        <template slot-scope="scope">
              <span>{{
              scope.row.report.acos != null
                  ? (scope.row.report.acos*100).toFixed(2) + "%"
              : ""
              }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改广告位 -->
    <el-dialog
      title="修改广告位"
      :visible.sync="batchState"
      width="430px"
      append-to-body
    >
      <el-form
        :model="priceForm"
        ref="priceForm"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="广告策略" prop="priceType">
          <el-select
            v-model="priceForm.strategy"
            placeholder="请选择广告策略"
            clearable
            size="small"
            style="width: 190px;padding-bottom: 10px;"
          >
            <el-option
              v-for="item in strategyList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="广告位">
          <el-form-item>
            <span>搜索结果顶部（第 1 页）</span>
            <el-input
              oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
              v-model="priceForm.placementTop"
              style="width: 80px;float: right;margin-right: 50px;"
            ><template slot="append">%</template></el-input>
          </el-form-item>

          <el-form-item style="padding-top: 10px;">
            <span>商品页面</span>
            <el-input
              oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
              v-model="priceForm.productPage"
              style="width: 80px;float: right;margin-right: 50px;"
            ><template slot="append">%</template></el-input>
          </el-form-item>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormState()">确定</el-button>
        <el-button @click="batchState = false">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { placementList,updatePlacementBidding } from "@/api/amazon/campaignsinfo";
export default {
  name: "adGroup",
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
        {value:'1',label:'已启用'},
        {value:"2",label:'已暂停'},
        {value:"3",label:'已存档'}
      ],
      strategyList:[
        {value:'LEGACY_FOR_SALES',label:'动态出价-只降低'},
        {value:"AUTO_FOR_SALES",label:'动态出价-提高和降低'},
        {value:"MANUAL",label:'固定竞价'}
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
      dataList: [],
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
      batchState:false,
      // 表单参数
      priceForm: {
        strategy: undefined,
        placementTop: 0,
        productPage:0,
        other:0
      },
      // 查询参数
      queryParams: {
        state:'1',
        campaignId: undefined,
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
    formatState(row, column, cellValue, index){
      for(let i=0; i<this.stateList.length;i++){
        if(cellValue == this.stateList[i].value){
          return this.stateList[i].label;
        }
      }
      return '';
    },
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      placementList(this.queryParams).then(response => {
          this.dataList = response.data.placements;
          this.loading = false;
          this.impressions = response.data.report.impressions;
          this.clicks = response.data.report.clicks;
          this.clickPercent = response.data.report.clickPercent;
          this.totalOrder = response.data.report.totalOrder;
          this.changeRate = response.data.report.changeRate;
          this.cpcFee = response.data.report.cpcFee;
          this.fees = response.data.report.fees;
          this.salesFees = response.data.report.salesFees;
          this.acos = response.data.report.acos;
        }
      );
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
    getSummaries(param) {
      const { columns } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index === 1 || index === 2) {
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
          sums[index] = (this.clickPercent*100).toFixed(2) + "%";
        }
        //订单量
        if (index === 6) {
          sums[index] = this.totalOrder;
        }
        //转化率
        if (index === 7) {
          sums[index] = (this.changeRate*100).toFixed(2) + "%";
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
          sums[index] = this.cpcFee;
        }
        //acos
        if (index === 11) {
          sums[index] = (this.acos*100).toFixed(2) + "%";
        }
      });
      return sums;
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
    batchUpdateState(){
      this.batchState = true;
      if (this.dataList.length>0){
        let strategyTo = this.dataList[0].strategy;
        if (strategyTo == "动态出价-下降"){
          this.priceForm.strategy="LEGACY_FOR_SALES";
        }else if (strategyTo == "动态出价"){
          this.priceForm.strategy="AUTO_FOR_SALES";
        }else{
          this.priceForm.strategy="MANUAL";
        }
        let percentage = this.dataList[0].percentage.replace(/\%/g,'');
        if (percentage != "-"){
          this.priceForm.placementTop = percentage;
        }else{
          this.priceForm.placementTop = 0;
        }
      }
      if (this.dataList.length > 2){
        let percentageTo = this.dataList[1].percentage.replace(/\%/g,'');
        if (percentageTo != "-"){
          this.priceForm.productPage = percentageTo;
        }else{
          this.priceForm.productPage = 0;
        }
      }
    },
    submitFormState(){
      let updateParam = {
        campaignId:this.queryParams.campaignId,
        bidding:{
          strategy:this.priceForm.strategy,
          adjustments:[
            {
              placement:"PLACEMENT_TOP",
              percentage:this.priceForm.placementTop
            },
            {
              placement:"PLACEMENT_PRODUCT_PAGE",
              percentage:this.priceForm.productPage
            }
          ]
        }
      };
      updatePlacementBidding(updateParam).then(response => {
        if (response.code === 200){
          this.$modal.msgSuccess("修改成功");
          this.batchState = false;
          this.getList();
        }
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    }
  }
};
</script>

<style lang="scss" scoped>

::v-deep .el-input-group__append, .el-input-group__prepend{
  padding: 0px 4px !important;
}

</style>
