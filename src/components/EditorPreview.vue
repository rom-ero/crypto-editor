<template>
  <div class="editor-wrapper">
    <div class="editor-label">Preview</div>
    <div class="editor-content" v-html="text"></div>
  </div>
</template>

<script>
export default {
  name: "EditorPreview",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
};
</script>
<style scoped>
.editor-label {
  background-color: green;
}
</style>
