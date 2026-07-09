<template>
  <div class="bill-download-v2">
    <section class="bill-download-v2__topbar">
      <PageBreadcrumbToolbar :items="[t('download.download')]" @doc="openHelpDoc" />

      <div class="bill-download-v2__tabs">
        <button
          v-for="item in tabs"
          :key="item.value"
          class="bill-download-v2__tab"
          :class="{ 'is-active': active === item.value }"
          type="button"
          @click="active = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <div class="bill-download-v2__notice">
      <SvgIcon name="tip-info" class="bill-download-v2__notice-icon" />
      <span>{{ activeTab.tip }}</span>
    </div>

    <section class="bill-download-v2__card">
      <div class="bill-download-v2__body">
        <div class="bill-download-v2__field">
          <label class="bill-download-v2__label">{{ t('download.billPeriod') }}</label>
          <el-date-picker
            v-model="activeDateRange"
            class="bill-download-v2__date-picker"
            type="monthrange"
            start-placeholder=""
            end-placeholder=""
            :shortcuts="activeTab.shortcuts"
            :range-separator="t('export.to')"
            :clearable="false"
            :disabled-date="activeTab.disabledDate"
            value-format="YYYY-MM"
          />
        </div>

        <div class="bill-download-v2__field">
          <label class="bill-download-v2__label">{{ t('download.account') }}</label>
          <span class="bill-download-v2__value">{{ user.userName || user.email || '-' }}</span>
        </div>
      </div>

      <div class="bill-download-v2__footer">
        <el-button type="primary" class="bill-download-v2__button" :loading="loading" @click="generateBillFile">
          {{ t('export.download') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { _generateBillFile } from '@/apis/cost-center/expense-bill'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'
import { FORMAT_MONTH_NO_UTC, ManipulateType, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'

const generateBillFilePermission = usePermission('feeApi:generateBillFile')
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const getDefaultDateTime = (isL0: boolean) => {
  if (isL0) {
    const now = maoYunDayJs().subtract(1, 'month')
    return [now.format(FORMAT_MONTH_NO_UTC), now.format(FORMAT_MONTH_NO_UTC)]
  }

  const now = maoYunDayJs()
  return [now.format(FORMAT_MONTH_NO_UTC), now.format(FORMAT_MONTH_NO_UTC)]
}

const getDateTime = (value: number, unit: ManipulateType, isL0: boolean) => {
  if (isL0) {
    const end = maoYunDayJs().subtract(1, 'month')
    const start = end.subtract(value, unit)
    return [start.format(FORMAT_MONTH_NO_UTC), end.format(FORMAT_MONTH_NO_UTC)]
  }

  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_MONTH_NO_UTC), end.format(FORMAT_MONTH_NO_UTC)]
}

const shortcutsL0 = [
  {
    text: t('download.oneMonth'),
    value: () => getDateTime(1, 'month', true),
  },
  {
    text: t('download.threeMonth'),
    value: () => getDateTime(3, 'month', true),
  },
  {
    text: t('download.sixMonth'),
    value: () => getDateTime(6, 'month', true),
  },
]

const shortcutsCommon = [
  {
    text: t('download.oneMonth'),
    value: () => getDateTime(1, 'month', false),
  },
  {
    text: t('download.threeMonth'),
    value: () => getDateTime(3, 'month', false),
  },
  {
    text: t('download.sixMonth'),
    value: () => getDateTime(6, 'month', false),
  },
]

const disabledMonthL0 = (time: Date) => {
  const currentDate = maoYunDayJs().subtract(1, 'month')
  const selectedDate = maoYunDayJs(time)
  return currentDate.valueOf() < selectedDate.valueOf()
}

const disabledMonthCommon = (time: Date) => {
  const currentDate = maoYunDayJs()
  const selectedDate = maoYunDayJs(time)
  return currentDate.valueOf() < selectedDate.valueOf()
}

const loading = ref(false)
const active = ref(1)
const dateRangeMap = reactive<Record<number, string[]>>({
  1: getDefaultDateTime(true),
  2: getDefaultDateTime(false),
  3: getDefaultDateTime(false),
  4: getDefaultDateTime(false),
})

const tabs = computed(() => [
  {
    label: t('download.L0'),
    value: 1,
    tip: t('download.L0Tip'),
    shortcuts: shortcutsL0,
    disabledDate: disabledMonthL0,
  },
  {
    label: t('download.L1'),
    value: 2,
    tip: t('download.L1Tip'),
    shortcuts: shortcutsCommon,
    disabledDate: disabledMonthCommon,
  },
  {
    label: t('download.L2'),
    value: 3,
    tip: t('download.L2Tip'),
    shortcuts: shortcutsCommon,
    disabledDate: disabledMonthCommon,
  },
  {
    label: t('download.L3'),
    value: 4,
    tip: t('download.L3Tip'),
    shortcuts: shortcutsCommon,
    disabledDate: disabledMonthCommon,
  },
])

const activeTab = computed(() => tabs.value.find(item => item.value === active.value) || tabs.value[0])

const activeDateRange = computed({
  get: () => dateRangeMap[active.value],
  set: value => {
    dateRangeMap[active.value] = value
  },
})

const generateBillFile = async () => {
  if (!generateBillFilePermission.checkPermissionRes) {
    generateBillFilePermission.dialog({
      show: true,
      i18nKey: 'download.downloadPerm',
    })
    return
  }

  try {
    loading.value = true

    let startTime = ''
    let endTime = ''

    if (active.value === 1) {
      startTime = dateRangeMap[1][0]
      endTime = dateRangeMap[1][1]
    }
    if (active.value === 2) {
      startTime = dateRangeMap[2][0]
      endTime = dateRangeMap[2][1]
    }
    if (active.value === 3) {
      startTime = dateRangeMap[3][0]
      endTime = dateRangeMap[3][1]
    }
    if (active.value === 4) {
      startTime = dateRangeMap[4][0]
      endTime = dateRangeMap[4][1]
    }

    const params = {
      startTime,
      endTime,
      fileType: active.value,
    }

    const res = await _generateBillFile(params)

    if (res.success) {
      pushRoute({
        name: 'export',
        query: {
          type: active.value,
        },
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}
</script>

<style scoped lang="scss">
.bill-download-v2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: calc(100dvh - 140px);
  background: #f2f4f7;
}

.bill-download-v2__topbar {
  background: #fff;
}

.bill-download-v2__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  padding: 0 20px;
}

.bill-download-v2__tab {
  position: relative;
  padding: 10px 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    content: '';
    background: transparent;
  }

  &.is-active {
    font-weight: 500;
    color: #06f;

    &::after {
      background: #06f;
    }
  }
}

.bill-download-v2__notice {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: rgb(0 102 255 / 16%);
}

.bill-download-v2__notice-icon {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
}

.bill-download-v2__card {
  display: flex;
  flex-direction: column;
  background: #fff;
}

.bill-download-v2__body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.bill-download-v2__field {
  display: flex;
  gap: 16px;
  align-items: center;
  min-height: 34px;
}

.bill-download-v2__label {
  flex: 0 0 56px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  text-align: right;
}

.bill-download-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.bill-download-v2__footer {
  display: flex;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #e8ecf3;
}

.bill-download-v2__button {
  min-width: 76px;
}

.bill-download-v2__date-picker {
  flex: 0 0 240px;
  width: 240px;
  max-width: 240px;
}

:deep(.bill-download-v2__date-picker .el-range-input) {
  font-size: 14px;
  color: #191c23;
}

:deep(.bill-download-v2__date-picker.el-date-editor) {
  width: 240px;
  max-width: 240px;

  --el-date-editor-width: 240px;
}

@media (width <= 768px) {
  .bill-download-v2 {
    padding: 12px;
  }

  .bill-download-v2__tabs {
    gap: 20px;
    padding: 0 16px;
  }

  .bill-download-v2__field {
    flex-direction: column;
    align-items: flex-start;
  }

  .bill-download-v2__label {
    flex-basis: auto;
    text-align: left;
  }

  .bill-download-v2__date-picker {
    width: 100%;
    max-width: 320px;
  }

  :deep(.bill-download-v2__date-picker.el-date-editor) {
    width: 100%;

    --el-date-editor-width: 100%;
  }
}
</style>
