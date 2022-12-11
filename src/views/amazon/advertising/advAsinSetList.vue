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
      <el-table-column
        label="主图"
        width="70"
        align="center"
      >
        <template slot-scope="scope">
          <el-popover
            width="300px"
            trigger="hover"
            placement="left"
          >
            <div style="width:300px;height:300px;background:#f5f5f5;text-align:center">
              <el-image
                style="width:100%;"
                :src="
                  scope.row.imageUrl
                "
              />
            </div>

            <div
              slot="reference"
              class="name-wrapper"
            >
              <el-image
                style="width:50px;height:50px;vertical-align: top;background:#f5f5f5;text-align:center"
                :src="scope.row.imageUrl"
              >
                <div
                  slot="error"
                  class="image-slot"
                >
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        label="ASIN"
        align="center"
        prop="asin"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="scope">
          <div
            style="color: blue; cursor: pointer"
            @click="
              viewAsinCampaigns(
                scope.row.asin,
                scope.row.accountId,
                false,
                scope.row
              )
            "
          >
            {{ scope.row.asin }}
          </div>
        </template>
      </el-table-column>
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
      <el-table-column label="每日预算" align="center" prop="dailyBudget">
      </el-table-column>
      <el-table-column label="是否开启调价" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.smallAutoType"
            active-value="1"
            inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
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

    <!-- asin广告活动 -->
    <el-dialog
      :title="asinCampaignsTitle"
      :visible.sync="showAsinCampaigns"
      width="1500px"
      append-to-body
      @close="closeAsinCampaigns()"
    >
      <!-- <el-button
        type="primary"
        icon="el-icon-edit"
        size="mini"
        @click="allStartChangRate"
        >保存</el-button
      > -->
      <el-table
        v-loading="loading"
        ref="multipleTable"
        :data="asinCampaignsList"
        max-height="650"
      >
       <!-- <el-table-column
          type="selection"
          width="55"
          align="center"
          :selectable="checkSelect"
        /> -->
        <el-table-column
          label="消息提示"
          align="center"
          style="color: red"
          class-name="small-padding fixed-width"
          width="100"
        >
          <template slot-scope="scope">
            <div style="color: red">
              <span v-if="getDifferTime(scope.row.startDate, new Date()) < 30">
                小于30天的活动不能设置调价
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="活动设置调价" align="center" prop="chengePrice">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.changePrice"
              :disabled="getDifferTime(scope.row.startDate, new Date()) < 30"
              active-value="1"
              inactive-value="0"
              @change="selectChangePrice(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>

        <el-table-column
          label="店铺账号"
          align="center"
          prop="accountName"
          width="150"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          label="活动名称"
          align="center"
          prop="campaignName"
          width="200"
          :show-overflow-tooltip="true"
        />
        <el-table-column label="活动时间" align="center" prop="startDate">
          <template slot-scope="scope">
            <span
              >{{ parseTime(scope.row.startDate, "{y}-{m}-{d}") }}-{{
                parseTime(scope.row.endDate, "{y}-{m}-{d}")
              }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          label="投放类型"
          align="center"
          width="80"
          prop="targetingTypeName"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.type == '1'">手动广告</span>
            <span v-if="scope.row.type == '2'">自动广告</span>
          </template>
        </el-table-column>
        <el-table-column label="预算" align="center"  width="80" prop="dailyBudget" />
        <el-table-column
          label="最近30天ACos(%)"
          align="center"
          prop="averageAcos"
        />
        <el-table-column label="预期ACos(%)" align="center" prop="expectAcos">
          <!-- <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.expectAcos"
              style="width: 110px"
              :precision="0"
              :step="1"
              :min=1
              controls-position="right"
              :disabled="getDifferTime(scope.row.startDate, new Date()) < 30"
              @change="submitChangeCampaign(scope.row)"
            />
          </template> -->
        </el-table-column>
        <!-- <el-table-column label="活动设置调价" align="center" prop="chengePrice">
          <template slot-scope="scope">
            <span v-if="scope.row.changePrice == 1">已设置</span>
            <span v-if="scope.row.changePrice != 1">未设置</span>
          </template>
        </el-table-column> -->

        <!-- <el-table-column
          label="消息提示"
          align="center"
          style="color: red"
          class-name="small-padding fixed-width"
          width="100"
        >
          <template slot-scope="scope">
            <div style="color: red">
              <span v-if="getDifferTime(scope.row.startDate, new Date()) < 30">
                小于30天的活动不能设置调价
              </span>
            </div>
          </template>
        </el-table-column> -->
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { allAccount, hasAuthPermission } from "@/api/amazon/account";
import {
  advAsinSetPageList,
  saveAdvAsinSet,
  deleteAdvAsinSet,
  updateCampaignAsinSetChangePrice,
  updateCampaignAsinSetChangePriceSingle,
} from "../../../api/amazon/advAsinSetList";
import {
  advAsinSetChangePageList,
  getAsinCampaigns,
  clear,
} from "../../../api/amazon/advAsinSetChangeList";
import { getUserProfile } from "@/api/system/user";
import { saveAdvCampaignAsinSet } from "../../../api/amazon/advCampaignAsinSetList";

export default {
  name: "Advertising",
  data() {
    return {
      statusList: [
        { label: "全部", value: null },
        { label: "未设置", value: 0 },
        { label: "已设置", value: 1 },
      ],
      autoTypeList: [
        { label: "无", value: null },
        { label: "调价", value: "1" },
        { label: "否词", value: "2" },
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
      campaignIds: [],
      stateList: [
        { value: null, label: "全部" },
        { value: "1", label: "已启用" },
        { value: "2", label: "已暂停" },
        { value: "3", label: "已存档" },
      ],
      campaignTypeList: [
        { value: null, label: "全部" },
        { value: "1", label: "SP" },
        { value: "2", label: "SD" },
        { value: "3", label: "SB" },
      ],
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accountId: undefined,
        asin: undefined,
        sku: undefined,
        sellerSku: undefined,
        hasBudget: undefined,
      },
      // 表单参数
      form: {},
      // 修改记录
      showChangeList: false,
      showAsinCampaigns: false,
      asinCampaignsList: [],
      selectedAsin: "",
      asinCampaignsTitle: "",
      asinCampaignsTotal: 0,
      changeList: [],
      changeTotal: 0,
      // 查询参数
      changeQueryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      // 查询参数
      asinCampaignsParams: {
        state: "1",
      },

      viewChangRate: false,
      changeCampaignRate: {},
      tempAsin: undefined,
      tempAccountId: undefined,
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
          return deleteAdvAsinSet({ id: row.id });
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
        sku: row.sellerSku,
        dailyBudget: row.dailyBudget,
        expectAcos: row.expectAcos,
      };
      saveAdvAsinSet(body).then((response) => {
        this.$modal.msgSuccess("保存成功");
        this.open = false;
        this.getList();
      });
    },

    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      advAsinSetPageList(this.queryParams).then((response) => {
        this.advAsinSetList = response.list;
        this.total = response.total;
        this.loading = false;
      });
    },
    //是否全选
    getAsinCampaignsList(allSelect) {
      this.loading = true;
      console.info(allSelect);
      getAsinCampaigns(this.asinCampaignsParams).then((response) => {
        this.asinCampaignsList = response.rows;
        this.asinCampaignsTotal = response.total;
        this.loading = false;
        //渲染有问题
        setTimeout(() => {
          for (let i = 0; i < this.asinCampaignsList.length; i++) {
            if (allSelect) {
              var timer = this.getDifferTime(
                this.asinCampaignsList[i].startDate,
                new Date()
              );
              //天数大于30天的直接选择
              if (timer >= 30) {
                this.$refs.multipleTable.toggleRowSelection(
                  this.asinCampaignsList[i],
                  true
                );
              }
            } else {
              //没说全选
              var timer = this.getDifferTime(
                this.asinCampaignsList[i].startDate,
                new Date()
              );
              //大于30天的看自己
              if (timer >= 30 && this.asinCampaignsList[i].changePrice === 1) {
                this.$refs.multipleTable.toggleRowSelection(
                  this.asinCampaignsList[i],
                  true
                );
              }
            }
          }
        }, 100);
      });
    },

    checkSelect(row) {
      let isCheck = false;
      var timer = this.getDifferTime(row.startDate, new Date());
      if (timer >= 30) {
        isCheck = true;
      }
      return isCheck;
    },

    getDifferTime(sDate1, sDate2) {
      let dateSpan, tempDate, iDays;
      sDate1 = Date.parse(sDate1);
      sDate2 = Date.parse(sDate2);
      dateSpan = sDate2 - sDate1;
      iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
      return iDays;
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
      this.getAsinCampaignsList();
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
    viewChangeList(asin, sku) {
      this.showChangeList = true;
      this.title = asin + "-操作记录";
      this.changeQueryParams.asin = asin;
      this.changeQueryParams.sku = sku;
      advAsinSetChangePageList(this.changeQueryParams).then((response) => {
        this.changeList = response.list;
        this.changeTotal = response.total;
      });
    },
    /** 查看asin活动列表 */
    viewAsinCampaigns(asin, accountId, selactAll, row) {
      this.showAsinCampaigns = true;
      this.asinCampaignsTitle = asin + "-活动列表";
      if (null != asin && null != accountId) {
        this.asinCampaignsParams.asin = asin;
        this.asinCampaignsParams.accountId = accountId;
        this.tempAsin = asin;
        this.tempAccountId = accountId;
      }

      if (selactAll) {
        this.getAsinCampaignsList(true);
      } else {
        if (null != row && row.smallAutoType === "1") {
          this.getAsinCampaignsList(false);
        } else if (null != row && row.smallAutoType === "0") {
          this.getAsinCampaignsList(true);
        }
      }
    },
    /** 关闭asin操作记录 */
    closeChangeList() {
      this.showChangeList = false;
      this.changeList = [];
    },
    /** 关闭asin活动列表 */
    closeAsinCampaigns() {
      this.showAsinCampaigns = false;
      this.asinCampaignsList = [];
      this.asinCampaignsParams.pageNum = 1;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = row;
      this.form.dailyBudget = row.dailyBudget;
      this.form.expectAcos = row.expectAcos;
      this.open = true;
      this.title = "修改客户设置活动asin广告信息";
    },

    // 存在修改预算样式修改
    rowstyle({ row, rowIndex }) {
      // console.log(row, rowIndex);
      let stylejson = {};
      if (row.hasChange) {
        //背景颜色
        // stylejson.background = "#e0838f";
        // 也可以修改文字颜色
        stylejson.color = "red";
        return stylejson;
      } else {
        return "";
      }
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
      this.getList();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        accountId: null,
        accountName: null,
        campaignId: null,
        campaignName: null,
        asin: null,
        dailyBudget: null,
        expectAcos: null,
        valueChange: null,
        autoType: null,
        autoTypeList: null,
      };

      this.resetForm("form");
    },
    /** 提交按钮 */
    submitForm() {
      // console.info(this.form);
      // console.info(this.form.accountName);
      // console.info(this.form.dailyBudget);
      // if (
      //   this.form.autoType != null &&
      //   this.form.dailyBudget != null &&
      //   this.form.autoType === 2 &&
      //   this.form.dailyBudget < 100
      // ) {
      //   this.$modal.confirm("选择广告托管：广告托管预算不能低于100美金");
      // }
      // if (
      //   this.form.autoType != null &&
      //   this.form.dailyBudget != null &&
      //   this.form.autoType === 1 &&
      //   this.form.dailyBudget < 30
      // ) {
      //   this.$modal
      //     .confirm(
      //       "选择自动优化：低于30美金，预算较低，优化周期比较长，见效比较慢"
      //     )
      //     .then(() => {
      //       saveAdvAsinSet(this.form).then((response) => {
      //         this.$modal.msgSuccess("保存成功");
      //         this.open = false;
      //         this.getList();
      //       });
      //     });
      // }
      this.form.autoType = this.form.autoTypeList.toString();
      this.form.sku = this.form.sellerSku;
      saveAdvAsinSet(this.form).then((response) => {
        if (null != response.data) {
          this.$modal.confirm(response.data).then(() => {
            this.open = false;
            this.getList();
          });
        } else {
          this.open = false;
          this.getList();
        }
      });
    },

    /** 查看活动设置 */
    viewCampaignChangeRate(row) {
      this.viewChangRate = true;
      this.changeCampaignRate = row;
    },

    //设置活动预算和预期acos 方法
    // 取消按钮
    cancelChangeCampaign() {
      this.viewChangRate = false;
      this.resetChangeCampaign();
    },
    // 表单重置
    resetChangeCampaign() {
      this.changeCampaignRate = {
        id: null,
        accountId: null,
        accountName: null,
        campaignId: null,
        campaignName: null,
        asin: null,
        dailyBudget: null,
        expectAcos: null,
      };
      this.resetForm("changeCampaignRate");
    },
    /** 提交按钮 */
    submitChangeCampaign(row) {
      if(null==row.expectAcos
        ||undefined==row.expectAcos
        ||row.expectAcos===0){
        return;
      }
      let body = {
        accountId: row.accountId,
        asin: this.tempAsin,
        campaignId: row.campaignId,
        dailyBudget: row.dailyBudget,
        expectAcos: row.expectAcos,
      };

      let subtraction = row.averageAcos - row.expectAcos;
      if (subtraction > 0) {
        let divdvalue = (subtraction * 100) / row.averageAcos;
        let message = "";
        if (divdvalue < 20) {
          saveAdvCampaignAsinSet(body).then((response) => {
            this.$modal.msgSuccess("保存成功");
            this.viewChangRate = false;
            this.getAsinCampaignsList(false);
          });
          return;
        } else if (divdvalue >= 20 && divdvalue < 50) {
          message = "提醒ACOS跟原来ACOS差异比较大，可能会影响单量";
        } else if (divdvalue >= 50 && divdvalue < 100) {
          message = "提醒ACOS跟原来ACOS差异大，预计会影响单量";
        } else if (divdvalue >= 100) {
          message = "差异太大，会影响单量";
        }
        this.$modal
          .confirm(message)
          .then(function () {
            return saveAdvCampaignAsinSet(body);
          })
          .then(() => {
            this.$modal.msgSuccess("保存成功");
            this.viewChangRate = false;
            this.getAsinCampaignsList(false);
          })
          .catch(() => {});
      } else {
        saveAdvCampaignAsinSet(body).then((response) => {
          this.$modal.msgSuccess("保存成功");
          this.viewChangRate = false;
          this.getAsinCampaignsList(false);
        });
      }
    },

    // 任务状态修改
    handleStatusChange(row) {
      row.sku = row.sellerSku;
      if (row.smallAutoType === "0") {
        row.autoType = null;
      }
      if (row.smallAutoType === "1") {
        row.autoType = "1,2";
      }
      saveAdvAsinSet(row).then((response) => {
        if (row.smallAutoType === "1") {
          this.viewAsinCampaigns(row.asin, row.accountId, true);
        }
      });
    },

    allStartChangRate() {
      let arr = this.$refs.multipleTable.selection;
      console.log("---", arr);
      if (arr.length === 0) {
        this.$modal.msgError("请选择需要调价的活动");
        return;
      }
      let campaignIds = arr.map((item) => item.campaignId);
      let body = {
        accountId: this.tempAccountId,
        asin: this.tempAsin,
        campaignIdList: campaignIds,
      };

      updateCampaignAsinSetChangePrice(body).then((response) => {
        this.$modal.msgSuccess("保存成功");
        //保存了 不用选了
        this.getAsinCampaignsList(false);
      });
    },
    selectChangePrice(row) {
      let body = {
        accountId: this.tempAccountId,
        asin: this.tempAsin,
        campaignId: row.campaignId,
        status: row.changePrice,
      };

      updateCampaignAsinSetChangePriceSingle(body).then((response) => {
        this.$modal.msgSuccess("保存成功");
        //保存了 不用选了
        this.getAsinCampaignsList(false);
      });
    },
  },
};
</script>
