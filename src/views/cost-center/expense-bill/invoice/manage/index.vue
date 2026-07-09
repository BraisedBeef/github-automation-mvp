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
        <el-table v-loading="loading" :data="riseList" class="mt20 table" show-overflow-tooltip>
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
        <el-table v-loading="loading" :data="emaillist" class="mt20 table" show-overflow-tooltip>
          <template #empty>
            <span class="text-14 text-primary cursor-pointer" @click="showDialog(modifyEmailDialogRef)">{{
              t('invoice.addEmail')
            }}</span>
          </template>
          <el-table-column prop="mailbox" :label="t('invoice.mailbox')" />
          <el-table-column :label="t('common.operation')">
            <span class="text-14 text-primary cursor-pointer" @click="showDialog(modifyEmailDialogRef)">{{
              t('invoice.modify')
            }}</span>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 修改发票抬头 -->
    <ModifyInvoiceDialog
      ref="modifyInvoiceDialogRef"
      :type="isHaveRise ? 2 : 1"
      :detail="detail"
      @success="getInvoice"
    />
    <!-- 修改发票邮箱 -->
    <ModifyEmailDialog ref="modifyEmailDialogRef" :type="isHaveEmail ? 2 : 1" :detail="detail" @success="getInvoice" />
  </div>
</template>

<script setup lang="ts">
import ModifyEmailDialog from './components/modify-email-dialog.vue'
import ModifyInvoiceDialog from './components/modify-invoice-dialog.vue'
import { _getInvoice } from '@/apis/cost-center/expense-bill'
import t from '@/utils/i18n'
import { INVOICE_TYPE_MAP } from '@/views/cost-center/expense-bill/config'

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
const loading = ref<boolean>(false)

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
  try {
    loading.value = true
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
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
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
    height: 390px;
    padding-bottom: 80px;

    .item {
      .title {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 16px;

        // font-weight: 500;
        color: var(--primary-text);
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
