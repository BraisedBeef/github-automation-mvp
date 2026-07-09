<template>
  <div class="cdn-domain-detail-base-v2">
    <section class="cdn-domain-detail-base-v2__section">
      <h3 class="cdn-domain-detail-base-v2__title">
        {{ t('baseInformation') }}
      </h3>

      <el-descriptions :column="2" border class="cdn-domain-detail-base-v2__descriptions">
        <el-descriptions-item :label="t('accelerationRegion')">
          <div class="cdn-domain-detail-base-v2__inline">
            <span>{{ getValueMap(areaList, baseInfo.area_code) }}</span>
            <el-link
              type="primary"
              :disabled="[1].includes(baseInfo.area_code) || route.query.is_lock == 1"
              @click="accelerationZone.show = true"
            >
              {{ t('common.change') }}
            </el-link>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('accelerationType')">
          {{ getValueMap(channelTypeListAll, baseInfo.channel_type) }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('status')">
          {{ getValueMap(AccelerationStatusList, baseInfo.status) }}
        </el-descriptions-item>
        <el-descriptions-item label="HTTPS">
          {{ baseInfo.https_status ? t('enable') : t('notEnabled') }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('acceleratedDomain')">
          <div class="cdn-domain-detail-base-v2__inline">
            <span class="cdn-domain-detail-base-v2__ellipsis">{{ baseInfo.domain || '--' }}</span>
            <SvgIcon name="cat-cdn-copy" class="cdn-domain-detail-base-v2__icon" @click="copyText(baseInfo.domain)" />
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('createTime')">
          <div class="cdn-domain-detail-base-v2__inline">
            <span>{{ getDateDayjs(baseInfo.create_time * 1000, 'string', true) }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="cdn-domain-detail-base-v2__icon" />
            </el-tooltip>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="CNAME">
          <div class="cdn-domain-detail-base-v2__inline">
            <span class="cdn-domain-detail-base-v2__ellipsis">{{ baseInfo.cname || '--' }}</span>
            <SvgIcon name="cat-cdn-copy" class="cdn-domain-detail-base-v2__icon" @click="copyText(baseInfo.cname)" />
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="t('remark')">
          <div class="cdn-domain-detail-base-v2__inline">
            <span class="cdn-domain-detail-base-v2__ellipsis">{{ baseInfo.remark || '--' }}</span>
            <SvgIcon
              :disabled="+route.query.status > 2 || route.query.is_lock == 1"
              name="cat-cdn-edit"
              class="cdn-domain-detail-base-v2__icon"
              @click="editRemark"
            />
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </section>

    <section class="cdn-domain-detail-base-v2__section">
      <div class="cdn-domain-detail-base-v2__section-head">
        <h3 class="cdn-domain-detail-base-v2__title">
          {{ t('originServerConfig') }}
        </h3>
        <p class="cdn-domain-detail-base-v2__desc">
          {{ t('originConfigTip') }}
        </p>
      </div>

      <TableV2 :data="originConfig.tableData" table-layout="auto">
        <el-table-column :label="t('originServerType')" min-width="120">
          <template #default="{ row }">
            {{ getValueMap(originTypeList0, row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="address" :label="t('originServerAddress')" min-width="220" />
        <el-table-column :label="t('priority')" min-width="120">
          <template #default="{ row }">
            {{ getValueMap(level, row.priority) }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" :label="t('weight')" min-width="90">
          <template #default="{ row }">
            {{ row.weight || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="http_port" :label="t('httpPort')" min-width="110" />
        <el-table-column prop="https_port" :label="t('httpsPort')" min-width="120" />
        <el-table-column
          prop="host"
          :label="t('pullHost')"
          min-width="180"
          :show-overflow-tooltip="{ effect: 'light' }"
        />
        <el-table-column :label="t('operation')" min-width="100">
          <template #default="{ row, $index }">
            <button
              v-if="row.priority"
              class="cdn-domain-detail-base-v2__table-link"
              type="button"
              @click="delDialog(row, $index)"
            >
              {{ t('delete') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>

      <div class="cdn-domain-detail-base-v2__table-footer">
        <el-button :disabled="route.query.is_lock == 1" type="primary" @click="openOrigin">
          {{ t('editRule') }}
        </el-button>
        <span class="cdn-domain-detail-base-v2__desc">
          {{ t('addAnyRule', { num: 50 - originConfig.tableData.length }) }}
        </span>
      </div>
    </section>

    <section class="cdn-domain-detail-base-v2__section">
      <div class="cdn-domain-detail-base-v2__section-head">
        <h3 class="cdn-domain-detail-base-v2__title">IPv6 {{ t('config') }}</h3>
        <p class="cdn-domain-detail-base-v2__desc">
          {{ t('ipv6Tip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-base-v2__switch-row">
        <div class="cdn-domain-detail-base-v2__inline">
          <span>IPv6</span>
          <el-tooltip :content="t('ipv6Tip2')" effect="light" placement="top">
            <SvgIcon name="cat-cdn-warning" class="cdn-domain-detail-base-v2__icon" />
          </el-tooltip>
        </div>
        <el-switch
          v-model="baseInfo.support_ipv6"
          :before-change="switchIPv6"
          :loading="ipv6Loading"
          :disabled="+route.query.status > 2 || route.query.is_lock == 1 || !!baseInfo.area_code"
        />
      </div>
    </section>

    <CatDialog
      v-model:dialog="remark.show"
      :disabled="!remark.value"
      title="remark"
      width="630px"
      @confirm="updateRemark"
    >
      <el-form ref="remarkDom" :model="remark">
        <el-form-item prop="value">
          <el-input v-model="remark.value" type="textarea" :rows="5" resize="none" show-word-limit maxlength="200" />
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="accelerationZone.show"
      :loading="accelerationZone.loading"
      :title="t('editAccelerationArea')"
      width="440px"
      destroy-on-close
      :disabled="isEditAccelerationZone"
      @confirm="updateAccelerationZone"
    >
      <el-form
        ref="accelerationZoneDom"
        :model="accelerationZone"
        label-width="auto"
        label-position="left"
        class="mt20"
      >
        <el-form-item :label="t('currentAccelerationArea')">
          {{ getValueMap(areaList, baseInfo.area_code) }}
        </el-form-item>
        <el-form-item :label="t('accelerationRegion')" required>
          <CatSelect
            v-model="accelerationZone.form.area_code"
            :list="areaList.filter(a => [2, '', 0][baseInfo.area_code] === a.value)"
          />
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog v-model:dialog="originConfig.show" title="editRule" width="860px" destroy-on-close @confirm="setOrigin">
      <CatTip>{{ t('addOriginTip') }}</CatTip>
      <el-form
        ref="originConfigDom"
        :model="origin"
        label-width="auto"
        label-position="left"
        require-asterisk-position="right"
        class="mt20"
      >
        <el-form-item :label="t('originServerType')" required>
          <CatRadioGroup v-model="origin.type" :list="originTypeList" />
        </el-form-item>
        <el-form-item :label="t('mainStationAddress')" required>
          <el-form ref="originTableA" :model="origin.tableA">
            <el-table :data="origin.tableA" table-layout="auto">
              <el-table-column :label="t('originServerAddress')">
                <template #default="{ row, $index }">
                  <el-form-item
                    v-if="origin.type === 0"
                    prop="address"
                    :rules="{
                      validator: () =>
                        validIP(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index),
                      message: '',
                      trigger: 'change',
                    }"
                  >
                    <TipInput
                      v-model="row.address"
                      placeholder="inputIpAddress"
                      :rule="
                        validIP(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index)
                      "
                      :error-text="
                        !validIP(row.address)
                          ? 'ipErrorTip'
                          : !tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index)
                            ? 'ipRepeatTip'
                            : ''
                      "
                      teleported
                      placement="top"
                    />
                  </el-form-item>

                  <el-form-item
                    v-else
                    prop="address"
                    :rules="{
                      validator: () =>
                        row.address !== baseInfo.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index),
                      message: '',
                      trigger: 'change',
                    }"
                  >
                    <TipInput
                      v-model="row.address"
                      placeholder="inputDomain"
                      :rule="
                        row.address !== baseInfo.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index)
                      "
                      :error-text="
                        row.address === baseInfo.domain
                          ? 'addDomainNot'
                          : !validDomain(row.address)
                            ? 'domainNotVerify'
                            : !tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index)
                              ? 'domainNotRepeat'
                              : ''
                      "
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('weight')" width="120">
                <template #default="{ row }">
                  <el-form-item
                    prop="weight"
                    :rules="{
                      validator: () => row.weight === '' || validWieght(row.weight),
                      message: '',
                      trigger: 'change',
                    }"
                  >
                    <TipInput
                      v-model="row.weight"
                      placeholder="1-100"
                      :rule="row.weight === '' || validWieght(row.weight)"
                      error-text="weightRange"
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('httpPort')" width="120">
                <template #default="{ row }">
                  <el-form-item
                    prop="http_port"
                    :rules="{ validator: () => validPort(row.http_port), message: '', trigger: 'change' }"
                  >
                    <TipInput
                      v-model.number="row.http_port"
                      placeholder="1-65535"
                      :rule="validPort(row.http_port)"
                      error-text="httpPort65535"
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('httpsPort')" width="120">
                <template #default="{ row }">
                  <el-form-item
                    prop="https_port"
                    :rules="{ validator: () => validPort(row.https_port), message: '', trigger: 'change' }"
                  >
                    <TipInput
                      v-model.number="row.https_port"
                      placeholder="1-65535"
                      :rule="validPort(row.https_port)"
                      error-text="httpsPort65535"
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('operation')" />
            </el-table>
          </el-form>
        </el-form-item>
        <el-form-item
          :label="t('pullHost')"
          prop="hostA"
          :rules="{ validator: (r, v) => validDomain(v), trigger: 'change', message: '' }"
        >
          <div style="width: 500px">
            <el-input v-model="origin.hostA" :placeholder="t('inputHost')" />
            <div class="form-tip">
              {{ t('OriginPullHostTip') }}
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('backupStationAddress')">
          <el-form ref="originTableB" :model="origin.tableB">
            <el-table :data="origin.tableB" table-layout="auto">
              <el-table-column :label="t('originServerAddress')">
                <template #default="{ row, $index }">
                  <el-form-item
                    v-if="origin.type === 0"
                    prop="address"
                    :rules="{
                      validator: () =>
                        validIP(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1),
                      message: '',
                      trigger: 'change',
                    }"
                  >
                    <TipInput
                      v-model="row.address"
                      placeholder="inputIpAddress"
                      :rule="
                        validIP(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1)
                      "
                      :error-text="
                        !validIP(row.address)
                          ? 'ipErrorTip'
                          : !tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1)
                            ? 'ipRepeatTip'
                            : ''
                      "
                      teleported
                      placement="top"
                    />
                  </el-form-item>

                  <el-form-item
                    v-else
                    prop="address"
                    :rules="{
                      validator: () =>
                        row.address !== baseInfo.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1),
                      message: '',
                      trigger: 'change',
                    }"
                  >
                    <TipInput
                      v-model="row.address"
                      placeholder="inputDomain"
                      :rule="
                        row.address !== baseInfo.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1)
                      "
                      :error-text="
                        row.address === baseInfo.domain
                          ? 'addDomainNot'
                          : !validDomain(row.address)
                            ? 'domainNotVerify'
                            : !tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1)
                              ? 'domainNotRepeat'
                              : ''
                      "
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('weight')" width="120">
                <template #default="{ row }">
                  <el-form-item
                    prop="weight"
                    :rules="{
                      validator: () => row.weight === '' || validWieght(row.weight),
                      message: '',
                      trigger: 'change',
                    }"
                  >
                    <TipInput
                      v-model="row.weight"
                      placeholder="1-100"
                      :rule="row.weight === '' || validWieght(row.weight)"
                      error-text="weightRange"
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('httpPort')" width="120">
                <template #default="{ row }">
                  <el-form-item
                    prop="http_port"
                    :rules="{ validator: () => validPort(row.http_port), message: '', trigger: 'change' }"
                  >
                    <TipInput
                      v-model.number="row.http_port"
                      placeholder="1-65535"
                      :rule="validPort(row.http_port)"
                      error-text="httpPort65535"
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('httpsPort')" width="120">
                <template #default="{ row }">
                  <el-form-item
                    prop="https_port"
                    :rules="{ validator: () => validPort(row.https_port), message: '', trigger: 'change' }"
                  >
                    <TipInput
                      v-model.number="row.https_port"
                      placeholder="1-65535"
                      :rule="validPort(row.https_port)"
                      error-text="httpsPort65535"
                      teleported
                      placement="top"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column :label="t('operation')">
                <template #default="{ $index }">
                  <el-link type="primary" @click="origin.tableB.splice($index, 1)">
                    {{ t('delete') }}
                  </el-link>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
          <el-button type="primary" class="mt20" @click="addOrigin('B')">
            {{ t('addBackupStation') }}
          </el-button>
        </el-form-item>
        <el-form-item
          v-if="origin.tableB.length > 0"
          :label="t('pullHost')"
          prop="hostB"
          :rules="{ validator: (r, v) => validDomain(v), trigger: 'change', message: '' }"
        >
          <div style="width: 500px">
            <el-input v-model="origin.hostB" :placeholder="t('inputHost')" />
            <div class="form-tip">
              {{ t('OriginPullHostTip') }}
            </div>
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="delOriginConfig.show"
      title="deleteOrigin"
      width="960px"
      destroy-on-close
      @confirm="delOriginHandle"
    >
      <div>
        {{ t('deleteOriginConfig') }}
        <el-text class="ml4" type="primary">
          {{ delOriginConfig.tableData[0]?.address }}
        </el-text>
      </div>
      <el-table :data="delOriginConfig.tableData" class="mt20" table-layout="auto">
        <el-table-column prop="type" :label="t('originServerType')">
          <template #default="{ row }">
            {{ getValueMap(originTypeList0, row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="address" :label="t('originServerAddress')" />
        <el-table-column prop="priority" :label="t('priority')">
          <template #default="{ row }">
            {{ getValueMap(level, row.priority) }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" :label="t('weight')" />
        <el-table-column prop="http_port" :label="t('httpPort')" />
        <el-table-column prop="https_port" :label="t('httpsPort')" />
        <el-table-column prop="host" :label="t('pullHost')" />
      </el-table>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import {
  areaList,
  AccelerationStatusList,
  level,
  originTypeList0,
  originTypeList,
  channelTypeListAll,
} from '@/assets/data/common.js'
import { _getBaseConfig, _updateBaseConfig, _updateBaseOriginConfig } from '@/apis/cdn/domain'
import { copyText } from '@/utils/dom-utils'
import { getValueMap } from '@/utils/collection-utils'
import { getDateDayjs } from '@/utils/format-time'
import { _throttle } from '@/utils/timing-utils'
import { notifyLoading } from '@/utils/notification'
import t from '@/utils/i18n'
import type { FromTableData } from '@/views/cdn/common'
import {
  tableColumnNotRepeat,
  validPort,
  validIP,
  validWieght,
  notification,
  validDomain,
} from '@/views/cdn/domain/index-domain'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { ElMessage, type FormInstance } from 'element-plus/es'

const route: any = useRoute()

interface BaseConfig {
  area_code: number
  channel_type: number
  cname: string
  domain: string
  https_status: number
  support_ipv6: number | boolean
  status: number
  create_time: any
  remark: string
}

interface OriginItem {
  address: string
  http_port: string
  https_port: string
  weight: string
  host?: any
  type?: any
}

const baseInfo = ref<BaseConfig>({
  area_code: 0,
  channel_type: 0,
  cname: '',
  domain: '',
  https_status: 0,
  support_ipv6: 0,
  status: 0,
  create_time: '',
  remark: '',
})

const originConfig = reactive<{
  protocol: number
  tableData: FromTableData[]
  show: boolean
}>({
  protocol: 0,
  tableData: [],
  show: false,
})

const remark = reactive<{ show: boolean; value: string }>({
  show: false,
  value: '',
})

const accelerationZone = reactive<any>({
  show: false,
  loading: false,
  form: {},
})

const origin = reactive<{
  type: number
  tableA: OriginItem[]
  hostA: string
  tableB: OriginItem[]
  hostB: string
}>({
  type: 0,
  tableA: [{ address: '', http_port: '80', https_port: '443', weight: '' }],
  hostA: '',
  tableB: [],
  hostB: '',
})

const delOriginConfig = reactive<{
  show: boolean
  tableData: FromTableData[]
  index: any
}>({
  show: false,
  tableData: [],
  index: undefined,
})

const remarkDom = ref<FormInstance | null>(null)
const originConfigDom = ref<FormInstance | null>(null)
const originTableA = ref<FormInstance | null>(null)
const originTableB = ref<FormInstance | null>(null)
const ipv6Loading = ref(false)

const isEditAccelerationZone = computed(() => {
  return Boolean(
    (!accelerationZone.form?.area_code && accelerationZone.form?.area_code !== 0) ||
      accelerationZone.form?.area_code === baseInfo.value.area_code,
  )
})

const getDomainBaseConfig = async () => {
  await _getBaseConfig(route.query.id as any).then(res => {
    baseInfo.value = res.data.base_info
    baseInfo.value.support_ipv6 = res.data.base_info.support_ipv6 == 1
    originConfig.tableData = res.data.origin_server_conf.map(v => ({ ...v, weight: v.weight || '' }))
    sessionStorage.cdn_domain_details = JSON.stringify(baseInfo.value)
  })
}

const editRemark = () => {
  remark.value = baseInfo.value.remark
  remark.show = true
}

const updateRemark = () => {
  const params = {
    remark: remark.value,
    area_code: baseInfo.value.area_code,
  }

  _updateBaseConfig({ id: route.query.id as any, form: params })
    .then(() => {
      getDomainBaseConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      remark.show = false
    })
}

const updateAccelerationZone = async () => {
  try {
    accelerationZone.loading = true
    const res = await _updateBaseConfig({
      id: route.query.id as any,
      form: {
        area_code: accelerationZone.form.area_code,
      },
    })

    if (res.code === 200) {
      ElMessage.success(t('common.changeSuccess'))
      baseInfo.value.area_code = accelerationZone.form.area_code
      accelerationZone.show = false
    } else {
      ElMessage.error(res.msg || t('common.error_cs'))
    }
  } finally {
    accelerationZone.form = {}
    accelerationZone.loading = false
  }
}

const openOrigin = () => {
  origin.tableA = JSON.parse(JSON.stringify(originConfig.tableData.filter(v => v.priority === 0)))
  origin.tableB = JSON.parse(JSON.stringify(originConfig.tableData.filter(v => v.priority === 1)))
  origin.hostA = origin.tableA[0]?.host || ''
  origin.hostB = origin.tableB[0]?.host || baseInfo.value.domain
  origin.type = origin.tableA[0]?.type || 0
  originConfig.show = true
}

const addOrigin = (tableType: 'A' | 'B') => {
  if (origin.tableA.length + origin.tableB.length > 49) {
    notification({ type: 'failed', msg: 'moreThan50OriginConfig' })
    return
  }

  if (tableType === 'A') {
    origin.tableA.push({ address: '', http_port: '80', https_port: '443', weight: '' })
    return
  }

  origin.tableB.push({ address: '', http_port: '80', https_port: '443', weight: '' })
}

const updateOriginConfig = async tableData => {
  return await _updateBaseOriginConfig({
    id: route.query.id as any,
    tableData: {
      servers: tableData.map(v => ({
        ...v,
        http_port: +v.http_port,
        https_port: +v.https_port,
        weight: +v.weight || 50,
      })),
    },
  }).then(res => {
    getDomainBaseConfig()
    notification({ type: 'success', msg: 'setSuccess' })
    return res.code
  })
}

const setOrigin = async () => {
  const validForm = await originConfigDom.value?.validate(b => b)
  const validA = await originTableA.value?.validate(b => b)
  const validB = await originTableB.value?.validate(b => b)
  if (!(validForm && validA && validB)) return

  const arr1 = origin.tableA.map(v => ({
    ...v,
    priority: 0,
    type: origin.type,
    host: origin.hostA,
  })) as any

  const arr2 = origin.tableB.map(v => ({
    ...v,
    priority: 1,
    type: origin.type,
    host: origin.hostB,
  })) as any

  const code = await updateOriginConfig(JSON.parse(JSON.stringify([...arr1, ...arr2])))
  if (code === 200) {
    originConfig.show = false
  }
}

const delDialog = (row: FromTableData, index: any) => {
  delOriginConfig.index = index
  delOriginConfig.tableData = [{ ...row }]
  delOriginConfig.show = true
}

const delOriginHandle = async () => {
  if (originConfig.tableData.length === 1) {
    notification({ type: 'failed', msg: 'lastOneConfig' })
    return
  }
  if (!originConfig.tableData.some(v => v.priority === 0)) {
    notification({ type: 'failed', msg: 'haveOnePrimaryOrigin' })
    return
  }

  updateOriginConfig(originConfig.tableData.filter((v, i) => i !== delOriginConfig.index))
    .then(() => {
      notifyLoading({ msg: 'configRunning' })
      delOriginConfig.tableData = []
    })
    .finally(() => {
      delOriginConfig.show = false
    })
}

const switchIPv6 = _throttle(() => {
  const params = {
    support_ipv6: !baseInfo.value.support_ipv6 ? 1 : 2,
    remark: baseInfo.value.remark,
    area_code: baseInfo.value.area_code || 0,
  }

  ipv6Loading.value = true
  return _updateBaseConfig({ id: route.query.id as any, form: params })
    .then(() => {
      notifyLoading({ msg: 'configRunning' })
      getDomainBaseConfig()
    })
    .finally(() => {
      ipv6Loading.value = false
    })
}, 2000)

onMounted(() => {
  getDomainBaseConfig()
})
</script>

<style scoped lang="scss">
.cdn-domain-detail-base-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-detail-base-v2__section {
  padding: 20px;
  background: #fff;
}

.cdn-domain-detail-base-v2__section-head {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.cdn-domain-detail-base-v2__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cdn-domain-detail-base-v2__desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-detail-base-v2__descriptions {
  :deep(.el-descriptions__body) {
    background: transparent;
  }

  :deep(.el-descriptions__table) {
    table-layout: fixed;
    border-collapse: collapse;
  }

  :deep(.el-descriptions__cell) {
    padding: 14px 20px;
    font-size: 14px;
    line-height: 22px;
    border-color: #e8ecf3;
  }

  :deep(.el-descriptions__label) {
    width: 120px;
    font-weight: 400;
    color: #828b9c;
    background: #f9fafc;
  }

  :deep(.el-descriptions__content) {
    color: #191c23;
    background: #fff;
  }
}

.cdn-domain-detail-base-v2__inline,
.cdn-domain-detail-base-v2__switch-row,
.cdn-domain-detail-base-v2__table-footer {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cdn-domain-detail-base-v2__switch-row,
.cdn-domain-detail-base-v2__table-footer {
  gap: 16px;
}

.cdn-domain-detail-base-v2__ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cdn-domain-detail-base-v2__icon {
  flex-shrink: 0;
  color: #828b9c;
  cursor: pointer;
}

.cdn-domain-detail-base-v2__table-footer {
  margin-top: 16px;
}

.cdn-domain-detail-base-v2__table-link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}
</style>
