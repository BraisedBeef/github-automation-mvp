<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('renewalManagement.renewal')"
    :confirm-text="t('renewalManagement.nextStep')"
    width="960px"
    destroy-on-close
    @confirm="confirm"
  >
    <div class="df ac mb20">
      <span class="mr20">{{ t('renewalManagement.renewalDuration') }}</span>
      <el-select v-model="time" :teleported="true" class="select-tr" :placeholder="''" @change="getRenewPrice">
        <el-option :value="1" :label="t('renewalManagement.oneMonth')" />
        <el-option :value="2" :label="t('renewalManagement.twoMonth')" />
        <el-option :value="3" :label="t('renewalManagement.threeMonth')" />
        <el-option :value="4" :label="t('renewalManagement.fourMonth')" />
        <el-option :value="5" :label="t('renewalManagement.fiveMonth')" />
        <el-option :value="6" :label="t('renewalManagement.sixMonth')" />
        <el-option :value="7" :label="t('renewalManagement.sevenMonth')" />
        <el-option :value="8" :label="t('renewalManagement.eightMonth')" />
        <el-option :value="9" :label="t('renewalManagement.nineMonth')" />
        <el-option :value="10" :label="t('renewalManagement.tenMonth')" />
        <el-option :value="11" :label="t('renewalManagement.elevenMonth')" />
        <el-option :value="12" :label="t('renewalManagement.twelveMonths')" />
      </el-select>
    </div>
    <el-table v-loading="loading" :data="list" show-overflow-tooltip>
      <el-table-column :label="t('renewalManagement.resourceIdOrName')" prop="resourceId" min-width="260">
        <template #default="{ row }">
          <div class="table-td_tooltip">
            <TableCopy :text="row.resourceId" />
            <TableCopy :text="row.resourceName" />
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('renewalManagement.productDesc')" min-width="220">
        <template #default="{ row }">
          <!-- <div style="padding: 5px 0;display: inline-block;"> -->
          <div class="table-td_tooltip">
            <div v-for="product in row.productDescList" :key="product" class="text-over">
              {{ product }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('renewalManagement.currentExpirationDate')" prop="expiredTime" min-width="220">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('renewalManagement.currentExpirationDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <div class="expiredTime table-td_tooltip">
            <div>{{ row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '-' }}</div>
            <div style="color: #ff4d4f">
              {{ t('renewalManagement.surplusDay', [row.expiredDay || '-']) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('renewalManagement.renewalDuration')" min-width="200">
        <!-- <template #default> {{ t('renewalManagement.oneMonth') }} </template> -->
        <template #default>
          {{
            t(
              `renewalManagement.${{ 1: 'oneMonth', 2: 'twoMonth', 3: 'threeMonth', 4: 'fourMonth', 5: 'fiveMonth', 6: 'sixMonth', 7: 'sevenMonth', 8: 'eightMonth', 9: 'nineMonth', 10: 'tenMonth', 11: 'elevenMonth', 12: 'twelveMonths' }[time]}`,
            )
          }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('renewalManagement.expirationDateAfterRenewal')"
        prop="renewExpiredDate"
        min-width="220"
      >
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('renewalManagement.expirationDateAfterRenewal') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span>{{ row.renewExpiredDate ? maoYunDayJs(row.renewExpiredDate).format(FORMAT_DAY) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('renewalManagement.priceDesc')" prop="price" min-width="200">
        <template #header>
          <div class="df ac">
            <div>{{ t('renewalManagement.priceDesc') }}</div>
            <el-tooltip class="box-item" effect="dark" placement="top-start">
              <template #content>
                {{ t('renewalManagement.adjustmentPriceTip') }}
              </template>
              <SvgIcon name="cat-cdn-tip" style="margin-left: 5px" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }"> {{ toFixed(row.originalPrice) }} {{ t('renewalManagement.unit') }} </template>
      </el-table-column>
      <el-table-column :label="t('renewalManagement.renewalAmount')" prop="amount" min-width="200">
        <template #default="{ row }"> {{ toFixed(row.amount) }} {{ t('renewalManagement.unit') }} </template>
      </el-table-column>
    </el-table>

    <div class="mt20 df">
      <div class="wrap-left">
        <div class="key-wrap">
          <span class="key">{{ t('renewalManagement.price') }}</span>
        </div>
        <div class="key-wrap mt20">
          <span class="key">{{ t('renewalManagement.discountInformation') }}</span>
        </div>
      </div>
      <div class="wrap-right">
        <div>
          <span class="price-text mr10">{{ toFixed(productPrice.amount) }} {{ t('renewalManagement.unit') }}</span>
          <span class="text-underline line-through"
            >{{ toFixed(productPrice.originalAmount) }} {{ t('renewalManagement.unit') }}</span
          >
        </div>
        <div class="mt20">
          {{ t('renewalManagement.noAvailableCoupons') }}
        </div>
      </div>
    </div>

    <!-- <div class="mt20 df ac">
      <div class="key-wrap">
        <span class="key">{{ t('renewalManagement.price') }}</span>
      </div>
    </div>
    <div class="mt20 df ac">
      <div class="key-wrap">
        <span class="key">{{ t('renewalManagement.discountInformation') }}</span>
      </div>
      <span>{{ t('renewalManagement.noAvailableCoupons') }}</span>
    </div> -->
  </CatDialog>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _getRenewPrice, _renewOrder } from '@/apis/cost-center/renew'
import { useProductOrder } from '@/views/cost-center/hooks/use-product-order'
import { maoYunDayJs, FORMAT_TIME, FORMAT_DAY } from '@/utils/mao-yun-day-js'

const { createProductOrder } = useProductOrder()

// 操作成功
const emits = defineEmits(['confirm'])

const show = ref<boolean>(false) // 弹窗显示
const productInfo = ref<any>({}) // 产品信息
const list = ref<any[]>([]) // 资源列表
defineExpose({
  show,
  list,
  productInfo,
})

const loading = ref<boolean>(false)
const time = ref(1) // 时间周期
const productPrice = ref<any>({}) // 产品价格
const getRenewPrice = async () => {
  try {
    loading.value = true
    const { data, msg, success } = await _getRenewPrice({
      productId: productInfo.value.product.productId,
      regionId: productInfo.value.region.regionId,
      period: time.value,
      ids: list.value.map(l => l.id),
    })
    if (success) {
      productPrice.value = data
      list.value = data?.list.map(p => {
        const l = list.value.find(l => l.id === p.id) || {}
        return {
          ...l,
          ...p,
        }
      })
    } else {
      message.error(msg || t('renewalManagement.failedAcquisitionPrice'))
    }
  } finally {
    loading.value = false
  }
}
const toFixed = (num: number, n: number = 2) => {
  return num ? num.toFixed(2) : '- '
}

watch(
  () => show.value,
  () => {
    if (show.value) {
      getRenewPrice()
    } else {
      list.value = []
      productInfo.value = {}
    }
  },
)

const confirmLoading = ref<boolean>(false)
const confirm = async () => {
  try {
    confirmLoading.value = true
    const { msg, success, data } = await _renewOrder({
      productId: productInfo.value.product.productId,
      regionId: productInfo.value.region.regionId,
      period: time.value,
      ids: list.value.map(l => l.id),
    })
    if (success) {
      show.value = false
      emits('confirm')
      // 跳转到订单详情页
      createProductOrder(data.serialNo, 'renew')
    } else {
      message.error(msg || t('renewalManagement.operationFailed'))
    }
  } finally {
    confirmLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.key-wrap {
  // width: 100px;

  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
  }
}

.mr10 {
  margin-right: 10px;
}

.text-underline {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--sub-text);
}

.line-through {
  text-decoration: line-through;
}

.price-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--warning-color);
}

.wrap-left {
  margin-right: 20px;
}
</style>
