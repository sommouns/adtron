<template>
  <div>
    ${{ int }}<template v-if="hasDot"
      >.<span class="dot"
        >{{ dot }}
      </span>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    money: {
        type: String,
        required: true,
    },
  },
  computed: {
    int() {
        return this.money.split(".")[0];
    },
    hasDot() {
        return this.money.split(".").length === 2;
    },
    dot() {
        return this.money.split(".").length === 2 ? this.money.split(".")[1] : '';
    }
  }
};
</script>

<style scoped>
.dot {
  font-size: 26px;
}
</style>