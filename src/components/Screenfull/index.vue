<template>
  <div>
    <div
      class="item flex items-center justify-center"
      style="background: #f5f6f8; height: 28px; width: 28px; border-radius: 50%"
      @click="click"
    >
      <svg-icon
        style="height: 12px; width: 12px; display: block"
        :icon-class="isFullscreen ? 'exit-fullscreen' : 'fullscreen'"
        
      />
    </div>
  </div>
</template>

<script>
import screenfull from "screenfull";

export default {
  name: "Screenfull",
  data() {
    return {
      isFullscreen: false,
    };
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.destroy();
  },
  methods: {
    click() {
      if (!screenfull.isEnabled) {
        this.$message({ message: "你的浏览器不支持全屏", type: "warning" });
        return false;
      }
      screenfull.toggle();
    },
    change() {
      this.isFullscreen = screenfull.isFullscreen;
    },
    init() {
      if (screenfull.isEnabled) {
        screenfull.on("change", this.change);
      }
    },
    destroy() {
      if (screenfull.isEnabled) {
        screenfull.off("change", this.change);
      }
    },
  },
};
</script>

<style scoped>
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #5a5e66;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
}
</style>
