<template>
  <div class="app-container">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="广告组" name="adgroup">
              <adgroup :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="广告位" name="placement">
              <placement :campaignId="campaignId" />
            </el-tab-pane>
              <el-tab-pane label="广告活动否定搜索词" name="campaignnegativekeyword">
              <campaignnegativekeyword :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="广告" name="adproduct">
              <adproduct :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="关键词" name="keyword">
              <keyword :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="搜索词" name="searchKeyword">
              <searchKeyword :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="投放" name="target">
              <target :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="否定关键词" name="negativeKeyword">
              <negativeKeyword :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="分时调价" name="campaignTimeUpdatePrice">
              <campaignTimeUpdatePrice :campaignId="campaignId" />
            </el-tab-pane>
            <el-tab-pane label="预算使用情况" name="campaignBudgetUsage">
              <campaignBudgetUsage :campaignId="campaignId" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
  </div>
</template>

<script>
import adgroup from "./adgroup";
import placement from "./placement";
import campaignnegativekeyword from "./campaignnegativekeyword";
import adproduct from "./adproduct";
import keyword from "./keyword";
import searchKeyword from "./searchKeyword";
import target from "./target";
import negativeKeyword from "./negativeKeyword";
import campaignTimeUpdatePrice from "@/views/amazon/advCampaignInfo/campaignTimeUpdatePrice";
import campaignBudgetUsage from "@/views/amazon/advCampaignInfo/campaignBudgetUsage";

export default {
  name: "CampaignInfo",
  components: { adgroup, placement,campaignnegativekeyword ,adproduct, keyword ,searchKeyword ,target ,negativeKeyword ,campaignTimeUpdatePrice,campaignBudgetUsage },
  data() {
    return {
      campaignId: null,
      adGroupId:null,
      activeTab: "adgroup"
    };
  },
  created() {
    this.campaignId = this.$route.params && this.$route.params.campaignId;
  },
  methods: {
  }
};
</script>
