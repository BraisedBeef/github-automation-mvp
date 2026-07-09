<template>
  <ListLayout>
    <template #tl>
      <span>{{ t('ins.info.networkCard') }}</span>
    </template>

    <template #bm>
      <div v-for="(item, index) in list" :key="index" class="mb10 wrap">
        <span class="mr20">{{ NETWORK_TYPE_MAP[item.primaryType] }}</span>
        <span class="mr20">{{ item.vpcInsId }}</span>
        <span>{{ item.mainPrivateIp }}</span>
      </div>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { NETWORK_TYPE_MAP } from '@/views/cvm/ins/config'
import ListLayout from './list-layout.vue'
import t from '@/utils/i18n'

interface PropType {
  list: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  list: () => [],
})
</script>

<style lang="scss" scoped>
.wrap {
  display: inline-block;
  width: 100%;
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
