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
        <el-button type="success" icon="el-icon-edit" size="mini" @click="batchUpdateBid">批量修改出价</el-button>
        <el-button type="success" icon="el-icon-edit" size="mini" @click="batchUpdateState">批量修改状态</el-button>
        <el-button type="success" icon="el-icon-plus" size="mini" @click="batchAddKeyword">批量新增</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableList" :summary-method="getSummaries" show-summary :row-class-name="tableRowClassName"
              @cell-click="tabClick" @selection-change="changeCheckBoxValue" :default-sort="defaultSort"
              @sort-change="handleSortChange">
      <el-table-column
        type="selection"
        width="65">
      </el-table-column>
      <el-table-column label="投放" align="center" prop="expression" width="170"/>

      <el-table-column label="出价" align="center" prop="bid" width="100">
        <template slot-scope="scope">
              <span v-if="scope.row.targetId === tabClickIndex && tabClickLabel === '出价'">
                <el-input v-model="scope.row.bid" maxlength="20" placeholder="请输入出价" ref="inputRef" size="mini" @blur="inputBlur(scope.row)" />
              </span>
          <span v-else>{{ scope.row.bid }} <i class="el-icon-edit" style="color: #00afff"></i></span>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
              <span v-if="scope.row.targetId === tabClickIndex && tabClickLabel === '状态'">
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
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report != undefined">{{
                  scope.row.report.impressions
                }}</span>
          <span v-if="scope.row.report == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="点击量" align="center" prop="report.clicks" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                <span v-if="scope.row.report != undefined">{{
                    scope.row.report.clicks
                  }}</span>
          <span v-if="scope.row.report == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="点击率" align="center" prop="report.clickPercent" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report != undefined">{{
                  scope.row.report.clickPercent != null
                    ? (scope.row.report.clickPercent*100).toFixed(2) + "%"
                    : "0%"
                }}</span>
          <span v-if="scope.row.report == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column label="订单量" align="center" prop="report.totalOrder" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                  <span v-if="scope.row.report != undefined">{{
                      scope.row.report.totalOrder
                    }}</span>
          <span v-if="scope.row.report == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="转化率" align="center" prop="report.changeRate" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report != undefined">{{
                  scope.row.report.changeRate != null
                    ? (scope.row.report.changeRate*100).toFixed(2) + "%"
                    : "0%"
                }}</span>
          <span v-if="scope.row.report == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column label="销售额" align="center" prop="report.salesFees" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                    <span v-if="scope.row.report != undefined">{{
                        scope.row.report.salesFees
                      }}</span>
          <span v-if="scope.row.report == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="广告花费" align="center" prop="report.fees" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                      <span v-if="scope.row.report != undefined">{{
                          scope.row.report.fees
                        }}</span>
          <span v-if="scope.row.report == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="CPC" align="center" prop="report.cpcFee" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
                        <span v-if="scope.row.report != undefined">{{
                            scope.row.report.cpcFee != null
                              ? scope.row.report.cpcFee
                              : "0"
                          }}</span>
          <span v-if="scope.row.report == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column label="ACOS" align="center" prop="report.acos" sortable="custom"
                       :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
              <span v-if="scope.row.report != undefined">{{
                  scope.row.report.acos != null
                    ? (scope.row.report.acos*100).toFixed(2) + "%"
                    : "0%"
                }}</span>
          <span v-if="scope.row.report == undefined">0%</span>
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

    <!-- 修改投放出价 -->
    <el-dialog
      title="修改投放出价"
      :visible.sync="batchPrice"
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

        <el-form-item label="出价($)" prop="rate">
          <el-input
            oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
            v-model="priceForm.rate"
            style="width: 150px;padding-right: 10px"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm()"
        >确定</el-button
        >
        <el-button @click="batchPrice = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改投放状态 -->
    <el-dialog
      title="修改投放状态"
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

    <!-- 添加投放 -->
    <el-dialog
      title="添加投放"
      :visible.sync="batchAddKey"
      width="930px"
      append-to-body
    >
      <el-form
        :model="addKeyForm"
        ref="addKeyForm"
        label-width="98px"
        class="demo-ruleForm"
      >
        <el-form-item label="广告组" prop="adGroupIdList">
          <el-select style="margin-top: 5px;"
                     v-model="addKeyForm.keyGroupList"
                     placeholder="请选择广告组"
                     clearable
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
        <el-form-item label="表达式类型" prop="expressionType">
          <el-select style="margin-top: 5px;"
                     v-model="addKeyForm.expressionType"
                     placeholder="请选择投放类型"
                     clearable
                     size="mini"
          >
            <el-option
              v-for="item in targetExpressionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="投放类型" prop="expressionTypeTo">
          <el-select style="margin-top: 5px;"
                     v-model="addKeyForm.expressionTypeTo"
                     placeholder="请选择投放类型"
                     clearable
                     size="mini"
          >
            <el-option
              v-for="item in expressionTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            type="textarea"
            :rows="15"
            resize="none"
            size="mini"
            style="width: 340px"
            placeholder="请输入ASIN列表。如果是多个，使用换行符隔开"
            v-model="textarea">
          </el-input>

          <el-table v-loading="loadingTo" :data="addKeywordList" style="width: 440px;float: right" border max-height="327" height="327" @cell-click="tabClick">
            <el-table-column label="ASIN" align="center" prop="asin" width="170" :show-overflow-tooltip="true"/>
            <el-table-column label="出价" align="center" prop="bid" width="80">
              <template slot-scope="scope">
                <span v-if="scope.row.targetId === tabClickIndex && tabClickLabel === '出价'">
                  <el-input v-model="scope.row.bid" maxlength="20" placeholder="请输入出价" ref="inputRef" size="mini" @blur="inputBlurBatch(scope.row)" />
                </span>
                <span v-else>{{ scope.row.bid }} <i class="el-icon-edit" style="color: #00afff"></i></span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="deleteKeyword(scope.row)"
                >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-button type="success" style="margin-left: 208px;" @click="rightAddKeyword">添加ASIN ⟹</el-button>
          <el-button type="success" style="margin-left: 347px;" @click="rightDeleteKeyword">一键删除</el-button>
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
import { targetList,adGroupFrameList,adGroupTargetBid,changeTargetPrice,changeTargetState,batchAddTarget } from "@/api/amazon/campaignsinfo";
export default {
  name: "targets",
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
      targetExpressionList:[
        {value:'1',label:'投ASIN'}
      ],
      expressionTypeList:[
        {value:'1',label:'手动'}
      ],
      // 遮罩层
      loading: true,
      loadingTo: false,
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
      groupIdList:[],
      addKeywordList:[],
      checkBoxData: [],
      tabClickIndex:null,
      tabClickLabel:null,
      stateTo:null,
      batchPrice:false,
      batchState:false,
      batchAddKey:false,
      textarea:null,
      // 表单参数
      priceForm: {
        rate: undefined,
        //1提高竞价 2降低竞价 3设置竞价为￥ 4设置单个
        priceType: undefined,
        state:undefined,
      },
      addKeyForm: {
        keyGroupList: undefined,
        expressionType:undefined,
        expressionTypeTo:undefined
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
        pageNum: 1,
        pageSize: 10,
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
    formatState(row, column, cellValue, index){
      for(let i=0; i<this.stateList.length;i++){
        if(cellValue == this.stateList[i].value){
          return this.stateList[i].label;
        }
      }
      return '';
    },
    adGroupFrameList() {
      let adGroupParam = {
        campaignId:this.queryParams.campaignId
      };
      adGroupFrameList(adGroupParam).then((response) => {
        this.groupIdList = response.data;
      });
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      if (null != column.order) {
        this.queryParams.isAsc = column.order;
        this.getList();
      }
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
    },
    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        let batchKeywordParam = {
          targetId:column.targetId,
          adGroupId:column.adGroupId,
          campaignId:this.queryParams.campaignId,
          bid:column.bid,
          state:column.state,
        };
        this.checkBoxData.push(batchKeywordParam);
      });
    },
    tabClick (row, column, cell, event) {
      // tabClick row 当前行 column 当前列
      switch (column.label) {
        case '出价':
          this.tabClickIndex = row.targetId;
          this.tabClickLabel = column.label;
          this.$nextTick(() => {
            this.$refs.inputRef.focus();
          })
          break
        case '状态':
          this.stateTo = this.stateList[row.state-1].value;
          this.tabClickIndex = row.targetId;
          this.tabClickLabel = column.label;
          break
        default: return
      }
    },
    inputBlur (row) {
      // 失去焦点初始化
      this.tabClickIndex = null;
      this.tabClickLabel = '';
      let adKeywordParam = [{
        targetId:row.targetId,
        adGroupId:row.adGroupId,
        campaignId:this.queryParams.campaignId,
        bid:row.bid
      }];
      let changeKeywordsRequest = {
        keywordList:adKeywordParam,
        rate:row.bid
      };
      changeTargetPrice(changeKeywordsRequest).then((response) => {
        this.$message.success('修改出价成功');
        this.getList();
      });
    },
    inputChangeState(row){
      if(this.stateTo===''){
        this.$message.warning("请选择需要修改的状态");
        return;
      }
      let adKeywordParam = [{
        targetId:row.targetId,
        adGroupId:row.adGroupId,
        campaignId:this.queryParams.campaignId,
        state:this.stateTo
      }];
      changeTargetState(adKeywordParam).then((response) => {
        this.$message.success('修改状态成功');
        this.getList();
      });

    },
    inputBlurBatch(){
      // 失去焦点初始化
      this.tabClickIndex = null;
      this.tabClickLabel = '';

    },
    selectState(){
      this.tabClickIndex = null;
      this.tabClickLabel = '';
    },
    batchUpdateBid(){
      if (this.checkBoxData.length<=0){
        this.$message.warning('请勾选列表里的数据');
      }else{
        //打开弹窗
        //this.priceForm.priceType=this.priceTypeList[0].value;
        this.priceForm.rate="";
        this.batchPrice = true;
      }
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
    batchAddKeyword(){
      //打开批量添加关键词弹窗
      if (this.groupIdList != null && this.groupIdList.length>0){
        this.addKeyForm.keyGroupList=this.groupIdList[0].adGroupId;
      }
      this.addKeyForm.expressionType = this.targetExpressionList[0].value;
      this.addKeyForm.expressionTypeTo = this.expressionTypeList[0].value;
      this.batchAddKey = true;
      this.addKeywordList=null;
      this.textarea=null;
    },
    /** 修改关键词竞价提交 */
    submitForm() {
      if (this.priceForm.rate===""){
        this.$message.warning('请输入出价');
        return ;
      }
      this.checkBoxData.forEach((column, index) => {
        column.bid = this.priceForm.rate
      });
      let changeKeywordsRequest = {
        keywordList:this.checkBoxData,
        priceType:this.priceForm.priceType,
        rate:this.priceForm.rate
      };
      changeTargetPrice(changeKeywordsRequest).then((response) => {
        if (response.code === 200){
          this.batchPrice = false;
          this.$message.success('批量修改出价成功');
          this.getList();
        }
      });
    },
    submitFormState(){
      this.checkBoxData.forEach((column, index) => {
        column.state = this.priceForm.state
      });
      changeTargetState(this.checkBoxData).then((response) => {
        if (response.code === 200){
          this.batchState = false;
          this.$message.success('批量修改状态成功');
          this.getList();
        }
      });
    },
    submitFormAddKey(){
      if (
        this.addKeywordList === null ||
        this.addKeywordList.length <= 0
      ) {
        this.$message.warning("没有需要添加的投放");
        return;
      }
      batchAddTarget(this.addKeywordList).then((response) => {
        if (response.code === 200){
          if (response.data!=null && response.data!=""){
            this.$message.error('批量添加投放部分失败：'+response.data);
          }else{
            this.$message.success('批量添加投放成功');
          }
          this.batchAddKey = false;
          this.getList();
        }
      });
    },
    deleteKeyword(row){
      //删除投放
      let addKeywordListTo = this.addKeywordList;
      let index=addKeywordListTo.findIndex(function(item){
        return item.targetId===row.targetId;
      });
      addKeywordListTo.splice(index,1);
      this.addKeywordList = addKeywordListTo;
    },
    rightDeleteKeyword(){
      //一键删除
      this.addKeywordList=[];
    },
    rightAddKeyword(){
      //向右添加ASIN
      if (this.textarea != null){
        let split = this.textarea.split(/\n/);
        let addKeywordListTo = [];
        split.forEach((column, index) => {
          let batchKeywordParam = {
            targetId:index,
            asin:column,
            adGroupId:this.addKeyForm.keyGroupList,
            campaignId:this.queryParams.campaignId,
            expressionType:this.addKeyForm.expressionTypeTo
          }
          addKeywordListTo.push(batchKeywordParam);
        });
        if (addKeywordListTo.length>0){
          //请求接口获取竞价 并渲染表格
          this.loadingTo = true;
          adGroupTargetBid(addKeywordListTo).then((response) => {
            if (response.code === 200){
              addKeywordListTo = response.data;
              this.addKeywordList = addKeywordListTo;
            }
            this.loadingTo = false;
          });
        }
      }
    },
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      targetList(this.queryParams).then(response => {
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
          return;
        }
        if (index === 1) {
          sums[index] = "合计";
          return;
        }
        if (index >= 2 && index <= 3) {
          return;
        }
        //曝光量
        if (index === 4) {
          sums[index] = this.impressions;
        }
        //点击量
        if (index === 5) {
          sums[index] = this.clicks;
        }
        //点击率
        if (index === 6) {
          sums[index] = (this.clickPercent * 100).toFixed(2) + "%";
        }
        //订单量
        if (index === 7) {
          sums[index] = this.totalOrder;
        }
        //转化率
        if (index === 8) {
          sums[index] = (this.changeRate * 100).toFixed(2) + "%";
        }
        //广告销售额
        if (index === 9) {
          sums[index] = this.salesFees;
        }
        //广告花费
        if (index === 10) {
          sums[index] = this.fees;
        }
        //每次点价花费/销售额
        if (index === 11) {
          sums[index] = this.cpcFee.toFixed(2);
        }
        //acos
        if (index === 12) {
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

<style lang="scss" scoped>
::v-deep .el-form-item--medium{
  line-height: 20px !important;
}
::v-deep .el-form-item__content{
  line-height: 20px !important;
}
::v-deep .el-textarea__inner{
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif !important;
  font-size: 14px;
  height: 327px !important;
}
</style>
