<template>
  <div class="expense-bill-list-v2">
    <PageBreadcrumbToolbar :items="[t('costCenterRoutes.bill')]" @doc="openHelpDoc">
      <template #title-extra>
        <div class="expense-bill-list-v2__title-date-bar">
          <span>{{ t('common.select_time') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" class="expense-bill-list-v2__help-icon" />
          </el-tooltip>
          <el-date-picker
            v-model="dateTime"
            class="expense-bill-list-v2__title-date-picker"
            type="month"
            :clearable="false"
            value-format="YYYY-MM"
            :disabled-date="disabledMonth"
          />
        </div>
      </template>
    </PageBreadcrumbToolbar>

    <section class="expense-bill-list-v2__head">
      <div class="expense-bill-list-v2__tabs">
        <button
          v-for="item in tabs"
          :key="item.value"
          class="expense-bill-list-v2__tab"
          :class="{ 'is-active': active === item.value }"
          type="button"
          @click="changeTab(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <InfoNotice v-if="active === 2" class="expense-bill-list-v2__notice">
      <div>
        <div>
          {{ t('bill.overviewTip1', [currentYear, currentMonth]) }}
        </div>
        <div>
          {{ t('bill.overviewTip2') }}
        </div>
      </div>
    </InfoNotice>

    <Overview v-if="active === 1" :date="dateTime" />
    <Dimension v-else-if="active === 2" :date="dateTime" />
    <NaturalResources v-else-if="active === 3" :date="dateTime" />
    <Detail v-else :date="dateTime" />
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import { maoYunDayJs, FORMAT_MONTH_NO_UTC, FORMAT_ONLY_MONTH_NO_UTC, FORMAT_YEAR_NO_UTC } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { replaceRoute } from '@/utils/router-jump'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import Overview from './components/overview.vue'
import Dimension from './components/dimension.vue'
import NaturalResources from './components/natural-resources.vue'
import Detail from './components/detail.vue'

const route = useRoute()

const defaultTime = maoYunDayJs().format(FORMAT_MONTH_NO_UTC)
const dateTime = ref<any>(defaultTime)
const active = ref(route.query.active ? Number(route.query.active) : 1)

const tabs = computed(() => [
  { label: t('bill.overview'), value: 1 },
  { label: t('bill.dimension'), value: 2 },
  { label: t('bill.naturalResources'), value: 3 },
  { label: t('bill.detailBill'), value: 4 },
])

const currentYear = computed(() => maoYunDayJs(dateTime.value).format(FORMAT_YEAR_NO_UTC))
const currentMonth = computed(() => maoYunDayJs(dateTime.value).format(FORMAT_ONLY_MONTH_NO_UTC))

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const disabledMonth = (time: Date) => {
  const currentDate = maoYunDayJs()
  const selectedDate = maoYunDayJs(time)
  return currentDate.valueOf() < selectedDate.valueOf()
}

const changeTab = (tab: { value: number }) => {
  active.value = tab.value
  replaceRoute({
    name: 'expense_bill_bill_list',
    query: {
      active: tab.value,
    },
  })
}

watch(
  () => route.query.active,
  value => {
    active.value = value ? Number(value) : 1
  },
)
</script>

<style scoped lang="scss">
.expense-bill-list-v2 {
  display: flex;
  flex-direction: column;

  // gap: 16px;
}

.expense-bill-list-v2__head {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 16px;
  background: #fff;
}

.expense-bill-list-v2__tabs {
  display: flex;
  gap: 36px;
  min-width: 0;
}

.expense-bill-list-v2__tab {
  position: relative;
  padding: 14px 0 12px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.expense-bill-list-v2__tab.is-active {
  color: #06f;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    content: '';
    background: #06f;
  }
}

.expense-bill-list-v2__help-icon {
  color: #b7c0cd;
}

.expense-bill-list-v2__title-date-bar {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-left: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.expense-bill-list-v2__title-date-picker {
  width: 240px;
}

.expense-bill-list-v2__notice {
  margin-bottom: 16px;
}

@media (width <= 1024px) {
  .expense-bill-list-v2__head {
    padding: 0 16px;
  }

  .expense-bill-list-v2__tabs {
    flex-wrap: wrap;
    gap: 20px;
  }

  .expense-bill-list-v2__title-date-bar {
    margin-left: 0;
  }
}

@media (width <= 768px) {
  .expense-bill-list-v2__title-date-picker {
    width: 100%;
  }
}
</style>
