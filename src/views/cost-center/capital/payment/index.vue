<template>
  <div class="">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <el-card shadow="never" class="page-box" :body-style="bodyStyle">
      <el-button type="primary" class="mb20" @click="handleAddCard">
        {{ t('capital.addPayment') }}
      </el-button>

      <el-table v-loading="loading" :data="list">
        <el-table-column min-width="100" prop="brand" :label="t('capital.brand')">
          <template #default="{ row }">
            <SvgIcon class="bank-img" :name="BANK_MAP[row.brand]" />
          </template>
        </el-table-column>
        <el-table-column min-width="200" prop="cardNo" :label="t('capital.cardNo')">
          <template #default="{ row }">
            <div class="df ac">
              <span style="margin-right: 10px">*********{{ row.cardNo }}</span
              ><el-tag v-if="row.defaultPayStatus === 1">
                {{ t('capital.default') }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="200" prop="userName" :label="t('capital.userName')" />
        <el-table-column min-width="200" prop="email" :label="t('capital.email')" />
        <el-table-column min-width="200" :label="t('common.operation')">
          <template #default="{ row }">
            <span class="text-primary mr20 cursor-pointer" @click="openRemoveDialog(row.id, row.defaultPayStatus)">
              {{ t('common.delete') }}
            </span>
            <span
              class="cursor-pointer"
              :class="row.defaultPayStatus === 1 ? 'default' : 'text-primary'"
              @click="setDefaultCreditcard(row.id, row.defaultPayStatus)"
            >
              {{ t('capital.setDefault') }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加上限 -->
    <CatDialog
      v-model:dialog="show.addLimit"
      class="dialog"
      :title="t('capital.hint')"
      width="460px"
      destroy-on-close
      @confirm="show.addLimit = false"
      @update:dialog="() => {}"
    >
      <p class="main">
        {{ t('capital.addPaymentDesc1') }}
      </p>
      <p class="sub">
        {{ t('capital.addPaymentDesc2') }}
      </p>
    </CatDialog>

    <!-- 删除失败 -->
    <CatDialog
      v-model:dialog="show.removeFail"
      class="dialog"
      :title="t('capital.hint')"
      width="460px"
      destroy-on-close
      :no-cancel="true"
      @confirm="show.removeFail = false"
      @update:dialog="() => {}"
    >
      <p class="sub">
        {{ t('capital.deletePaymentFailDesc') }}
      </p>
    </CatDialog>

    <!-- 删除确认 -->
    <CatDialog
      v-model:dialog="show.removeConfirm"
      class="dialog"
      :title="t('capital.deletePaymentTit')"
      width="460px"
      destroy-on-close
      :loading="removeLoading"
      @confirm="removeCreditcard"
      @update:dialog="() => {}"
    >
      <p class="sub">
        {{ t('capital.deletePaymentConfirmDesc') }}
      </p>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { _getCreditcardList, _addCreditcard, _removeCreditcard, _setDefaultCreditcard } from '@/apis/cost-center/card'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { BANK_MAP } from '@/views/cost-center/capital/config'
import { univapayAppId } from '@/config/base-config'

const bodyStyle = { height: '100%' }
const loading = ref<boolean>(false)
const removeLoading = ref<boolean>(false)
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
const removeId = ref<string>('')

const tips = computed(() => [
  {
    main: t('capital.paymentTip'),
  },
])

// 点击添加
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
        console.log(`onSuccess===>`, result)

        if (result.response.data.card.brand !== '') {
          let month = String(result.response.data.card.expMonth)
          const year = String(result.response.data.card.expYear)

          const validDate = (month.length < 2 ? `0${month}` : month) + '/' + year

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
      callback(callback) {
        getCreditcardList()
        console.log(`callback===>`, callback)
      },
      closed(closed) {
        console.log(`closed===>`, closed)
      },
      onError: function (error) {
        console.log(`onError===>`, error)
      },
    })

    checkout.open()
  }
}

// 信用卡列表
const getCreditcardList = async () => {
  try {
    loading.value = true
    const res = await _getCreditcardList()

    console.log('_getCreditcardList', res)

    if (res.success) {
      list.value = res.data || []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 添加信用卡
const addCreditcard = async data => {
  console.log(`addCreditcard===>`, data)

  const res = await _addCreditcard(data)

  console.log('_addCreditcard', res)

  if (res.success) {
    message.success(t('common.addSuccess'))
    getCreditcardList()
  }
}

// 显示删除弹窗
const openRemoveDialog = (id: string, defaultPayStatus: number) => {
  if (defaultPayStatus === 1) {
    show.removeFail = true
  } else {
    show.removeConfirm = true
    removeId.value = id
  }
}

// 删除信用卡
const removeCreditcard = async () => {
  try {
    removeLoading.value = true

    const res = await _removeCreditcard({
      id: removeId.value,
    })

    console.log('_removeCreditcard', res)

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

// 设置默认支付信用卡
const setDefaultCreditcard = async (id: string, defaultPayStatus: number) => {
  if (defaultPayStatus === 1) return

  const res = await _setDefaultCreditcard({
    id,
  })

  console.log('_removeCreditcard', res)

  if (res.success) {
    message.success(t('capital.setSuccess'))
    getCreditcardList()
  }
}

onMounted(() => {
  getCreditcardList()
})
</script>

<style lang="scss" scoped>
.default {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--sub-text);
}

.bank-img {
  width: 24px;
  height: 24px;
}

.dialog {
  .main {
    margin-bottom: 5px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
  }

  .sub {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }
}
</style>
