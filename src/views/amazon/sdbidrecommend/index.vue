<template>
  <div class="app-container" style="margin-left: 50px">
    <el-descriptions class="margin-top" title="建议竞价" :column="6" size="">
      <el-descriptions-item label="建议竞价">{{this.bidRecommend.suggested}}</el-descriptions-item>
      <el-descriptions-item label="建议范围">{{this.bidRecommend.rangeStart}}&nbsp;-&nbsp;{{this.bidRecommend.rangeEnd}}
      </el-descriptions-item>
    </el-descriptions>

    <el-form :model="bidRequest" ref="payForm" label-width="100px" style="margin-left: -30px; margin-top: 50px">
      <el-form-item label="ASIN">
        <el-input v-model="bidRequest.asins" placeholder="请输入ASIN，多个英文逗号隔开"></el-input>
      </el-form-item>
      <el-form-item label="费用类型">
        <el-select v-model="bidRequest.costType" placeholder="请选择费用类型"> 
          <el-option key="cpc" label="cpc" value="cpc" />
          <el-option key="vcpm" label="vcpm" value="vcpm" />
        </el-select>
      </el-form-item>
      <el-form-item label="出价方式">
        <el-select v-model="bidRequest.bidOptimization" placeholder="请选择出价方式">
          <el-option key="clicks" label="clicks" value="clicks" />
          <el-option key="conversions" label="conversions" value="conversions" />
          <el-option key="reach" label="reach" value="reach" />
        </el-select>
      </el-form-item>
      <el-form-item label="投放表达式">
        <el-input v-model="bidRequest.targetingClauses" placeholder="请输入表达式"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="suggestBid()">获取建议竞价</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { sdTargetBid } from "@/api/amazon/bidRecommendatios";
export default {
  name: "sdTargetBid",
  components: {},
  data() {
    return {
      //表单信息
      bidRecommend:{
        suggested:null,
        rangeStart:null,
        rangeEnd:null,
      },
      bidRequest: {
        asins: null,
        costType: null,
        bidOptimization: null,
        targetingClauses: null,
      },
      open: false,
    };
  },
  created() {
    
  },
  methods: {
    suggestBid() {
      sdTargetBid(this.bidRequest).then((response) => {
        this.bidRecommend = response.data.recommendations[0].suggestedBid;
      });
    }
  }
};
</script>