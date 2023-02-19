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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['channel:account:save']">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="accountList" max-height="650">
      <!--      <el-table-column type="selection" width="55" align="center" />-->
      <el-table-column label="账号id" align="center" prop="id" />
      <el-table-column label="账号名称" align="center" prop="accountName" width="160" />
      <el-table-column label="卖家ID" align="center" prop="sellerId" width="160" />
      <el-table-column label="站点" align="center" prop="site" :formatter="formatSite" />
      <el-table-column label="区域" align="center" prop="region" :formatter="formatRegion" />
      <el-table-column label="店铺授权" align="center" prop="isStoreAuth" :formatter="formatAuth" />
      <el-table-column label="广告授权" align="center" prop="isAdvAuth" :formatter="formatAuth" />
      <!-- <el-table-column label="全店授权" align="center" prop="isAdvAuth" :formatter="allAuth" /> -->
      <el-table-column label="所属用户" align="center" prop="userName" :v-if="user.usreId == 1" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-switch @change="updateStatusChange($event,scope.row.id)" v-model="scope.row.statusBool"
            active-color="#006400" inactive-color="#A9A9A9" :disabled="hasAuthPerm('channel:account:updateStatus')">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['channel:account:save']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['channel:account:deleteAccount']">删除</el-button>
          <el-button size="mini" type="text" icon="el-icon-s-shop" @click="openToSellerCentral(scope.row)"
            v-hasPermi="['store:account:toSellerCentral']">店铺授权</el-button>
          <el-button size="mini" type="text" icon="  el-icon-s-marketing" @click="openToAdvertisingAuth(scope.row)"
            v-hasPermi="['channel:account:toAdvertisingAuth']">广告授权</el-button>
          <el-button size="mini" type="text" icon="el-icon-s-shop" @click="syncListing(scope.row)"
            v-hasPermi="['channel:account:listing']">同步Listing</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdateShop(scope.row)"
                     v-hasPermi="['channel:account:updateShopUser']">店铺分配</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="店铺名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入店铺名称" style="width: 340px;margin-right: 10px" />
          <el-tooltip class="item" effect="light" content="店铺名称可以自己设置" placement="right-start">
            <i class="el-icon-question" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="卖家ID" prop="sellerId">
          <el-input v-model="form.sellerId" placeholder="请输入卖家ID" style="width: 340px;margin-right: 10px" />
          <el-tooltip class="item" effect="light" content="在卖家后台: 设置->账户信息->卖家记号" placement="right-start">
            <i class="el-icon-question" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="状态" prop="statusBool">
          <el-switch v-model="form.statusBool" active-color="#006400" inactive-color="#A9A9A9">
          </el-switch>
        </el-form-item>
        <el-form-item label="站点" prop="remark">
          <el-select v-model="form.site" placeholder="站点" clearable size="small" style="width: 240px">
            <el-option v-for="item in siteList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 店铺分配对话框 -->
    <el-dialog title="店铺分配" :visible.sync="updateShop" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="店铺名称" prop="accountName">
          <el-input v-model="formShop.accountName" placeholder="" style="width: 340px;margin-right: 10px" disabled/>
        </el-form-item>
        <el-form-item label="卖家ID" prop="sellerId">
          <el-input v-model="formShop.sellerId" placeholder="" style="width: 340px;margin-right: 10px" disabled/>
        </el-form-item>
        <el-form-item label="站点" prop="remark">
          <el-select v-model="formShop.site" placeholder="" clearable size="small" style="width: 240px" disabled>
            <el-option v-for="item in siteList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属用户" prop="userName">
          <el-select v-model="formShop.userId" filterable placeholder="请选择所属用户" clearable size="small" style="width: 240px">
            <el-option v-for="item in userNameList" :key="item.userId" :label="item.userName" :value="item.userId" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormShop">确 定</el-button>
        <el-button @click="cancelShop">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { listAccount,syncListing, getAccount, saveAccount, updateStatus, deleteAccount, toAdvertisingAuth, hasAuthPermission, toSellerCentral,queryAllUserList,updateShopUser} from "@/api/amazon/account";
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
      userNameList:[],
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
      updateShop:false,
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
      // 表单参数
      formShop: {
        accountName:undefined,
        sellerId:undefined,
        site:undefined,
        userName:undefined,
        userId:undefined,
        id:undefined
      },
      user: {},
      // 表单校验
      rules: {
        accountName: [
          { required: true, message: "店铺账号名称不能为空", trigger: "blur" }
        ],
        site: [
          { required: true, message: "站点不能为空", trigger: "blur" }
        ],
        sellerId: [
          { required: true, message: "SellerId不能为空", trigger: "blur" }
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
      return cellValue == 1 ? '是' : '否';
    },
    openToAdvertisingAuth(row){
      this.$modal.confirm('务必在日常登录的网络环境做授权, 以防关联').then(function() {
        localStorage.setItem('sellerId', row.sellerId);
        return toAdvertisingAuth({region: row.region}).then(response => {
          window.open(response.url)
        });
      }).then(() => {

      }).catch(() => {});
    },

    openToSellerCentral(row){
      this.$modal.confirm('务必在日常登录的网络环境做授权, 以防关联').then(function() {
        return toSellerCentral(row.site).then(res => {
          if (res.code === 200) {
            window.open(res.msg, '_blank');
          }
        })
      }).then(() => {

      }).catch(() => {});

    },

    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      listAccount(this.queryParams).then(response => {
          this.accountList = response.list;
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
    cancelShop(){
      this.updateShop = false;
      this.formShop = {
        accountName:undefined,
        sellerId:undefined,
        site:undefined,
        userName:undefined,
        userId:undefined,
        id:undefined
      }
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        accountName: undefined,
        site: undefined,
        sellerId: undefined,
        region: undefined,
        isAllAuth: undefined,
        status: 1,
        statusBool: true
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
      this.title = "添加店铺账号";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getAccount({id: row.id }).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改店铺账号";
      });
    },
    /** 修改店铺分配 */
    handleUpdateShop(row){
      this.formShop.accountName = row.accountName;
      this.formShop.sellerId = row.sellerId;
      this.formShop.site = row.site;
      this.formShop.userName = row.userName;
      this.formShop.userId = row.userId;
      this.formShop.id = row.id;
      let queryAllUser = {
        roleIds:[2,3]
      }

      queryAllUserList(queryAllUser).then(response => {
          this.userNameList = response.rows;
        }
      );
      this.updateShop = true;
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$modal.confirm('是否确认删除编号为"' + id + '"的数据项？').then(function() {
        return deleteAccount({ id:row.id });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          saveAccount(this.form).then(response => {
            this.$modal.msgSuccess("保存成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    submitFormShop:function (){
      let updateParam = {
        id: this.formShop.id,
        userId: this.formShop.userId,
      };
      updateShopUser(updateParam).then(response => {
        this.$modal.msgSuccess("保存成功");
        this.updateShop = false;
        this.getList();
      });
    }
  }
};
</script>
