<template>
  <div class="wrap">
    <!-- 网络与带宽 -->
    <div class="item config-wrap df ac mb20">
      <div class="key-wrap">
        <Title :text="t('ins.custom.netBandwidth')" />
      </div>
    </div>

    <!-- 基础和实例配置 -->
    <ConfigAPreview />

    <!-- 网络和安全组 -->
    <ConfigBPreview />

    <!-- 其他设置 -->
    <ConfigCPreview />

    <!-- 自动续费 -->
    <div v-if="isTimeCost(store.costTypeConfig.cur)" class="item df renew-wrap">
      <div class="key-wrap">
        {{ t('ins.custom.autoRenew') }}
      </div>
      <div class="value">
        <el-checkbox
          v-model="store.autoRenewConfig.checked"
          :label="t('ins.custom.autoRenewChecked')"
          size="large"
          class="mb16"
        />
        <p class="desc">
          {{ t('ins.custom.autoRenewDesc') }}
        </p>
      </div>
    </div>

    <!-- 协议 -->
    <div id="agree" class="item df agree-wrap">
      <div class="key-wrap">
        {{ t('ins.custom.agree') }}
      </div>
      <div class="value df ac">
        <el-checkbox v-model="store.agreeConfig.checked" size="large" />
        <div
          style="margin-left: 8px; color: var(--primary-text)"
          class="pointer"
          @click="store.agreeConfig.checked = !store.agreeConfig.checked"
        >
          <i18n-t keypath="ins.custom.agreeChecked">
            <span class="text-primary" @click.stop="toCvmAgreement">{{ t('ins.custom.cvmAgree') }}</span>
          </i18n-t>
        </div>
      </div>
    </div>

    <Fixed ref="fixedRef" :step="store.step" :final-loading="loading" @change-step="changeStep" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import Title from '@/views/cvm/ins/create/components/title/index.vue'
import ConfigAPreview from './config-a-preview.vue'
import ConfigBPreview from './config-b-preview.vue'
import ConfigCPreview from './config-c-preview.vue'
import Fixed from '../fixed/index.vue'
import { SECURITY_GROUP_EGRESS_RULES, SECURITY_GROUP_INGRESS_RULES, isTimeCost } from '@/views/cvm/ins/config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import NP from 'number-precision'
import { toCvmAgreement } from '@/utils/to-html'
import { useCvmStore } from '@/store'

NP.enableBoundaryChecking(false)

const { cvmInsCreateStore: store, loading, createInstance } = useIns()
const cvmStore = useCvmStore()

const fixedRef = ref<any>()

const changeStep = (value: string) => {
  if (value === 'b') {
    store.setStep(value)
  } else {
    // 协议
    if (!store.agreeConfig.checked) {
      const el = document.getElementById('agree')
      el?.scrollIntoView({ behavior: 'smooth' })
      return message.warning(t('ins.custom.agreeWarning'))
    }

    store.setStep(value)
    createInstanceFn()
  }
}

// 创建服务器
const createInstanceFn = () => {
  const regionId = store.region.id // 地域ID
  const zoneId = store.zoneConfig.cur.id // 可用区ID
  const specificationId = store.insConfig.rowCur.id // 服务器实例规格ID
  const instanceCount = store.insCountConfig.num // 购买数量
  const imageId = store.sysConfig.imageCur // 镜像ID
  const imageType = store.sysConfig.imageTypeCur // 镜像类型 1 公共镜像 2 私有镜像 3 市场镜像
  const systemDiskType = store.sysDiskForm.diskType // 系统盘类型
  const systemDiskSize = store.sysDiskForm.size // 系统盘大小
  // 数据盘
  const dataDisks = store.dataDiskFormList.map(el => ({
    diskType: el.tableData[0].diskType,
    diskSize: el.tableData[0].size,
    diskCount: el.tableData[0].diskCount, // 硬盘实际数量需要乘以实例数量,但后端已处理
    snapshotId: el.tableData[0].snapshot.id || 0,
  }))
  const isAutoRenew = store.autoRenewConfig.checked // 是否自动续费
  const instanceChargeType = store.costTypeConfig.cur // 实例计费类型 1 按量计费 2 包年包月
  const instanceName = store.instanceName // 实例名称
  const projectId = store.projectConfig.cur // 项目ID
  const vpcId = store.netConfig.vpcCur //  VPC ID
  const subnetId = store.netConfig.subnetCur // 子网ID

  let ipParams: any = {} // ip参数

  if (store.publicIpConfig.checked) {
    ipParams = {
      openEip: 1, // 是否开通EIP 1 开通 2不开通
      lineType: store.publicIpConfig.lineTypeCur, // 公网IP线路类型 1 动态BGP 2 静态BGP
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

    // 共享流量包
    if (store.publicIpConfig.chargeTypeCur === 3) {
      ipParams.pkgId = store.publicIpConfig.pkgIdCur // 共享流量包ID
    }
  } else {
    ipParams = {
      openEip: 2, // 是否开通EIP 1 开通 2不开通
      cascadeRelease: 1, // 实例退还后是否自动释放 1 手动续费 2 自动续费
    }
  }

  let netParams: any = {
    autoCreateDefaultVpc: 2,
    vpcId: store.netConfig.vpcCur,
    subnetId: store.netConfig.subnetCur,
  } // 网络参数

  let sgInfoParams: any = {} // 安全组参数

  if (store.securityGroupConfig.cur === 2) {
    sgInfoParams = {
      sgIds: store.securityGroupConfig.already.checked,
    }
  } else {
    const allRule = [...SECURITY_GROUP_EGRESS_RULES, ...SECURITY_GROUP_INGRESS_RULES]

    sgInfoParams = {
      rules: allRule.filter(el => store.securityGroupConfig.create.checked.includes(el.cid)),
    }
  }

  let loginParams: any = {} // 登录参数

  if (store.loginConfig.cur === 1) {
    loginParams = {
      password: store.loginConfig.form1.password,
    }
  } else if (store.loginConfig.cur === 3) {
    loginParams = {
      password: store.loginConfig.form3.password,
    }
  } else {
    loginParams = {
      keyNameId: store.loginConfig.form2.keyNameId,
    }
  }

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
    isAutoRenew,
    instanceChargeType,
    instanceName,
    projectId,
    vpcId,
    subnetId,
    eipInfo: ipParams,
    sgInfo: sgInfoParams,
    ...netParams,
    ...loginParams,
    isQuicklyCreate: false, // 是否为快速创建
  }

  // 包年包月需传订购周期
  if (isTimeCost(store.costTypeConfig.cur)) {
    params.periodNum = store.periodNum
  }

  console.log(`_createInstance params===>`, params)
  const cb = () => {
    cvmStore.setAreaSelect(store.region)
  }

  // 包年包月
  if (instanceChargeType === 2) {
    createInstance(true, params, cb)
  } else {
    // 按量计费
    createInstance(false, params, cb)
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style lang="scss" scoped>
.item {
  .key-wrap {
    flex-shrink: 0;
    min-width: 110px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .value {
    flex-grow: 1;
  }
}

.renew-wrap {
  margin-top: 40px;
  margin-bottom: 40px;

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.agree-wrap {
  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #0063ff;
    text-align: center;
  }
}

.mb16 {
  margin-bottom: 16px;
}
</style>
