<template>
  <div class="app-container" style="margin-left: 50px">
    <el-descriptions class="margin-top" title="建议竞价" :column="6" size="">
      <el-descriptions-item label="建议竞价">{{this.bidRecommend.recommended}}</el-descriptions-item>
      <el-descriptions-item label="建议范围">{{this.bidRecommend.rangeStart}}&nbsp;-&nbsp;{{this.bidRecommend.rangeEnd}}</el-descriptions-item>
    </el-descriptions>
    
    <el-form
      :model="bidRequest"
      ref="payForm"
      label-width="100px"
      style="margin-left: -30px; margin-top: 50px"
    >
      <el-form-item label="campaignId">
        <el-input v-model="bidRequest.campaignId" placeholder="campaignId"></el-input>
      </el-form-item>
      <el-form-item label="Type">
        <el-input v-model="bidType" placeholder="请输入表达式类型"></el-input>
      </el-form-item>
      <el-form-item label="value">
        <el-input v-model="bidValue" placeholder="请输入表达式值"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="suggestBid()">获取建议竞价</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { sbTargetBid } from "@/api/amazon/sbbidRecommendatios";
export default {
  name: "sbTargetBid",
  components: {},
  data() {
    return {
      //表单信息
      bidRecommend:{
        recommended:null,
        rangeStart:null,
        rangeEnd:null,
      },
      bidType:'',
      bidValue:'',
      bidRequest: {
        campaignId: null,
        expressions: [],
      },
      open: false,
    };
  },
  created() {
    
  },
  methods: {
    suggestBid() {
      if (this.bidRequest.campaignId == undefined) {
        this.$modal.msgError("请输入活动ID");
        return false;
      }
      if (this.bidType.length==0) {
        this.$modal.msgError("请输入表达式类型");
        return false;
      }
      if (this.bidValue.length==0) {
        this.$modal.msgError("请输入表达式值");
        return false;
      }
      this.bidRequest.expressions = [];
      this.bidRequest.expressions.push({type:this.bidType,value:this.bidValue});
      sbTargetBid(this.bidRequest).then((response) => {
        this.bidRecommend = response.data[0].recommendedBid;
      });
    }
  }
};
</script>