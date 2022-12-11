<template>
  <div>
    <el-badge class="item" :value="unReadCount >0 ? unReadCount : ''">
      <i class="el-icon-message-solid"  @click="getList()"></i>
    </el-badge>
    <el-dialog
      title="消息列表"
      :visible.sync="open"
      width="1000px"
      append-to-body
    >
      <el-row>
        <el-button
          size="mini"
          type="text"
          icon="el-icon-view"
          @click="readAllMessage()"
          >全部已读</el-button
        >
        <el-button
          size="mini"
          type="text"
          icon="el-icon-circle-plus"
          v-show="hasAdmin"
          @click="notice()"
          v-hasPermi="['system:message:add']"
          >新增公告</el-button
        >
      </el-row>
      <div>
        <el-collapse v-loading="loading" :data="messageList">
          <el-collapse-item
            v-for="(item, index) in messageList"
            :key="index"
            :name="index"
            @click.native="
              readMessage(item.messageId, item.messageStatus, index)
            "
          >
            <template slot="title">
              <div
                v-if="item.messageStatus === 1"
                style="color: red; white-space: pre"
              >
                ●&nbsp;&nbsp;
              </div>
              <div
                v-if="item.messageStatus === 2"
                style="color: gray; white-space: pre"
              >
                ●&nbsp;&nbsp;
              </div>

              <div style="white-space: pre" v-if="item.messageType === 1">
                【余额提醒】
              </div>
              <div style="white-space: pre" v-if="item.messageType === 2">
                【公告提醒】
              </div>

              <div style="white-space: pre">{{ item.header }}</div>
              <div style="color: gray; white-space: pre">
                &nbsp;&nbsp;{{ item.createTime }}
              </div>
            </template>
            <div>{{ item.context }}</div>
          </el-collapse-item>
        </el-collapse>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 添加公告对话框 -->
        <el-dialog
          :title="title"
          :visible.sync="addNotice"
          width="500px"
          append-to-body
        >
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="角色类型">
              <el-checkbox-group v-model="form.roleIds">
                <el-checkbox
                  v-for="item in roleList"
                  :key="item.roleId"
                  :label="item.roleId"
                  >{{ item.roleName }}</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="消息标题" prop="header">
              <el-input v-model="form.header" placeholder="请输入消息标题" />
            </el-form-item>
            <el-form-item label="消息内容" prop="context">
              <el-input type="textarea" v-model="form.context" placeholder="请输入消息内容" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import {
  listMessage,
  getMessage,
  readMessage,
  readAllMessage,
  unReadMessage,
  addNotice,
} from "@/api/system/message";
import { listRole } from "@/api/system/role";

import { getInfo } from "@/api/login";

export default {
  name: "Message",
  dicts: ["message_status"],
  props: {
    user: {
      type: Object,
    },
  },
  data() {
    return {
      websock: null,
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
      // 用户消息提醒表格数据
      messageList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        header: null,
        context: null,
        messageStatus: null,
        readTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户ID不能为空", trigger: "blur" },
        ],
        header: [
          { required: true, message: "消息标题不能为空", trigger: "blur" },
        ],
        context: [
          { required: true, message: "消息内容不能为空", trigger: "blur" },
        ],
        messageStatus: [
          {
            required: true,
            message: "消息状态(1创建 2已读)不能为空",
            trigger: "blur",
          },
        ],
      },
      unReadCount: 0,
      reading: false,
      // 是否显示弹出层
      addNotice: false,
      hasAdmin: this.$auth.hasRole("admin"),
      // 角色表格数据
      roleList: [],
      webSocketNum:1,
      socketUserId:null
    };
  },
  created() {
    getInfo().then((res) => {
      this.socketUserId = res.user.userId;
      this.initWebSocket();
    });
    this.getList();
    this.open = false;
    const data = getInfo();
  },
  destroyed() {
    this.websock.close(); //离开路由之后断开websocket连接
  },
  methods: {
    /** 查询用户消息提醒列表 */
    getList() {
      this.open = true;
      listMessage(this.queryParams).then((response) => {
        this.messageList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getUnreadList() {
      //未读消息改成监听socket事件 不请求接口
      unReadMessage().then((response) => {
        this.unReadCount = response.data;
      });
    },
    /** 查询角色列表 */
    getRoleList() {
      listRole().then((response) => {
        this.roleList = response.rows;
      });
    },
    // 表单重置
    reset() {
      this.form = {
        messageId: null,
        userId: null,
        header: null,
        context: null,
        messageStatus: 0,
        readTime: null,
        roleIds: [1],
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
      this.ids = selection.map((item) => item.messageId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 该状态为已读操作 */
    readMessage(messageId, status, index) {
      this.messageList[index].messageStatus = 2;
      if (1 === status) {
        if (!this.reading) {
          this.reading = true;
          readMessage(messageId);
          this.sleep(500);
          this.reading = false;
        }
      }
    },
    // 选择数据变化
    selchange(data) {
      this.roleIds = data.map((item) => item.roleId);
    },

    /** 全部改为已读状态 */
    readAllMessage() {
      this.$modal
        .confirm("是否确认用户消息全部标记为已读？")
        .then(function () {
          return readAllMessage();
        })
        .then(() => {
          this.getList();
        })
        .catch(() => {});
    },
    initWebSocket() {
      if (this.webSocketNum <=3){
        //初始化weosocket
          this.webSocketNum++;
          const wsuri =
            "wss://www.adtron.info/prod-api/web_socket/user/" +
            this.socketUserId +
            "/" +
            Date.parse(new Date());
          this.websock = new WebSocket(wsuri);
          this.websock.onmessage = this.websocketonmessage;
          this.websock.onopen = this.websocketonopen;
          this.websock.onerror = this.websocketonerror;
          this.websock.onclose = this.websocketclose;
      }

    },
    websocketonopen() {
      //连接建立之后执行send方法发送数据
      this.websock.send("BALANCE");
    },
    websocketonerror() {
      //连接建立失败重连
      this.initWebSocket();
    },
    websocketonmessage(e) {
      //数据接收
      const redata = JSON.parse(e.data);
      console.log("socket接收数据", redata);
      const retype = redata.type;
      if (retype === "BALANCE") {
        this.unReadCount = redata.message;
      }
    },
    websocketsend(Data) {
      //数据发送
      this.websock.send(Data);
    },
    websocketclose(e) {
      //关闭
      console.log("socket断开连接", e);
    },
    sleep(time) {
      var timeStamp = new Date().getTime();
      var endTime = timeStamp + time;
      while (true) {
        if (new Date().getTime() > endTime) {
          return;
        }
      }
    },
    //显示新增公告
    notice() {
      this.reset();
      this.addNotice = true;
      this.title = "新增公告";
      this.getRoleList();
    },
    /** 公告提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          addNotice(this.form).then((response) => {
            this.$modal.msgSuccess("新增成功");
            this.addNotice = false;
            this.reset();
            this.getList();
          });
        }
      });
    },
    // 取消公告按钮
    cancel() {
      this.addNotice = false;
      this.reset();
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-badge__content.is-fixed{
top: 5px !important;
}
</style>
