<template>
  <CatDialog
    v-model:dialog="show"
    :disabled="!isSubmit() || !state.isEidt || !haveChargeType"
    :title="t('publicIp.adjustmentNetwork')"
    width="1000px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <p class="df ac jsb mb20">
      <span class="len">{{ t('publicIp.selectedInsNumber', [insList.length || 0]) }}</span>
      <span class="text-primary close cursor-pointer" @click="state.isCollapse = !state.isCollapse">{{
        state.isCollapse ? t('publicIp.retract') : t('publicIp.expand')
      }}</span>
    </p>
    <ElCollapseTransition>
      <div v-show="state.isCollapse">
        <el-table :data="state.exampleList" class="mt20 table mb20">
          <!-- ID/名称 -->
          <el-table-column min-width="160" :label="t('publicIp.idOrName')">
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary">
                  {{ row.insUuid }}
                </div>
                <div class="text-over">
                  {{ row.instanceName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- IP地址 -->
          <el-table-column min-width="150" :label="t('publicIp.ipArea')">
            <template #default="{ row }">
              <div>
                <div v-if="row.mainPublicIp" class="df ac">
                  <Copy :text="row.mainPublicIp" />{{ t('publicIp.public') }}
                </div>
                <div v-if="row.mainPrivateIp" class="df ac">
                  <Copy :text="row.mainPrivateIp" />{{ t('publicIp.intranet') }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 网络计费模式/带宽 -->
          <el-table-column min-width="200" :label="t('publicIp.networkBillingMode')">
            <template #default="{ row }">
              <div>
                <p>{{ INS_NETWORK_CHANGE_TYPE_MAP[row.chargeType] }}</p>
                <p>{{ row.bandwidth }}Mbps</p>
              </div>
            </template>
          </el-table-column>
          <!-- 是否支持更换包月宽带 -->
          <el-table-column min-width="200" :label="t('publicIp.canChangeBilling')" show-overflow-tooltip>
            <template #header>
              <el-tooltip
                :content="t('publicIp.canChangeBilling')"
                :disabled="!canChangeBillingHeaderOverflow"
                effect="light"
                placement="top"
              >
                <span
                  ref="canChangeBillingHeaderRef"
                  class="table-header-overflow"
                  @mouseenter="updateCanChangeBillingHeaderOverflow"
                >
                  {{ t('publicIp.canChangeBilling') }}
                </span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              {{ row.cannotChangeMonthlly ? t('publicIp.yes') : t('publicIp.deny') }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </ElCollapseTransition>

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="formRef"
        v-loading="state.loading"
        require-asterisk-position="right"
        label-width="auto"
        :model="
          state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 1
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
        <template v-if="state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 1">
          <template v-if="state.enableChangeMonthlyList.length > 0">
            <div class="pt40 pb40 text-center">
              <SvgIcon name="info-circle" style="width: 64px; height: 64px" />
              <div class="content-tip">
                {{ t('publicIp.hasCannotChange') }}
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
            <el-form-item v-if="state.showEipBandwidth" :label="t('publicIp.targetBandwidth')" prop="maxBandwidth">
              <div class="df ac mb20">
                <div class="w100 mr23">
                  <el-slider
                    v-model="state.monthlyBandwidthForm.maxBandwidth"
                    :disabled="!haveChargeType"
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
                    :disabled="!haveChargeType"
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
                class="select-opts w-full w300"
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
                  // state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== ''
                  //   ? `${state.eipPrice?.discountMoney} USD/GB`
                  //   : ''
                  `${state.eipPrice?.discountMoney || 0} USD`
                }}
              </p>
            </el-form-item>
            <!-- 当前产品已下架，暂不支持调整包月带宽 -->
            <div v-if="!haveChargeType" class="mt20">
              <Tip :text="tips" type="OneToOne" hide-margin-bottom />
            </div>
          </template>
        </template>
        <template v-else>
          <el-form-item v-if="state.showEipBandwidth" :label="t('publicIp.targetBandwidth')" prop="maxBandwidth">
            <div class="df ac mb20">
              <div class="w100 mr23">
                <el-slider
                  v-model="state.billingModeForm.maxBandwidth"
                  :disabled="!haveChargeType"
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
                  :disabled="!haveChargeType"
                  :min="minSize"
                  :max="bandwidthSliderConfig.max"
                  @change="queryPriceFn"
                />
              </div>
              <div class="unit">Mbps</div>
            </div>
          </el-form-item>
          <el-form-item v-loading="state.keepMoneyLoading" :label="t('publicIp.cost')" prop="cost">
            <p class="origin_value">
              {{ getShowPrice() }}
            </p>
          </el-form-item>
          <!-- 当前产品已下架，暂不支持调整包月带宽 -->
          <div v-if="!haveChargeType" class="mt20">
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
import { message } from '@/utils/message'
import { ElCollapseTransition } from 'element-plus'
import { INS_NETWORK_CHANGE_TYPE_MAP } from '@/views/cvm/ins/config'
import { purchaseDurationOptions } from '@/views/network/public-ip/list/components/set-buy/config'
import { adjustingBillingModeList } from '@/views/network/public-ip/list/config'
import { Form, FormTwo } from './type'
import {
  batchUpdateEip,
  queryUpdateBandwidthPrice,
  queryEipPrice,
  getEipChargeType,
  getEipLineType,
} from '@/apis/network/public-ip'
import { usePublicIp } from '@/views/network/public-ip/hooks/use-public-ip'
import { lineTypeList } from '@/views/network/public-ip/list/components/set-buy/config'
import { bandwidthSliderConfig } from '@/views/network/public-ip/list/config'
import { GetEipLineTypeReq } from '@/apis/network/type/public-ip'
import { pushRoute } from '@/utils/router-jump'

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
  type: 'stoped',
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const router = useRouter()

const show = ref<boolean>(false) // 弹窗显示

const formRef = ref<any>()
const canChangeBillingHeaderRef = ref<HTMLElement>()
const canChangeBillingHeaderOverflow = ref(false)

const updateCanChangeBillingHeaderOverflow = () => {
  const el = canChangeBillingHeaderRef.value
  canChangeBillingHeaderOverflow.value = el ? el.scrollWidth > el.clientWidth : false
}

const state = reactive<{
  isCollapse: boolean
  exampleList: any[] // 实例列表
  comfirmLoading: boolean // 弹窗提交loading
  loading: boolean // 弹窗loading
  billingMode: { label: string; value: number } // 计费模式
  billingModeForm: Form
  monthlyBandwidthForm: FormTwo
  billingModeArr: any[]
  eipPrice: any
  keepMoneyLoading: boolean
  isEidt: boolean // 是否调整了网络
  oldValue: any
  enableChangeMonthlyList: any[] // 不允许切换成包年包月计费模式的列表
  showEipBandwidth: boolean
}>({
  isCollapse: true,
  exampleList: [],
  comfirmLoading: false,
  loading: false,
  billingMode: { label: t('publicIp.byTraffic'), value: 1 },
  billingModeForm: { maxBandwidth: 1 }, // 按流量计费表单数据
  monthlyBandwidthForm: {
    // 包月带宽表单数据
    maxBandwidth: 1,
    period: '',
    autoRenewFlag: false,
  },
  billingModeArr: [...adjustingBillingModeList],
  eipPrice: {},
  keepMoneyLoading: false,
  isEidt: false, // 是否调整了网络
  oldValue: null,
  enableChangeMonthlyList: [],
  showEipBandwidth: false,
})

const { loading, adjustNetwork, setPublicIpOrder } = usePublicIp()

const tips = computed(() => [
  {
    main:
      state.billingMode.value === 1 ? t('publicIp.unsurpportChargeTypeTip1') : t('publicIp.unsurpportChargeTypeTip2'),
  },
])

// 判断是否能提交
const isSubmit = () => {
  if (state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 1) {
    return state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== '' ? true : false
  } else {
    if (state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 2) {
      return state.eipPrice?.upgradeMoney && state.eipPrice?.upgradeMoney !== '' ? true : false
    }
    return state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== '' ? true : false
  }
}

const rules = {
  period: [{ required: true, message: '', trigger: 'blur' }],
}

// 切换计费模式
const changeBillingMode = (btn: any) => {
  state.billingMode = btn
  getEipLineTypeOpt() // 查询支持的线路
  state.eipPrice = {} // 清除价格显示
  if (state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 2) {
    getQueryUpdateBandwidthPrice()
  } else {
    getQueryEipPrice()
  }
}

// 这里根据详情里面是否允许减少带宽来设置最小宽带的值
const minSize = computed(() => {
  return state.exampleList[0]?.chargeType === 1 ? 1 : state.exampleList[0]?.bandwidth
})

// 获取价格
const getQueryUpdateBandwidthPrice = async () => {
  const eipInfo = state.exampleList[0]?.eipInfo
  const params: any = {
    eipId: eipInfo?.eipId,
    chargeType: state.billingMode.value,
    size: state.billingModeForm.maxBandwidth,
  }
  state.keepMoneyLoading = true
  try {
    const res = await queryUpdateBandwidthPrice(params)
    if (res.success) {
      state.eipPrice = res.data
    } else {
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
  if (state.monthlyBandwidthForm.period === '' && state.billingMode.value === 2) return // 包年包月必须传购买时长才允许查询，按量不用
  const params: any = {
    chargeType: state.billingMode.value,
    regionId: cvmStore.areaSelect.id,
    size:
      state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 1
        ? state.monthlyBandwidthForm.maxBandwidth
        : state.billingModeForm.maxBandwidth,
    num: 1,
    lineType: state.exampleList[0]?.eipInfo?.lineType,
  }
  if (state.billingMode.value === 2) {
    params.period = state.monthlyBandwidthForm.period // 包月时长
  }
  state.keepMoneyLoading = true
  try {
    const res = await queryEipPrice(params)
    if (res.success) {
      state.eipPrice = res.data
    } else {
      state.eipPrice = {}
      // message.warning(res?.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.keepMoneyLoading = false
  }
}

// 切换带宽大小或调整月份查询价格
const queryPriceFn = () => {
  if (state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 2) {
    getQueryUpdateBandwidthPrice()
  } else {
    getQueryEipPrice()
  }
}

// 计算显示的价格
const getShowPrice = () => {
  // if (state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 2) {
  //   return state.eipPrice?.upgradeMoney && state.eipPrice?.upgradeMoney !== ''
  //     ? `${state.eipPrice?.upgradeMoney} USD`
  //     : ''
  // }
  // return state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== ''
  //   ? `${state.eipPrice?.discountMoney} USD/GB`
  //   : ''
  if (state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 2) {
    return `${state.eipPrice?.upgradeMoney || 0} USD`
  }
  return `${state.eipPrice?.discountMoney || 0} USD/GB`
}

const confirmHandle = async () => {
  const params: any = {
    eipIds: state.exampleList.map(item => item.eipId),
    chargeType: state.billingMode.value,
    maxBandwidth: state.billingModeForm.maxBandwidth,
  }
  // 计费模式从按流量切换到包年包月需要传（包年包月时长和是否自动续费两个字段）
  if (state.billingMode.value === 2 && state.exampleList[0].chargeType === 1) {
    if (state.enableChangeMonthlyList.length > 0) {
      goEipList()
      return
    }
    await formRef.value?.validate()
    params.maxBandwidth = state.monthlyBandwidthForm.maxBandwidth
    params.period = state.monthlyBandwidthForm.period
    params.autoRenewFlag = state.monthlyBandwidthForm.autoRenewFlag ? 2 : 1
  } else {
    params.autoRenewFlag = state.exampleList[0]?.eipInfo?.renewFlag
    params.period = state.eipPrice?.month // 包月时长
  }

  const cb = () => {
    setTimeout(() => {
      state.comfirmLoading = false
      closeFn()
      emits('success')
    }, 5000)
  }

  const list = [
    {
      productName: t('publicIp.publicIp'),
      product: 'eip',
      type: 'publicIp.adjustmentNetwork',
      price:
        state.billingMode.value === 2 && state.exampleList[0].chargeType === 2
          ? state.eipPrice?.monthDiscountPrice // 接口待修改！
          : state.eipPrice?.monthDiscountPrice,
      // price: state.eipPrice?.monthDiscountPrice,
      num: 1,
      duration: params.period,
      amount:
        state.billingMode.value === 2 && state.exampleList[0].chargeType === 2 // 升配
          ? state.eipPrice?.discountMoney
          : state.eipPrice?.discountMoney,
      // amount: state.eipPrice?.discountMoney,
      // eipBandwidth: params.maxBandwidth,
      // // 目前只有一个 所以写死了  最好还是让后端在接口返回eip的lineType字段
      // eipLine: lineTypeList.find(item => item.value === 1)?.label,
      // eipRegion: cvmStore?.regionName || '',
      configs: [
        {
          key: 'cvmCpm.bandwidth',
          value: `${params.maxBandwidth}Mbps`,
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

  // 包年包月
  if (state.billingMode.value === 2) {
    // setPublicIpOrder(params, list, state.eipPrice?.discountMoney, 'adjust')
    adjustNetwork(params, cb)
  } else {
    // 按量计费
    state.comfirmLoading = true
    adjustNetwork(params, cb)
  }
}

// 跳转弹性公网ip列表
const goEipList = () => {
  pushRoute({
    name: 'network_security_public_ip_list',
  })
}

const closeFn = () => {
  state.isCollapse = true
  state.exampleList = []
  state.comfirmLoading = false
  state.loading = false
  state.billingMode = { label: t('publicIp.byTraffic'), value: 1 }
  state.billingModeForm = { maxBandwidth: 1 }
  state.monthlyBandwidthForm = {
    maxBandwidth: 1,
    period: '',
    autoRenewFlag: false,
  }
  state.billingModeArr = [...adjustingBillingModeList]
  state.eipPrice = {}
  state.keepMoneyLoading = false
  state.enableChangeMonthlyList = []
  formRef.value?.resetFields()
  show.value = false
}
// 弹窗打开
const open = () => {
  console.log(cvmStore.areaSelect, '当前地域数据')
  state.showEipBandwidth = cvmStore.areaSelect?.showEipBandwidth || false
  getEipChargeTypeOpt()
  const enableChangeMonthlyList: any[] = []
  state.exampleList = props.insList.map(item => {
    const networkInfo = item.networkInfos.find(item => item.primaryType === 1)
    const eipInfo = networkInfo.eips[0]
    if (eipInfo?.chargeType === 1 && eipInfo?.enableChangeMonthly === 2) {
      enableChangeMonthlyList.push({
        insUuid: item.insUuid,
        insName: item.instanceName,
        ...eipInfo,
      })
    }
    return {
      id: item.id,
      insUuid: item.insUuid,
      instanceName: item.instanceName,
      mainPublicIp: networkInfo?.mainPublicIp || '',
      mainPrivateIp: networkInfo?.mainPrivateIp || '',
      eipId: eipInfo?.eipId || '',
      chargeType: eipInfo?.chargeType || '',
      bandwidth: eipInfo?.bandwidth || '',
      eipInfo,
      cannotChangeMonthlly: eipInfo?.chargeType === 1 && eipInfo?.enableChangeMonthly === 2,
    }
  })
  state.enableChangeMonthlyList = enableChangeMonthlyList
  // 计费模式只能从按流量切换到包年包月，不能从包年包月切换到按流量
  // **** if 当前是包年包月的 ****
  if (state.exampleList[0]?.chargeType === 2) {
    state.billingMode = { label: t('publicIp.monthlyBroadbandPackage'), value: 2 } // 包年包月模式下进入默认切换计费模式
    state.billingModeArr = adjustingBillingModeList.map(item => ({
      ...item,
      disabled: item.value === 1 ? true : false,
    }))
  }
  getEipLineTypeOpt() // 查询支持的线路
  state.billingModeForm = { ...state.billingModeForm, maxBandwidth: state.exampleList[0]?.eipInfo?.bandwidth } // 设置默认的流量带宽
  queryPriceFn()
  // 监听当前是否对网络进行修改 - 控制是否能提交确定
  state.oldValue = JSON.parse(JSON.stringify([state.billingModeForm, state.monthlyBandwidthForm]))
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

// 检查当前eip计费模式是否在当前地域下支持的计费模式中
const haveChargeType = computed(() => {
  return (
    eipChargeTypeList.value.includes(state.billingMode.value) &&
    eiplineTypeList.value.includes(state.exampleList[0]?.eipInfo?.lineType)
  )
})

watch(
  [() => state.billingModeForm, () => state.monthlyBandwidthForm, () => state.billingMode],
  newValue => {
    if (state.billingMode.value === 1 || (state.billingMode.value === 2 && state.exampleList[0]?.chargeType === 2)) {
      if (state.oldValue[0]?.maxBandwidth !== newValue[0]?.maxBandwidth) {
        state.isEidt = true
      } else {
        state.isEidt = false
      }
    } else {
      if (
        state.oldValue[1]?.autoRenewFlag !== newValue[1]?.autoRenewFlag ||
        state.oldValue[1]?.maxBandwidth !== newValue[1]?.maxBandwidth ||
        state.oldValue[1]?.period !== newValue[1]?.period
      ) {
        state.isEidt = true
      } else {
        state.isEidt = false
      }
    }
  },
  { deep: true },
)

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.len {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;
}

.close {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #0063ff;
}

.form-wrap {
  /* width: 55%; */
  .date-text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .slider-wrap {
    .el-slider {
      margin-top: 0;
      margin-left: 12px;
    }
  }
}

.mr10 {
  margin-right: 10px;
}

.password-wrap {
  position: relative;
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }
}

:deep(.el-form .el-form-item) {
  margin-bottom: 15px;
}

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

.w300 {
  width: 300px;
}

.pt40 {
  padding-top: 40px;
}

.pb40 {
  padding-bottom: 40px;
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

.table-header-overflow {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
