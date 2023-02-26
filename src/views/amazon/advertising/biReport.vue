<template>
  <div
    class="app-container flex flex-col mt-0"
    style="background-color: rgb(245, 246, 248); height: calc(100vh - 84px)"
  >
    <div class="flex justify-between items-center mb-5">
      <div style="color: #888" v-show="lastModifiedTime">
        更新时间：{{ lastModifiedTime }}
      </div>
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
        class="bi-report_nav"
      >
        <el-form-item class="mb-0 mr-0">
          <div class="flex bg-white items-center pl-2 rounded-md">
            <tab-checkbox
              :options="dateOptions"
              @change="handleDateCheckboxChange"
              :value="defaultDateOptions"
            ></tab-checkbox>
            <el-date-picker
              style="width: 240px; border: none"
              @change="handleSelectTime"
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
        <!-- <test-tree-map v-if="expressionList.length" :list="expressionList"/> -->
        <el-form-item class="mb-0 mr-0" prop="shopId">
          <div
            class="dashboard_search-item flex items-center justify-center bg-white rounded-md pl-2 text-xs"
          >
            <div class="mr-2" style="color: #606266">账号</div>
            <el-select
              v-model="queryParams.shopId"
              placeholder="请选择账号"
              clearable
              filterable
              size="small"
              style="width: 160px"
              @change="queryEcharts"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.accountName + '-' + item.site"
                :value="item.id"
              />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label-width="100px" prop="campaignName" class="mb-0 mr-0">
          <div
            class="dashboard_search-item flex items-center justify-center bg-white rounded-md pl-2 text-xs"
          >
            <div class="mr-2" style="color: #606266">广告活动</div>
            <el-input
              v-model="queryParams.campaignName"
              placeholder="请输入"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
              class="flex-1"
            />
          </div>
        </el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          style="margin-top: 2px"
          >搜索</el-button
        >
      </el-form>
    </div>

    <el-row :gutter="3" class="analysis flex-1 bireport-container">
      <el-card class="box-card">
        <div class="flex justify-between items-center p-5 pb-0">
          <div style="font-weight: 500; font-size: 16px; color: #333">
            广告数据总览
          </div>
          <div @click="toggleOpen" class="openCloseTag cursor-pointer">
            {{ !isOpen ? "展开" : "收起" }}
            <i :class="isOpen ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </div>
        </div>
        <div class="flex relative">
          <div class="flex-1 summary">
            <div class="summary_title">广告花费</div>
            <div class="summary_value">
              <summary-money-label :money="this.formatNums(this.totalFees)" />
            </div>
          </div>
          <div class="flex-1 summary">
            <div class="summary_title">广告销售额</div>
            <div class="summary_value">
              <summary-money-label
                :money="this.formatNums(this.totalSalesFees)"
              />
            </div>
          </div>
          <div class="flex-1 summary">
            <div class="summary_title">ACOS</div>
            <div class="summary_value">{{ this.totalAcos }}%</div>
          </div>
          <div class="flex-1 summary">
            <div class="summary_title">ROAS</div>
            <div class="summary_value">
              {{ this.totalRoas }}
            </div>
          </div>
          <div class="flex-1 summary">
            <div class="summary_title">TACOS</div>
            <div class="summary_value">{{ this.totalTacos }}%</div>
          </div>
        </div>
        <div class="flex" v-show="isOpen">
          <div class="flex-1 summary">
            <div class="summary_title">曝光量</div>
            <div class="summary_value">
              {{ this.formatNums(this.totalImpressions) }}
            </div>
          </div>
          <div class="flex-1 summary">
            <div class="summary_title">点击量</div>
            <div class="summary_value">
              {{ this.formatNums(this.totalClicks) }}
            </div>
          </div>
          <div class="flex-1 summary">
            <div class="summary_title">点击率</div>
            <div class="summary_value">{{ this.totalClickPercent }}%</div>
          </div>
          <div class="flex-1 summary">
            <div class="summary_title">CPC</div>
            <div class="summary_value">
              <summary-money-label :money="this.formatNums(this.totalCpc)" />
            </div>
          </div>
          <div class="flex-1 summary"></div>
        </div>
      </el-card>
      <el-row :gutter="10" style="margin-top: 10px">
        <el-col :span="12">
          <el-card class="board-card">
            <div class="board-card_head flex justify-between">
              <div class="board-card_head_title ml-5 mt-5">广告花费统计</div>
              <div class="board-card_head_date mt-5 mr-5">
                {{ queryParams.dateTime[0] || "~" }} 至
                {{ queryParams.dateTime[1] || "~" }}
              </div>
            </div>
            <tab-checkbox
              class="mt-4 ml-3"
              :multi="true"
              :limit="2"
              :value="payBoardGroup"
              :options="adCostTabOptions"
              @change="
                (item) => handlePayBoardGroupChange(item.map((t) => t.label))
              "
            ></tab-checkbox>
            <div class="mb-5">
              <div id="mainOne" style="height: 240px"></div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="board-card">
            <div class="board-card_head flex justify-between">
              <div class="board-card_head_title ml-5 mt-5">广告效果统计</div>
              <div class="board-card_head_date mt-5 mr-5">
                {{ queryParams.dateTime[0] || "~" }} 至
                {{ queryParams.dateTime[1] || "~" }}
              </div>
            </div>
            <tab-checkbox
              class="mt-4 ml-3"
              :multi="true"
              :limit="2"
              :value="adEffectGroup"
              :options="adEffectTabOptions"
              @change="
                (item) => handleAdEffectGroupChange(item.map((t) => t.label))
              "
            ></tab-checkbox>
            <div class="mb-5">
              <div id="mainTwo" style="height: 240px"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row style="margin-top: 10px">
        <el-card class="board-card pb-5">
          <el-col :span="12" style="padding-right: 20px">
            <div class="board-card_head flex justify-between">
              <div class="board-card_head_title ml-5 mt-5">
                广告活动销售额占比
              </div>
            </div>
            <div class="mb-2">
              <div id="main" style="height: 240px"></div>
              <div class="flex mt-2 ml-5 mr-5 space-between">
                <div class="flex items-center">
                  <div class="matric-tree_title">广告活动ACOS</div>
                  <div class="flex matric-tree_bar-wrapper items-center ml-3">
                    <div class="mr-1">高</div>
                    <div class="matric-tree_bar"></div>
                    <div class="ml-1">低</div>
                  </div>
                </div>
                <div class="ml-auto">
                  <el-button
                    icon="el-icon-refresh"
                    type="text"
                    style="color: #666"
                    @click="resetChartMain"
                    >重置</el-button
                  >
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="board-card_head flex justify-between">
              <div class="board-card_head_title ml-5 mt-5">
                托管广告活动销售额Top10
              </div>
            </div>
            <div class="mb-2">
              <div id="top10Compaign" style="height: 265px"></div>
            </div>
          </el-col>
        </el-card>
        <!-- <div
          class="echarts"
          style="
            width: 49%;
            height: 400px;
            margin-right: 10px;
            float: right;
            box-shadow: 0 2px 22px rgba(0, 0, 0, 0.12),
              0 0 6px rgba(0, 0, 0, 0.06);
          "
        >
          <div style="padding-left: 15px; padding-top: 3px">
            <span style="font-weight: bolder">广告活动表现</span>
            <span style="margin-left: 5px">
              <el-tooltip type="primary" placement="top">
                <div slot="content">
                  广告活动销售额:面积(销售额越大面积越大)<br />ACOS:颜色(ACOS越大颜色越深)
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </span>
          </div>
          <div id="main" style="height: 380px; text-align: center"></div>
        </div> -->
      </el-row>
      <el-row class="mt-4 data_detail">
        <el-card>
          <div class="board-card_head flex justify-between items-center">
            <div class="board-card_head_title ml-5 mt-5 mb-2">广告出单商品</div>
            <div class="flex items-center">
              <el-button
                type="text"
                icon="el-icon-download"
                size="mini"
                @click="handlePurchaseExport"
                style="color: #333"
                class="mr-4"
                >导出列表</el-button
              >
              <div
                @click="togglePurchaseOpen"
                class="openCloseTag cursor-pointer"
              >
                {{ !isPurchaseOpen ? "展开" : "收起" }}
                <i
                  :class="
                    isPurchaseOpen ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
                  "
                ></i>
              </div>
            </div>
          </div>
          <div v-show="isPurchaseOpen" class="p-4 pt-0">
            <el-table
              v-loading="loading"
              :data="purchaseData"
              max-height="500"
              header-row-class-name="table_header_class"
              style="font-size: 12px"
            >
              <el-table-column sortable label="商品" align="left">
                <template slot-scope="scope">
                  <div class="flex item-center">
                    <div style="flex: 0 0 60px; margin-right: 12px">
                      <img style="width: 60px" :src="scope.row.url" alt="" />
                    </div>
                    <div class="flex flex-col puchase-table_item-title">
                      <div class="puchase-table_item-title_content">
                        {{ scope.row.title }}
                      </div>
                      <div class="puchase-table_item-title_asin">
                        <a
                          :href="`https://www.amazon.com/dp/${scope.row.asin}`"
                          target="_blank"
                          style="padding-right: 4px"
                          >{{ scope.row.asin }}</a
                        >
                        <el-tooltip
                          class="item"
                          effect="dark"
                          content="点击复制ASIN"
                          placement="top"
                        >
                          <i
                            @click="() => copy(scope.row.asin)"
                            class="el-icon-document-copy"
                          ></i>
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                sortable
                label="销量"
                align="center"
                prop="unitCount"
                width="100"
              />
              <el-table-column
                sortable
                label="销售额"
                align="center"
                prop="salesFees"
                width="100"
              />
              <el-table-column
                sortable
                label="单价（$）"
                align="center"
                prop="price"
                width="100"
              />
              <el-table-column
                sortable
                label="类目排名"
                align="center"
                prop="rank"
                width="100"
              />
              <el-table-column
                sortable
                label="评价星级"
                align="center"
                prop="rank"
                width="100"
              >
                <template slot-scope="scope">
                  <el-rate
                    v-if="scope.row.star"
                    v-model="scope.row.rank"
                    disabled
                  >
                  </el-rate>
                  <div v-else>-</div>
                </template>
              </el-table-column>
              <el-table-column
                sortable
                label="所属广告活动"
                align="left"
                prop="campaignName"
                width="240"
              />
            </el-table>
          </div>
        </el-card>
      </el-row>
      <el-row class="mt-4 data_detail">
        <el-card>
          <div class="board-card_head flex justify-between items-center">
            <div class="board-card_head_title ml-5 mt-5 mb-4">广告活动位置</div>
            <div class="flex items-center">
              <tab-checkbox
                :options="placementOptions"
                :value="placementOptions[0]"
                @change="({ value }) => togglePurchaseTable(value)"
              ></tab-checkbox>
              <div class="bi-divider"></div>

              <el-button
                type="text"
                icon="el-icon-download"
                size="mini"
                @click="handlePlacementExport"
                style="color: #333"
                class="mr-4"
                >导出列表</el-button
              >
            </div>
          </div>

          <div class="p-4 pt-0">
            <el-table
              :span-method="placementSpanMethod"
              v-loading="loading"
              :data="placementData"
              max-height="450"
              header-row-class-name="table_header_class"
              :row-class-name="getPlacementTableRowClass"
            >
              <template v-if="!purchaseTableUsePer">
                <el-table-column
                  label="广告活动"
                  align="center"
                  prop="campaignName" />
                <el-table-column
                  label="广告位置"
                  align="center"
                  prop="placement" />
                <el-table-column
                  label="展示量"
                  align="center"
                  prop="impressions" />
                <el-table-column label="点击量" align="center" prop="clicks">
                </el-table-column>
                <el-table-column
                  label="总销售额（$）"
                  align="center"
                  prop="sevenSales" />
                <el-table-column label="花费（$）" align="center" prop="fees" />
                <el-table-column label="ACOS" align="center" prop="acos">
                </el-table-column
              ></template>
              <template v-else>
                <el-table-column
                  sortable
                  label="广告活动"
                  align="center"
                  prop="campaignName"
                />
                <el-table-column
                  sortable
                  label="广告位置"
                  align="center"
                  prop="placement"
                />
                <el-table-column
                  sortable
                  label="展示量占比"
                  align="center"
                  prop="impressionsProportion"
                />
                <el-table-column
                  sortable
                  label="点击量占比"
                  align="center"
                  prop="clicksProportion"
                >
                </el-table-column>
                <el-table-column
                  sortable
                  label="总销售额占比"
                  align="center"
                  prop="sevenSalesProportion"
                />
                <el-table-column
                  sortable
                  label="花费占比"
                  align="center"
                  prop="feesProportion"
                />
                <el-table-column
                  sortable
                  label="ACOS"
                  align="center"
                  prop="acos"
                >
                </el-table-column>
              </template>
            </el-table>
          </div>
        </el-card>
      </el-row>
      <el-row class="mt-4 data_detail">
        <el-card>
          <div class="board-card_head flex justify-between items-center">
            <div class="board-card_head_title ml-5 mt-5 mb-4">数据明细</div>
            <div class="flex items-center">
              <tab-checkbox
                :options="dateTypeOptions"
                :value="dateTypeOptions[0]"
                @change="({ value }) => modifyData(value)"
              ></tab-checkbox>
              <div class="bi-divider"></div>
              <el-button
                type="text"
                icon="el-icon-download"
                size="mini"
                @click="handleExport"
                style="color: #333"
                class="mr-4"
                >导出列表</el-button
              >
            </div>
          </div>
          <div class="p-4 pt-0">
            <el-table
              v-loading="loading"
              :data="tableList"
              max-height="450"
              header-row-class-name="table_header_class"
            >
              <el-table-column
                sortable
                label="日期"
                align="center"
                prop="dateSlot"
              />
              <el-table-column
                sortable
                label="曝光量"
                align="center"
                prop="impressions"
              />
              <el-table-column
                sortable
                label="点击量"
                align="center"
                prop="clicks"
              />
              <el-table-column
                sortable
                label="点击率"
                align="center"
                prop="clickPercent"
              >
                <template slot-scope="scope">
                  <span v-if="scope.row != undefined">{{
                    scope.row.clickPercent != null
                      ? scope.row.clickPercent + "%"
                      : "0%"
                  }}</span>
                  <span v-if="scope.row == undefined">0%</span>
                </template>
              </el-table-column>
              <el-table-column
                :width="130"
                sortable
                label="点击均价（$）"
                align="center"
                prop="cpcFee"
              />
              <el-table-column
                :width="130"
                sortable
                label="广告花费（$）"
                align="center"
                prop="fees"
              />
              <el-table-column
                :width="130"
                label="销售额（$）"
                align="center"
                prop="salesFees"
                sortable
              />
              <el-table-column
                label="订单数"
                align="center"
                prop="orderQuantity"
                sortable
              />
              <el-table-column sortable label="ACOS" align="center" prop="acos">
                <template slot-scope="scope">
                  <span v-if="scope.row != undefined">{{
                    scope.row.acos != null ? scope.row.acos + "%" : "0%"
                  }}</span>
                  <span v-if="scope.row == undefined">0%</span>
                </template>
              </el-table-column>
              <el-table-column
                sortable
                label="TACOS"
                align="center"
                prop="tacos"
              >
                <template slot-scope="scope">
                  <span v-if="scope.row != undefined">{{
                    scope.row.tacos != null ? scope.row.tacos + "%" : "0%"
                  }}</span>
                  <span v-if="scope.row == undefined">0%</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-row>
    </el-row>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { mapState } from "vuex";
import {
  queryBiReport,
  queryTop10Campaign,
  queryBiPurchase,
  queryBiPlacement,
} from "@/api/amazon/campaignsinfo";
import { allAccount } from "@/api/amazon/account";
import { accountCampaign } from "@/api/amazon/campaign";
import SummaryMoneyLabel from "./summaryMoneyLabel";
import dayjs from "dayjs";
import { Loading } from "element-ui";
import { getInterval } from "./chartInterval";
import TabCheckbox from "../../../components/TabCheckbox/index.vue";
import inindexVue from "../flowanalysis/inindex.vue";
var debounce = require("debounce");
export default {
  name: "biReport",
  components: {
    SummaryMoneyLabel,
    TabCheckbox,
  },
  computed: {
    ...mapState(["user"]),
    userName() {
      return this.$store.state.user.name;
    },
  },
  data() {
    const datePreset = {
      LAST_DAY: "LAST_DAY",
      LAST_7_DAY: "LAST_7_DAY",
      LAST_30_DAY: "LAST_30_DAY",
      LAST_90_DAY: "LAST_90_DAY",
    };
    const dateOptions = [
      {
        label: "昨日",
        value: datePreset.LAST_DAY,
      },
      {
        label: "近7日",
        value: datePreset.LAST_7_DAY,
      },
      {
        label: "近30日",
        value: datePreset.LAST_30_DAY,
      },
      {
        label: "近90日",
        value: datePreset.LAST_90_DAY,
      },
    ];
    const adCostTabOptions = [
      {
        label: "销售额",
      },
      {
        label: "广告花费",
      },
      {
        label: "ACOS",
      },
      {
        label: "TACOS",
      },
    ];
    const adEffectTabOptions = [
      {
        label: "曝光量",
      },
      {
        label: "点击量",
      },
      {
        label: "点击率",
      },
      {
        label: "CPC",
      },
    ];
    const dateTypeOptions = [
      {
        label: "每日",
        value: "1",
      },
      {
        label: "每周",
        value: "2",
      },
      {
        label: "每月",
        value: "3",
      },
    ];
    const placementOptions = [
      {
        label: "数值",
        value: "1",
      },
      {
        label: "占比",
        value: "2",
      },
    ];
    // TODO: DELETE MOCK DATA
    return {
      dateTypeOptions,
      placementOptions,
      purchaseTableUsePer: false,
      purchaseData: [],
      placementData: [],
      lastModifiedTime: "",
      defaultDateOptions: dateOptions[1],
      adCostTabOptions,
      adEffectTabOptions,
      dateOptions,
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
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              end.setTime(end.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      stateList: [
        { value: "1", label: "开启" },
        { value: "2", label: "关闭" },
      ],
      top10Compaign: [],
      // 遮罩层
      loading: true,
      isOpen: false,
      top10ChartInstance: null,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 字典表格数据
      tableList: [],
      dayTableList: [],
      weekTableList: [],
      monthTableList: [],
      accountList: [],
      campaignList: [],
      batchPrice: false,
      activityBudget: false,
      popName: undefined,
      totalFees: 0,
      totalSales: 0,
      totalSalesFees: 0,
      totalAcos: 0,
      totalRoas: 0,
      totalTacos: 0,
      totalClicks: 0,
      totalImpressions: 0,
      totalClickPercent: 0,
      totalCpc: 0,
      dayList: [],
      salesList: [],
      feesList: [],
      acosList: [],
      tacosList: [],
      impressionsList: [],
      clicksList: [],
      clickPercentList: [],
      cpcFeeList: [],
      expressionList: [],
      main: "",
      mainOne: "",
      mainTwo: "",
      mainThree: "",
      mainFour: "",
      mainFive: "",
      mainSix: "",
      mainSeven: "",
      mainEight: "",
      activeNameOne: "first",
      activeNameTwo: "first",
      activeNameThree: "first",
      // 查询参数
      queryParams: {
        shopId: undefined,
        campaignId: undefined,
        campaignName: undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
        downloadType: 1,
      },
      payBoardGroup: [adCostTabOptions[0], adCostTabOptions[2]],
      adEffectGroup: [adEffectTabOptions[0], adEffectTabOptions[2]],
      currentTime: [],
      datePreset,
      isPurchaseOpen: true,
    };
  },
  created() {
    const now = new Date();
    const day7 = new Date(now.getTime() - 7 * 3600 * 1000 * 24);
    const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
    let time1 = this.parseTime(day7, "{y}-{m}-{d}");
    let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
    this.queryParams.startDate = time1;
    this.queryParams.endDate = time2;
    this.queryParams.dateTime = [time1, time2];
    this.allAccountList();
    this.loading = false;
    const that = this;
    window.addEventListener(
      "resize",
      debounce(() => {
        that.resizeCharts(that);
      })
    );
    //this.initTime();
  },
  methods: {
    getPlacementTableRowClass({ row }) {
      const { campaignId } = row;
      const dataset = [...new Set(this.placementData.map((val) => val.campaignId))];
      const index = dataset.findIndex(
        (item) => item === campaignId
      );
      if (index >= 0) {
        return (index + 1) % 2 === 0 ? "row-stripe" : "";
      }
      return "";
    },
    togglePurchaseTable(val) {
      if (val === "1") {
        this.purchaseTableUsePer = false;
      } else {
        this.purchaseTableUsePer = true;
      }
    },
    placementSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (
          rowIndex === 0 ||
          row.campaignName != this.placementData[rowIndex - 1].campaignName
        ) {
          let rowspan = 0;
          this.placementData.forEach((element) => {
            if (element.campaignName === row.campaignName) {
              rowspan++;
            }
          });
          return [rowspan, 1];
        } else {
          return [0, 0];
        }
      }
    },
    handleDateCheckboxChange(v) {
      this.changeDate(v.value);
    },
    resetChartMain() {
      this.main.resize();
    },
    toggleOpen() {
      this.isOpen = !this.isOpen;
    },
    togglePurchaseOpen() {
      this.isPurchaseOpen = !this.isPurchaseOpen;
    },
    changeDate(dateType) {
      switch (dateType) {
        case this.datePreset.LAST_DAY:
          this.queryParams.dateTime = [
            dayjs().subtract(1, "day").startOf("day").format("YYYY-MM-DD"),
            dayjs().subtract(1, "day").endOf("day").format("YYYY-MM-DD"),
          ];
          break;
        case this.datePreset.LAST_7_DAY:
          this.queryParams.dateTime = [
            dayjs().subtract(7, "day").startOf("day").format("YYYY-MM-DD"),
            dayjs().subtract(1, "day").endOf("day").format("YYYY-MM-DD"),
          ];
          break;
        case this.datePreset.LAST_30_DAY:
          this.queryParams.dateTime = [
            dayjs().subtract(30, "day").startOf("day").format("YYYY-MM-DD"),
            dayjs().subtract(1, "day").endOf("day").format("YYYY-MM-DD"),
          ];
          break;
        case this.datePreset.LAST_90_DAY:
          this.queryParams.dateTime = [
            dayjs().subtract(90, "day").startOf("day").format("YYYY-MM-DD"),
            dayjs().subtract(1, "day").endOf("day").format("YYYY-MM-DD"),
          ];
          break;
      }

      this.queryEcharts();
    },
    resizeCharts: (self) => {
      if (self.main) {
        self.main.resize();
      }
      if (self.mainOne) {
        console.log(111);
        self.mainOne.resize();
      }

      if (self.mainTwo) {
        self.mainTwo.resize();
      }

      if (self.top10ChartInstance) {
        self.top10ChartInstance.resize();
      }
    },
    handlePayBoardGroupChange(val) {
      if (!val) {
        val = this.payBoardGroup.map((item) => item.label);
      }
      let params = {
        y: [],
        series: [],
      };
      val.forEach((v) => {
        if (v === "销售额") {
          params.y.push({
            type: "value",
          });
          params.series.push({
            data: this.salesList,
            type: "line",
            name: "销售额",
          });
        } else if (v === "广告花费") {
          params.y.push({
            type: "value",
          });
          params.series.push({
            data: this.feesList,
            type: "line",
            name: "广告花费",
          });
        } else if (v === "ACOS") {
          params.y.push({
            type: "value",
            axisLabel: {
              formatter: "{value} %",
            },
          });
          params.series.push({
            data: this.acosList,
            type: "line",
            name: "ACOS",
          });
        } else if (v === "TACOS") {
          params.y.push({
            type: "value",
            axisLabel: {
              formatter: "{value} %",
            },
          });
          params.series.push({
            data: this.tacosList,
            type: "line",
            name: "TACOS",
          });
        }
      });

      if (val.length === 2) {
        params.y[1].position = "right";
        params.series[1].yAxisIndex = 1;
      }

      params.legend = params.series.map((s) => s.name);
      console.log(params);
      this.myEchartsOne(params);
    },
    handleAdEffectGroupChange(val) {
      if (!val) {
        val = this.adEffectGroup.map((item) => item.label);
      }

      let params = {
        y: [],
        series: [],
      };
      val.forEach((v) => {
        if (v === "曝光量") {
          params.y.push({
            type: "value",
          });
          params.series.push({
            data: this.impressionsList,
            type: "line",
            name: "曝光量",
          });
        } else if (v === "点击量") {
          params.y.push({
            type: "value",
          });
          params.series.push({
            data: this.clicksList,
            type: "line",
            name: "点击量",
          });
        } else if (v === "点击率") {
          params.y.push({
            type: "value",
            axisLabel: {
              formatter: "{value} %",
            },
          });
          params.series.push({
            data: this.clickPercentList,
            type: "line",
            name: "点击率",
          });
        } else if (v === "CPC") {
          params.y.push({
            type: "value",
          });
          params.series.push({
            data: this.cpcFeeList,
            type: "line",
            name: "CPC",
          });
        }
      });

      if (val.length === 2) {
        params.y[1].position = "right";
        params.series[1].yAxisIndex = 1;
      }

      params.legend = params.series.map((s) => s.name);
      this.myEchartsTwo(params);
    },
    formatNums(num) {
      num = num.toString().split("."); // 分隔小数点
      var arr = num[0].split("").reverse(); // 转换成字符数组并且倒序排列
      var res = [];
      for (var i = 0, len = arr.length; i < len; i++) {
        if (i % 3 === 0 && i !== 0) {
          res.push(","); // 添加分隔符
        }
        res.push(arr[i]);
      }
      res.reverse(); // 再次倒序成为正确的顺序
      if (num[1]) {
        // 如果有小数的话添加小数部分
        res = res.join("").concat("." + num[1]);
      } else {
        res = res.join("");
      }
      return res;
    },
    formatState(row, column, cellValue, index) {
      for (let i = 0; i < this.stateList.length; i++) {
        if (cellValue == this.stateList[i].value) {
          return this.stateList[i].label;
        }
      }
      return "";
    },
    initTime() {
      const now = new Date();
      const day7 = new Date(now.getTime() - 8 * 3600 * 1000 * 24);
      const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
      let time1 = this.parseTime(day7, "{y}-{m}-{d}");
      let time2 = this.parseTime(yesteday, "{y}-{m}-{d}");
      this.queryParams.dateTime = [time1, time2];
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
      this.getTime();
    },
    allAccountList() {
      this.currentTime = [...this.queryParams.dateTime];
      allAccount().then((response) => {
        this.accountList = response.data;
        if (this.accountList != null && this.accountList.length > 0) {
          this.queryParams.shopId = this.accountList[0].id;
          this.$nextTick(() => {
            this.queryEcharts();
          });
        }
      });
    },
    handleSelectTime(...args) {
      this.getTime(...args);
      this.defaultDateOptions = null;
      this.queryEcharts();
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
    queryEcharts() {
      let loadingInstance = Loading.service({ fullscreen: true });
      this.queryParams.downloadType = 1;
      this.activeNameOne = "first";
      this.activeNameTwo = "first";
      this.activeNameThree = "first";
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
      queryTop10Campaign({
        shopId: this.queryParams.shopId,
        startDate: this.queryParams.startDate,
        endDate: this.queryParams.endDate,
      }).then((response) => {
        if (response.data) {
          this.top10Compaign = response.data.reverse();
          this.renderChartTop10Compaign();
        }
      });
      queryBiPurchase({
        startDate: this.queryParams.startDate,
        endDate: this.queryParams.endDate,
        compaignName: this.queryParams.campaignName,
        shopId: this.queryParams.shopId,
      }).then((response) => {
        console.log("purchase", response);
        if (response.data) {
          this.purchaseData = response.data;
        }
      });
      console.log(111, this.queryParams, {
        startDate: this.queryParams.startDate,
        endDate: this.queryParams.endDate,
        compaignName: this.queryParams.campaignName,
        shopId: this.queryParams.shopId,
      });
      queryBiPlacement({
        startDate: this.queryParams.startDate,
        endDate: this.queryParams.endDate,
        compaignName: this.queryParams.campaignName,
        shopId: this.queryParams.shopId,
      }).then((response) => {
        console.log("placementData", response);
        if (response.data) {
          this.placementData = response.data;
        }
      });
      queryBiReport(this.queryParams).then((response) => {
        if (response.data.chartTotalResponseDto != null) {
          this.totalFees = response.data.chartTotalResponseDto.fees;
          this.totalSales = response.data.chartTotalResponseDto.sales;
          this.totalSalesFees = response.data.chartTotalResponseDto.salesFees;
          this.totalAcos = response.data.chartTotalResponseDto.acos;
          this.totalRoas = response.data.chartTotalResponseDto.roas;
          this.totalTacos = response.data.chartTotalResponseDto.tacos;
          this.totalClicks = response.data.chartTotalResponseDto.clicks;
          this.totalImpressions =
            response.data.chartTotalResponseDto.impressions;
          this.totalClickPercent =
            response.data.chartTotalResponseDto.clickPercent;
          this.totalCpc = response.data.chartTotalResponseDto.cpcFee;
        }
        if (response.data.dailyDate != null) {
          this.dayList = response.data.dailyDate;
        }
        if (response.data != null) {
          this.salesList = response.data.salesFeesList;
          this.feesList = response.data.feesList;
          this.acosList = response.data.acosList;
          this.tacosList = response.data.tacosList;
          this.impressionsList = response.data.impressionsList;
          this.clicksList = response.data.clicksList;
          this.clickPercentList = response.data.clickPercentList;
          this.cpcFeeList = response.data.cpcFeeList;

          this.tableList = response.data.dailyResponseDtoList;
          this.dayTableList = response.data.dailyResponseDtoList;
          this.weekTableList = response.data.weeklyResponseDtoList;
          this.monthTableList = response.data.monthlyResponseDtoList;
          if (
            response.data.campaignDailyResponseDtoList != null &&
            response.data.campaignDailyResponseDtoList.length > 0
          ) {
            this.expressionList = [];
            response.data.campaignDailyResponseDtoList.forEach(
              (column, index) => {
                let expressionData = {
                  name: column.campaignName,
                  value: column.saleFees,
                  fees: column.fees,
                  acos: column.acos,
                  usageBudget: column.usageBudget,
                  itemStyle: {
                    color: this.getMaticTreeColor(column),
                  },
                };
                this.expressionList.push(expressionData);
              }
            );
          }
        }
        this.myEcharts();
        this.handlePayBoardGroupChange();
        this.handleAdEffectGroupChange();
        loadingInstance.close();

        this.lastModifiedTime = dayjs(response.timestamp).format(
          "YYYY年M月D日 hh:mm"
        );
      });
    },
    getMaticTreeColor(item) {
      if (item.acos <= 10) {
        return "#3D76DD";
      } else if (item.acos <= 20) {
        return "#5B8FF9";
      } else if (item.acos <= 30) {
        return "#7DAAFF";
      } else if (item.acos <= 40) {
        return "#9AC5FF";
      } else if (item.acos <= 50) {
        return "#BFD9FF";
      } else if (item.acos <= 60) {
        return "#DEE7FF";
      } else if (item.acos <= 70) {
        return "#FFC5AC";
      } else if (item.acos <= 80) {
        return "#FF895D";
      } else if (item.acos <= 90) {
        return "#F3470D";
      } else {
        return "#D13808";
      }
    },
    //切换标签页时触发
    handleClick(tab, event) {
      if (tab.index == 1) {
        this.$nextTick(() => {
          this.myEchartsTwo();
        });
      }
    },
    handleClickTwo(tab, event) {
      if (tab.index == 1) {
        this.$nextTick(() => {
          this.myEchartsFour();
        });
      }
    },
    handleClickThree(tab, event) {
      if (tab.index == 1) {
        this.$nextTick(() => {
          this.myEchartsSix();
        });
      } else if (tab.index == 2) {
        this.$nextTick(() => {
          this.myEchartsSeven();
        });
      } else if (tab.index == 3) {
        this.$nextTick(() => {
          this.myEchartsEight();
        });
      }
    },
    modifyData(val) {
      this.queryParams.downloadType = val;
      if (this.queryParams.downloadType == 1) {
        this.tableList = this.dayTableList;
      } else if (this.queryParams.downloadType == 2) {
        this.tableList = this.weekTableList;
      } else if (this.queryParams.downloadType == 3) {
        this.tableList = this.monthTableList;
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      let dayName = "每日";
      if (this.queryParams.downloadType == 2) {
        dayName = "每周";
      } else if (this.queryParams.downloadType == 3) {
        dayName = "每月";
      }
      this.download(
        "/message/chart/line/export",
        {
          ...this.queryParams,
        },
        `广告数据_${dayName}_${new Date().getTime()}.xlsx`
      );
    },
    handlePurchaseExport() {
      this.download(
        "/chart/line/purchase/export",
        {
          ...this.queryParams,
        },
        `广告出单商品数据_${new Date().getTime()}.xlsx`
      );
    },
    handlePlacementExport() {
      this.download(
        "/chart/line/placement/export",
        {
          ...this.queryParams,
        },
        `广告活动数据_${new Date().getTime()}.xlsx`
      );
    },
    myEcharts() {
      this.main = this.$echarts.init(document.getElementById("main"));
      var option = {
        grid: {
          x: 0,
          x2: 0,
          y: 0,
          y2: 0,
        },
        legend: {
          show: false,
        },
        tooltip: {
          enterable: true, // 设置可移入气泡
          trigger: "item",
          position: ["50%", "30%"],
          backgroundColor: "rgba(255, 255, 255,.95)",
          borderColor: "rgba(32, 33, 36,0.20)",
          textStyle: {
            align: "left",
            // 文字提示样式
            color: "#666",
            fontSize: "12",
          },
          formatter: function (info) {
            if (info.data.name == undefined) {
              return "";
            }
            return [
              "<div>" + info.data.name + "</div>",
              "<div>" +
                " <div class='inline-block mb-1' style='width: 120px'>总销售额($)</div>" +
                info.data.value +
                "</div>",
              "<div>" +
                " <div class='inline-block mb-1' style='width: 120px'>花费($)</div>" +
                info.data.fees +
                "</div>",
              "<div>" +
                "<div class='inline-block mb-1' style='width: 120px'>ACOS-广告活动</div>" +
                info.data.acos +
                "%</div>",
              `
                <div><div class='inline-block' style='width: 120px'>平均预算内活跃时间</div><span style="${
                  info.data.usageBudget < 80 ? "color: #f53f3f;" : ""
                }">${info.data.usageBudget}%</span></div>
                `,
            ].join("");
          },
        },
        series: [
          {
            type: "treemap",
            breadcrumb: {
              show: false,
            },
            data: [
              {
                name: "广告活动表现",
                value: this.totalSalesFees,
                children: this.expressionList,
              },
            ],
          },
        ],
      };
      this.main.setOption(option);
    },
    renderChartTop10Compaign() {
      this.top10ChartInstance = this.$echarts.init(
        document.getElementById("top10Compaign")
      );
      var option = {
        grid: {
          left: 120,
          top: 30,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255,.95)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#666",
            fontSize: "12",
          },
        },
        yAxis: {
          type: "category",
          data: this.top10Compaign.map((val) => val.campaignName),
          axisLabel: {
            width: 100,
            overflow: "truncate",
            ellipsis: "...",
          },
        },
        xAxis: {
          type: "value",
        },
        series: [
          {
            type: "bar",
            name: "销售额（$）",
            data: this.top10Compaign.map((val) => val.salesFees),
          },
        ],
        color: ["#FF6505"],
        legend: {
          show: true,
          bottom: 0,
        },
      };
      this.top10ChartInstance.setOption(option);
    },
    myEchartsOne(params) {
      if (!this.mainOne) {
        this.mainOne = this.$echarts.init(document.getElementById("mainOne"));
      }
      var option = {
        grid: {
          y: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255,.95)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#666",
            fontSize: "12",
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: params.y,
        series: params.series,
        color: ["#246EFF", "#FF6505"],
        legend: {
          data: params.legend,
          bottom: 0,
        },
      };
      if (params.series.length === 2) {
        const [leftYScale, rightYScale] = getInterval(
          params.series[0].data,
          params.series[1].data
        );
        option.yAxis[0].min = leftYScale.min;
        option.yAxis[0].max = leftYScale.max;
        option.yAxis[0].interval = leftYScale.interval;
        option.yAxis[1].min = rightYScale.min;
        option.yAxis[1].max = rightYScale.max;
        option.yAxis[1].interval = rightYScale.interval;
      }

      this.mainOne.clear();
      if (params.series.length) {
        this.$nextTick(() => {
          this.mainOne.setOption(option);
        });
      }
    },
    myEchartsTwo(params) {
      if (!this.mainTwo) {
        this.mainTwo = this.$echarts.init(document.getElementById("mainTwo"));
      }
      console.log(params.y);
      var option = {
        grid: {
          y: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255,.95)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#666",
            fontSize: "12",
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: params.y,
        series: params.series,
        color: ["#246EFF", "#FF6505"],
        legend: {
          data: params.legend,
          bottom: 0,
        },
      };
      if (params.series.length === 2) {
        const [leftYScale, rightYScale] = getInterval(
          params.series[0].data,
          params.series[1].data
        );
        option.yAxis[0].min = leftYScale.min;
        option.yAxis[0].max = leftYScale.max;
        option.yAxis[0].interval = leftYScale.interval;
        option.yAxis[1].min = rightYScale.min;
        option.yAxis[1].max = rightYScale.max;
        option.yAxis[1].interval = rightYScale.interval;
        console.log("right interval ", rightYScale);
      }
      this.mainTwo.clear();
      if (params.series.length) {
        this.$nextTick(() => {
          this.mainTwo.setOption(option);
        });
      }
    },
    myEchartsThree() {
      this.mainThree = this.$echarts.init(document.getElementById("mainThree"));
      var option = {
        grid: {
          x: 60,
          x2: 20,
          y: 20,
          y2: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(32, 33, 36,.7)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#fff",
            fontSize: "22",
          },
          formatter: function (params) {
            var relVal = params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
              relVal += "<br/>" + params[i].marker + params[i].value + "%";
            }
            return relVal;
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.acosList,
            type: "line",
          },
        ],
      };
      this.mainThree.setOption(option);
    },
    myEchartsFour() {
      this.mainFour = this.$echarts.init(document.getElementById("mainFour"));
      var option = {
        grid: {
          x: 60,
          x2: 20,
          y: 20,
          y2: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(32, 33, 36,.7)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#fff",
            fontSize: "22",
          },
          formatter: function (params) {
            var relVal = params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
              relVal += "<br/>" + params[i].marker + params[i].value + "%";
            }
            return relVal;
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.tacosList,
            type: "line",
          },
        ],
      };
      this.mainFour.setOption(option);
    },
    myEchartsFive() {
      this.mainFive = this.$echarts.init(document.getElementById("mainFive"));
      var option = {
        grid: {
          x: 60,
          x2: 20,
          y: 20,
          y2: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(32, 33, 36,.7)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#fff",
            fontSize: "22",
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.impressionsList,
            type: "line",
          },
        ],
      };
      this.mainFive.setOption(option);
    },
    myEchartsSix() {
      this.mainSix = this.$echarts.init(document.getElementById("mainSix"));
      var option = {
        grid: {
          x: 60,
          x2: 20,
          y: 20,
          y2: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(32, 33, 36,.7)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#fff",
            fontSize: "22",
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.clicksList,
            type: "line",
          },
        ],
      };
      this.mainSix.setOption(option);
    },
    myEchartsSeven() {
      this.mainSeven = this.$echarts.init(document.getElementById("mainSeven"));
      var option = {
        grid: {
          x: 60,
          x2: 20,
          y: 20,
          y2: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(32, 33, 36,.7)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#fff",
            fontSize: "22",
          },
          formatter: function (params) {
            var relVal = params[0].name;
            for (var i = 0, l = params.length; i < l; i++) {
              relVal += "<br/>" + params[i].marker + params[i].value + "%";
            }
            return relVal;
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.clickPercentList,
            type: "line",
          },
        ],
      };
      this.mainSeven.setOption(option);
    },
    myEchartsEight() {
      this.mainEight = this.$echarts.init(document.getElementById("mainEight"));
      var option = {
        grid: {
          x: 60,
          x2: 20,
          y: 20,
          y2: 20,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(32, 33, 36,.7)",
          borderColor: "rgba(32, 33, 36,0.20)",
          borderWidth: 1,
          textStyle: {
            // 文字提示样式
            color: "#fff",
            fontSize: "22",
          },
        },
        xAxis: {
          type: "category",
          data: this.dayList,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.cpcFeeList,
            type: "line",
          },
        ],
      };
      this.mainEight.setOption(option);
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryEcharts();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.handleQuery();
    },
    getTreeMapColor(acos) {},
    copy(val) {
      const inputo = document.createElement("input");
      document.body.appendChild(inputo);
      inputo.value = val;
      inputo.setAttribute("readOnly", "readOnly");
      inputo.select();
      document.execCommand("Copy");
      document.body.removeChild(inputo);
      this.$notify({
        title: "成功",
        message: "复制成功",
        type: "success",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .row-stripe {
  background: #FAFAFA;
}
::v-deep .el-tabs__item {
  height: 70px !important;
}
::v-deep .el-card__body {
  padding: 0px 10px 10px 10px !important;
}

.el-col-lg-4-8 {
  width: 20%;
}
* {
  -webkit-user-select: text !important;
  user-select: text !important;
}
.summary {
  padding-top: 20px;
  padding-left: 20px;
}
.summary_title {
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #666666;
}
.summary_value {
  font-family: "DIN Alternate";
  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 150%;
  color: #1d2129;
}
.board-card_head_title {
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
}
.board-card_head_date {
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #8c8c8c;
}
.matric-tree_title {
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
  color: #333333;
}
.matric-tree_bar {
  width: 120px;
  height: 12px;
  background: linear-gradient(
    90deg,
    #d13808 5%,
    #f3470d 15%,
    #ff895d 24.52%,
    #ffc5ac 34.63%,
    #dee7ff 44.7%,
    #bfd9ff 54.74%,
    #9ac5ff 64.82%,
    #7daaff 74.89%,
    #5b8ff9 84.95%,
    #3d76dd 95%
  );
  transform: matrix(1, 0, 0, -1, 0, 0);
}
.matric-tree_bar-wrapper {
  color: #888888;
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 17px;
}
.table_header_class {
  background: #fff;
}

.app-container {
  padding-top: 0px;
  background: none;
}
.puchase-table_item-title {
  &_content {
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    /* or 133% */

    /* 文字颜色/黑_33333 */

    color: #333333;
    word-break: break-all;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 这里是超出几行省略 */
  }
  &_asin {
    font-family: "PingFang SC";
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    margin-top: 4px;
    /* identical to box height, or 133% */

    /* 文字颜色/灰_888 */

    color: #888888;
    cursor: pointer;
    .el-icon-document-copy:hover {
      color: #ff6505;
    }
  }
}
</style>

<style>
.dashboard_search-item .el-input--small .el-input__inner {
  border: none;
  font-size: 12px;
}
.data_detail .el-table .el-table__header-wrapper th {
  background: #fff;
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  color: #666666;
}
.openCloseTag {
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 100%;
  /* identical to box height, or 12px */

  color: #8c8c8c;
}
.bireport-container {
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.bireport-container::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.bi-divider {
  background-color: #dddddd;
  width: 1px;
  height: 16px;
  margin-right: 12px;
  margin-left: 12px;
}
</style>