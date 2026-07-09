<template>
  <div class="wrap">
    <!-- 基础配置 -->
    <div class="item config-wrap df ac mb20">
      <div class="key-wrap">
        <Title :text="t('ins.custom.baseConfig')" />
      </div>
    </div>

    <!-- 计费模式 -->
    <div class="item cost-wrap df mb20">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.costType') }}
      </div>
      <div class="value df ac">
        <div
          v-for="(item, index) in COST_TYPE_CONFIG_LIST"
          :key="index"
          class="cost cursor-pointer df ac"
          :class="store.costTypeConfig.cur === item.value && 'cost-actived'"
          @click="changeCostTypeConfig(item)"
        >
          <!-- <SvgIcon style="width: 36px; height: 36px" :name="item.icon" /> -->
          <el-image style="width: 36px; height: 36px" :src="item.icon" fit="contain" />
          <div class="desc ml10">
            <p class="main">
              {{ item.labelMain }}
            </p>
            <p class="sub">
              {{ item.labelSub }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 地域 -->
    <div class="item df area-wrap">
      <div class="key-wrap" :style="labelClass">
        <p style="margin-top: 15px">
          {{ t('ins.custom.area') }}
        </p>
      </div>
      <div class="value">
        <AreaTabs v-model="store.region" class="mb16" @change-area="changeArea" />
        <div class="desc">
          {{ t('ins.custom.regionDesc') }}
        </div>
      </div>
    </div>

    <!-- 可用区 -->
    <div id="zone" class="item df zone-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.zone') }}
      </div>
      <div class="value">
        <div class="df mb16 gap">
          <div
            v-for="(item, index) in store.zoneConfig.list"
            :key="index"
            class="zone cursor-pointer"
            :class="store.zoneConfig.cur.id === item.id && 'zone-actived'"
            @click="changeZoneConfig(item)"
          >
            {{ item.zoneName }}
          </div>
        </div>
        <div class="desc">
          {{ t('ins.custom.zoneDesc') }}
        </div>
      </div>
    </div>

    <!-- 实例配置 -->
    <div class="item config-wrap df ac mb20">
      <div class="key-wrap">
        <Title :text="t('ins.custom.insConfig')" />
      </div>
    </div>

    <!-- 实例 -->
    <div id="ins" class="item df ins-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.ins') }}
      </div>
      <div class="value" style="margin-top: -6px">
        <!-- 筛选 -->
        <div class="ins-item df ac mb20">
          <div class="key" :style="keyWrapClass">
            {{ t('ins.custom.filter') }}
          </div>
          <div>
            <!-- cpu下拉 -->
            <el-select
              v-model="store.insConfig.vcpus"
              style="width: 240px; margin-right: 8px"
              :teleported="false"
              :placeholder="t('ins.custom.cpuPh')"
              @change="() => getSpecificationsListFn()"
            >
              <el-option v-for="item in INS_CPU_MAP" :key="item.value" :value="item.value" :label="item.label" />
            </el-select>
            <!-- 内存下拉 -->
            <el-select
              v-model="store.insConfig.ram"
              style="width: 240px"
              :teleported="false"
              class="mr20"
              :placeholder="t('ins.custom.ramPh')"
              @change="() => getSpecificationsListFn()"
            >
              <el-option v-for="item in INS_RAM_MAP" :key="item.value" :value="item.value" :label="item.label" />
            </el-select>

            <span class="text-primary cursor-pointer" @click="resetInsConfig">{{ t('ins.custom.reset') }}</span>
          </div>
        </div>
        <!-- 实例族 -->
        <div class="ins-item df ac mb20">
          <div class="key" :style="keyWrapClass">
            {{ t('ins.custom.insFamily') }}
          </div>
          <div class="df ac gap">
            <div
              v-for="(item, index) in insFamilyList"
              :key="index"
              class="btn pointer"
              :class="store.insConfig.familyCur.id === item.id ? 'btn-actived' : ''"
              @click="changeInsConfig(item, 'family')"
            >
              {{ item.familyName }}
            </div>
          </div>
        </div>
        <!-- 类型 -->
        <div class="ins-item df ac mb20">
          <div class="key" :style="keyWrapClass">
            {{ t('ins.custom.type') }}
          </div>
          <div class="df ac gap">
            <div
              v-for="(item, index) in insTypeList"
              :key="index"
              class="btn pointer"
              :class="store.insConfig.typeCur.id === item.id ? 'btn-actived' : ''"
              @click="changeInsConfig(item, 'type')"
            >
              <!-- v-for="(item, index) in store.insConfig.typeList" -->
              {{ item.typeName }}
            </div>
          </div>
        </div>
        <div v-if="store.insConfig.rowCur.id" class="ins-item df ac" style="margin-bottom: 40px">
          <div class="key" :style="keyWrapClass">
            {{ t('ins.custom.checkIns') }}
          </div>
          <div class="df ac">
            <div class="check-ins">
              {{ insConfigSelect }}
            </div>
          </div>
        </div>
        <div class="ins-item">
          <el-table
            ref="insTableRef"
            v-loading="loading"
            :data="store.insConfig.tableData"
            class="mt20 table"
            @selection-change="handleRowSelectChange"
          >
            <el-table-column type="selection" width="40" />
            <!-- 实例 -->
            <el-table-column min-width="200" :label="t('ins.custom.ins')">
              <template #default="{ row }">
                <div>{{ row.typeName }}</div>
              </template>
            </el-table-column>
            <!-- 规格 -->
            <el-table-column min-width="200" :label="t('ins.custom.specificate')">
              <template #default="{ row }">
                <div>{{ row.specificationName }}</div>
              </template>
            </el-table-column>
            <!-- vCPU -->
            <el-table-column min-width="100" label="vCPU">
              <template #default="{ row }">
                {{ t('ins.custom.cores', [row.vcpus]) }}
              </template>
            </el-table-column>
            <!-- 内存 -->
            <el-table-column min-width="100" :label="t('ins.custom.ram')">
              <template #default="{ row }">
                <div>{{ row.ram }}GB</div>
              </template>
            </el-table-column>
            <!-- 处理器型号 -->
            <el-table-column min-width="400" :label="t('ins.custom.cpuName')" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-over">
                    {{ row.cpuName }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 内网带宽 -->
            <el-table-column min-width="220" :label="t('ins.custom.internalNetworkBandwidth')">
              <template #default="{ row }">
                <div>{{ row.internalNetworkBandwidth || 0 }}Gbit/s</div>
              </template>
            </el-table-column>
            <!-- 网络收发包 -->
            <el-table-column min-width="280" :label="t('ins.custom.networkReceiveSend')">
              <template #default="{ row }">
                {{ t('ins.custom.ppsUnit', [row.maxPps]) }}
              </template>
            </el-table-column>
            <!-- 参考费用 -->
            <el-table-column min-width="200" :label="t('ins.custom.referenceCost')">
              <template #default="{ row }">
                {{
                  isTimeCost(store.costTypeConfig.cur)
                    ? `$${row.prepaidPrice || 0} USD/${t('ins.custom.month')}`
                    : `$${row.usageDiscountPrice || 0} USD/${t('ins.custom.hour')}`
                }}
              </template>
            </el-table-column>
          </el-table>

          <CatPagination
            v-model:pagination="store.insConfig.pagination"
            :total="store.insConfig.total"
            :custom-keys="['page', 'pageSize']"
            @change="paginationChange"
          />
        </div>
      </div>
    </div>

    <!-- 镜像 -->
    <div id="image" class="item df image-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.image') }}
      </div>
      <div class="value gap">
        <CatTabs2
          style="margin-top: -15px"
          class="tabs"
          :model-value="store.sysConfig.imageTypeCur"
          :tabs="IMAGE_TYPE_ARR_MAP"
          @change="changeImageType"
        />

        <div class="df gap" :class="store.sysConfig.list.length ? 'mt20' : ''">
          <div
            v-for="(item, index) in store.sysConfig.list"
            :key="index"
            class="sys cursor-pointer df fdc jc ac"
            :class="store.sysConfig.platformCur.platform === item.platform && 'sys-actived'"
            @click="changeSysConfig(item)"
          >
            <SvgIcon
              style="width: 24px; height: 24px"
              :name="
                store.sysConfig.platformCur.platform === item.platform
                  ? INS_SYS_SVG_MAP[item.platform]?.actived
                  : INS_SYS_SVG_MAP[item.platform]?.default
              "
            />
            <div class="text">
              {{ item.platform }}
            </div>
          </div>
        </div>
        <!-- 公共镜像类型 -->
        <div v-if="store.sysConfig.imageTypeCur === 1" class="mt20">
          <div>
            <!-- 镜像下拉 -->
            <el-select
              v-model="store.sysConfig.imageCur"
              style="width: 360px"
              :teleported="false"
              class="mb16"
              :placeholder="t('ins.custom.imagePh')"
              @change="() => {}"
            >
              <el-option
                v-for="item in store.sysConfig.imagesList"
                :key="item.id"
                :value="item.id"
                :label="item.imageName"
              >
                <!-- <div class="w-full h-full text-over">
                  {{ item.imageName }}
                </div> -->
              </el-option>
            </el-select>
            <p class="desc">
              {{ t('ins.custom.imageDesc') }}
            </p>
          </div>
        </div>
        <!-- 自定义镜像类型 -->
        <div v-else class="mt20">
          <div class="df ac mb16">
            <!-- 镜像下拉 -->
            <el-select
              v-model="store.sysConfig.imageCur"
              style="width: 360px"
              :teleported="false"
              class=""
              :placeholder="t('ins.custom.imagePh')"
              @change="() => {}"
            >
              <el-option
                v-for="item in store.sysConfig.imagesList"
                :key="item.id"
                :value="item.id"
                :label="item.imageName"
              />
            </el-select>
            <span class="text-primary ml20 pointer" @click="toImage">{{ t('ins.custom.createCustImage') }}</span>
          </div>
          <p class="desc">
            {{ t('ins.custom.imageDesc') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 存储 -->
    <div class="item df storage-wrap">
      <div class="key-wrap" :style="labelClass">
        {{ t('ins.custom.storage') }}
      </div>
      <div class="value">
        <Storage
          ref="storageRef"
          :cost-type="store.costTypeConfig.cur"
          :region-id="store.region.id"
          :zone-id="store.zoneConfig.cur.id"
          :specification-id="store.insConfig.rowCur.id || 0"
        />
      </div>
    </div>

    <Fixed :step="store.step" :next-loading="verifyLoading" @change-step="changeStep" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import Title from '@/views/cvm/ins/create/components/title/index.vue'
import Storage from './storage.vue'
import { _getInstanceFamily } from '@/apis/cvm/ins'
import { _groupImages } from '@/apis/cvm/image'
import {
  INS_SYS_SVG_MAP,
  INS_CPU_MAP,
  INS_RAM_MAP,
  COST_TYPE_CONFIG_LIST,
  PUBLIC_IP_CONFIG_LIST,
  isFlowCost,
  isTimeCost,
} from '@/views/cvm/ins/config'
import { IMAGE_TYPE_ARR_MAP } from '@/views/cvm/image/config'
import Fixed from '../fixed/index.vue'

import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { getEipChargeType } from '@/apis/network/public-ip'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelMap = {
  [ja]: 'width: 90px',
  [en]: 'width: 120px',
  [zh]: 'width: 90px',
}

const keyWrapMap = {
  [ja]: 'width: 180px',
  [en]: 'width: 150px',
  [zh]: 'width: 90px',
}

// 全部实例族
const allInsFamily = {
  id: 0,
  familyName: t('ins.custom.allInsFamily'),
}

// 全部实例类型
const allInsType = {
  id: 0,
  typeName: t('ins.custom.allInsType'),
}

const labelClass = useI18nStyle(labelMap)
const keyWrapClass = useI18nStyle(keyWrapMap)

const { cvmInsCreateStore: store, createInstanceVerify, loading: verifyLoading, getSpecificationsList } = useIns()
const { listByRegionId } = useBaseConfig()

const loading = ref<boolean>(false)

const insTableRef = ref<any>()
const storageRef = ref<any>() // 存储

// 实例族集合
const insFamilyList = computed(() => {
  return [allInsFamily, ...store.insConfig.list]
})

// 实例类型集合
const insTypeList = computed(() => {
  return [allInsType, ...store.insConfig.typeList]
})

// 已选实例
const insConfigSelect = computed(() => {
  return t('ins.custom.checkInsDesc', [
    store.insConfig.rowCur.specificationName,
    store.insConfig.rowCur.typeName,
    store.insConfig.rowCur.vcpus,
    store.insConfig.rowCur.ram,
  ])
})

// 跳转自定义镜像
const toImage = () => {
  pushRoute({
    name: 'image',
    query: {
      active: 2,
    },
  })
}

// 下一步
const changeStep = async (value: string) => {
  console.log(`a 下一步====>`, value)

  // 可用区
  if (!Reflect.has(store.zoneConfig.cur, 'id')) {
    // 锚点错误定位
    const el = document.getElementById('zone')
    el?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.zoneWarning'))
  }
  // 实例
  if (!Reflect.has(store.insConfig.rowCur, 'id')) {
    // 锚点错误定位
    const el = document.getElementById('ins')
    el?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.insWarning'))
  }
  // 镜像
  if (!store.sysConfig.imageCur) {
    const el = document.getElementById('image')
    el?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.imageWarning'))
  }
  // 硬盘
  const storageRes = await storageRef.value.verify()
  console.log(`storageRes==>`, storageRes)
  if (!storageRes) return

  // 库存验证
  const res = await createInstanceVerifyFn()
  if (!res) return

  store.setStep(value)
}

// 重置筛选
const resetInsConfig = () => {
  store.insConfig.vcpus = ''
  store.insConfig.ram = ''
  getSpecificationsListFn()
}

// 切换实例
const changeInsConfig = (raw: any, type: 'family' | 'type') => {
  // 切换实例族
  if (type === 'family') {
    store.insConfig.familyCur = raw
    store.insConfig.typeList = raw.types || []
    // 默认选中第一个
    store.insConfig.typeCur = insTypeList.value?.[0] || allInsType
    getSpecificationsListFn()
  }
  // 切换类型
  if (type === 'type') {
    store.insConfig.typeCur = raw
    getSpecificationsListFn()
  }
}

// 切换计费模式
const changeCostTypeConfig = (raw: any) => {
  // 计费模式
  store.costTypeConfig.cur = raw.value
  if (isFlowCost(raw.value)) {
    store.autoRenewConfig.checked = false
  }
  // 宽带计费模式
  handleIpChargeType()
  // 实例配置
  store.insConfig.vcpus = ''
  store.insConfig.ram = ''
  getSpecificationsListFn()
}

// 切换地域
const changeArea = async () => {
  groupImages()
  getEipChargeTypeFn()
  await listByRegionIdFn()
  getInstanceFamily()
}

// 切换可用区
const changeZoneConfig = (raw: any) => {
  store.zoneConfig.cur = raw
  getInstanceFamily()
}

// 切换系统
const changeSysConfig = (raw: any) => {
  console.log(`changeSysConfig==>`, raw)
  if (raw.platform === store.sysConfig.platformCur.platform) return
  store.sysConfig.platformCur = raw
  store.sysConfig.imagesList = raw.images || []
  store.sysConfig.imageCur = ''
}

// 切换镜像类型
const changeImageType = (item: any) => {
  console.log(`changeImageType==>`, item)
  if (item.value === store.sysConfig.imageTypeCur) return
  store.sysConfig.imageTypeCur = item.value
  store.sysConfig.list = []
  store.sysConfig.platformCur = {}
  store.sysConfig.imagesList = []
  store.sysConfig.imageCur = ''

  groupImages()
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  if (selection.length > 1) {
    insTableRef.value?.clearSelection() // 清除所有选择
    insTableRef.value?.toggleRowSelection(selection[1]) // 选中最新的那一行
  } else {
    store.insConfig.rowCur = selection[0] || {}
  }

  // storageRef.value.listDiskPriceFn()
}

// 分页
const paginationChange = () => {
  getSpecificationsListFn()
}

// 切换公网ip宽带计费模式
const handleIpChargeType = async () => {
  // 实例为按量计费，带宽计费模式不包含按带宽计费
  const ipChargeRes = store.publicIpConfig.list
    .filter(el => el.costType.includes(store.costTypeConfig.cur))
    .find(el => el.value === store.publicIpConfig.chargeTypeCur)

  if (!ipChargeRes) {
    // 默认选中第一个
    const defaultIpCharge = store.publicIpConfig.list.filter(el => el.costType.includes(store.costTypeConfig.cur))[0]
      .value
    store.publicIpConfig.chargeTypeCur = defaultIpCharge
  }
}

// 根据镜像类型获取镜像列表
const groupImages = async () => {
  try {
    const res = await _groupImages({
      regionId: store.region.id,
      imageType: store.sysConfig.imageTypeCur, // 1 公共镜像 2 私有镜像
    })

    console.log(`groupImages===>`, res)

    if (res.success) {
      store.sysConfig.list = res.data || []

      const platformRes = store.sysConfig.list.find(el => el.platform === store.sysConfig.platformCur.platform)

      if (platformRes) {
        store.sysConfig.platformCur = platformRes
        store.sysConfig.imagesList = store.sysConfig.platformCur.images || []
      } else {
        // 默认选中第一个
        store.sysConfig.platformCur = store.sysConfig.list[0] || {}
        store.sysConfig.imagesList = store.sysConfig.platformCur.images || []
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

// 根据地区id获取可用区列表
const listByRegionIdFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      store.zoneConfig.list = res.data || []

      const cur = store.zoneConfig.list.find(el => el.id === store.zoneConfig.cur.id)
      if (cur) {
        store.zoneConfig.cur = cur
      } else {
        store.zoneConfig.cur = store.zoneConfig.list[0] || {}
      }
    }
  }
  const params = {
    regionId: store.region.id,
  }
  return listByRegionId(params, cb)
}

// 购买实例-自定义配置-获取机型族
const getInstanceFamily = async () => {
  try {
    const res = await _getInstanceFamily({
      regionId: store.region.id,
      zoneId: store.zoneConfig.cur.id,
    })

    console.log(`_getInstanceFamily===>`, res)

    if (res.success) {
      store.insConfig.list = res.data || []

      const familyCur = insFamilyList.value.find(el => el.id === store.insConfig.familyCur.id)
      // 处理实例族
      if (familyCur) {
        store.insConfig.familyCur = familyCur
        store.insConfig.typeList = familyCur?.types || []
      } else {
        store.insConfig.familyCur = insFamilyList.value[0] || allInsFamily
        store.insConfig.typeList = store.insConfig.familyCur?.types || []
      }

      // 处理实例类型
      const typeCur = insTypeList.value?.find(el => el.id === store.insConfig.typeCur.id)
      if (typeCur) {
        store.insConfig.typeCur = typeCur
      } else {
        store.insConfig.typeCur = insTypeList.value[0] || allInsType
      }

      getSpecificationsListFn()
    }
  } catch (error) {
    console.log(error)
  }
}

// 购买实例-自定义配置-查询创建服务器规格列表
const getSpecificationsListFn = () => {
  const params = {
    // specificationId: store.insConfig.rowCur.id, // 规格id
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    instanceFamilyId: store.insConfig.familyCur.id, // 实例族
    instanceTypeId: store.insConfig.typeCur.id, // 类型
    vcpus: store.insConfig.vcpus,
    ram: store.insConfig.ram,
    pageIndex: store.insConfig.pagination.page,
    pageSize: store.insConfig.pagination.pageSize,
    costType: store.costTypeConfig.cur,
  }
  const cb = (res: any) => {
    if (res.success) {
      store.insConfig.tableData = res.data?.list || []

      const rowCur = store.insConfig.tableData.find(el => el.id === store.insConfig.rowCur.id)
      if (rowCur) {
        store.insConfig.rowCur = rowCur

        const i = store.insConfig.tableData.findIndex(el => el.id === store.insConfig.rowCur.id)
        if (i !== -1) {
          nextTick(() => {
            // insTableRef.value?.toggleRowSelection(store.insConfig.tableData[i])
            const row = store.insConfig.tableData[i]
            console.log(`row2===>`, row)
            if (row) {
              insTableRef.value?.toggleRowSelection(row)
            }
          })
        }
      } else {
        // 默认选中第一个
        nextTick(() => {
          // insTableRef.value?.toggleRowSelection(store.insConfig.tableData[0])
          const row = store.insConfig.tableData[0]
          console.log(`row1===>`, row)

          if (row) {
            insTableRef.value?.toggleRowSelection(row)
          }
        })
      }

      store.insConfig.total = res.data.recordCnt
    }
  }

  getSpecificationsList(params, cb)
}

// 创建服务器-库存验证
const createInstanceVerifyFn = async () => {
  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    specificationId: store.insConfig.rowCur.id,
    instanceChargeType: store.costTypeConfig.cur,
  }

  const cb = (res: any) => {
    if (!res.success) {
      message.warning(res.msg)
    }
  }

  return createInstanceVerify(params, cb)
}

// 查询当前地域下支持的带宽计费模式
const getEipChargeTypeFn = async () => {
  try {
    const res = await getEipChargeType({ regionId: store.region.id })
    console.log(`getEipChargeTypeFn====>`, res)
    if (res.success) {
      const list = res.data?.list || []
      store.publicIpConfig.list = PUBLIC_IP_CONFIG_LIST.filter(el => list.includes(el.value))
      handleIpChargeType()
    }
  } catch (error) {
    console.log(error)
  }
}
</script>

<style lang="scss" scoped>
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
    max-width: calc(100% - 110px);
  }
}

.cost-wrap {
  margin-bottom: 40px;

  .cost {
    box-sizing: border-box;
    width: 330px;
    height: 100px;

    /* padding-top: 22px; */
    padding: 0 20px 0 17px;
    margin-right: 8px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;

    .main {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 600;
      // font-size: 15px;
      font-size: 14px;
      font-weight: 600;
      color: #000;
    }

    .sub {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      color: #999;
    }
  }

  .cost-actived {
    background: #f1f7ff;
    border: 1px solid #0063ff;

    .main {
      color: #0063ff;
    }

    .sub {
      color: #0063ff;
    }
  }
}

.area-wrap {
  margin-bottom: 40px;

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.zone-wrap {
  margin-bottom: 40px;

  .gap {
    flex-wrap: wrap;
    gap: 10px 8px;
  }

  .zone {
    min-width: 118px;
    height: 34px;
    padding: 0 10px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 34px;
    color: #000;
    text-align: center;
    background: #eaebf1;
    border-radius: 4px;
  }

  .zone-actived {
    color: #fff;
    background: #0063ff;
  }

  .desc {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.ins-wrap {
  margin-bottom: 40px;

  .ins-item {
    .key {
      flex-shrink: 0;
      width: 100px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }

    .gap {
      flex-wrap: wrap;
      gap: 10px 8px;
    }

    .btn {
      min-width: 118px;
      height: 34px;
      padding: 0 10px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 34px;
      color: #000;
      text-align: center;
      background: #eaebf1;
      border-radius: 4px;
    }

    .btn-actived {
      color: #fff;
      background: #0063ff;
    }

    .check-ins {
      min-width: 350px;
      height: 34px;
      padding: 0 10px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 34px;
      color: #0063ff;
      text-align: center;
      background: #f1f7ff;
      border: 1px solid #0063ff;
      border-radius: 4px;
    }

    .table {
      :deep(.el-table__header .el-checkbox) {
        display: none;
      }
    }
  }
}

.image-wrap {
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

.mb16 {
  margin-bottom: 16px;
}
</style>
