<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.mount.title')"
    width="760px"
    :loading="comfirmLoading"
    :confirm-text="t('disk.mount.confirmText')"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <Collapse v-model="isCollapse" :text="t('disk.mount.selectDisk', [diskList.length])">
      <el-table :data="diskList" class="mt20 table" max-height="600px">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('disk.mount.idName')">
          <template #default="{ row }">
            <div class="text-primary text-over">
              {{ row.diskId }}
            </div>
            <div class="text-over">
              {{ row.diskName }}
            </div>
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column min-width="200" :label="t('disk.mount.costType')">
          <template #default="{ row }">
            <span>{{ COST_TYPE_MAP[row.costType] }}</span>
          </template>
        </el-table-column>
        <!-- 创建/到期时间 包年包月 -->
        <el-table-column
          v-if="isTimeCost(props.diskList[0].costType)"
          min-width="220"
          :label="t('disk.mount.time')"
          show-overflow-tooltip
        >
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('disk.mount.time') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="text-over">
              {{ t('disk.mount.createTime', [row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '']) }}
            </div>
            <div class="text-over">
              {{
                t('disk.mount.expiresTime', [row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : ''])
              }}
            </div>
          </template>
        </el-table-column>
        <!-- 创建时间 按量计费 -->
        <el-table-column v-else min-width="220" :label="t('disk.mount.time_create')" show-overflow-tooltip>
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('disk.mount.time_create') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="text-over">
              {{ t('disk.mount.createTime', [row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '']) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <div class="search-wrap mt20">
      <p class="mb10">
        {{ t('disk.mount.searchDesc') }}
      </p>
      <el-input v-model="condition" :placeholder="t('disk.mount.searchPh')">
        <template #suffix>
          <SvgIcon name="dns-search" class="cursor-pointer" @click="diskListInstance" />
        </template>
      </el-input>
    </div>

    <el-table v-loading="loading" :data="insList" class="mt20 table" max-height="600px">
      <!-- ID/实例名 -->
      <el-table-column min-width="200" :label="t('disk.mount.idInsName')">
        <template #default="{ row }">
          <el-radio v-model="checkedInstanceId" :label="row.id" style="height: 100%">
            <div class="text-primary text-over">
              {{ row.insUuid }}
            </div>
            <div class="text-over">
              {{ row.instanceName }}
            </div>
          </el-radio>
        </template>
      </el-table-column>
      <!-- 已挂载/总可挂载 -->
      <el-table-column min-width="200" :label="t('disk.mount.mountedTotalMountable')">
        <template #default="{ row }">
          <div class="df ac">
            <span>{{ row.diskCount || 0 }}/{{ MOUNT_DISK_COUNT_MAX }}</span>
          </div>
        </template>
      </el-table-column>
      <!-- 实例到期时间 -->
      <el-table-column min-width="220" :label="t('disk.mount.expirateTime')" show-overflow-tooltip>
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('disk.mount.expirateTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <div class="table-td_tooltip text-over">
            <span class="mr4">{{ COST_TYPE_MAP[row.costType] }}</span>
            <span>{{ row?.expirationTime ? maoYunDayJs(row?.expirationTime).format(FORMAT_TIME) : '-' }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _diskListInstance } from '@/apis/cvm/ins'
import { _attachDisk } from '@/apis/cvm/disk'
import { MOUNT_DISK_COUNT_MAX, isTimeCost } from '@/views/cvm/disk/config'

interface PropType {
  diskList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  diskList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const insList = ref<any[]>([]) // 实例列表
const isCollapse = ref<boolean>(false) // 是否收起
const checkedInstanceId = ref<number>(0) // 勾选的实例
const condition = ref<string>('') // 查询条件

const tips = computed(() => [
  {
    main: t('disk.mount.tipsMain'),
  },
])

const confirmHandle = () => {
  if (!checkedInstanceId.value) {
    return message.warning(t('disk.mount.insWarning'))
  }

  attachDisk()
}

// 弹窗打开
const open = () => {
  diskListInstance()
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
  checkedInstanceId.value = 0
  isCollapse.value = false
}

// 云硬盘-挂载-获取可挂载服务器列表
const diskListInstance = async () => {
  try {
    loading.value = true

    const regionId = props.diskList[0]?.regionId
    const zoneId = props.diskList[0]?.zoneId
    // console.log(`regionId zoneId==>`, props.diskList[0], regionId, zoneId)

    const res = await _diskListInstance({
      instanceName: '',
      instanceId: condition.value,
      regionId,
      zoneId,
    })

    console.log(`_diskListInstance===>`, res)

    if (res.success) {
      insList.value = res.data || []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 挂载硬盘
const attachDisk = async () => {
  try {
    comfirmLoading.value = true
    const ids = props.diskList.map(el => el.id)

    const res = await _attachDisk({
      ids, // 硬盘id
      instanceId: checkedInstanceId.value, // 实例id
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

<style lang="scss" scoped></style>
