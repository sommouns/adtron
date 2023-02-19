<template>
  <div class="app-container" style="margin-left: 50px">
    <el-descriptions class="margin-top" title="用戶信息" :column="6" size="">
      <el-descriptions-item label="用户名称">{{
        user.userName
      }}</el-descriptions-item>
      <el-descriptions-item label="用戶昵称">{{
        user.nickName
      }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions class="margin-top" :column="6" size="">
      <el-descriptions-item label="手机号码">{{
        user.phonenumber
      }}</el-descriptions-item>
      <el-descriptions-item label="账户余额"
        >{{ user.balance }}&nbsp;元</el-descriptions-item
      >
    </el-descriptions>
    <el-form
      :model="order"
      ref="payForm"
      label-width="100px"
      style="margin-left: -30px; margin-top: 50px"
    >
      <el-form-item label="充值金额">
        <el-input-number
          v-model="order.totalFee"
          :min="2000"
          :max="100000"
          :step="100"
          label="充值金额"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="支付方式">
        <el-radio-group v-model="order.payType">
          <el-radio size="medium" border="" label="1">微信支付</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="unifiedOrder()">确认充值</el-button>
      </el-form-item>
    </el-form>

    <!-- 支付二维码 -->
    <el-dialog
      title="扫码支付"
      center
      :visible.sync="open"
      @close="handleQuery()"
      width="450px"
      append-to-body
    >
      <div style="margin-left: 110px" id="qrcode" ref="qrcode"></div>
      <span slot="footer">
        <el-button @click="handleQuery()">我已支付完成</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getUserProfile } from "@/api/system/user";
import { unifiedOrder } from "@/api/amazon/wxpay";
import QRCode from "qrcodejs2";
export default {
  name: "WxPay",
  components: {},
  data() {
    return {
      //登录人信息
      user: {},
      //统一下单信息
      order: {
        body: "账户充值",
        totalFee: "2000",
        payType: "1",
      },
      open: false,
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      getUserProfile().then((response) => {
        this.user = response.data;
      });
    },
    unifiedOrder() {
      if (this.order.totalFee == undefined) {
        this.$modal.msgError("请输入充值金额");
        return false;
      }
      unifiedOrder(this.order).then((response) => {
        this.open = true;
        this.$nextTick(() => {
          var wxcode = new QRCode(this.$refs.qrcode, {
            text: response.data,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
        });
      });
    },
    handleQuery() {
      this.$refs.qrcode.innerHTML = "";
      this.open = false;
      this.getUser();
    },
  },
};
</script>