<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('renewalManagement.setManualRenewal')"
    width="960px"
    destroy-on-close
    @confirm="confirm"
  >
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
      <el-table-column :label="t('renewalManagement.currentExpirationDate')" prop="expiredTime" min-width="200">
        <template #default="{ row }">
          <div class="expiredTime table-td_tooltip">
            <div>{{ row.expiredTime || '-' }}</div>
            <div style="color: #ff4d4f">
              {{ t('renewalManagement.surplusDay', [row.expiredDay || '-']) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('renewalManagement.renewalDuration')" min-width="200">
        <!-- TODO: 暂时写死一个月 -->
        <template #default>
          {{ t('renewalManagement.oneMonth') }}
        </template>
      </el-table-column>
      <el-table-column
        :label="t('renewalManagement.expirationDateAfterRenewal')"
        prop="renewExpiredDate"
        min-width="240"
      >
        <template #default />
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
    <!-- <el-checkbox v-model="diskFollow" class="mt20">
      同时续费云服务器挂载的云硬盘
    </el-checkbox> -->
  </CatDialog>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { _getRenewPrice, _modifyRenewFlag } from '@/apis/cost-center/renew'

const RENEW_TYPR = 1 // 续费类型，1：手动续费 2：自动续费

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
const time = ref({
  value: 1,
  label: t('renewalManagement.oneMonth'),
}) // 时间周期
const diskFollow = ref<boolean>(false) // 同时续费云硬盘
const productPrice = ref<any>({}) // 产品价格
const getRenewPrice = async () => {
  try {
    loading.value = true
    const { data, msg, success } = await _getRenewPrice({
      productId: productInfo.value.product.productId,
      regionId: productInfo.value.region.regionId,
      period: 1,
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
      diskFollow.value = false
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
      // diskFollow: diskFollow.value,
      ids: list.value.map(l => l.id),
    })
    if (success) {
      emits('confirm')
      message.success(msg || t('renewalManagement.setSuccess'))
      show.value = false
    } else {
      message.error(msg || t('renewalManagement.setFail'))
    }
  } finally {
    confirmLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.key-wrap {
  width: 100px;

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
</style>
