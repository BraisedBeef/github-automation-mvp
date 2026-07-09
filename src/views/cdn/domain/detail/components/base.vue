<template>
  <div class="base">
    <div class="page-box">
      <div class="head">
        {{ t('baseInformation') }}
      </div>
      <div class="base-form df mt20">
        <el-form :model="base_info" label-position="left" label-width="auto" class="mr20">
          <el-form-item :label="t('accelerationRegion')">
            {{ getValueMap(areaList, base_info.area_code) }}
            <el-link
              class="ml10"
              type="primary"
              :disabled="[1].includes(base_info.area_code) || route.query.is_lock == 1"
              @click="accelerationZone.show = true"
            >
              {{ t('common.change') }}
            </el-link>
          </el-form-item>
          <el-form-item :label="t('status')">
            {{ getValueMap(AccelerationStatusList, base_info.status) }}
          </el-form-item>
          <el-form-item :label="t('acceleratedDomain')">
            <div class="df ac">
              <div>{{ base_info.domain }}</div>
              <SvgIcon name="cat-cdn-copy" class="ml4 icon-hover" @click="copyText(base_info.domain)" />
            </div>
          </el-form-item>
          <el-form-item label="CNAME">
            <div class="df ac">
              <div>{{ base_info.cname }}</div>
              <SvgIcon name="cat-cdn-copy" class="ml4 icon-hover" @click="copyText(base_info.cname)" />
            </div>
          </el-form-item>
          <el-form-item :label="t('belongProject')" style="margin-bottom: 0">
            {{ t('defaultProject') }}
          </el-form-item>
        </el-form>
        <el-form :model="base_info" label-position="left" label-width="auto">
          <el-form-item :label="t('accelerationType')">
            {{ getValueMap(channelTypeListAll, base_info.channel_type) }}
          </el-form-item>
          <el-form-item label="HTTPS">
            {{ base_info.https_status ? t('enable') : t('notEnabled') }}
          </el-form-item>
          <el-form-item :label="t('createTime')">
            {{ getDateDayjs(base_info.create_time * 1000, 'string', true) }}
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon class="ml10" name="cat-cdn-help" />
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="t('remark')" style="margin-bottom: 0">
            <div class="df ac">
              <div class="mr4">
                {{ base_info.remark || '--' }}
              </div>
              <SvgIcon
                :disabled="+route.query.status > 2 || route.query.is_lock == 1"
                name="cat-cdn-edit"
                class="ml4 icon-hover"
                @click="editRemark"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
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
    </div>

    <div class="page-box mt20">
      <div class="head">
        {{ t('originServerConfig') }}
      </div>
      <div class="tip mt20">
        {{ t('originConfigTip') }}
      </div>
      <el-table :data="originConfig.tableData" class="mt20" table-layout="auto">
        <el-table-column :label="t('originServerType')">
          <template #default="{ row }">
            {{ getValueMap(originTypeList0, row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="address" :label="t('originServerAddress')" />
        <el-table-column :label="t('priority')">
          <template #default="{ row }">
            {{ getValueMap(level, row.priority) }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" :label="t('weight')">
          <template #default="{ row }">
            {{ row.weight || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="http_port" :label="t('httpPort')" />
        <el-table-column prop="https_port" :label="t('httpsPort')" />
        <el-table-column
          prop="host"
          :label="t('pullHost')"
          width="200px"
          :show-overflow-tooltip="{ effect: 'light' }"
        />
        <el-table-column :label="t('operation')">
          <template #default="{ row, $index }">
            <div class="table-handle">
              <el-link v-if="row.priority" type="primary" @click="delDialog(row, $index)">
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <template #append>
          <el-button :disabled="route.query.is_lock == 1" type="primary" class="mr20" @click="openOrigin">
            {{ t('editRule') }}
          </el-button>
          <div class="tip">
            {{ t('addAnyRule', { num: 50 - originConfig.tableData.length }) }}
          </div>
        </template>
      </el-table>
    </div>
    <!-- 修改加速区域 -->
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
          {{ getValueMap(areaList, base_info.area_code) }}
        </el-form-item>
        <el-form-item :label="t('accelerationRegion')" required>
          <CatSelect
            v-model="accelerationZone.form.area_code"
            :list="areaList.filter(a => [2, '', 0][base_info.area_code] === a.value)"
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
                        row.address !== base_info.domain &&
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
                        row.address !== base_info.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index)
                      "
                      :error-text="
                        row.address === base_info.domain
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
                    :rules="{
                      validator: () => validPort(row.http_port),
                      message: '',
                      trigger: 'change',
                    }"
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
                    <!-- <el-input v-model.number="row.https_port" /> -->
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
          :rules="{
            validator: (r, v) => validDomain(v),
            trigger: 'change',
            message: '',
          }"
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
                        row.address !== base_info.domain &&
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
                        row.address !== base_info.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1)
                      "
                      :error-text="
                        row.address === base_info.domain
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
                    :rules="{
                      validator: () => validPort(row.http_port),
                      message: '',
                      trigger: 'change',
                    }"
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
                    :rules="{
                      validator: () => validPort(row.https_port),
                      message: '',
                      trigger: 'change',
                    }"
                  >
                    <!-- <el-input v-model.number="row.https_port" disabled /> -->
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
          :rules="{
            validator: (r, v) => validDomain(v),
            trigger: 'change',
            message: '',
          }"
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
        {{ t('deleteOriginConfig')
        }}<el-text class="ml4" type="primary">
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

    <div class="page-box mt20">
      <div class="head">IPv6 {{ t('config') }}</div>
      <div class="tip mt20">
        {{ t('ipv6Tip') }}
      </div>
      <div class="mt20 df ac">
        <div class="df ac">
          <div class="mr4">IPv6</div>
          <el-tooltip :content="t('ipv6Tip2')" effect="light" placement="top">
            <SvgIcon name="cat-cdn-warning" />
          </el-tooltip>
        </div>
        <el-switch
          v-model="base_info.support_ipv6"
          :before-change="switchIPv6"
          :loading="ipv6Loading"
          :disabled="+route.query.status > 2 || route.query.is_lock == 1 || !!base_info.area_code"
          class="ml14"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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
import { _throttle } from '@/utils/timing-utils'
import { getDateDayjs } from '@/utils/format-time'
import {
  tableColumnNotRepeat,
  inputNotRepeat,
  validPort,
  validIP,
  validWieght,
  notification,
  validDomain,
} from '@/views/cdn/domain/index-domain'
import { notifyLoading } from '@/utils/notification'
import t from '@/utils/i18n'

import type { FromTableData } from '@/views/cdn/common'
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

// 是否可编辑加速区域
const isEditAccelerationZone = computed(() => {
  return Boolean(
    (!accelerationZone.form?.area_code && accelerationZone.form?.area_code !== 0) ||
      accelerationZone.form?.area_code === base_info.value.area_code,
  )
})

const base_info = ref<BaseConfig>({
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
const getDomainBaseConfig = async () => {
  await _getBaseConfig(route.query.id as any).then(res => {
    base_info.value = res.data.base_info
    base_info.value.support_ipv6 = res.data.base_info.support_ipv6 == 1 ? true : false
    originConfig.tableData = res.data.origin_server_conf.map(v => ({ ...v, weight: v.weight || '' }))
    sessionStorage.cdn_domain_details = JSON.stringify(base_info.value)
  })
}
getDomainBaseConfig()

const remark = reactive<{ show: boolean; value: string }>({
  show: false,
  value: '',
})
const editRemark = () => {
  remark.value = base_info.value.remark
  remark.show = true
}
const updateRemark = () => {
  const params = {
    remark: remark.value,
    area_code: base_info.value.area_code,
  }
  _updateBaseConfig({ id: route.query.id as any, form: params })
    .then(() => {
      getDomainBaseConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      remark.show = false
    })
}

// const isEdit = ref<boolean>(false)
// const originConfig = reactive<{
//   tableData: FromTableData[]
//   rawTableData: FromTableData[]
//   show: boolean
//   title: string
//   form: FromTableData | null
//   rawForm: FromTableData
//   index: number | undefined
// }>({
//   tableData: [],
//   rawTableData: [],
//   show: false,
//   title: 'addOrigin',
//   form: null,
//   rawForm: {
//     type: 0,
//     address: '',
//     priority: 0,
//     weight: 50,
//     http_port: 80,
//     https_port: 443,
//     host: '',
//   },
//   index: undefined,
// })
// const openEditHandle = () => {
//   originConfig.rawTableData = JSON.parse(JSON.stringify(originConfig.tableData))
//   isEdit.value = true
// }
// const cancleEditHandle = () => {
//   originConfig.tableData = originConfig.rawTableData
//   isEdit.value = false
// }
// const originConfigDom = ref<FormInstance | null>(null)
// const openOriginDialog = (title: string, row?: FromTableData, index?: number) => {
//   originConfig.title = title
//   originConfig.index = index
//   if (row) {
//     originConfig.form = { ...row }
//   } else {
//     originConfig.form = { ...originConfig.rawForm, host: base_info.value.domain };
//   }
//   originConfig.show = true
// }
// const setOrigin = async () => {
//   const valid = await originConfigDom.value?.validate(b => b)
//   if (!valid) return
//   const arr = originConfig.form!.address.split(";")
//   if (arr.length + originConfig.tableData.length > 50) {
//     notification({ type: 'failed', msg: 'moreThan50OriginConfig' })
//     return;
//   }

//   if (originConfig.index !== undefined) {
//     const arr1 = arr.map(v => ({ ...originConfig.form, address: v }))
//     originConfig.tableData.splice(originConfig.index, 1, ...arr1 as any)
//   } else {
//     arr.forEach(v => {
//       originConfig.tableData.push({ ...originConfig.form!, address: v })
//     })
//   }
//   updateOriginConfig().finally(() => {
//     originConfig.show = false
//   })
// }

interface OriginItem {
  address: string
  http_port: string
  https_port: string
  weight: string
  host?: any
  type?: any
}
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
const openOrigin = () => {
  origin.tableA = JSON.parse(JSON.stringify(originConfig.tableData.filter(v => v.priority === 0)))
  origin.tableB = JSON.parse(JSON.stringify(originConfig.tableData.filter(v => v.priority === 1)))
  origin.hostA = origin.tableA[0]?.host || ''
  origin.hostB = origin.tableB[0]?.host || base_info.value.domain
  origin.type = origin.tableA[0]?.type || 0
  originConfig.show = true
}
const addOrigin = (tableType: 'A' | 'B') => {
  if (origin.tableA.length + origin.tableB.length > 49) {
    notification({ type: 'failed', msg: 'moreThan50OriginConfig' })
    return
  }
  origin['table' + tableType].push({ address: '', http_port: '80', https_port: '443', weight: '' })
}
const originTableA = ref<FormInstance | null>(null)
const originTableB = ref<FormInstance | null>(null)
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
  // 修改成功后，更新数据
  if (code === 200) {
    originConfig.show = false
  }
}

// 加速区域
const accelerationZone = reactive<any>({
  show: false,
  loading: false,
  form: {},
})
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
      base_info.value.area_code = accelerationZone.form.area_code
      accelerationZone.show = false
    } else {
      ElMessage.error(res.msg || t('common.error_cs'))
    }
  } finally {
    accelerationZone.form = {}
    accelerationZone.loading = false
  }
}

const originConfig = reactive<{
  protocol: number
  tableData: FromTableData[]
  show: boolean
}>({
  protocol: 0,
  tableData: [],
  show: false,
})
const originConfigDom = ref<FormInstance | null>(null)

const delOriginConfig = reactive<{
  show: boolean
  tableData: FromTableData[]
  index: any
}>({
  show: false,
  tableData: [],
  index: undefined,
})
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

const ipv6Loading = ref<boolean>(false)
const switchIPv6 = _throttle(() => {
  const params = {
    support_ipv6: !base_info.value.support_ipv6 ? 1 : 2,
    remark: base_info.value.remark,
    area_code: base_info.value.area_code || 0,
  }
  ipv6Loading.value = true
  return _updateBaseConfig({ id: route.query.id as any, form: params })
    .then(() => {
      notifyLoading({ msg: 'configRunning' })
      getDomainBaseConfig()
    })
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      ipv6Loading.value = false
    })
}, 2000)

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
</script>

<style lang="scss" scoped>
@import '../../index-domain';

.base {
  .base-form {
    .el-form {
      flex: 1;
      width: 0;

      .el-form-item {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
