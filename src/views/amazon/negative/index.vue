<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
     <el-form-item label="账号" prop="shopId">
        <el-select
          v-model="queryParams.shopId"
          placeholder="请选择账号"
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
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入活动集合名称"
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
          v-hasPermi="['negative:campaign:shop:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="shopList" @selection-change="handleSelectionChange">
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="店铺名字" align="center" prop="shopName" />
      <el-table-column label="活动集合名称" align="center" prop="name" />
      <el-form-item label="类型">
          <el-select v-model="form.type"  size="small" >
            <el-option  v-for="item in typeList" :key="item.value" :label="item.label"
                        :value="item.value"/>
          </el-select>
        </el-form-item>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['negative:campaign:shop:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['negative:campaign:shop:remove']"
          >删除</el-button>
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

    <!-- 添加或修改否定搜索词关联活动和店铺对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="账号" prop="shopId">
        <el-select
          v-model="form.shopId"
          placeholder="请选择账号"
          clearable
          @change="getMenuTreeselect"
        >
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :label="item.accountName + '-' + item.site"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
       <el-form-item label="类型" prop="type">
          <el-select v-model="form.type"  size="small" >
            <el-option  v-for="item in typeList" :key="item.value" :label="item.label"
                        :value="item.value"/>
          </el-select>
        </el-form-item>
          <el-form-item label="活动id">
          <el-checkbox  @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
          <el-input
            placeholder="输入关键字进行过滤"
            v-model="filterText">
        </el-input>
          <el-tree
            ref="tree"
            class="tree-border"
            :data="menuOptions"
            :default-checked-keys="selectList"
            show-checkbox
            :filter-node-method="filterNode"
            node-key="campaignId"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>

        <el-form-item label="核心词" prop="coreText">
          <el-input v-model="form.coreText" type="textarea" :rows="10" placeholder="请输入核心词,多个换行隔开，最多输入100个"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" >
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listShop, getShop, delShop, addShop, updateShop,getCampaigns } from "@/api/amazon/negativeCampaignShop";
import { allAccount } from "@/api/amazon/account";

export default {
  name: "Shop",
  data() {
    return {
      filterText: '',
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
      // 否定搜索词关联活动和店铺表格数据
      shopList: [],
      accountList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        shopId: undefined,
        campaigns: null,
        name: null
      },
      selectList: [],
           // 菜单列表
      menuOptions: [],
      // 表单参数
      form: {},
        defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        campaigns: [
          { required: true, message: "活动id(多个逗号隔开)不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "活动集合名称不能为空", trigger: "blur" }
        ]
      },
      typeList:[
        {value:1,label:'否定搜索词'},
        {value:2,label:'暂停关键字'},
      ],
    };
  },
  created() {
    this.allAccountList();
    this.getList();
  },

   watch: {
      filterText(val) {
        this.$refs.tree.filter(val);
      }
    },
    
  methods: {
     filterNode(value, data) {
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
    },
    allAccountList() {
      allAccount().then((response) => {
        this.accountList = response.data;
      });
    },
    /** 查询否定搜索词关联活动和店铺列表 */
    getList() {
      this.loading = true;
      listShop(this.queryParams).then(response => {
        this.shopList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.menuOptions=[];
      this.s
      this.form = {
        id: null,
        shopId: null,
        campaigns: null,
        campaignList: [],
        name: null,
        type: null
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加否定搜索词关联活动和店铺";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getShop(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.detail = true;
        this.menuOptions = response.data.campaignsLabelResponseList;
        this.selectList = response.data.campaignList;
        this.title = "修改否定搜索词关联活动和店铺";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          var root=this.getMenuAllCheckedKeys();
          this.form.campaignList=root;
          if (this.form.id != null) {
            updateShop(this.form).then(response => {
              this.getMenuAllCheckedKeys();
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addShop(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除否定搜索词关联活动和店铺编号为"' + ids + '"的数据项？').then(function() {
        return delShop(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
          // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value) {
      if(value){
        var arr=[];
        this.menuOptions.forEach(item=>item.children.forEach(c=>{
         arr.push(c.campaignId);
        }));
         this.selectList=arr;
      }else{
          this.$refs.tree.setCheckedNodes([]);
      }
    },

    // 查询菜单树结构
    getMenuTreeselect() {
      this.menuOptions=[];
      getCampaigns(this.form.shopId).then(response => {
        this.menuOptions = response.data;
      });
    },
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
  }
};
</script>
