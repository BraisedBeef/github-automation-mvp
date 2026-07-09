<template>
  <CatDialog
    v-model:dialog="show"
    :disabled="!isSubmit() || !state.isEidt || !haveChargeTypeAndLine"
    :title="t('publicIp.adjustBandwidth')"
    width="810px"
    :loading="loading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <div>
      <el-form
        ref="formRef"
        v-loading="state.loading"
        require-asterisk-position="right"
        label-width="auto"
        :model="
          state.billingMode.value === 2 && state.detailData.chargeType === 1
            ? state.monthlyBandwidthForm
            : state.billingModeForm
        "
        label-position="left"
        :rules="rules"
        :hide-required-asterisk="true"
      >
        <!-- 计费模式 -->
        <el-form-item :label="t('publicIp.chargeType')" prop="billingMode">
          <div class="df jsb ac w-full">
            <BtnsGroup
              v-model="state.billingMode"
              :list="state.billingModeArr.filter(i => eipChargeTypeList.includes(i.value))"
              :style="{ width: '160px' }"
              @change-value="changeBillingMode"
            />
          </div>
        </el-form-item>
        <template v-if="state.billingMode.value === 2 && state.detailData.chargeType === 1">
          <template v-if="enableChangeMonthly === 2">
            <div class="pt120 pb242 text-center">
              <SvgIcon name="info-circle" style="width: 64px; height: 64px" />
              <div class="content-tip">
                {{ t('publicIp.cannotChangeBilling') }}
              </div>
              <div class="msg-tip">
                {{ t('publicIp.cannotChangeBillingTipOne')
                }}<span class="primary-tip cursor-pointer" @click="goEipList">{{
                  t('publicIp.cannotChangeBillingTipTwo')
                }}</span
                >{{ t('publicIp.cannotChangeBillingTipThree') }}
              </div>
            </div>
          </template>
          <template v-else>
            <el-form-item v-if="state.showEipBandwidth" :label="t('publicIp.currentBroadband')" prop="currentBandwidth">
              <p>{{ state.detailData.size }} Mbps</p>
            </el-form-item>
            <el-form-item v-if="state.showEipBandwidth" :label="t('publicIp.targetBandwidth')" prop="maxBandwidth">
              <div class="df ac mb20">
                <div class="w100 mr23">
                  <el-slider
                    v-model="state.monthlyBandwidthForm.maxBandwidth"
                    :disabled="!haveChargeTypeAndLine"
                    :show-stops="false"
                    :min="bandwidthSliderConfig.min"
                    :max="bandwidthSliderConfig.max"
                    :marks="bandwidthSliderConfig.marks"
                    :format-tooltip="value => value + 'Mbps'"
                    @change="queryPriceFn"
                  />
                </div>
                <div class="mr11">
                  <el-input-number
                    v-model="state.monthlyBandwidthForm.maxBandwidth"
                    :disabled="!haveChargeTypeAndLine"
                    :step="1"
                    step-strictly
                    :min="minSize"
                    :max="bandwidthSliderConfig.max"
                    @change="queryPriceFn"
                  />
                </div>
                <div class="unit">Mbps</div>
              </div>
            </el-form-item>
            <el-form-item :label="t('publicIp.purchaseDuration')" prop="period">
              <el-select
                v-model="state.monthlyBandwidthForm.period"
                class="select-opts"
                style="width: 400px"
                :placeholder="t('publicIp.purchaseDurationPlaceholder')"
                @change="queryPriceFn"
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
            </el-form-item>
            <el-form-item :label="' '" prop="autoRenewFlag">
              <el-checkbox v-model="state.monthlyBandwidthForm.autoRenewFlag">
                {{ t('publicIp.automaticRenewal') }}
              </el-checkbox>
            </el-form-item>
            <el-form-item v-loading="state.keepMoneyLoading" :label="t('publicIp.cost')" prop="cost">
              <p class="origin_value">
                {{
                  state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== ''
                    ? `${state.eipPrice?.discountMoney} USD`
                    : ''
                }}
              </p>
            </el-form-item>
            <!-- 当前产品已下架，暂不支持调整包月带宽 -->
            <div v-if="!haveChargeTypeAndLine" class="mt20">
              <Tip :text="tips" type="OneToOne" hide-margin-bottom />
            </div>
          </template>
        </template>
        <template v-else>
          <el-form-item v-if="state.showEipBandwidth" :label="t('publicIp.currentBroadband')" prop="currentBandwidth">
            <p>{{ state.detailData.size }} Mbps</p>
          </el-form-item>
          <el-form-item v-if="state.showEipBandwidth" :label="t('publicIp.targetBandwidth')" prop="maxBandwidth">
            <div class="df ac mb20">
              <div class="w100 mr23">
                <el-slider
                  v-model="state.billingModeForm.maxBandwidth"
                  :disabled="!haveChargeTypeAndLine"
                  :show-stops="false"
                  :min="bandwidthSliderConfig.min"
                  :max="bandwidthSliderConfig.max"
                  :marks="bandwidthSliderConfig.marks"
                  :format-tooltip="value => value + 'Mbps'"
                  @change="queryPriceFn"
                />
              </div>
              <div class="mr11">
                <el-input-number
                  v-model="state.billingModeForm.maxBandwidth"
                  :disabled="!haveChargeTypeAndLine"
                  :step="1"
                  step-strictly
                  :min="minSize"
                  :max="bandwidthSliderConfig.max"
                  @change="queryPriceFn"
                />
              </div>
              <div class="unit">Mbps</div>
            </div>
          </el-form-item>
          <el-form-item :label="t('publicIp.effectiveTime')" prop="effectiveTime">
            <p class="origin_value">
              {{ t('publicIp.withImmediateEffect') }}
            </p>
          </el-form-item>
          <el-form-item v-loading="state.keepMoneyLoading" :label="t('publicIp.cost')" prop="cost">
            <p class="origin_value">
              {{ getShowPrice() }}
            </p>
          </el-form-item>
          <!-- 当前产品已下架，暂不支持调整包月带宽 -->
          <div v-if="!haveChargeTypeAndLine" class="mt20">
            <Tip :text="tips" type="OneToOne" hide-margin-bottom />
          </div>
        </template>
      </el-form>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { Form, FormTwo } from './type'
import { purchaseDurationOptions } from '../set-buy/config'
import { adjustingBillingModeList } from '../../config'
import {
  getEipDetail,
  batchUpdateEip,
  queryUpdateBandwidthPrice,
  queryEipPrice,
  getEipChargeType,
  getEipLineType,
} from '@/apis/network/public-ip'
import { usePublicIp } from '@/views/network/public-ip/hooks/use-public-ip'
import { message } from '@/utils/message'
import { lineTypeList } from '../set-buy/config'
import { bandwidthSliderConfig } from '@/views/network/public-ip/list/config'
import { GetEipLineTypeReq } from '@/apis/network/type/public-ip'
import { pushRoute } from '@/utils/router-jump'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main:
      state.billingMode.value === 1 ? t('publicIp.unsurpportChargeTypeTip1') : t('publicIp.unsurpportChargeTypeTip2'),
  },
])

const cvmStore = useCvmStore()
const route = useRoute()
const router = useRouter()

const show = ref<boolean>(false) // 弹窗显示
const detailId = ref<number>() //  弹性公网ip Id
const enableChangeMonthly = ref<number>() // 允许切换包月计费模式标识  1 允许切换 2 不允许切换
const formRef = ref<any>()

const state = reactive<{
  loading: boolean // 弹窗loading
  detailData: any // 弹性公网ip详情
  billingMode: { label: string; value: number } // 计费模式
  billingModeForm: Form
  monthlyBandwidthForm: FormTwo
  billingModeArr: any[]
  eipPrice: any
  keepMoneyLoading: boolean
  oldValue: any
  isEidt: boolean // 是否调整了网络
  showEipBandwidth: boolean // 是否显示带宽
}>({
  loading: false,
  detailData: {},
  billingMode: { label: t('publicIp.byTraffic'), value: 1 },
  billingModeForm: { maxBandwidth: 1 }, // 按流量计费表单数据
  monthlyBandwidthForm: {
    // 包月带宽表单数据
    maxBandwidth: 1,
    period: 1,
    autoRenewFlag: false,
  },
  billingModeArr: [...adjustingBillingModeList],
  eipPrice: {},
  keepMoneyLoading: false,
  oldValue: null,
  isEidt: false,
  showEipBandwidth: false,
})

const { loading, adjustNetwork, setPublicIpOrder } = usePublicIp()

const rules = {
  period: [{ required: true, message: '', trigger: 'blur' }],
}

// 判断是否能提交
const isSubmit = () => {
  if (state.billingMode.value === 2 && state.detailData.chargeType === 1) {
    return state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== '' ? true : false
  } else {
    if (state.billingMode.value === 2 && state.detailData.chargeType === 2) {
      return state.eipPrice?.upgradeMoney && state.eipPrice?.upgradeMoney !== '' ? true : false
    }
    return state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== '' ? true : false
  }
}

// 切换计费模式
const changeBillingMode = (btn: any) => {
  state.billingMode = btn
  getEipLineTypeOpt() // 获取到了当前项计费模式 - 查询支持的线路
  if (state.billingMode.value === 2 && enableChangeMonthly.value === 2) return // 如果不允许切换包月计费模式不用询价
  if (state.billingMode.value === 2 && state.detailData.chargeType === 2) {
    getQueryUpdateBandwidthPrice()
  } else {
    getQueryEipPrice()
  }
}

// 这里根据详情里面是否允许减少带宽来设置最小宽带的值
const minSize = computed(() => {
  return state.detailData.enableReduceBandwidth ? 1 : state.detailData.size
})

// 获取详情
const getEipDetailFn = async () => {
  const params = { eipId: detailId.value as number }
  state.loading = true
  try {
    const res = await getEipDetail(params)
    state.loading = false
    if (res.success) {
      state.detailData = res.data
      state.billingMode = adjustingBillingModeList.find(item => item.value === (res.data?.chargeType || 1)) as {
        label: string
        value: number
      }
      getEipLineTypeOpt() // 获取到了当前项计费模式 - 查询支持的线路
      state.monthlyBandwidthForm = {
        maxBandwidth: res.data?.size || 1,
        period: res.data?.period || 1,
        autoRenewFlag: false,
      }
      state.billingModeForm = { maxBandwidth: res.data?.size || 1 }
      // 计费模式只能从按流量切换到包年包月，不能从包年包月切换到按流量
      if (res.data?.chargeType === 2) {
        state.billingModeArr = adjustingBillingModeList.map(item => ({
          ...item,
          disabled: item.value === 1 ? true : false,
        }))
      }
      if (state.billingMode.value === 2 && state.detailData.chargeType === 2) {
        getQueryUpdateBandwidthPrice()
      } else {
        getQueryEipPrice()
      }
    } else {
      message.warning(res.msg)
    }
    // 监听当前是否对网络进行修改 - 控制是否能提交确定
    state.oldValue = JSON.parse(JSON.stringify([state.billingModeForm, state.monthlyBandwidthForm, state.billingMode]))
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

const confirmHandle = async () => {
  const params: any = {
    eipIds: [detailId.value as number],
    chargeType: state.billingMode.value,
    maxBandwidth: state.billingModeForm.maxBandwidth,
  }
  console.log(state.monthlyBandwidthForm, 'state.monthlyBandwidthForm')

  // 计费模式从按流量切换到包年包月需要传（包年包月时长和是否自动续费两个字段）
  if (state.billingMode.value === 2 && state.detailData.chargeType === 1) {
    if (enableChangeMonthly.value === 2) {
      goEipList()
      return
    }
    await formRef.value?.validate()
    params.maxBandwidth = state.monthlyBandwidthForm.maxBandwidth
    params.period = state.monthlyBandwidthForm.period
    params.autoRenewFlag = state.monthlyBandwidthForm.autoRenewFlag ? 2 : 1
  } else {
    params.autoRenewFlag = state.detailData.renewFlag // 自动续费默认传递当前的
    if (state.billingMode.value === 2 && state.detailData.chargeType === 2) {
      params.period = state.eipPrice.month // 包月时长
    }
  }
  const cb = () => {
    loading.value = false
    closeFn()
    emits('success')
  }

  // 包年包月
  if (state.billingMode.value === 2) {
    adjustNetwork(params, cb)
  } else {
    // 按量计费
    adjustNetwork(params, cb)
  }
}

// 获取价格
const getQueryUpdateBandwidthPrice = async () => {
  const params: any = {
    eipId: detailId.value,
    chargeType: state.billingMode.value,
    size: state.billingModeForm.maxBandwidth,
  }
  state.keepMoneyLoading = true
  try {
    const res = await queryUpdateBandwidthPrice(params)
    if (res.success) {
      state.eipPrice = res.data
    } else {
      console.log(res)

      state.eipPrice = {}
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.keepMoneyLoading = false
  }
}
// 从按量计费调整宽带或按量计费切包年包月
// 查询价格
const getQueryEipPrice = async () => {
  if (state.monthlyBandwidthForm.period === '' && state.billingMode.value === 2) return
  const params: any = {
    regionId: cvmStore.areaSelect.id,
    chargeType: state.billingMode.value,
    num: 1,
    lineType: state.detailData?.lineType, // 线路
    size:
      state.billingMode.value === 2 && state.detailData.chargeType === 1
        ? state.monthlyBandwidthForm.maxBandwidth
        : state.billingModeForm.maxBandwidth,
  }
  if (state.billingMode.value === 2 && state.detailData.chargeType === 1) {
    params.period = state.monthlyBandwidthForm.period
    params.autoRenewFlag = state.monthlyBandwidthForm.autoRenewFlag ? 2 : 1 // 自动续费
  }
  state.keepMoneyLoading = true
  try {
    const res = await queryEipPrice(params)
    if (res.success) {
      state.eipPrice = res.data
    } else {
      state.eipPrice = {}
      // message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.keepMoneyLoading = false
  }
}

// 切换带宽大小或调整月份查询价格
const queryPriceFn = () => {
  if (state.billingMode.value === 2 && state.detailData.chargeType === 2) {
    getQueryUpdateBandwidthPrice()
  } else {
    getQueryEipPrice()
  }
}

// 计算显示的价格
const getShowPrice = () => {
  if (state.billingMode.value === 2 && state.detailData.chargeType === 2) {
    return `${state.eipPrice?.upgradeMoney || 0} USD`
  }
  return `${state.eipPrice?.discountMoney || 0} USD/GB`
}

// 跳转eip列表
const goEipList = () => {
  if (route.name === 'network_security_public_ip_list') {
    closeFn()
  } else {
    pushRoute({
      name: 'network_security_public_ip_list',
    })
  }
}

watch(
  [() => state.billingModeForm, () => state.monthlyBandwidthForm, () => state.billingMode],
  newValue => {
    console.log(state.oldValue, 'state.oldValue')
    console.log(newValue, 'newValue')
    if (state.billingMode.value === 1 || (state.billingMode.value === 2 && state.detailData?.chargeType === 2)) {
      if (state.oldValue[0]?.maxBandwidth !== newValue[0]?.maxBandwidth) {
        state.isEidt = true
        console.log(1)
      } else {
        state.isEidt = false
        console.log(2)
      }
    } else {
      if (
        state.oldValue[1]?.autoRenewFlag !== newValue[1]?.autoRenewFlag ||
        state.oldValue[1]?.maxBandwidth !== newValue[1]?.maxBandwidth ||
        state.oldValue[1]?.period !== newValue[1]?.period ||
        state.oldValue[2]?.value !== newValue[2]?.value // 按小时的切换成包年包月的 需要多判断一次 因为这里默认有购买时长
      ) {
        state.isEidt = true
        console.log(3)
      } else {
        state.isEidt = false
        console.log(4)
      }
    }
  },
  { deep: true },
)

const closeFn = () => {
  loading.value = false
  state.loading = false
  state.detailData = {}
  state.billingMode = { label: t('publicIp.byTraffic'), value: 1 }
  state.billingModeForm = { maxBandwidth: 1 }
  state.monthlyBandwidthForm = {
    maxBandwidth: 1,
    period: 1,
    autoRenewFlag: false,
  }
  state.billingModeArr = [...adjustingBillingModeList]
  formRef.value?.resetFields()
  show.value = false
  eipChargeTypeList.value = []
}

// 查询当前地域下支持的计费模式
const eipChargeTypeList = ref<any[]>([])
const getEipChargeTypeOpt = async () => {
  const res = await getEipChargeType({ regionId: cvmStore.areaSelect.id })
  eipChargeTypeList.value = res.data?.list || []
}

//  查询当前地域和计费模式下支持的线路
const eiplineTypeList = ref<any[]>([])
const getEipLineTypeOpt = async () => {
  const params: GetEipLineTypeReq = {
    regionId: cvmStore.areaSelect.id,
    chargeType: state.billingMode.value,
  }
  try {
    const { data: res } = await getEipLineType(params)
    eiplineTypeList.value = res || []
  } catch (err) {
    console.log('error', err)
  }
}

// 检查当前eip计费模式是否在当前地域下支持的计费模式中 and 当前eip的线路是否在计费模式支持的线路中
const haveChargeTypeAndLine = computed(() => {
  return (
    eipChargeTypeList.value.includes(state.billingMode.value) &&
    eiplineTypeList.value.includes(state.detailData?.lineType)
  )
})

// 弹窗打开
const open = () => {
  console.log(cvmStore.areaSelect, '当前地域数据')
  state.showEipBandwidth = cvmStore.areaSelect?.showEipBandwidth || false
  getEipChargeTypeOpt()
}

defineExpose({
  show,
  detailId,
  enableChangeMonthly,
  getEipDetailFn,
})
</script>
<style scoped lang="scss">
// :deep(.el-form .el-form-item) {
//   margin-bottom: 8px;
// }
.w100 {
  width: 100%;
}

.mb20 {
  margin-bottom: 20px;
}

.mr23 {
  margin-right: 23px;
}

.mr11 {
  margin-right: 11px;
}

.unit {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #000;
}

.flex1 {
  flex: 1;
}

.tr {
  text-align: right;
}

.progress-number {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #999;
}

.origin_value {
  color: #fc8c00;
}

.select-msg {
  height: 22px;
  padding: 0 8px;
  margin-left: 16px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  color: #fc8c00;
  border: 1px solid #fc8c00;
  border-radius: 11px;
}

.pt120 {
  padding-top: 120px;
}

.pb242 {
  padding-bottom: 242px;
}

.text-center {
  text-align: center;
}

.content-tip {
  margin-top: 12px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 18px;
  font-weight: bold;
  line-height: 24px;
  color: rgb(0 0 0 / 85%);
  text-align: center;
}

.msg-tip {
  margin-top: 8px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #555;
  text-align: center;
}

.primary-tip {
  color: var(--primary-color);
}
</style>
