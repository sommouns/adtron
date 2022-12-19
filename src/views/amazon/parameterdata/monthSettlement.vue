<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="店铺账号" prop="shopId">
        <el-select
          v-model="queryParams.accountId"
          placeholder="请选择店铺账号"
          clearable
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
      <el-form-item>
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
        <el-form-item label="ASIN" prop="asin">
          <el-input
            v-model="queryParams.asin"
            placeholder="请输入ASIN,多个以空格隔开"
            clearable
            size="small"
            name="asinInput"
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
        >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button
        >
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:response:add']"
        >开票</el-button
        >
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableList"  :summary-method="getSummaries" show-summary>
      <el-table-column label="ASIN" align="center" prop="advertisedAsin" width="160" :show-overflow-tooltip="true"/>
      <el-table-column label="展示量" align="center" prop="impressions"/>
      <el-table-column label="点击量" align="center" prop="clicks"/>
      <el-table-column label="点击率" align="center" prop="clickThroughRate">
        <template slot-scope="scope">
              <span v-if="scope.row != undefined">{{
                  scope.row.clickThroughRate != null
                    ? scope.row.clickThroughRate + "%"
                    : "0%"
                }}</span>
        </template>
      </el-table-column>
      <el-table-column label="广告销量" align="center" prop="totalSales"/>
      <el-table-column label="广告销售额($)" align="center" prop="sales"/>
      <el-table-column label="广告花费($)" align="center" prop="cost"/>
      <el-table-column label="ACOS" align="center" prop="acos">
        <template slot-scope="scope">
              <span v-if="scope.row != undefined">{{
                  scope.row.acos != null
                    ? scope.row.acos + "%"
                    : "0%"
                }}</span>
        </template>
      </el-table-column>


      <el-table-column label="ROAS" align="center" prop="roas"/>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加发票返回结果对话框 -->
    <el-dialog title="开票" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="formTo" label-width="120px">
        <el-form-item label="企业名称" prop="gmfMc">
          <el-input v-model="formTo.gmfMc" placeholder="请输入企业名称" :disabled="true"/>

        </el-form-item>
        <el-form-item label="企业地址" prop="gmfDz">
          <el-input v-model="formTo.gmfDz" placeholder="请输入企业地址" :disabled="true"/>
        </el-form-item>
        <el-form-item label="企业电话" prop="gmfDh">
          <el-input v-model="formTo.gmfDh" placeholder="请输入企业电话" :disabled="true"/>
        </el-form-item>
        <el-form-item label="企业开户行" prop="gmfYhdz">
          <el-input
            v-model="formTo.gmfYhdz"
            placeholder="请输入企业开户行"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="企业银行账户" prop="gmfYhzh">
          <el-input v-model="formTo.gmfYhzh" placeholder="请输入企业银行账户" :disabled="true"/>
        </el-form-item>
        <el-form-item label="纳税人识别号" prop="gmfNsrsbh">
          <el-input
            v-model="formTo.gmfNsrsbh"
            placeholder="请输入购买方纳税人识别号"
            :disabled="true"
          />
        </el-form-item>

        <el-form-item label="税率(%)" prop="rate">
          <el-input-number v-model="formTo.rate" placeholder="请输入税率" />
        </el-form-item>
        <el-form-item label="开票金额" prop="jshj">
          <el-input v-model="formTo.jshj" placeholder="请输入开票金额" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { monthSettlementList} from "@/api/amazon/campaignsinfo";
import { allAccount } from "@/api/amazon/account";
import {addResponse} from "@/api/amazon/invoice";
import {listInformation} from "@/api/amazon/billSet";
export default {
  name: "monthSettlement",
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
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 8);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 31);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 91);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
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
      impressions:0,
      clicks:0,
      clickThroughRate:0,
      totalSales:0,
      sales:0,
      cost:0,
      acos:0,
      roas:0,
      // 总条数
      total: 0,
      // 字典表格数据
      tableList: [],
      accountList: [],
      formTo:{},
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        asin: undefined,
        accountId:undefined,
        campaignName:undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined
      }
    };
  },
  created() {
    const now = new Date();
    const day7 = new Date(now.getTime() - 8 * 3600 * 1000 * 24);
    const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
    let time1 = this.parseTime(day7, "{y}-{m}-{d}");
    let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
    this.queryParams.startDate = time1;
    this.queryParams.endDate = time2;
    this.queryParams.dateTime = [time1, time2];
    allAccount().then((response) => {
      this.accountList = response.data;
      if (this.accountList != null && this.accountList.length>0){
        this.queryParams.accountId = this.accountList[0].id;
      }
      this.getList();
    });
    //this.initTime();
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
    getList() {
      this.loading = true;
      monthSettlementList(this.queryParams).then(response => {
          this.tableList = response.data.monthSettlements;
          this.total = response.data.total;
          this.impressions=response.data.impressions;
          this.clicks=response.data.clicks;
          this.clickThroughRate=response.data.clickThroughRate;
          this.totalSales=response.data.totalSales;
          this.sales=response.data.sales;
          this.cost=response.data.cost;
          this.acos=response.data.acos;
          this.roas=response.data.roas;
          this.loading = false;
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
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "/advertising/info/monthSettlementExport",
        {
          ...this.queryParams,
        },
        `月度结算_${new Date().getTime()}.xlsx`
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
        if (index === 1) {
          sums[index] = this.impressions;
        }
        if (index === 2) {
          sums[index] = this.clicks;
        }
        if (index === 3) {
          sums[index] = this.clickThroughRate + "%";
        }
        if (index === 4) {
          sums[index] = this.totalSales;
        }
        if (index === 5) {
          sums[index] = this.sales;
        }
        if (index === 6) {
          sums[index] = this.cost;
        }
        if (index === 7) {
          sums[index] = this.acos + "%";
        }
        if (index === 8) {
          sums[index] = this.roas;
        }
      });
      return sums;
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        accountId:undefined,
        campaignName: null,
        asin: null,
        dateTime: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 表单重置
    resetTo() {
      this.formTo = {
        id: null,
        billId: null,
        gmfMc: null,
        gmfDzdh: null,
        gmfYhzh: null,
        gmfNsrsbh: null,
        ddh: null,
        type: null,
        fpqqlsh: null,
        jqbh: null,
        fpDm: null,
        fpHm: null,
        jshj: null,
        hjbhsje: null,
        rate: null,
        hjse: null,
        kprq: null,
        fpMw: null,
        jym: null,
        ewm: null,
        pdfUrl: null,
        updateTime: null,
        createTime: null,
      };
      this.resetForm("formTo");
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.resetTo();
    },
    /** 提交按钮 */
    submitForm() {
      addResponse(this.formTo).then((response) => {
        this.$modal.msgSuccess("开票成功，可以去账户资金》自主开票里查看或下载发票");
        this.open = false;
        this.getList();
      });
    },
    handleAdd() {
      if (this.queryParams.accountId != undefined && this.queryParams.accountId != null && this.queryParams.accountId !=  ""){
        listInformation(this.queryParams).then((response) => {
          if (response.rows != null && response.rows.length>0){
            this.formTo.gmfMc = response.rows[0].gmfMc;
            this.formTo.gmfDz = response.rows[0].gmfDz;
            this.formTo.gmfDh = response.rows[0].gmfDh;
            this.formTo.gmfYhdz = response.rows[0].gmfYhdz;
            this.formTo.gmfYhzh = response.rows[0].gmfYhzh;
            this.formTo.gmfNsrsbh = response.rows[0].gmfNsrsbh;
            this.formTo.rate = 0;
            let toFixed = (this.sales * 0.03 * 7).toFixed(2);
            this.formTo.jshj = toFixed;
            this.open = true;
          }else{
            this.$message.warning('当前选择的店铺未创建开票信息，请去个人中心添加开票信息！');
          }
        });
      }else{
        this.$message.warning('请先选择店铺再开票！');
      }
    },
  }
};
</script>


