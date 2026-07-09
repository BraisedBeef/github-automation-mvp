<template>
  <div class="custom-fixed-v2">
    <div class="custom-fixed-v2__inner">
      <div class="custom-fixed-v2__left">
        <div class="custom-fixed-v2__selected">
          <span class="custom-fixed-v2__selected-prefix">已选</span>
          <span class="custom-fixed-v2__selected-value">{{ insConfigSelect }}</span>
        </div>

        <div class="custom-fixed-v2__controls">
          <div v-if="isTimeCost(store.costTypeConfig.cur)" class="custom-fixed-v2__item">
            <span class="custom-fixed-v2__item-label">{{ t('ins.custom.durate') }}</span>
            <el-select
              v-model="store.periodNum"
              :teleported="false"
              class="custom-fixed-v2__select"
              :placeholder="t('ins.custom.duratePh')"
            >
              <el-option v-for="item in INS_DURATION_MAP" :key="item.value" :value="item.value" :label="item.label" />
            </el-select>
          </div>

          <div class="custom-fixed-v2__item">
            <span class="custom-fixed-v2__item-label">{{ t('ins.custom.num') }}</span>
            <el-input-number
              v-model="store.insCountConfig.num"
              :min="store.insCountConfig.min"
              :max="store.insCountConfig.max"
              class="custom-fixed-v2__number"
              @change="
                () => {
                  if (!store.insCountConfig.num) {
                    store.insCountConfig.num = store.insCountConfig.min
                  }
                }
              "
            />
          </div>
        </div>
      </div>

      <div class="custom-fixed-v2__right">
        <div class="custom-fixed-v2__price-panel">
          <div class="custom-fixed-v2__price-main">
            <span class="custom-fixed-v2__price-label">配置费用：</span>
            <div class="custom-fixed-v2__price-cluster">
              <span class="custom-fixed-v2__price-amount">${{ allPrice.sum }}</span>
              <span class="custom-fixed-v2__price-unit">USD</span>
            </div>
          </div>
          <div v-if="allPrice.coupon" class="custom-fixed-v2__price-save">
            <span class="custom-fixed-v2__price-save-label">原价：</span>
            <span class="custom-fixed-v2__price-save-value">${{ allPrice.coupon + allPrice.sum }} USD</span>
          </div>
        </div>

        <el-button v-if="info.showPre" class="custom-fixed-v2__ghost-btn" @click="changeStep('pre', step)">
          {{ t('ins.custom.pre') }}
        </el-button>

        <el-button
          v-if="info.showNext"
          type="primary"
          class="custom-fixed-v2__primary-btn"
          :loading="nextLoading"
          @click="changeStep('next', step)"
        >
          {{ info.btnText }}
        </el-button>

        <el-button
          v-if="step === 'c' && checkPermission(permMap.ins.CREATE_VM)"
          type="primary"
          class="custom-fixed-v2__primary-btn"
          :loading="finalLoading"
          @click="changeStep('next', step)"
        >
          {{ info.btnText }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NP from 'number-precision'
import t from '@/utils/i18n'
import { INS_DURATION_MAP, isFlowCost, isTimeCost } from '@/views/cvm/ins/config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

NP.enableBoundaryChecking(false)

interface PropType {
  step: string
  finalLoading?: boolean
  nextLoading?: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  step: 'a',
  finalLoading: false,
  nextLoading: false,
})

const emits = defineEmits<{
  (event: 'changeStep', value: string): void
}>()

const infoMap = {
  a: {
    showPre: false,
    showNext: true,
    btnText: t('ins.custom.setNet'),
  },
  b: {
    showPre: true,
    showNext: true,
    btnText: t('ins.custom.setConfig'),
  },
  c: {
    showPre: true,
    showNext: false,
    btnText: t('ins.custom.open'),
  },
}

const { createInstanceInquiry, createInsPrice, cvmInsCreateStore: store } = useIns()

const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: 0,
})

const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const showNetworkSingle = computed(() => {
  if (store.publicIpConfig.checked) {
    return isFlowCost(store.publicIpConfig.chargeTypeCur)
  }

  return false
})

const allPrice = computed(() => {
  let sum = 0
  let coupon = 0

  const keys = showNetworkSingle.value
    ? ['dataDiskPrice', 'imagePrice', 'instancePrice', 'systemDiskPrice']
    : ['dataDiskPrice', 'imagePrice', 'instancePrice', 'networkPrice', 'systemDiskPrice']

  for (const key of keys) {
    sum = NP.plus(sum, createInsPrice[key]?.discountPrice || 0)
    coupon = NP.plus(coupon, NP.minus(createInsPrice[key]?.originalPrice || 0, createInsPrice[key]?.discountPrice || 0))
  }

  return {
    sum,
    coupon,
  }
})

const insConfigSelect = computed(() => {
  const insRes = store.insConfig.rowCur
  const text = t('ins.custom.checkInsDesc', [insRes?.specificationName, insRes?.typeName, insRes?.vcpus, insRes?.ram])

  return insRes?.id ? text : '-'
})

const info = computed(() => infoMap[props.step])

const changeStep = (key: string, value: string) => {
  const newStep = key === 'pre' ? (value === 'b' ? 'a' : 'b') : value === 'a' ? 'b' : 'c'
  emits('changeStep', newStep)
}

const insIquiry = async (changeStepValue: boolean) => {
  const params: any = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    specificationId: store.insConfig.rowCur.id,
    instanceCount: store.insCountConfig.num,
    imageId: store.sysConfig.imageCur,
    imageType: store.sysConfig.imageTypeCur,
    systemDiskType: store.sysDiskForm.diskType,
    systemDiskSize: store.sysDiskForm.size,
    dataDisks: store.dataDiskFormList.map(el => ({
      diskType: el.tableData[0].diskType,
      diskSize: el.tableData[0].size,
      diskCount: el.tableData[0].diskCount,
      snapshotId: el.tableData[0].snapshot.id || 0,
    })),
    instanceChargeType: store.costTypeConfig.cur,
  }

  let ipParams: any = {}

  if (store.publicIpConfig.checked && changeStepValue) {
    ipParams = {
      openEip: 1,
      lineType: store.publicIpConfig.lineTypeCur,
      chargeType: store.publicIpConfig.chargeTypeCur,
      num: 1,
      cascadeRelease: 1,
    }

    if (store.publicIpConfig.chargeTypeCur === 2) {
      ipParams.size = store.publicIpConfig.size
      ipParams.autoRenewFlag = 1
      ipParams.period = store.periodNum
    }

    if (store.publicIpConfig.chargeTypeCur === 1) {
      ipParams.size = store.publicIpConfig.size
    }
  } else {
    ipParams = {
      openEip: 2,
      cascadeRelease: 1,
    }
  }

  params.eipInfo = ipParams

  if (isTimeCost(store.costTypeConfig.cur)) {
    params.periodNum = store.periodNum
  }

  createInstanceInquiry(params)
}

const insIquiryFn = () => {
  if (!store.region.id) return
  if (!store.zoneConfig.cur.id) return
  if (!store.insConfig.rowCur.id) return
  if (!store.insCountConfig.num) return
  if (isTimeCost(store.costTypeConfig.cur) && !store.periodNum) return
  if (!store.sysConfig.imageCur) return
  if (!store.sysConfig.imageTypeCur) return
  if (!store.sysDiskForm.diskType) return
  if (!store.sysDiskForm.size) return
  if (!store.costTypeConfig.cur) return

  if (store.dataDiskFormList?.length) {
    const validDataDisk = store.dataDiskFormList.every(el => el.tableData[0].diskType && el.tableData[0].size)
    if (!validDataDisk) return
  }

  if (store.changeStep && store.publicIpConfig.checked) {
    if (!store.publicIpConfig.lineTypeCur) return
    if (!store.publicIpConfig.chargeTypeCur) return
  }

  insIquiry(store.changeStep)
}

watch(
  () => [
    store.region,
    store.zoneConfig,
    store.insConfig,
    store.insCountConfig,
    store.periodNum,
    store.sysConfig,
    store.sysDiskForm,
    store.dataDiskFormList,
    store.costTypeConfig,
    store.publicIpConfig.checked,
    store.publicIpConfig.chargeTypeCur,
    store.publicIpConfig.lineTypeCur,
  ],
  () => {
    insIquiryFn()
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => store.region,
  () => {
    permConfig.regionId = store.region.id
  },
  {
    deep: true,
    immediate: true,
  },
)

defineExpose({
  createInsPrice,
  insIquiryFn,
})
</script>

<style scoped lang="scss">
.custom-fixed-v2 {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  background: #fff;
  border-top: 1px solid #e8ecf3;
}

.custom-fixed-v2__inner {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  min-height: 126px;
  padding: 24px 56px;
}

.custom-fixed-v2__left {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.custom-fixed-v2__selected {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.custom-fixed-v2__selected-prefix,
.custom-fixed-v2__selected-value {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.custom-fixed-v2__selected-prefix {
  flex-shrink: 0;
}

.custom-fixed-v2__selected-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-fixed-v2__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 32px;
  align-items: center;
}

.custom-fixed-v2__item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.custom-fixed-v2__item-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.custom-fixed-v2__select {
  width: 240px;
}

.custom-fixed-v2__number {
  width: 140px;
}

.custom-fixed-v2__right {
  display: flex;
  flex-shrink: 0;
  gap: 24px;
  align-items: center;
}

.custom-fixed-v2__price-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 252px;
}

.custom-fixed-v2__price-main {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.custom-fixed-v2__price-label {
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.custom-fixed-v2__price-cluster {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.custom-fixed-v2__price-amount {
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  color: #ff7a00;
}

.custom-fixed-v2__price-unit {
  font-size: 14px;
  line-height: 22px;
  color: #ff7a00;
}

.custom-fixed-v2__price-save {
  display: flex;
  gap: 2px;
  align-items: center;
  margin-top: -2px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.custom-fixed-v2__price-save-value {
  text-decoration: line-through;
}

.custom-fixed-v2__primary-btn,
.custom-fixed-v2__ghost-btn {
  min-width: 160px;
  height: 48px;
  margin-left: 0 !important;
  font-size: 16px;
  font-weight: 500;
  border-radius: 0;
}

.custom-fixed-v2__ghost-btn {
  color: #06f;
  background: #fff;
  border-color: #bcd3ff;
}

:deep(.custom-fixed-v2__select .el-select__wrapper) {
  min-height: 40px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.custom-fixed-v2__number .el-input__wrapper) {
  box-shadow: none;
}

:deep(.custom-fixed-v2__number.el-input-number) {
  width: 104px;
}

:deep(.custom-fixed-v2__number .el-input-number__decrease),
:deep(.custom-fixed-v2__number .el-input-number__increase) {
  width: 34px;
  color: #50596a;
  background: #f9fafc;
  border-color: #dcdfe6;
}

:deep(.custom-fixed-v2__number .el-input-number__decrease) {
  left: 0;
}

:deep(.custom-fixed-v2__number .el-input-number__increase) {
  right: 0;
}

:deep(.custom-fixed-v2__number .el-input-number__decrease),
:deep(.custom-fixed-v2__number .el-input-number__increase),
:deep(.custom-fixed-v2__number .el-input-number__decrease:hover),
:deep(.custom-fixed-v2__number .el-input-number__increase:hover) {
  background: #fff;
}

:deep(.custom-fixed-v2__number .el-input__inner) {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

@media (width <= 1280px) {
  .custom-fixed-v2__inner {
    flex-direction: column;
    align-items: stretch;
  }

  .custom-fixed-v2__right {
    justify-content: flex-end;
  }
}
</style>
