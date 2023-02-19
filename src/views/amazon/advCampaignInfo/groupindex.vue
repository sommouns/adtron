<template>
  <div class="app-container">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="广告" name="adproduct">
              <adproduct :adGroupId="adGroupId" />
            </el-tab-pane>
            <el-tab-pane label="关键词" name="keyword">
              <keyword :adGroupId="adGroupId" />
            </el-tab-pane>
            <el-tab-pane label="表达式" name="target">
              <target :adGroupId="adGroupId" />
            </el-tab-pane>
            <el-tab-pane label="否定关键词" name="negativeKeyword">
              <negativeKeyword :adGroupId="adGroupId" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
  </div>
</template>

<script>
import adproduct from "./adproduct";
import keyword from "./keyword";
import target from "./target";
import negativeKeyword from "./negativeKeyword";

export default {
  name: "AdGroupInfo",
  components: { adproduct, keyword , target , negativeKeyword },
  data() {
    return {
      adGroupId: null,
      activeTab: "adproduct"
    };
  },
  created() {
    this.adGroupId = this.$route.params && this.$route.params.adGroupId;
  },
  methods: {
  }
};
</script>
