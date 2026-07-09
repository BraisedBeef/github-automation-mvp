<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.setBuyPublicIp')"
    :width="dialogWidtClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="initFn"
  >
    <div>
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="state.billingMode.value === 2 ? state.monthlyForm : state.flowForm"
        :rules="rules"
        label-position="left"
        hide-required-asterisk
      >
        <!-- 计费模式 -->
        <el-form-item :label="t('publicIp.chargeType')" prop="billingMode">
          <div class="df jsb ac w-full">
            <!-- 宽度因为英语和日语显示不下，UI说统一加宽 -->
            <BtnsGroup
              v-model="state.billingMode"
              :list="billingModeList.filter(i => eipChargeTypeList.includes(i.value))"
              :style="{ width: btnsGroupWidthClass }"
              @change-value="changeBillingMode"
            />
          </div>
        </el-form-item>
        <!-- 包年包月 -->
        <template v-if="state.billingMode.value === 2">
          <el-form-item :label="t('publicIp.regionalAffiliation')" prop="area">
            <div class="form-value">
              {{ state.regionName }}
            </div>
          </el-form-item>
          <el-form-item :label="t('publicIp.line')" prop="lineType">
            <el-radio-group
              v-model="state.monthlyForm.lineType"
              style="display: block"
              :loading="state.eipLineTypeLoading"
              @change="getQueryEipPrice"
            >
              <template v-for="(item, index) in state.eipLineTypeArr" :key="item.value">
                <div :class="index !== 0 ? 'mt15' : ''">
                  <el-radio :label="item.value">
                    {{ item.label }}
                  </el-radio>
                  <div class="radio-msg mt1">
                    {{ item.msg }}
                  </div>
                </div>
              </template>
              <!--  暂时只有常规 BGP IP  -->
              <!-- <div class="mt20">
                <el-radio :label="2">高防 EIP</el-radio>
                <div class="radio-msg mt8">配合企业版高防包，提供 Tbps 级别 DDos 全力防护，不支持转换为其他地址类型</div>
              </div> -->
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="state.showEipBandwidth" :label="t('publicIp.bandwidthLimit')" prop="size">
            <div class="df ac mb18">
              <div class="w100 mr23">
                <el-slider
                  v-model="state.monthlyForm.size"
                  :show-stops="false"
                  :min="bandwidthSliderConfig.min"
                  :max="bandwidthSliderConfig.max"
                  :marks="bandwidthSliderConfig.marks"
                  :format-tooltip="value => value + 'Mbps'"
                  @change="getQueryEipPrice"
                />
              </div>
              <div class="mr11">
                <el-input-number
                  v-model="state.monthlyForm.size"
                  :min="bandwidthSliderConfig.min"
                  :max="bandwidthSliderConfig.max"
                  @change="getQueryEipPrice"
                />
              </div>
              <div class="unit">Mbps</div>
            </div>
          </el-form-item>
          <el-form-item :label="t('publicIp.amount')" prop="num">
            <el-input-number
              v-model="state.monthlyForm.num"
              :min="1"
              :max="props.maxNum - props.useNum"
              @change="getQueryEipPrice"
            />
            <div class="radio-msg mt10">
              {{ t('publicIp.amountTip', [props.useNum, props.maxNum - props.useNum]) }}
            </div>
          </el-form-item>
          <el-form-item :label="t('publicIp.name')" prop="name">
            <div class="w230">
              <el-input v-model="state.monthlyForm.name" :placeholder="t('publicIp.namePlaceholder')" />
            </div>
          </el-form-item>
          <el-form-item :label="t('publicIp.purchaseDuration')" prop="period">
            <div class="w400">
              <el-select
                v-model="state.monthlyForm.period"
                style="width: 400px"
                class="select-opts"
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
            <div class="mt20 w-100">
              <el-checkbox v-model="state.monthlyForm.autoRenewFlag">
                {{ t('publicIp.automaticRenewal') }}
              </el-checkbox>
            </div>
          </el-form-item>
          <el-form-item v-loading="state.moneyLoading" :label="t('publicIp.publicNetworkFees')" class="no-margin-item">
            <p class="origin_value">
              {{
                state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== ''
                  ? `${state.eipPrice?.discountMoney || ''} USD`
                  : ''
              }}
            </p>
          </el-form-item>
          <!-- <el-form-item :label="t('publicIp.IPResourceCost')" prop="discountMoney" class="no-margin-item" v-loading="state.moneyLoading">
            <p class="origin_value">
              {{ state.keepMoney }} {{ state.keepMoney && state.keepMoney !== '' ? t('publicIp.IPResourceCostUnit') : '' }}
            </p>
          </el-form-item> -->
          <el-form-item label=" " prop="resourceCosts">
            <!-- 2025.2.17包年包月没有ip资源费，故不用展示--产品说的 -->
            <!-- <p class="red_value">{{ t('publicIp.IPResourceCostTip') }}</p> -->
            <el-checkbox v-model="state.resourceCosts">
              {{ t('publicIp.agree')
              }}<span class="text-primary cursor-pointer" @click.stop="toCvmArrears">{{
                t('publicIp.arrearsAgreement')
              }}</span>
            </el-checkbox>
          </el-form-item>
        </template>
        <!-- 按量和共享流量包 -->
        <template v-else>
          <!-- 所属地域 -->
          <el-form-item :label="t('publicIp.regionalAffiliation')" prop="area">
            <div class="form-value">
              {{ state.regionName }}
            </div>
          </el-form-item>
          <!-- 线路 -->
          <el-form-item :label="t('publicIp.line')" prop="lineType">
            <el-radio-group
              v-model="state.flowForm.lineType"
              style="display: block"
              :loading="state.eipLineTypeLoading"
              @change="changeLineType"
            >
              <template v-for="(item, index) in state.eipLineTypeArr" :key="item.value">
                <div :class="index !== 0 ? 'mt15' : ''">
                  <el-radio :label="item.value">
                    {{ item.label }}
                  </el-radio>
                  <div class="radio-msg mt1">
                    {{ item.msg }}
                  </div>
                </div>
              </template>
            </el-radio-group>
          </el-form-item>
          <!-- 共享流量包 -->
          <el-form-item v-if="state.billingMode.value === 3" :label="t('publicIp.flowPacket')" prop="pkgId">
            <div class="df ac">
              <div class="w500">
                <el-select
                  v-model="state.flowForm.pkgId"
                  v-loading="state.pkgLoading"
                  class="select-opts w-full"
                  :placeholder="t('publicIp.placeSelect')"
                  filterable
                  @change="changePkg"
                >
                  <el-option v-for="item in state.pkgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </div>
              <span class="ml10 cursor-pointer refresh-icon" @click="getPkgList">
                <SvgIcon name="refresh" />
              </span>
              <div class="df ac ml10 text-primary cursor-pointer" @click="createPkg">
                <span class="mr4">{{ t('publicIp.goCreate') }}</span>
                <SvgIcon name="storage-link" />
              </div>
            </div>
          </el-form-item>
          <!-- 宽带上限 -->
          <el-form-item
            v-if="state.billingMode.value !== 3 && state.showEipBandwidth"
            :label="t('publicIp.bandwidthLimit')"
            prop="size"
          >
            <div class="df ac mb18">
              <div class="w100 mr23">
                <el-slider
                  v-model="state.flowForm.size"
                  :show-stops="false"
                  :min="bandwidthSliderConfig.min"
                  :max="bandwidthSliderConfig.max"
                  :marks="bandwidthSliderConfig.marks"
                  :format-tooltip="value => value + 'Mbps'"
                  @change="getQueryEipPrice"
                />
              </div>
              <div class="mr11">
                <el-input-number
                  v-model="state.flowForm.size"
                  :step="1"
                  step-strictly
                  :min="bandwidthSliderConfig.min"
                  :max="bandwidthSliderConfig.max"
                  @change="getQueryEipPrice"
                />
              </div>
              <div class="unit">Mbps</div>
            </div>
          </el-form-item>
          <!-- 数量 -->
          <el-form-item :label="t('publicIp.amount')" prop="num">
            <el-input-number
              v-model="state.flowForm.num"
              :step="1"
              step-strictly
              :min="1"
              :max="props.maxNum - props.useNum"
              @change="getQueryEipPrice"
            />
            <div class="radio-msg mt10">
              {{ t('publicIp.amountTip', [props.useNum, props.maxNum - props.useNum]) }}
            </div>
          </el-form-item>
          <!-- 名称 -->
          <el-form-item :label="t('publicIp.name')" prop="name">
            <div class="w230">
              <el-input v-model="state.flowForm.name" :placeholder="t('publicIp.namePlaceholder')" />
            </div>
          </el-form-item>
          <!-- 公网网络费用 -->
          <el-form-item
            v-if="state.billingMode.value !== 3"
            v-loading="state.moneyLoading"
            :label="t('publicIp.publicNetworkFees')"
          >
            <p class="origin_value">
              {{
                state.eipPrice?.discountMoney && state.eipPrice?.discountMoney !== ''
                  ? `${state.eipPrice?.discountMoney || ''} USD/GB`
                  : ''
              }}
            </p>
          </el-form-item>
          <!-- IP资源费用 2025.2.17共享流量包不用展示IP资源费用（产品说的）-->
          <el-form-item
            v-if="state.billingMode.value !== 3"
            v-loading="state.moneyLoading"
            :label="t('publicIp.IPResourceCost')"
            prop="discountMoney"
            class="no-margin-item"
          >
            <p class="origin_value">
              {{ state.eipPrice?.keepMoney || '' }}
              {{
                state.eipPrice?.keepMoney && state.eipPrice?.keepMoney !== '' ? t('publicIp.IPResourceCostUnit') : ''
              }}
            </p>
          </el-form-item>
          <!-- 仅在IP闲置时收取，绑定云资源后不收取。 2025.2.17共享流量包不用展示IP资源费用tip（产品说的）-->
          <el-form-item label=" " prop="resourceCosts">
            <p v-if="state.billingMode.value !== 3" class="red_value">
              {{ t('publicIp.IPResourceCostTip') }}
            </p>
            <el-checkbox v-model="state.resourceCosts">
              {{ t('publicIp.agree')
              }}<span class="text-primary cursor-pointer" @click.stop="toCvmArrears">{{
                t('publicIp.arrearsAgreement')
              }}</span>
            </el-checkbox>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import {
  purchaseDurationOptions,
  initFlowForm,
  initMonthlyForm,
  flowFormRule,
  initMonthlyRule,
  initPkgForm,
  pkgFormRule,
} from './config'
import { billingModeList } from '../../config'
import { lineTypeList } from './config'
import { Form, FormTwo } from './type'
import { createEip, queryEipPrice, getEipLineType, getEipChargeType } from '@/apis/network/public-ip'
import { GetEipLineTypeReq } from '@/apis/network/type/public-ip'
import { message } from '@/utils/message'
import { usePublicIp } from '@/views/network/public-ip/hooks/use-public-ip'
import { toCvmArrears } from '@/utils/to-html'
import { shareTrafficPackageList } from '@/apis/network/flow-packet'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { bandwidthSliderConfig } from '@/views/network/public-ip/list/config'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogWidthMap = {
  [ja]: '824px',
  [en]: '784px',
  [zh]: '784px',
}
const btnsGroupWidthMap = {
  [ja]: '195px',
  [en]: '165px',
  [zh]: '160px',
}

const dialogWidtClass = useI18nStyle(dialogWidthMap)
const btnsGroupWidthClass = useI18nStyle(btnsGroupWidthMap)

interface PropType {
  useNum: number
  maxNum: number
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const router = useRouter()

const cvmStore = useCvmStore()

const show = ref<boolean>(false) // 弹窗显示
const formRef = ref<any>()

const rules = computed(() => {
  return state.billingMode.value === 1
    ? {
        ...flowFormRule,
        resourceCosts: [
          {
            validator: (rule, value, callback) => {
              if (state.resourceCosts) {
                callback()
              } else {
                callback(new Error(t('publicIp.agreementRule')))
              }
            },
          },
        ],
      }
    : state.billingMode.value === 2
      ? {
          ...initMonthlyRule,
          resourceCosts: [
            {
              validator: (rule, value, callback) => {
                if (state.resourceCosts) {
                  callback()
                } else {
                  callback(new Error(t('publicIp.agreementRule')))
                }
              },
            },
          ],
        }
      : {
          ...pkgFormRule,
          resourceCosts: [
            {
              validator: (rule, value, callback) => {
                if (state.resourceCosts) {
                  callback()
                } else {
                  callback(new Error(t('publicIp.agreementRule')))
                }
              },
            },
          ],
        }
})

const state = reactive<{
  regionId: number
  regionName: string
  billingMode: { label: string; value: number } // 计费模式 (tip：计费模式value为0时不允许提交！！)
  flowForm: Form
  monthlyForm: FormTwo
  resourceCosts: boolean
  eipPrice: any
  moneyLoading: boolean
  eiplineTypeList: number[]
  eipLineTypeArr: any[]
  eipLineTypeLoading: boolean
  pkgLoading: boolean
  pkgList: any[]
  showEipBandwidth: boolean
}>({
  regionId: cvmStore.areaSelect.id,
  regionName: cvmStore?.regionName,
  billingMode: { label: t('publicIp.byTraffic'), value: 1 },
  flowForm: { ...initFlowForm },
  monthlyForm: { ...initMonthlyForm },
  resourceCosts: false,
  eipPrice: {},
  moneyLoading: false,
  eiplineTypeList: [], // 当前线路列表
  eipLineTypeArr: [],
  eipLineTypeLoading: false,
  pkgLoading: false,
  pkgList: [],
  showEipBandwidth: false, // 是否显示带宽上限
})

const { loading: comfirmLoading, createPublicIp, setPublicIpOrder } = usePublicIp()

const initFn = () => {
  state.billingMode = { label: t('publicIp.byTraffic'), value: 1 }
  state.flowForm = { ...initFlowForm }
  state.monthlyForm = { ...initMonthlyForm }
  state.resourceCosts = false
  state.eipPrice = {}
  state.moneyLoading = false
  state.eiplineTypeList = [] // 当前线路列表
  state.eipLineTypeArr = []
  state.eipLineTypeLoading = false
  state.pkgLoading = false
  state.pkgList = []
  setTimeout(() => {
    formRef.value.resetFields()
  }, 150)
  show.value = false
}

// 获取列表数据
const getPkgList = async () => {
  const params = {
    regionId: cvmStore.areaSelect.id,
    pageSize: 999,
    pageIndex: 1,
    stateList: [1],
    lineType: state.flowForm.lineType as number,
  }
  state.pkgLoading = true
  try {
    const res = await shareTrafficPackageList(params)
    if (res.success) {
      state.pkgList = (res.data?.list || []).map(item => ({
        ...item,
        label: `${item.pkgUuid} | ${item.pkgName}`,
        value: item.id,
      }))
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.pkgLoading = false
  }
}

// 切换pkg
const changePkg = () => {
  state.flowForm.size = state.pkgList.find(item => item.id === state.flowForm?.pkgId)?.maxBandwidth || 1
  getQueryEipPrice()
}

const confirmHandle = async () => {
  await formRef.value?.validate()
  // 计费模式为空，不允许继续操作
  if (state.billingMode.value === 0) return message.warning(t('publicIp.chargeTypeTip'))
  const params: any = {
    ...(state.billingMode.value === 2 ? state.monthlyForm : state.flowForm),
    chargeType: state.billingMode.value,
    regionId: state.regionId,
  }
  if (state.billingMode.value === 2) {
    params.autoRenewFlag = state.monthlyForm.autoRenewFlag ? 2 : 1
  }
  const cb = () => {
    initFn()
    emits('success')
  }
  console.log('params===>', params)
  createPublicIp(params, cb)
}

// 查询价格
const getQueryEipPrice = async () => {
  const params: any =
    state.billingMode.value === 2
      ? {
          chargeType: state.billingMode.value,
          regionId: state.regionId,
          ...state.monthlyForm,
          autoRenewFlag: state.monthlyForm.autoRenewFlag ? 2 : 1,
        }
      : {
          chargeType: state.billingMode.value,
          regionId: state.regionId,
          ...state.flowForm,
        }
  state.moneyLoading = true
  try {
    const res = await queryEipPrice(params)
    if (res.success) {
      state.eipPrice = res.data
    } else {
      state.eipPrice = {}
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.moneyLoading = false
  }
}

//  查询线路
const getEipLineTypeOpt = async () => {
  const params: GetEipLineTypeReq = {
    regionId: state.regionId.toString(),
    chargeType: state.billingMode.value,
  }
  state.eipLineTypeLoading = true
  try {
    const { data: res } = await getEipLineType(params)
    state.eiplineTypeList = res || []
    state.eipLineTypeArr = lineTypeList?.filter(i => state.eiplineTypeList?.includes(i.value))
    if (!state.eipLineTypeArr.length) return
    if (state.billingMode.value === 2) {
      state.monthlyForm.lineType = state.eipLineTypeArr[0].value
      getQueryEipPrice()
    } else {
      state.flowForm.lineType = state.eipLineTypeArr[0].value
      getQueryEipPrice()
      if (state.billingMode.value === 3) {
        getPkgList()
      }
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.eipLineTypeLoading = false
  }
}

// 查询当前地域下支持的计费模式
const eipChargeTypeList = ref<any[]>([])
const getEipChargeTypeOpt = async () => {
  const res = await getEipChargeType({ regionId: state.regionId.toString() })
  eipChargeTypeList.value = res.data?.list || []
  if (res.data?.list?.length) {
    const billingMode = billingModeList.find(item => item.value === res.data?.list[0])
    changeBillingMode(billingMode)
  } else {
    state.billingMode = { label: '', value: 0 }
  }
}

// 切换计费模式
const changeBillingMode = (btn: any) => {
  state.billingMode = btn
  state.eipPrice = {}
  if (btn.value === 1) {
    state.flowForm = { ...initFlowForm, lineType: state.eipLineTypeArr.length ? state.eipLineTypeArr[0].value : '' }
  } else if (btn.value === 2) {
    state.monthlyForm = {
      ...initMonthlyForm,
      lineType: state.eipLineTypeArr.length ? state.eipLineTypeArr[0].value : '',
    }
  } else {
    state.flowForm = { ...initPkgForm, lineType: state.eipLineTypeArr.length ? state.eipLineTypeArr[0].value : '' }
  }
  setTimeout(() => {
    formRef.value.resetFields()
    getEipLineTypeOpt() //  查询线路
  }, 100)
}

// 切换线路
const changeLineType = () => {
  if (state.billingMode.value === 3) {
    state.eipPrice = {}
    state.flowForm.pkgId = ''
    getPkgList()
  } else {
    getQueryEipPrice()
  }
}

// 跳转流量包页面
const createPkg = () => {
  pushRoute({
    name: 'network_security_flow-packet_list',
  })
}

// 弹窗打开
const open = () => {
  state.regionId = cvmStore.areaSelect.id
  state.regionName = cvmStore?.regionName
  state.showEipBandwidth = cvmStore.areaSelect?.showEipBandwidth || false
  console.log(cvmStore.areaSelect, '当前地域数据')
  getEipChargeTypeOpt() // 查询当前地域下支持的计费模式
}

defineExpose({
  show,
  name: 'SetBuy',
})
</script>
<style scoped lang="scss">
.radio-msg {
  width: 100%;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px !important;
  color: #999;
}

.mt1 {
  margin-top: 3px;
}

.mt15 {
  margin-top: 15px;
}

.w100 {
  width: 100%;
}

.mb18 {
  margin-bottom: 18px;
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

.w230 {
  width: 230px;
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

.w406 {
  width: 400px;
}

.w-100 {
  width: 100%;
}

.origin_value {
  line-height: 34px;
  color: #fc8c00;
}

.red_value {
  width: 100%;
  margin: 0;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 20px !important;
  color: #fe4d4f;
}

:deep(.el-form .el-form-item .el-form-item__content .el-form-item__error) {
  position: absolute;
}

.no-margin-item {
  margin-bottom: 0 !important;
}

:deep(.el-radio, .el-radio__input) {
  display: flex !important;
  align-items: center !important;
  height: var(--input-height) !important;
  line-height: var(--input-height) !important;
}

.form-value {
  height: var(--input-height) !important;
  line-height: var(--input-height) !important;
}

.w500 {
  width: 500px;
}

.refresh-icon {
  color: #999;
}

.mr4 {
  margin-right: 4px;
}
</style>
