<template>
  <div>
    <div class="df jsb ac tabs-wrap mb20">
      <!-- tabs -->
      <div class="df">
        <!-- <div style="width: 13px"></div> -->
        <CatTabs v-model="active" class="tabs" :tabs="tabs" @change="changeTab" />
      </div>

      <div class="df ac">
        <span class="mr10">{{ t('common.select_time') }}</span>
        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
          <SvgIcon name="cat-cdn-help" />
        </el-tooltip>
        <!-- 日期选择范围 -->
        <el-date-picker
          v-model="dateTime"
          class="ml10 mr10"
          type="month"
          :clearable="false"
          value-format="YYYY-MM"
          :disabled-date="disabledMonth"
        />
      </div>
    </div>

    <!-- 账单概览 -->
    <Overview v-if="active === 1" :date="dateTime" />
    <!-- 多维度汇总账单 -->
    <Dimension v-if="active === 2" :date="dateTime" />
    <!-- 资源账单 -->
    <NaturalResources v-if="active === 3" :date="dateTime" />
    <!-- 明细账单 -->
    <Detail v-if="active === 4" :date="dateTime" />
  </div>
</template>

<script setup lang="ts">
import Detail from './components/detail.vue'
import Dimension from './components/dimension.vue'
import NaturalResources from './components/natural-resources.vue'
import Overview from './components/overview.vue'
import { maoYunDayJs, FORMAT_MONTH_NO_UTC } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { replaceRoute } from '@/utils/router-jump'

const route = useRoute()

const v = route.query.active as string

// 日期选择 默认当前月
const defaultTime = maoYunDayJs().format(FORMAT_MONTH_NO_UTC)
const dateTime = ref<any>(defaultTime)

const active = ref(v ? Number(v) : 1)

const tabs = [
  { label: t('bill.overview'), value: 1 }, // 账单概览
  { label: t('bill.dimension'), value: 2 }, // 多维度汇总账单
  { label: t('bill.naturalResources'), value: 3 }, // 资源账单
  { label: t('bill.detailBill'), value: 4 }, // 明细账单
]

// 月份处理
const disabledMonth = (time: Date) => {
  const currentDate = maoYunDayJs()
  const selectedDate = maoYunDayJs(time)
  // 禁用大于当前月份
  return currentDate.valueOf() < selectedDate.valueOf()
}

const changeTab = tab => {
  console.log(`changeTab===>`, tab)

  replaceRoute({
    name: 'expense_bill_bill_list',
    query: {
      active: tab.value,
    },
  })
}
</script>

<style lang="scss" scoped>
.tabs-wrap {
  box-sizing: border-box;
  width: calc(100% + 40px);
  margin-top: -20px;
  margin-left: -20px;
  background: #fff;

  :deep(.cat-tabs__header) {
    /* padding-left: 8px; */
    border-color: transparent;
  }
}
</style>
