<template>
  <div class="detail-bill-v2">
    <InfoNotice class="detail-bill-v2__notice">
      <div>
        <div>{{ t('bill.detailTip1') }}</div>
        <div>{{ t('bill.detailTip2') }}</div>
        <div>{{ t('bill.detailTip3') }}</div>
      </div>
    </InfoNotice>

    <section class="detail-bill-v2__summary-card">
      <div class="detail-bill-v2__summary-title">
        {{ t('bill.originalPrice') }}
      </div>
      <div class="detail-bill-v2__summary-total">
        <span class="detail-bill-v2__summary-price">{{ cost.discountPrice || '0.00' }}</span>
        <span class="detail-bill-v2__summary-unit">USD</span>
      </div>

      <div class="detail-bill-v2__summary-breakdown">
        <div v-for="(item, index) in summaryItems" :key="item.label" class="detail-bill-v2__summary-item">
          <div class="detail-bill-v2__summary-item-label">
            {{ item.label }}
          </div>
          <div class="detail-bill-v2__summary-item-value">{{ item.value }} USD</div>
          <div v-if="index !== summaryItems.length - 1" class="detail-bill-v2__summary-plus">+</div>
        </div>
      </div>
    </section>

    <section class="detail-bill-v2__panel">
      <div class="detail-bill-v2__filter">
        <FilterInput
          ref="filterInputRef"
          :placeholder="t('cvmCommon.listPh')"
          :filter-list="iptFilterConfig"
          option-width="220"
          class="detail-bill-v2__filter-input"
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
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.resourceId') }}</span>
              <el-tooltip :content="t('bill.resourceIdtTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div v-if="handleId(row).show" class="detail-bill-v2__resource-cell">
              <TableCopy :text="row.instanceId" :show-text="row.instanceId" />
              <TableCopy :text="row.alias" :show-text="row.alias" />
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="payerUin" min-width="170">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.payerUin') }}</span>
              <el-tooltip :content="t('bill.payerUinTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="userUin" min-width="170">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.userUin') }}</span>
              <el-tooltip :content="t('bill.userUinTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="productName" min-width="140">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.productId') }}</span>
              <el-tooltip :content="t('bill.productIdTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="subProductName" min-width="140">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.subProductName') }}</span>
              <el-tooltip
                :content="t('bill.subProductNameTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="billingMode" min-width="130">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.billingModes') }}</span>
              <el-tooltip :content="t('bill.billingModeTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ COST_TYPE_MAP[row.billingMode] }}
          </template>
        </el-table-column>

        <el-table-column prop="transactionType" min-width="160">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.transactionType') }}</span>
              <el-tooltip
                :content="t('bill.transactionTypeTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ TRANSACTION_TYPE_MAP[row.transactionType] }}
          </template>
        </el-table-column>

        <el-table-column prop="transTime" min-width="220">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.transTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row?.transTime ? maoYunDayJs(row.transTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="configDesc" min-width="200">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.description') }}</span>
              <el-tooltip :content="t('bill.descriptionTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.configDesc || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="regionName" min-width="150">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.regionName') }}</span>
              <el-tooltip :content="t('bill.regionNameTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.regionName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="zoneName" min-width="150">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.zoneName') }}</span>
              <el-tooltip :content="t('bill.zoneNameTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.zoneName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="componentName" min-width="150">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.subDescription') }}</span>
              <el-tooltip
                :content="t('bill.subDescriptionTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.componentName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="unitPrice" min-width="120" :label="t('bill.unitPrice')" />

        <el-table-column prop="unit" min-width="120">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.unit') }}</span>
              <el-tooltip :content="t('bill.unitTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="used" min-width="120">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.used') }}</span>
              <el-tooltip :content="t('bill.usedTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="usedUnit" min-width="120">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.usedUnit') }}</span>
              <el-tooltip :content="t('bill.usedUnitTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="usedDuration" min-width="120">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.usedDuration') }}</span>
              <el-tooltip :content="t('bill.usedDurationTooltip')" placement="top" popper-class="table-header_tooltip">
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="usedDurationUnit" min-width="140">
          <template #header>
            <div class="detail-bill-v2__table-head">
              <span>{{ t('bill.usedDurationUnit') }}</span>
              <el-tooltip
                :content="t('bill.usedDurationUnitTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <SvgIcon name="cat-cdn-warning" class="detail-bill-v2__table-help" />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="originalPrice" min-width="120" :label="t('bill.originalPrices')" />
        <el-table-column prop="discountedPrice" min-width="120" :label="t('bill.curPrice')" />
        <el-table-column prop="voucherMoney" min-width="120" :label="t('bill.voucherMoney')" />
        <el-table-column prop="giftGoldMoney" min-width="120" :label="t('bill.giftGoldMoney')" />
        <el-table-column
          prop="platformAdvancePaymentMoney"
          min-width="180"
          :label="t('bill.platformAdvancePaymentMoney')"
        />
        <el-table-column prop="money" min-width="120" :label="t('bill.money')" />
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _productList } from '@/apis/product'
import { _detailsBill, _getBillTotalMoney } from '@/apis/cost-center/expense-bill'
import type { FilterListType } from '@/components/cvm/query-filter/filter-input.vue'
import FilterInput from '@/components/cvm/query-filter/filter-input.vue'
import TableCopy from '@/components/cvm/table-copy/index.vue'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import type { IPagination } from '@/views/account-system/type'
import {
  COST_TYPE_ARR_MAP,
  COST_TYPE_MAP,
  TRANSACTION_TYPE_ARR_MAP,
  TRANSACTION_TYPE_MAP,
} from '@/views/cost-center/expense-bill/config'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { message } from '@/utils/message'

const props = withDefaults(
  defineProps<{
    date: string
  }>(),
  { date: '' },
)

const route = useRoute()
const incomeSerialNo = route.query.incomeSerialNo as string

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
  detailsBill(search)
}

const handleId = (row: any) => ({
  show: !!(row.instanceId || row.alias),
  instanceId: row.instanceId,
  alias: row.alias,
})

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  paginationConfig.pagination.page = page
  paginationConfig.pagination.pageSize = pageSize
  detailsBill()
  getBillTotalMoney()
}

const detailsBill = async (search = filterInputRef.value?.searchParams || {}) => {
  try {
    loading.value = true

    const res = await _detailsBill({
      month: props.date,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      incomeSerialNo,
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

watch(
  () => props.date,
  () => {
    detailsBill()
    getBillTotalMoney()
  },
)

onMounted(() => {
  getUserProjectFn()
  productList()
  detailsBill()
  getBillTotalMoney()
  getAllZoneListFn()
  getListWithRegionFn()
})
</script>

<style scoped lang="scss">
.detail-bill-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-bill-v2__summary-card,
.detail-bill-v2__panel {
  padding: 20px;
  background: #fff;
}

.detail-bill-v2__summary-title {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.detail-bill-v2__summary-total {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-top: 10px;
}

.detail-bill-v2__summary-price {
  font-size: 44px;
  font-weight: 600;
  line-height: 52px;
  color: #191c23;
}

.detail-bill-v2__summary-unit {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.detail-bill-v2__summary-breakdown {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 20px;
  border: 1px solid #e8ecf3;
}

.detail-bill-v2__summary-breakdown::before {
  position: absolute;
  top: -14px;
  left: 24px;
  width: 22px;
  height: 14px;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: '';
  background: #e8ecf3;
}

.detail-bill-v2__summary-breakdown::after {
  position: absolute;
  top: -13px;
  left: 25px;
  width: 20px;
  height: 13px;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  content: '';
  background: #f9fafc;
}

.detail-bill-v2__summary-item {
  position: relative;
  padding: 18px 20px 20px;
  background: #f9fafc;
}

.detail-bill-v2__summary-item-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.detail-bill-v2__summary-item-value {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.detail-bill-v2__summary-plus {
  position: absolute;
  top: 50%;
  right: -10px;
  z-index: 1;
  font-size: 24px;
  line-height: 24px;
  color: #191c23;
  transform: translateY(-50%);
}

.detail-bill-v2__filter {
  margin-bottom: 20px;
}

.detail-bill-v2__filter-input {
  width: 100%;
}

.detail-bill-v2__table-head {
  display: flex;
  gap: 4px;
  align-items: center;
}

.detail-bill-v2__table-help {
  width: 16px;
  height: 16px;
  color: #b7c0cd;
}

.detail-bill-v2__resource-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

@media (width <= 1024px) {
  .detail-bill-v2__summary-breakdown {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-bill-v2__summary-breakdown::before {
    left: 20px;
  }
}

@media (width <= 768px) {
  .detail-bill-v2__summary-card,
  .detail-bill-v2__panel {
    padding: 16px;
  }

  .detail-bill-v2__summary-price {
    font-size: 32px;
    line-height: 40px;
  }

  .detail-bill-v2__summary-breakdown {
    grid-template-columns: 1fr;
  }

  .detail-bill-v2__summary-plus {
    display: none;
  }
}
</style>
