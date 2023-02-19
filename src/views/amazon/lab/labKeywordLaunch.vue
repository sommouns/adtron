<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item>
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
        <el-form-item label="广告组名称" label-width="100px" prop="groupName">
          <el-input
            v-model="queryParams.groupName"
            placeholder="请输入广告组名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="ASIN" label-width="70px" prop="keywordText">
          <el-input
            v-model="queryParams.asin"
            placeholder="请输入关键词"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="type">
          <el-select
            v-model="queryParams.state"
            placeholder="请选择状态"
            size="small"
            style="width: 80px"
          >
            <el-option
              v-for="item in typeList"
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
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableList" height="650">
      <el-table-column
        label="店铺账号"
        align="center"
        prop="accountName"
        width="170"
      />
      <el-table-column label="活动名称" align="center" prop="campaignName" />
      <el-table-column label="广告组名称" align="center" prop="groupName" />
      <el-table-column label="ASIN" align="center" prop="asin" width="150" />
      <el-table-column label="SKU" align="center" prop="sku" width="150" />
      <el-table-column label="搜索词" align="center" prop="querys" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handlePriceTo(scope.row)"
            >点击查看</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="日期" align="center" prop="dateTime" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-finished"
            @click="handlePrice(scope.row)"
            >投放</el-button
          >
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

    <!-- 投放 -->
    <el-dialog
      title="投放"
      :visible.sync="batchState"
      width="350px"
      append-to-body
    >
      <el-form
        :model="priceForm"
        ref="priceForm"
        label-width="20px"
        class="demo-ruleForm"
        style="padding-left: 20px"
      >
        <el-form-item prop="priceType">
          <span>确定要把当前搜索词投放到亚马逊吗？</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormState()">确定</el-button>
        <el-button @click="batchState = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看搜索词 -->
    <el-dialog
      title="查看搜索词"
      :visible.sync="batchStateTo"
      width="600px"
      append-to-body
    >
      <el-table :data="querysList">
        <el-table-column label="搜索词" align="center" prop="query" />
        <el-table-column label="匹配方式" align="center" prop="matchType">
          <template slot-scope="scope">
            <span v-if="scope.row.matchType == 'exact'">精准</span>
            <span v-if="scope.row.matchType == 'phrase'">词组</span>
            <span v-if="scope.row.matchType == 'broad'">广泛</span>
          </template>
        </el-table-column>
        <el-table-column
          label="竞价"
          align="center"
          prop="cpcDaily"
          width="100"
        />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  labKeywordLaunchList
} from "@/api/amazon/campaignsinfo";
import { allAccount } from "@/api/amazon/account";
export default {
  name: "labKeywordLaunch",
  dicts: ['sys_show_hide', 'sys_lab_negative_yes_no'],
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
      stateList: [
        { value: "0", label: "未投放" },
        { value: "1", label: "已投放" },
      ],
      typeList: [
        { label: "全部", value: null },
        { label: "未投放", value: 0 },
        { label: "已投放", value: 1 },
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
      batchState: false,
      batchStateTo: false,
      accountList: [],
      querysId: undefined,
      querysList: undefined,
      // 表单参数
      priceForm: {
        state: undefined,
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        asin: undefined,
        campaignName: undefined,
        groupName: undefined,
        accountId: undefined,
        state: undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
    };
  },
  created() {
    const now = new Date();
    const day7 = new Date(now.getTime() - 6 * 3600 * 1000 * 24);
    const yesteday = new Date(now.getTime());
    let time1 = this.parseTime(day7, "{y}-{m}-{d}");
    let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
    this.queryParams.startDate = time1;
    this.queryParams.endDate = time2;
    this.queryParams.dateTime = [time1, time2];
    allAccount().then((response) => {
      this.accountList = response.data;
    });
    //this.initTime();
    this.getList();
  },
  methods: {
    formatState(row, column, cellValue, index) {
      for (let i = 0; i < this.stateList.length; i++) {
        if (cellValue == this.stateList[i].value) {
          return this.stateList[i].label;
        }
      }
      return "";
    },
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      labKeywordLaunchList(this.queryParams).then((response) => {
        this.tableList = response.list;
        this.total = response.total;
        this.loading = false;
      });
    },
    initTime() {
      const now = new Date();
      const day7 = new Date(now.getTime() - 6 * 3600 * 1000 * 24);
      const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
      let time1 = this.parseTime(day7, "{y}-{m}-{d}");
      let time2 = this.parseTime(now, "{y}-{m}-{d}");
      this.queryParams.dateTime = [time1, time2];
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
      this.getTime();
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
    submitFormState() {
      labKeywordLaunchList(this.querysId).then((response) => {
        if (response.code === 200) {
          if (response.data != null && response.data != "") {
            this.$message.error(response.data);
          } else {
            this.$message.success("批量修改状态成功");
          }
          this.batchState = false;
          this.getList();
        }
      });
    },
    handlePrice(data) {
      this.querysId = data.id;
      this.batchState = true;
    },
    handlePriceTo(data) {
      this.querysList = data.querys;
      let obj = JSON.parse(data.querys);
      const userinfo = [];
      for (let i in obj) {
        userinfo.push(obj[i]);
      }
      this.querysList = userinfo;
      this.batchStateTo = true;
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        accountId: null,
        campaignName: null,
        advGroupName: null,
        asin: null,
        state: null,
        createTime: null,
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
  },
};
</script>


