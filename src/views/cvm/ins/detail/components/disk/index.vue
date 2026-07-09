<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <div class="btn-wrap mb20">
      <!-- 新增磁盘 -->
      <el-button v-if="checkPermission(permMap.ins.CREATE_NEW_DISK)" type="primary" @click="changeShow(createDiskRef)">
        {{ t('ins.disk.add') }}
      </el-button>
      <!-- 挂载磁盘 -->
      <el-button v-if="checkPermission(permMap.ins.ATTACH_DISK_TO_VM)" @click="changeShow(mountRef)">
        {{ t('ins.disk.mount') }}
      </el-button>

      <span class="ml20 desc">{{ t('ins.disk.residueDataDiskLen', [residueDataDiskLen]) }}</span>
    </div>
    <DiskItem v-for="(item, index) in diskList" :key="index" :disk="item" @success="getDetail" />

    <CreateDisk ref="createDiskRef" @success="getDetail" />
    <Mount
      ref="mountRef"
      :ins="detail"
      :data-disk-len="dataDiskLen"
      :residue-data-disk-len="residueDataDiskLen"
      @success="getDetail"
    />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import DiskItem from './disk-item.vue'
import Mount from './mount.vue'
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

const bodyStyle = { height: '100%' }
const maxLenDataForm = 20 // 数据盘最大创建个数

const createDiskRef = ref<InstanceType<typeof CreateDisk>>() // 创建硬盘
const mountRef = ref<InstanceType<typeof CreateDisk>>() // 挂载磁盘

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 硬盘
const diskList = computed(() => {
  const diskInfos = props.detail.diskInfos || []
  return diskInfos
})

// 剩余数据盘数量
const residueDataDiskLen = computed(() => {
  const dataDisk = diskList.value.filter(el => isDataDisk(el.type))
  return maxLenDataForm - dataDisk.length
})

// 数据盘数量
const dataDiskLen = computed(() => {
  const dataDisk = diskList.value.filter(el => isDataDisk(el.type))
  return dataDisk.length
})

const getDetail = () => {
  emits('success')
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}
</script>

<style lang="scss" scoped>
.btn-wrap {
  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #555;
  }
}
</style>
