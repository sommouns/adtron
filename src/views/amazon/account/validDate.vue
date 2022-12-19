<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="账号名称" prop="accountName">
        <el-input v-model="queryParams.accountName" placeholder="请输入账号名称" clearable size="small" style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="站点" prop="site">
        <el-select v-model="queryParams.site" placeholder="站点" clearable size="small" style="width: 240px">
          <el-option v-for="item in siteList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="店铺状态" clearable size="small" style="width: 240px">
          <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="accountList" max-height="650">
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column label="账号id" align="center" prop="id" />
      <el-table-column label="账号名称" align="center" prop="accountName" width="160" />
      <el-table-column label="卖家ID" align="center" prop="sellerId" width="160" />
      <el-table-column label="站点" align="center" prop="site" :formatter="formatSite" />
      <el-table-column label="区域" align="center" prop="region" :formatter="formatRegion" />
      <el-table-column label="客户类型" align="center" prop="isAllAuth" :formatter="allAuth" />
      <el-table-column label="自动调价期限" align="center" prop="autoTime"  />
      <el-table-column label="广告托管期限" align="center" prop="entrustTime"  />
      <el-table-column label="所属用户" align="center" prop="userName" :v-if="user.usreId == 1" />
      <el-table-column label="店铺创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改有效期</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="客户类型" prop="isAllAuth">
          <el-select v-model="form.isAllAuth" placeholder="请选择客户类型" clearable size="small" style="width: 280px">
            <el-option key="1" label="大客户" :value="1" />
            <el-option key="0" label="小客户" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动调价有效期" prop="autoTime">
          <el-date-picker clearable size="small" v-model="form.autoTime" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择自动调价有效期" style="width: 280px;margin-right: 10px">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="广告托管有效期" prop="entrustTime">
          <el-date-picker clearable size="small" v-model="form.entrustTime" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择广告托管有效期" style="width: 280px;margin-right: 10px">
          </el-date-picker>
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
import { listAccount,syncListing, getAccount, updateValidDate } from "@/api/amazon/account";
import { getUserProfile } from "@/api/system/user";
export default {
  name: "Account",
  data() {
    return {
      statusList:[
        {
          value: null,
          label: '全部'
        },
        {
          value: 0,
          label: '禁用'
        },
        {
          value: 1,
          label: '启用'
        }
      ],
      siteList:[
        {value: null,label: '全部'},
        {value: 'US',label: '美国'},
        {value:"CA",label:'加拿大'},
        {value:"MX",label:'墨西哥'},
        {value:"BR",label:'巴西'},
        {value:"GB",label:'英国'},
        {value:"DE",label:'德国'},
        {value:"FR",label:'法国'},
        {value:"ES",label:'西班牙'},
        {value:"IT",label:'意大利'},
        {value:"NL",label:'荷兰'},
        {value:"AE",label:'阿拉伯联合酋长国'},
        {value:"SE",label:'瑞典'},
        {value:"JP",label:'日本'},
        {value:"AU",label:'澳大利亚'},
        {value:"SG",label:'新加坡'}
      ],
      regionList:[
        {value:null,label:'全部'},
        {value:'NA',label:'北美'},
        {value:"EU",label:'欧洲'},
        {value:"FE",label:'远东'}
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
      accountList: [],
      syncListingParams:{
        sellerId:''
      },
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accountName: undefined,
        sellerId: undefined,
        statusBool: undefined,
        site: undefined
      },
      // 表单参数
      form: {},
      user: {},
      // 表单校验
      rules: {
        autoTime: [
          { required: true, message: "自动调价期限不能为空", trigger: "blur" }
        ],
        entrustTime: [
          { required: true, message: "广告托管期限不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUser();
    this.getList();
  },
  methods: {
    getUser() {
      getUserProfile().then(response => {
        this.user = response.data;
      });
    },
    syncListing(row) {
      this.syncListingParams.sellerId = row.sellerId;
      syncListing(this.syncListingParams);
    },
    hasAuthPerm(param){
      return !hasAuthPermission(param);
    },
    formatSite(row, column, cellValue, index){
      for(let i=0; i<this.siteList.length;i++){
        if(cellValue == this.siteList[i].value){
          return this.siteList[i].label;
        }
      }
      return '';
    },
    updateStatusChange(val, id){
      let status = val ? 1 : 0;
      console.log(status);
      updateStatus({id: id, status:status}).then(response => {
        this.$modal.msgSuccess("设置成功");
        this.getList();
      });
    },
    formatRegion(row, column, cellValue, index){
      for(let i=0; i<this.regionList.length;i++){
        if(cellValue == this.regionList[i].value){
          return this.regionList[i].label;
        }
      }
      return '';
    },
    formatAuth(row, column, cellValue, index){
      return cellValue == 1 ? '已授权' : '未授权';
    },
    allAuth(row, column, cellValue, index) {
      return cellValue == 1 ? '大客户' : '小客户';
    },
    getList() {
      this.loading = true;
      listAccount(this.queryParams).then(response => {
          this.accountList = response.list;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 取消按钮
    cancel() {
      this.open = false;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      getAccount({id: row.id }).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "设置店铺托管有效期";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateValidDate(this.form).then(response => {
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
