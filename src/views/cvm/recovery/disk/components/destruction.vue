<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('recovery.disk.destruction.title')"
    width="770px"
    :loading="loading"
    :disabled="!checked"
    :confirm-text="t('recovery.common.submitDestruction')"
    :cancel-text="t('disk.destruction.cancelText')"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('disk.destruction.selectDisk', [diskList.length])">
      <template #default>
        <el-table :data="diskList" class="mt20 table">
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('disk.destruction.idName')">
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
          <el-table-column min-width="200" :label="t('disk.destruction.costType')">
            <template #default="{ row }">
              <span>{{ COST_TYPE_MAP[row.costType] }}</span>
            </template>
          </el-table-column>
          <!-- 创建/到期时间 包年包月 -->
          <el-table-column
            v-if="isTimeCost(props.diskList[0].costType)"
            min-width="220"
            :label="t('disk.destruction.time')"
            show-overflow-tooltip
          >
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('disk.destruction.time') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="text-over">
                {{
                  t('disk.destruction.createTime', [
                    row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '',
                  ])
                }}
              </div>
              <div class="text-over">
                {{
                  t('disk.destruction.expiresTime', [
                    row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '',
                  ])
                }}
              </div>
            </template>
          </el-table-column>
          <!-- 创建时间 按量计费 -->
          <el-table-column v-else min-width="220" :label="t('disk.destruction.time_create')" show-overflow-tooltip>
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('disk.destruction.time_create') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="text-over">
                {{
                  t('disk.destruction.createTime', [
                    row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '',
                  ])
                }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </Collapse>
    <el-checkbox v-model="checked" class="mt20">
      {{ t('recovery.common.releaseCheckboxDesc') }}
    </el-checkbox>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { isTimeCost } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _releaseCBS } from '@/apis/cvm/disk'
import { message } from '@/utils/message'

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
const loading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const checked = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('recovery.disk.destruction.tipsMain'),
    sub: [t('recovery.disk.destruction.tipsSub1')],
  },
])

const confirmHandle = () => {
  release()
}

// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = () => {
  isCollapse.value = false
}

// 释放
const release = async () => {
  loading.value = true

  try {
    const res = await _releaseCBS({
      id: props.diskList[0].id,
    })
    if (res.success) {
      message.success(res.msg)
      emits('success')
      show.value = false
    } else {
      message.warning(res.msg)
    }
  } finally {
    loading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped></style>
