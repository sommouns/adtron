<template>
  <div style="margin-top: 20px">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="账号" prop="accountId">
        <el-select
          v-model="queryParams.accountId"
          placeholder="账号"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :label="item.accountName + '-' + item.site"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="ASIN" prop="asin">
        <el-input
          v-model="queryParams.asin"
          placeholder="请输入ASIN"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入活动名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="SellerSku" prop="sellerSku">
        <el-input
          v-model="queryParams.sellerSku"
          placeholder="请输入sellerSku"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设置预算" prop="hasBudget">
        <el-select
          v-model="queryParams.hasBudget"
          placeholder="设置预算"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      <el-form-item label="活动状态" prop="state">
        <el-select
          v-model="queryParams.state"
          placeholder="请选择活动状态"
          size="small"
          style="width: 240px"
        >
          <el-option label="已启用" value="1"> </el-option>
          <el-option label="已暂停" value="2"> </el-option>
          <el-option label="已存档" value="3"> </el-option>
        </el-select>
      </el-form-item>
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

    <el-table v-loading="loading" :data="advAsinSetList" :row-style="rowstyle">
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column label="店铺账号" align="center" prop="accountName" />
      <el-table-column
        label="所属用户"
        align="center"
        prop="userName"
        :v-if="user.usreId == 1"
      />
      <el-table-column label="活动名称" align="center" prop="campaignName" />
      <el-table-column label="ASIN" align="center" prop="asin" />
      <el-table-column
        label="SellerSku"
        align="center"
        prop="sellerSku"
        width="250"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="是否设置预算"
        align="center"
        prop="hasBudget"
        :formatter="formatHasBudget"
      />
      <el-table-column label="活动状态" align="center" prop="state">
        <template slot-scope="scope">
            <span v-if="scope.row.state == '1'">已启用</span>
            <span v-if="scope.row.state == '2'">已暂停</span>
            <span v-if="scope.row.state == '3'">已存档</span>
          </template>
      </el-table-column>
      <el-table-column label="每日预算" align="center" prop="dailyBudget">
        <template slot-scope="scope">
          <el-input-number
            :disabled="hasAuthPerm('advertising:api:saveAdvCampaignAsinSet')"
            v-model="scope.row.dailyBudget"
            style="width: 110px"
            :step="1"
            controls-position="right"
            @change="saveAdvAsinSetList(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="预期ACos(%)" align="center" prop="expectAcos">
        <template slot-scope="scope">
          <el-input-number
            :disabled="hasAuthPerm('advertising:api:saveAdvCampaignAsinSet')"
            v-model="scope.row.expectAcos"
            style="width: 110px"
            :precision="2"
            :step="0.01"
            :max="100"
            controls-position="right"
            @change="saveAdvAsinSetList(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        width="300"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-opportunity"
            v-show="scope.row.hasChange"
            @click="clearChange(scope.row)"
            v-hasPermi="['advertising:api:deleteAdvCampaignAsinSet']"
            >标记已读</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['advertising:api:deleteAdvCampaignAsinSet']"
            >清除预算</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-coin"
            @click="viewChangeList(scope.row.campaignId,scope.row.campaignName,scope.row.asin)"
            v-hasPermi="['advertising:api:deleteAdvCampaignAsinSet']"
            >修改记录</el-button
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

    <!-- 修改记录 -->
    <el-dialog
      :title="title"
      :visible.sync="showChangeList"
      width="900px"
      append-to-body
      @close="closeChangeList()"
    >
      <el-table :data="changeList">
        <el-table-column label="asin" align="center" prop="asin" />

        <el-table-column label="预算" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.oldDailyBudget !== scope.row.dailyBudget"
              >{{ scope.row.oldDailyBudget }} >
              {{ scope.row.dailyBudget }}</span
            >
            <span v-if="scope.row.oldDailyBudget === scope.row.dailyBudget">{{
              scope.row.oldDailyBudget
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="预算" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.oldExpectAcos !== scope.row.expectAcos"
              >{{ scope.row.oldExpectAcos }} > {{ scope.row.expectAcos }}</span
            >
            <span v-if="scope.row.oldExpectAcos === scope.row.expectAcos">{{
              scope.row.oldExpectAcos
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="修改时间" align="center" prop="createTime" />
      </el-table>

      <pagination
        v-show="changeTotal > 0"
        :total="changeTotal"
        :page.sync="changeQueryParams.pageNum"
        :limit.sync="changeQueryParams.pageSize"
        @pagination="viewChangeList"
      />
    </el-dialog>
  </div>
</template>

<script>
import { allAccount, hasAuthPermission } from "@/api/amazon/account";
import {
  advCampaignAsinSetPageList,
  saveAdvCampaignAsinSet,
  deleteAdvCampaignAsinSet,
} from "../../../api/amazon/advCampaignAsinSetList";
import {
  advCampaignAsinSetChangePageList,
  clear,
} from "../../../api/amazon/advCampaignAsinSetChangeList";
import { getUserProfile } from "@/api/system/user";

export default {
  name: "Advertising",
  data() {
    return {
      statusList: [
        { label: "全部", value: null },
        { label: "未设置", value: 0 },
        { label: "已设置", value: 1 },
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
      // 总条数
      total: 0,
      // 字典表格数据
      advAsinSetList: [],
      accountList: [],
      // 弹出层标题
      title: "",
      user: {},
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accountId: undefined,
        asin: undefined,
        name: undefined,
        sellerSku: undefined,
        hasBudget: undefined,
        state: undefined,
      },
      // 表单参数
      form: {},
      // 修改记录
      showChangeList: false,
      changeList: [],
      changeTotal: 0,
      // 查询参数
      changeQueryParams: {
        campaignId:undefined,
        asin:undefined,
        pageNum: 1,
        pageSize: 10,
      },
    };
  },
  created() {
    this.getUser();
    this.allAccountList();
    this.getList();
  },
  methods: {
    getUser() {
      getUserProfile().then((response) => {
        this.user = response.data;
        console.log(this.user);
      });
    },
    hasAuthPerm(param) {
      return !hasAuthPermission(param);
    },
    formatHasBudget(row, column, cellValue, index) {
      for (let i = 0; i < this.statusList.length; i++) {
        if (cellValue == this.statusList[i].value) {
          return this.statusList[i].label;
        }
      }
      return "";
    },
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal
        .confirm('是否确认删除编号为"' + id + '"的数据项？')
        .then(function () {
          return deleteAdvCampaignAsinSet({ id: row.id });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },

    saveAdvAsinSetList(row) {
      let body = {
        accountId: row.accountId,
        asin: row.asin,
        campaignId:row.campaignId,
        dailyBudget: row.dailyBudget,
        expectAcos: row.expectAcos,
      };
      saveAdvCampaignAsinSet(body).then((response) => {
        this.$modal.msgSuccess("保存成功");
        this.open = false;
        this.getList();
      });
    },

    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      advCampaignAsinSetPageList(this.queryParams).then((response) => {
        this.advAsinSetList = response.list;
        this.total = response.total;
        this.loading = false;
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
    /** 清除变更记录 */
    clearChange(row) {
      this.$modal
        .confirm('是否确认标记ASIN为"' + row.asin + '"的数据项为已读？')
        .then(function () {
          return clear(row);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("标记成功");
          row.hasChange = false;
        })
        .catch(() => {});
    },
    /** 查看asin操作记录 */
    viewChangeList(campaignId,campaignName,asin) {
      this.showChangeList = true;
      this.title =campaignName+"-"+asin + "-操作记录";
      this.changeQueryParams.asin = asin;
      this.changeQueryParams.campaignId = campaignId;
      advCampaignAsinSetChangePageList(this.changeQueryParams).then((response) => {
        this.changeList = response.list;
        this.changeTotal = response.total;
      });
    },
    /** 关闭asin操作记录 */
    closeChangeList() {
      this.showChangeList = false;
      this.changeList = [];
      this.changeQueryParams.pageNum = 1;
    },

// 存在修改预算样式修改
   rowstyle({ row, rowIndex }) {
            let stylejson = {};
            if (row.hasChange) {
               //背景颜色
               // stylejson.background = "#e0838f";
              // 也可以修改文字颜色
              stylejson.color='red' ;
                return stylejson;
            } else {
                return "";
            }
        },
  },
};
</script>

