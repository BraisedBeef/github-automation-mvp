<template>
  <div class="wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <el-card shadow="never" class="list-wrap page-box mb20" :body-style="bodyStyle">
      <!-- 发票抬头 -->
      <div class="item mb20">
        <p class="title">
          {{ t('invoice.confirmInvoice') }}
        </p>
        <el-table :data="riseList" class="mt20 table" show-overflow-tooltip>
          <template #empty>
            <span class="text-14 text-primary cursor-pointer" @click="showDialog(modifyInvoiceDialogRef)">{{
              t('invoice.addInvoice')
            }}</span>
          </template>
          <el-table-column prop="companyName" :label="t('invoice.companyNames')" />
          <el-table-column prop="invoiceType" :label="t('invoice.invoiceType')">
            <template #default="{ row }">
              {{ INVOICE_TYPE_MAP[row.invoiceType] || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="name" :label="t('invoice.name')" />
          <el-table-column prop="phone" :label="t('invoice.phone')" />
          <el-table-column prop="address" :label="t('invoice.address')" />
          <el-table-column :label="t('common.operation')">
            <span class="text-14 text-primary cursor-pointer" @click="showDialog(modifyInvoiceDialogRef)">{{
              t('invoice.modify')
            }}</span>
          </el-table-column>
        </el-table>
      </div>
      <!-- 电子邮箱 -->
      <div class="item mt20">
        <p class="title">
          {{ t('invoice.confirmEmail') }}
        </p>
        <el-table :data="emaillist" class="mt20 table" show-overflow-tooltip>
          <template #empty>
            <span class="text-14 text-primary cursor-pointer" @click="showDialog(modifyEmailDialogRef)">{{
              t('invoice.addEmail')
            }}</span>
          </template>
          <el-table-column prop="mailbox" :label="t('invoice.mailbox')" />
          <el-table-column prop="productName" :label="t('common.operation')">
            <span class="text-14 text-primary cursor-pointer" @click="showDialog(modifyEmailDialogRef)">{{
              t('invoice.modify')
            }}</span>
          </el-table-column>
        </el-table>
      </div>

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
            ><el-button type="primary" @click="next">
              {{ t('invoice.nextStep') }} </el-button
            ><el-button @click="replaceRoute({ name: 'expense_bill_invoice_list' })">
              {{ t('common.cancel') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <ModifyInvoiceDialog
      ref="modifyInvoiceDialogRef"
      :type="isHaveRise ? 2 : 1"
      :detail="detail"
      @success="getInvoice"
    />

    <ModifyEmailDialog ref="modifyEmailDialogRef" :type="isHaveEmail ? 2 : 1" :detail="detail" @success="getInvoice" />
  </div>
</template>

<script setup lang="ts">
import ModifyEmailDialog from '../manage/components/modify-email-dialog.vue'
import ModifyInvoiceDialog from '../manage/components/modify-invoice-dialog.vue'
import { _getInvoice } from '@/apis/cost-center/expense-bill'
import { message } from '@/utils/message'
import t from '@/utils/i18n'

import { INVOICE_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { replaceRoute, backRoute, pushRoute } from '@/utils/router-jump'
const route = useRoute()
const router = useRouter()
const bodyStyle = { height: '100%' }
const detail = reactive<any>({
  companyName: '',
  invoiceType: 0,
  name: '',
  phone: '',
  address: '',
  mailbox: '',
}) // 发票信息详情
const modifyEmailDialogRef = ref<InstanceType<typeof ModifyEmailDialog>>() // 添加/修改邮箱
const modifyInvoiceDialogRef = ref<InstanceType<typeof ModifyInvoiceDialog>>() // 添加/修改发票
const isHaveRise = ref<boolean>(false) // 是否有发票抬头信息
const isHaveEmail = ref<boolean>(false) // 是否有发票邮箱信息

const tips = computed(() => [
  {
    main: t('invoice.manaTip'),
  },
])

// 弹窗展示
const showDialog = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 下一步
const next = () => {
  if (!isHaveRise.value) {
    return message.warning(t('invoice.addInvoiceWarn'))
  }

  if (!isHaveEmail.value) {
    return message.warning(t('invoice.addEmailWarn'))
  }

  pushRoute({ name: 'expense_bill_invoice_preview', params: route.params, query: route.query })
}

// 发票抬头列表
const riseList = computed(() => {
  return isHaveRise.value ? [detail] : []
})

// 发票邮箱列表
const emaillist = computed(() => {
  return isHaveEmail.value
    ? [
        {
          mailbox: detail.mailbox,
        },
      ]
    : []
})

// 我的发票信息
const getInvoice = async () => {
  const res = await _getInvoice()
  console.log(`_getInvoice===>`, res)
  if (res.success && res.data) {
    for (const key in detail) {
      detail[key] = res.data[key]
    }

    isHaveRise.value = res.data.createTime ? true : false
    isHaveEmail.value = res.data.mailbox ? true : false

    console.log(`===>`, isHaveRise.value ? 2 : 1)
  }
}

onMounted(() => {
  getInvoice()
})
</script>

<style lang="scss" scoped>
.wrap {
  .list-wrap {
    position: relative;
    height: 485px;
    padding-bottom: 80px;

    .item {
      .title {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 16px;

        // font-weight: 500;
        color: var(--primary-text);
      }
    }

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
