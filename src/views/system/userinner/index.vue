<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入手机号码"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="用户状态"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:user:add']"
          >{{ addName }}</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
        :columns="columns"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="users"
      row-key="userId"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column
        label="用户编号"
        width="100"
        align="center"
        key="userId"
        prop="userId"
        v-if="columns[0].visible"
      />
      <el-table-column
        label="用户名称"
        align="center"
        key="userName"
        prop="userName"
        v-if="columns[1].visible"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="用户昵称"
        align="center"
        key="nickName"
        prop="nickName"
        v-if="columns[2].visible"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="用户角色"
        align="center"
        key="roleName"
        prop="roles[0].roleName"
        v-if="columns[3].visible"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="手机号码"
        align="center"
        key="phonenumber"
        prop="phonenumber"
        v-if="columns[4].visible"
        width="120"
      />
      <el-table-column
        label="状态"
        align="center"
        key="status"
        v-if="columns[5].visible"
      >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        v-if="columns[6].visible"
        width="160"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="220"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <div v-if="user.roleId!==6">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-add"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:user:add']"
            v-if="scope.row.roles[0].roleId == 5"
            >添加下级</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-add"
            @click="handleAsin(scope.row)"
            v-hasPermi="['system:asin:add']"
            v-if="scope.row.roles[0].roleId == 6"
            >运营ASIN</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-add"
            @click="queryAsin(scope.row)"
            v-hasPermi="['system:asin:view']"
            v-if="scope.row.roles[0].roleId == 6"
            >查看ASIN</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:user:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:user:remove']"
            >删除</el-button
          >
          <el-dropdown
            size="mini"
            @command="(command) => handleCommand(command, scope.row)"
            v-hasPermi="['system:user:resetPwd', 'system:user:edit']"
          >
            <span class="el-dropdown-link">
              <i class="el-icon-d-arrow-right el-icon--right"></i>更多
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                command="handleResetPwd"
                icon="el-icon-key"
                v-hasPermi="['system:user:resetPwd']"
                >重置密码</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
          </div>
           <div v-else>
             <el-button
              size="mini"
              type="text"
              icon="el-icon-add"
              @click="queryAsin(scope.row)"
              v-hasPermi="['system:asin:view']"
              >查看ASIN</el-button
            >
           </div>
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

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input
                v-model="form.nickName"
                placeholder="请输入用户昵称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                v-model="form.phonenumber"
                placeholder="请输入手机号码"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              label="用户名称"
              prop="userName"
            >
              <el-input
                v-model="form.userName"
                placeholder="请输入用户名称"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              label="用户密码"
              prop="password"
            >
              <el-input
                v-model="form.password"
                placeholder="请输入用户密码"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in dict.type.sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                placeholder="请输入内容"
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

    <!-- 查看用户ASIN -->
    <el-dialog
      title="用户运营ASIN"
      :visible.sync="userAsinOpen"
      width="800px"
      append-to-body
    >
      <el-table :data="userAsins" style="width: 100%">
        <el-table-column prop="shopName" label="店铺名字" width="120">
        </el-table-column>
        <el-table-column prop="asin" label="ASIN" width="120">
        </el-table-column>
        <el-table-column prop="sku" label="SKU" width="120"> </el-table-column>
        <el-table-column prop="title" label="Title"> </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 关联运营ASIN -->
    <el-dialog
      title="设置运营ASIN"
      :visible.sync="asinopen"
      width="850px"
      height="600px"
      append-to-body
    >
        <tree-transfer :title="['可关联ASIN', '已关联ASIN']" :from_data='asins' :to_data='userAsins' :defaultProps="{label:'label'}" @add-btn='add' @remove-btn='remove'  height='540px' filter openAll>
         </tree-transfer>
    </el-dialog>
  </div>
</template>
<style lang="scss">
.el-transfer-panel {
  width: 300px !important;
  height: 450px !important;
}

.el-transfer-panel__list.is-filterable {
  height: 350px !important;
}
</style>
<script>
import {
  getUser,
  delUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
} from "@/api/system/user";
import {
  listinneruser,
  addinneruser,
  getuserasin,
  getselectasin,
  saveasin,
  delasin,
} from "@/api/system/userinner";
import { getUserProfile } from "@/api/system/user";
import treeTransfer from "el-tree-transfer";
export default {
  name: "InnerUser",
  dicts: ["sys_normal_disable", "sys_user_sex"],
  components: {treeTransfer},
  data() {
    return {
      //登录人信息
      user: {},
      //列表用户数据
      users: [],
      //ASIN弹出框操作用户
      operatorId: 0,
      //穿梭框数据
      asins: [],
      //用户asin
      userAsins: [],
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
      // 部门树选项
      roleOptions: undefined,
      // 总条数
      total: 0,
      addName: "",
      parentId: 0,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      asinopen: false,
      userAsinOpen: false,
      initPassword: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
      },
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户名称`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `用户角色`, visible: true },
        { key: 4, label: `手机号码`, visible: true },
        { key: 5, label: `状态`, visible: true },
        { key: 6, label: `创建时间`, visible: true },
      ],
      // 表单参数
      form: {},
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "用户名称长度必须介于 2 和 20 之间",
            trigger: "blur",
          },
        ],
        roleId: [{ required: true, message: "角色不能为空", trigger: "blur" }],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" },
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
          {
            min: 5,
            max: 20,
            message: "用户密码长度必须介于 5 和 20 之间",
            trigger: "blur",
          },
        ],
        email: [
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
      //asin 增加，删除参数
      updateInnerAsinRequest: {
        userId: 0,
        shop:[{
           shopId: 0,
           asin: "",},
        ],
      },

    };
  },
  created() {
    this.getList();
    this.getUser();
    this.getConfigKey("sys.user.initPassword").then((response) => {
      this.initPassword = response.msg;
    });
    if (this.$auth.hasRole("leader-i")) {
      this.addName = "新增内部运营";
    }
  },
  methods: {
    getList() {
      this.loading = true;
      listinneruser(this.queryParams).then((response) => {
        console.log(response.rows);
        this.users = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getUser() {
      getUserProfile().then((response) => {
        this.user = response.data;
        this.roleGroup = response.roleGroup;
        this.postGroup = response.postGroup;
      });
    },
    handleAsin(row) {
      getselectasin(row.userId).then((response) => {
        this.asins = response.asins;
        this.userAsins = response.selected;
        //设置要操作的用户
        this.updateInnerAsinRequest.userId = row.userId;
        this.asinopen = true;
      });
    },
    queryAsin(row) {
      getuserasin(row.userId).then((response) => {
        this.asins = response.asins;
        this.userAsins = response.rows;
        this.userAsinOpen = true;
      });
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.parentId = row ? row.userId : user.userId;
      this.title = "添加用户";
      this.open = true;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const userId = row.userId || this.ids;
      getUser(userId).then((response) => {
        this.form = response.data;
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.form.postIds = response.postIds;
        this.form.roleIds = response.roleIds;
        this.form.roleId = response.roleIds[0];
        this.form.parentId = response.parentId;
        this.open = true;
        this.title = "修改用户";
        this.form.password = "";
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            this.$modal.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => {});
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            this.form.parentId = this.parentId;
            addinneruser(this.form).then((response) => {
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
      const userIds = row.userId || this.ids;
      this.$modal
        .confirm('是否确认删除用户编号为"' + userIds + '"的数据项？')
        .then(function () {
          return delUser(userIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal
        .confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
        .then(function () {
          return changeUserStatus(row.userId, row.status);
        })
        .then(() => {
          this.$modal.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row);
          break;
        case "handleAuthRole":
          this.handleAuthRole(row);
          break;
        default:
          break;
      }
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        roleId: undefined,
        postIds: [],
        roleIds: [],
      };
      this.resetForm("form");
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
            // 监听穿梭框组件添加
      add(fromData,toData,obj){
          console.log("value:", obj);
          this.updateInnerAsinRequest.shop = obj.nodes;
          //增加asin
         saveasin(this.updateInnerAsinRequest).then((response) => {
          console.log(response);
        });
      },
          // 监听穿梭框组件移除
      remove(fromData,toData,obj){
            // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
            // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
                      console.log("value:", obj);
          this.updateInnerAsinRequest.shop = obj.nodes;
          delasin(this.updateInnerAsinRequest).then((response) => {
            console.log(response);
          })
      },
  }
};
</script>
