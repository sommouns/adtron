<template>
  <div class="register">
    <el-form
      ref="registerForm"
      :model="registerForm"
      :rules="registerRules"
      class="register-form"
    >
      <h3 class="title">AdTron亚马逊广告投放系统</h3>
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
        >
          <svg-icon
            slot="prefix"
            icon-class="user"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon
            slot="prefix"
            icon-class="password"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon
            slot="prefix"
            icon-class="password"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <el-form-item prop="phonenumber">
        <el-input
          v-model="registerForm.phonenumber"
          type="text"
          auto-complete="off"
          placeholder="手机号"
        >
          <svg-icon
            slot="prefix"
            icon-class="phone"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon
            slot="prefix"
            icon-class="validCode"
            class="el-input__icon input-icon"
          />
        </el-input>
        <div class="register-code">
          <el-button
            @click="getSmsCode(registerForm.phonenumber)"
            v-show="showCode"
            class="register-code-img"
            >获取验证码
          </el-button>
          <el-button v-show="!showCode" class="register-code-img">
            {{ count }}S后重发
          </el-button>
        </div>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          style="width: 100%"
          @click.native.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right">
          <router-link class="link-type" :to="'/login'"
            >使用已有账户登录</router-link
          >
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <a
        href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=34019202001683"
        target="_blank"
        >皖公网安备号34019202001683</a
      >
      &nbsp;&nbsp;
      <a href="https://beian.miit.gov.cn/" target="_blank"
        >皖ICP备2021012962号</a
      >
      &nbsp;&nbsp; Copyright &copy; 2022 adtron.info
    </div>

    <!-- 验证码弹窗 -->

    <el-dialog
      title="请输入验证码"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="25%"
    >
      <el-form
        ref="smsCodeForm"
        :model="smsCodeForm"
        :rules="smsCodeRules"
        class="register-form"
      >
        <el-form-item prop="code" v-if="captchaOnOff">
          <el-input
            v-model="smsCodeForm.code"
            auto-complete="off"
            placeholder="验证码"
            style="width: 65%"
          >
            <svg-icon
              slot="prefix"
              icon-class="validCode"
              class="el-input__icon input-icon"
            />
          </el-input>
          <div class="register-code">
            <img :src="codeUrl" @click="getCode" class="register-code-img" />
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">取 消</el-button>
        <el-button size="mini" type="primary" @click="handleSmsCode"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getSMSCode, register, getCodeImg } from "@/api/login";

export default {
  name: "Register",
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.registerForm.password !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      codeUrl: "",
      registerForm: {
        username: "",
        password: "",
        confirmPassword: "",
        phonenumber: "",
        regcode: "",
        code: "",
        uuid: "",
      },
      registerRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" },
          {
            min: 2,
            max: 20,
            message: "用户账号长度必须介于 2 和 20 之间",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" },
          {
            min: 5,
            max: 20,
            message: "用户密码长度必须介于 5 和 20 之间",
            trigger: "blur",
          },
        ],
        confirmPassword: [
          { required: true, trigger: "blur", message: "请再次输入您的密码" },
          { required: true, validator: equalToPassword, trigger: "blur" },
        ],
        phonenumber: [
          { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },

      smsCodeForm: {
        phonenumber: "",
        code: "",
        uuid: "",
      },

      smsCodeRules: {
        code: [{ required: true, trigger: "change", message: "请输入验证码" }],
      },

      loading: false,
      captchaOnOff: false,
      showCode: true,
      count: "",
      timer: null,
      dialogVisible: false,
    };
  },
  created() {},
  watch: {
    $route: {
      handler: function (route) {
        this.registerForm.regcode = route.query && route.query.regcode;
      },
      immediate: true,
    },
  },
  methods: {
    getCode() {
      getCodeImg().then((res) => {
        this.captchaOnOff =
          res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.smsCodeForm.uuid = res.uuid;
        }
      });
    },

    handleRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          register(this.registerForm)
            .then((res) => {
              const username = this.registerForm.username;
              this.$alert(
                "<font color='red'>恭喜你，您的账号 " +
                  username +
                  " 注册成功！</font>",
                "系统提示",
                {
                  dangerouslyUseHTMLString: true,
                  type: "success",
                }
              )
                .then(() => {
                  this.$router.push("/login");
                })
                .catch(() => {});
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },

    handleSmsCode() {
      this.$refs.smsCodeForm.validate((valid) => {
        if (valid) {
          getSMSCode(this.smsCodeForm)
            .then((res) => {
              if (res.code === 200) {
                this.registerForm.uuid = res.msg;
                this.dialogVisible = false;
                this.$modal.msgSuccess("短信已发送，请查收.");
                const TIME_COUNT = 60;
                if (!this.timer) {
                  this.count = TIME_COUNT;
                  this.showCode = false;
                  this.timer = setInterval(() => {
                    if (this.count > 0 && this.count <= TIME_COUNT) {
                      this.count--;
                    } else {
                      this.showCode = true;
                      clearInterval(this.timer);
                      this.timer = null;
                    }
                  }, 1000);
                }
              }
            })
            .catch(() => {
              if (this.captchaOnOff) {
                this.getCode();
              }
            });
        }
      });
    },

    getSmsCode(phonenumber) {
      var pattern = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
      if (phonenumber == "") {
        this.$modal.msgError("请输入手机号");
      } else if (!pattern.test(phonenumber)) {
        this.$modal.msgError("请输入正确的手机号码");
      } else {
        this.resetForm("smsCodeForm");
        this.smsCodeForm.phonenumber = phonenumber;
        // this.getCode()
        // this.dialogVisible = true
        getSMSCode(this.smsCodeForm)
          .then((res) => {
            if (res.code === 200) {
              this.registerForm.uuid = res.msg;
              this.dialogVisible = false;
              this.$modal.msgSuccess("短信已发送，请查收.");
              const TIME_COUNT = 60;
              if (!this.timer) {
                this.count = TIME_COUNT;
                this.showCode = false;
                this.timer = setInterval(() => {
                  if (this.count > 0 && this.count <= TIME_COUNT) {
                    this.count--;
                  } else {
                    this.showCode = true;
                    clearInterval(this.timer);
                    this.timer = null;
                  }
                }, 1000);
              }
            }
          })
          .catch(() => {
            if (this.captchaOnOff) {
              this.getCode();
            }
          });
      }
    },

    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },

    // 取消按钮
    cancel() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 38px;

    input {
      height: 38px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.register-code {
  width: 33%;
  height: 38px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.register-code-img {
  height: 38px;
}
</style>
