<template>
  <div class="editor-wrapper">
    <div class="editor-label">Editor</div>
    <div
      class="editor-content"
      contenteditable="true"
      @input="onEdit"
      ref="editme"
    ></div>
  </div>
</template>

<script>
export default {
  name: "Editor",
  data() {
    return {
      debounce: null,
    };
  },
  emits: ["onEditorChange"],
  methods: {
    onEdit(evt) {
      var src = evt.target.innerHTML;
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => {
        this.$emit("onEditorChange", src);
      }, 300);
    },
  },
};
</script>

<style></style>
