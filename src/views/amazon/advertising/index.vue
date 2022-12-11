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
      <el-form-item label="ASIN" prop="asin">
        <el-input
          v-model="queryParams.asin"
          placeholder="请输入ASIN,多个以英文逗号隔开"
          clearable
          size="small"
          style="width: 160px"
          name="asinInput"
          :disabled="asinInputDisabled"
        />
      </el-form-item>
      <el-form-item label="活动名称" prop="campaignName">
        <el-input
          v-model="queryParams.campaignName"
          placeholder="请输入活动名称"
          clearable
          size="small"
          style="width: 160px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
            <el-form-item label="广告组合名称" prop="groupName" label-width="120px">
        <el-input
          v-model="queryParams.groupName"
          placeholder="请输入广告组合名称"
          clearable
          size="small"
          style="width: 160px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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

      <el-form-item label="活动类型" prop="campaignType">
        <el-select
          v-model="queryParams.campaignType"
          placeholder="请选择广告活动类型"
          clearable
          size="small"
          style="width: 160px"
          @change="changeCampaignType"
        >
          <el-option
            v-for="item in campaignTypeList"
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
          v-hasPermi="['advertising:excel:export']"
          >导出</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="handleImport"
          v-hasPermi="['advertising:excel:import']"
          >导入</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExportDisplay"
          v-hasPermi="['advertising:excel:export']"
          >导出展示型广告</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="handleImportDisplay"
          v-hasPermi="['advertising:excel:import']"
          >导入展示型广告</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExportBrand"
          v-hasPermi="['advertising:excel:export']"
          >导出品牌型广告</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="handleImportBrand"
          v-hasPermi="['advertising:excel:import']"
          >导入品牌型广告</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" @click="batchUpdateStateFun">批量修改状态</el-button>
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="campaignList"
      :summary-method="getSummaries"
      show-summary
      max-height="650"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      :row-class-name="tableRowClassName"
      @cell-click="tabClick" @selection-change="changeCheckBoxValue"
    >
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column
        type="selection"
        fixed="left"
        width="65">
      </el-table-column>
      <el-table-column
        label="店铺账号"
        align="center"
        prop="accountName"
        width="150"
        fixed="left"
        :show-overflow-tooltip="true"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="所属用户"
        align="center"
        prop="userName"
        fixed="left"
        :v-if="user.usreId == 1"
      />
      <el-table-column
        label="活动名称"
        align="center"
        prop="campaignName"
        width="170"
        fixed="left"
        :show-overflow-tooltip="false"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <router-link :to="'/advertising/campaign/index/' + scope.row.campaignIdStr + ','+ queryParams.dateTime" class="link-type">
            <span>{{ scope.row.campaignName }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        label="活动类型"
        align="center"
        prop="campaignTypeName"
        width="150"
      />
      <el-table-column
        label="投放类型"
        align="center"
        prop="targetingTypeName"
        width="75"
      />
      <el-table-column label="活动状态" align="center">
        <template slot-scope="scope">
              <span v-if="scope.row.campaignId === tabClickIndex && tabClickLabel === '活动状态'">
                  <el-select ref="inputRefState" @change="inputChangeState(scope.row)"
                             v-model="stateTo"
                             placeholder="请选择状态"
                             clearable
                             size="small"
                             style="width: 90px"
                  >
                    <el-option @click.native="selectState()"
                               v-for="item in stateToList"
                               :key="item.value"
                               :label="item.label"
                               :value="item.value"
                    />
                  </el-select>
              </span>
          <span v-else >{{ scope.row.state===1?"已启用":scope.row.state===2?"已暂停":"已存档" }} <i class="el-icon-edit" style="color: #00afff"></i></span>
        </template>
      </el-table-column>



      <el-table-column
        label="预算"
        align="center"
        prop="dailyBudget"
        width="70"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column label="起止时间" align="center" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.startDate }} - {{ scope.row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="展现量"
        align="center"
        prop="impressions"
        width="60"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="点击量"
        align="center"
        prop="clicks"
        width="60"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="点击率"
        align="center"
        prop="clickPercent"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.clickPercent != null ? scope.row.clickPercent + "%" : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="CPC"
        align="center"
        prop="cpcFee"
        width="50"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="广告费"
        align="center"
        prop="fees"
        width="70"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="销售额"
        align="center"
        prop="salesFees"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="ACoS"
        align="center"
        prop="feesPercent"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.feesPercent != null ? scope.row.feesPercent + "%" : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="近30天ACoS"
        align="center"
        prop="last30FeesPercent"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.last30FeesPercent != null
              ? scope.row.last30FeesPercent + "%"
              : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="ROAS"
        align="center"
        prop="roas"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.roas != null ? scope.row.roas : "" }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="广告订单"
        align="center"
        prop="totalOrder"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      />
      <el-table-column
        label="转化率"
        align="center"
        prop="changeRate"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.changeRate != null ? scope.row.changeRate + "%" : ""
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分时调价" align="center" prop="timePriceState">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_camp_state" :value="scope.row.timePriceState"/>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="130"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handlePrice(scope.row)"
            v-hasPermi="['advertising:api:changeCampaignPrice']"
            >修改活动预算</el-button
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

    <!-- 用户导入对话框 -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <!-- <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link> -->
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改活动价格 -->
    <el-dialog
      :title="price.title"
      :visible.sync="price.open"
      width="400px"
      append-to-body
    >
      <el-form
        :model="priceForm"
        ref="priceForm"
        label-width="110px"
        class="demo-ruleForm"
      >
        <el-form-item label="预算修改为：" prop="rate">
          <el-input
            placeholder="请填写预算"
            oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
            v-model="priceForm.rate"
            style="width: 240px"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('priceForm')"
          >确定</el-button
        >
        <el-button @click="price.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看用户ASIN -->
    <el-dialog
      title="搜索词报告"
      :visible.sync="reportDataOpen"
      width="1300px"
      append-to-body
    >
      <el-form
        :model="reportQueryParams"
        ref="queryForm"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="时间">
          <div class="block">
            <el-date-picker
              @change="getTime"
              v-model="reportQueryParams.dateTime"
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
        <el-form-item label="搜索词">
          <el-input
            v-model="reportQueryParams.query"
            placeholder="请输入搜索词"
            clearable
            size="small"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="searchReport"
            v-hasPermi="['term:report:list']"
            >搜索</el-button
          >
          <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleTermExport"
            v-hasPermi="['term:report:export']"
            >导出</el-button
          >
        </el-form-item>
      </el-form>
      <el-table :data="reportData" style="width: 100%" width="150">
        <el-table-column
          label="活动名称"
          align="center"
          prop="campaignName"
          width="300"
          :show-overflow-tooltip="true"
        />
        <el-table-column
          label="关键字"
          align="center"
          prop="keywordText"
          width="150"
        />
        <el-table-column
          label="搜索词"
          align="center"
          prop="query"
          width="150"
        />
        <el-table-column
          label="展现量"
          align="center"
          prop="impressions"
          width="80"
        />
        <el-table-column
          label="点击量"
          align="center"
          prop="clicks"
          width="70"
        />
        <el-table-column
          label="点击率"
          align="center"
          prop="clickPercent"
          width="70"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.clickPercent != null ? scope.row.clickPercent + "%" : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="CPC" align="center" prop="cpcFee" width="70" />
        <el-table-column label="广告费" align="center" prop="fees" width="70" />
        <el-table-column
          label="销售额"
          align="center"
          prop="salesFees"
          width="70"
        />
        <el-table-column
          label="ACoS"
          align="center"
          prop="feesPercent"
          width="70"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.feesPercent != null ? scope.row.feesPercent + "%" : ""
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="广告订单"
          align="center"
          prop="totalOrder"
          width="80"
        />
        <el-table-column
          label="转化率"
          align="center"
          prop="changeRate"
          width="70"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.changeRate != null ? scope.row.changeRate + "%" : ""
            }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="reportTotal > 0"
        :total="reportTotal"
        :page.sync="reportQueryParams.pageNum"
        :limit.sync="reportQueryParams.pageSize"
        @pagination="searchReport"
      />
    </el-dialog>

    <!-- 批量修改活动词状态 -->
    <el-dialog
      title="批量修改活动词状态"
      :visible.sync="batchState"
      width="350px"
      append-to-body
    >
      <el-form
        :model="priceForm"
        ref="priceForm"
        label-width="70px"
        class="demo-ruleForm"
        style="padding-left: 30px"
      >
        <el-form-item label="状态" prop="priceType">
          <el-select
            v-model="batchUpdateState"
            placeholder="请选择状态"
            clearable
            size="small"
            style="width: 140px;padding-bottom: 10px;"
          >
            <el-option
              v-for="item in stateToList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormState()"
        >确定</el-button
        >
        <el-button @click="batchState = false">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { listCampaign, changeCampaignPrice, changeCampaignState } from "@/api/amazon/advertising";
import { allAccount } from "@/api/amazon/account";
import { getToken } from "@/utils/auth";
import { getUserProfile } from "@/api/system/user";
import { listReport } from "@/api/amazon/searchTermReport";

export default {
  name: "Advertising",
  dicts: ['sys_show_hide', 'sys_camp_state'],
  data() {
    return {
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/advertising/excel/import",
      },
      asinInputDisabled: false,
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
        { value: null, label: "全部" },
        { value: "1", label: "已启用" },
        { value: "2", label: "已暂停" },
        { value: "3", label: "已存档" },
      ],

      campaignTypeList: [
        { value: null, label: "全部" },
        { value: "1", label: "sponsoredProducts" },
        { value: "2", label: "sponsoredDisplay" },
        { value: "3", label: "sponsoredBrands" },
      ],
      timePriceState:[
        { value: "1", label: "开启" },
        { value: "2", label: "关闭" }
      ],
      stateToList:[
        {value:'1',label:'已启用'},
        {value:"2",label:'已暂停'},
        {value:"3",label:'已存档'}
      ],
      user: {},
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
      campaignList: [],
      accountList: [],
      //搜索词报告
      // 报告总条数
      reportTotal: 0,
      reportDataOpen: false,
      reportData: [],
      reportCampaignId: undefined,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      tabClickIndex:null,
      tabClickLabel:null,
      stateTo:null,
      batchState:false,
      batchUpdateState:"1",
      checkBoxData: [],
      //总预算
      totalDailyBudget: 0,
      //总展现量
      totalImpressions: 0,
      //总点击量
      totalClicks: 0,
      //总点击率
      totalClickPercent: 0,
      //总cpc
      totalCpcFee: 0,
      //总广告费
      totalFees: 0,
      //总广告销售额
      totalSalesFees: 0,
      //总广告成本销售比(ACoS)
      totalAcos: 0,
      //roas
      totalRoas: 0,
      //总广告销售额
      allTotalOrder: 0,
      //总转化率
      totalChangeRate: 0,

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accountId: undefined,
        campaignName: undefined,
        state: "1",
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
        campaignType: undefined,
        asin: undefined,
      },
      // 查询参数
      reportQueryParams: {
        pageNum: 1,
        pageSize: 10,
        query: undefined,
        campaignId: undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined,
      },
      // 表单参数
      form: {},
      //修改价格
      price: {
        // 是否显示弹出层（修改价格）
        open: false,
        // 弹出层标题（修改价格）
        title: "",
      },
      defaultSort: { prop: "campaignName", order: "descending" },
      // 表单参数
      priceForm: {
        rate: undefined,
        campaignId: undefined,
      },
    };
  },
  created() {
    this.getUser();
    this.initTime();
    this.allAccountList();
    this.getList();
  },
  methods: {
    getUser() {
      getUserProfile().then((response) => {
        this.user = response.data;
      });
    },
    formatTimePriceState(row, column, cellValue, index){
      for(let i=0; i<this.timePriceState.length;i++){
        if(cellValue == this.timePriceState[i].value){
          return this.timePriceState[i].label;
        }
      }
      return '';
    },
    initTime() {
      const now = new Date();
      const yesteday = new Date(now.getTime() - 3600 * 1000 * 24);
      let time = this.parseTime(yesteday, "{y}-{m}-{d}");
      this.queryParams.dateTime = [time, time];
      this.queryParams.startDate = this.queryParams.dateTime[0];
      this.queryParams.endDate = this.queryParams.dateTime[1];
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 1) {
          sums[index] = "合计";
          return;
        }
        if ((index >= 2 && index <= 6) || index === 8 || index === 20) {
          return;
        }
        //预算
        if (index === 7) {
          sums[index] = this.totalDailyBudget;
        }
        //总展现量
        if (index === 9) {
          sums[index] = this.totalImpressions;
        }
        //总点击量
        if (index === 10) {
          sums[index] = this.totalClicks;
        }

        //总点击率
        if (index === 11) {
          sums[index] = this.totalClickPercent + "%";
        }
        //总cpc
        if (index === 12) {
          sums[index] = this.totalCpcFee;
        }
        //总广告费
        if (index === 13) {
          sums[index] = this.totalFees;
        }
        //总广告销售额
        if (index === 14) {
          sums[index] = this.totalSalesFees;
        }
        //总广告成本销售比(ACoS)
        if (index === 15) {
          sums[index] = this.totalAcos + "%";
        }

        //roas
        if (index === 17) {
          sums[index] = this.totalRoas;
        }
        //总广告销售额
        if (index === 18) {
          sums[index] = this.allTotalOrder;
        }
        //总转化率
        if (index === 19) {
          sums[index] = this.totalChangeRate + "%";
        }
      });
      return sums;
    },
    changeCampaignType(value) {
      if (value === "3") {
        this.queryParams.asin = "";
        this.asinInputDisabled = true;
      } else {
        this.asinInputDisabled = false;
      }
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      if (null != column.order) {
        this.queryParams.isAsc = column.order;
        this.getList();
      }
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "广告";
      this.upload.open = true;
      this.upload.url =
        process.env.VUE_APP_BASE_API + "/advertising/excel/import";
    },
    /** 导入按钮操作 */
    handleImportDisplay() {
      this.upload.title = "展示型广告";
      this.upload.open = true;
      this.upload.url =
        process.env.VUE_APP_BASE_API + "/advertising/excel/import-display";
    },
    /** 导入按钮操作 */
    handleImportBrand() {
      this.upload.title = "品牌型广告";
      this.upload.open = true;
      this.upload.url =
        process.env.VUE_APP_BASE_API + "/advertising/excel/import-brand";
    },
    batchUpdateStateFun(){
      if (this.checkBoxData.length<=0){
        this.$message.warning('请勾选列表里的关键词');
      }else{
        //打开弹窗
        this.priceForm.state=this.stateToList[0].value;
        this.batchState = true;
      }
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "/advertising/excel/export",
        {
          ...this.queryParams,
        },
        `广告活动_${new Date().getTime()}.xlsx`
      );
    },

    /** 导出按钮操作 */
    handleExportDisplay() {
      this.download(
        "/advertising/excel/export-display",
        {
          ...this.queryParams,
        },
        `展示型广告活动_${new Date().getTime()}.xlsx`
      );
    },
    /** 导出按钮操作 */
    handleExportBrand() {
      this.download(
        "/advertising/excel/export-brand",
        {
          ...this.queryParams,
        },
        `品牌型广告活动_${new Date().getTime()}.xlsx`
      );
    },

    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
          response.msg +
          "</div>",
        "导入结果",
        { dangerouslyUseHTMLString: true }
      );
      this.getList();
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download(
        "system/user/importTemplate",
        {},
        `user_template_${new Date().getTime()}.xlsx`
      );
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
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

    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },

    /** 查询字典类型列表 */
    getList() {
      this.loading = true;

      listCampaign(this.queryParams).then((response) => {
        this.campaignList = response.list;
        this.total = response.total;
        this.loading = false;
        this.totalDailyBudget = response.totalDailyBudget;
        this.totalImpressions = response.totalImpressions;
        this.totalClicks = response.totalClicks;
        this.totalClickPercent = response.totalClickPercent;
        this.totalCpcFee = response.totalCpcFee;
        this.totalFees = response.totalFees;
        this.totalSalesFees = response.totalSalesFees;
        this.totalAcos = response.totalAcos;
        this.totalRoas = response.totalRoas;
        this.allTotalOrder = response.allTotalOrder;
        this.totalChangeRate = response.totalChangeRate;
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
      this.initTime();
      this.handleQuery();
      this.asinInputDisabled = false;
    },
    /** 修改活动价格显示 */
    handlePrice(row) {
      (this.priceForm.rate = ""),
        (this.priceForm.campaignId = row.campaignId),
        (this.price.open = true);
      this.price.title = row.accountName + "修改活动每日预算";
    },
    /** 修改活动价格提交 */
    submitForm(row) {
      let params = {
        rate: this.priceForm.rate,
        campaignId: this.priceForm.campaignId,
      };
      this.$refs["priceForm"].validate((valid) => {
        if (valid) {
          changeCampaignPrice(params).then((res) => {
            (this.price.open = false), (this.priceForm.rate = "");
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    /** 关键词搜索报告 */

    handleCommand(row) {
      this.reportDataOpen = true;
      this.reportQueryParams.campaignId = row.campaignId;
      this.reportQueryParams.dateTime = this.queryParams.dateTime;
      this.reportQueryParams.startDate = this.reportQueryParams.dateTime[0];
      this.reportQueryParams.endDate = this.reportQueryParams.dateTime[1];
      this.reportQueryParams.query = undefined;
      this.searchReport();
    },
    inputChangeState(row){
      if(this.stateTo===''){
        this.$message.warning("请选择需要修改的状态");
        return;
      }
      let adKeywordParam = [{
        campaignId:row.campaignId,
        state:this.stateTo
      }];
      changeCampaignState(adKeywordParam).then((response) => {
        this.$message.success('修改状态成功');
        this.getList();
      });
    },
    selectState(){
      this.tabClickIndex = null;
      this.tabClickLabel = '';
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
    },
    tabClick (row, column, cell, event) {
      // tabClick row 当前行 column 当前列
      switch (column.label) {
        case '活动状态':
          this.stateTo = this.stateToList[row.state-1].value;
          this.tabClickIndex = row.campaignId;
          this.tabClickLabel = column.label;
          break
        default: return
      }
    },
    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        let batchKeywordParam = {
          campaignId:column.campaignId,
          bid:column.bid,
          state:column.state,
        };
        this.checkBoxData.push(batchKeywordParam);
      });
    },
    submitFormState(){
      this.checkBoxData.forEach((column, index) => {
        column.state = this.batchUpdateState
      });
      changeCampaignState(this.checkBoxData).then((response) => {
        if (response.code === 200){
          this.batchState = false;
          this.$message.success('批量修改状态成功');
          this.getList();
        }
      });
    },
    searchReport() {
      if (
        this.reportQueryParams.dateTime != undefined &&
        this.reportQueryParams.dateTime != null
      ) {
        this.reportQueryParams.startDate = this.reportQueryParams.dateTime[0];
        this.reportQueryParams.endDate = this.reportQueryParams.dateTime[1];
      } else {
        this.reportQueryParams.startDate = null;
        this.reportQueryParams.endDate = null;
      }
      listReport(this.reportQueryParams).then((response) => {
        this.reportData = response.rows;
        this.reportTotal = response.total;
      });
    },
    handleTermExport() {
      this.download(
        "/advertising/term/report/export",
        {
          ...this.reportQueryParams,
        },
        `搜索词报告_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
