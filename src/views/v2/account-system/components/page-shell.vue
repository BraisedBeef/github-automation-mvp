<template>
  <section class="v2-account-page-shell">
    <div class="v2-account-page-shell__inner">
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.v2-account-page-shell {
  display: f··lex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100dvh - 56px);
}

.v2-account-page-shell__inner {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  padding: 16px;
  background: #f2f4f7;
}
</style>
