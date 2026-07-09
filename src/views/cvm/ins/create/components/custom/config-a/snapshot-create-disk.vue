<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.snapshotCreateDisk.title')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <div class="search-wrap">
      <el-input v-model="condition" :placeholder="t('ins.snapshotCreateDisk.idNamePh')">
        <template #suffix>
          <SvgIcon name="dns-search" class="cursor-pointer" @click="getSnapshotListFn" />
        </template>
      </el-input>
    </div>

    <el-table v-loading="loading" :data="snapshotList" max-height="170px" class="mt20 table">
      <!-- ID/快照名 -->
      <el-table-column min-width="200" :label="t('ins.snapshotCreateDisk.idName')">
        <template #default="{ row }">
          <el-radio v-model="checkedSnapshotId" :label="row.id">
            <div class="text-primary pointer" style="line-height: 1">
              {{ row.snapshotId }}
            </div>
            <div style="line-height: 1">
              {{ row.name || '-' }}
            </div>
          </el-radio>
        </template>
      </el-table-column>
      <!-- 大小 -->
      <el-table-column min-width="200" :label="t('ins.snapshotCreateDisk.size')">
        <template #default="{ row }">
          <div class="df ac">
            <span>{{ row.diskSize || 0 }}GiB</span>
          </div>
        </template>
      </el-table-column>
      <!-- 创建时间 -->
      <el-table-column min-width="220" :label="t('ins.snapshotCreateDisk.createTime')">
        <template #header>
          <div class="df ac">
            <span>{{ t('ins.snapshotCreateDisk.createTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <div class="df ac">
            <span>{{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '' }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useSnapshot } from '@/views/cvm/hooks/use-snapshot'

/**
 * @desc 创建硬盘都是数据盘类型
 * @desc 创建实例的硬盘才有系统盘
 */

interface PropType {
  regionId: number
  diskType: number
  diskSize: number
}

const props = withDefaults(defineProps<PropType>(), {
  regionId: 0,
  diskType: 0,
  diskSize: 0,
})
const emits = defineEmits<{
  (event: 'success', p: any): void
}>()

const { getSnapshotList, loading } = useSnapshot()
const { loading: comfirmLoading } = useDisk()

const show = ref<boolean>(false) // 弹窗显示
const checkedSnapshotId = ref<number>(0) // 快照
const condition = ref<string>('') // 查询条件
const snapshotList = ref<any[]>([]) // 快照列表

const confirmHandle = () => {
  if (!checkedSnapshotId.value) {
    return message.warning(t('ins.snapshotCreateDisk.snapshotWarning'))
  }

  const snapshotRes = snapshotList.value.find(el => el.id === checkedSnapshotId.value)

  if (snapshotRes) {
    const snapshotSize = snapshotRes.size || 0
    if (snapshotSize - props.diskSize > 0) {
      message.warning(t('ins.snapshotCreateDisk.snapshotSizeWarning'))
    } else {
      emits('success', snapshotRes)
      show.value = false
    }
  }
}
// 弹窗打开
const open = () => {
  getSnapshotListFn()
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
  checkedSnapshotId.value = 0
}

// 快照列表
const getSnapshotListFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      snapshotList.value = res.data.list || []
    }
  }
  const params = {
    states: [1], // 快照状态 1正常
    regionId: props.regionId,
    pageIndex: 1,
    pageSize: 999,
    diskType: 2,
    diskTypeId: props.diskType, // 硬盘类型id
  }

  getSnapshotList(params, cb)
}
defineExpose({
  show,
})
</script>

<style lang="scss" scoped></style>
