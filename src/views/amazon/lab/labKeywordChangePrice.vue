<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
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
        <el-form-item label="关键词" label-width="70px" prop="keywordText">
          <el-input
            v-model="queryParams.keywordText"
            placeholder="请输入关键词"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="调整状态" prop="type">
          <el-select
            v-model="queryParams.state"
            placeholder="请选择调整类型"
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
        <el-form-item label="满21天" prop="isDay">
          <el-select
            v-model="queryParams.isDay"
            placeholder="请选择类型"
            size="small"
            style="width: 90px"
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
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
        >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="batchUpdateState"
        >一键调整</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableList" :row-class-name="tableRowClassName"
               @selection-change="changeCheckBoxValue" height="650">
      <el-table-column
        type="selection"
        width="65">
      </el-table-column>
      <el-table-column label="店铺账号" align="center" prop="accountName" width="170"/>
      <el-table-column label="活动名称" align="center" prop="campaignName"/>
      <el-table-column label="广告组名称" align="center" prop="groupName"/>
      <el-table-column label="关键词" align="center" prop="keywordText"/>
      <el-table-column label="匹配方式" align="center" prop="matchType" :formatter="formatMatchType"/>
      <el-table-column label="调整前出价" align="center" prop="oldBid"/>
      <!--<el-table-column label="提高或降低的百分比" align="center" prop="changePercentage"/>-->
      <el-table-column label="调整后出价" align="center" prop="newBid">
      <template slot-scope="scope">
              <span v-if="scope.row.oldBid != undefined">{{
                  scope.row.oldBid != null
                    ? (scope.row.oldBid*scope.row.changePercentage/100).toFixed(2)
                    : ""
                }}</span>
      </template>
      </el-table-column>
      <el-table-column label="是否调整出价" align="center" prop="state" width="130">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_lab_yes_no" :value="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column label="是否满21天" align="center" prop="isDay" width="130">
        <template slot-scope="scope">
          <span>{{ scope.row.isDay===1?"是":"否" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="广告组标签" align="center" prop="groupLabel" />
      <el-table-column label="关键词标签" align="center" prop="keywordLabel" />
      <el-table-column label="日期" align="center" prop="dateTime" />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 批量调整 -->
    <el-dialog
      title="批量调整关键词竞价"
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
          <span>确定批量调整关键词的竞价吗？</span>
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
import { labKeywordChangePriceList,batchLabKeywordChangePrice} from "@/api/amazon/campaignsinfo";
import { allAccount } from "@/api/amazon/account";
export default {
  name: "labKeywordChangePrice",
  dicts: ['sys_show_hide', 'sys_lab_yes_no'],
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
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
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
      stateList:[
        {value:'1',label:'是'},
        {value:"2",label:'否'}
      ],
      typeList: [
        { label: "全部", value: null },
        { label: "是", value: 1 },
        { label: "否", value: 2 },
      ],
      matchTypeList: [
        { value: "1", label: "精准" },
        { value: "2", label: "词组" },
        { value: "3", label: "广泛" },
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
      batchState:false,
      checkBoxData: [],
      accountList: [],
      // 表单参数
      priceForm: {
        state:undefined,
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        keywordText: undefined,
        campaignName:undefined,
        groupName:undefined,
        accountId:undefined,
        state:undefined,
        isDay:undefined,
        startDate: undefined,
        endDate: undefined,
        dateTime: undefined
      }
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
    formatState(row, column, cellValue, index){
      for(let i=0; i<this.stateList.length;i++){
        if(cellValue == this.stateList[i].value){
          return this.stateList[i].label;
        }
      }
      return '';
    },
    formatMatchType(row, column, cellValue, index) {
      for (let i = 0; i < this.matchTypeList.length; i++) {
        if (cellValue == this.matchTypeList[i].value) {
          return this.matchTypeList[i].label;
        }
      }
      return "";
    },
    tableRowClassName ({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.index = rowIndex
    },
    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        let batchKeywordParam = {
          keywordId:column.keywordId,
          bid:(column.oldBid*column.changePercentage/100).toFixed(2),
          state:1,
        };
        this.checkBoxData.push(batchKeywordParam);
      });
    },
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      labKeywordChangePriceList(this.queryParams).then(response => {
          this.tableList = response.list;
          this.total = response.total;
          this.loading = false;
        }
      );
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
      this.getTime()
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
    batchUpdateState(){
      if (this.checkBoxData.length<=0){
        this.$message.warning('请勾选列表里的关键词');
      }else{
        //打开弹窗
        this.batchState = true;
      }
    },
    submitFormState(){
      batchLabKeywordChangePrice(this.checkBoxData).then((response) => {
        if (response.code === 200){
          this.batchState = false;
          this.$message.success('批量修改竞价成功');
          this.getList();
        }
      });
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        accountId: null,
        campaignName: null,
        advGroupName: null,
        state: null,
        keywordText: null,
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
    }
  }
};
</script>


