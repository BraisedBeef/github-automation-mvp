<template>
  <div class="invoice-preview-v2">
    <PageBreadcrumbToolbar
      :items="[t('costCenterRoutes.invoice'), t('costCenterRoutes.invoiceInfo'), t('costCenterRoutes.invoicePreview')]"
      @doc="openHelpDoc"
    />

    <InfoNotice class="invoice-preview-v2__notice">
      <div>{{ t('invoice.previewTip') }}</div>
    </InfoNotice>

    <section class="invoice-preview-v2__panel">
      <TemplatePreview />

      <div class="invoice-preview-v2__footer">
        <div class="invoice-preview-v2__actions">
          <el-button @click="backRoute()">
            {{ t('invoice.prev') }}
          </el-button>
          <el-button type="primary" :loading="loading" @click="invoicing">
            {{ t('common.submit') }}
          </el-button>
          <el-button @click="replaceRoute({ name: 'expense_bill_invoice_list' })">
            {{ t('common.cancel') }}
          </el-button>
        </div>

        <div class="invoice-preview-v2__amount">
          <span class="invoice-preview-v2__amount-label">{{ t('invoice.amountInvoiced') }}：</span>
          <span class="invoice-preview-v2__amount-value">{{ route.params.price }}</span>
          <span class="invoice-preview-v2__amount-unit">USD</span>
        </div>
      </div>
    </section>

    <CatDialog
      v-model:dialog="show"
      class="invoice-preview-v2__dialog"
      :title="t('invoice.invoiceSuccessTit')"
      width="640px"
      destroy-on-close
      :confirm-text="t('common.confirm')"
      :close-on-click-modal="false"
      :no-cancel="true"
      icon=""
      @confirm="replaceRoute({ name: 'expense_bill_invoice_list' })"
      @update:dialog="replaceRoute({ name: 'expense_bill_invoice_list' })"
    >
      <span class="invoice-preview-v2__dialog-desc">{{ t('invoice.invoiceSuccessDesc') }}</span>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _invoicing } from '@/apis/cost-center/expense-bill'
import * as ExpenseBillType from '@/apis/cost-center/expense-bill/type'
import { documentUrl } from '@/config/base-config'
import TemplatePreview from './components/template-preview.vue'
import t from '@/utils/i18n'
import { replaceRoute, backRoute } from '@/utils/router-jump'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'

const route = useRoute()
const show = ref(false)
const loading = ref(false)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const invoicing = async () => {
  try {
    loading.value = true
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

    const res = await _invoicing(data)
    if (res.success) {
      show.value = true
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.invoice-preview-v2 {
  display: flex;
  flex-direction: column;
}

.invoice-preview-v2__notice {
  margin: 16px 0;
}

.invoice-preview-v2__panel {
  background: #fff;
}

.invoice-preview-v2__footer {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #e8ecf3;
}

.invoice-preview-v2__actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.invoice-preview-v2__amount {
  display: flex;
  gap: 4px;
  align-items: baseline;
  font-size: 12px;
  line-height: 20px;
  color: #191c23;
}

.invoice-preview-v2__amount-value {
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  color: #ff720d;
}

.invoice-preview-v2__amount-unit {
  color: #ff720d;
}

.invoice-preview-v2__dialog-desc {
  font-size: 14px;
  line-height: 22px;
  color: #4e5969;
}

@media (width <= 768px) {
  .invoice-preview-v2__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .invoice-preview-v2__actions {
    flex-wrap: wrap;
  }
}
</style>
