<template>
  <div class="my-error">
    <SvgIcon name="file-failed" class="file-failed" />
    <div class="error-text">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.my-error {
  display: flex;
  width: max-content;
  max-width: 300px;
  line-height: 1.5;

  :deep(*) {
    font-size: 12px;
    line-height: 1.5 !important;
  }

  .file-failed {
    height: 18px;
    margin-right: 4px;
    font-size: 16px;
  }

  .error-text {
    word-break: break-all;
  }
}
</style>
