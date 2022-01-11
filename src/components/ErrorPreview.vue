<template>
  <div class="error-wrapper">
    <div class="editor-label">Console</div>
    <a class="clear-console-btn" href="#" @click="clear">Clear console</a>
    <div class="error-content">
      <ul class="header" v-if="isErrorHeaderVisible">
        <li>
          <span class="error-time">Time</span>
          <span class="error-message">Message</span>
          <span class="error-symbol">Symbol</span>
        </li>
      </ul>
      <ul>
        <li v-for="(error, index) in errors" :key="index">
          <span class="error-time">{{ error.time }}</span>
          <span class="error-message">{{ error.errorMessage }}</span>
          <span class="error-symbol">{{ error.symbol }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  name: "ErrorPreview",
  props: {
    errors: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  computed: {
    isErrorHeaderVisible() {
      return this.errors.length > 0;
    },
  },
  methods: {
    ...mapMutations({ clear: "removeAllErrors" }),
  },
};
</script>

<style scoped>
.error-wrapper {
  position: relative;
}
.error-content {
  border: 1px solid rgb(153, 3, 3);
  margin: 50px;
  overflow: auto;
  border-radius: 5px;
  height: 250px;
}
span {
  padding: 3px 5px;
}
ul.header {
  padding: 5px 20px 5px 20px;
}
ul {
  list-style-type: none;
  padding: 5px 20px 20px 20px;
}
li {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.error-time {
  width: 100px;
}
.error-message {
  padding: 3px 5px;
  text-align: left;
  width: 100%;
}
.error-symbol {
  width: 80px;
  text-align: left;
}
.clear-console-btn {
  position: absolute;
  top: 30px;
  left: 125px;
  color: rgb(24, 83, 209);
  text-decoration: none;
  padding: 3px 9px;
  font-size: 12px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.editor-label {
  background-color: red;
}
</style>
