<template>
  <div class="wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <el-card shadow="never" class="preview-wrap page-box mb20" :body-style="bodyStyle">
      <!-- 发票模板 -->
      <TemplatePreview />

      <!-- 开票 -->
      <div class="invoice-wrap">
        <div class="invoice w-full h-full df jsb ac page-box">
          <p class="text-14">
            <span class="mr4">{{ t('invoice.amountInvoiced') }} </span
            ><span class="price-text text-24">${{ route.params.price }} USD</span>
          </p>
          <div>
            <el-button @click="backRoute()">
              {{ t('invoice.prev') }} </el-button
            ><el-button type="primary" :loading="loading" @click="invoicing">
              {{ t('common.submit') }} </el-button
            ><el-button @click="replaceRoute({ name: 'expense_bill_invoice_list' })">
              {{ t('common.cancel') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 开票提交成功 -->
    <CatDialog
      v-model:dialog="show"
      class="dialog"
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
      <span class="desc">{{ t('invoice.invoiceSuccessDesc') }}</span>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _invoicing } from '@/apis/cost-center/expense-bill'
import * as ExpenseBillType from '@/apis/cost-center/expense-bill/type'
import TemplatePreview from './components/template-preview.vue'
import t from '@/utils/i18n'
import { replaceRoute, backRoute } from '@/utils/router-jump'
const route = useRoute()
const router = useRouter()
const bodyStyle = { height: '100%' }
const show = ref<boolean>(false)
const loading = ref<boolean>(false)

const tips = computed(() => [
  {
    main: t('invoice.previewTip'),
  },
])

// 开票
const invoicing = async () => {
  try {
    loading.value = true
    const invoiceType = Number(route.query.invoiceType)
    const data: ExpenseBillType.GetPreInvoiceReq = {
      invoiceType,
    }

    if (invoiceType == 1) {
      const billIds = route.query.billIds === 'all' ? [] : (route.query.billIds as string)?.split('_')
      data.billIds = billIds
    } else {
      const months = route.query.months === 'all' ? [] : (route.query.months as string)?.split('_')
      data.months = months
    }

    const res = await _invoicing(data)
    console.log(`_invoicing===>`, res)
    if (res.success) {
      show.value = true
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 监听params
watch(
  () => route.params,
  () => {
    invoicing()
  },
)

// 监听query
watch(
  () => route.query,
  () => {
    invoicing()
  },
)
</script>

<style lang="scss" scoped>
.wrap {
  .preview-wrap {
    /* height: 1365px; */
    position: relative;
    padding: 45px 40px 80px;

    .invoice-wrap {
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;

      /* padding-left: calc(var(--menu-w) + 20px);
      padding-right: 20px; */
      width: 100%;
      height: 80px;

      .invoice {
        padding-right: 23px;
        padding-left: 30px;
        background-color: #fff;
      }

      .text-24 {
        font-size: 24px;
      }
    }
  }

  .dialog {
    .desc {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }
  }
}

.text-14 {
  font-size: 14px;
}

.price-text {
  font-family: PingFangSC, 'PingFang SC';
  font-weight: 400;
  color: var(--warning-color);
}
</style>
