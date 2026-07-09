<template>
  <CatDialog
    v-model:dialog="show"
    :loading="confirmLoading"
    :title="t('renewalManagement.setAutomaticRenewal')"
    width="960px"
    destroy-on-close
    @confirm="confirm"
  >
    <!-- tips -->
    <!-- <div class="tip-wrap mb20 df ac">
      <SvgIcon name="warn-primary" class="mr4" />
      <span class="text-primary">下列资源到期后将按设定的自动续费周期续费，请确保资源到期时账户余额充足，若续费时有可用的代金券，系统将自动使用代金券续费。
      </span>
    </div> -->
    <div class="mb20">
      <Tip :text="tips" type="OneToOne" />
    </div>

    <!-- <div class="df ac mb20">
      <span class="mr20">{{ t('renewalManagement.unifiedSetAutomaticRenewal') }}</span>
      <el-select :teleported="true" class="select-tr" v-model="time" :placeholder="''" @change="getRenewPrice">
        <el-option :value="1" :label="t('renewalManagement.oneMonth')"></el-option>
        <el-option :value="2" :label="t('renewalManagement.twoMonth')"></el-option>
        <el-option :value="3" :label="t('renewalManagement.threeMonth')"></el-option>
        <el-option :value="4" :label="t('renewalManagement.fourMonth')"></el-option>
        <el-option :value="5" :label="t('renewalManagement.fiveMonth')"></el-option>
        <el-option :value="6" :label="t('renewalManagement.sixMonth')"></el-option>
        <el-option :value="7" :label="t('renewalManagement.sevenMonth')"></el-option>
        <el-option :value="8" :label="t('renewalManagement.eightMonth')"></el-option>
        <el-option :value="9" :label="t('renewalManagement.nineMonth')"></el-option>
        <el-option :value="10" :label="t('renewalManagement.tenMonth')"></el-option>
        <el-option :value="11" :label="t('renewalManagement.elevenMonth')"></el-option>
        <el-option :value="12" :label="t('renewalManagement.twelveMonths')"></el-option>
      </el-select>
    </div> -->

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
    <el-checkbox v-if="productInfo?.product?.productId == CloudServerID" v-model="diskFollow" class="mt20">
      {{ t('renewalManagement.renewalCloudHardDrive') }}
    </el-checkbox>
  </CatDialog>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _getRenewPrice, _modifyRenewFlag } from '@/apis/cost-center/renew'
import { CloudServerID } from '../config'
import { maoYunDayJs, FORMAT_TIME, FORMAT_DAY } from '@/utils/mao-yun-day-js'

const tips = computed(() => [
  {
    main: t('renewalManagement.automaticRenewalTip'),
  },
])

const RENEW_TYPR = 2 // 续费类型，1：手动续费 2：自动续费

// 操作成功
const emits = defineEmits(['confirm'])

const show = ref<boolean>() // 弹窗显示
const productInfo = ref<any>({}) // 产品信息
const list = ref<any[]>([]) // 资源列表
defineExpose({
  show,
  list,
  productInfo,
})

const loading = ref<boolean>(false)
const time = ref(1) // 时间周期
const diskFollow = ref<boolean>() // 同时续费云硬盘
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
      productPrice.value = {}
      diskFollow.value = undefined
    }
  },
)

const confirmLoading = ref<boolean>(false)
const confirm = async () => {
  try {
    confirmLoading.value = true
    const { msg, success } = await _modifyRenewFlag({
      productId: productInfo.value.product.productId,
      regionId: productInfo.value.region.regionId,
      renewType: RENEW_TYPR,
      diskFollow: diskFollow.value,
      ids: list.value.map(l => l.id),
    })
    if (success) {
      show.value = false
      message.success(msg || t('renewalManagement.setSuccess'))
      emits('confirm')
    } else {
      message.error(msg || t('renewalManagement.setFail'))
    }
  } finally {
    confirmLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.tip-wrap {
  box-sizing: border-box;
  padding: 2px 15px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 34px;
  background: #e5e8ff;

  .text-primary {
    width: 98%;
  }
}
</style>
