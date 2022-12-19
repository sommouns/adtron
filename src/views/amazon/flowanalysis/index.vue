<template>
  <div class="app-container">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="跳入流量" name="inindex">
              <inindex :user="user" />
            </el-tab-pane>
            <el-tab-pane label="跳出流量" name="outindex">
              <outindex :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
  </div>
</template>

<script>
import inindex from "./inindex";
import outindex from "./outindex";
import { getUserProfile } from "@/api/system/user";

export default {
  name: "Profile1",
  components: { inindex, outindex },
  data() {
    return {
      user: {},
      activeTab: "inindex"
    };
  },
  created() {
  },
  methods: {
  }
};
</script>
