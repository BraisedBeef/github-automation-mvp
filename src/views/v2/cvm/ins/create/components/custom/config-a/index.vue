<template>
  <div class="custom-a-v2">
    <section class="custom-a-v2__section">
      <h3 class="custom-a-v2__section-title">
        {{ t('ins.custom.baseConfig') }}
      </h3>

      <div class="custom-a-v2__field">
        <div class="custom-a-v2__label" :style="labelClass">
          {{ t('ins.custom.costType') }}
        </div>
        <div class="custom-a-v2__content custom-a-v2__card-row">
          <button
            v-for="(item, index) in COST_TYPE_CONFIG_LIST"
            :key="index"
            type="button"
            class="custom-a-v2__cost-card"
            :class="{ 'is-active': store.costTypeConfig.cur === item.value }"
            @click="changeCostTypeConfig(item)"
          >
            <div class="custom-a-v2__cost-title">
              {{ item.labelMain }}
            </div>
            <div class="custom-a-v2__cost-sub">
              {{ item.labelSub }}
            </div>
          </button>
        </div>
      </div>

      <div class="custom-a-v2__field">
        <div class="custom-a-v2__label" :style="labelClass">
          {{ t('ins.custom.area') }}
        </div>
        <div class="custom-a-v2__content">
          <AreaTabs v-model="store.region" class="custom-a-v2__area-tabs" @change-area="changeArea" />
          <p class="custom-a-v2__hint">
            <span v-html="t('ins.custom.regionDesc')" />
          </p>
        </div>
      </div>

      <div id="zone" class="custom-a-v2__field">
        <div class="custom-a-v2__label" :style="labelClass">
          {{ t('ins.custom.zone') }}
        </div>
        <div class="custom-a-v2__content">
          <div class="custom-a-v2__tag-grid">
            <button
              v-for="(item, index) in store.zoneConfig.list"
              :key="index"
              type="button"
              class="custom-a-v2__tag-btn"
              :class="{ 'is-active': store.zoneConfig.cur.id === item.id }"
              @click="changeZoneConfig(item)"
            >
              {{ item.zoneName }}
            </button>
          </div>
          <p class="custom-a-v2__hint">
            {{ t('ins.custom.zoneDesc') }}
          </p>
        </div>
      </div>
    </section>

    <section class="custom-a-v2__section">
      <h3 class="custom-a-v2__section-title">
        {{ t('ins.custom.insConfig') }}
      </h3>

      <div id="ins" class="custom-a-v2__field">
        <div class="custom-a-v2__label" :style="labelClass">
          {{ t('ins.custom.ins') }}
        </div>
        <div class="custom-a-v2__content custom-a-v2__content--instance">
          <div class="custom-a-v2__inline-row">
            <div class="custom-a-v2__sub-label" :style="keyWrapClass">
              {{ t('ins.custom.filter') }}
            </div>
            <div class="custom-a-v2__inline-content">
              <el-select
                v-model="store.insConfig.vcpus"
                :teleported="false"
                class="custom-a-v2__select"
                :placeholder="t('ins.custom.cpuPh')"
                @change="() => getSpecificationsListFn()"
              >
                <el-option v-for="item in INS_CPU_MAP" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
              <el-select
                v-model="store.insConfig.ram"
                :teleported="false"
                class="custom-a-v2__select"
                :placeholder="t('ins.custom.ramPh')"
                @change="() => getSpecificationsListFn()"
              >
                <el-option v-for="item in INS_RAM_MAP" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
              <button type="button" class="custom-a-v2__text-btn" @click="resetInsConfig">
                {{ t('ins.custom.reset') }}
              </button>
            </div>
          </div>

          <div class="custom-a-v2__inline-row">
            <div class="custom-a-v2__sub-label" :style="keyWrapClass">
              {{ t('ins.custom.insFamily') }}
            </div>
            <div class="custom-a-v2__inline-content custom-a-v2__inline-content--wrap">
              <button
                v-for="(item, index) in insFamilyList"
                :key="index"
                type="button"
                class="custom-a-v2__pill-btn"
                :class="{ 'is-active': store.insConfig.familyCur.id === item.id }"
                @click="changeInsConfig(item, 'family')"
              >
                {{ item.familyName }}
              </button>
            </div>
          </div>

          <div class="custom-a-v2__inline-row">
            <div class="custom-a-v2__sub-label" :style="keyWrapClass">
              {{ t('ins.custom.type') }}
            </div>
            <div class="custom-a-v2__inline-content custom-a-v2__inline-content--wrap">
              <button
                v-for="(item, index) in insTypeList"
                :key="index"
                type="button"
                class="custom-a-v2__pill-btn"
                :class="{ 'is-active': store.insConfig.typeCur.id === item.id }"
                @click="changeInsConfig(item, 'type')"
              >
                {{ item.typeName }}
              </button>
            </div>
          </div>

          <div v-if="store.insConfig.rowCur.id" class="custom-a-v2__inline-row">
            <div class="custom-a-v2__sub-label" :style="keyWrapClass">
              {{ t('ins.custom.checkIns') }}
            </div>
            <div class="custom-a-v2__inline-content">
              <div class="custom-a-v2__selected-ins">
                {{ insConfigSelect }}
              </div>
            </div>
          </div>

          <TableV2
            ref="insTableRef"
            v-loading="loading"
            :data="store.insConfig.tableData"
            :pagination="store.insConfig.pagination"
            :total="store.insConfig.total"
            :show-pagination="store.insConfig.total > store.insConfig.pagination.pageSize"
            class="custom-a-v2__table"
            :empty-min-height="180"
            table-layout="auto"
            :row-class-name="getRowClassName"
            @selection-change="handleRowSelectChange"
            @change="paginationChange"
            @update:pagination="value => (store.insConfig.pagination = value)"
          >
            <el-table-column type="selection" width="64" />
            <el-table-column min-width="112" :label="t('ins.custom.ins')">
              <template #default="{ row }">
                {{ row.typeName }}
              </template>
            </el-table-column>
            <el-table-column min-width="132" :label="t('ins.custom.specificate')">
              <template #default="{ row }">
                {{ row.specificationName }}
              </template>
            </el-table-column>
            <el-table-column min-width="86" label="vCPU">
              <template #default="{ row }">
                {{ t('ins.custom.cores', [row.vcpus]) }}
              </template>
            </el-table-column>
            <el-table-column min-width="86" :label="t('ins.custom.ram')">
              <template #default="{ row }"> {{ row.ram }}GB </template>
            </el-table-column>
            <el-table-column min-width="260" :label="t('ins.custom.cpuName')" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="custom-a-v2__ellipsis">{{ row.cpuName }}</span>
              </template>
            </el-table-column>
            <el-table-column min-width="126" :label="t('ins.custom.internalNetworkBandwidth')">
              <template #default="{ row }"> {{ row.internalNetworkBandwidth || 0 }}Gbit/s </template>
            </el-table-column>
            <el-table-column min-width="126" :label="t('ins.custom.networkReceiveSend')">
              <template #default="{ row }">
                {{ t('ins.custom.ppsUnit', [row.maxPps]) }}
              </template>
            </el-table-column>
            <el-table-column min-width="126" :label="t('ins.custom.referenceCost')">
              <template #default="{ row }">
                {{
                  isTimeCost(store.costTypeConfig.cur)
                    ? `$${row.prepaidPrice || 0} USD/${t('ins.custom.month')}`
                    : `$${row.usageDiscountPrice || 0} USD/${t('ins.custom.hour')}`
                }}
              </template>
            </el-table-column>
          </TableV2>
        </div>
      </div>
    </section>

    <section class="custom-a-v2__section">
      <div id="image" class="custom-a-v2__field">
        <div class="custom-a-v2__label" :style="labelClass">
          {{ t('ins.custom.image') }}
        </div>
        <div class="custom-a-v2__content">
          <CatTabs2
            class="custom-a-v2__image-tabs"
            :model-value="store.sysConfig.imageTypeCur"
            :tabs="IMAGE_TYPE_ARR_MAP"
            @change="changeImageType"
          />

          <div v-if="store.sysConfig.list.length" class="custom-a-v2__os-grid">
            <button
              v-for="(item, index) in store.sysConfig.list"
              :key="index"
              type="button"
              class="custom-a-v2__os-card"
              :class="{ 'is-active': store.sysConfig.platformCur.platform === item.platform }"
              @click="changeSysConfig(item)"
            >
              <SvgIcon
                class="custom-a-v2__os-icon"
                :name="
                  store.sysConfig.platformCur.platform === item.platform
                    ? INS_SYS_SVG_MAP[item.platform]?.actived
                    : INS_SYS_SVG_MAP[item.platform]?.default
                "
              />
              <span>{{ item.platform }}</span>
            </button>
          </div>

          <div class="custom-a-v2__image-actions">
            <el-select
              v-model="store.sysConfig.imageCur"
              :teleported="false"
              class="custom-a-v2__image-select"
              :placeholder="t('ins.custom.imagePh')"
            >
              <el-option
                v-for="item in store.sysConfig.imagesList"
                :key="item.id"
                :value="item.id"
                :label="item.imageName"
              />
            </el-select>

            <button
              v-if="store.sysConfig.imageTypeCur === 2"
              type="button"
              class="custom-a-v2__text-btn"
              @click="toImage"
            >
              {{ t('ins.custom.createCustImage') }}
            </button>
          </div>

          <p class="custom-a-v2__hint">
            {{ t('ins.custom.imageDesc') }}
          </p>
        </div>
      </div>
    </section>

    <section class="custom-a-v2__section">
      <div class="custom-a-v2__field">
        <div class="custom-a-v2__label" :style="labelClass">
          {{ t('ins.custom.storage') }}
        </div>
        <div class="custom-a-v2__content">
          <Storage
            ref="storageRef"
            :cost-type="store.costTypeConfig.cur"
            :region-id="store.region.id"
            :zone-id="store.zoneConfig.cur.id"
            :specification-id="store.insConfig.rowCur.id || 0"
          />
        </div>
      </div>
    </section>

    <Fixed :step="store.step" :next-loading="verifyLoading" @change-step="changeStep" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import Storage from '@/views/cvm/ins/create/components/custom/config-a/storage.vue'
import { _getInstanceFamily } from '@/apis/cvm/ins'
import { _groupImages } from '@/apis/cvm/image'
import { getEipChargeType } from '@/apis/network/public-ip'
import { pushRoute } from '@/utils/router-jump'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import {
  COST_TYPE_CONFIG_LIST,
  INS_CPU_MAP,
  INS_RAM_MAP,
  INS_SYS_SVG_MAP,
  PUBLIC_IP_CONFIG_LIST,
  isFlowCost,
  isTimeCost,
} from '@/views/cvm/ins/config'
import { IMAGE_TYPE_ARR_MAP } from '@/views/cvm/image/config'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import Fixed from '../fixed.vue'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const labelMap = {
  [ja]: 'width: 90px',
  [en]: 'width: 120px',
  [zh]: 'width: 80px',
}

const keyWrapMap = {
  [ja]: 'width: 180px',
  [en]: 'width: 150px',
  [zh]: 'width: 82px',
}

const allInsFamily = {
  id: 0,
  familyName: t('ins.custom.allInsFamily'),
}

const allInsType = {
  id: 0,
  typeName: t('ins.custom.allInsType'),
}

const labelClass = useI18nStyle(labelMap)
const keyWrapClass = useI18nStyle(keyWrapMap)

const { cvmInsCreateStore: store, createInstanceVerify, loading: verifyLoading, getSpecificationsList } = useIns()
const { listByRegionId } = useBaseConfig()

const loading = ref(false)
const insTableRef = ref<InstanceType<typeof TableV2>>()
const storageRef = ref<any>()

const insFamilyList = computed(() => [allInsFamily, ...store.insConfig.list])
const insTypeList = computed(() => [allInsType, ...store.insConfig.typeList])

const insConfigSelect = computed(() =>
  t('ins.custom.checkInsDesc', [
    store.insConfig.rowCur.specificationName,
    store.insConfig.rowCur.typeName,
    store.insConfig.rowCur.vcpus,
    store.insConfig.rowCur.ram,
  ]),
)

const toImage = () => {
  pushRoute({
    name: 'image',
    query: {
      active: 2,
    },
  })
}

const changeStep = async (value: string) => {
  if (!Reflect.has(store.zoneConfig.cur, 'id')) {
    document.getElementById('zone')?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.zoneWarning'))
  }

  if (!Reflect.has(store.insConfig.rowCur, 'id')) {
    document.getElementById('ins')?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.insWarning'))
  }

  if (!store.sysConfig.imageCur) {
    document.getElementById('image')?.scrollIntoView({ behavior: 'smooth' })
    return message.warning(t('ins.custom.imageWarning'))
  }

  const storageRes = await storageRef.value.verify()
  if (!storageRes) return

  const res = await createInstanceVerifyFn()
  if (!res) return

  store.setStep(value)
}

const resetInsConfig = () => {
  store.insConfig.vcpus = ''
  store.insConfig.ram = ''
  getSpecificationsListFn()
}

const changeInsConfig = (raw: any, type: 'family' | 'type') => {
  if (type === 'family') {
    store.insConfig.familyCur = raw
    store.insConfig.typeList = raw.types || []
    store.insConfig.typeCur = insTypeList.value?.[0] || allInsType
    getSpecificationsListFn()
  }

  if (type === 'type') {
    store.insConfig.typeCur = raw
    getSpecificationsListFn()
  }
}

const handleIpChargeType = () => {
  const ipChargeRes = store.publicIpConfig.list
    .filter(el => el.costType.includes(store.costTypeConfig.cur))
    .find(el => el.value === store.publicIpConfig.chargeTypeCur)

  if (!ipChargeRes) {
    const defaultIpCharge = store.publicIpConfig.list.filter(el => el.costType.includes(store.costTypeConfig.cur))[0]
      ?.value
    store.publicIpConfig.chargeTypeCur = defaultIpCharge
  }
}

const changeCostTypeConfig = (raw: any) => {
  store.costTypeConfig.cur = raw.value
  if (isFlowCost(raw.value)) {
    store.autoRenewConfig.checked = false
  }
  handleIpChargeType()
  store.insConfig.vcpus = ''
  store.insConfig.ram = ''
  getSpecificationsListFn()
}

const changeArea = async () => {
  groupImages()
  getEipChargeTypeFn()
  await listByRegionIdFn()
  getInstanceFamily()
}

const changeZoneConfig = (raw: any) => {
  store.zoneConfig.cur = raw
  getInstanceFamily()
}

const changeSysConfig = (raw: any) => {
  if (raw.platform === store.sysConfig.platformCur.platform) return
  store.sysConfig.platformCur = raw
  store.sysConfig.imagesList = raw.images || []
  store.sysConfig.imageCur = ''
}

const changeImageType = (item: any) => {
  if (item.value === store.sysConfig.imageTypeCur) return
  store.sysConfig.imageTypeCur = item.value
  store.sysConfig.list = []
  store.sysConfig.platformCur = {}
  store.sysConfig.imagesList = []
  store.sysConfig.imageCur = ''
  groupImages()
}

const handleRowSelectChange = (selection: any[]) => {
  if (selection.length > 1) {
    insTableRef.value?.clearSelection()
    insTableRef.value?.toggleRowSelection(selection[1])
  } else {
    store.insConfig.rowCur = selection[0] || {}
  }
}

const paginationChange = () => {
  getSpecificationsListFn()
}

const getRowClassName = ({ row }: { row: any }) => {
  return row.id === store.insConfig.rowCur.id ? 'custom-a-v2__row--active' : ''
}

const groupImages = async () => {
  try {
    const res = await _groupImages({
      regionId: store.region.id,
      imageType: store.sysConfig.imageTypeCur,
    })

    if (res.success) {
      store.sysConfig.list = res.data || []

      const platformRes = store.sysConfig.list.find(el => el.platform === store.sysConfig.platformCur.platform)

      if (platformRes) {
        store.sysConfig.platformCur = platformRes
        store.sysConfig.imagesList = store.sysConfig.platformCur.images || []
      } else {
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

  return listByRegionId({ regionId: store.region.id }, cb)
}

const getInstanceFamily = async () => {
  try {
    const res = await _getInstanceFamily({
      regionId: store.region.id,
      zoneId: store.zoneConfig.cur.id,
    })

    if (res.success) {
      store.insConfig.list = res.data || []

      const familyCur = insFamilyList.value.find(el => el.id === store.insConfig.familyCur.id)
      if (familyCur) {
        store.insConfig.familyCur = familyCur
        store.insConfig.typeList = familyCur?.types || []
      } else {
        store.insConfig.familyCur = insFamilyList.value[0] || allInsFamily
        store.insConfig.typeList = store.insConfig.familyCur?.types || []
      }

      const typeCur = insTypeList.value.find(el => el.id === store.insConfig.typeCur.id)
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

const getSpecificationsListFn = () => {
  loading.value = true

  const params = {
    regionId: store.region.id,
    zoneId: store.zoneConfig.cur.id,
    instanceFamilyId: store.insConfig.familyCur.id,
    instanceTypeId: store.insConfig.typeCur.id,
    vcpus: store.insConfig.vcpus,
    ram: store.insConfig.ram,
    pageIndex: store.insConfig.pagination.page,
    pageSize: store.insConfig.pagination.pageSize,
    costType: store.costTypeConfig.cur,
  }

  const cb = (res: any) => {
    loading.value = false

    if (res.success) {
      store.insConfig.tableData = res.data?.list || []

      const rowCur = store.insConfig.tableData.find(el => el.id === store.insConfig.rowCur.id)
      const targetRow = rowCur || store.insConfig.tableData[0]

      if (targetRow) {
        store.insConfig.rowCur = targetRow
        nextTick(() => {
          insTableRef.value?.clearSelection()
          insTableRef.value?.toggleRowSelection(targetRow, true)
        })
      } else {
        store.insConfig.rowCur = {}
      }

      store.insConfig.total = res.data.recordCnt
    }
  }

  getSpecificationsList(params, cb)
}

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

const getEipChargeTypeFn = async () => {
  try {
    const res = await getEipChargeType({ regionId: store.region.id })

    if (res.success) {
      const list = res.data?.list || []
      store.publicIpConfig.list = PUBLIC_IP_CONFIG_LIST.filter(el => list.includes(el.value))
      handleIpChargeType()
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  if (!store.region.id) return

  groupImages()
  getEipChargeTypeFn()
  await listByRegionIdFn()
  getInstanceFamily()
})
</script>

<style scoped lang="scss">
.custom-a-v2 {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.custom-a-v2__section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.custom-a-v2__section-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 40px;
  color: #191c23;
}

.custom-a-v2__field {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.custom-a-v2__label {
  flex-shrink: 0;

  // padding-top: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.custom-a-v2__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.custom-a-v2__content--instance {
  gap: 24px;
}

.custom-a-v2__card-row {
  flex-direction: row;
  gap: 24px;
}

.custom-a-v2__cost-card {
  position: relative;
  width: 250px;
  padding: 24px;
  text-align: left;
  background: #fff;
  border: 1px solid #e8ecf3;
  transition: 0.2s ease;
}

.custom-a-v2__cost-card.is-active {
  background-color: #fff;
  background-image: url('@/assets/v2/cvm/images/example-bj.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border: 1.2px solid #06f;
}

.custom-a-v2__cost-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.custom-a-v2__cost-sub {
  margin-top: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #50596a;
}

.custom-a-v2__area-tabs {
  margin-top: -8px;
}

:deep(.cursor-pointer) {
  background-color: rgb(0 102 255 / 8%) !important;
  border-radius: 0;
}

:deep(.area-actived) {
  background-color: #06f !important;
}

.custom-a-v2__hint {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.custom-a-v2__tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.custom-a-v2__tag-btn,
.custom-a-v2__pill-btn {
  min-width: 76px;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  background: #eef4ff;
  border: 1px solid transparent;
}

.custom-a-v2__tag-btn.is-active,
.custom-a-v2__pill-btn.is-active {
  color: #fff;
  background: #06f;
}

.custom-a-v2__inline-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.custom-a-v2__sub-label {
  flex-shrink: 0;
  height: 40px;
  font-size: 14px;
  line-height: 40px;
  color: #828b9c;
}

.custom-a-v2__inline-content {
  display: flex;
  flex: 1;
  gap: 16px;
  align-items: center;
  min-width: 0;
}

.custom-a-v2__inline-content--wrap {
  flex-wrap: wrap;
  gap: 12px;
}

.custom-a-v2__select {
  width: 240px;
}

.custom-a-v2__text-btn {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: transparent;
  border: 0;
}

.custom-a-v2__selected-ins {
  min-width: 76px;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  background: #fff;
  border: 1px solid #06f;
}

.custom-a-v2__table {
  width: 100%;
}

.custom-a-v2__ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-a-v2__image-tabs {
  margin-top: -8px;
}

.custom-a-v2__os-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.custom-a-v2__os-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 132px;
  height: 128px;
  font-size: 16px;
  line-height: 24px;
  color: #191c23;
  background: #fff;
  border: 1px solid #dcdfe6;
}

.custom-a-v2__os-card.is-active {
  color: #06f;
  background-color: #fff;
  border-color: #06f;
}

.custom-a-v2__os-icon {
  width: 48px;
  height: 48px;
}

.custom-a-v2__image-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.custom-a-v2__image-select {
  width: 360px;
}

// :deep(.custom-a-v2__select .el-select__wrapper),
// :deep(.custom-a-v2__image-select .el-select__wrapper) {
//   min-height: 40px;
//   border-radius: 0;
//   box-shadow: 0 0 0 1px #dcdfe6 inset;
// }

// :deep(.custom-a-v2__table .account-table-v2__table .el-table__row.custom-a-v2__row--active > td.el-table__cell) {
//   background: rgba(0, 102, 255, 0.04);
// }

// :deep(.custom-a-v2__table .el-checkbox__input.is-checked .el-checkbox__inner),
// :deep(.custom-a-v2__table .el-checkbox__input.is-indeterminate .el-checkbox__inner) {
//   background: #06f;
//   border-color: #06f;
// }

:deep(.custom-a-v2__table .el-checkbox__inner:hover) {
  border-color: #06f;
}

@media (width <= 1280px) {
  .custom-a-v2__field,
  .custom-a-v2__inline-row {
    flex-direction: column;
  }

  .custom-a-v2__label,
  .custom-a-v2__sub-label {
    width: auto !important;
    height: auto;
    padding-top: 0;
    line-height: 22px;
  }
}
</style>
