<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('flowPacket.buyFlowPacket')"
    :width="dialogWidtClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <div class="form-wrap">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="state.form"
        :rules="rules"
        label-position="left"
        :hide-required-asterisk="true"
        :show-message="false"
      >
        <!-- 所属地域 -->
        <el-form-item :label="t('flowPacket.regional')" prop="regionId" required>
          <div>
            <div class="w406">
              <el-select
                v-model="state.form.regionId"
                class="select-opts w-full"
                :placeholder="t('flowPacket.pleaseSelect')"
                @change="setRegionValue"
              >
                <el-option v-for="item in state.areaList" :key="item.id" :label="item.regionName" :value="item.id" />
              </el-select>
            </div>
            <div class="item-tip mt10">
              {{ t('flowPacket.regionalTip') }}
            </div>
          </div>
        </el-form-item>
        <!-- 线路 -->
        <el-form-item :label="t('flowPacket.line')" prop="lineType" required class="mb10">
          <div class="df fw m-h-42 cost-type_list">
            <div
              v-for="(item, index) in state.eipLineTypeList"
              :key="index"
              class="cost-type cursor-pointer"
              :class="state.form.lineType === item.value && 'cost-type-actived'"
              @click="changeLineType(item.value)"
            >
              {{ item.label }}
            </div>
          </div>
        </el-form-item>
        <!-- 带宽上限 -->
        <el-form-item :label="t('flowPacket.maxBandwidth')" prop="maxBandwidth" required>
          <div>
            <div class="w406">
              <el-select
                v-model="state.form.maxBandwidth"
                class="select-opts w-full"
                :placeholder="t('flowPacket.pleaseSelect')"
                @change="changeMaxBandwidth"
              >
                <el-option
                  v-for="item in state.maxBandwidthList"
                  :key="item.maxBandwidth"
                  :label="item.maxBandwidthLabel"
                  :value="item.maxBandwidth"
                />
              </el-select>
            </div>
          </div>
        </el-form-item>
        <!-- 购买时长 -->
        <el-form-item :label="t('flowPacket.purchaseDuration')" prop="duration" required>
          <div>
            <div class="w406">
              <el-select
                v-model="state.form.duration"
                class="select-opts w-full"
                :placeholder="t('flowPacket.pleaseSelect')"
                @change="changeDuration"
              >
                <el-option
                  v-for="item in state.durationList"
                  :key="item.durationLabel"
                  :label="item.durationLabel"
                  :value="item.durationLabel"
                />
              </el-select>
            </div>
            <div class="item-tip mt10">
              {{ t('flowPacket.purchaseDurationTip') }}
            </div>
          </div>
        </el-form-item>
        <!-- 规格 -->
        <el-form-item :label="t('flowPacket.specifications')" prop="size" required class="mb10">
          <div class="df fw m-h-42 cost-type_list">
            <div
              v-for="(item, index) in state.sizeList"
              :key="index"
              class="cost-type cursor-pointer"
              :class="state.form.size === item.sizeLabel && 'cost-type-actived'"
              @click="changeSize(item.sizeLabel)"
            >
              {{ item.sizeLabel }}
            </div>
          </div>
        </el-form-item>
        <!-- 数量 -->
        <el-form-item :label="t('flowPacket.number')" prop="num" required>
          <el-input-number v-model="state.form.num" :step="1" step-strictly :min="1" />
        </el-form-item>
        <!-- 配置费用 -->
        <el-form-item :label="t('flowPacket.configurationCost')" class="no-margin-item" prop="resourceCosts" required>
          <div>
            <p class="origin_value">
              {{ getPrice }}
            </p>
            <div>
              <el-checkbox v-model="state.form.resourceCosts">
                {{ t('flowPacket.agree') }}
                <span class="text-primary cursor-pointer" @click.stop="toCvmAgreementFn(state.form.resourceCosts)">{{
                  t('flowPacket.maoyunServiceAgreement')
                }}</span
                >、<span
                  class="text-primary cursor-pointer"
                  @click.stop="toCvmFlowPacketFn(state.form.resourceCosts)"
                  >{{ t('flowPacket.flowPacketRefundInstructions') }}</span
                >
              </el-checkbox>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div class="mt20">
        <!-- tip -->
        <Tip :text="tips" type="OneToOne" hide-margin-bottom />
      </div>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import { useCvmStore } from '@/store'
import t from '@/utils/i18n'
import { FormInstance, FormRules, imageViewerEmits } from 'element-plus/es'
import { lineTypeList } from '@/views/network/public-ip/list/config'
import { getEipLineType } from '@/apis/network/public-ip'
import {
  getShareTrafficPackageConfigList,
  createShareTrafficPackage,
  getShareTrafficPackageRegionList,
} from '@/apis/network/flow-packet'
import { message } from '@/utils/message'
import { uniqueArray } from '@/utils/collection-utils'
import { DURATION_UNIT_MAP } from '../../config'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { toCvmAgreement, toCvmFlowPacket } from '@/utils/to-html'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const dialogWidthMap = {
  [ja]: '800px',
  [en]: '760px',
  [zh]: '720px',
}

const dialogWidtClass = useI18nStyle(dialogWidthMap)

interface PropType {
  initEipLineTypeList: any[]
  initRegionId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const tips = computed(() => [
  {
    main: t('flowPacket.buyFlowPacketTip'),
  },
])

const { toPrePayOrder } = usePreProductOrder()

const cvmStore = useCvmStore()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)

const state = reactive<{
  form: any
  areaList: any[] // 地域列表
  eipLineTypeList: any[] // 线路类型列表
  configList: any[] // 流量包配置列表
  maxBandwidthList: any[] // 带宽上限列表
  durationList: any[] // 购买时长列表
  sizeList: any[] // 规格列表
  price: number | string // 价格
  configId: number // 共享流量包配置id
}>({
  form: {
    regionId: '',
    lineType: '',
    maxBandwidth: '',
    duration: '',
    size: '',
    num: 1,
    resourceCosts: false,
  },
  areaList: [],
  eipLineTypeList: [],
  configList: [],
  maxBandwidthList: [],
  durationList: [],
  sizeList: [],
  price: '',
  configId: NaN,
})

// 计算价格
const getPrice = computed(() => {
  if (
    state.price &&
    state.form.num &&
    state.form.lineType &&
    state.form.maxBandwidth &&
    state.form.duration &&
    state.form.size
  ) {
    return `${(state.price as number) * state.form.num} USD`
  }
  return '0 USD'
})

const rules = {
  resourceCosts: [
    {
      validator: (rule, value, callback) => {
        if (value) {
          callback()
        } else {
          callback(new Error(''))
        }
      },
    },
  ],
}

// 点击查看协议
const toCvmAgreementFn = (status: boolean) => {
  state.form.resourceCosts = !status // 点击查看协议时不触发勾选
  toCvmAgreement()
}
const toCvmFlowPacketFn = (status: boolean) => {
  state.form.resourceCosts = !status // 点击查看协议时不触发勾选
  toCvmFlowPacket()
}

// 查询地域列表
const getShareTrafficPackageRegionListFn = async () => {
  try {
    const res = await getShareTrafficPackageRegionList()
    if (res?.data && res.data.length > 0) {
      state.areaList = res.data
      if (state.areaList.find(item => item.id === props.initRegionId)) {
        state.form.regionId = props.initRegionId
      } else {
        state.form.regionId = state.areaList[0].id
      }
      setRegionValue()
    }
  } catch (err) {
    console.log('err', err)
  }
}

// 查询地区下支持的EIP线路
const getEipLineTypeFn = async () => {
  const params = {
    chargeType: 1,
    regionId: state.form.regionId,
  }
  state.form.lineType = ''
  try {
    const res = await getEipLineType(params)
    if (res.success) {
      const list = lineTypeList.filter(item => (res.data || []).includes(item.value))
      state.eipLineTypeList = list
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  }
}
// 切换EIP线路
const changeLineType = async val => {
  state.form.lineType = val
  const params = {
    regionId: state.form.regionId,
    lineType: val,
  }
  state.form.maxBandwidth = ''
  state.form.duration = ''
  state.form.size = ''
  state.maxBandwidthList = []
  state.durationList = []
  state.sizeList = []
  try {
    formRef.value?.validateField('lineType')
  } catch (err) {
    console.log('err', err)
  }
  try {
    const res = await getShareTrafficPackageConfigList(params)
    if (res.success) {
      state.configList = (res.data || []).map(item => ({
        ...item,
        maxBandwidthLabel: `${item.maxBandwidth} Mbps`,
        durationLabel: `${item.duration}${DURATION_UNIT_MAP.find(val => val.value === item.durationUnit)?.label}`,
        sizeLabel: `${item.size}${item.unit}`,
      }))
      state.maxBandwidthList = uniqueArray(state.configList, 'maxBandwidthLabel')
      setLineValue()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  }
}

// 切换宽带上线
const changeMaxBandwidth = () => {
  state.form.duration = ''
  state.form.size = ''
  state.sizeList = []
  state.durationList = uniqueArray(state.configList, 'durationLabel', item => {
    return item.maxBandwidth === state.form.maxBandwidth
  })
  if (state.durationList.length > 0) {
    const durationValue = state.durationList[0]
    state.form.duration = durationValue.durationLabel
    changeDuration()
  }
}
// 切换购买时长
const changeDuration = () => {
  state.form.size = ''
  state.sizeList = uniqueArray(state.configList, 'sizeLabel', item => {
    return item.maxBandwidth === state.form.maxBandwidth && item.durationLabel === state.form.duration
  })
}
// 切换规格
const changeSize = value => {
  state.form.size = value
  const configItem = state.configList.find(item => {
    return (
      item.maxBandwidth === state.form.maxBandwidth &&
      item.durationLabel === state.form.duration &&
      item.sizeLabel === value
    )
  })
  state.configId = configItem?.id
  state.price = configItem?.price
  try {
    formRef.value?.validateField('size')
  } catch (err) {
    console.log('err', err)
  }
}

const confirmHandle = async () => {
  await formRef.value?.validate()
  const params = {
    regionId: state.form.regionId,
    configId: state.configId,
    num: state.form.num,
  }
  comfirmLoading.value = true
  try {
    const res = await createShareTrafficPackage(params)
    if (res.success) {
      res.data?.serialNo && toPrePayOrder(res.data?.serialNo, 'flow_packet')
      closeFn()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    comfirmLoading.value = false
  }
}

// 设置配置默认值
const setLineValue = async () => {
  if (state.maxBandwidthList.length > 0) {
    const maxBandwidtValue = state.maxBandwidthList[0]
    state.form.maxBandwidth = maxBandwidtValue.maxBandwidth
    changeMaxBandwidth()
    const durationValue = state.durationList[0]
    state.form.duration = durationValue.durationLabel
    changeDuration()
  }
}

// 设置地域值
const setRegionValue = async () => {
  await getEipLineTypeFn()
  if (state.eipLineTypeList.length > 0) {
    const lineTypeValue = state.eipLineTypeList[0].value
    state.form.lineType = lineTypeValue
    await changeLineType(lineTypeValue)
    setLineValue()
  }
}

const open = () => {
  getShareTrafficPackageRegionListFn()
}

const closeFn = () => {
  state.form = {
    regionId: '',
    lineType: '',
    maxBandwidth: '',
    duration: '',
    size: '',
    num: 1,
    resourceCosts: false,
  }
  state.eipLineTypeList = []
  state.configList = []
  state.maxBandwidthList = []
  state.durationList = []
  state.sizeList = []
  state.price = ''
  state.configId = NaN
  formRef.value?.resetFields()
  show.value = false
}

defineExpose({
  show,
})
</script>
<style lang="scss" scoped>
.w406 {
  width: 406px;
}

.item-tip {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  line-height: 17px !important;
  color: #999;
}

.cost-type {
  min-width: 116px;
  height: 32px;
  padding: 0 9px;
  margin-right: 8px;
  margin-bottom: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 32px;
  color: #000;
  text-align: center;
  background: #eaebf1;
  border: 1px solid #eaebf1;
  border-radius: 4px;
}

.cost-type-actived {
  color: #fff;
  background: #0063ff;
  border-color: #0063ff;
}

.origin_value {
  height: 34px;
  line-height: 34px;
  color: #fc8c00;
}

.no-margin-item {
  margin-bottom: 0 !important;
}

:deep(.el-form) {
  .is-error {
    .el-checkbox__inner {
      border-color: var(--el-color-danger);
    }

    .cost-type {
      border-color: var(--el-color-danger);

      // color: var(--el-color-danger);
      // background-color: #fff;
    }
  }
}

.fw {
  flex-wrap: wrap;
}

.mb10 {
  margin-bottom: 10px !important;
}

.m-h-42 {
  min-height: 42px;
}
</style>
