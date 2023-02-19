<template>
  <div class="app-container">
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

      <el-form-item label="活动名称" prop="campaignName">
        <el-input
          v-model="queryParams.campaignName"
          placeholder="请输入活动"
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
      </el-form-item>

      <el-form-item label="是否托管" prop="auto">
        <el-select
          v-model="queryParams.auto"
          placeholder="托管"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in autoList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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

    <el-table v-loading="loading" :data="advAsinSetList">
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column label="店铺账号" align="center" prop="accountName" />
      <el-table-column
        label="所属用户"
        align="center"
        prop="userName"
        :v-if="user.usreId == 1"
      />
      <el-table-column label="活动名称" align="center" prop="campaignName" />
      <el-table-column
        label="是否设置预算"
        align="center"
        prop="hasBudget"
        :formatter="formatHasBudget"
      />
      <el-table-column label="每日预算" align="center" prop="dailyBudget">
        <template slot-scope="scope">
          <el-input-number
            :disabled="hasAuthPerm('advertising:api:saveAdvCampaignSet')"
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
            :disabled="hasAuthPerm('advertising:api:saveAdvCampaignSet')"
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
      <el-table-column label="托管" align="center"  width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.auto"
            active-value="1"
            inactive-value="0"
            @change="saveAdvAsinSetList(scope.row)"
          ></el-switch>
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
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['advertising:api:deleteAdvCampaignSet']"
            >清除预算</el-button
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
  </div>
</template>

<script>
import { allAccount, hasAuthPermission } from "@/api/amazon/account";
import {
  advCampaignSetPageList,
  saveAdvCampaignSet,
  changeStatus,
  deleteAdvCampaignSet,
} from "../../../api/amazon/advSbCampainSetList";
import {
  advAsinSetChangePageList,
  getAsinCampaigns,
  clear,
} from "../../../api/amazon/advAsinSetChangeList";
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
      advCampaignSetList: [],
      accountList: [],
      // 弹出层标题
      title: "",
      user: {},
      autoList: [
        { value: null, label: "全部" },
        { value: "0", label: "不托管" },
        { value: "1", label: "托管" },
      ],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accountId: undefined,
        campaignName: undefined,
        hasBudget: undefined,
        auto: undefined,
      },
      // 表单参数
      form: {},
      advAsinSetList : [],
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
          return deleteAdvCampaignSet({ id: row.id });
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
        campaignId: row.campaignId,
        dailyBudget: row.dailyBudget,
        expectAcos: row.expectAcos,
        auto: row.auto,
      };
      saveAdvCampaignSet(body).then((response) => {
        this.$modal.msgSuccess("保存成功");
        this.open = false;
        this.getList();
      });
    },

    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      advCampaignSetPageList(this.queryParams).then((response) => {
        this.advAsinSetList = response.list;
        this.total = response.total;
        this.loading = false;
      });
    },
    getAsinCampaignsList() {
      this.loading = true;
      getAsinCampaigns(this.asinCampaignsParams).then((response) => {
        this.asinCampaignsList = response.rows;
        this.asinCampaignsTotal = response.total;
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
    /** 搜索按钮操作 */
    asinCampaignsQuery() {
      this.asinCampaignsParams.pageNum = 1;
      this.getAsinCampaignsList()
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
  },
};
</script>
