<template>
  <div class="invoice-manage-v2">
    <PageBreadcrumbToolbar
      :items="[t('costCenterRoutes.invoice'), t('costCenterRoutes.invoiceMana')]"
      @doc="openHelpDoc"
    />

    <InfoNotice class="invoice-manage-v2__notice">
      <div>{{ t('invoice.manaTip') }}</div>
    </InfoNotice>

    <section class="invoice-manage-v2__panel">
      <div class="invoice-manage-v2__section">
        <div class="invoice-manage-v2__section-head">
          <h3 class="invoice-manage-v2__section-title">
            {{ t('invoice.confirmInvoice') }}
          </h3>
          <button v-if="!invoiceEditing" class="invoice-manage-v2__action-link" type="button" @click="startEditInvoice">
            {{ isHaveRise ? t('invoice.modify') : t('invoice.addInvoice') }}
          </button>
        </div>

        <el-form
          v-if="invoiceEditing"
          ref="invoiceFormRef"
          :model="invoiceForm"
          :rules="invoiceRules"
          label-position="left"
          label-width="112px"
          class="invoice-manage-v2__form"
          require-asterisk-position="right"
        >
          <el-form-item :label="t('invoice.companyNames')" prop="companyName">
            <el-input
              v-model="invoiceForm.companyName"
              maxlength="32"
              :placeholder="t('invoice.companyNamePlaceholder')"
            />
          </el-form-item>

          <el-form-item :label="t('invoice.invoiceType')" prop="invoiceType">
            <el-radio v-model="invoiceForm.invoiceType" :label="0">
              {{ t('invoice.electronicInvoice') }}
            </el-radio>
          </el-form-item>

          <el-form-item :label="t('invoice.name')" prop="name">
            <el-input v-model="invoiceForm.name" maxlength="20" :placeholder="t('invoice.namePlaceholder')" />
          </el-form-item>

          <el-form-item :label="t('invoice.phone')" prop="phone">
            <el-input
              v-model.trim="invoiceForm.phone"
              maxlength="30"
              :placeholder="t('invoice.phonePlaceholder')"
              @input="handlePhone"
            />
          </el-form-item>

          <el-form-item :label="t('invoice.address')" prop="address">
            <el-input
              v-model="invoiceForm.address"
              type="textarea"
              :rows="4"
              maxlength="100"
              :placeholder="t('invoice.addressPlaceholder')"
            />
          </el-form-item>
        </el-form>

        <div v-if="invoiceEditing" class="invoice-manage-v2__form-actions">
          <el-button type="primary" :loading="invoiceSaving" @click="saveInvoiceSection">
            {{ t('common.save') }}
          </el-button>
          <el-button @click="cancelEditInvoice">
            {{ t('common.cancel') }}
          </el-button>
        </div>

        <div v-else class="invoice-manage-v2__detail-list">
          <div class="invoice-manage-v2__detail-row">
            <div class="invoice-manage-v2__detail-label">
              {{ t('invoice.companyNames') }}
            </div>
            <div class="invoice-manage-v2__detail-value">
              {{ detail.companyName || '-' }}
            </div>
          </div>
          <div class="invoice-manage-v2__detail-row">
            <div class="invoice-manage-v2__detail-label">
              {{ t('invoice.invoiceType') }}
            </div>
            <div class="invoice-manage-v2__detail-value">
              {{ INVOICE_TYPE_MAP[detail.invoiceType] || '-' }}
            </div>
          </div>
          <div class="invoice-manage-v2__detail-row">
            <div class="invoice-manage-v2__detail-label">
              {{ t('invoice.name') }}
            </div>
            <div class="invoice-manage-v2__detail-value">
              {{ detail.name || '-' }}
            </div>
          </div>
          <div class="invoice-manage-v2__detail-row">
            <div class="invoice-manage-v2__detail-label">
              {{ t('invoice.phone') }}
            </div>
            <div class="invoice-manage-v2__detail-value">
              {{ detail.phone || '-' }}
            </div>
          </div>
          <div class="invoice-manage-v2__detail-row">
            <div class="invoice-manage-v2__detail-label">
              {{ t('invoice.address') }}
            </div>
            <div class="invoice-manage-v2__detail-value">
              {{ detail.address || '-' }}
            </div>
          </div>
        </div>
      </div>

      <div class="invoice-manage-v2__section invoice-manage-v2__section--email">
        <div class="invoice-manage-v2__section-head">
          <h3 class="invoice-manage-v2__section-title">
            {{ t('invoice.confirmEmail') }}
          </h3>
          <button v-if="!emailEditing" class="invoice-manage-v2__action-link" type="button" @click="startEditEmail">
            {{ isHaveEmail ? t('invoice.modify') : t('invoice.addEmail') }}
          </button>
        </div>

        <el-form
          v-if="emailEditing"
          ref="emailFormRef"
          :model="emailForm"
          :rules="emailRules"
          label-position="left"
          label-width="112px"
          class="invoice-manage-v2__form"
          require-asterisk-position="right"
        >
          <el-form-item :label="t('invoice.mailbox')" prop="mailbox">
            <el-input v-model.trim="emailForm.mailbox" :placeholder="t('invoice.mailboxPlaceholder')" />
          </el-form-item>
        </el-form>

        <div v-if="emailEditing" class="invoice-manage-v2__form-actions">
          <el-button type="primary" :loading="emailSaving" @click="saveEmailSection">
            {{ t('common.save') }}
          </el-button>
          <el-button @click="cancelEditEmail">
            {{ t('common.cancel') }}
          </el-button>
        </div>

        <div v-else class="invoice-manage-v2__detail-list">
          <div class="invoice-manage-v2__detail-row">
            <div class="invoice-manage-v2__detail-label">
              {{ t('invoice.mailbox') }}
            </div>
            <div class="invoice-manage-v2__detail-value">
              {{ detail.mailbox || '-' }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _addVcInvoice, _getInvoice, _updateVcInvoice } from '@/apis/cost-center/expense-bill'
import { documentUrl } from '@/config/base-config'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { INVOICE_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import { EMIAL_REG } from '@/views/auth/config'
import type { FormInstance, FormRules } from 'element-plus'

type InvoiceForm = {
  mailbox: string
  invoiceType: number
  companyName: string
  name: string
  phone: string
  address: string
}

const detail = reactive<InvoiceForm>({
  companyName: '',
  invoiceType: 0,
  name: '',
  phone: '',
  address: '',
  mailbox: '',
})

const invoiceFormRef = ref<FormInstance>()
const emailFormRef = ref<FormInstance>()
const invoiceSaving = ref(false)
const emailSaving = ref(false)
const invoiceEditing = ref(false)
const emailEditing = ref(false)
const isHaveRise = ref(false)
const isHaveEmail = ref(false)

const invoiceForm = reactive<InvoiceForm>({
  companyName: '',
  invoiceType: 0,
  name: '',
  phone: '',
  address: '',
  mailbox: '',
})

const emailForm = reactive<Pick<InvoiceForm, 'mailbox'>>({
  mailbox: '',
})

const phoneReg = /^1[3-9]\d{9}$/
const nameReg = /^[^\d]{1,20}$/
const companyNameReg = /^[^\d]{4,32}$/

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const checkName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  }
  if (!nameReg.test(value)) {
    callback(new Error(t('invoice.nameRule')))
  } else {
    callback()
  }
}

const checkPhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  }
  if (!phoneReg.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

const checkCompanyName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  }
  if (!companyNameReg.test(value)) {
    callback(new Error(t('invoice.companyNameRule')))
  } else {
    callback()
  }
}

const checkEmail = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback('')
  }
  if (!EMIAL_REG.test(value)) {
    return callback(new Error(t('common.formatErr')))
  }
  callback()
}

const invoiceRules = reactive<FormRules<InvoiceForm>>({
  invoiceType: [{ required: true, message: '', trigger: 'change' }],
  companyName: [{ required: true, validator: checkCompanyName, trigger: 'blur' }],
  name: [{ required: true, validator: checkName, trigger: 'blur' }],
  phone: [{ required: true, validator: checkPhone, trigger: 'blur' }],
  address: [{ required: true, message: '', trigger: 'blur' }],
})

const emailRules = reactive<FormRules<Pick<InvoiceForm, 'mailbox'>>>({
  mailbox: [{ required: true, validator: checkEmail, trigger: 'blur' }],
})

const syncFormsFromDetail = () => {
  invoiceForm.invoiceType = detail.invoiceType
  invoiceForm.companyName = detail.companyName
  invoiceForm.name = detail.name
  invoiceForm.phone = detail.phone
  invoiceForm.address = detail.address
  invoiceForm.mailbox = detail.mailbox
  emailForm.mailbox = detail.mailbox
}

const applyDetail = (data: Partial<InvoiceForm> & { createTime?: string }) => {
  detail.companyName = data.companyName || ''
  detail.invoiceType = typeof data.invoiceType === 'number' ? data.invoiceType : 0
  detail.name = data.name || ''
  detail.phone = data.phone || ''
  detail.address = data.address || ''
  detail.mailbox = data.mailbox || ''
  isHaveRise.value = !!data.createTime
  isHaveEmail.value = !!data.mailbox
  syncFormsFromDetail()
  invoiceEditing.value = !isHaveRise.value
  emailEditing.value = !isHaveEmail.value
}

const handlePhone = (value: string) => {
  if (!/^\d*$/.test(value)) {
    invoiceForm.phone = value.replace(/\D/g, '')
  }
}

const startEditInvoice = () => {
  syncFormsFromDetail()
  invoiceEditing.value = true
}

const startEditEmail = () => {
  emailForm.mailbox = detail.mailbox
  emailEditing.value = true
}

const cancelEditInvoice = () => {
  syncFormsFromDetail()
  invoiceEditing.value = false
}

const cancelEditEmail = () => {
  emailForm.mailbox = detail.mailbox
  emailEditing.value = false
}

const getInvoice = async () => {
  const res = await _getInvoice()

  if (res.success && res.data) {
    applyDetail(res.data)
  } else {
    applyDetail({})
  }
}

const saveInvoiceSection = async () => {
  try {
    invoiceSaving.value = true
    const valid = await invoiceFormRef.value?.validate().catch(() => false)
    if (!valid) return false

    const payload: InvoiceForm = {
      mailbox: detail.mailbox,
      invoiceType: invoiceForm.invoiceType,
      companyName: invoiceForm.companyName,
      name: invoiceForm.name,
      phone: invoiceForm.phone,
      address: invoiceForm.address,
    }

    const res = isHaveRise.value ? await _updateVcInvoice(payload) : await _addVcInvoice(payload)

    if (res.success) {
      message.success(t(isHaveRise.value ? 'invoice.modifySuccess' : 'invoice.addSuccess'))
      await getInvoice()
      invoiceEditing.value = false
      return true
    }

    message.warning(res.msg)
    return false
  } finally {
    invoiceSaving.value = false
  }
}

const saveEmailSection = async () => {
  try {
    emailSaving.value = true
    const valid = await emailFormRef.value?.validate().catch(() => false)
    if (!valid) return false

    const payload: InvoiceForm = {
      mailbox: emailForm.mailbox,
      invoiceType: detail.invoiceType,
      companyName: detail.companyName,
      name: detail.name,
      phone: detail.phone,
      address: detail.address,
    }

    const res = isHaveEmail.value ? await _updateVcInvoice(payload) : await _addVcInvoice(payload)

    if (res.success) {
      message.success(t(isHaveEmail.value ? 'invoice.modifySuccess' : 'invoice.addSuccess'))
      await getInvoice()
      emailEditing.value = false
      return true
    }

    message.warning(res.msg)
    return false
  } finally {
    emailSaving.value = false
  }
}

watch(
  () => invoiceEditing.value,
  value => {
    if (!value) return
    nextTick(() => invoiceFormRef.value?.clearValidate())
  },
)

watch(
  () => emailEditing.value,
  value => {
    if (!value) return
    nextTick(() => emailFormRef.value?.clearValidate())
  },
)

onMounted(() => {
  getInvoice()
})
</script>

<style scoped lang="scss">
.invoice-manage-v2 {
  display: flex;
  flex-direction: column;
}

.invoice-manage-v2__notice {
  margin: 16px 0;
}

.invoice-manage-v2__panel {
  background: #fff;
}

.invoice-manage-v2__section {
  padding: 20px 28px;
}

.invoice-manage-v2__section + .invoice-manage-v2__section {
  border-top: 1px solid #e8ecf3;
}

.invoice-manage-v2__section-head {
  display: flex;
  gap: 20px;
  align-items: end;
  margin-bottom: 24px;
}

.invoice-manage-v2__section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.invoice-manage-v2__action-link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.invoice-manage-v2__detail-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.invoice-manage-v2__detail-row {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.invoice-manage-v2__detail-label {
  font-size: 14px;
  line-height: 22px;
  color: #97a0b3;
}

.invoice-manage-v2__detail-value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-all;
}

.invoice-manage-v2__form {
  max-width: 640px;
}

.invoice-manage-v2__form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.invoice-manage-v2__form :deep(.el-form-item__label) {
  font-size: 14px;
  line-height: 22px;
  color: #97a0b3;
}

.invoice-manage-v2__form :deep(.el-input__wrapper),
.invoice-manage-v2__form :deep(.el-textarea__inner) {
  border-radius: 0;
}

.invoice-manage-v2__form-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-left: 112px;
  margin-top: 24px;
}

.invoice-manage-v2__section--email .invoice-manage-v2__form {
  max-width: 464px;
}

@media (width <= 768px) {
  .invoice-manage-v2__section {
    padding: 16px;
  }

  .invoice-manage-v2__detail-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .invoice-manage-v2__form-actions {
    padding-left: 0;
  }
}
</style>
