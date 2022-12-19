<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
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
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          @click="batchUpdateState"
          >批量修改状态</el-button
        >
        <el-button
          type="success"
          icon="el-icon-plus"
          size="mini"
          @click="showGroup"
          >新增</el-button
        >
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="adGroupsList"
      :summary-method="getSummaries"
      show-summary
      max-height="750"
      @cell-click="tabClick"
      @selection-change="changeCheckBoxValue"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="65"> </el-table-column>
      <el-table-column
        label="广告组"
        align="center"
        prop="adGroupName"
        width="170"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.id === tabClickIndex && tabClickLabel === '状态'"
          >
            <el-select
              ref="inputRefState"
              @change="inputChangeState(scope.row)"
              v-model="stateTo"
              placeholder="请选择状态"
              clearable
              size="small"
              style="width: 90px"
            >
              <el-option
                @click.native="selectState()"
                v-for="item in stateList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </span>
          <span v-else
            >{{
              scope.row.state === 1
                ? "已启用"
                : scope.row.state === 2
                ? "已暂停"
                : "已存档"
            }}
            <i class="el-icon-edit" style="color: #00afff"></i
          ></span>
        </template>
      </el-table-column>

      <el-table-column
        label="曝光量"
        align="center"
        prop="report.impressions"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="点击量"
        align="center"
        prop="report.clicks"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="点击率"
        align="center"
        prop="report.clickPercent"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.report.clickPercent != undefined">{{
            scope.row.report.clickPercent != null
              ? (scope.row.report.clickPercent * 100).toFixed(2) + "%"
              : "0%"
          }}</span>
          <span v-if="scope.row.report.clickPercent == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column
        label="订单量"
        align="center"
        prop="report.totalOrder"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="转化率"
        align="center"
        prop="report.changeRate"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.report.changeRate != undefined">{{
            scope.row.report.changeRate != null
              ? (scope.row.report.changeRate * 100).toFixed(2) + "%"
              : "0%"
          }}</span>
          <span v-if="scope.row.report.changeRate == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column
        label="销售额"
        align="center"
        prop="report.salesFees"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="广告花费"
        align="center"
        prop="report.fees"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="CPC"
        align="center"
        prop="report.cpcFee"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.report.cpcFee != undefined">{{
            scope.row.report.cpcFee
          }}</span>
          <span v-if="scope.row.report.cpcFee == undefined">0</span>
        </template>
      </el-table-column>
      <el-table-column
        label="ACOS"
        align="center"
        prop="report.acos"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.report.acos != undefined">{{
            scope.row.report.acos != null
              ? (scope.row.report.acos * 100).toFixed(2) + "%"
              : "0%"
          }}</span>
          <span v-if="scope.row.report.acos == undefined">0%</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改广告组状态 -->
    <el-dialog
      title="修改广告组状态"
      :visible.sync="batchState"
      width="350px"
      append-to-body
    >
      <el-form
        :model="stateForm"
        ref="stateForm"
        label-width="70px"
        class="demo-ruleForm"
        style="padding-left: 30px"
      >
        <el-form-item label="状态" prop="state">
          <el-select
            v-model="stateForm.state"
            placeholder="请选择状态"
            clearable
            size="small"
            style="width: 140px; padding-bottom: 10px"
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
        <el-button type="primary" @click="submitFormState()">确定</el-button>
        <el-button @click="batchState = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加关键词 -->
    <el-dialog
      title="添加广告组"
      :visible.sync="batchAddGroup"
      width="700px"
      append-to-body
    >
      <el-form
        :model="addGroupForm"
        ref="addGroupForm"
        :rules="rules"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item>
          <el-form-item label="广告组名称" prop="name">
            <el-input
              v-model="addGroupForm.name"
              style="width: 340px; padding-bottom: 10px"
              placeholder="请输入广告组名称"
            />
          </el-form-item>
          <el-form-item label="状态" prop="state">
            <el-select
              v-model="addGroupForm.state"
              placeholder="请选择状态"
              clearable
              size="small"
              style="width: 140px; padding-bottom: 10px"
            >
              <el-option
                v-for="item in stateList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="预算" prop="defaultBid">
            <el-input-number
              v-model="addGroupForm.defaultBid"
              style="width: 150px"
            ></el-input-number>
          </el-form-item>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormAddKey()">确定</el-button>
        <el-button @click="batchAddGroup = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { adgroupList, addGroup, updateGroup } from "@/api/amazon/campaignsinfo";
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
      stateList: [
        { value: "1", label: "已启用" },
        { value: "2", label: "已暂停" },
        { value: "3", label: "已存档" },
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
      adGroupsList: [],
      checkBoxData: [],
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
      //广告销售额
      salesFees: 0,
      //广告花费
      fees: 0,
      //每次点价花费/销售额
      cpcFee: 0,
      //acos
      acos: 0,
      tabClickIndex: null,
      tabClickLabel: null,
      stateTo: null,
      stateForm: {
        state: undefined,
      },
      addGroupForm: {
        name: undefined,
        defaultBid: undefined,
        state: undefined,
        campaignId: undefined,
      },
      batchState: false,
      batchAddGroup: false,
      // 查询参数
      queryParams: {
        state: "1",
        campaignId: undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
      // 默认排序
      defaultSort: { prop: "impressions", order: "descending" },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "广告组名称不能为空", trigger: "blur" },
        ],
        state: [{ required: true, message: "状态不能为空", trigger: "blur" }],
        defaultBid: [
          { required: true, message: "预算不能为空", trigger: "blur" },
        ],
      },
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
      adgroupList(this.queryParams).then((response) => {
        this.adGroupsList = response.data.groupList;
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
      });
    },
        /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
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

    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        let batchKeywordParam = {
          adGroupId: column.adGroupId,
          defaultBid: column.defaultBid,
          state: column.state,
        };
        this.checkBoxData.push(batchKeywordParam);
      });
    },
    tabClick(row, column, cell, event) {
      // tabClick row 当前行 column 当前列
      switch (column.label) {
        case "状态":
          this.stateTo = this.stateList[row.state - 1].value;
          this.tabClickIndex = row.id;
          this.tabClickLabel = column.label;
          break;
        default:
          return;
      }
    },
    selectState() {
      this.tabClickIndex = null;
      this.tabClickLabel = "";
    },
    getSummaries(param) {
      const { columns } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 0) {
          return;
        }
        if (index === 1) {
          sums[index] = "合计";
          return;
        }
        if (index === 2) {
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
          sums[index] = (this.clickPercent * 100).toFixed(2) + "%";
        }
        //订单量
        if (index === 6) {
          sums[index] = this.totalOrder;
        }
        //转化率
        if (index === 7) {
          sums[index] = (this.changeRate * 100).toFixed(2) + "%";
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
          sums[index] = (this.acos * 100).toFixed(2) + "%";
        }
      });
      return sums;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    },

    showGroup() {
      this.batchAddGroup = true;
    },
    batchUpdateState() {
      if (this.checkBoxData.length <= 0) {
        this.$message.warning("请勾选列表里的关键词");
      } else {
        //打开弹窗
        this.formatState.state = this.stateList[0].value;
        this.batchState = true;
      }
    },

    inputChangeState(row) {
      if (this.stateTo === "") {
        this.$message.warning("请选择需要修改的状态");
        return;
      }
      let adKeywordParam = [
        {
          adGroupId: row.adGroupId,
          state: this.stateTo,
        },
      ];
      updateGroup(adKeywordParam).then((response) => {
        this.$message.success("修改状态成功");
        this.getList();
      });
    },

    submitFormState() {
      this.checkBoxData.forEach((column, index) => {
        column.state = this.stateForm.state;
      });
      updateGroup(this.checkBoxData).then((response) => {
        if (response.code === 200) {
          this.batchState = false;
          this.$message.success("批量修改状态成功");
          this.getList();
        }
      });
    },
    submitFormAddKey() {
      this.addGroupForm.campaignId = this.queryParams.campaignId;
      if (
        this.addGroupForm.name === undefined ||
        this.addGroupForm.name === "" ||
        this.addGroupForm.state === undefined ||
        this.addGroupForm.state === "" ||
        this.addGroupForm.defaultBid === undefined
      ) {
        return;
      }
      addGroup(this.addGroupForm).then((response) => {
        if (response.code === 200) {
          if (response.data != null && response.data != "") {
            this.$message.error("添加广告组失败：" + response.data);
          } else {
            this.$message.success("添加广告组成功");
          }
          this.batchAddGroup = false;
          this.getList();
        }
      });
    },
  },
};
</script>
