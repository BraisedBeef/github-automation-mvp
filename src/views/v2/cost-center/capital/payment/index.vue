<template>
  <div class="capital-payment-v2">
    <PageBreadcrumbToolbar :items="[t('costCenterRoutes.payment')]" @doc="openHelpDoc" />

    <InfoNotice class="capital-payment-v2__notice">
      <span>{{ t('capital.paymentTip') }}</span>
    </InfoNotice>

    <section class="capital-payment-v2__panel">
      <div class="capital-payment-v2__toolbar">
        <el-button type="primary" @click="handleAddCard">
          {{ t('capital.addPayment') }}
        </el-button>
      </div>

      <TableV2 v-loading="loading" :data="list" :empty-min-height="180">
        <el-table-column min-width="120" prop="brand" :label="t('capital.brand')">
          <template #default="{ row }">
            <div class="capital-payment-v2__brand-cell">
              <SvgIcon v-if="BANK_MAP[row.brand]" :name="BANK_MAP[row.brand]" class="capital-payment-v2__brand-icon" />
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" prop="cardNo" :label="t('capital.cardNo')">
          <template #default="{ row }">
            <div class="capital-payment-v2__card-cell">
              <span>*********{{ row.cardNo }}</span>
              <el-tag v-if="row.defaultPayStatus === 1" size="small" effect="plain" type="primary">
                {{ t('capital.default') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180" prop="userName" :label="t('capital.userName')" />

        <el-table-column min-width="220" prop="email" :label="t('capital.email')" />

        <el-table-column min-width="180" fixed="right" :label="t('common.operation')">
          <template #default="{ row }">
            <div class="capital-payment-v2__actions">
              <button
                class="capital-payment-v2__action"
                type="button"
                @click="openRemoveDialog(row.id, row.defaultPayStatus)"
              >
                {{ t('common.delete') }}
              </button>

              <button
                v-if="row.defaultPayStatus !== 1"
                class="capital-payment-v2__action"
                type="button"
                @click="setDefaultCreditcard(row.id, row.defaultPayStatus)"
              >
                {{ t('capital.setDefault') }}
              </button>

              <div v-else class="capital-payment-v2__default-status">
                <span>{{ t('capital.default') }}</span>
                <SvgIcon name="success" class="capital-payment-v2__default-icon" />
              </div>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CatDialog
      v-model:dialog="show.addLimit"
      class="capital-payment-v2__dialog"
      :title="t('capital.hint')"
      width="460px"
      destroy-on-close
      @confirm="show.addLimit = false"
      @update:dialog="() => {}"
    >
      <p class="capital-payment-v2__dialog-main">
        {{ t('capital.addPaymentDesc1') }}
      </p>
      <p class="capital-payment-v2__dialog-sub">
        {{ t('capital.addPaymentDesc2') }}
      </p>
    </CatDialog>

    <CatDialog
      v-model:dialog="show.removeFail"
      class="capital-payment-v2__dialog"
      :title="t('capital.hint')"
      width="460px"
      destroy-on-close
      :no-cancel="true"
      @confirm="show.removeFail = false"
      @update:dialog="() => {}"
    >
      <p class="capital-payment-v2__dialog-sub">
        {{ t('capital.deletePaymentFailDesc') }}
      </p>
    </CatDialog>

    <CatDialog
      v-model:dialog="show.removeConfirm"
      class="capital-payment-v2__dialog"
      :title="t('capital.deletePaymentTit')"
      width="460px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="removeCreditcard"
      @update:dialog="() => {}"
    >
      <p class="capital-payment-v2__dialog-sub">
        {{ t('capital.deletePaymentConfirmDesc') }}
      </p>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { documentUrl, univapayAppId } from '@/config/base-config'
import { _getCreditcardList, _addCreditcard, _removeCreditcard, _setDefaultCreditcard } from '@/apis/cost-center/card'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { BANK_MAP } from '@/views/cost-center/capital/config'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const loading = ref(false)
const removeLoading = ref(false)
const show = reactive<{
  addLimit: boolean
  removeFail: boolean
  removeConfirm: boolean
}>({
  addLimit: false,
  removeFail: false,
  removeConfirm: false,
})
const list = ref<any[]>([])
const removeId = ref('')

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleAddCard = () => {
  if (list.value.length > 4) {
    show.addLimit = true
    return
  }

  // @ts-ignore
  if (window.UnivapayCheckout) {
    const appId = univapayAppId
    // @ts-ignore
    const checkout = window.UnivapayCheckout.create({
      appId,
      checkout: 'token',
      paymentType: 'card',
      tokenType: 'recurring',
      cvvAuthorize: 'true',
      onSuccess(result) {
        if (result.response.data.card.brand !== '') {
          const month = String(result.response.data.card.expMonth)
          const year = String(result.response.data.card.expYear)
          const validDate = `${month.length < 2 ? `0${month}` : month}/${year}`

          addCreditcard({
            brand: result.response.data.card.brand,
            cardToken: result.response.id,
            cardNo: result.response.data.card.lastFour,
            validDate,
            email: result.response.email,
            userName: result.response.data.card.cardholder,
          })
        }
      },
      callback() {
        getCreditcardList()
      },
      closed(closed) {
        console.log('closed===>', closed)
      },
      onError(error) {
        console.log('onError===>', error)
      },
    })

    checkout.open()
  }
}

const getCreditcardList = async () => {
  try {
    loading.value = true
    const res = await _getCreditcardList()

    if (res.success) {
      list.value = res.data || []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const addCreditcard = async (data: any) => {
  const res = await _addCreditcard(data)

  if (res.success) {
    message.success(t('common.addSuccess'))
    getCreditcardList()
  }
}

const openRemoveDialog = (id: string, defaultPayStatus: number) => {
  if (defaultPayStatus === 1) {
    show.removeFail = true
  } else {
    show.removeConfirm = true
    removeId.value = id
  }
}

const removeCreditcard = async () => {
  try {
    removeLoading.value = true

    const res = await _removeCreditcard({
      id: removeId.value,
    })

    if (res.success) {
      message.success(t('capital.deleteSuccess'))
      getCreditcardList()
      show.removeConfirm = false
    }
  } catch (error) {
    console.log(error)
  } finally {
    removeLoading.value = false
  }
}

const setDefaultCreditcard = async (id: string, defaultPayStatus: number) => {
  if (defaultPayStatus === 1) return

  const res = await _setDefaultCreditcard({
    id,
  })

  if (res.success) {
    message.success(t('capital.setSuccess'))
    getCreditcardList()
  }
}

onMounted(() => {
  getCreditcardList()
})
</script>

<style scoped lang="scss">
.capital-payment-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.capital-payment-v2__notice {
  margin-bottom: -2px;
}

.capital-payment-v2__panel {
  padding: 20px;
  background: #fff;
}

.capital-payment-v2__toolbar {
  margin-bottom: 16px;
}

.capital-payment-v2__brand-cell,
.capital-payment-v2__card-cell,
.capital-payment-v2__actions,
.capital-payment-v2__default-status {
  display: flex;
  gap: 10px;
  align-items: center;
}

.capital-payment-v2__brand-icon {
  width: 24px;
  height: 24px;
}

.capital-payment-v2__card-cell {
  gap: 12px;
}

.capital-payment-v2__actions {
  flex-wrap: wrap;
  gap: 20px;
}

.capital-payment-v2__action {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.capital-payment-v2__default-status {
  gap: 6px;
  color: #191c23;
}

.capital-payment-v2__default-icon {
  width: 16px;
  height: 16px;
  color: #17b26a;
}

.capital-payment-v2__dialog-main,
.capital-payment-v2__dialog-sub {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
}

.capital-payment-v2__dialog-main {
  margin-bottom: 6px;
  color: #191c23;
}

.capital-payment-v2__dialog-sub {
  color: #828b9c;
}

@media (width <= 768px) {
  .capital-payment-v2__panel {
    padding: 16px;
  }

  .capital-payment-v2__actions {
    gap: 12px;
  }
}
</style>
