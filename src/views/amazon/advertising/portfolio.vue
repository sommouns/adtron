<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="账号" prop="accountId">
        <el-select
          v-model="queryParams.accountId"
          placeholder="请选择账号"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :label="item.accountName + '-' +  item.site"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入广告组合名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="状态" prop="state">
        <el-select
          v-model="queryParams.state"
          placeholder="请选择状态"
          clearable
          size="small"
          style="width: 240px"
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
          v-hasPermi="['advertising:portfolio:save']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="portfolioList">
      <el-table-column label="账号名称" align="center" prop="accountName" width="160"/>
      <el-table-column label="广告组合id" align="center" prop="portfolioId" width="170"/>
      <el-table-column label="广告组合名称" align="center" prop="name" width="170" :show-overflow-tooltip="true"/>
      <el-table-column label="预算" align="center" prop="budget" width="70"/>
      <el-table-column label="开始时间" align="center" prop="startDate"/>
      <el-table-column label="开始时间" align="center" prop="endDate"/>
      <el-table-column label="活动状态" align="center" prop="stateName" width="75"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['advertising:portfolio:portfolioDetail']"
          >修改</el-button>
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="账号" prop="accountId">
          <el-select
            v-model="form.accountId" placeholder="请选择账号" clearable size="small" style="width: 240px" >
            <el-option  v-for="item in accountList" :key="item.id" :label="item.accountName + '-' +  item.site"
              :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" style="width: 340px;margin-right: 10px"/>
        </el-form-item>
        <el-form-item label="上限预算">
          <el-select v-model="form.budgetType"  size="small" style="width: 240px" >
            <el-option  v-for="item in budgetTypeList" :key="item.value" :label="item.label"
                        :value="item.value"/>
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围预算上限" v-if="form.budgetType == 2">
          <el-input v-model="form.budget.amount"  style="width: 340px;margin-right: 10px"/>
        </el-form-item>

        <el-form-item label="开始时间" v-if="form.budgetType == 2">
          <el-date-picker
            v-model="form.budget.startDate"
            type="date"
            value-format="yyyyMMdd"
            format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="结束时间" v-if="form.budgetType == 2">
          <el-date-picker
            v-model="form.budget.endDate"
            type="date"
            value-format="yyyyMMdd"
            format="yyyy-MM-dd"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="state" v-if="form.portfolioId != null">
          <el-select
            v-model="form.state"
            placeholder="请选择状态"
            clearable
            size="small"
            style="width: 240px"
          >
            <el-option
              v-for="item in saveStateList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import { listPortfolio, getPortfolio, savePortfolio} from "@/api/amazon/portfolio";
import { getUserProfile } from "@/api/system/user";
import {allAccount} from "@/api/amazon/account";
export default {
  name: "Portfolio",
  data() {
    return {
      stateList:[
        {value:null,label:'全部'},
        {value:'1',label:'已启用'},
        {value:"2",label:'已暂停'},
        {value:"3",label:'已存档'}
      ],
      saveStateList:[
        {value:1,label:'已启用'},
        {value:2,label:'已暂停'},
        {value:3,label:'已存档'}
      ],
      budgetTypeList:[
        {value:1,label:'无上限预算'},
        {value:2,label:'日期范围'},
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
      portfolioList: [],
      accountList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        state: undefined,
        accountId: undefined
      },
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        accountId: undefined,
        portfolioId: undefined,
        state: 1,
        budgetType: 1,
        budget: {
          amount: undefined,
          currencyCode: undefined,
          policy:undefined,
          startDate:undefined,
          endDate:undefined
        }
      },
      user: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "广告组合名称不能未空", trigger: "blur" }
        ],
        accountId: [
          { required: true, message: "请选择店铺账号", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.allAccountList();
  },
  methods: {

    allAccountList(){
      allAccount().then(response => {
        this.accountList = response.data;
      });
    },

    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      listPortfolio(this.queryParams).then(response => {
          this.portfolioList = response.list;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        accountId: undefined,
        portfolioId: undefined,
        state: 1,
        budgetType: 1,
        budget: {
          amount: undefined,
          currencyCode: undefined,
          policy:undefined,
          startDate:undefined,
          endDate:undefined
        }
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加广告组合";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getPortfolio({portfolioId: row.portfolioId }).then(response => {
        this.form = response.data;
        if(this.form.budget == null){
          this.form.budget = {
            amount: undefined,
            currencyCode: undefined,
            policy:undefined,
            startDate:undefined,
            endDate:undefined
          };
        }
        console.log(this.form);
        this.open = true;
        this.title = "修改广告组合";
      });
    },

    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          savePortfolio(this.form).then(response => {
            this.$modal.msgSuccess("保存成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
  }
};
</script>
