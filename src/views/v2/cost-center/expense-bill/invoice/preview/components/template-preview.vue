<template>
  <el-watermark class="invoice-preview-sheet" :font="font" :content="t('invoice.preview')" :gap="[160, 120]">
    <div class="invoice-preview-sheet__inner">
      <div class="invoice-preview-sheet__top">
        <SvgIcon :name="logoTextName" class="invoice-preview-sheet__logo" />
        <div class="invoice-preview-sheet__invoice-id">
          <span>{{ t('invoice.invoiceId') }}</span>
          <span>{{ detail.invoiceNo || detail.invoiceId || '-' }}</span>
        </div>
      </div>

      <div class="invoice-preview-sheet__title">{{ t('invoice.previewTit') }}{{ t('invoice.previewSubTit') }}</div>

      <div class="invoice-preview-sheet__info">
        <div class="invoice-preview-sheet__info-col">
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.companyNameTem') }}</span>
            <span class="invoice-preview-sheet__info-value">{{ detail.companyName || '-' }}</span>
          </div>
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.nameTem') }}</span>
            <span class="invoice-preview-sheet__info-value">{{ detail.name || '-' }}</span>
          </div>
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.phoneTem') }}</span>
            <span class="invoice-preview-sheet__info-value">{{ detail.phone || '-' }}</span>
          </div>
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.addressTem') }}</span>
            <span class="invoice-preview-sheet__info-value">{{ detail.address || '-' }}</span>
          </div>
        </div>

        <div class="invoice-preview-sheet__info-col">
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.endTimeTem') }}</span>
            <span class="invoice-preview-sheet__info-value">
              {{ detail.endTime ? maoYunDayJs(detail.endTime).format(FORMAT_TIME) : '-' }}
            </span>
          </div>
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.invoiceType') }}</span>
            <span class="invoice-preview-sheet__info-value">{{ t('invoice.onlineInvoice') }}</span>
          </div>
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.openInvoiceTypeTem') }}</span>
            <span class="invoice-preview-sheet__info-value">{{ t('invoice.billSum') }}</span>
          </div>
          <div class="invoice-preview-sheet__info-row">
            <span class="invoice-preview-sheet__info-key">{{ t('invoice.payTem') }}</span>
            <span class="invoice-preview-sheet__info-value">{{ t('invoice.onlinePay') }}</span>
          </div>
        </div>
      </div>

      <div class="invoice-preview-sheet__table">
        <div class="invoice-preview-sheet__table-row invoice-preview-sheet__table-row--head">
          <div>{{ t('invoice.indexTem') }}</div>
          <div>{{ t('invoice.productId') }}</div>
          <div>{{ t('invoice.numberTem') }}</div>
          <div>{{ t('invoice.billingMode') }}</div>
          <div class="is-right">
            {{ t('invoice.amountTem') }}
          </div>
        </div>

        <div v-for="(item, index) in tableList" :key="index" class="invoice-preview-sheet__table-row">
          <div>{{ index + 1 }}</div>
          <div>{{ item.productId || item.productName || '-' }}</div>
          <div>{{ item.quantity || item.num || 1 }}</div>
          <div>{{ item.billingModeName || item.costTypeName || '-' }}</div>
          <div class="is-right">
            {{ item.cashAmount || item.amount || '-' }}
          </div>
        </div>

        <div class="invoice-preview-sheet__table-summary">
          <div>{{ t('invoice.remark', [detail.totalAmount || route.params.price]) }}——</div>
          <div>
            <span>{{ t('invoice.taotalTem', [detail.totalAmount || route.params.price]) }}</span>
          </div>
        </div>
      </div>

      <div class="invoice-preview-sheet__desc">
        {{ t('invoice.descTem', [detail.totalAmount || route.params.price]) }}
      </div>

      <div class="invoice-preview-sheet__copyright">
        Copyright@Virtual Private Server Cloud Information Technology Co.,Ltd.
      </div>
    </div>
  </el-watermark>
</template>

<script setup lang="ts">
import { _preInvoice } from '@/apis/cost-center/expense-bill'
import * as ExpenseBillType from '@/apis/cost-center/expense-bill/type'
import t from '@/utils/i18n'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { logoTextName } from '@/config/base-config'

const route = useRoute()

const detail = ref<any>({})
const font = reactive({
  color: 'rgba(0, 0, 0, 0.05)',
  fontSize: 64,
})

const tableList = computed(() => {
  const list = detail.value?.billInfoList || detail.value?.list || detail.value?.details || []

  if (Array.isArray(list) && list.length) {
    return list
  }

  return [{ productId: '-', quantity: '-', billingModeName: '-', cashAmount: '-' }]
})

const preInvoice = async () => {
  const invoiceType = Number(route.query.invoiceType)
  const data: ExpenseBillType.GetPreInvoiceReq = {
    invoiceType,
  }

  if (invoiceType === 1) {
    const billIds = route.query.billIds === 'all' ? [] : (route.query.billIds as string)?.split('_')
    data.billIds = billIds
  } else {
    const months = route.query.months === 'all' ? [] : (route.query.months as string)?.split('_')
    data.months = months
  }

  const res = await _preInvoice(data)

  if (res.success) {
    detail.value = res.data || {}
  }
}

onMounted(() => {
  preInvoice()
})
</script>

<style scoped lang="scss">
.invoice-preview-sheet {
  display: block;
  width: 100%;
}

.invoice-preview-sheet__inner {
  padding: 40px 40px 28px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.invoice-preview-sheet__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 36px;
  border-bottom: 1px solid #e8ecf3;
}

.invoice-preview-sheet__logo {
  width: 112px;
  height: 38px;
}

.invoice-preview-sheet__invoice-id {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.invoice-preview-sheet__title {
  padding: 76px 0 64px;
  font-size: 30px;
  font-weight: 600;
  line-height: 42px;
  color: #191c23;
  text-align: center;
}

.invoice-preview-sheet__info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 64px;
  margin-bottom: 36px;
}

.invoice-preview-sheet__info-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.invoice-preview-sheet__info-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  font-size: 14px;
  line-height: 22px;
}

.invoice-preview-sheet__info-key {
  color: #97a0b3;
}

.invoice-preview-sheet__info-value {
  color: #191c23;
  word-break: break-all;
}

.invoice-preview-sheet__table {
  border: 1px solid #e8ecf3;
}

.invoice-preview-sheet__table-row {
  display: grid;
  grid-template-columns: 88px 1.4fr 0.8fr 1fr 1fr;
}

.invoice-preview-sheet__table-row > div {
  min-height: 56px;
  padding: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  border-top: 1px solid #e8ecf3;
}

.invoice-preview-sheet__table-row > div + div {
  border-left: 1px solid #e8ecf3;
}

.invoice-preview-sheet__table-row--head > div {
  min-height: 54px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  background: #f9fafc;
  border-top: 0;
}

.invoice-preview-sheet__table-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  border-top: 1px solid #e8ecf3;
}

.invoice-preview-sheet__desc {
  padding: 36px 0 24px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.invoice-preview-sheet__copyright {
  font-size: 12px;
  line-height: 20px;
  color: #97a0b3;
  text-align: center;
}

.is-right {
  text-align: right;
}

@media (width <= 768px) {
  .invoice-preview-sheet__inner {
    padding: 20px 16px;
  }

  .invoice-preview-sheet__top,
  .invoice-preview-sheet__info,
  .invoice-preview-sheet__table-row,
  .invoice-preview-sheet__table-summary {
    display: block;
  }

  .invoice-preview-sheet__invoice-id {
    margin-top: 12px;
  }

  .invoice-preview-sheet__title {
    padding: 40px 0 32px;
    font-size: 24px;
    line-height: 34px;
  }

  .invoice-preview-sheet__info-col {
    gap: 16px;
    margin-bottom: 16px;
  }

  .invoice-preview-sheet__table-row > div {
    border-left: 0 !important;
  }
}
</style>
