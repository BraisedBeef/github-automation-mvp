<template>
  <!-- fixed -->
  <div class="fixed-wrap df jsb ac shadow">
    <div class="lt pt10">
      <p class="desc mb20">
        {{ insConfigSelect }}
      </p>
      <div class="df">
        <!-- 购买时长 -->
        <div v-if="isTimeCost(store.costTypeConfig.cur)" class="item df ac white-space-nowrap">
          <span class="name mr20">{{ t('ins.custom.durate') }}</span>
          <el-select
            ref="moreOptsRef"
            v-model="store.periodNum"
            :teleported="false"
            class="select-opts"
            :placeholder="t('ins.custom.duratePh')"
            @change="() => {}"
          >
            <el-option v-for="item in INS_DURATION_MAP" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
        <!-- 购买数量 -->
        <div class="item df ac white-space-nowrap">
          <span class="name mr20">{{ t('ins.custom.num') }}</span>
          <el-input-number
            v-model="store.insCountConfig.num"
            :min="store.insCountConfig.min"
            :max="store.insCountConfig.max"
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
    <div class="df fln pt10">
      <!-- 配置费用 -->
      <ConfigCost
        :price="createInsPrice"
        :show-network-single="showNetworkSingle"
        :ins-cost-type="store.costTypeConfig.cur"
      />
      <!-- 上一步 -->
      <el-button v-if="info.showPre" @click="changeStep('pre', step)">
        {{ t('ins.custom.pre') }}
      </el-button>
      <!-- 下一步 -->
      <el-button v-if="info.showNext" type="danger" :loading="nextLoading" @click="changeStep('next', step)">
        {{ info.btnText }}
      </el-button>
      <!-- 确认开通 -->
      <el-button
        v-if="step === 'c' && checkPermission(permMap.ins.CREATE_VM)"
        style="color: #fff"
        type="danger"
        :loading="finalLoading"
        @click="changeStep('next', step)"
      >
        {{ info.btnText }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import ConfigCost from '@/views/cvm/ins/create/components/config-cost/index.vue'
import { INS_DURATION_MAP, isTimeCost, isFlowCost } from '@/views/cvm/ins/config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import NP from 'number-precision'
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
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 当字段都有值时才调用接口
const insIquiryFn = () => {
  // 地域ID
  if (!store.region.id) return
  // 可用区ID
  if (!store.zoneConfig.cur.id) return
  // 服务器实例规格ID
  if (!store.insConfig.rowCur.id) return
  // 购买数量
  if (!store.insCountConfig.num) return
  // 订购周期
  if (isTimeCost(store.costTypeConfig.cur) && !store.periodNum) return
  // 镜像ID
  if (!store.sysConfig.imageCur) return
  // 镜像类型 1 公共镜像 2 私有镜像
  if (!store.sysConfig.imageTypeCur) return
  // 系统盘类型
  if (!store.sysDiskForm.diskType) return
  // 系统盘大小
  if (!store.sysDiskForm.size) return
  // 实例计费类型 1 按量计费 2 包年包月
  if (!store.costTypeConfig.cur) return
  // 数据盘
  if (store.dataDiskFormList?.length) {
    const dataDiskFormListRes = store.dataDiskFormList.every(el => el.tableData[0].diskType && el.tableData[0].size)
    if (!dataDiskFormListRes) return
  }

  if (store.changeStep) {
    // 公网ip参数
    if (store.publicIpConfig.checked) {
      // 公网IP线路类型
      if (!store.publicIpConfig.lineTypeCur) return
      //  公网IP计费类型 1 流量按小时计费(按需) 2 带宽包月(预付费) 3 共享流量包
      if (!store.publicIpConfig.chargeTypeCur) return
      // 公网IP带宽大小=>按带宽计费/按流量计费 暂时不校验
    }
  }

  insIquiry(store.changeStep)
}

// 已选实例
const insConfigSelect = computed(() => {
  const insRes = store.insConfig.rowCur
  const text = t('ins.custom.checkInsDesc', [insRes?.specificationName, insRes?.typeName, insRes?.vcpus, insRes?.ram])

  return insRes ? text : '-'
})

// 是否单独显示网络价格
const showNetworkSingle = computed(() => {
  if (store.publicIpConfig.checked) {
    return isFlowCost(store.publicIpConfig.chargeTypeCur)
  } else {
    return false
  }
})

const info = computed(() => {
  return infoMap[props.step]
})

const changeStep = (key: string, value) => {
  let newStep: string = ''
  if (key === 'pre') {
    newStep = value === 'b' ? 'a' : 'b'
  } else {
    newStep = value === 'a' ? 'b' : 'c'
  }

  emits('changeStep', newStep)
}

// 创建服务器-询价
const insIquiry = async (changeStep: boolean) => {
  const regionId = store.region.id // 地域ID
  const zoneId = store.zoneConfig.cur.id // 可用区ID
  const specificationId = store.insConfig.rowCur.id // 服务器实例规格ID
  const instanceCount = store.insCountConfig.num // 购买数量
  const imageId = store.sysConfig.imageCur // 镜像ID
  const imageType = store.sysConfig.imageTypeCur // 镜像类型 1 公共镜像 2 私有镜像
  const systemDiskType = store.sysDiskForm.diskType // 系统盘类型
  const systemDiskSize = store.sysDiskForm.size // 系统盘大小
  // 数据盘
  const dataDisks = store.dataDiskFormList.map(el => ({
    diskType: el.tableData[0].diskType,
    diskSize: el.tableData[0].size,
    diskCount: el.tableData[0].diskCount, //  硬盘实际数量需要乘以实例数量,但后端已处理
    snapshotId: el.tableData[0].snapshot.id || 0,
  }))
  const instanceChargeType = store.costTypeConfig.cur // 实例计费类型 1 按量计费 2 包年包月

  let ipParams: any = {} // 公网ip参数

  if (store.publicIpConfig.checked && changeStep) {
    // 共享流量包是已付钱 询价的eip参数不需要pkgId字段
    ipParams = {
      openEip: 1, // 是否开通EIP 1 开通 2不开通
      lineType: store.publicIpConfig.lineTypeCur, // 公网IP线路类型
      chargeType: store.publicIpConfig.chargeTypeCur, // 公网IP计费类型 1 流量按小时计费(按需) 2 带宽包月(预付费)
      num: 1, // 数量
      cascadeRelease: 1, // 实例退还后是否自动释放 1 手动续费 2 自动续费
    }

    // 按带宽计费
    if (store.publicIpConfig.chargeTypeCur === 2) {
      ipParams.size = store.publicIpConfig.size // 带宽值
      ipParams.autoRenewFlag = 1 // 包年包月自动续费标识 包年包月必须指定 1 手动续费 2 自动续费
      ipParams.period = store.periodNum // 包年包月必须指定
    }

    // 按流量计费
    if (store.publicIpConfig.chargeTypeCur === 1) {
      ipParams.size = store.publicIpConfig.size // 带宽值
    }
  } else {
    ipParams = {
      openEip: 2, // 是否开通EIP 1 开通 2不开通
      cascadeRelease: 1, // 实例退还后是否自动释放 1 手动续费 2 自动续费
    }
  }

  // 询价不需要vpcId subnetId字段
  const params: any = {
    regionId,
    zoneId,
    specificationId,
    instanceCount,
    imageId,
    imageType,
    systemDiskType,
    systemDiskSize,
    dataDisks,
    instanceChargeType,
    eipInfo: ipParams,
  }

  // 包年包月需传订购周期
  if (isTimeCost(store.costTypeConfig.cur)) {
    params.periodNum = store.periodNum
  }

  console.log(`insIquiry params===>`, params)
  createInstanceInquiry(params)
}

// 监听地域/可用区/实例规格/数量/时长/镜像/系统盘/数据盘/实例/计费模式/公网ip
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

// 监听地域/可用区/实例规格/数量/时长/镜像/系统盘/数据盘/实例/计费模式/公网ip
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

<style lang="scss" scoped>
.fixed-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 999;
  flex-wrap: wrap;
  width: 100%;
  min-height: 130px;
  padding: 10px 120px 20px;
  background-color: #fff;

  .lt {
    .desc {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
    }

    .item {
      margin-right: 40px;

      .name {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }
    }
  }
}

.white-space-nowrap {
  white-space: nowrap;
}

.pt10 {
  padding-top: 10px;
}
</style>
