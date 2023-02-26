<template>
  <div class="tab-checkbox flex flex-row">
    <el-button
      v-for="(item, idx) in options"
      :key="idx"
      @click="handleSelect(item)"
      :class="`${
        ((currentSelectedItem && item.label === currentSelectedItem.label) ||
          (multi &&
            currentSelectedItem.some((it) => it.label === item.label))) &&
        'tab-checkbox-btn--active'
      }`"
    >
      {{ item.label }}
    </el-button>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      requred: true,
    },
    value: {
      type: Object | Array,
      required: false,
    },
    multi: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 9999,
    },
  },
  data() {
    return {
      currentSelectedItem: this.value || (multi ? [] : null),
    };
  },
  watch: {
    value(val) {
      this.currentSelectedItem = val;
    },
  },
  methods: {
    handleSelect(item) {
      if (this.multi) {
        if (
          this.currentSelectedItem.some((it) => it.label === item.label) &&
          this.currentSelectedItem.length !== 1
        ) {
          this.currentSelectedItem = this.currentSelectedItem.filter(
            (it) => it.label !== item.label
          );
        } else {
          if (this.currentSelectedItem.length >= this.limit) {
            this.currentSelectedItem.shift();
          }
          this.currentSelectedItem.push(item);
        }
      } else {
        if (this.currentSelectedItem.label === item.label) return;
        this.currentSelectedItem = item;
      }
      this.$emit("change", this.currentSelectedItem);
    },
  },
};
</script>

<style lang="scss" scoped>
.tab-checkbox {
  .el-button {
    padding: 6px 10px;
    border: none;
    outline: none;
  }
  .el-button:focus,
  .el-button:hover {
    color: #606266;
    border-color: transparent;
    background-color: transparent;
  }
  .tab-checkbox-btn--active,
  .tab-checkbox-btn--active.el-button:focus,
  .tab-checkbox-btn--active.el-button:hover {
    color: #e65b05;
    border-color: #e65b05;
    background-color: #fff0e6;
    outline: none;
  }
}
</style>