<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
    <el-form-item label="广告组" prop="adGroupIdList">
      <el-select
        v-model="queryParams.adGroupIdList"
        placeholder="请选择广告组"
        clearable
        multiple
        collapse-tags
        size="mini"
      >
        <el-option
          v-for="item in groupIdList"
          :key="item.adGroupId"
          :label="item.adGroupName"
          :value="item.adGroupId"
        />
      </el-select>
    </el-form-item>
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
      <el-form-item>
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
        <el-button type="success" icon="el-icon-edit" size="mini" @click="batchUpdateState">批量修改状态</el-button>
        <el-button type="success" icon="el-icon-plus" size="mini" @click="batchAddAdproduct">批量新增</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableList" :summary-method="getSummaries" show-summary max-height="750" :row-class-name="tableRowClassName"
              @cell-click="tabClick" @selection-change="changeCheckBoxValue" :default-sort="defaultSort"
              @sort-change="handleSortChange">
      <el-table-column
        type="selection"
        width="65">
      </el-table-column>
      <el-table-column
        label="主图"
        width="70"
        align="center"
      >
        <template slot-scope="scope">
          <el-popover
            width="300px"
            trigger="hover"
            placement="left"
          >
            <div style="width:300px;height:300px;background:#f5f5f5;text-align:center">
              <el-image
                style="width:100%;"
                :src="
                  scope.row.imageUrl
                "
              />
            </div>

            <div
              slot="reference"
              class="name-wrapper"
            >
              <el-image
                style="width:50px;height:50px;vertical-align: top;background:#f5f5f5;text-align:center"
                :src="scope.row.imageUrl" @click="jumpAmz(scope.row)"
              >
                <div
                  slot="error"
                  class="image-slot"
                >
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="ASIN" align="center" prop="asin" width="170">
        <template slot-scope="scope">
          <router-link :to="'/parameterdata/negativedata/index/' + scope.row.asin + ','+ queryParams.dateTime" class="link-type">
            <span>{{ scope.row.asin }}</span>
          </router-link>

          <!--<el-link @click="jumpAnalysis(scope.row)" type="primary" target="_blank"><span>{{ scope.row.asin }}</span></el-link>-->
        </template>
      </el-table-column>
      <el-table-column label="SKU" align="center" prop="sku" width="170"/>

      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
              <span v-if="scope.row.id === tabClickIndex && tabClickLabel === '状态'">
                  <el-select ref="inputRefState" @change="inputChangeState(scope.row)"
                             v-model="stateTo"
                             placeholder="请选择状态"
                             clearable
                             size="small"
                             style="width: 90px"
                  >
                    <el-option @click.native="selectState()"
                               v-for="item in stateList"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value"
                    />
                  </el-select>
              </span>
          <span v-else >{{ scope.row.state===1?"已启用":scope.row.state===2?"已暂停":"已存档" }} <i class="el-icon-edit" style="color: #00afff"></i></span>
        </template>
      </el-table-column>

      <el-table-column label="曝光量" align="center" prop="report.impressions" sortable="custom"
                       :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="点击量" align="center" prop="report.clicks" sortable="custom"
                       :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="点击率" align="center" prop="report.clickPercent" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report.clickPercent != undefined">{{
              scope.row.report.clickPercent != null
                  ? (scope.row.report.clickPercent*100).toFixed(2) + "%"
              : "0%"
              }}</span>
            <span v-if="scope.row.report.clickPercent == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column label="订单量" align="center" prop="report.totalOrder" sortable="custom"
                       :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="转化率" align="center" prop="report.changeRate" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report.changeRate != undefined">{{
              scope.row.report.changeRate != null
                  ? (scope.row.report.changeRate*100).toFixed(2) + "%"
              : "0%"
              }}</span>
            <span v-if="scope.row.report.changeRate == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column label="销售额" align="center" prop="report.salesFees" sortable="custom"
                       :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="广告花费" align="center" prop="report.fees" sortable="custom"
                       :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="CPC" align="center" prop="report.cpcFee" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report.cpcFee != undefined">{{
                  scope.row.report.cpcFee
                }}</span>
          <span v-if="scope.row.report.cpcFee == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="ACOS" align="center" prop="report.acos" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report.acos != undefined">{{
              scope.row.report.acos != null
                  ? (scope.row.report.acos*100).toFixed(2) + "%"
              : "0%"
              }}</span>
              <span v-if="scope.row.report.acos == undefined">0%</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改广告ASIN状态 -->
    <el-dialog
      title="修改广告状态"
      :visible.sync="batchState"
      width="350px"
      append-to-body
    >
      <el-form
        :model="priceForm"
        ref="priceForm"
        label-width="70px"
        class="demo-ruleForm"
        style="padding-left: 30px"
      >
        <el-form-item label="状态" prop="priceType">
          <el-select
            v-model="priceForm.state"
            placeholder="请选择状态"
            clearable
            size="small"
            style="width: 140px;padding-bottom: 10px;"
          >
            <el-option
              v-for="item in stateList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormState()"
        >确定</el-button
        >
        <el-button @click="batchState = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 批量添加 -->
    <el-dialog
      title="批量添加"
      :visible.sync="batchAddKey"
      width="500px"
      append-to-body
    >
      <el-form
        :model="addKeyForm"
        ref="addKeyForm"
        label-width="70px"
        class="demo-ruleForm"
      >
        <el-form-item label="广告组" prop="adGroupIdList">
          <el-select style="margin-top: 5px;"
                     v-model="addKeyForm.groupId"
                     placeholder="请选择广告组"
                     clearable
                     size="mini"
                     @change="selectAsin"
          >
            <el-option
              v-for="item in groupIdList"
              :key="item.adGroupId"
              :label="item.adGroupName"
              :value="item.adGroupId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="ASIN" prop="adGroupIdList">
          <el-select style="margin-top: 5px;"
                     v-model="addKeyForm.asin"
                     placeholder="请选择广告组"
                     clearable
                     size="mini"
                     @change="selectSku"
          >
            <el-option
              v-for="item in asinList"
              :key="item.asin"
              :label="item.asin"
              :value="item.asin"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU" prop="adGroupIdList">
          <el-select style="margin-top: 5px;"
                     v-model="addKeyForm.sku"
                     placeholder="请选择广告组"
                     clearable
                     size="mini"
          >
            <el-option
              v-for="item in skuList"
              :key="item.sku"
              :label="item.sku"
              :value="item.sku"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormAddKey()"
        >确定</el-button
        >
        <el-button @click="batchAddKey = false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { productadList,adGroupFrameList,queryProductAsin,batchAddProduce,changeProduceState } from "@/api/amazon/campaignsinfo";
export default {
  name: "productAds",
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
      groupIdList:[],
      asinList: [],
      skuList:[],
      tabClickIndex:null,
      tabClickLabel:null,
      checkBoxData: [],
      stateTo:null,
      batchAddKey:false,
      batchState:false,
      addKeyForm: {
        groupId: undefined,
        asin: undefined,
        sku: undefined
      },
      // 表单参数
      priceForm: {
        state:undefined,
      },
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
      defaultSort: { prop: "report.clicks", order: "descending" },
      // 查询参数
      queryParams: {
        state:'1',
        adGroupId: undefined,
        adGroupIdList:undefined,
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
    this.adGroupFrameList();
  },
  methods: {
    adGroupFrameList() {
      let adGroupParam = {
        campaignId:this.queryParams.campaignId
      };
      adGroupFrameList(adGroupParam).then((response) => {
        this.groupIdList = response.data;
      });
    },
    jumpAmz(row){
      window.open('https://www.amazon.com/dp/'+ row.asin);
    },
    jumpAnalysis(row){
      this.$router.push({
        // 跳转到的页面名
        name: '/parameterdata/negativedata/index/1',
        // 传递的参数集合
        params: {
          campaignId:this.queryParams.campaignId,
          startDate:this.queryParams.startDate,
          endDate:this.queryParams.endDate
        }
      })
    },
    batchUpdateState(){
      if (this.checkBoxData.length<=0){
        this.$message.warning('请勾选列表里的数据');
      }else{
        //打开弹窗
        this.priceForm.state=this.stateList[0].value;
        this.batchState = true;
      }
    },
    batchAddAdproduct(){
      //打开批量添加广告弹窗
      this.addKeyForm.groupId=undefined;
      this.addKeyForm.asin=undefined;
      this.addKeyForm.sku=undefined;
      if (this.groupIdList != null && this.groupIdList.length>0){
        this.addKeyForm.groupId=this.groupIdList[0].adGroupId;
        this.selectAsin();
      }
      this.batchAddKey = true;
    },
    inputChangeState(row){
      if(this.stateTo===''){
        this.$message.warning("请选择需要修改的状态");
        return;
      }
      let adKeywordParam = [{
        adId:row.adId,
        adGroupId:row.adGroupId,
        state:this.stateTo
      }];
      changeProduceState(adKeywordParam).then((response) => {
        this.$message.success('修改状态成功');
        this.getList();
      });

    },
    selectState(){
      this.tabClickIndex = null;
      this.tabClickLabel = '';
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
    },
    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        let batchKeywordParam = {
          adId:column.adId,
          adGroupId:column.adGroupId,
          state:column.state,
        };
        this.checkBoxData.push(batchKeywordParam);
      });
    },
    tabClick (row, column, cell, event) {
      // tabClick row 当前行 column 当前列
      switch (column.label) {
        case '状态':
          this.stateTo = this.stateList[row.state-1].value;
          this.tabClickIndex = row.id;
          this.tabClickLabel = column.label;
          break
        default: return
      }
    },
    submitFormAddKey(){
      if (this.addKeyForm.groupId === null || this.addKeyForm.groupId ===undefined){
        this.$message.warning("请选择广告组");
        return ;
      }
      if (this.addKeyForm.asin === null || this.addKeyForm.asin ===undefined){
        this.$message.warning("请选择ASIN");
        return ;
      }
      if (this.addKeyForm.sku === null || this.addKeyForm.sku ===undefined){
        this.$message.warning("请选择SKU");
        return ;
      }
      let batchParam = {
        campaignId:this.queryParams.campaignId,
        adGroupId:this.addKeyForm.groupId,
        state:"enabled",
        sku:this.addKeyForm.sku,
        asin:this.addKeyForm.asin
      };
      batchAddProduce(batchParam).then((response) => {
        if (response.code === 200){
          this.$message.success('添加广告成功');
          this.batchAddKey = false;
          this.getList();
        }
      });
    },
    selectAsin() {
      this.asinList = [];
      if (
        this.addKeyForm.groupId == null ||
        this.addKeyForm.groupId == undefined||
        this.addKeyForm.groupId == ''
      ) {
        return;
      }
      let adGroupParam = {
        adGroupId:this.addKeyForm.groupId,
        state:1
      };
      queryProductAsin(adGroupParam).then((response) => {
        this.asinList = response.data;
        if (this.asinList != null && this.asinList.length>0){
          this.addKeyForm.asin=this.asinList[0].asin;
          this.selectSku();
        }
      });
    },
    selectSku(){
      this.skuList = [];
      if (
        this.addKeyForm.groupId == null ||
        this.addKeyForm.groupId == undefined||
        this.addKeyForm.groupId == ''
      ) {
        return;
      }
      if (
        this.addKeyForm.asin == null ||
        this.addKeyForm.asin == undefined||
        this.addKeyForm.asin == ''
      ) {
        return;
      }
      let adGroupParam = {
        adGroupId:this.addKeyForm.groupId,
        asin:this.addKeyForm.asin,
        state:2
      };
      queryProductAsin(adGroupParam).then((response) => {
        this.skuList = response.data;
        if (this.skuList != null && this.skuList.length>0){
          this.addKeyForm.sku=this.skuList[0].sku;
        }
      });
    },
    submitFormState(){
      this.checkBoxData.forEach((column, index) => {
        column.state = this.priceForm.state
      });
      changeProduceState(this.checkBoxData).then((response) => {
        if (response.code === 200){
          this.batchState = false;
          this.$message.success('批量修改状态成功');
          this.getList();
        }
      });
    },
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      productadList(this.queryParams).then(response => {
          this.tableList = response.data.productList;
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
    getSummaries(param) {
      const { columns, productList } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          return;
        }
        if (index === 1) {
          sums[index] = "合计";
          return;
        }
        if (index >= 2 && index <= 4) {
          return;
        }
        //曝光量
        if (index === 5) {
          sums[index] = this.impressions;
        }
        //点击量
        if (index === 6) {
          sums[index] = this.clicks;
        }
        //点击率
        if (index === 7) {
          sums[index] = (this.clickPercent * 100).toFixed(2) + "%";
        }
        //订单量
        if (index === 8) {
          sums[index] = this.totalOrder;
        }
        //转化率
        if (index === 9) {
          sums[index] = (this.changeRate * 100).toFixed(2) + "%";
        }
        //广告销售额
        if (index === 10) {
          sums[index] = this.salesFees;
        }
        //广告花费
        if (index === 11) {
          sums[index] = this.fees;
        }
        //每次点价花费/销售额
        if (index === 12) {
          sums[index] = this.cpcFee.toFixed(2);
        }
        //acos
        if (index === 13) {
          sums[index] = (this.acos*100).toFixed(2) + "%";
        }
      });
      return sums;
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
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    }
  }
};
</script>
