<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="店铺账号" prop="shopId">
        <el-select v-model="queryParams.shopId" placeholder="请选择店铺账号" clearable size="mini">
          <el-option v-for="item in accountList" :key="item.id" :label="item.accountName + '-' + item.site"
            :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账单时间" prop="billMonth">
        <el-date-picker clearable size="small" v-model="queryParams.billMonth" type="month" value-format="yyyy-MM"
          placeholder="选择账单日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="billList">
      <el-table-column label="店铺名称" align="center" prop="shopName" />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="账单状态" align="center" prop="status" :formatter="formatStatus"/>
      <el-table-column label="账单时间" align="center" prop="billMonth" />
      <!-- <el-table-column label="销售额(美元)" align="center" prop="salesMoney" /> -->
      <el-table-column label="账单金额(元)" align="center" prop="feesMoney" />
      <el-table-column label="支付金额(元)" align="center" prop="payMoney" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleInfo(scope.row.id)"
          >查看账单详情</el-button> -->
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            v-show="scope.row.invoiceUrl!=null"
            @click="handleInvoice(scope.row.invoiceUrl)"
          >发票下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 查看账单详情 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form :model="itemQueryParams" ref="itemForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="ASIN" prop="asin">
        <el-input v-model="itemQueryParams.asin"
          placeholder="请输入ASIN" clearable
          size="small"
          style="width: 140px"></el-input>
      </el-form-item>
      <el-form-item label="托管类型" prop="type">
        <el-select
          v-model="itemQueryParams.type"
          placeholder="请选择托管类型"
          clearable
          size="small"
          style="width: 140px"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="getItemList">搜索</el-button>
      </el-form-item>
    </el-form>
        <el-table v-loading="loading" :data="itemList">
          <el-table-column label="ASIN" align="center" prop="asin" />
          <el-table-column label="托管类型" align="center" prop="type" :formatter="formatType"/>
          <el-table-column label="销售额(美元)" align="center" prop="salesMoney"/>
          <el-table-column label="费用比例" align="center" prop="feesPercent" >
            <template slot-scope="scope">
            <span>{{
            scope.row.feesPercent != null
                ? scope.row.feesPercent*100 + "%"
            : ""
            }}</span>
            </template>
          </el-table-column>
          <el-table-column label="账单金额(元)" align="center" prop="feesMoney" />
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="itemTotal>0"
          :total="itemTotal"
          :page.sync="itemQueryParams.pageNum"
          :limit.sync="itemQueryParams.pageSize"
          @pagination="getItemList"
        />
    </el-dialog>
  </div>
</template>

<script>
import { listBill, listBillItem } from "@/api/amazon/bill";
import { allAccount } from "@/api/amazon/account";
export default {
  name: "Bill",
  data() {
    return {
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
      // 店铺账单表格数据
      billList: [],
      accountList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      itemList: [],
      itemTotal:0,
      statusList: [
        { value: null, label: "全部" },
        { value: "0", label: "未支付" },
        { value: "1", label: "部分支付" },
        { value: "2", label: "支付完成" },
      ],
      typeList: [
        { value: null, label: "全部" },
        { value: "1", label: "自动调价" },
        { value: "2", label: "广告托管" },
      ],
      itemQueryParams: {
        pageNum: 1,
        pageSize: 10,
        billId:null,
        asin: null,
        type: null
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopId: null,
        status: null,
        billMonth: null,
      }
    };
  },
  created() {
    this.allAccountList();
    this.getList();
  },
  methods: {
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },
    /** 查询店铺账单列表 */
    getList() {
      this.loading = true;
      listBill(this.queryParams).then(response => {
        this.billList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询店铺账单列表 */
    getItemList() {
      this.loading = true;
      listBillItem(this.itemQueryParams).then(response => {
        this.itemList = response.rows;
        this.itemTotal = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        userId: null,
        shopId: null,
        status: "0",
        billMonth: null,
        salesMoney: null,
        feesMoney: null,
        payMoney: null,
        createTime: null
      };
      this.resetForm("form");
    },
    formatStatus(row, column, cellValue, index){
      for(let i=0; i<this.statusList.length;i++){
        if(cellValue == this.statusList[i].value){
          return this.statusList[i].label;
        }
      }
      return '';
    },
    formatType(row, column, cellValue, index){
      for(let i=0; i<this.typeList.length;i++){
        if(cellValue == this.typeList[i].value){
          return this.typeList[i].label;
        }
      }
      return '';
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
    handleInfo(billId) {
      this.reset();
      this.open = true;
      this.itemQueryParams.billId = billId
      this.title = "查看账单详情";
      this.getItemList()
    },

    handleInvoice(url) {
     window.open(url);
    }
  }
};
</script>
