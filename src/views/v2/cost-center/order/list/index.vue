<template>
  <div class="cost-order-v2">
    <PageBreadcrumbToolbar :items="[t('order.order')]" @doc="openHelpDoc" />

    <section class="cost-order-v2__panel">
      <div class="cost-order-v2__panel-header">
        <h2 class="cost-order-v2__title">
          {{ t('order.prePayOrder') }}
        </h2>
      </div>

      <div class="cost-order-v2__toolbar">
        <div class="cost-order-v2__toolbar-left">
          <el-button
            class="cost-order-v2__primary-btn"
            type="primary"
            :disabled="!selectList.length"
            @click="handleBatchPay"
          >
            {{ t('order.consolidatePay') }}
          </el-button>

          <div class="cost-order-v2__field cost-order-v2__field--range">
            <span class="cost-order-v2__field-label">{{ t('common.select_time') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="cost-order-v2__help-icon" />
            </el-tooltip>
            <el-date-picker
              v-model="dateTime"
              class="cost-order-v2__date-picker"
              type="daterange"
              start-placeholder=""
              end-placeholder=""
              :shortcuts="shortcuts"
              :range-separator="t('export.to')"
              :clearable="false"
              value-format="YYYY-MM-DD"
            />
          </div>

          <el-select
            v-model="productId"
            :placeholder="t('order.productPh')"
            class="cost-order-v2__select"
            @change="changeProduct"
          >
            <el-option v-for="item in productOpts" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>

          <el-select
            v-model="subProductId"
            :placeholder="t('order.suPproductPh')"
            class="cost-order-v2__select"
            @change="changeSubProduct"
          >
            <el-option v-for="item in curProductSubOpts" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>

          <el-popover
            placement="bottom-start"
            trigger="click"
            :width="256"
            popper-class="cost-order-v2__type-popper"
            @show="syncTypeDraft"
          >
            <template #reference>
              <button class="cost-order-v2__filter-btn" type="button">
                <span>{{ currentOrderTypeLabel }}</span>
                <SvgIcon name="down-arrow" class="cost-order-v2__filter-icon" />
              </button>
            </template>

            <div class="cost-order-v2__type-panel">
              <label v-for="item in toolbarOrderTypeList" :key="item.value" class="cost-order-v2__type-option">
                <el-checkbox :model-value="typeDraft === item.value" @change="() => setTypeDraft(item.value)">
                  {{ item.label }}
                </el-checkbox>
              </label>
              <div class="cost-order-v2__type-footer">
                <el-button @click="resetTypeFilter">
                  {{ t('common.reset') }}
                </el-button>
                <el-button type="primary" @click="confirmTypeFilter">
                  {{ t('common.confirm') }}
                </el-button>
              </div>
            </div>
          </el-popover>
        </div>

        <div class="cost-order-v2__toolbar-right">
          <el-input v-model="condition" :placeholder="t('order.tradeNoPlaceholder')" class="cost-order-v2__search">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <button class="cost-order-v2__icon-btn" type="button" :disabled="list.length === 0" @click="download">
            <SvgIcon name="cat-cdn-download" />
          </button>
        </div>
      </div>

      <TableV2
        ref="tableRef"
        v-loading="loading"
        :data="list"
        :total="paginationConfig.total"
        :pagination="pagination"
        show-pagination
        @selection-change="handleRowSelectChange"
        @update:pagination="handlePaginationChange"
      >
        <el-table-column type="selection" width="58" :selectable="row => isPay(row.status)" />

        <el-table-column min-width="210" prop="tradeNo" :label="t('order.tradeNo')" />

        <el-table-column min-width="220" prop="productNameList" :label="t('order.productName')">
          <template #default="{ row }">
            {{ row.productNameList.join('/') }}
          </template>
        </el-table-column>

        <el-table-column min-width="180" prop="subProductNameList" :label="t('order.subProductNameList')">
          <template #default="{ row }">
            {{ row.subProductNameList.join('/') }}
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="t('order.costType')" show-overflow-tooltip>
          <template #default="{ row }">
            {{ COST_TYPE_MAP[row.costType] }}
          </template>
        </el-table-column>

        <el-table-column min-width="120" :label="t('order.type')">
          <template #header>
            <CatTableHeadFilter v-model="orderType" :label="t('order.type')" tip="" show-all :list="orderTypeList" />
          </template>
          <template #default="{ row }">
            {{ ORDER_TYPE_MAP[row.type] }}
          </template>
        </el-table-column>

        <el-table-column min-width="220">
          <template #header>
            <div class="cost-order-v2__time-header">
              <span>{{ t('order.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cost-order-v2__help-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="t('order.status')">
          <template #default="{ row }">
            <div class="cost-order-v2__status" :class="statusToneClass(row.status)">
              <span class="cost-order-v2__status-dot" />
              <span>{{ ORDER_STATUS_MAP[row.status] }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="160" prop="amount" :label="t('order.amount')" />

        <el-table-column fixed="right" min-width="140" :label="t('common.operation')">
          <template #default="{ row }">
            <div class="cost-order-v2__actions">
              <DisableText :disabled="!isSeeDetail(row.status)" :text="t('order.detail')" @click="toDetail(row)" />
              <DisableText
                :disabled="!isPay(row.status)"
                :text="t('order.pay')"
                disabled-type="hidden"
                @click="handlePay(row)"
              />
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import { _queryOrderPage, _exportOrder } from '@/apis/cost-center/order'
import { _productList, _listProductSubType } from '@/apis/product'
import { message } from '@/utils/message'
import { maoYunDayJs, ManipulateType, FORMAT_DAY_NO_UTC, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
import { IPagination } from '@/views/account-system/type'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { ORDER_STATUS_MAP, ORDER_TYPE_MAP, isPay, isSeeDetail } from '@/views/cost-center/order/config'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const tableRef = ref<InstanceType<typeof TableV2>>()

const orderTypeList = Object.keys(ORDER_TYPE_MAP).map(el => ({
  label: ORDER_TYPE_MAP[el],
  value: el,
}))

const toolbarOrderTypeList = computed(() => [
  {
    label: t('common.all'),
    value: '',
  },
  ...orderTypeList,
])

const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
}

const shortcuts = [
  {
    text: t('order.oneWeek'),
    value: () => getDateTime(1, 'week'),
  },
  {
    text: t('order.oneMonth'),
    value: () => getDateTime(1, 'month'),
  },
  {
    text: t('order.threeMonth'),
    value: () => getDateTime(3, 'month'),
  },
]

const defaultTime = shortcuts[0].value()
const dateTime = ref<any>(defaultTime)
const productOpts = ref<any[]>([])
const productSubOpts = ref<any[]>([])
const productId = ref<any>('')
const subProductId = ref<any>('')
const condition = ref<string>('')
const list = ref<any[]>([])
const selectList = ref<any[]>([])
const payIds = ref<number[]>([])
const orderType = ref<string>('')
const typeDraft = ref<string>('')
const loading = ref<boolean>(false)

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

const currentOrderTypeLabel = computed(() => {
  return toolbarOrderTypeList.value.find(item => item.value === orderType.value)?.label || t('common.all')
})

const curProductSubOpts = computed(() => {
  const arr: any[] = [
    {
      value: '',
      label: t('order.allSubPlaceholder'),
    },
  ]
  if (!productId.value) {
    return [...arr]
  }
  const product = productOpts.value.find(el => el.value === productId.value)
  if (product) {
    return [...arr, ...productSubOpts.value.filter(el => el.symbol === product.symbol)]
  }
  return [...arr]
})

const changeProduct = () => {
  subProductId.value = ''
}

const changeSubProduct = () => {}

const handleRowSelectChange = (selection: any[]) => {
  selectList.value = selection
}

const toDetail = row => {
  pushRoute({
    name: 'order_detail',
    params: {
      tradeNo: row.tradeNo,
    },
    query: {
      title: 'order.order',
      path: '/cost-center/order/list',
    },
  })
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  paginationConfig.pagination.page = page
  paginationConfig.pagination.pageSize = pageSize
  queryOrderPage()
}

const handlePay = (row: any) => {
  pushRoute({
    name: 'payment_product_order',
    params: {
      tradeNo: row.tradeNo,
    },
    query: { type: 'order' },
  })
}

const handleBatchPay = () => {
  if (!selectList.value.length) {
    return message.warning(t('order.payWarn'))
  }

  payIds.value = selectList.value.filter(el => el.status == 1).map(el => el.tradeNo)

  if (!payIds.value.length) {
    return message.warning(t('order.payWarn'))
  }

  pushRoute({
    name: 'payment_product_order',
    params: {
      tradeNo: payIds.value.join('-'),
    },
    query: { type: 'order' },
  })
}

const queryOrderPage = async () => {
  try {
    loading.value = true
    const beginDate = dateTime.value[0]
    const endDate = dateTime.value[1]

    const params: any = {
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      tradeNo: condition.value,
      beginDate,
      endDate,
      productId: productId.value || '',
      subProductId: subProductId.value || '',
    }

    if (orderType.value) {
      params.type = orderType.value
    }

    const res = await _queryOrderPage(params)

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
      nextTick(() => {
        tableRef.value?.clearSelection()
      })
      selectList.value = []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const productList = async () => {
  try {
    const res = await _productList()

    if (res.success) {
      const arr: any[] = [
        {
          value: '',
          label: t('order.allPlaceholder'),
        },
      ]
      for (const el of res?.data || []) {
        arr.push({
          value: el.productId,
          label: el.name,
          symbol: el.symbol,
        })
      }

      productOpts.value = arr
    }
  } catch (error) {
    console.log(error)
  }
}

const listProductSubType = async () => {
  try {
    const res = await _listProductSubType({
      id: '',
      symbol: '',
    })

    if (res.success) {
      const arr: any[] = []
      for (const el of res?.data || []) {
        if (el.subTypeList?.length) {
          for (const item of el.subTypeList) {
            arr.push({
              value: item.id,
              label: item.typeName,
              symbol: el.symbol,
            })
          }
        }
      }

      productSubOpts.value = arr
    }
  } catch (error) {
    console.log(error)
  }
}

const download = async () => {
  const beginDate = dateTime.value[0]
  const endDate = dateTime.value[1]

  const params: any = {
    tradeNo: condition.value,
    beginDate,
    endDate,
    productId: productId.value,
    subProductId: subProductId.value,
  }

  const res = await _exportOrder(params)
  if (res.success) {
    pushRoute({
      name: 'export',
      query: {
        type: 5,
      },
    })
  }
}

const syncTypeDraft = () => {
  typeDraft.value = orderType.value
}

const setTypeDraft = (value: string) => {
  typeDraft.value = typeDraft.value === value ? '' : value
}

const resetTypeFilter = () => {
  typeDraft.value = ''
  orderType.value = ''
}

const confirmTypeFilter = () => {
  orderType.value = typeDraft.value
}

const statusToneClass = (status: number) => {
  if (status === 2) return 'is-success'
  if (status === 1) return 'is-warning'
  if (status === 7 || status === 9 || status === 5) return 'is-danger'
  if (status === 8) return 'is-brand'
  return 'is-muted'
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

watch([condition, productId, subProductId, dateTime], () => {
  queryOrderPage()
})

watch(orderType, () => {
  queryOrderPage()
})

onMounted(() => {
  queryOrderPage()
  productList()
  listProductSubType()
})
</script>

<style scoped lang="scss">
.cost-order-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cost-order-v2__panel {
  padding: 20px 20px 0;
  background: #fff;
}

.cost-order-v2__panel-header {
  margin-bottom: 24px;
}

.cost-order-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cost-order-v2__toolbar,
.cost-order-v2__toolbar-left,
.cost-order-v2__toolbar-right,
.cost-order-v2__field,
.cost-order-v2__time-header,
.cost-order-v2__status,
.cost-order-v2__actions {
  display: flex;
  align-items: center;
}

.cost-order-v2__toolbar {
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cost-order-v2__toolbar-left {
  flex: 1;
  flex-wrap: wrap;
  gap: 12px;
}

.cost-order-v2__toolbar-right {
  gap: 12px;
  align-self: flex-start;
}

.cost-order-v2__primary-btn {
  min-width: 112px;
}

.cost-order-v2__field {
  gap: 8px;
  min-height: 32px;
}

.cost-order-v2__field-label {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  white-space: nowrap;
}

.cost-order-v2__field--range {
  gap: 10px;
}

.cost-order-v2__help-icon {
  color: #b7c0cd;
}

.cost-order-v2__date-picker {
  width: 274px;
}

.cost-order-v2__select {
  width: 160px;
}

.cost-order-v2__filter-btn,
.cost-order-v2__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.cost-order-v2__filter-btn {
  gap: 10px;
  min-width: 108px;
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-order-v2__filter-icon {
  color: #b7c0cd;
}

.cost-order-v2__search {
  width: 332px;
}

.cost-order-v2__icon-btn {
  width: 32px;
  height: 32px;
  color: #191c23;
}

.cost-order-v2__time-header {
  gap: 6px;
}

.cost-order-v2__status {
  gap: 8px;
  font-size: 14px;
  line-height: 22px;
}

.cost-order-v2__status-dot {
  width: 6px;
  height: 6px;
  border: 1px solid currentcolor;
  border-radius: 50%;
}

.cost-order-v2__status.is-success {
  color: #01a66f;
}

.cost-order-v2__status.is-warning {
  color: #ff7d00;
}

.cost-order-v2__status.is-danger {
  color: #e54839;
}

.cost-order-v2__status.is-brand {
  color: #06f;
}

.cost-order-v2__status.is-muted {
  color: #828b9c;
}

.cost-order-v2__actions {
  gap: 20px;
}

.cost-order-v2__type-panel {
  display: flex;
  flex-direction: column;
}

.cost-order-v2__type-option {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 0 4px;
}

.cost-order-v2__type-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #e8ecf3;
}

.cost-order-v2 :deep(.el-input__wrapper),
.cost-order-v2 :deep(.el-select__wrapper) {
  min-height: 32px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.cost-order-v2 :deep(.el-date-editor .el-range-input) {
  font-size: 14px;
}

.cost-order-v2 :deep(.el-button) {
  border-radius: 0;
}

@media (width <= 1280px) {
  .cost-order-v2__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .cost-order-v2__toolbar-right {
    justify-content: flex-end;
  }
}

@media (width <= 768px) {
  .cost-order-v2__panel {
    padding: 16px 16px 0;
  }

  .cost-order-v2__toolbar-right {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .cost-order-v2__search,
  .cost-order-v2__date-picker,
  .cost-order-v2__select {
    width: 100%;
  }

  .cost-order-v2__field--range {
    flex-wrap: wrap;
  }
}
</style>
