<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">

      <el-form-item label="店铺账号" prop="accountIdTo">
        <el-select
          v-model="queryParams.accountId"
          placeholder="请选择店铺账号"
          @change="getSchool"
          size="small"
          style="width: 260px"
        >
          <el-option
            v-for="item in accountListTo"
            :key="item.id"
            :label="item.accountName + '-' + item.site"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="托管集合名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入托管集合名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="广告活动名称" prop="campaignName">
        <el-input
          v-model="queryParams.campaignName"
          placeholder="请输入广告活动名称"
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
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-edit"
          size="mini"
          @click="batchMoveTo"
        >批量移入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="id"
      max-height="650"
      :default-expand-all="isExpandAll"
      @selection-change="changeCheckBoxValue"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column type="selection" width="65" :selectable="selectable"/>
      <el-table-column prop="name" label="托管集合名称" :show-overflow-tooltip="true"/>
      <el-table-column prop="budget" label="托管集合预算" width="100"/>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="campaignName" label="广告活动名称" :show-overflow-tooltip="true"/>
      <el-table-column prop="campaignBudget" label="广告活动每日预算" width="130"/>
      <el-table-column prop="fees" label="30天日均花费($)" width="120"/>
      <el-table-column prop="acos" label="30天ACOS" width="90">
        <template slot-scope="scope">
          <span v-if="scope.row != undefined">{{
              scope.row.acos != null
                ? scope.row.acos + "%"
                : ""
            }}</span>
          <span v-if="scope.row == undefined">0%</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <div v-if="scope.row.parentId == 2">
          </div>
          <div v-if="scope.row.parentId == 0">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete-solid"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </div>
          <div v-else-if="scope.row.parentId == 1">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleMoveTo(scope.row)"
            >移动到</el-button>
          </div>
          <div v-else-if="scope.row.parentId != 0 && scope.row.parentId != 1 && scope.row.parentId != 2">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleMoveTo(scope.row)"
            >移动到</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete-solid"
              @click="handleRemoveCampaign(scope.row)"
            >移除</el-button>

          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="480px" append-to-body>
      <el-form ref="form" :model="form" label-width="140px" :rules="rules">
        <el-row>
          <el-col :span="24">
            <el-form-item label="店铺账号" prop="accountId">
              <el-select
                v-model="form.accountId"
                placeholder="请选择店铺账号"
                clearable
                size="small"
                style="width: 260px"
              >
                <el-option
                  v-for="item in accountList"
                  :key="item.id"
                  :label="item.accountName + '-' + item.site"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="托管集合名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入托管集合名称" style="width: 260px;"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="托管集合预算" prop="budget">
              <el-input
                oninput="if(isNaN(value)) { value = null } if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+3)}"
                v-model="form.budget"
                placeholder="请输入托管集合预算"
                style="width: 260px;"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


    <!-- 移动 -->
    <el-dialog title="移动" :visible.sync="openTo" width="480px" append-to-body>
      <el-form ref="formTo" :model="formTo" label-width="100px" :rules="rulesTo">
        <el-row>
          <el-col :span="24">
            <el-form-item label="托管集合" prop="id">
              <el-select
                v-model="formTo.id"
                placeholder="请选择托管集合"
                size="small"
                @change="getSchool"
                style="width: 260px;"
              >
                <el-option
                  v-for="item in portfolioList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormTo">确 定</el-button>
        <el-button @click="cancelTo">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 批量移入 -->
    <el-dialog title="批量移入" :visible.sync="openBatchTo" width="480px" append-to-body>
      <el-form ref="formTo" :model="formBatchTo" label-width="100px" :rules="rulesBatchTo">
        <el-row>
          <el-col :span="24">
            <el-form-item label="托管集合" prop="id">
              <el-select
                v-model="formBatchTo.id"
                placeholder="请选择托管集合"
                size="small"
                @change="getSchool"
                style="width: 260px;"
              >
                <el-option
                  v-for="item in portfolioBatchList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormBatchTo">确 定</el-button>
        <el-button @click="cancelBatchTo">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { queryAdvTrusteeshipList,addAdvTrusteeshipList,updateAdvTrusteeshipList,delAdvTrusteeshipList,delPortfolioCampaign,
  queryThisPortfolioList,moveToPortfolio,moveBatchToPortfolio} from "@/api/amazon/advertising";
import { allAccount } from "@/api/amazon/account";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "advTrusteeship",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      openTo:false,
      openBatchTo:false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      accountList: [],
      accountListTo:[],
      portfolioList: [],
      portfolioBatchList:[],
      checkBoxData: [],
      // 查询参数
      queryParams: {
        menuName: undefined,
        visible: undefined
      },
      // 表单参数
      form: {},
      formTo: {},
      formBatchTo:{},
      // 表单校验
      rules: {
        accountId: [
          { required: true, message: "店铺账号不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "托管集合名称不能为空", trigger: "blur" }
        ],
        budget: [
          { required: true, message: "托管集合预算不能为空", trigger: "blur" }
        ]
      },
      rulesTo: {
        id: [
          { required: true, message: "托管集合不能为空", trigger: "blur" }
        ],
      },
      rulesBatchTo: {
        id: [
          { required: true, message: "托管集合不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    allAccount().then((response) => {
      this.accountListTo = response.data;
      if (this.accountListTo.length>0){
        this.queryParams.accountId= this.accountListTo[0].id;
      }
      this.getList();
    });
    this.allAccountList();
  },
  methods: {
    // 选择图标
    selected(name) {
      this.form.icon = name;
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      queryAdvTrusteeshipList(this.queryParams).then(response => {
        this.menuList = this.handleTree(response.data, "id");
        this.loading = false;
      });
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      };
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    cancelTo() {
      this.openTo = false;
    },
    cancelBatchTo(){
      this.openBatchTo = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id:undefined,
        accountId:undefined,
        name: undefined,
        budget: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    selectable(row,rowIndex){
      if (row.parentId==0 || row.parentId==2){
        return false;
      }else {
        return true;
      }
    },
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (this.accountList.length > 0){
        this.form.accountId = this.accountList[0].id;
      }
      this.open = true;
      this.title = "新增";
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = row;
      this.open = true;
      this.title = "修改";
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateAdvTrusteeshipList(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAdvTrusteeshipList(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    submitFormTo: function (){
      if (this.formTo.id == null || this.formTo.id == undefined || this.formTo.id==''){
        this.$modal.msgWarning("请选择广告托管集合");
        return ;
      }
      var pr = {
        id:this.formTo.moveToId,
        parentId:this.formTo.id
      }
      moveToPortfolio(pr).then((response) => {
        this.$modal.msgSuccess("移动成功");
        this.openTo = false;
        this.getList();
      });
    },
    submitFormBatchTo: function (){
      if (this.formBatchTo.id == null || this.formBatchTo.id == undefined || this.formBatchTo.id==''){
        this.$modal.msgWarning("请选择广告托管集合");
        return ;
      }
      var pr = {
        id:this.formBatchTo.id,
        idList:this.checkBoxData
      }
      moveBatchToPortfolio(pr).then((response) => {
        this.$modal.msgSuccess("批量移动成功");
        this.openBatchTo = false;
        this.getList();
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal.confirm('是否确认删除名称为"' + row.name + '"的数据项？').then(function() {
        var pr = {
          id:row.id
        }
        return delAdvTrusteeshipList(pr);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleRemoveCampaign(row) {
      this.$modal.confirm('是否确认从当前集合里移除名称为"' + row.campaignName + '"的广告活动？').then(function() {
        var pr = {
          id:row.id
        }
        return delPortfolioCampaign(pr);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    handleMoveTo(row){
      this.formTo.id=undefined;
      this.formTo.moveToId = row.id;
      var pr = {
        id:row.parentId,
        accountId:row.accountId
      }
      queryThisPortfolioList(pr).then((response) => {
        this.portfolioList = response.data;
        if (this.portfolioList.length > 0){
          this.formTo.id = this.portfolioList[0].id;
        }
        this.openTo = true;
      });
    },
    getSchool(val){
      //解决：el-select下拉框多选，选择后赋值成功，输入框不显示选中的值
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },
    batchMoveTo(){
      if (this.checkBoxData.length < 1){
        this.$modal.msgWarning("请至少选择一条广告活动");
        return ;
      }
      var pr = {
        accountId:this.queryParams.accountId
      }
      queryThisPortfolioList(pr).then((response) => {
        this.portfolioBatchList = response.data;
        if (this.portfolioBatchList.length > 0){
          this.formBatchTo.id = this.portfolioBatchList[0].id;
        }
        this.openBatchTo = true;
      });

    },
    changeCheckBoxValue(val) {
      this.checkBoxData = [];
      val.forEach((column, index) => {
        this.checkBoxData.push(column.id);
      });
    }
  }
};
</script>
