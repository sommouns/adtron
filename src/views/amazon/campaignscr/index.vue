<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="店铺账号" prop="shopId">
        <el-select v-model="queryParams.shopId" placeholder="请选择店铺账号" clearable size="mini">
          <el-option v-for="item in accountList" :key="item.id" :label="item.accountName + '-' + item.site"
            :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="广告活动集合" prop="campaignsId">
        <el-select v-model="queryParams.campaignsId" placeholder="请选择广告集合" clearable size="mini">
          <el-option v-for="item in campaignsList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建日期" prop="createTime">
        <el-date-picker clearable size="small" v-model="queryParams.createTime" type="date" value-format="yyyy-MM-dd"
          placeholder="选择创建日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="campaignscrList" @selection-change="handleSelectionChange">
      <el-table-column label="店铺ID" align="center" prop="shopId" />
      <el-table-column label="店铺名称" align="center" prop="shopName" />
      <!-- <el-table-column label="活动集id" align="center" prop="campaignsId" /> -->
      <el-table-column label="活动集标题" align="center" prop="campaignsTitle" />
      <el-table-column label="基准转化率" align="center" prop="clickRate">
        <template slot-scope="scope">
          <span>{{
          scope.row.clickRate != null
              ? scope.row.clickRate + "%"
          : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="点击数指标" align="center" prop="clickNum" />
      <el-table-column label="创建日期" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-search" @click="handleRootWord(scope.row)">查看词根拆解
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <el-dialog title="词根拆解" :visible.sync="rootworkOpen" width="1300px" append-to-body>
      <el-form :model="rootParams" ref="queryForm" :inline="true" label-width="68px">
        <el-form-item label="词根名称" prop="campaignName">
          <el-input v-model="rootParams.rootWord" placeholder="请输入词根名称" clearable size="small" style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="searchRootWord" >搜索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" icon="el-icon-download" size="mini"  @click="handleExport" >导出</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="rootsList" style="width: 100%" width="150">
        <el-table-column label="活动集合名称" align="center" prop="campaignsName" width="300" />
        <el-table-column label="词根名称" align="center" prop="rootWord" width="150" />
        <el-table-column label="词频" align="center" prop="clickNum" width="150" />
        <el-table-column label="搜索词" align="center" prop="searchKeyword" :show-overflow-tooltip="true"/>
      </el-table>
      <pagination v-show="rootTotal > 0" :total="rootTotal" :page.sync="rootParams.pageNum"
        :limit.sync="rootParams.pageSize" @pagination="searchRootWord" />
    </el-dialog>
  </div>
</template>

<script>
import { listCampaignscr } from "@/api/amazon/campaignscr";
import { allAccount } from "@/api/amazon/account";
import { listShop } from "@/api/amazon/negativeCampaignShop";
import { listRootword } from "@/api/system/rootword";
export default {
  name: "Campaignscr",
  data() {
    return {
      // 遮罩层
      loading: true,
      rootworkOpen:false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      accountList: [],
      campaignsList: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 否定-基准点击率表格数据
      campaignscrList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopId: null,
        campaignsId: null,
        createTime: null
      },
      rootsList: [],
      rootTotal:0,
      rootParams: {
        pageNum: 1,
        pageSize: 10,
        rootWord: null,
        campaignsId: null
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.allAccountList();
    this.allCampaignsList();
    this.getList();
  },
  methods: {
    handleRootWord(row){
      this.rootParams.campaignsId = row.id;
      this.searchRootWord();
      this.rootworkOpen = true;
    },
    searchRootWord(){
      listRootword(this.rootParams).then(response => {
        this.rootsList = response.rows;
        this.rootTotal = response.total;
      });
    },
    allCampaignsList() {
      const params = {
        pageNum: 1,
        shopId:this.queryParams.shopId,
        pageSize: 100
      };
      listShop(params).then(response => {
        this.campaignsList = response.rows;
      });
    },
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },
    /** 查询否定-基准点击率列表 */
    getList() {
      this.loading = true;
      listCampaignscr(this.queryParams).then(response => {
        this.campaignscrList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/rootword/export', {
        ...this.rootParams
      }, `unpack_root_${new Date().getTime()}.xlsx`)
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
        shopId: null,
        campaignsId: null,
        campaignsTitle: null,
        clickRate: null,
        clickNum: null,
        createTime: null
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    }
  }
};
</script>
