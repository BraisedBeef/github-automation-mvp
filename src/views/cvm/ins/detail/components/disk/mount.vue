<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.diskMoount.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <p class="title mb20">
      <span v-html="t('ins.diskMoount.desc', [ins.instanceName, dataDiskLen, residueDataDiskLen])" />
    </p>

    <div class="search-wrap mb20">
      <p class="desc mb20">
        {{ t('ins.diskMoount.searchDesc') }}
      </p>
      <el-input v-model="condition" :placeholder="t('ins.diskMoount.searchPh')">
        <template #suffix>
          <SvgIcon name="dns-search" class="cursor-pointer" @click="listDiskFn" />
        </template>
      </el-input>
    </div>

    <el-table v-loading="loading" :data="diskList" max-height="170px" class="mt20 table">
      <!-- ID/云硬盘名 -->
      <el-table-column min-width="200" :label="t('ins.diskMoount.idName')">
        <template #default="{ row }">
          <el-radio v-model="checkedDiskId" :label="row.id">
            <div class="text-primary pointer mr4">
              {{ row.diskId }}
            </div>
            <div>{{ row.diskName }}</div>
          </el-radio>
        </template>
      </el-table-column>
      <!-- 容量（GiB） -->
      <el-table-column min-width="200" :label="t('ins.diskMoount.size')">
        <template #default="{ row }">
          <div class="df ac">
            <span>{{ row.size || 0 }}</span>
          </div>
        </template>
      </el-table-column>
      <!-- 硬盘属性 -->
      <el-table-column min-width="200" :label="t('ins.diskMoount.diskType')">
        <template #default="{ row }">
          <div>{{ DISK_TYPE_MAP[row.type] }}</div>
        </template>
      </el-table-column>
      <!-- 状态 -->
      <el-table-column min-width="200" :label="t('ins.diskMoount.state')">
        <template #default="{ row }">
          <StatusGroup :dot="false" :list="DISK_STATE_ARR_MAP" :value="row.state" />
        </template>
      </el-table-column>
      <!-- 可用区 -->
      <el-table-column min-width="200" :label="t('ins.diskMoount.zone')">
        <template #default="{ row }">
          <div>{{ row.zoneName }}</div>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _attachDisk } from '@/apis/cvm/disk'
import { useCvmStore } from '@/store'
import { DISK_TYPE_MAP, DISK_STATE_ARR_MAP } from '@/views/cvm/disk/config'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { isMount } from '@/views/cvm/disk/config'

interface PropType {
  ins: any
  dataDiskLen: number
  residueDataDiskLen: number
}

const props = withDefaults(defineProps<PropType>(), {
  ins: {},
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { listDisk, loading } = useDisk()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const checkedDiskId = ref<number>(0) // 硬盘
const condition = ref<string>('') // 查询条件
const diskList = ref<any[]>([]) // 待挂载状态的硬盘列表

const confirmHandle = () => {
  if (!checkedDiskId.value) {
    return message.warning(t('ins.diskMoount.diskWarnning'))
  }
  attachDisk()
}
// 弹窗打开
const open = () => {
  listDiskFn()
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
  checkedDiskId.value = 0
}

// 硬盘列表
const listDiskFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      diskList.value = res.data?.list?.filter(el => isMount(el.type, el.state)) || []
    }
  }
  const params = {
    pageIndex: 1,
    pageSize: 999,
    condition: condition.value,
    regionId: cvmStore.areaSelect.id,
    type: 2, // 数据盘
    zoneId: props.ins.zoneId,
  }

  listDisk(params, cb)
}

// 挂载硬盘
const attachDisk = async () => {
  try {
    comfirmLoading.value = true
    const ids = [checkedDiskId.value]

    const res = await _attachDisk({
      ids, // 硬盘id
      instanceId: props.ins?.id, // 实例id
    })

    console.log(`_attachDisk===>`, res)

    if (res.success) {
      message.success(res.msg)

      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;
}

.search-wrap {
  .desc {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    color: #000;
  }
}
</style>
