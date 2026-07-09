<template>
  <ListLayout>
    <template #tl>
      <span>{{ t('ins.info.eip') }}</span>
    </template>

    <template #bm>
      <div v-for="(item, index) in list" :key="index" class="mb10 df">
        <span>{{ item.publicIp }}</span>
        <div class="ml10 mr10 line" />
        <span>{{ item.bandwidth }} Mbit/s</span>
      </div>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import ListLayout from './list-layout.vue'
import t from '@/utils/i18n'

interface PropType {
  list: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  list: () => [],
})

const emits = defineEmits<{
  (event: 'expans'): void
}>()
</script>

<style lang="scss" scoped>
.line {
  width: 1px;
  height: 17px;
  background: #ddd;
}
</style>
