<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动名称" prop="campaignName">
        <el-input
          v-model="queryParams.campaignName"
          placeholder="请输入活动名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动id" prop="campaignId">
        <el-input
          v-model="queryParams.campaignId"
          placeholder="请输入活动id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告组名称" prop="advGroupName">
        <el-input
          v-model="queryParams.advGroupName"
          placeholder="请输入广告组名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告组id" prop="advGroupId">
        <el-input
          v-model="queryParams.advGroupId"
          placeholder="请输入广告组id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关键词id" prop="keywordId">
        <el-input
          v-model="queryParams.keywordId"
          placeholder="请输入关键词id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关键词" prop="keywordText">
        <el-input
          v-model="queryParams.keywordText"
          placeholder="请输入关键词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="展现量" prop="impressions">
        <el-input
          v-model="queryParams.impressions"
          placeholder="请输入展现量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="点击量" prop="clicks">
        <el-input
          v-model="queryParams.clicks"
          placeholder="请输入点击量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="点击率" prop="clickPercent">
        <el-input
          v-model="queryParams.clickPercent"
          placeholder="请输入点击率"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="每次点价花费" prop="cpcFee">
        <el-input
          v-model="queryParams.cpcFee"
          placeholder="请输入每次点价花费"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告花费" prop="fees">
        <el-input
          v-model="queryParams.fees"
          placeholder="请输入广告花费"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告销售额" prop="salesFees">
        <el-input
          v-model="queryParams.salesFees"
          placeholder="请输入广告销售额"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告成本销售比(ACoS)" prop="feesPercent">
        <el-input
          v-model="queryParams.feesPercent"
          placeholder="请输入广告成本销售比(ACoS)"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="投入产出比(RoAS)" prop="roas">
        <el-input
          v-model="queryParams.roas"
          placeholder="请输入投入产出比(RoAS)"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="总订单数" prop="totalOrder">
        <el-input
          v-model="queryParams.totalOrder"
          placeholder="请输入总订单数"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="总销量" prop="totalSales">
        <el-input
          v-model="queryParams.totalSales"
          placeholder="请输入总销量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="转化率" prop="changeRate">
        <el-input
          v-model="queryParams.changeRate"
          placeholder="请输入转化率"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告sku销量" prop="skuSales">
        <el-input
          v-model="queryParams.skuSales"
          placeholder="请输入广告sku销量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关键词竞价" prop="keywordBid">
        <el-input
          v-model="queryParams.keywordBid"
          placeholder="请输入关键词竞价"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="搜索词" prop="query">
        <el-input
          v-model="queryParams.query"
          placeholder="请输入搜索词"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="日期" prop="dateTime">
        <el-input
          v-model="queryParams.dateTime"
          placeholder="请输入日期"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="${comment}" prop="accountId">
        <el-input
          v-model="queryParams.accountId"
          placeholder="请输入${comment}"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:report:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:report:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:report:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:report:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reportList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="${comment}" align="center" prop="id" />
      <el-table-column label="活动名称" align="center" prop="campaignName" />
      <el-table-column label="活动id" align="center" prop="campaignId" />
      <el-table-column label="广告组名称" align="center" prop="advGroupName" />
      <el-table-column label="广告组id" align="center" prop="advGroupId" />
      <el-table-column label="关键词id" align="center" prop="keywordId" />
      <el-table-column label="关键词" align="center" prop="keywordText" />
      <el-table-column label="类型" align="center" prop="matchType" />
      <el-table-column label="展现量" align="center" prop="impressions" />
      <el-table-column label="点击量" align="center" prop="clicks" />
      <el-table-column label="点击率" align="center" prop="clickPercent" />
      <el-table-column label="每次点价花费" align="center" prop="cpcFee" />
      <el-table-column label="广告花费" align="center" prop="fees" />
      <el-table-column label="广告销售额" align="center" prop="salesFees" />
      <el-table-column label="广告成本销售比(ACoS)" align="center" prop="feesPercent" />
      <el-table-column label="投入产出比(RoAS)" align="center" prop="roas" />
      <el-table-column label="总订单数" align="center" prop="totalOrder" />
      <el-table-column label="总销量" align="center" prop="totalSales" />
      <el-table-column label="转化率" align="center" prop="changeRate" />
      <el-table-column label="广告sku销量" align="center" prop="skuSales" />
      <el-table-column label="关键词竞价" align="center" prop="keywordBid" />
      <el-table-column label="搜索词" align="center" prop="query" />
      <el-table-column label="日期" align="center" prop="dateTime" />
      <el-table-column label="${comment}" align="center" prop="accountId" />
      <el-table-column label="1:sponsoredProducts 2:sponsoredDisplay 3:sponsoredBrands" align="center" prop="campaignType" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:report:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:report:remove']"
          >删除</el-button>
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

    <!-- 添加或修改广告搜索词报告对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动名称" prop="campaignName">
          <el-input v-model="form.campaignName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动id" prop="campaignId">
          <el-input v-model="form.campaignId" placeholder="请输入活动id" />
        </el-form-item>
        <el-form-item label="广告组名称" prop="advGroupName">
          <el-input v-model="form.advGroupName" placeholder="请输入广告组名称" />
        </el-form-item>
        <el-form-item label="广告组id" prop="advGroupId">
          <el-input v-model="form.advGroupId" placeholder="请输入广告组id" />
        </el-form-item>
        <el-form-item label="关键词id" prop="keywordId">
          <el-input v-model="form.keywordId" placeholder="请输入关键词id" />
        </el-form-item>
        <el-form-item label="关键词" prop="keywordText">
          <el-input v-model="form.keywordText" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="展现量" prop="impressions">
          <el-input v-model="form.impressions" placeholder="请输入展现量" />
        </el-form-item>
        <el-form-item label="点击量" prop="clicks">
          <el-input v-model="form.clicks" placeholder="请输入点击量" />
        </el-form-item>
        <el-form-item label="点击率" prop="clickPercent">
          <el-input v-model="form.clickPercent" placeholder="请输入点击率" />
        </el-form-item>
        <el-form-item label="每次点价花费" prop="cpcFee">
          <el-input v-model="form.cpcFee" placeholder="请输入每次点价花费" />
        </el-form-item>
        <el-form-item label="广告花费" prop="fees">
          <el-input v-model="form.fees" placeholder="请输入广告花费" />
        </el-form-item>
        <el-form-item label="广告销售额" prop="salesFees">
          <el-input v-model="form.salesFees" placeholder="请输入广告销售额" />
        </el-form-item>
        <el-form-item label="广告成本销售比(ACoS)" prop="feesPercent">
          <el-input v-model="form.feesPercent" placeholder="请输入广告成本销售比(ACoS)" />
        </el-form-item>
        <el-form-item label="投入产出比(RoAS)" prop="roas">
          <el-input v-model="form.roas" placeholder="请输入投入产出比(RoAS)" />
        </el-form-item>
        <el-form-item label="总订单数" prop="totalOrder">
          <el-input v-model="form.totalOrder" placeholder="请输入总订单数" />
        </el-form-item>
        <el-form-item label="总销量" prop="totalSales">
          <el-input v-model="form.totalSales" placeholder="请输入总销量" />
        </el-form-item>
        <el-form-item label="转化率" prop="changeRate">
          <el-input v-model="form.changeRate" placeholder="请输入转化率" />
        </el-form-item>
        <el-form-item label="广告sku销量" prop="skuSales">
          <el-input v-model="form.skuSales" placeholder="请输入广告sku销量" />
        </el-form-item>
        <el-form-item label="关键词竞价" prop="keywordBid">
          <el-input v-model="form.keywordBid" placeholder="请输入关键词竞价" />
        </el-form-item>
        <el-form-item label="搜索词" prop="query">
          <el-input v-model="form.query" placeholder="请输入搜索词" />
        </el-form-item>
        <el-form-item label="日期" prop="dateTime">
          <el-input v-model="form.dateTime" placeholder="请输入日期" />
        </el-form-item>
        <el-form-item label="${comment}" prop="accountId">
          <el-input v-model="form.accountId" placeholder="请输入${comment}" />
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
import { listReport, getReport, delReport, addReport, updateReport } from "@/api/amazon/searchTermReport";

export default {
  name: "Report",
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
      // 广告搜索词报告表格数据
      reportList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        campaignName: null,
        campaignId: null,
        advGroupName: null,
        advGroupId: null,
        keywordId: null,
        keywordText: null,
        matchType: null,
        impressions: null,
        clicks: null,
        clickPercent: null,
        cpcFee: null,
        fees: null,
        salesFees: null,
        feesPercent: null,
        roas: null,
        totalOrder: null,
        totalSales: null,
        changeRate: null,
        skuSales: null,
        keywordBid: null,
        query: null,
        dateTime: null,
        accountId: null,
        campaignType: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        campaignName: [
          { required: true, message: "活动名称不能为空", trigger: "blur" }
        ],
        campaignId: [
          { required: true, message: "活动id不能为空", trigger: "blur" }
        ],
        advGroupName: [
          { required: true, message: "广告组名称不能为空", trigger: "blur" }
        ],
        advGroupId: [
          { required: true, message: "广告组id不能为空", trigger: "blur" }
        ],
        keywordId: [
          { required: true, message: "关键词id不能为空", trigger: "blur" }
        ],
        keywordText: [
          { required: true, message: "关键词不能为空", trigger: "blur" }
        ],
        matchType: [
          { required: true, message: "类型不能为空", trigger: "change" }
        ],
        impressions: [
          { required: true, message: "展现量不能为空", trigger: "blur" }
        ],
        clicks: [
          { required: true, message: "点击量不能为空", trigger: "blur" }
        ],
        clickPercent: [
          { required: true, message: "点击率不能为空", trigger: "blur" }
        ],
        cpcFee: [
          { required: true, message: "每次点价花费不能为空", trigger: "blur" }
        ],
        fees: [
          { required: true, message: "广告花费不能为空", trigger: "blur" }
        ],
        salesFees: [
          { required: true, message: "广告销售额不能为空", trigger: "blur" }
        ],
        feesPercent: [
          { required: true, message: "广告成本销售比(ACoS)不能为空", trigger: "blur" }
        ],
        roas: [
          { required: true, message: "投入产出比(RoAS)不能为空", trigger: "blur" }
        ],
        totalOrder: [
          { required: true, message: "总订单数不能为空", trigger: "blur" }
        ],
        totalSales: [
          { required: true, message: "总销量不能为空", trigger: "blur" }
        ],
        changeRate: [
          { required: true, message: "转化率不能为空", trigger: "blur" }
        ],
        skuSales: [
          { required: true, message: "广告sku销量不能为空", trigger: "blur" }
        ],
        keywordBid: [
          { required: true, message: "关键词竞价不能为空", trigger: "blur" }
        ],
        query: [
          { required: true, message: "搜索词不能为空", trigger: "blur" }
        ],
        dateTime: [
          { required: true, message: "日期不能为空", trigger: "blur" }
        ],
        accountId: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "$comment不能为空", trigger: "blur" }
        ],
        campaignType: [
          { required: true, message: "1:sponsoredProducts 2:sponsoredDisplay 3:sponsoredBrands不能为空", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询广告搜索词报告列表 */
    getList() {
      this.loading = true;
      listReport(this.queryParams).then(response => {
        this.reportList = response.rows;
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
        campaignName: null,
        campaignId: null,
        advGroupName: null,
        advGroupId: null,
        keywordId: null,
        keywordText: null,
        matchType: null,
        impressions: null,
        clicks: null,
        clickPercent: null,
        cpcFee: null,
        fees: null,
        salesFees: null,
        feesPercent: null,
        roas: null,
        totalOrder: null,
        totalSales: null,
        changeRate: null,
        skuSales: null,
        keywordBid: null,
        query: null,
        dateTime: null,
        accountId: null,
        createTime: null,
        campaignType: null
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
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加广告搜索词报告";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getReport(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改广告搜索词报告";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateReport(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addReport(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除广告搜索词报告编号为"' + ids + '"的数据项？').then(function() {
        return delReport(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/report/export', {
        ...this.queryParams
      }, `report_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
