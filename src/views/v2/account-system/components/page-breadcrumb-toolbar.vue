<template>
  <section class="v2-page-breadcrumb-toolbar">
    <div class="v2-page-breadcrumb-toolbar__left">
      <button class="v2-page-breadcrumb-toolbar__nav-btn" type="button" @click="backRoute">
        <SvgIcon name="sub-back" />
      </button>
      <button
        class="v2-page-breadcrumb-toolbar__nav-btn v2-page-breadcrumb-toolbar__nav-btn--forward"
        type="button"
        @click="forwardRoute"
      >
        <SvgIcon name="sub-back" />
      </button>
      <span class="v2-page-breadcrumb-toolbar__divider" />

      <div class="v2-page-breadcrumb-toolbar__crumbs">
        <template v-for="(item, index) in items" :key="`${item}-${index}`">
          <span class="v2-page-breadcrumb-toolbar__crumb" :class="{ 'is-current': index === items.length - 1 }">
            {{ item }}
          </span>
          <SvgIcon v-if="index !== items.length - 1" name="step-arrow" class="v2-page-breadcrumb-toolbar__arrow" />
        </template>
      </div>

      <div v-if="$slots['title-extra']" class="v2-page-breadcrumb-toolbar__title-extra">
        <slot name="title-extra" />
      </div>
    </div>

    <div class="v2-page-breadcrumb-toolbar__right">
      <div v-if="$slots['right']" class="v2-page-breadcrumb-toolbar__right-content">
        <slot name="right" />
      </div>

      <button v-if="showDoc" class="v2-page-breadcrumb-toolbar__doc" type="button" @click="$emit('doc')">
        <SvgIcon name="help-document" />
        <span>{{ docText }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { backRoute, forwardRoute } from '@/utils/router-jump'

withDefaults(
  defineProps<{
    items: string[]
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
.v2-page-breadcrumb-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 0 20px 0 16px;
  background: #fff;
}

.v2-page-breadcrumb-toolbar__left {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.v2-page-breadcrumb-toolbar__nav-btn {
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

.v2-page-breadcrumb-toolbar__nav-btn--forward {
  transform: rotate(180deg);
}

.v2-page-breadcrumb-toolbar__divider {
  width: 1px;
  height: 18px;
  background: #dcdfe6;
}

.v2-page-breadcrumb-toolbar__crumbs {
  display: flex;
  gap: 4px;
  align-items: center;
  min-width: 0;
}

.v2-page-breadcrumb-toolbar__title-extra {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
}

.v2-page-breadcrumb-toolbar__crumb {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;

  &.is-current {
    color: #191c23;
  }
}

.v2-page-breadcrumb-toolbar__arrow {
  width: 4px;
  height: 8px;
  margin: 0 9px;
  color: #828b9c;
}

.v2-page-breadcrumb-toolbar__doc {
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

.v2-page-breadcrumb-toolbar__right {
  display: inline-flex;
  flex-shrink: 0;
  gap: 20px;
  align-items: center;
}

.v2-page-breadcrumb-toolbar__right-content {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

@media (width <= 768px) {
  .v2-page-breadcrumb-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
  }

  .v2-page-breadcrumb-toolbar__left {
    flex-wrap: wrap;
  }

  .v2-page-breadcrumb-toolbar__crumbs {
    flex-wrap: wrap;
  }

  .v2-page-breadcrumb-toolbar__title-extra {
    width: 100%;
  }

  .v2-page-breadcrumb-toolbar__right {
    flex-wrap: wrap;
    width: 100%;
  }
}
</style>
