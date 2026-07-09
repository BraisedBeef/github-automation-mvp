<template>
  <div class="fast">
    <!-- 基础配置 -->
    <div class="item config-wrap df ac mb20">
      <div class="key-wrap">
        <Title :text="t('ins.fast.baseConfig')" />
      </div>
    </div>
    <!-- 地域 -->
    <div class="item df area-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.area') }}
      </div>
      <div class="value">
        <div class="mb20" style="margin-top: -15px">
          <AreaTabs v-model="store.region" @change-area="changeArea" />
        </div>

        <p class="area-desc">
          <span v-html="t('ins.fast.areaDesc')" />
        </p>
      </div>
    </div>

    <!-- 实例 -->
    <div class="item df ins-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.ins') }}
      </div>
      <div class="value df gap">
        <div
          v-for="(item, index) in store.insConfig.list"
          :key="index"
          class="ins cursor-pointer"
          :class="store.insConfig.cur.listingSpecificationId === item.listingSpecificationId && 'ins-actived'"
          @click="changeInsConfig(item)"
        >
          <div class="top">
            {{ t('ins.fast.cores', [INS_TYPE_NAME_MAP[item.type], item.cpus, item.ram]) }}
          </div>
          <div class="bottom">
            <p class="desc">
              {{ t(`ins.fast.insConfigDesc${item.type}`) }}
            </p>
            <p class="desc">{{ t('ins.fast.sysDisk') }}{{ INS_SYS_SIZE }}GB，{{ item.diskTypeName }}</p>
            <p class="desc">
              {{ t('ins.fast.dataDisk') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作系统 -->
    <div id="sys" class="item df sys-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.sys') }}
      </div>
      <div class="value">
        <div class="df mb20 gap">
          <!-- 系统 -->
          <div
            v-for="(item, index) in store.sysConfig.list"
            :key="index"
            class="sys cursor-pointer df fdc jc ac"
            :class="store.sysConfig.cur.platform === item.platform && 'sys-actived'"
            @click="changeSysConfig(item)"
          >
            <SvgIcon
              style="width: 24px; height: 24px"
              :name="
                store.sysConfig.cur.platform === item.platform
                  ? INS_SYS_SVG_MAP[item.platform]?.actived
                  : INS_SYS_SVG_MAP[item.platform]?.default
              "
            />
            <div class="text">
              <span>{{ item.platform }}</span>
            </div>
          </div>
        </div>
        <div v-if="store.sysConfig.imagesList.length">
          <!-- 镜像下拉 -->
          <el-select
            ref="moreOptsRef"
            v-model="store.sysConfig.imageCur"
            style="width: 360px"
            :teleported="false"
            class="select-opts mb16"
            :placeholder="t('ins.fast.imagePh')"
            @change="() => {}"
          >
            <el-option
              v-for="item in store.sysConfig.imagesList"
              :key="item.id"
              :value="item.id"
              :label="item.imageName"
            />
          </el-select>
          <p class="desc">
            {{ t('ins.fast.imageDesc') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 网络 -->
    <div id="network" class="item network-wrap df" :class="showNetworkDefaultDesc ? '' : 'ac'">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.net') }}
      </div>
      <div class="value">
        <!-- vpc和subnet必须有勾选值 -->
        <div class="df ac" :class="showNetworkDefaultDesc ? 'mb16' : ''">
          <!-- vpc下拉 -->
          <el-select
            ref="moreOptsRef"
            v-model="store.netConfig.vpcCur"
            style="width: 350px; margin-right: 8px"
            :teleported="false"
            :placeholder="t('ins.custom.vpcPh')"
            :disabled="store.netConfig.vpcList?.length ? false : true"
            @change="changeVpc"
          >
            <el-option v-for="item in store.netConfig.vpcList" :key="item.id" :value="item.id" :label="item.vpcName" />
          </el-select>
          <!-- 子网下拉 -->
          <el-select
            ref="moreOptsRef"
            v-model="store.netConfig.subnetCur"
            style="width: 350px"
            :teleported="false"
            class="mr20"
            :placeholder="t('ins.custom.subnetPh')"
            :disabled="store.netConfig.subnetList?.length ? false : true"
            @change="() => {}"
          >
            <el-option
              v-for="item in store.netConfig.subnetList"
              :key="item.id"
              :value="item.id"
              :label="item.subnetName"
            />
          </el-select>
          <SvgIcon
            name="refresh"
            class="pointer"
            :class="loadingNetwork ? 'loadingAnimate' : ''"
            @click="refreshSubnet"
          />
        </div>
        <div class="network-default-desc">
          <!-- vpc和子网列表都没有 -->
          <template v-if="!store.netConfig.vpcList?.length && !store.netConfig.subnetList?.length">
            <i18n-t keypath="ins.custom.vpcDefaultDesc">
              <span class="text-primary pointer mr4" @click="createVpcFn">{{ t('ins.custom.quickCreate') }}</span>
            </i18n-t>
          </template>
          <!-- 只有子网列表没有(公有云) todo：阿发说拿新增vpc的按钮权限来判断公有云还是私有云 -->
          <template
            v-if="
              store.netConfig.vpcList?.length &&
              !store.netConfig.subnetList?.length &&
              !checkPermission(permMap.vpc.CREATE_VPC)
            "
          >
            <div>
              {{ t('ins.custom.noVpcOrSubnet') }}
            </div>
            <!--（只显示新增子网）-->
            <i18n-t keypath="ins.custom.subnetDefaultDesc">
              <span class="text-primary pointer mr4" @click="toSubnet">
                {{ t('ins.custom.createSubnet') }}
              </span>
              <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px" />
            </i18n-t>
          </template>
          <!-- 只有子网列表没有（私有云） -->
          <template
            v-if="
              store.netConfig.vpcList?.length &&
              !store.netConfig.subnetList?.length &&
              checkPermission(permMap.vpc.CREATE_VPC)
            "
          >
            <div>
              {{ t('ins.custom.noVpcOrSubnet') }}
            </div>
            <!--（显示新增vpc和子网） -->
            <i18n-t keypath="ins.custom.vpcAndSubnetDefaultDesc">
              <span class="text-primary pointer tip-box" @click="toVpc">
                <span class="mr4">
                  {{ t('ins.custom.createVpc') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
              <span class="text-primary pointer tip-box" @click="toSubnet">
                <span class="mr4">
                  {{ t('ins.custom.createSubnet') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
            </i18n-t>
          </template>
          <!-- vpc和子网列表都有(私有云) -->
          {{ console.log(String(permMap.vpc.CREATE_VPC), 1111) }}
          {{ console.log(String(checkPermission(permMap.vpc.CREATE_VPC)), 123) }}
          <template
            v-if="
              store.netConfig.vpcList?.length &&
              store.netConfig.subnetList?.length &&
              checkPermission(permMap.vpc.CREATE_VPC)
            "
          >
            <i18n-t keypath="ins.custom.vpcAndSubnetDefaultDesc">
              <span class="text-primary pointer tip-box" @click="toVpc">
                <span class="mr4">
                  {{ t('ins.custom.createVpc') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
              <span class="text-primary pointer tip-box" @click="toSubnet">
                <span class="mr4">
                  {{ t('ins.custom.createSubnet') }}
                </span>
                <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px; margin-top: -3px" />
              </span>
            </i18n-t>
          </template>
        </div>
      </div>
    </div>

    <!-- 公网ip -->
    <div class="item df ip-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.publicIP') }}
      </div>
      <div class="value">
        <el-checkbox
          v-model="store.publicIpConfig.checked"
          class="mb16"
          :label="t('ins.fast.ipChecked')"
          size="large"
        />
        <div v-if="!store.publicIpConfig.checked" class="text-error publicIPDesc">
          {{ t('ins.fast.publicIPDesc') }}
        </div>
      </div>
    </div>

    <!-- 宽带计费模式 -->
    <div v-if="store.publicIpConfig.checked" class="item df ac cost-type-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.broadbandCostType') }}
      </div>
      <div class="value">
        <div class="df">
          <div
            v-for="(item, index) in store.publicIpConfig.list"
            :key="index"
            class="cost-type cursor-pointer"
            :class="store.publicIpConfig.chargeTypeCur === item.value && 'cost-type-actived'"
            @click="changeIpChargeType(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 线路 -->
    <div v-if="store.publicIpConfig.checked" class="item df ac line-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.lineType') }}
      </div>
      <div class="value">
        <div class="df">
          <div
            v-for="(item, index) in store.publicIpConfig.lineTypeList"
            :key="index"
            class="line cursor-pointer"
            :class="store.publicIpConfig.lineTypeCur === item.value && 'line-actived'"
            @click="changeIpLine(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 共享流量包 -->
    <div
      v-if="store.publicIpConfig.checked && store.publicIpConfig.chargeTypeCur === 3"
      id="package"
      class="item df ac package-wrap"
    >
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.sharedTrafficPackage') }}
      </div>
      <div class="value">
        <div class="df ac">
          <!-- 共享带宽包下拉 -->
          <el-select
            ref="moreOptsRef"
            v-model="store.publicIpConfig.pkgIdCur"
            style="width: 350px"
            :teleported="false"
            class="mr20"
            :placeholder="t('ins.custom.packagePh')"
          >
            <!-- <el-option :value="item.id" :label="item.vpcName" v-for="item in store.publicIpConfig.pkgList" :key="item.id">
            </el-option> -->
            <el-option
              v-for="(item, index) in store.publicIpConfig.pkgList"
              :key="index"
              :label="`${item.pkgUuid} | (${item.pkgName})`"
              :value="item.id"
            >
              <div class="df ac opt-wrap w-full h-full">
                <div class="item text-over">
                  {{ `${item.pkgUuid} | (${item.pkgName})` }}
                </div>
              </div>
            </el-option>
          </el-select>
          <SvgIcon name="refresh" class="pointer" :class="loadingPkg ? 'loadingAnimate' : ''" @click="refreshPkg" />

          <div class="ml10">
            <span class="text-primary pointer mr4" @click="toPackage">{{ t('ins.custom.sharedPackageCreate') }}</span>
            <SvgIcon name="share" class="pointer" style="width: 12px; height: 12px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 宽带值 -->
    <div
      v-if="store.region.showEipBandwidth && store.publicIpConfig.checked && store.publicIpConfig.chargeTypeCur !== 3"
      class="item df broadband-wrap"
    >
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.broadbandNum') }}
      </div>
      <div class="value">
        <div class="df ac">
          <el-slider
            v-model="store.publicIpConfig.size"
            :class="store.publicIpConfig.size > 1 ? '' : 'slider-default'"
            style="max-width: 1000px"
            :show-stops="false"
            :min="bandwidthSliderConfig.min"
            :max="bandwidthSliderConfig.max"
            :marks="bandwidthSliderConfig.marks"
            :format-tooltip="value => value + 'Mbps'"
            @change="
              () => {
                if (!store.publicIpConfig.size) {
                  store.publicIpConfig.size = bandwidthSliderConfig.min
                }
                insIquiryFn()
              }
            "
          />

          <el-input-number
            v-model="store.publicIpConfig.size"
            style="margin-left: 40px"
            :min="bandwidthSliderConfig.min"
            :max="bandwidthSliderConfig.max"
            @change="
              () => {
                if (!store.publicIpConfig.size) {
                  store.publicIpConfig.size = bandwidthSliderConfig.min
                }
                insIquiryFn()
              }
            "
          />

          <span class="ml10">Mbps</span>
        </div>
      </div>
    </div>

    <!-- 登录方式 -->
    <div class="item df login-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.loginType') }}
      </div>
      <div class="value">
        <div class="btn mb16">
          <span>{{ t('ins.fast.autoPwd') }}</span>
        </div>
        <p class="desc">
          {{ t('ins.fast.autoPwdDesc') }}
        </p>
      </div>
    </div>

    <!-- 默认配置 -->
    <div class="item df default-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.defaultConfig') }}
      </div>
      <div class="value">
        <div class="default df ac">
          <div class="default-left">
            <div class="d-item mb20">
              <div class="key">
                {{ t('ins.fast.zone') }}
              </div>
            </div>
            <div class="d-item mb20">
              <div class="key">
                {{ t('ins.fast.securityGroup') }}
              </div>
            </div>
            <!-- <div class="d-item mb20">
              <div class="key">{{ t('ins.fast.porject') }}</div>
            </div> -->
            <div class="d-item">
              <div class="key">
                {{ t('ins.fast.insName') }}
              </div>
            </div>
            <!-- <div class="d-item">
              <div class="key">{{ t('ins.fast.monitor') }}</div>
            </div> -->
          </div>
          <div class="default-right">
            <div class="d-item mb20">
              <span class="val">{{ t('ins.fast.randomAllocate') }}</span>
            </div>
            <div class="d-item mb20">
              <span class="val">{{ t('ins.fast.defaultSecurityGroup') }}</span>
            </div>
            <!-- <div class="d-item mb20">
              <span class="val">{{ t('ins.fast.defaultPorject') }}</span>
            </div> -->
            <div class="d-item">
              <span class="val">{{ t('ins.fast.defaultInsName') }}</span>
            </div>
            <!-- <div class="d-item">
              <span class="val">{{ t('ins.fast.defaultMonitor') }}</span>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 自动续费 -->
    <div class="item df renew-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.autoRenew') }}
      </div>
      <div class="value">
        <el-checkbox
          v-model="store.autoRenewConfig.checked"
          :label="t('ins.fast.autoRenewChecked')"
          size="large"
          class="mb16"
        />
        <p class="desc">
          {{ t('ins.fast.autoRenewDesc') }}
        </p>
      </div>
    </div>

    <!-- 协议 -->
    <div id="agree" class="item df agree-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.fast.agree') }}
      </div>
      <div class="value">
        <el-checkbox v-model="store.agreeConfig.checked" size="large">
          <i18n-t keypath="ins.fast.agreeChecked">
            <span class="text-primary" @click.stop="toCvmAgreementFn(store.agreeConfig.checked)">{{
              t('ins.fast.cvmAgree')
            }}</span>
          </i18n-t>
        </el-checkbox>
      </div>
    </div>

    <!-- fixed -->
    <div class="fixed-wrap shadow">
      <div class="ac jsb fixed-wrap_content">
        <div class="lt df">
          <!-- 购买时长 -->
          <div class="item df ac">
            <span class="name mr20">{{ t('ins.fast.durate') }}</span>
            <el-select
              ref="moreOptsRef"
              v-model="store.periodNum"
              :teleported="false"
              class="select-opts"
              :placeholder="''"
              @change="() => {}"
            >
              <el-option v-for="item in INS_DURATION_MAP" :key="item.value" :value="item.value" :label="item.label" />
            </el-select>
          </div>

          <!-- 购买数量 -->
          <div class="item df ac">
            <span class="name mr20">{{ t('ins.fast.num') }}</span>
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
        <div class="df fln mt10">
          <!-- 配置费用 -->
          <ConfigCost
            :price="createInsPrice"
            :show-network-single="showNetworkSingle"
            :ins-cost-type="instanceChargeType"
          />
          <el-button v-if="checkPermission(permMap.ins.CREATE_VM)" :loading="loading" type="danger" @click="submit">
            {{ t('ins.fast.buy') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import Title from '@/views/cvm/ins/create/components/title/index.vue'
import ConfigCost from '@/views/cvm/ins/create/components/config-cost/index.vue'
import { _listRecommendSpecifications } from '@/apis/cvm/ins'
import { _groupImages } from '@/apis/cvm/image'
import {
  INS_TYPE_NAME_MAP,
  INS_SYS_SIZE,
  INS_SYS_SVG_MAP,
  INS_DURATION_MAP,
  SECURITY_GROUP_EGRESS_RULES,
  SECURITY_GROUP_INGRESS_RULES,
  PUBLIC_IP_CONFIG_LIST,
} from '@/views/cvm/ins/config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { lineTypeList } from '@/views/network/public-ip/list/components/set-buy/config'
import NP from 'number-precision'
import { toCvmAgreement } from '@/utils/to-html'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useCvmStore } from '@/store'
import { bandwidthSliderConfig } from '@/views/network/public-ip/list/config'
import { getQueryVpcPage } from '@/apis/network/private-network'
import { getQuerySubnetPage } from '@/apis/network/subnet'
import { getEipChargeType } from '@/apis/network/public-ip'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelMap = {
  [ja]: 'width: 170px',
  [en]: 'width: 170px',
  [zh]: 'width: 90px',
}

const labelClass = useI18nStyle(labelMap)
const cvmStore = useCvmStore()
/**
 * @desc 快速创建是包年包月+公共镜像
 */

NP.enableBoundaryChecking(false)

const {
  loading,
  createInstance,
  createInstanceInquiry,
  createInsPrice,
  cvmInsFastCreateStore: store,
  getEipLineType,
  createInstanceVerify,
  getShareTrafficPackageList,
  createInstanceDryRun,
} = useIns()
const { listByRegionId, getQuickCreateDefaultZone, createVpc } = useBaseConfig()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const instanceChargeType = 2 // 快速创建默认是包年包月
const imageType = 1

const loadingNetwork = ref<boolean>(false)
const loadingPkg = ref<boolean>(false)
// 安全组
const sgInfo = reactive<{
  rules: any[]
}>({
  rules: [...SECURITY_GROUP_EGRESS_RULES, ...SECURITY_GROUP_INGRESS_RULES],
})

const showNetworkDefaultDesc = computed(() => {
  if (!store.netConfig.vpcList?.length && !store.netConfig.subnetList?.length) {
    return true
  } else if (store.netConfig.vpcList?.length && !store.netConfig.subnetList?.length) {
    return true
  } else if (store.netConfig.vpcList?.length && store.netConfig.subnetList?.length) {
    return checkPermission(permMap.vpc.CREATE_VPC) ? true : false
  } else {
    return false
  }
})

const showNetworkSingle = computed(() => {
  if (store.publicIpConfig.checked) {
    return store.publicIpConfig.chargeTypeCur === 1
  } else {
    return false
  }
})

// 刷新网络
const refreshSubnet = async () => {
  loadingNetwork.value = !loadingNetwork.value
  if (loadingNetwork.value) {
    setTimeout(() => {
      loadingNetwork.value = false
      message.success(t('common.updateSuccess'))
    }, 2000)
  }
  // verifyDefaultVpcFn()
  await getQueryVpcPageFn()
  getQuerySubnetPageFn()
}

// 切换vpc
const changeVpc = () => {
  getQuerySubnetPageFn()
}

// 跳转共享流量包
const toPackage = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/flow-packet/list`, '_blank')
}

// 跳转私有网络
const toVpc = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/private-network/list`, '_blank')
}

// 跳转子网
const toSubnet = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/subnet/list`, '_blank')
}

// 刷新共享流量包
const refreshPkg = async () => {
  loadingPkg.value = !loadingPkg.value
  if (loadingPkg.value) {
    setTimeout(() => {
      loadingPkg.value = false
      message.success(t('common.updateSuccess'))
    }, 2000)
  }
  getShareTrafficPackageListFn()
}

// 当字段都有值时才调用接口
const insIquiryFn = () => {
  // 地域ID
  if (!store.region.id) return
  // 可用区ID
  if (!store.zoneConfig.cur.id) return
  // 服务器实例规格ID
  if (!store.insConfig.cur.listingSpecificationId) return
  // 购买数量
  if (!store.insCountConfig.num) return
  // 订购周期
  if (!store.periodNum) return
  // 镜像ID
  if (!store.sysConfig.imageCur) return
  // 系统盘类型
  if (!store.insConfig.cur.diskTypeId) return
  // 系统盘大小
  if (!store.insConfig.cur.diskTypeId) return
  // 公网ip参数
  if (store.publicIpConfig.checked) {
    // 公网IP线路类型
    if (!store.publicIpConfig.lineTypeCur) return
    //  公网IP计费类型 1 流量按小时计费(按需) 2 带宽包月(预付费)
    if (!store.publicIpConfig.chargeTypeCur) return
    // 公网IP带宽大小=>按带宽计费/按流量计费 暂时不校验
  }

  insIquiry()
}

// 提交
const submit = async () => {
  // 实例
  if (!Reflect.has(store.insConfig.cur, 'listingSpecificationId')) {
    return message.warning(t('ins.fast.insWarning'))
  }

  // 镜像
  if (!store.sysConfig.imageCur) {
    // 锚点错误定位
    const el = document.getElementById('sys')
    el?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.fast.imageWarning'))
  }

  // vpc
  if (!store.netConfig.vpcCur) {
    // 锚点错误定位
    const el = document.getElementById('network')
    el?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.vpcPh'))
  }

  // 子网
  if (!store.netConfig.subnetCur) {
    // 锚点错误定位
    const el = document.getElementById('network')
    el?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.subnetPh'))
  }

  // 公网ip
  if (store.publicIpConfig.checked) {
    // 线路类型
    if (!store.publicIpConfig.lineTypeCur) {
      // 锚点错误定位
      const el = document.getElementById('lineType')
      el?.scrollIntoView({ behavior: 'smooth' })
      return message.warning(t('ins.custom.lineTypePh'))
    }

    // 共享带宽包
    if (store.publicIpConfig.chargeTypeCur === 3 && !store.publicIpConfig.pkgIdCur) {
      // 锚点错误定位
      const el = document.getElementById('package')
      el?.scrollIntoView({ behavior: 'smooth' })
      return message.warning(t('ins.custom.packagePh'))
    }
  }

  // 购买时长
  if (!store.periodNum) {
    return message.warning(t('ins.fast.durateWarning'))
  }

  // 协议
  if (!store.agreeConfig.checked) {
    // 锚点错误定位
    const el = document.getElementById('agree')
    el?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.fast.agreeWarning'))
  }

  // 库存验证
  const createInstanceVerifyRes = await createInstanceVerifyFn()
  if (!createInstanceVerifyRes) return

  // 预检
  const createInstanceDryRunRes = await createInstanceDryRunFn()
  if (!createInstanceDryRunRes) return

  createInstanceFn()
}

// 点击查看协议
const toCvmAgreementFn = (status: boolean) => {
  store.agreeConfig.checked = !status // 点击查看协议时不触发勾选
  toCvmAgreement()
}

// 切换地域
const changeArea = async () => {
  permConfig.regionId = store.region.id
  groupImages()
  getEipChargeTypeFn()
  await listByRegionIdFn()
  await getQuickCreateDefaultZoneFn()
  await listRecommendSpecifications()
  await getQueryVpcPageFn()
  getQuerySubnetPageFn()
}

// 切换实例机型
const changeInsConfig = (raw: any) => {
  store.insConfig.cur = raw
}

// 切换系统
const changeSysConfig = (raw: any) => {
  console.log(`changeSysConfig==>`, raw)
  if (raw.platform === store.sysConfig.cur.platform) return
  store.sysConfig.cur = raw
  store.sysConfig.imagesList = raw.images || []
  store.sysConfig.imageCur = ''
}

// 查询当前地域下支持的宽带计费模式
const getEipChargeTypeFn = async () => {
  try {
    const res = await getEipChargeType({ regionId: store.region.id })
    console.log(`getEipChargeTypeFn====>`, res)
    if (res.success) {
      const list = res.data?.list || []
      store.publicIpConfig.list = PUBLIC_IP_CONFIG_LIST.filter(el => list.includes(el.value))

      // 实例为按量计费，带宽计费模式不包含按带宽计费
      const ipChargeRes = store.publicIpConfig.list.find(el => el.value === store.publicIpConfig.chargeTypeCur)

      if (!ipChargeRes) {
        // 默认选中第一个
        const defaultIpCharge = store.publicIpConfig.list[0].value
        store.publicIpConfig.chargeTypeCur = defaultIpCharge
      }

      getEipLineTypeFn()
    }
  } catch (error) {
    console.log(error)
  }
}

// 切换ip宽带计费模式
const changeIpChargeType = (raw: any) => {
  console.log(`changeIpChargeType==>`, raw)

  if (store.publicIpConfig.chargeTypeCur !== raw) {
    store.publicIpConfig.chargeTypeCur = raw
    getEipLineTypeFn()
  }
}

// 切换ip线路
const changeIpLine = async (raw: any) => {
  console.log(`changeIpLine==>`, raw)

  if (store.publicIpConfig.lineTypeCur !== raw) {
    store.publicIpConfig.lineTypeCur = raw

    if (store.publicIpConfig.chargeTypeCur === 3) {
      getShareTrafficPackageListFn()
    }
  }
}

// 购买实例-快速配置-推荐机型
const listRecommendSpecifications = async () => {
  try {
    const res = await _listRecommendSpecifications({
      regionId: store.region.id,
      zoneId: store.zoneConfig.cur.id, // 可用区ID
    })

    console.log(`_listRecommendSpecifications===>`, res)

    if (res.success) {
      store.insConfig.list = res.data || []

      if (store.insConfig.cur.listingSpecificationId) {
        if (
          !store.insConfig.list.find(el => el.listingSpecificationId === store.insConfig.cur.listingSpecificationId)
        ) {
          // 默认选中第一个
          store.insConfig.cur = store.insConfig.list[0] || {}
        }
      } else {
        // 默认选中第一个
        store.insConfig.cur = store.insConfig.list[0] || {}
      }
    } else {
      // 后端下架规格,success为false
      store.insConfig.list = []
    }
  } catch (error) {
    console.log(error)
  }
}

// 根据镜像类型获取镜像列表
const groupImages = async () => {
  try {
    const res = await _groupImages({
      regionId: store.region.id,
      imageType, // 1 公共镜像 2 私有镜像
    })

    console.log(`_listRecommendSpecifications===>`, res)

    if (res.success) {
      store.sysConfig.list = res.data || []

      const platformRes = store.sysConfig.list.find(el => el.platform === store.sysConfig.cur.platform)

      if (platformRes) {
        store.sysConfig.cur = platformRes
        store.sysConfig.imagesList = store.sysConfig.cur.images || []
      } else {
        // 默认选中第一个
        store.sysConfig.cur = store.sysConfig.list[0] || {}
        store.sysConfig.imagesList = store.sysConfig.cur.images || []
      }

      const imageRes = store.sysConfig.imagesList.find(el => el.id === store.sysConfig.imageCur)
      if (!imageRes) {
        store.sysConfig.imageCur = ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 创建默认VPC
const createVpcFn = async () => {
  const cb = async (res: any) => {
    if (res.success) {
      console.log(`createVpcFn===>`, res)
      message.success(res.msg)
      await getQueryVpcPageFn()
      getQuerySubnetPageFn()
    } else {
      message.warning(res.msg)
    }
  }

  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
  }

  createVpc(params, cb)
}

// 查询VPC列表
const getQueryVpcPageFn = async () => {
  try {
    const res = await getQueryVpcPage({
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    })

    console.log(`getQueryVpcPage===>`, res)

    if (res.success) {
      store.netConfig.vpcList = res.data.list || []

      // 处理vpc
      const vpcRes = store.netConfig.vpcList.find(el => el?.id === store.netConfig.vpcCur)

      if (!vpcRes) {
        // 默认选中第一个
        const defaultVpc = store.netConfig.vpcList[0]?.id
        store.netConfig.vpcCur = defaultVpc ? defaultVpc : ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 查询子网列表
const getQuerySubnetPageFn = async () => {
  try {
    const params: any = {
      zoneId: store.zoneConfig.cur.id,
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    }

    if (store.netConfig.vpcCur) {
      params.vpcId = store.netConfig.vpcCur // vpcId
    }

    const res = await getQuerySubnetPage(params)

    console.log(`getQuerySubnetPage===>`, res)

    if (res.success) {
      store.netConfig.subnetList = res.data.list || []

      // 处理子网
      const subnetRes = store.netConfig.subnetList.find(el => el?.id === store.netConfig.subnetCur)

      if (!subnetRes) {
        // 默认选中第一个
        const defaultSubnet = store.netConfig.subnetList[0]?.id
        store.netConfig.subnetCur = defaultSubnet ? defaultSubnet : ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

// 查询地区下支持的EIP线路
const getEipLineTypeFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.publicIpConfig.lineTypeList = lineTypeList.filter(el => res.data?.includes(el.value))

      const lineTypeRes = store.publicIpConfig.lineTypeList.find(el => el.value === store.publicIpConfig.lineTypeCur)
      if (!lineTypeRes) {
        // 默认选中第一个
        store.publicIpConfig.lineTypeCur = store.publicIpConfig.lineTypeList?.[0]?.value
      }

      if (store.publicIpConfig.chargeTypeCur === 3) {
        getShareTrafficPackageListFn()
      }
    } else {
      store.publicIpConfig.lineTypeList = []
      store.publicIpConfig.lineTypeCur = 0
    }
  }

  const params = {
    regionId: store.region.id,
    chargeType: store.publicIpConfig.chargeTypeCur,
  }

  getEipLineType(params, cb)
}

// 查询共享流量包列表
const getShareTrafficPackageListFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.publicIpConfig.pkgList = res.data?.list || []

      const pkgIdRes = store.publicIpConfig.pkgList.find(el => el.id === store.publicIpConfig.pkgIdCur)
      if (!pkgIdRes) {
        store.publicIpConfig.pkgIdCur = ''
      }
    }
  }

  const params = {
    regionId: store.region.id,
    state: 1,
    pageSize: 999,
    pageIndex: 1,
    lineType: store.publicIpConfig.lineTypeCur,
  }

  getShareTrafficPackageList(params, cb)
}

// 根据地区id获取可用区列表
const listByRegionIdFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.zoneConfig.list = res.data || []
    }
  }

  const params = {
    regionId: store.region.id,
  }
  return listByRegionId(params, cb)
}

// 查询快速创建默认可用区
const getQuickCreateDefaultZoneFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      // 设置默认可用区
      store.zoneConfig.cur = store.zoneConfig.list.find(el => el.id === res.data?.zoneId) || store.zoneConfig.list[0]
    }
  }

  const params = {
    regionId: store.region.id,
  }
  return getQuickCreateDefaultZone(params, cb)
}

// 创建服务器-库存验证
const createInstanceVerifyFn = async () => {
  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    specificationId: store.insConfig.cur.listingSpecificationId,
    instanceChargeType,
  }

  const cb = (res: any) => {
    if (!res.success) {
      message.warning(res.msg)
    }
  }

  return createInstanceVerify(params, cb)
}

// 创建服务器-预检
const createInstanceDryRunFn = async () => {
  const params = {
    regionId: store.region.id, // 地域ID
    zoneId: store.zoneConfig.cur.id, // 可用区ID
    specificationId: store.insConfig.cur.listingSpecificationId, // 服务器实例规格ID
    instanceCount: store.insCountConfig.num, // 购买数量
    imageId: store.sysConfig.imageCur, // 镜像ID
    imageType: imageType, // 镜像类型 1 公共镜像 2 私有镜像 3 市场镜像
    systemDiskType: store.insConfig.cur.diskTypeId, // 系统盘类型
    systemDiskSize: INS_SYS_SIZE, // 系统盘大小
    vpcId: store.netConfig.vpcCur, // VPC ID
    subnetId: store.netConfig.subnetCur, // 子网ID
    instanceChargeType, // 实例计费类型 1 按量计费 2 包年包月
    periodNum: store.periodNum, // 订购周期 月
  }

  const cb = (res: any) => {
    if (!res.success) {
      message.warning(res.msg)
    }
  }

  return createInstanceDryRun(params, cb)
}

// 创建服务器-询价
const insIquiry = () => {
  let ipParams: any = {} // 公网ip参数

  if (store.publicIpConfig.checked) {
    // 共享流量包是已付钱 询价的eip参数不需要pkgId字段
    ipParams = {
      openEip: 1, // 是否开通EIP 1 开通 2不开通
      lineType: store.publicIpConfig.lineTypeCur, // 公网IP线路类型 1 动态BGP 2 静态BGP
      chargeType: store.publicIpConfig.chargeTypeCur, // 公网IP计费类型 1 流量按小时计费(按需) 2 带宽包月(预付费)
      // size: store.publicIpConfig.size,
      num: 1, // 数量
      cascadeRelease: 1, // 实例退还后是否自动释放 1 手动续费 2 自动续费
    }

    // 按带宽计费
    if (store.publicIpConfig.chargeTypeCur === 2) {
      ipParams.size = store.publicIpConfig.size // 带宽值
      ipParams.period = store.periodNum // 包年包月时长 (月) 包年包月必须指定
      ipParams.autoRenewFlag = 1 // 包年包月自动续费标识 包年包月必须指定 1 手动续费 2 自动续费
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
  const params = {
    regionId: store.region.id, // 地域ID
    zoneId: store.zoneConfig.cur.id, // 可用区ID
    specificationId: store.insConfig.cur.listingSpecificationId, // 服务器实例规格ID
    instanceCount: store.insCountConfig.num, // 购买数量
    imageId: store.sysConfig.imageCur, // 镜像ID
    imageType, //1 公共镜像 2 私有镜像 3 市场镜像
    systemDiskType: store.insConfig.cur.diskTypeId, // 系统盘类型
    systemDiskSize: INS_SYS_SIZE, // 系统盘大小
    eipInfo: ipParams, // ip
    instanceChargeType, // 实例计费类型 1 按量计费 2 包年包月
    periodNum: store.periodNum, // 订购周期
  }
  console.log(`insIquiry params===>`, params)
  createInstanceInquiry(params)
}

// 创建服务器
const createInstanceFn = () => {
  loading.value = true

  let ipParams: any = {} // ip参数

  if (store.publicIpConfig.checked) {
    ipParams = {
      openEip: 1, // 是否开通EIP 1 开通 2不开通
      lineType: store.publicIpConfig.lineTypeCur, // 公网IP线路类型 1 动态BGP 2 静态BGP
      chargeType: store.publicIpConfig.chargeTypeCur, // 公网IP计费类型 1 流量按小时计费(按需) 2 带宽包月(预付费)
      // size: store.publicIpConfig.size,
      num: 1, // 数量
      cascadeRelease: 1, // 实例退还后是否自动释放 1 手动续费 2 自动续费
    }

    // 按带宽计费
    if (store.publicIpConfig.chargeTypeCur === 2) {
      ipParams.size = store.publicIpConfig.size // 带宽值
      ipParams.period = store.periodNum // 包年包月时长 (月) 包年包月必须指定
      ipParams.autoRenewFlag = 1 // 包年包月自动续费标识 包年包月必须指定 1 手动续费 2 自动续费
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

  const params = {
    regionId: store.region.id, // 地域ID
    zoneId: store.zoneConfig.cur.id, // 可用区ID
    specificationId: store.insConfig.cur.listingSpecificationId, // 服务器实例规格ID
    instanceCount: store.insCountConfig.num, // 购买数量
    imageId: store.sysConfig.imageCur, // 镜像ID
    imageType, //1 公共镜像 2 私有镜像 3 市场镜像
    systemDiskType: store.insConfig.cur.diskTypeId, // 系统盘类型
    systemDiskSize: INS_SYS_SIZE, // 系统盘大小
    isAutoRenew: store.autoRenewConfig.checked, // 是否自动续费
    password: '', // 服务器密码 => 后端生成
    eipInfo: ipParams, // ip
    sgInfo: sgInfo, // 安全组信息
    instanceChargeType, // 实例计费类型 1 按量计费 2 包年包月
    isQuicklyCreate: true, // 是否为快速创建
    periodNum: store.periodNum, // 订购周期
    autoCreateDefaultVpc: 2,
    vpcId: store.netConfig.vpcCur, // VPC ID
    subnetId: store.netConfig.subnetCur, // 子网ID
  }

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

// 监听地域/可用区/实例规格/数量/镜像/实例/带宽值/时长
watch(
  () => [
    store.region,
    store.zoneConfig,
    store.insConfig,
    store.insCountConfig,
    store.sysConfig,
    store.periodNum,
    store.publicIpConfig.checked,
    store.publicIpConfig.chargeTypeCur,
    store.publicIpConfig.lineTypeCur,
  ],
  () => {
    insIquiryFn()
  },
  {
    deep: true,
  },
)
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';

.fast {
  padding-bottom: 100px;
}

.config-wrap {
  .reat {
    width: 3px;
    height: 16px;
    margin-right: 10px;
    background: #0063ff;
  }

  .text {
    min-width: 70px;
  }
}

.item {
  .key-wrap {
    flex-shrink: 0;
    min-width: 90px;
    margin-right: 20px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .value {
    flex: 1;
    flex-grow: 1;
    max-width: calc(100% - 110px);
  }
}

.area-wrap {
  .area-desc {
    margin-bottom: 40px;
    font-size: 14px;
  }
}

.ins-wrap {
  margin-bottom: 40px;

  .gap {
    flex-wrap: wrap;
    gap: 20px 8px;
  }

  .ins {
    box-sizing: border-box;
    min-width: 350px;
    height: 140px;
    padding: 20px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;

    .top {
      margin-bottom: 5px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 600;
      color: #000;
    }

    .bottom {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #999;

      .desc {
        margin-bottom: 5px;
      }
    }
  }

  .ins-actived {
    background: #f1f7ff !important;
    border: 1px solid #0063ff !important;

    .top {
      color: #0063ff !important;
    }

    .bottom {
      color: #0063ff !important;
    }
  }
}

.sys-wrap {
  margin-bottom: 40px;

  .gap {
    flex-wrap: wrap;
    gap: 20px 8px;
  }

  .sys {
    box-sizing: border-box;
    width: 144px;
    height: 88px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;

    .text {
      margin-top: 6px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
      text-align: center;
    }
  }

  .sys-actived {
    background: #f1f7ff;
    border: 1px solid #0063ff;

    span {
      color: #0063ff;
    }
  }

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.network-wrap {
  margin-bottom: 40px;

  .network-default-desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    color: #999;
  }
}

.ip-wrap {
  margin-bottom: 40px;

  .publicIPDesc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
  }
}

.cost-type-wrap {
  margin-bottom: 40px;

  .gap {
    flex-wrap: wrap;
    gap: 4px 8px;
  }

  .cost-type {
    min-width: 118px;
    height: 34px;
    padding: 0 10px;
    margin-right: 8px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: #000;
    text-align: center;
    background: #eaebf1;
    border-radius: 4px;
  }

  .cost-type-actived {
    color: #fff;
    background: #0063ff;
  }
}

.line-wrap {
  margin-bottom: 40px;

  .line {
    min-width: 118px;
    height: 34px;
    padding: 0 10px;
    margin-right: 8px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: #000;
    text-align: center;
    background: #eaebf1;
    border-radius: 4px;
  }

  .line-actived {
    color: #fff;
    background: #0063ff;
  }
}

.package-wrap {
  margin-bottom: 40px;
}

.broadband-wrap {
  margin-bottom: 40px;

  .slider-default {
    :deep(.el-slider__button-wrapper) {
      left: 10px !important;
    }
  }
}

.login-wrap {
  margin-bottom: 40px;

  .btn {
    // width: 160px;
    display: inline-block;
    height: 34px;
    padding: 0 10px;
    line-height: 34px;
    text-align: center;
    background: #f1f7ff;
    border: 1px solid #0063ff;
    border-radius: 4px;

    span {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #0063ff;
    }
  }

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.default-wrap {
  margin-bottom: 40px;

  .default {
    box-sizing: border-box;
    display: inline-flex;
    min-width: 640px;
    padding: 20px;

    /* height: 230px; */
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;

    .default-left {
      margin-right: 20px;
    }

    .d-item {
      // flex: 1;

      .key {
        // width: 150px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .val {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }
    }
  }
}

.renew-wrap {
  margin-bottom: 40px;

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.fixed-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 99;
  width: 100%;

  // min-width: 1070px;
  height: 100px;
  text-align: center;
  background-color: #fff;

  .fixed-wrap_content {
    display: inline-flex;
    flex-wrap: wrap;
    width: 100%;
    max-width: calc(100% - 240px);

    // min-width: 1070px;
    height: 100%;
  }

  .lt {
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

.mb16 {
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loadingAnimate {
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}
</style>
