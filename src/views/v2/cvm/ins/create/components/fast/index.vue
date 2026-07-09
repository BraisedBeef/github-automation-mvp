<template>
  <div class="fast-v2">
    <div class="fast-v2__body">
      <div class="fast-v2__main">
        <section class="fast-v2__section">
          <div class="fast-v2__section-title">
            {{ t('ins.fast.baseConfig') }}
          </div>

          <div class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.area') }}
            </div>
            <div class="fast-v2__content">
              <AreaTabs v-model="store.region" class="fast-v2__area-tabs" @change-area="changeArea" />
              <p class="fast-v2__hint">
                <span v-html="t('ins.fast.areaDesc')" />
              </p>
            </div>
          </div>

          <div class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.ins') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__card-grid">
                <div
                  v-for="(item, index) in store.insConfig.list"
                  :key="index"
                  type="button"
                  class="fast-v2__instance-card"
                  :class="store.insConfig.cur.listingSpecificationId === item.listingSpecificationId && 'is-active'"
                  @click="changeInsConfig(item)"
                >
                  <div class="fast-v2__instance-title">
                    {{ t('ins.fast.cores', [INS_TYPE_NAME_MAP[item.type], item.cpus, item.ram]) }}
                  </div>
                  <div class="fast-v2__instance-lines">
                    <p>{{ t(`ins.fast.insConfigDesc${item.type}`) }}</p>
                    <p>{{ t('ins.fast.sysDisk') }}{{ INS_SYS_SIZE }}GB，{{ item.diskTypeName }}</p>
                    <p>{{ t('ins.fast.dataDisk') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="sys" class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.sys') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__os-grid">
                <button
                  v-for="(item, index) in store.sysConfig.list"
                  :key="index"
                  type="button"
                  class="fast-v2__os-card"
                  :class="store.sysConfig.cur.platform === item.platform && 'is-active'"
                  @click="changeSysConfig(item)"
                >
                  <SvgIcon
                    class="fast-v2__os-icon"
                    :name="
                      store.sysConfig.cur.platform === item.platform
                        ? INS_SYS_SVG_MAP[item.platform]?.actived
                        : INS_SYS_SVG_MAP[item.platform]?.default
                    "
                  />
                  <span>{{ item.platform }}</span>
                </button>
              </div>
              <div v-if="store.sysConfig.imagesList.length" class="fast-v2__image-select">
                <el-select
                  v-model="store.sysConfig.imageCur"
                  :teleported="false"
                  class="fast-v2__select"
                  :placeholder="t('ins.fast.imagePh')"
                >
                  <el-option
                    v-for="item in store.sysConfig.imagesList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.imageName"
                  />
                </el-select>
                <p class="fast-v2__muted">
                  {{ t('ins.fast.imageDesc') }}
                </p>
              </div>
            </div>
          </div>

          <div id="network" class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.custom.net') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__network-selects">
                <el-select
                  v-model="store.netConfig.vpcCur"
                  :teleported="false"
                  class="fast-v2__select fast-v2__select--network"
                  :placeholder="t('ins.custom.vpcPh')"
                  :disabled="!store.netConfig.vpcList?.length"
                  @change="changeVpc"
                >
                  <el-option
                    v-for="item in store.netConfig.vpcList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.vpcName"
                  />
                </el-select>
                <el-select
                  v-model="store.netConfig.subnetCur"
                  :teleported="false"
                  class="fast-v2__select fast-v2__select--network"
                  :placeholder="t('ins.custom.subnetPh')"
                  :disabled="!store.netConfig.subnetList?.length"
                >
                  <el-option
                    v-for="item in store.netConfig.subnetList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.subnetName"
                  />
                </el-select>
                <button type="button" class="fast-v2__refresh-btn" @click="refreshSubnet">
                  <SvgIcon name="refresh" :class="loadingNetwork ? 'loadingAnimate' : ''" />
                </button>
              </div>

              <div class="fast-v2__network-desc">
                <template v-if="!store.netConfig.vpcList?.length && !store.netConfig.subnetList?.length">
                  <i18n-t keypath="ins.custom.vpcDefaultDesc">
                    <span class="text-primary pointer mr4" @click="createVpcFn">{{ t('ins.custom.quickCreate') }}</span>
                  </i18n-t>
                </template>
                <template
                  v-if="
                    store.netConfig.vpcList?.length &&
                    !store.netConfig.subnetList?.length &&
                    !checkPermission(permMap.vpc.CREATE_VPC)
                  "
                >
                  <div>{{ t('ins.custom.noVpcOrSubnet') }}</div>
                  <i18n-t keypath="ins.custom.subnetDefaultDesc">
                    <span class="text-primary pointer mr4" @click="toSubnet">{{ t('ins.custom.createSubnet') }}</span>
                    <SvgIcon name="share" class="pointer fast-v2__share-icon" />
                  </i18n-t>
                </template>
                <template
                  v-if="
                    store.netConfig.vpcList?.length &&
                    !store.netConfig.subnetList?.length &&
                    checkPermission(permMap.vpc.CREATE_VPC)
                  "
                >
                  <div>{{ t('ins.custom.noVpcOrSubnet') }}</div>
                  <i18n-t keypath="ins.custom.vpcAndSubnetDefaultDesc">
                    <span class="text-primary pointer fast-v2__inline-link" @click="toVpc">
                      {{ t('ins.custom.createVpc') }}
                      <SvgIcon name="share" class="pointer fast-v2__share-icon" />
                    </span>
                    <span class="text-primary pointer fast-v2__inline-link" @click="toSubnet">
                      {{ t('ins.custom.createSubnet') }}
                      <SvgIcon name="share" class="pointer fast-v2__share-icon" />
                    </span>
                  </i18n-t>
                </template>
                <template
                  v-if="
                    store.netConfig.vpcList?.length &&
                    store.netConfig.subnetList?.length &&
                    checkPermission(permMap.vpc.CREATE_VPC)
                  "
                >
                  <i18n-t keypath="ins.custom.vpcAndSubnetDefaultDesc">
                    <span class="text-primary pointer fast-v2__inline-link" @click="toVpc">
                      {{ t('ins.custom.createVpc') }}
                      <SvgIcon name="share" class="pointer fast-v2__share-icon" />
                    </span>
                    <span class="text-primary pointer fast-v2__inline-link" @click="toSubnet">
                      {{ t('ins.custom.createSubnet') }}
                      <SvgIcon name="share" class="pointer fast-v2__share-icon" />
                    </span>
                  </i18n-t>
                </template>
              </div>
            </div>
          </div>

          <div class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.publicIP') }}
            </div>
            <div class="fast-v2__content">
              <el-checkbox v-model="store.publicIpConfig.checked" :label="t('ins.fast.ipChecked')" size="large" />
              <div v-if="!store.publicIpConfig.checked" class="fast-v2__error-text">
                {{ t('ins.fast.publicIPDesc') }}
              </div>
            </div>
          </div>

          <div v-if="store.publicIpConfig.checked" class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.custom.broadbandCostType') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__pill-row">
                <button
                  v-for="(item, index) in store.publicIpConfig.list"
                  :key="index"
                  type="button"
                  class="fast-v2__pill"
                  :class="store.publicIpConfig.chargeTypeCur === item.value && 'is-active'"
                  @click="changeIpChargeType(item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="store.publicIpConfig.checked" id="lineType" class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.custom.lineType') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__pill-row">
                <button
                  v-for="(item, index) in store.publicIpConfig.lineTypeList"
                  :key="index"
                  type="button"
                  class="fast-v2__pill"
                  :class="store.publicIpConfig.lineTypeCur === item.value && 'is-active'"
                  @click="changeIpLine(item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="store.publicIpConfig.checked && store.publicIpConfig.chargeTypeCur === 3"
            id="package"
            class="fast-v2__field"
          >
            <div class="fast-v2__label">
              {{ t('ins.custom.sharedTrafficPackage') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__network-selects">
                <el-select
                  v-model="store.publicIpConfig.pkgIdCur"
                  :teleported="false"
                  class="fast-v2__select fast-v2__select--network"
                  :placeholder="t('ins.custom.packagePh')"
                >
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
                <button type="button" class="fast-v2__refresh-btn" @click="refreshPkg">
                  <SvgIcon name="refresh" :class="loadingPkg ? 'loadingAnimate' : ''" />
                </button>
                <button type="button" class="fast-v2__text-btn" @click="toPackage">
                  {{ t('ins.custom.sharedPackageCreate') }}
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="
              store.region.showEipBandwidth && store.publicIpConfig.checked && store.publicIpConfig.chargeTypeCur !== 3
            "
            class="fast-v2__field"
          >
            <div class="fast-v2__label">
              {{ t('ins.custom.broadbandNum') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__bandwidth-row">
                <el-slider
                  v-model="store.publicIpConfig.size"
                  :class="store.publicIpConfig.size > 1 ? '' : 'slider-default'"
                  class="fast-v2__slider"
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

                <div class="fast-v2__bandwidth-input">
                  <el-input-number
                    v-model="store.publicIpConfig.size"
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
                  <span>Mbps</span>
                </div>
              </div>
            </div>
          </div>

          <div class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.loginType') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__tag-btn">
                {{ t('ins.fast.autoPwd') }}
              </div>
              <p class="fast-v2__muted">
                {{ t('ins.fast.autoPwdDesc') }}
              </p>
            </div>
          </div>

          <div class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.defaultConfig') }}
            </div>
            <div class="fast-v2__content">
              <div class="fast-v2__default-box">
                <div class="fast-v2__default-row">
                  <span>{{ t('ins.fast.zone') }}</span>
                  <strong>{{ t('ins.fast.randomAllocate') }}</strong>
                </div>
                <div class="fast-v2__default-row">
                  <span>{{ t('ins.fast.securityGroup') }}</span>
                  <strong>{{ t('ins.fast.defaultSecurityGroup') }}</strong>
                </div>
                <div class="fast-v2__default-row">
                  <span>{{ t('ins.fast.insName') }}</span>
                  <strong>{{ t('ins.fast.defaultInsName') }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.autoRenew') }}
            </div>
            <div class="fast-v2__content">
              <el-checkbox
                v-model="store.autoRenewConfig.checked"
                :label="t('ins.fast.autoRenewChecked')"
                size="large"
              />
              <p class="fast-v2__muted">
                {{ t('ins.fast.autoRenewDesc') }}
              </p>
            </div>
          </div>

          <div id="agree" class="fast-v2__field">
            <div class="fast-v2__label">
              {{ t('ins.fast.agree') }}
            </div>
            <div class="fast-v2__content">
              <el-checkbox v-model="store.agreeConfig.checked" size="large">
                <i18n-t keypath="ins.fast.agreeChecked">
                  <span class="text-primary" @click.stop="toCvmAgreementFn(store.agreeConfig.checked)">{{
                    t('ins.fast.cvmAgree')
                  }}</span>
                </i18n-t>
              </el-checkbox>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="fast-v2__footer">
      <div class="fast-v2__footer-controls">
        <div class="fast-v2__footer-item">
          <span>{{ t('ins.fast.durate') }}</span>
          <el-select v-model="store.periodNum" :teleported="false" class="fast-v2__footer-select">
            <el-option v-for="item in INS_DURATION_MAP" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>

        <div class="fast-v2__footer-item">
          <span>{{ t('ins.fast.num') }}</span>
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

      <div class="fast-v2__footer-total">
        <div class="fast-v2__footer-price-panel">
          <div class="fast-v2__footer-price-cluster">
            <el-popover
              placement="top"
              :width="336"
              trigger="hover"
              :teleported="false"
              popper-class="fast-v2__cost-popover"
              :show-arrow="false"
              :offset="16"
            >
              <template #reference>
                <button type="button" class="fast-v2__footer-cost-label">{{ t('ins.fast.configCost') }}：</button>
              </template>

              <div class="fast-v2__summary-card">
                <div class="fast-v2__summary-title">
                  {{ t('ins.fast.configCostDetail') }}
                </div>
                <div class="fast-v2__summary-table">
                  <div class="fast-v2__summary-head">
                    <span>{{ t('ins.fast.costItem') }}</span>
                    <span>{{ t('ins.fast.price') }}</span>
                  </div>
                  <div v-for="item in summaryRows" :key="item.label" class="fast-v2__summary-row">
                    <span>{{ item.label }}</span>
                    <span>${{ item.price }}</span>
                  </div>
                </div>
              </div>
            </el-popover>
            <div class="fast-v2__footer-cost">
              <div class="fast-v2__footer-price-row">
                <span class="fast-v2__footer-amount">${{ allPrice.sum }}</span>
                <span class="fast-v2__footer-currency">USD</span>
              </div>
            </div>
          </div>
          <span v-if="allPrice.coupon" class="fast-v2__footer-original">已省：${{ allPrice.coupon }} USD</span>
        </div>
        <el-button v-if="checkPermission(permMap.ins.CREATE_VM)" :loading="loading" type="primary" @click="submit">
          {{ t('ins.fast.buy') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
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
import { useCvmStore } from '@/store'
import { bandwidthSliderConfig } from '@/views/network/public-ip/list/config'
import { getQueryVpcPage } from '@/apis/network/private-network'
import { getQuerySubnetPage } from '@/apis/network/subnet'
import { getEipChargeType } from '@/apis/network/public-ip'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

NP.enableBoundaryChecking(false)

const cvmStore = useCvmStore()

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

const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const instanceChargeType = 2
const imageType = 1

const loadingNetwork = ref(false)
const loadingPkg = ref(false)

const sgInfo = reactive<{
  rules: any[]
}>({
  rules: [...SECURITY_GROUP_EGRESS_RULES, ...SECURITY_GROUP_INGRESS_RULES],
})

const showNetworkSingle = computed(() => {
  if (store.publicIpConfig.checked) {
    return store.publicIpConfig.chargeTypeCur === 1
  } else {
    return false
  }
})

const summaryRows = computed(() => {
  const rows = [
    { label: t('ins.fast.ins'), key: 'instancePrice' },
    { label: t('ins.fast.image'), key: 'imagePrice' },
    { label: t('ins.fast.sysDiskRam'), key: 'systemDiskPrice' },
    { label: t('ins.fast.dataDiskRam'), key: 'dataDiskPrice' },
  ].map(item => ({
    label: item.label,
    price: createInsPrice[item.key]?.discountPrice || 0,
  }))

  if (!showNetworkSingle.value) {
    rows.push({
      label: t('ins.custom.publicNetBandwidth'),
      price: createInsPrice.networkPrice?.discountPrice || 0,
    })
  }

  return rows
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

const refreshSubnet = async () => {
  loadingNetwork.value = !loadingNetwork.value
  if (loadingNetwork.value) {
    setTimeout(() => {
      loadingNetwork.value = false
      message.success(t('common.updateSuccess'))
    }, 2000)
  }
  await getQueryVpcPageFn()
  getQuerySubnetPageFn()
}

const changeVpc = () => {
  getQuerySubnetPageFn()
}

const toPackage = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/flow-packet/list`, '_blank')
}

const toVpc = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/private-network/list`, '_blank')
}

const toSubnet = () => {
  cvmStore.setAreaSelect(store.region)
  var origin = window.location.origin
  window.open(origin + `/network/subnet/list`, '_blank')
}

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

const insIquiryFn = () => {
  if (!store.region.id) return
  if (!store.zoneConfig.cur.id) return
  if (!store.insConfig.cur.listingSpecificationId) return
  if (!store.insCountConfig.num) return
  if (!store.periodNum) return
  if (!store.sysConfig.imageCur) return
  if (!store.insConfig.cur.diskTypeId) return
  if (!store.insConfig.cur.diskTypeId) return
  if (store.publicIpConfig.checked) {
    if (!store.publicIpConfig.lineTypeCur) return
    if (!store.publicIpConfig.chargeTypeCur) return
  }

  insIquiry()
}

const submit = async () => {
  if (!Reflect.has(store.insConfig.cur, 'listingSpecificationId')) {
    return message.warning(t('ins.fast.insWarning'))
  }

  if (!store.sysConfig.imageCur) {
    document.getElementById('sys')?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.fast.imageWarning'))
  }

  if (!store.netConfig.vpcCur) {
    document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.vpcPh'))
  }

  if (!store.netConfig.subnetCur) {
    document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.subnetPh'))
  }

  if (store.publicIpConfig.checked) {
    if (!store.publicIpConfig.lineTypeCur) {
      document.getElementById('lineType')?.scrollIntoView({ behavior: 'smooth' })
      return message.warning(t('ins.custom.lineTypePh'))
    }

    if (store.publicIpConfig.chargeTypeCur === 3 && !store.publicIpConfig.pkgIdCur) {
      document.getElementById('package')?.scrollIntoView({ behavior: 'smooth' })
      return message.warning(t('ins.custom.packagePh'))
    }
  }

  if (!store.periodNum) {
    return message.warning(t('ins.fast.durateWarning'))
  }

  if (!store.agreeConfig.checked) {
    document.getElementById('agree')?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.fast.agreeWarning'))
  }

  const createInstanceVerifyRes = await createInstanceVerifyFn()
  if (!createInstanceVerifyRes) return

  const createInstanceDryRunRes = await createInstanceDryRunFn()
  if (!createInstanceDryRunRes) return

  createInstanceFn()
}

const toCvmAgreementFn = (status: boolean) => {
  store.agreeConfig.checked = !status
  toCvmAgreement()
}

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

const changeInsConfig = (raw: any) => {
  store.insConfig.cur = raw
}

const changeSysConfig = (raw: any) => {
  if (raw.platform === store.sysConfig.cur.platform) return
  store.sysConfig.cur = raw
  store.sysConfig.imagesList = raw.images || []
  store.sysConfig.imageCur = ''
}

const getEipChargeTypeFn = async () => {
  try {
    const res = await getEipChargeType({ regionId: store.region.id })
    if (res.success) {
      const list = res.data?.list || []
      store.publicIpConfig.list = PUBLIC_IP_CONFIG_LIST.filter(el => list.includes(el.value))

      const ipChargeRes = store.publicIpConfig.list.find(el => el.value === store.publicIpConfig.chargeTypeCur)
      if (!ipChargeRes) {
        const defaultIpCharge = store.publicIpConfig.list[0].value
        store.publicIpConfig.chargeTypeCur = defaultIpCharge
      }

      getEipLineTypeFn()
    }
  } catch (error) {
    console.log(error)
  }
}

const changeIpChargeType = (raw: any) => {
  if (store.publicIpConfig.chargeTypeCur !== raw) {
    store.publicIpConfig.chargeTypeCur = raw
    getEipLineTypeFn()
  }
}

const changeIpLine = async (raw: any) => {
  if (store.publicIpConfig.lineTypeCur !== raw) {
    store.publicIpConfig.lineTypeCur = raw

    if (store.publicIpConfig.chargeTypeCur === 3) {
      getShareTrafficPackageListFn()
    }
  }
}

const listRecommendSpecifications = async () => {
  try {
    const res = await _listRecommendSpecifications({
      regionId: store.region.id,
      zoneId: store.zoneConfig.cur.id,
    })

    if (res.success) {
      store.insConfig.list = res.data || []

      if (store.insConfig.cur.listingSpecificationId) {
        if (
          !store.insConfig.list.find(el => el.listingSpecificationId === store.insConfig.cur.listingSpecificationId)
        ) {
          store.insConfig.cur = store.insConfig.list[0] || {}
        }
      } else {
        store.insConfig.cur = store.insConfig.list[0] || {}
      }
    } else {
      store.insConfig.list = []
    }
  } catch (error) {
    console.log(error)
  }
}

const groupImages = async () => {
  try {
    const res = await _groupImages({
      regionId: store.region.id,
      imageType,
    })

    if (res.success) {
      store.sysConfig.list = res.data || []

      const platformRes = store.sysConfig.list.find(el => el.platform === store.sysConfig.cur.platform)

      if (platformRes) {
        store.sysConfig.cur = platformRes
        store.sysConfig.imagesList = store.sysConfig.cur.images || []
      } else {
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

const createVpcFn = async () => {
  const cb = async (res: any) => {
    if (res.success) {
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

const getQueryVpcPageFn = async () => {
  try {
    const res = await getQueryVpcPage({
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    })

    if (res.success) {
      store.netConfig.vpcList = res.data.list || []

      const vpcRes = store.netConfig.vpcList.find(el => el?.id === store.netConfig.vpcCur)
      if (!vpcRes) {
        const defaultVpc = store.netConfig.vpcList[0]?.id
        store.netConfig.vpcCur = defaultVpc ? defaultVpc : ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const getQuerySubnetPageFn = async () => {
  try {
    const params: any = {
      zoneId: store.zoneConfig.cur.id,
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    }

    if (store.netConfig.vpcCur) {
      params.vpcId = store.netConfig.vpcCur
    }

    const res = await getQuerySubnetPage(params)

    if (res.success) {
      store.netConfig.subnetList = res.data.list || []

      const subnetRes = store.netConfig.subnetList.find(el => el?.id === store.netConfig.subnetCur)
      if (!subnetRes) {
        const defaultSubnet = store.netConfig.subnetList[0]?.id
        store.netConfig.subnetCur = defaultSubnet ? defaultSubnet : ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const getEipLineTypeFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.publicIpConfig.lineTypeList = lineTypeList.filter(el => res.data?.includes(el.value))

      const lineTypeRes = store.publicIpConfig.lineTypeList.find(el => el.value === store.publicIpConfig.lineTypeCur)
      if (!lineTypeRes) {
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

const listByRegionIdFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.zoneConfig.list = res.data || []
    }
  }

  return listByRegionId({ regionId: store.region.id }, cb)
}

const getQuickCreateDefaultZoneFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      store.zoneConfig.cur = store.zoneConfig.list.find(el => el.id === res.data?.zoneId) || store.zoneConfig.list[0]
    }
  }

  return getQuickCreateDefaultZone({ regionId: store.region.id }, cb)
}

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

const createInstanceDryRunFn = async () => {
  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    specificationId: store.insConfig.cur.listingSpecificationId,
    instanceCount: store.insCountConfig.num,
    imageId: store.sysConfig.imageCur,
    imageType,
    systemDiskType: store.insConfig.cur.diskTypeId,
    systemDiskSize: INS_SYS_SIZE,
    vpcId: store.netConfig.vpcCur,
    subnetId: store.netConfig.subnetCur,
    instanceChargeType,
    periodNum: store.periodNum,
  }

  const cb = (res: any) => {
    if (!res.success) {
      message.warning(res.msg)
    }
  }

  return createInstanceDryRun(params, cb)
}

const insIquiry = () => {
  let ipParams: any = {}

  if (store.publicIpConfig.checked) {
    ipParams = {
      openEip: 1,
      lineType: store.publicIpConfig.lineTypeCur,
      chargeType: store.publicIpConfig.chargeTypeCur,
      num: 1,
      cascadeRelease: 1,
    }

    if (store.publicIpConfig.chargeTypeCur === 2) {
      ipParams.size = store.publicIpConfig.size
      ipParams.period = store.periodNum
      ipParams.autoRenewFlag = 1
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

  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    specificationId: store.insConfig.cur.listingSpecificationId,
    instanceCount: store.insCountConfig.num,
    imageId: store.sysConfig.imageCur,
    imageType,
    systemDiskType: store.insConfig.cur.diskTypeId,
    systemDiskSize: INS_SYS_SIZE,
    eipInfo: ipParams,
    instanceChargeType,
    periodNum: store.periodNum,
  }
  createInstanceInquiry(params)
}

const createInstanceFn = () => {
  loading.value = true

  let ipParams: any = {}

  if (store.publicIpConfig.checked) {
    ipParams = {
      openEip: 1,
      lineType: store.publicIpConfig.lineTypeCur,
      chargeType: store.publicIpConfig.chargeTypeCur,
      num: 1,
      cascadeRelease: 1,
    }

    if (store.publicIpConfig.chargeTypeCur === 2) {
      ipParams.size = store.publicIpConfig.size
      ipParams.period = store.periodNum
      ipParams.autoRenewFlag = 1
    }

    if (store.publicIpConfig.chargeTypeCur === 1) {
      ipParams.size = store.publicIpConfig.size
    }

    if (store.publicIpConfig.chargeTypeCur === 3) {
      ipParams.pkgId = store.publicIpConfig.pkgIdCur
    }
  } else {
    ipParams = {
      openEip: 2,
      cascadeRelease: 1,
    }
  }

  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    specificationId: store.insConfig.cur.listingSpecificationId,
    instanceCount: store.insCountConfig.num,
    imageId: store.sysConfig.imageCur,
    imageType,
    systemDiskType: store.insConfig.cur.diskTypeId,
    systemDiskSize: INS_SYS_SIZE,
    isAutoRenew: store.autoRenewConfig.checked,
    password: '',
    eipInfo: ipParams,
    sgInfo,
    instanceChargeType,
    isQuicklyCreate: true,
    periodNum: store.periodNum,
    autoCreateDefaultVpc: 2,
    vpcId: store.netConfig.vpcCur,
    subnetId: store.netConfig.subnetCur,
  }

  const cb = () => {
    cvmStore.setAreaSelect(store.region)
  }

  createInstance(true, params, cb)
}

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

.fast-v2 {
  // padding-bottom: 128px;
}

.fast-v2__body {
  display: block;
}

.fast-v2__section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.fast-v2__section-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #101828;
}

.fast-v2__field {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.fast-v2__label {
  // padding-top: 11px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.fast-v2__content {
  min-width: 0;
}

.fast-v2__hint,
.fast-v2__muted,
.fast-v2__network-desc {
  margin-top: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.fast-v2__card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.fast-v2__instance-card,
.fast-v2__os-card,
.fast-v2__pill,
.fast-v2__refresh-btn,
.fast-v2__text-btn {
  appearance: none;
  cursor: pointer;
  border: 0;
}

.fast-v2__instance-card {
  position: relative;
  height: 150px;
  padding: 24px;
  text-align: left;
  background-color: #fff;
  background-image: none;
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
  border: 1px solid #e8ecf3;
  border-radius: 0;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.fast-v2__instance-card.is-active {
  width: 100%;
  height: 150px;
  background: url('@/assets/v2/cvm/images/example-bj.png') no-repeat;
  background-size: cover;

  // border: none;
  border-color: #1570ef;
  box-shadow: 0 10px 30px rgb(21 112 239 / 12%);
}

.fast-v2__instance-title {
  margin-bottom: 14px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #101828;
}

.fast-v2__instance-lines {
  font-size: 14px;
  line-height: 28px;
  color: #667085;
}

.fast-v2__os-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.fast-v2__os-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 135px;
  height: 135px;
  background: #fff;
  border: 1px solid #e8ecf3;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.fast-v2__os-card.is-active {
  border-color: #1570ef;
  box-shadow: inset 0 0 0 1px rgb(21 112 239 / 8%);
}

.fast-v2__os-card span {
  font-size: 16px;
  line-height: 24px;
  color: #344054;
}

.fast-v2__os-card.is-active span {
  color: #1570ef;
}

.fast-v2__os-icon {
  width: 48px;
  height: 48px;
}

.fast-v2__image-select {
  margin-top: 20px;
}

.fast-v2__select {
  width: 453px;
}

.fast-v2__select--network {
  width: 350px;
}

.fast-v2__network-selects {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.fast-v2__refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: #667085;
  background: transparent;
}

.fast-v2__inline-link {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  margin-right: 10px;
}

.fast-v2__share-icon {
  width: 12px;
  height: 12px;
}

.fast-v2__error-text {
  margin-top: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #f04438;
}

.fast-v2__pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fast-v2__pill {
  min-width: 118px;
  height: 34px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 34px;
  color: #344054;
  text-align: center;
  background: #eef2f6;
}

.fast-v2__pill.is-active {
  color: #fff;
  background: #1570ef;
}

.fast-v2__bandwidth-row {
  display: flex;
  gap: 36px;
  align-items: center;
}

.fast-v2__slider {
  flex: 1;
  max-width: 600px;
}

.fast-v2__bandwidth-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.fast-v2__tag-btn {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 16px;
  color: #1570ef;
  background: #eff8ff;
  border: 1px solid #b2ddff;
}

.fast-v2__default-box {
  display: grid;
  gap: 16px;
  width: min(100%, 548px);
  padding: 24px;
  background: #fff;
  border: 1px solid #eaecf0;
}

.fast-v2__default-row {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 16px;

  // padding: 8px 0;
}

.fast-v2__default-row span {
  color: #667085;
}

.fast-v2__default-row strong {
  font-weight: 400;
  color: #344054;
}

.fast-v2__summary-card {
  width: 336px;
  padding: 8px 12px 12px;
  background: #fff;
  border: none;
  box-shadow: 0 8px 24px rgb(16 24 40 / 12%);
}

.fast-v2__summary-title {
  padding: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #191c23;
}

.fast-v2__summary-table {
  width: 312px;
  padding: 0;
}

.fast-v2__summary-head,
.fast-v2__summary-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  gap: 0;
  align-items: center;
  min-height: 46px;
  padding: 8px 16px;
}

.fast-v2__summary-head {
  min-height: 46px;
  padding-top: 13px;
  padding-bottom: 13px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: #191c23;
  background: #f9fafc;
}

.fast-v2__summary-row {
  font-size: 14px;
  line-height: 22px;
  color: rgb(0 0 0 / 90%);
  background: #fff;
}

.fast-v2__summary-row span:last-child {
  justify-self: start;
  color: #ff720d;
}

.fast-v2__footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  gap: 32px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 56px;
  background: rgb(255 255 255 / 96%);
  backdrop-filter: blur(12px);
  border-top: 1px solid #eaecf0;
}

.fast-v2__footer-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
  min-width: 0;
}

.fast-v2__footer-item {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #667085;
}

.fast-v2__footer-item > span {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.fast-v2__footer-select {
  width: 240px;
}

.fast-v2__footer-total {
  display: flex;
  flex-shrink: 0;
  gap: 32px;
  align-items: center;
}

.fast-v2__footer-price-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding-bottom: 22px;
}

.fast-v2__footer-price-cluster {
  display: flex;
  gap: 16px;
  align-items: baseline;
}

.fast-v2__footer-cost-label {
  display: inline-flex;
  align-items: flex-end;
  height: 40px;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;
  text-decoration: underline;
  cursor: pointer;
  background: transparent;
  border: 0;
  text-decoration-skip-ink: none;
}

.fast-v2__footer-cost {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.fast-v2__footer-price-row {
  display: flex;
  gap: 4px;
  align-items: baseline;
}

.fast-v2__footer-amount {
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  color: #f97316;
}

.fast-v2__footer-currency {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #f97316;
}

.fast-v2__footer-original {
  position: absolute;
  bottom: 0;
  left: 55%;
  margin-top: 2px;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
  text-decoration: line-through;
  white-space: nowrap;
  transform: translateX(-50%);
}

.fast-v2__footer-total :deep(.el-button--primary) {
  align-self: center;
  min-width: 120px;
  height: 48px;
  padding: 12px 16px;
  font-size: 16px;
  line-height: 24px;
  border-radius: 0;
}

:deep(.fast-v2__cost-popover) {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.fast-v2__text-btn {
  padding: 0;
  color: #1570ef;
  background: transparent;
}

:deep(.fast-v2__area-tabs .tabs) {
  margin-bottom: 12px;
}

:deep(.fast-v2__area-tabs .gap) {
  gap: 12px 8px;
}

:deep(.fast-v2__area-tabs .area) {
  min-width: 132px;
  background: #eef4fb;
  border-radius: 0;
}

:deep(.fast-v2__area-tabs .area-actived) {
  background: #1570ef;
}

:deep(.fast-v2__select .el-select__wrapper) {
  min-height: 34px;
  border-radius: 0;
}

:deep(.el-checkbox__label) {
  color: #344054;
}

:deep(.el-input-number) {
  width: 140px;
}

@media (width <= 1280px) {
  .fast-v2__card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 900px) {
  .fast-v2 {
    padding-bottom: 180px;
  }

  .fast-v2__field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .fast-v2__label {
    padding-top: 0;
  }

  .fast-v2__card-grid {
    grid-template-columns: 1fr;
  }

  .fast-v2__os-grid {
    gap: 12px;
  }

  .fast-v2__os-card {
    width: calc(50% - 6px);
    min-width: 132px;
  }

  .fast-v2__select,
  .fast-v2__select--network {
    width: 100%;
  }

  .fast-v2__bandwidth-row,
  .fast-v2__footer,
  .fast-v2__footer-controls,
  .fast-v2__footer-total {
    flex-direction: column;
    align-items: stretch;
  }

  .fast-v2__footer {
    padding: 16px;
  }
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
