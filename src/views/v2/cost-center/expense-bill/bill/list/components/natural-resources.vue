<template>
  <div class="natural-resources-v2">
    <InfoNotice class="natural-resources-v2__notice">
      <div>
        <div>{{ t('bill.naturalResourcesTip1', [currentYear, currentMonth]) }}</div>
        <div>{{ t('bill.naturalResourcesTip2') }}</div>
        <div>{{ t('bill.naturalResourcesTip3') }}</div>
      </div>
    </InfoNotice>

    <section class="natural-resources-v2__summary-card">
      <div class="natural-resources-v2__summary-title">
        {{ t('bill.originalPrice') }}
      </div>
      <div class="natural-resources-v2__summary-total">
        <span class="natural-resources-v2__summary-price">{{ cost.discountPrice || '0.00' }}</span>
        <span class="natural-resources-v2__summary-unit">USD</span>
      </div>

      <div class="natural-resources-v2__summary-breakdown">
        <div v-for="(item, index) in summaryItems" :key="item.label" class="natural-resources-v2__summary-item">
          <div class="natural-resources-v2__summary-item-label">
            {{ item.label }}
          </div>
          <div class="natural-resources-v2__summary-item-value">{{ item.value }} USD</div>
          <div v-if="index !== summaryItems.length - 1" class="natural-resources-v2__summary-plus">+</div>
        </div>
      </div>
    </section>

    <section class="natural-resources-v2__panel">
      <div class="natural-resources-v2__filter">
        <FilterInput
          ref="filterInputRef"
          :placeholder="t('cvmCommon.listPh')"
          :filter-list="iptFilterConfig"
          option-width="220"
          class="natural-resources-v2__filter-input"
          @search="searchFn"
        />
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :total="paginationConfig.total"
        :pagination="pagination"
        :empty-min-height="180"
        show-pagination
        @update:pagination="handlePaginationChange"
      >
        <el-table-column min-width="260">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.resourceId') }}</span>
              <el-tooltip :content="t('bill.resourceIdtTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div v-if="handleId(row).show" class="natural-resources-v2__resource-cell">
              <div>{{ row.instanceId }}</div>
              <div class="natural-resources-v2__resource-alias">
                {{ row.alias }}
              </div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="payerUin" min-width="170">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.payerUin') }}</span>
              <el-tooltip :content="t('bill.payerUinTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="userUin" min-width="170">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.userUin') }}</span>
              <el-tooltip :content="t('bill.userUinTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="productName" min-width="160">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.productId') }}</span>
              <el-tooltip :content="t('bill.productIdTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="subProductName" min-width="180">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.subProductName') }}</span>
              <el-tooltip
                :content="t('bill.subProductNameTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <SvgIcon name="cat-cdn-warning" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="billingMode" min-width="150">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.billingModes') }}</span>
              <el-tooltip :content="t('bill.billingModeTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ COST_TYPE_MAP[row.billingMode] }}
          </template>
        </el-table-column>

        <el-table-column prop="transactionType" min-width="170">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.transactionType') }}</span>
              <el-tooltip
                :content="t('bill.transactionTypeTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <SvgIcon name="cat-cdn-warning" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ TRANSACTION_TYPE_MAP[row.transactionType] }}
          </template>
        </el-table-column>

        <el-table-column prop="transTime" min-width="220">
          <template #header>
            <div class="natural-resources-v2__table-head">
              <span>{{ t('bill.transTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="natural-resources-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row?.transTime ? maoYunDayJs(row.transTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="92" fixed="right">
          <template #header>
            <span>{{ t('common.operation') }}</span>
          </template>
          <template #default="{ row }">
            <button class="natural-resources-v2__detail-btn" type="button" @click="toDetail(row)">
              {{ t('bill.detail') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _productList } from '@/apis/product'
import { _getBillTotalMoney, _resourceBill } from '@/apis/cost-center/expense-bill'
import type { FilterListType } from '@/components/cvm/query-filter/filter-input.vue'
import FilterInput from '@/components/cvm/query-filter/filter-input.vue'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import type { IPagination } from '@/views/account-system/type'
import {
  COST_TYPE_MAP,
  TRANSACTION_TYPE_MAP,
  COST_TYPE_ARR_MAP,
  TRANSACTION_TYPE_ARR_MAP,
} from '@/views/cost-center/expense-bill/config'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import { FORMAT_ONLY_MONTH_NO_UTC, FORMAT_TIME, FORMAT_YEAR_NO_UTC, maoYunDayJs } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'

const props = withDefaults(
  defineProps<{
    date: string
  }>(),
  { date: '' },
)

const defaultIptFilterConfig: FilterListType[] = [
  { fieldName: t('bill.instanceId'), fieldKey: 'instanceId' },
  { fieldName: t('bill.payerUin'), fieldKey: 'payerUin' },
  { fieldName: t('bill.userUin'), fieldKey: 'userUin' },
  { fieldName: t('bill.productIds'), fieldKey: 'productIds', fieldType: 'check', list: [] },
  { fieldName: t('bill.costType'), fieldKey: 'billingMode', fieldType: 'select', list: COST_TYPE_ARR_MAP },
  {
    fieldName: t('bill.transactionTypes'),
    fieldKey: 'transactionType',
    fieldType: 'select',
    list: TRANSACTION_TYPE_ARR_MAP,
  },
  { fieldName: t('bill.projectIds'), fieldKey: 'projectIds', fieldType: 'check', list: [] },
  { fieldName: t('bill.regionIds'), fieldKey: 'regionIds', fieldType: 'check', list: [] },
  { fieldName: t('bill.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] },
]

const { filterInputRef, iptFilterConfig } = useFilter({}, defaultIptFilterConfig)
const { getAllZoneList, getListWithRegion, getUserProject } = useBaseConfig()

const currentYear = computed(() => maoYunDayJs(props.date).format(FORMAT_YEAR_NO_UTC))
const currentMonth = computed(() => maoYunDayJs(props.date).format(FORMAT_ONLY_MONTH_NO_UTC))

const list = ref<any[]>([])
const loading = ref(false)

const cost = reactive({
  originalPrice: '',
  money: '',
  voucherMoney: '',
  giftGoldMoney: '',
  platformAdvancePaymentMoney: '',
  discountPrice: '',
})

const summaryItems = computed(() => [
  { label: t('bill.money'), value: cost.money || '0.00' },
  { label: t('bill.voucherMoney'), value: cost.voucherMoney || '0.00' },
  { label: t('bill.giftGoldMoney'), value: cost.giftGoldMoney || '0.00' },
  { label: t('bill.platformAdvancePaymentMoney'), value: cost.platformAdvancePaymentMoney || '0.00' },
])

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: paginationConfig.pagination.page,
  pageSize: paginationConfig.pagination.pageSize,
}))

const searchFn = (search: any) => {
  paginationConfig.pagination.page = 1
  resourceBill(search)
}

const handleId = (row: any) => ({
  show: !!(row.instanceId || row.alias),
  instanceId: row.instanceId,
  alias: row.alias,
})

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  paginationConfig.pagination.page = page
  paginationConfig.pagination.pageSize = pageSize
  resourceBill()
  getBillTotalMoney()
}

const resourceBill = async (search = filterInputRef.value?.searchParams || {}) => {
  try {
    loading.value = true

    const res = await _resourceBill({
      month: props.date,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      ...search,
    })

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    } else {
      list.value = []
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const getBillTotalMoney = async () => {
  const res = await _getBillTotalMoney({ month: props.date })

  if (res.success) {
    cost.originalPrice = res.data?.originalPrice
    cost.discountPrice = res.data?.discountPrice
    cost.money = res.data?.money
    cost.voucherMoney = res.data?.voucherMoney
    cost.giftGoldMoney = res.data?.giftGoldMoney
    cost.platformAdvancePaymentMoney = res.data?.platformAdvancePaymentMoney
  }
}

const productList = async () => {
  try {
    const res = await _productList()

    if (res.success) {
      iptFilterConfig.value[3].list = res.data.map(el => ({
        label: el.name,
        value: el.productId,
      }))
    }
  } catch (error) {
    console.log(error)
  }
}

const getUserProjectFn = async () => {
  const cb = (res: any) => {
    iptFilterConfig.value[6].list = res?.data.map(el => ({
      label: el.projectName,
      value: el.id,
    }))
  }

  getUserProject({}, cb)
}

const getAllZoneListFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      iptFilterConfig.value[8].list = (res.data || []).map(el => ({
        label: el.zoneName,
        value: el.id,
      }))
    }
  }

  getAllZoneList(cb)
}

const getListWithRegionFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      const allArea = (res.data || []).flatMap(el => el.regionDTOS || [])
      iptFilterConfig.value[7].list = allArea.map(el => ({
        label: el.regionName,
        value: el.id,
      }))
    }
  }

  getListWithRegion(cb)
}

const toDetail = (row: any) => {
  pushRoute({
    name: 'expense_bill_bill_natural_resources_detail',
    params: {
      billId: row.billId,
    },
    query: {
      active: 3,
      transMonth: props.date,
      title: 'bill.bill',
      path: '/cost-center/expense-bill/bill/list',
    },
  })
}

watch(
  () => props.date,
  () => {
    resourceBill()
    getBillTotalMoney()
  },
)

onMounted(() => {
  getUserProjectFn()
  productList()
  resourceBill()
  getBillTotalMoney()
  getAllZoneListFn()
  getListWithRegionFn()
})
</script>

<style scoped lang="scss">
.natural-resources-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.natural-resources-v2__summary-card,
.natural-resources-v2__panel {
  padding: 20px;
  background: #fff;
}

.natural-resources-v2__summary-card {
  padding: 16px;
}

.natural-resources-v2__summary-title {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.natural-resources-v2__summary-total {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-top: 8px;
}

.natural-resources-v2__summary-price {
  font-size: 32px;
  font-weight: 600;
  line-height: 52px;
  color: #191c23;
}

.natural-resources-v2__summary-unit {
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.natural-resources-v2__summary-breakdown {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 20px;
  border: 1px solid #e8ecf3;
}

.natural-resources-v2__summary-breakdown::before {
  position: absolute;
  top: -14px;
  left: 24px;
  width: 22px;
  height: 14px;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: '';
  background: #e8ecf3;
}

.natural-resources-v2__summary-breakdown::after {
  position: absolute;
  top: -13px;
  left: 25px;
  width: 20px;
  height: 13px;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: '';
  background: #f9fafc;
}

.natural-resources-v2__summary-item {
  position: relative;
  padding: 18px 20px 20px;
  background: #f9fafc;
}

.natural-resources-v2__summary-item-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.natural-resources-v2__summary-item-value {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.natural-resources-v2__summary-plus {
  position: absolute;
  top: 50%;
  right: 28px;
  z-index: 1;
  font-size: 24px;
  line-height: 24px;
  color: #191c23;
  transform: translateY(-50%);
}

.natural-resources-v2__filter {
  margin-bottom: 20px;
}

.natural-resources-v2__filter-input {
  width: 100%;
}

.natural-resources-v2__table-head {
  display: flex;
  gap: 4px;
  align-items: center;
}

.natural-resources-v2__table-help {
  width: 16px;
  height: 16px;
  color: #b7c0cd;
}

.natural-resources-v2__resource-cell {
  line-height: 22px;
}

.natural-resources-v2__resource-alias {
  color: #828b9c;
}

.natural-resources-v2__detail-btn {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

@media (width <= 1024px) {
  .natural-resources-v2__summary-breakdown {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .natural-resources-v2__summary-breakdown::before {
    left: 20px;
  }
}

@media (width <= 768px) {
  .natural-resources-v2__summary-card,
  .natural-resources-v2__panel {
    padding: 16px;
  }

  .natural-resources-v2__summary-price {
    font-size: 32px;
    line-height: 40px;
  }

  .natural-resources-v2__summary-breakdown {
    grid-template-columns: 1fr;
  }

  .natural-resources-v2__summary-plus {
    display: none;
  }
}
</style>
