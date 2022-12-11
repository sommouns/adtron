<template>
    <div>
      {{message}}
    </div>
</template>

<script>
import {advertisingAuthCallBack} from "@/api/amazon/account";

export default {
  name: "AdvertisingAuth",
  data() {
    return {
      message: '授权中...........'
    };
  },
  created() {
    this.sendAdvertisingAuthCallBack()
  },
  methods: {
    sendAdvertisingAuthCallBack(){
      //获取浏览器缓存
      let sellerId = localStorage.getItem('sellerId');
      console.log('sellerId: ' + sellerId);

      //截取亚马逊回调参数
      let url = window.location.href;
      console.log("url: " + url);
      let callbackParam = url.substr(url.indexOf("?") + 1);
      console.log("callbackParam: " + callbackParam);
      let param = callbackParam + '&sellerId=' + sellerId;

      //删除浏览器缓存
      // localStorage.removeItem('sellerId');
      advertisingAuthCallBack(param).then(response => {
          this.$modal.msgSuccess("授权成功");
          this.message="授权成功"
          //关闭当前窗口
          // window.location.href="about:blank";
          // window.close();
      }).catch(() => {
        this.$modal.msgError("授权失败, 请重新操作");
        this.message="授权失败, 请重新操作"
      });
    },
  }
};
</script>
