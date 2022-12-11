<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="代理商" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入代理商"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input
          v-model="queryParams.contactName"
          placeholder="请输入联系人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input
          v-model="queryParams.contactPhone"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
          v-hasPermi="['system:agent:add']"
        >新增</el-button>
      </el-col>
      <div class="qrcode" ref="qrCodeUrl"></div>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="agentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="代理商" align="center" prop="name" />
      <el-table-column label="联系人" align="center" prop="contactName" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="联系电话" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:agent:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:agent:remove']"
          >删除</el-button>
          <el-button
            class="copy-code-button"
            size="mini"
            type="text"
            icon="el-icon-link"
            @click="copy($event,scope.row)"
          >复制链接</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-connection"
            @click="qrCodeOpen(scope.row)"
          >查看二维码</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-check"
            @click="getUserList(scope.row)"
            v-hasPermi="['system:user:list']"
          >邀请用户列表</el-button>
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

    <!-- 添加或修改代理商对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="代理商" prop="name">
          <el-input v-model="form.name" placeholder="请输入代理商" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="qrOpen" width="500px" append-to-body   @close="closeQr()">
      <div style="margin-left: 130px;margin-bottom: 20px" id="qrcode" ref="qrcode"></div>
    </el-dialog>

    <el-dialog :title="title"  :visible.sync="userOpen" width="1000px" append-to-body @close="closeUser()" >
      <el-table :data="userList">
            <el-table-column label="用户名称" align="center" prop="userName" />
            <el-table-column label="用户昵称" align="center" prop="nickName" />
            <el-table-column label="手机号码" align="center" prop="phonenumber" />
       </el-table>

       <pagination
         v-show="userTotal>0"
         :total="userTotal"
         :page.sync="queryUserParams.pageNum"
         :limit.sync="queryUserParams.pageSize"
         @pagination="getUserList"
       />
    </el-dialog>


  </div>
</template>

<script>
import {
  listAgent,
  getAgent,
  delAgent,
  addAgent,
  updateAgent,
} from "@/api/system/agent";
import { listInviteUser } from "@/api/system/user";
import Clipboard from "clipboard";
import QRCode from "qrcodejs2";

export default {
  name: "Agent",
  data() {
    return {
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
      // 代理商表格数据
      agentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //是否显示二维码弹出层
      qrOpen: false,
      //是否显示用户邀请列表弹出层
      userOpen: false,

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        englishName: null,
        contactName: null,
        contactPhone: null,
        invitationCode: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [{ required: true, message: "代理商不能为空", trigger: "blur" }],
        contactName: [
          { required: true, message: "联系人不能为空", trigger: "blur" },
        ],
        contactPhone: [
          { required: true, message: "联系电话不能为空", trigger: "blur" },
        ],
        invitationCode: [
          { required: true, message: "邀请码不能为空", trigger: "blur" },
        ],
      },
      //邀请的访问链接
      startUrl: "https://www.adtron.info/register?regcode=",
      //邀请用户的列表
      userList: [],
      //查询用户的参数
      queryUserParams: {
        pageNum: 1,
        pageSize: 10,
        regcode: null,
      },
      //邀请用户查询数量
      userTotal: 0,
    };
  },
  created() {
    this.getList();
  },

  methods: {
    /** 查询代理商列表 */
    getList() {
      this.loading = true;
      listAgent(this.queryParams).then((response) => {
        this.agentList = response.rows;
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
      this.form = {
        agentId: null,
        name: null,
        englishName: null,
        contactName: null,
        contactPhone: null,
        remark: null,
        invitationCode: null,
        delFlag: null,
        createTime: null,
        updateTime: null,
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
      this.ids = selection.map((item) => item.agentId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加代理商";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const agentId = row.agentId || this.ids;
      getAgent(agentId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改代理商";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.agentId != null) {
            updateAgent(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAgent(this.form).then((response) => {
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
      const agentIds = row.agentId || this.ids;
      this.$modal
        .confirm('是否确认删除代理商编号为"' + agentIds + '"的数据项？')
        .then(function () {
          return delAgent(agentIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    copy(e, row) {
      const text = this.startUrl + row.invitationCode;
      const clipboard = new Clipboard(e.target, { text: () => text });
      clipboard.on("success", (e) => {
        this.$modal.msgSuccess("复制成功");
        Toast("复制成功");
        // 释放内存
        clipboard.off("error");
        clipboard.off("success");
        clipboard.destroy();
      });
      clipboard.on("error", (e) => {
        this.$modal.msgError("复制失败");
        // 不支持复制
        Toast("手机权限不支持复制功能");
        // 释放内存
        clipboard.off("error");
        clipboard.off("success");
        clipboard.destroy();
      });
      clipboard.onClick(e);
    },
    qrCodeOpen(row) {
      const qrtext = this.startUrl + row.invitationCode;
      this.qrOpen = true;
      console.log(qrtext);
      this.title = "分享二维码";
      this.$nextTick(() => {
        var wxcode = new QRCode(this.$refs.qrcode, {
          text: qrtext,
          width: 200,
          height: 200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
        });
      });
    },
    closeQr() {
      this.$refs.qrcode.innerHTML = "";
      this.qrOpen = false;
    },
    getUserList(row) {
      this.userOpen = true;
      if (row.invitationCode !== undefined) {
        this.queryUserParams.regcode = row.invitationCode;
      }
      this.title = "用户列表";
      listInviteUser(this.queryUserParams).then((response) => {
        this.userList = response.rows;
        this.userTotal = response.total;
      });
    },
    closeUser() {
      this.userOpen = false;
      this.userList = [];
      this.queryUserParams.regcode = null;
      this.queryUserParams.pageNum = 1;
    },
  },
};
</script>
