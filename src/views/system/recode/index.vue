<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
     <el-form-item label="账号" prop="accountId">
        <el-select
          v-model="queryParams.accountId"
          placeholder="请选择账号"
          clearable
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

      <el-form-item label="广告活动" prop="campaignName">
        <el-input
          v-model="queryParams.campaignId"
          placeholder="请输入广告活动"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

       <el-form-item label="状态" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择明细类型"
          size="small"
          style="width: 240px"
        >
          <el-option label="调价" value="1" key="1"> </el-option>
          <el-option label="否词" value="2" key="2"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入关键字或者搜索词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>


    <el-table v-loading="loading" :data="recodeList">
      <el-table-column label="账户" align="center" prop="shopName" />
      <el-table-column label="广告活动" align="center" prop="campaignName" />
      <el-table-column label="关键字或者搜索词" align="center" prop="keyword" />
      <el-table-column label="记录类型" align="center" prop="type">
        <template slot-scope="scope">
          <span v-if="scope.row.type == '1'">调价</span>
          <span v-if="scope.row.type == '2'">否词</span>
          <span v-if="scope.row.type == '3'">暂停</span>
        </template>
      </el-table-column>
      <el-table-column label="操作日志" align="center" >
          <template slot-scope="scope">
          <span v-if="scope.row.type == '1' && scope.row.oldBid > scope.row.bid ">{{ scope.row.keyword }} 降低竞价: {{ scope.row.oldBid }}-{{ scope.row.bid }}</span>
          <span v-if="scope.row.type == '1' && scope.row.oldBid < scope.row.bid ">{{ scope.row.keyword }} 提高竞价: {{ scope.row.oldBid }}-{{ scope.row.bid }}</span>
          <span v-if="scope.row.type == '2'">精准否定：{{ scope.row.keyword }}，近30天花费 {{ scope.row.expend }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" />
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
   
  </div>
</template>

<script>
import { listRecode } from "@/api/system/recode";
import { allAccount } from "@/api/amazon/account";

export default {
  name: "Recode",
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
      // 短词操作记录表格数据
      recodeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accountId: null,
        campaignId: null,
        keyword: null,
        type: null,
        oldBid: null,
        bid: null,
        expend: null,
      },
      // 表单参数
      form: {},
      
    };
  },
  created() {
    this.getList();
      this.allAccountList();
  },
  methods: {
    /** 查询短词操作记录列表 */
    getList() {
      this.loading = true;
      listRecode(this.queryParams).then(response => {
        this.recodeList = response.rows;
        this.total = response.total;
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
        accountId: null,
        campaignId: null,
        keyword: null,
        type: null,
        oldBid: null,
        bid: null,
        expend: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
        allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
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
      this.handleQuery();
    },


  }
};
</script>
