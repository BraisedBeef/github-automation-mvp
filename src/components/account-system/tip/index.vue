<template>
  <OneToOne v-if="type === 'OneToOne'" :text="text" :theme="theme" :hide-margin-bottom="hideMarginBottom" />
  <OneToMany v-if="type === 'OneToMany'" :text="text" :theme="theme" :hide-margin-bottom="hideMarginBottom" />
  <ManyToMany v-if="type === 'ManyToMany'" :text="text" :theme="theme" :hide-margin-bottom="hideMarginBottom" />
</template>

<script setup lang="ts">
import OneToOne from './one-to-one.vue'
import OneToMany from './one-to-many.vue'
import ManyToMany from './many-to-many.vue'
import { ItemType, ThemeType } from './type'

const props = withDefaults(
  defineProps<{
    text: ItemType[]
    type?: 'OneToOne' | 'OneToMany' | 'ManyToMany'
    theme?: ThemeType
    hideMarginBottom?: boolean // 去除底部marge
  }>(),
  {
    text: () => [],
    type: 'OneToOne',
    theme: 'primary',
    hideMarginBottom: false,
  },
)
</script>

<style lang="scss" scoped></style>
