<template>
  <section class="cvm-ins-disk-v2">
    <div class="cvm-ins-disk-v2__toolbar">
      <div class="cvm-ins-disk-v2__actions">
        <el-button
          v-if="checkPermission(permMap.ins.CREATE_NEW_DISK)"
          type="primary"
          @click="changeShow(createDiskRef)"
        >
          {{ t('ins.disk.add') }}
        </el-button>
        <el-button v-if="checkPermission(permMap.ins.ATTACH_DISK_TO_VM)" @click="changeShow(mountRef)">
          {{ t('ins.disk.mount') }}
        </el-button>
      </div>

      <div class="cvm-ins-disk-v2__desc">
        {{ t('ins.disk.residueDataDiskLen', [residueDataDiskLen]) }}
      </div>
    </div>

    <div class="cvm-ins-disk-v2__list">
      <DiskItem v-for="(item, index) in diskList" :key="index" :disk="item" @success="getDetail" />
    </div>

    <CreateDisk ref="createDiskRef" @success="getDetail" />
    <Mount
      ref="mountRef"
      :ins="detail"
      :data-disk-len="dataDiskLen"
      :residue-data-disk-len="residueDataDiskLen"
      @success="getDetail"
    />
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import DiskItem from './disk-item.vue'
import Mount from '@/views/cvm/ins/detail/components/disk/mount.vue'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import { isDataDisk } from '@/views/cvm/disk/config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {
  detail: () => ({}),
})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const maxLenDataForm = 20
const createDiskRef = ref<InstanceType<typeof CreateDisk>>()
const mountRef = ref<InstanceType<typeof CreateDisk>>()

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const diskList = computed(() => props.detail.diskInfos || [])

const residueDataDiskLen = computed(() => {
  const dataDisk = diskList.value.filter(el => isDataDisk(el.type))
  return maxLenDataForm - dataDisk.length
})

const dataDiskLen = computed(() => {
  const dataDisk = diskList.value.filter(el => isDataDisk(el.type))
  return dataDisk.length
})

const getDetail = () => {
  emits('success')
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}
</script>

<style lang="scss" scoped>
.cvm-ins-disk-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-disk-v2__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: center;
}

.cvm-ins-disk-v2__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.cvm-ins-disk-v2__desc {
  font-size: 14px;
  line-height: 22px;
  color: #667085;
}

.cvm-ins-disk-v2__list {
  display: flex;
  flex-direction: column;
}

@media (width <= 768px) {
  .cvm-ins-disk-v2 {
    padding: 16px;
  }
}
</style>
