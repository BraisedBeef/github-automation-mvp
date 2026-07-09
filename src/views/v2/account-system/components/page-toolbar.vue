<template>
  <section class="v2-page-toolbar">
    <div class="v2-page-toolbar__left">
      <button class="v2-page-toolbar__nav-btn" type="button" @click="backRoute">
        <SvgIcon name="sub-back" />
      </button>
      <button class="v2-page-toolbar__nav-btn v2-page-toolbar__nav-btn--forward" type="button" @click="forwardRoute">
        <SvgIcon name="sub-back" />
      </button>
      <span class="v2-page-toolbar__divider" />
      <span class="v2-page-toolbar__title">{{ title }}</span>
    </div>
    <button v-if="showDoc" class="v2-page-toolbar__doc" type="button" @click="$emit('doc')">
      <SvgIcon name="help-document" />
      <span>{{ docText }}</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { backRoute, forwardRoute } from '@/utils/router-jump'

withDefaults(
  defineProps<{
    title: string
    docText?: string
    showDoc?: boolean
  }>(),
  {
    docText: () => t('common.docHelper'),
    showDoc: true,
  },
)

defineEmits<{
  (event: 'doc'): void
}>()
</script>

<style scoped lang="scss">
.v2-page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0 20px 0 16px;
  background: #fff;
}

.v2-page-toolbar__left {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.v2-page-toolbar__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: #b7c0cd;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: #06f;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.v2-page-toolbar__nav-btn--forward {
  transform: rotate(180deg);
}

.v2-page-toolbar__divider {
  width: 1px;
  height: 18px;
  background: #dcdfe6;
}

.v2-page-toolbar__title {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.v2-page-toolbar__doc {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: #06f;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

@media (width <= 768px) {
  .v2-page-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
  }

  .v2-page-toolbar__left {
    flex-wrap: wrap;
  }
}
</style>
