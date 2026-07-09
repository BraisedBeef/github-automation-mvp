<template>
  <ListLayout>
    <template #tl>
      <span>{{ t('ins.info.disk') }}</span>
    </template>
    <template #tr>
      <span
        v-if="checkPermission(permMap.ins.EXPAND_DISK_SIZE)"
        class="text-primary cursor-pointer"
        @click="emits('expans')"
        >{{ t('ins.info.expans') }}</span
      >
    </template>

    <template #bm>
      <div v-for="(item, index) in list" :key="index" class="mb10">
        <span class="mr20">{{ DISK_TYPE_MAP[item.type] }}</span
        ><span class="mr20">{{ item.diskName }} </span><span class="mr20">{{ item.size || 0 }}GiB</span>
        <span>{{ item.diskTypeName }}</span>
      </div>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'
import ListLayout from './list-layout.vue'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  list: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  list: () => [],
})

const emits = defineEmits<{
  (event: 'expans'): void
}>()

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)
</script>

<style lang="scss" scoped></style>
