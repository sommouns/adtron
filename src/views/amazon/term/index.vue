<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="店铺账号" prop="shopId">
        <el-select
          v-model="queryParams.shopId"
          placeholder="请选择店铺账号"
          clearable
          @change="getGather"
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
      <el-form-item label="集合名称" prop="gatherId">
        <el-select
          v-model="queryParams.gatherId"
          placeholder="请选择集合名称"
          clearable
          size="mini"
        >
          <el-option
            v-for="item in gatherNameList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="否定词" prop="searchText">
        <el-input
          v-model="queryParams.searchText"
          placeholder="请输入否定词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
            <el-form-item label="拆分词" prop="splitText">
        <el-input
          v-model="queryParams.splitText"
          placeholder="请输入拆分词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="否定状态" prop="negativeStatus">
        <el-select
          v-model="queryParams.negativeStatus"
          placeholder="请选择否定类型"
          size="small"
          style="width: 80px"
        >
          <el-option
            v-for="item in negativeStatusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="时间">
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
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:term:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleAllNegative"
          >一键否词</el-button
        >
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleCancel"
          >取消</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="termList"
      :default-sort="defaultSort"
      height="650"
      @sort-change="handleSortChange"
    >
      <el-table-column label="店铺名称" align="center" prop="shopName" />
      <el-table-column
        label="集合名称"
        align="center"
        prop="gatherName"
      />
      <el-table-column
        label="集合活动名称"
        align="center"
        prop="campaignNameList"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="否定词"
        align="center"
        prop="keywordText"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="否定类型"
        align="center"
        prop="matchType"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="拆分词"
        align="center"
        prop="splitText"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="拆分词次数"
        align="center"
        prop="splitCount"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="否定过搜索词"
        align="center"
        prop="negativeStatus"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.negativeStatus == '0'">否</span>
          <span v-if="scope.row.negativeStatus == '1'">是</span>
        </template>
      </el-table-column>
      <el-table-column
        label="创建日期"
        align="center"
        prop="createTime"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="220"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete-solid"
            v-show="
              scope.row.negativeStatus === 0 || scope.row.negativeType === 1
            "
            @click="handleNegative(scope.row)"
            >否定搜索词
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page-sizes="[100, 200, 300, 500]"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 否定搜索词 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="90px">
        <el-form-item label="否定搜索词" prop="cancelText">
          <el-input
            v-model="form.cancelText"
            type="textarea"
            :rows="10"
            placeholder="请输入搜索词,多个逗号隔开 最多输入100个"
          />
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
import { listTerm,gatherList, negative, negativeAll, cancel } from "@/api/amazon/term";
import { allAccount } from "@/api/amazon/account";
export default {
  name: "Term",
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
      // 否定关键字表格数据
      termList: [],
      accountList: [],
      gatherNameList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 100,
        shopId: null,
        negativeType: null,
        negativeStatus: null,
        searchText: null,
        splitText: null,
        keywordText: null,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
      defaultSort: { prop: "splitCount", order: "descending" },
      // 表单参数
      form: {
        cancelText: undefined,
      },

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

      negativeTypeList: [
        { label: "全部", value: null },
        { label: "不出单", value: 0 },
        { label: "出单", value: 1 },
      ],
      negativeStatusList: [
        { label: "全部", value: null },
        { label: "否", value: 0 },
        { label: "是", value: 1 },
      ],
    };
  },
  created() {
    allAccount().then((response) => {
      this.accountList = response.data;
    });
    this.getList();
  },
  methods: {
    handleSortChange(column, prop) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 查询否定关键字列表 */
    getList() {
      this.loading = true;
      listTerm(this.queryParams).then((response) => {
        this.termList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    // 获取集合
    getGather() {
      gatherList(this.queryParams.shopId).then((response) => {
        this.gatherNameList = response.data;
      });
    },

    // 表单重置
    reset() {
      this.form = {
        id: null,
        shopId: null,
        campaignName: null,
        negativeType: null,
        keywordText: null,
      };
      this.resetForm("form");
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    handleNegative(row) {
      negative(row.id).then(() => {
        this.$modal.msgSuccess("否定关键词成功");
        getList();
      });
    },
    handleAllNegative() {
      if (this.queryParams.shopId === null) {
        this.$modal.msgError("请选择需要否定的店铺");
        return;
      }
      this.$confirm("确定要否定店铺所有搜索词吗？", "提示", {
        type: "danger",
      }).then(() => {
        negativeAll(this.queryParams).then(() => {
          this.$modal.msgSuccess("一键否定关键词成功");
          getList();
        });
      });
    },
    /** 新增按钮操作 */
    handleCancel() {
      this.open = true;
      this.title = "取消否词";
    },
    /** 提交按钮 */
    submitForm() {
      cancel(this.form.shopId).then(() => {
        this.$modal.msgSuccess("取消否定成功");
        getList();
      });
    },

        // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },

    getTime() {
      if (
        this.queryParams.dateTime != undefined &&
        this.queryParams.dateTime != null
      ) {
        this.queryParams.startDate = this.queryParams.dateTime[0] + " 00:00:00";
        this.queryParams.endDate = this.queryParams.dateTime[1] + " 23:59:59";
      } else {
        this.queryParams.startDate = null;
        this.queryParams.endDate = null;
      }
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "/system/term/export",
        {
          ...this.queryParams,
        },
        `否词记录_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
