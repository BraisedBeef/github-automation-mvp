<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.renew')"
    width="900px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <el-form
      ref="formRef"
      require-asterisk-position="right"
      label-width="auto"
      :model="state.form"
      :rules="rules"
      label-position="left"
    >
      <el-form-item :label="t('publicIp.purchaseDuration')" prop="period">
        <div class="w406">
          <el-select
            v-model="state.form.period"
            class="select-opts w-full"
            :placeholder="t('publicIp.purchaseDurationPlaceholder')"
            @change="getQueryEipPrice"
          >
            <el-option
              v-for="item in purchaseDurationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <div class="df ac opt-wrap w-full h-full">
                <div>{{ item.label }}</div>
                <!-- 暂时没有做折扣，此处4.0折扣显示隐藏 -->
                <!-- <div class="select-msg">{{ item.msg }}</div> -->
              </div>
            </el-option>
          </el-select>
        </div>
      </el-form-item>
    </el-form>
    <div class="msg mb20 mt20">
      {{ t('publicIp.selectEipNumber') }}
    </div>
    <el-table :data="list" class="mb20 table">
      <!-- ID/名称 -->
      <el-table-column min-width="180" :label="t('publicIp.idOrName')">
        <template #default="{ row }">
          <div class="text-primary">
            {{ row.eipUuid }}
          </div>
          <div>{{ row.name }}</div>
        </template>
      </el-table-column>
      <!-- 网络计费模式/带宽 -->
      <el-table-column min-width="220" :label="t('publicIp.networkBillingMode')">
        <template #default="{ row }">
          <p>{{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}</p>
          <p>{{ row?.size }} Mps</p>
        </template>
      </el-table-column>
      <!-- 到期时间 -->
      <el-table-column min-width="220" :label="t('publicIp.expirationDate')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('publicIp.expirationDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <div>
            {{ row?.deadlineTime && row.chargeType === 2 ? maoYunDayJs(row?.deadlineTime).format(FORMAT_TIME) : '-' }}
          </div>
        </template>
      </el-table-column>
      <!-- 续费后到期时间 -->
      <el-table-column min-width="220" :label="t('publicIp.afterRenewalExpirationDate')">
        <template #header>
          <div class="df ac table-header-ellipsis">
            <el-tooltip
              :content="t('publicIp.afterRenewalExpirationDate')"
              :disabled="!afterRenewalExpirationDateHeaderOverflow"
              placement="top"
              effect="light"
            >
              <span
                ref="afterRenewalExpirationDateHeaderRef"
                class="mr10 table-header-ellipsis__text"
                @mouseenter="updateAfterRenewalExpirationDateHeaderOverflow"
              >
                {{ t('publicIp.afterRenewalExpirationDate') }}
              </span>
            </el-tooltip>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <p>{{ row.expirationTime ? maoYunDayJs(row.expirationTime).format(FORMAT_TIME) : '-' }}</p>
        </template>
      </el-table-column>
    </el-table>
    <el-checkbox v-model="state.form.autoRenewFlag">
      {{ t('publicIp.renewTip') }}
    </el-checkbox>
  </CatDialog>
</template>
<script lang="ts" setup>
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { purchaseDurationOptions } from '../set-buy/config'
import { chargeTypeList, calculateDaysFromNow } from '../../config'
import { renewEip, queryUpdateBandwidthPrice, queryEipPrice } from '@/apis/network/public-ip'
import { message } from '@/utils/message'
import { usePublicIp } from '@/views/network/public-ip/hooks/use-public-ip'
import { lineTypeList } from '../set-buy/config'
import dayjs from 'dayjs'

// interface PropType {
//     list: any[]
// }

// const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()

const { loading, setPublicIpOrder, renewNetwork } = usePublicIp()

const show = ref<boolean>(false)
const list = ref<any[]>([])
const eipId = ref<number>(NaN)
const formRef = ref<any>()
const afterRenewalExpirationDateHeaderRef = ref<HTMLElement>()
const afterRenewalExpirationDateHeaderOverflow = ref(false)

const state = reactive<{
  comfirmLoading: boolean
  form: { period: number | string; autoRenewFlag: boolean }
  eipPrice: any
}>({
  comfirmLoading: false,
  form: { period: '', autoRenewFlag: false },
  eipPrice: {},
})

const rules = {
  period: [{ required: true, message: '', trigger: 'blur' }],
}

// 查询价格
const getQueryEipPrice = async () => {
  list.value = list.value.map(i => {
    const totalDay = calculateDaysFromNow(i.deadlineTime, state.form.period as number) // 计算续费后到期时间
    i.expirationTime = i.deadlineTime + totalDay
    return i
  })

  const eipInfo = list.value[0]
  const params: any = {
    chargeType: 2,
    regionId: cvmStore.areaSelect.id,
    size: eipInfo?.size,
    num: 1,
    period: state.form.period || 1,
    autoRenew: state.form.autoRenewFlag,
    lineType: eipInfo?.lineType,
  }
  try {
    const res = await queryEipPrice(params)
    if (res.success) {
      state.eipPrice = res.data
    } else {
      state.eipPrice = {}
    }
  } catch (err) {
    console.log('error', err)
  }
}

const confirmHandle = async () => {
  await formRef.value?.validate()
  const params: any = {
    eipId: eipId.value,
    period: state.form.period,
    autoRenewFlag: state.form.autoRenewFlag ? 2 : 1,
  }
  const eipInfo = list.value[0]
  const arr = [
    {
      productName: t('publicIp.publicIp'),
      product: 'eip',
      type: t('publicIp.renew'),
      price: state.eipPrice?.discountPrice,
      num: 1,
      duration: params.period,
      amount: state.eipPrice?.discountMoney,
      eipBandwidth: eipInfo?.size,
      eipLine: lineTypeList.find(item => item.value === eipInfo.lineType)?.label,
      eipRegion: cvmStore?.regionName || '',
      configs: [
        {
          key: 'cvmCpm.bandwidth',
          value: `${eipInfo.size}Mbps`,
        },
        {
          key: 'cvmCpm.line',
          value: lineTypeList.find(item => item.value === 1)?.label,
        },
        {
          key: 'cvmCpm.region',
          value: cvmStore?.regionName || '',
        },
      ],
    },
  ]
  // setPublicIpOrder(params, arr, state.eipPrice?.discountMoney, 'renew')
  renewNetwork(params)
}

const closeFn = () => {
  state.comfirmLoading = false
  state.form = { period: '', autoRenewFlag: false }
  formRef.value.resetFields()
  show.value = false
}

const open = () => {
  // 自动续费 - 赋值
  if (list.value.length > 0) {
    state.form.autoRenewFlag = list.value[0]?.renewFlag === 2 ? true : false
  }
  getQueryEipPrice()
  observeAfterRenewalExpirationDateHeader()
}

const updateAfterRenewalExpirationDateHeaderOverflow = () => {
  requestAnimationFrame(() => {
    const el = afterRenewalExpirationDateHeaderRef.value
    afterRenewalExpirationDateHeaderOverflow.value = !!el && el.scrollWidth > el.clientWidth
  })
}

let afterRenewalExpirationDateHeaderResizeObserver: ResizeObserver | undefined

const observeAfterRenewalExpirationDateHeader = async () => {
  await nextTick()

  afterRenewalExpirationDateHeaderResizeObserver?.disconnect()
  if (afterRenewalExpirationDateHeaderRef.value) {
    afterRenewalExpirationDateHeaderResizeObserver = new ResizeObserver(updateAfterRenewalExpirationDateHeaderOverflow)
    afterRenewalExpirationDateHeaderResizeObserver.observe(afterRenewalExpirationDateHeaderRef.value)
    afterRenewalExpirationDateHeaderResizeObserver.observe(
      afterRenewalExpirationDateHeaderRef.value.parentElement || afterRenewalExpirationDateHeaderRef.value,
    )
  }

  updateAfterRenewalExpirationDateHeaderOverflow()
}

onMounted(() => {
  observeAfterRenewalExpirationDateHeader()
})

onUnmounted(() => {
  afterRenewalExpirationDateHeaderResizeObserver?.disconnect()
})

defineExpose({
  show,
  list,
  eipId,
})
</script>
<style lang="scss" scoped>
.msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #555;
}

.mb9 {
  margin-bottom: 9px;
}

.mb18 {
  margin-bottom: 18px;
}

.w406 {
  width: 406px;
}

.w-100 {
  width: 100%;
}

.table-header-ellipsis {
  width: 100%;
  min-width: 0;

  .table-header-ellipsis__text {
    display: block;
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
