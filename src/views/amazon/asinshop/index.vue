<template>
  <div class="app-container">
    <tree-transfer
      :title="['可关联ASIN', '已关联ASIN']"
      :from_data="fromData"
      :to_data="toData"
      :defaultProps="{ label: 'label' }"
      @add-btn="add"
      @remove-btn="remove"
      height="1000px"
      filter
      openAll
    >
    </tree-transfer>
  </div>
</template>
<style lang="scss">
.el-transfer-panel {
  width: 300px !important;
  height: 450px !important;
}

.el-transfer-panel__list.is-filterable {
  height: 350px !important;
}
</style>
<script>
import {
  listShop,
  listShopNeed,
  delShop,
  addShop,
} from "@/api/amazon/asinshop";

import treeTransfer from "el-tree-transfer";
export default {
  components: { treeTransfer },
  data() {
    return {
      //asin和shopid 增加，删除参数
      updateInnerAsinRequest: [],
      fromData: [],
      toData: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listShop(this.queryParams).then((response) => {
        this.fromData = response.asins;
        this.toData = response.selected;
        this.loading = false;
      });
    },
    // 监听穿梭框组件添加
    add(fromData, toData, obj) {
      console.log("value:", obj);

      this.updateInnerAsinRequest = obj.nodes;
      //增加asin
      addShop(this.updateInnerAsinRequest).then((response) => {
        console.log(response);
      });
    },
    // 监听穿梭框组件移除
    remove(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
      console.log("value:", obj);
      this.updateInnerAsinRequest = obj.nodes;
      delShop(this.updateInnerAsinRequest).then((response) => {
        console.log(response);
      });
    },
  },
};
</script>
