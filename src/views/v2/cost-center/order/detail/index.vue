<template>
  <div class="cost-order-detail-v2">
    <PageBreadcrumbToolbar :items="[t('order.order'), t('costCenterRoutes.orderDetail')]" @doc="openHelpDoc" />

    <section class="cost-order-detail-v2__panel cost-order-detail-v2__panel--status">
      <div class="cost-order-detail-v2__status-main">
        <div class="cost-order-detail-v2__status-head">
          <el-image class="cost-order-detail-v2__status-icon" :src="currentStatus.icon" />
          <span class="cost-order-detail-v2__status-title" :class="currentStatus.toneClass">
            {{ currentStatus.title }}
          </span>
        </div>

        <div class="cost-order-detail-v2__status-amount">
          <span>{{ currentStatus.amountLabel }}</span>
          <span class="cost-order-detail-v2__status-price">${{ detail.amount }} USD</span>
        </div>

        <p v-if="detail.state === 7" class="cost-order-detail-v2__status-desc">
          <i18n-t keypath="order.refundDesc">
            <span class="cost-order-detail-v2__status-link" @click="pushRoute({ name: 'income_expenditure' })">{{
              t('incomeExpenditure.incomeExpenditure')
            }}</span>
          </i18n-t>
        </p>

        <p v-else-if="detail.state === 9" class="cost-order-detail-v2__status-desc">
          <i18n-t keypath="order.processingFailedDesc">
            <span class="cost-order-detail-v2__status-link" @click="pushRoute({ name: 'income_expenditure' })">{{
              t('incomeExpenditure.incomeExpenditure')
            }}</span>
          </i18n-t>
        </p>

        <p v-else-if="currentStatus.description" class="cost-order-detail-v2__status-desc">
          {{ currentStatus.description }}
        </p>
      </div>

      <div v-if="detail.state === 1" class="cost-order-detail-v2__status-actions">
        <el-button
          type="primary"
          @click="
            pushRoute({
              name: 'payment_product_order',
              params: {
                tradeNo,
              },
              query: { type: 'order' },
            })
          "
        >
          {{ t('order.goPay') }}
        </el-button>
        <el-button @click="openCancelDialog">
          {{ t('order.cancelOrder') }}
        </el-button>
      </div>
    </section>

    <section class="cost-order-detail-v2__panel">
      <h2 class="cost-order-detail-v2__section-title">
        {{ t('order.oderInfo') }}
      </h2>

      <div class="cost-order-detail-v2__info-grid">
        <template v-for="(item, index) in detailInfoItems" :key="item.key">
          <div class="cost-order-detail-v2__info-label">
            {{ item.label }}
          </div>
          <div
            class="cost-order-detail-v2__info-value"
            :class="{
              'cost-order-detail-v2__info-value--full':
                detailInfoItems.length % 2 === 1 && index === detailInfoItems.length - 1,
            }"
          >
            {{ item.value }}
          </div>
        </template>
      </div>
    </section>

    <section class="cost-order-detail-v2__panel">
      <h2 class="cost-order-detail-v2__section-title">
        {{ detail.state === 7 ? t('order.refund') : t('payment.configurateInfo') }}
      </h2>

      <TableV2
        v-if="detail.state === 7"
        v-loading="loading.list"
        :data="detail.subOrderList || []"
        :empty-min-height="120"
      >
        <el-table-column min-width="220" prop="subTradeNo" :label="t('order.subTradeNo')" />
        <el-table-column min-width="160" prop="productSymbol" :label="t('order.productName')" />
        <el-table-column min-width="140" :label="t('order.costType')">
          <template #default="{ row }">
            {{ COST_TYPE_MAP[row.costType] }}
          </template>
        </el-table-column>
        <el-table-column min-width="260" :label="t('order.standard')">
          <template #default="{ row }">
            <div class="cost-order-detail-v2__config-list">
              <div v-for="(item, index) in row.configs" :key="index" class="cost-order-detail-v2__config-item">
                <span class="cost-order-detail-v2__config-key">{{ item.key }}</span>
                <span>{{ item.value }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="220" prop="num" :label="t('order.refundForm')">
          <template #default="{ row }">
            {{ t('order.refundFormDesc', [row.refundUid]) }}
          </template>
        </el-table-column>
        <el-table-column min-width="260" :label="t('order.refundOrder')">
          <template #default="{ row }">
            <div class="cost-order-detail-v2__refund-links">
              <template v-if="row.newBuyList?.length">
                <span>{{ t('order.newBuy') }}</span>
                <span>{{ row.newBuyList.join(',') }}</span>
              </template>
              <template v-if="row.adjustList?.length">
                <span>{{ t('order.adjust') }}</span>
                <span>{{ row.adjustList.join(',') }}</span>
              </template>
              <template v-if="row.renewList?.length">
                <span>{{ t('order.renew') }}</span>
                <span>{{ row.renewList.join(',') }}</span>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="160" align="right">
          <template #header>
            <div class="cost-order-detail-v2__amount-head">
              {{ t('order.refundPriceUnit') }}
            </div>
          </template>
          <template #default="{ row }">
            <span class="cost-order-detail-v2__money">${{ row.amount }} USD</span>
          </template>
        </el-table-column>
      </TableV2>

      <TableV2 v-else v-loading="loading.list" :data="detail.subOrderList || []" :empty-min-height="120">
        <el-table-column min-width="220" prop="subTradeNo" :label="t('order.subTradeNo')" />
        <el-table-column min-width="160" :label="t('payment.productName')">
          <template #default="{ row }">
            {{ row.productSymbol || row.subProductTypeName || '-' }}
          </template>
        </el-table-column>
        <el-table-column min-width="140" :label="t('order.costType')">
          <template #default="{ row }">
            {{ COST_TYPE_MAP[row.costType] }}
          </template>
        </el-table-column>
        <el-table-column min-width="280" :label="t('payment.configurate')">
          <template #default="{ row }">
            <div class="cost-order-detail-v2__config-list">
              <div v-for="(item, index) in row.configs" :key="index" class="cost-order-detail-v2__config-item">
                <span class="cost-order-detail-v2__config-key">{{ item.key }}</span>
                <span>{{ item.value }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="140" prop="price" :label="t('order.price')">
          <template #default="{ row }">
            {{ `$${row.price} USD` }}
          </template>
        </el-table-column>
        <el-table-column min-width="100" prop="num" :label="t('order.num')" />
        <el-table-column min-width="160" :label="t('order.duration')">
          <template #default="{ row }">
            {{ `${row.duration}${row.durationUnit}` }}
          </template>
        </el-table-column>
        <el-table-column min-width="160" align="right">
          <template #header>
            <div class="cost-order-detail-v2__amount-head">
              {{ t('order.amountNum') }}
            </div>
          </template>
          <template #default="{ row }">
            <div class="cost-order-detail-v2__amount-cell">
              <span class="cost-order-detail-v2__money">${{ row.amount }} USD</span>
              <span v-if="row.originalAmount" class="cost-order-detail-v2__money-strike"
                >${{ row.originalAmount }}</span
              >
            </div>
          </template>
        </el-table-column>
      </TableV2>

      <div class="cost-order-detail-v2__summary">
        <span>{{ detail.state === 7 ? t('order.refundSum') : t('order.orderActualPay') }}</span>
        <strong>${{ detail.amount }} USD</strong>
      </div>
    </section>

    <CatDialog
      v-model:dialog="showCancel"
      :title="t('capital.hint')"
      width="480px"
      destroy-on-close
      :loading="loading.cancel"
      @confirm="cancelOrder"
      @cancel="() => {}"
    >
      <p class="cost-order-detail-v2__dialog-text">
        {{ t('order.cancelOrderDesc') }}
      </p>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _queryProductOrder } from '@/apis/cost-center/payment'
import { _cancelOrder } from '@/apis/cost-center/order'
import { documentUrl } from '@/config/base-config'
import { useUserStore } from '@/store'
import t from '@/utils/i18n'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { ORDER_TYPE_MAP, isSeeDetail } from '@/views/cost-center/order/config'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import orderDetailWaitPay from '@/assets/images/cost-center/order/order-detail-wait-pay.png'
import orderDetailSuccess from '@/assets/images/cost-center/order/order-detail-success.png'
import orderDetaileExpired from '@/assets/images/cost-center/order/order-detail-expired.png'
import orderDetailCancel from '@/assets/images/cost-center/order/order-detail-cancel.png'
import orderDetailInvalid from '@/assets/images/cost-center/order/order-detail-invalid.png'
import orderDetailRefund from '@/assets/images/cost-center/order/order-detail-refund.png'
import orderDetailProcessingFailed from '@/assets/images/cost-center/order/order-detail-processing-failed.png'

const userStore = useUserStore()
const route = useRoute()

const loading = reactive({
  list: false,
  cancel: false,
})

const tradeNo = ref<string>(route.params.tradeNo as string)
const detail = ref<any>({
  state: 4,
  subOrderList: [],
})
const showCancel = ref(false)

const openCancelDialog = () => {
  showCancel.value = true
}

const currentStatus = computed(() => {
  const state = detail.value.state

  if (state === 1) {
    return {
      icon: orderDetailWaitPay,
      title: t('order.waitPay'),
      toneClass: 'is-warning',
      amountLabel: t('order.orderActualPay'),
      description: t('order.waitPayDesc', [maoYunDayJs(detail.value.expireTime).format(FORMAT_TIME)]),
    }
  }

  if (state === 2) {
    return {
      icon: orderDetailSuccess,
      title: t('order.tradeSuccess'),
      toneClass: 'is-success',
      amountLabel: t('order.orderActualPay'),
      description: '',
    }
  }

  if (state === 3) {
    return {
      icon: orderDetailCancel,
      title: t('order.cancel'),
      toneClass: 'is-muted',
      amountLabel: t('order.orderActualPay'),
      description: `${maoYunDayJs(detail.value.cancelTime).format(FORMAT_TIME)} ${t('order.orderCancel')}`,
    }
  }

  if (state === 4) {
    return {
      icon: orderDetaileExpired,
      title: t('order.expired'),
      toneClass: 'is-warning',
      amountLabel: t('order.orderActualPay'),
      description: t('order.payExpiredDesc', [maoYunDayJs(detail.value.expireTime).format(FORMAT_TIME)]),
    }
  }

  if (state === 5) {
    return {
      icon: orderDetailInvalid,
      title: t('order.invalid'),
      toneClass: 'is-danger',
      amountLabel: t('order.orderActualPay'),
      description: t('order.ordeInvalid'),
    }
  }

  if (state === 7) {
    return {
      icon: orderDetailRefund,
      title: t('order.refunded'),
      toneClass: 'is-danger',
      amountLabel: t('order.refundPrice'),
      description: '',
    }
  }

  return {
    icon: orderDetailProcessingFailed,
    title: t('order.processingFailed'),
    toneClass: 'is-danger',
    amountLabel: t('order.orderActualPay'),
    description: '',
  }
})

const detailInfoItems = computed(() => {
  const info = [
    {
      key: 'tradeNo',
      label: t('order.tradeNo'),
      value: detail.value.tradeNo || '-',
    },
    {
      key: 'type',
      label: t('order.orderType'),
      value: ORDER_TYPE_MAP[detail.value.type] || '-',
    },
    {
      key: 'createUid',
      label: t('order.createUid'),
      value: detail.value.createUid || '-',
    },
    {
      key: 'createTime',
      label: t('order.createTimes'),
      value: detail.value.createTime ? maoYunDayJs(detail.value.createTime).format(FORMAT_TIME) : '-',
    },
  ]

  if (detail.value.state === 2) {
    info.push(
      {
        key: 'payUid',
        label: t('order.payUid'),
        value: detail.value.payUid || '-',
      },
      {
        key: 'payTime',
        label: t('order.payTime'),
        value: detail.value.payTime ? maoYunDayJs(detail.value.payTime).format(FORMAT_TIME) : '-',
      },
    )
  }

  if (detail.value.state === 7) {
    info.push({
      key: 'refundTime',
      label: t('order.refundTime'),
      value: detail.value.payTime ? maoYunDayJs(detail.value.payTime).format(FORMAT_TIME) : '-',
    })
  }

  return info
})

const queryProductOrder = async () => {
  try {
    loading.list = true
    const res = await _queryProductOrder({
      tradeNoList: [tradeNo.value],
    })

    if (res.success && res.data?.orderList.length) {
      detail.value = res.data.orderList[0]

      if (!isSeeDetail(detail.value.state)) {
        message.warning(t('order.orderUpdate'))
        pushRoute({ name: 'order' })
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.list = false
  }
}

const cancelOrder = async () => {
  try {
    loading.cancel = true
    const res = await _cancelOrder({
      tradeNo: tradeNo.value,
    })

    if (res.success) {
      userStore.getUser()
      queryProductOrder()
      showCancel.value = false
      message.success(t('order.cancelSuccess'))
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.cancel = false
  }
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

watch(
  () => route.params.tradeNo,
  () => {
    tradeNo.value = route.params.tradeNo as string
    queryProductOrder()
  },
)

onMounted(() => {
  queryProductOrder()
})
</script>

<style scoped lang="scss">
.cost-order-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cost-order-detail-v2__panel {
  padding: 20px;
  background: #fff;
}

.cost-order-detail-v2__panel--status {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 120px;
}

.cost-order-detail-v2__status-main,
.cost-order-detail-v2__status-head,
.cost-order-detail-v2__status-actions,
.cost-order-detail-v2__config-item {
  display: flex;
  align-items: center;
}

.cost-order-detail-v2__status-main {
  flex: 1;

  // flex-wrap: wrap;
  // gap: 36px;
}

.cost-order-detail-v2__status-head {
  gap: 16px;
}

.cost-order-detail-v2__status-icon {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
}

.cost-order-detail-v2__status-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cost-order-detail-v2__status-title.is-success {
  color: #01a66f;
}

.cost-order-detail-v2__status-title.is-warning {
  color: #ff720d;
}

.cost-order-detail-v2__status-title.is-danger {
  color: #e54839;
}

.cost-order-detail-v2__status-title.is-muted {
  color: #828b9c;
}

.cost-order-detail-v2__status-amount,
.cost-order-detail-v2__status-desc {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-order-detail-v2__status-amount {
  margin: 0 20px 0 36px;
}

.cost-order-detail-v2__status-price,
.cost-order-detail-v2__money,
.cost-order-detail-v2__summary strong {
  color: #ff720d;
}

.cost-order-detail-v2__status-desc {
  // flex-basis: 100%;
  margin: 0;
}

.cost-order-detail-v2__status-link {
  margin: 0 4px;
  color: #06f;
  cursor: pointer;
}

.cost-order-detail-v2__status-actions {
  flex-shrink: 0;
  gap: 12px;
}

.cost-order-detail-v2__section-title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cost-order-detail-v2__info-grid {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr) 140px minmax(0, 1fr);
  border-top: 1px solid #e8ecf3;
  border-left: 1px solid #e8ecf3;
}

.cost-order-detail-v2__info-label,
.cost-order-detail-v2__info-value {
  min-height: 52px;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 22px;
  border-right: 1px solid #e8ecf3;
  border-bottom: 1px solid #e8ecf3;
}

.cost-order-detail-v2__info-label {
  color: #828b9c;
  background: #f9fafc;
}

.cost-order-detail-v2__info-value {
  color: #191c23;
  word-break: break-all;
  background: #fff;
}

.cost-order-detail-v2__info-value--full {
  grid-column: span 3;
}

.cost-order-detail-v2__config-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.cost-order-detail-v2__config-item {
  gap: 8px;
  align-items: flex-start;
  line-height: 22px;
}

.cost-order-detail-v2__config-key {
  color: #191c23;
  white-space: nowrap;
}

.cost-order-detail-v2__amount-head {
  margin-left: auto;
}

.cost-order-detail-v2__amount-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.cost-order-detail-v2__money {
  font-size: 14px;
  line-height: 22px;
}

.cost-order-detail-v2__money-strike {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  text-decoration: line-through;
}

.cost-order-detail-v2__refund-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 22px;
}

.cost-order-detail-v2__summary {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-order-detail-v2__summary strong {
  font-size: 16px;
  line-height: 24px;
}

.cost-order-detail-v2__dialog-text {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cost-order-detail-v2 :deep(.el-button) {
  border-radius: 0;
}

@media (width <= 960px) {
  .cost-order-detail-v2__panel--status {
    flex-direction: column;
    align-items: flex-start;
  }

  .cost-order-detail-v2__status-main {
    gap: 16px;
  }

  .cost-order-detail-v2__info-grid {
    grid-template-columns: 120px minmax(0, 1fr);
  }

  .cost-order-detail-v2__info-value--full {
    grid-column: span 1;
  }
}
</style>
