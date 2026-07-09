<template>
  <div class="page-box">
    <CatTabs v-model="active" class="mb20" :tabs="tabs" @change="() => {}">
      <!-- L0-PDF账单 -->
      <CatTabPane :value="1">
        <div class="info-wrap">
          <!-- tip -->
          <Tip :text="L0Tips" type="OneToOne" />

          <div class="df ac mb20">
            <p class="key-wrap df ac">
              <span class="key mr10">{{ t('download.billPeriod') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </p>
            <div>
              <!-- 日期选择范围 -->
              <el-date-picker
                v-model="dateTimeL0"
                class="mr10"
                type="monthrange"
                start-placeholder=""
                end-placeholder=""
                :shortcuts="shortcutsL0"
                :range-separator="t('export.to')"
                :clearable="false"
                :disabled-date="disabledMonthL0"
                value-format="YYYY-MM"
              />
            </div>
          </div>
          <div class="df ac mb20">
            <p class="key-wrap">
              <span class="key">{{ t('download.account') }}</span>
            </p>
            <span class="value">{{ user.userName || user.email || '-' }}</span>
          </div>
          <div class="df mbt0">
            <p class="key-wrap">
              <span class="key" />
            </p>
            <el-button type="primary" class="login-btn" :loading="loading" @click="generateBillFile">
              {{ t('export.download') }}
            </el-button>
          </div>
        </div>
      </CatTabPane>
      <!-- L1-多维度汇总账单 -->
      <CatTabPane :value="2">
        <div class="info-wrap">
          <!-- tip -->
          <Tip :text="L1Tips" type="OneToOne" />

          <div class="df ac mb20">
            <p class="key-wrap df ac">
              <span class="key mr10">{{ t('download.billPeriod') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </p>
            <div>
              <!-- 日期选择范围 -->
              <el-date-picker
                v-model="dateTimeL1"
                class="mr10"
                type="monthrange"
                start-placeholder=""
                end-placeholder=""
                :shortcuts="shortcutsComon"
                :range-separator="t('export.to')"
                :clearable="false"
                :disabled-date="disabledMonthCommon"
                value-format="YYYY-MM"
              />
            </div>
          </div>
          <div class="df ac mb20">
            <p class="key-wrap">
              <span class="key">{{ t('download.account') }}</span>
            </p>
            <span class="value">{{ user.userName || user.email || '-' }}</span>
          </div>
          <div class="df mbt0">
            <p class="key-wrap">
              <span class="key" />
            </p>
            <el-button type="primary" class="login-btn" :loading="loading" @click="generateBillFile">
              {{ t('export.download') }}
            </el-button>
          </div>
        </div>
      </CatTabPane>
      <!-- L2-资源账单 -->
      <CatTabPane :value="3">
        <div class="info-wrap">
          <!-- tip -->
          <Tip :text="L2Tips" type="OneToOne" />

          <div class="df ac mb20">
            <p class="key-wrap df ac">
              <span class="key mr10">{{ t('download.billPeriod') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </p>
            <div>
              <!-- 日期选择范围 -->
              <el-date-picker
                v-model="dateTimeL2"
                class="mr10"
                type="monthrange"
                start-placeholder=""
                end-placeholder=""
                :shortcuts="shortcutsComon"
                :range-separator="t('export.to')"
                :clearable="false"
                :disabled-date="disabledMonthCommon"
                value-format="YYYY-MM"
              />
            </div>
          </div>
          <div class="df ac mb20">
            <p class="key-wrap">
              <span class="key">{{ t('download.account') }}</span>
            </p>
            <span class="value">{{ user.userName || user.email || '-' }}</span>
          </div>
          <div class="df mbt0">
            <p class="key-wrap">
              <span class="key" />
            </p>
            <el-button type="primary" class="login-btn" :loading="loading" @click="generateBillFile">
              {{ t('export.download') }}
            </el-button>
          </div>
        </div>
      </CatTabPane>
      <!-- L3-明细账单 -->
      <CatTabPane :value="4">
        <div class="info-wrap">
          <!-- tip -->
          <Tip :text="L3Tips" type="OneToOne" />

          <div class="df ac mb20">
            <p class="key-wrap df ac">
              <span class="key mr10">{{ t('download.billPeriod') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </p>
            <div>
              <!-- 日期选择范围  -->
              <el-date-picker
                v-model="dateTimeL3"
                class="mr10"
                type="monthrange"
                start-placeholder=""
                end-placeholder=""
                :shortcuts="shortcutsComon"
                :range-separator="t('export.to')"
                :clearable="false"
                :disabled-date="disabledMonthCommon"
                value-format="YYYY-MM"
              />
            </div>
          </div>
          <div class="df ac mb20">
            <p class="key-wrap">
              <span class="key">{{ t('download.account') }}</span>
            </p>
            <span class="value">{{ user.userName || user.email || '-' }}</span>
          </div>
          <div class="df mbt0">
            <p class="key-wrap">
              <span class="key" />
            </p>
            <el-button type="primary" class="login-btn" :loading="loading" @click="generateBillFile">
              {{ t('export.download') }}
            </el-button>
          </div>
        </div>
      </CatTabPane>
    </CatTabs>
  </div>
</template>

<script setup lang="ts">
import { _generateBillFile } from '@/apis/cost-center/expense-bill'
import { useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'

import { maoYunDayJs, ManipulateType, FORMAT_MONTH_NO_UTC } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'

const generateBillFilePermission = usePermission('feeApi:generateBillFile') // 下载权限
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

// 获取默认时间
const getDefaultDateTime = (isL0: boolean) => {
  if (isL0) {
    const now = maoYunDayJs()
    const start = now.subtract(1, 'month')
    const end = now.subtract(1, 'month')
    return [start, end]
  } else {
    const start = maoYunDayJs()
    const end = start
    return [start, end]
  }
}

// 获取时间
const getDateTime = (value: number, unit: ManipulateType, isL0: boolean) => {
  if (isL0) {
    const end = maoYunDayJs().subtract(1, 'month')
    const start = end.subtract(value, unit)
    return [start, end]
  } else {
    const end = maoYunDayJs()
    const start = end.subtract(value, unit)
    return [start, end]
  }
}

const shortcutsL0 = [
  {
    text: t('download.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month', true)
    },
  },
  {
    text: t('download.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month', true)
    },
  },
  {
    text: t('download.sixMonth'), // 最近半年
    value: () => {
      return getDateTime(6, 'month', true)
    },
  },
]

const shortcutsComon = [
  {
    text: t('download.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month', false)
    },
  },
  {
    text: t('download.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month', false)
    },
  },
  {
    text: t('download.sixMonth'), // 最近半年
    value: () => {
      return getDateTime(6, 'month', false)
    },
  },
]

// 日期选择范围 默认当前月
const defaultTimeL0 = getDefaultDateTime(true)
const defaultTimeCommon = getDefaultDateTime(false)

const dateTimeL0 = ref<any>(defaultTimeL0)
const dateTimeL1 = ref<any>(defaultTimeCommon)
const dateTimeL2 = ref<any>(defaultTimeCommon)
const dateTimeL3 = ref<any>(defaultTimeCommon)

const loading = ref<boolean>(false)
const active = ref<number>(1)
const tabs = [
  { label: t('download.L0'), value: 1 }, // L0-PDF账单
  { label: t('download.L1'), value: 2 }, // L1-多维度汇总账单
  { label: t('download.L2'), value: 3 }, // L2-资源账单
  { label: t('download.L3'), value: 4 }, // L3-明细账单
]

const L0Tips = computed(() => [
  {
    main: t('download.L0Tip'),
  },
])

const L1Tips = computed(() => [
  {
    main: t('download.L1Tip'),
  },
])

const L2Tips = computed(() => [
  {
    main: t('download.L2Tip'),
  },
])

const L3Tips = computed(() => [
  {
    main: t('download.L3Tip'),
  },
])

const disabledMonthL0 = (time: Date) => {
  const currentDate = maoYunDayJs().subtract(1, 'month')
  const selectedDate = maoYunDayJs(time)
  // 禁用大于等于当前月份
  return currentDate.valueOf() < selectedDate.valueOf()
}

// L1,L2,L3月份处理
const disabledMonthCommon = (time: Date) => {
  const currentDate = maoYunDayJs()
  const selectedDate = maoYunDayJs(time)
  // 禁用大于当前月份
  return currentDate.valueOf() < selectedDate.valueOf()
}

// 下载
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
      startTime = dateTimeL0.value[0]
      endTime = dateTimeL0.value[1]
    }
    if (active.value === 2) {
      startTime = dateTimeL1.value[0]
      endTime = dateTimeL1.value[1]
    }
    if (active.value === 3) {
      startTime = dateTimeL2.value[0]
      endTime = dateTimeL2.value[1]
    }
    if (active.value === 4) {
      startTime = dateTimeL3.value[0]
      endTime = dateTimeL3.value[1]
    }

    const params = {
      startTime,
      endTime,
      fileType: active.value,
    }
    const res = await _generateBillFile(params)
    console.log('_generateBillFile', res)

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
</script>

<style lang="scss" scoped>
.info-wrap {
  padding: 20px 20px 26px;

  .key-wrap {
    width: 100px;

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--regular-color);
    }
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
  }

  .mb40 {
    margin-bottom: 40px;
  }
}
</style>
