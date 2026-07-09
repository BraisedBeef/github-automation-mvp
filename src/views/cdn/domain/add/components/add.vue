<template>
  <div class="add-domain">
    <div class="page-box mt20" style="padding: 0">
      <div class="pd20">
        <div class="head">
          {{ t('baseConfig') }}
        </div>
        <el-form
          :model="config"
          label-position="left"
          label-width="auto"
          require-asterisk-position="right"
          class="mt20"
        >
          <el-form-item :label="t('type')">
            <CatRadioGroup
              v-if="(route.query as any).type === '3'"
              v-model="config.channel_type"
              :list="[{ label: t('allStations'), value: 3 }]"
            />
            <CatRadioGroup v-else v-model="config.channel_type" :list="channelTypeList" />
          </el-form-item>
          <el-form-item
            :label="t('acceleratedDomain')"
            prop="domain"
            :spellcheck="false"
            :rules="{
              validator: (r, v) => validDomain(v),
              message: config.domain === '' ? '' : t('domainNotVerify'),
              trigger: 'change',
              required: true,
            }"
            style="width: 800px"
          >
            <el-input v-model="config.domain" style="width: 400px" />
          </el-form-item>
          <el-form-item :label="t('accelerationRegion')">
            <CatRadioGroup v-model="config.area_code" :list="areaList" />
          </el-form-item>
          <el-form-item :label="t('remark')" style="margin-bottom: 0">
            <div class="df ac" style="height: 100%">
              <div class="mr4">
                {{ config.remark || '-' }}
              </div>
              <SvgIcon
                name="cat-cdn-edit"
                class="icon-hover"
                @click="
                  () => {
                    remark.value = config.remark
                    remark.show = true
                  }
                "
              />
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- <div v-if="state.showDomainRecord">
        <el-divider style="margin-bottom:0" />
        <CatTimelines v-model="state.validStep" :status="state.validStatus" style="padding:20px 20px 0 20px">
          <CatTimeline :index="0">
            <div class="df ac">{{ t('dnsServerToTextTip') }}<el-link class="ml4 font12" type="primary">{{
          t('howToRegistration')
        }}</el-link></div>
            <el-table :data="state.domainRecord" class="mt10" style="width: 600px;">
              <el-table-column prop="record_type" :label="t('recordType')" />
              <el-table-column prop="sub_domain" :label="t('hostRecord')" />
              <el-table-column prop="record" :label="t('recordValue')" :show-overflow-tooltip="{ effect: 'light' }" />
            </el-table>
          </CatTimeline>
          <CatTimeline :index="1">
            <div style="margin-top:-6px;">{{ t('configured') }}<el-button @click="verify" type="primary" class="ml20">{{
          t('clickVerify')
        }}</el-button>
            </div>
          </CatTimeline>
          <CatTimeline :index="2">
            <div v-show="state.validStep === 1">{{ t('toBeVerify') }}</div>
            <div v-show="state.validStep === 2 && state.validStatus === 'success'">{{ t('verifySuccessfully') }}</div>
            <div v-show="state.validStep === 2 && state.validStatus === 'error'">
              <div>验证失败，{{ state.domainRecord[0]?.sub_domain }} 的 {{ state.domainRecord[0]?.record_type }} recordValue不为
                {{ state.domainRecord[0]?.record }}</div>
              <div>请重新配置后，再次点击验证</div>
            </div>
          </CatTimeline>
        </CatTimelines>
        <el-divider style="margin-bottom:0" />
      </div> -->

      <CatDialog
        v-model:dialog="remark.show"
        :title="t('remark')"
        :disabled="!remark.value"
        width="630px"
        @confirm="remarkHandle"
      >
        <el-input v-model="remark.value" type="textarea" :rows="5" resize="none" show-word-limit maxlength="200" />
      </CatDialog>
    </div>

    <div class="page-box mt20">
      <div class="head">
        {{ t('originServerConfig') }}
      </div>
      <el-form label-position="left" label-width="auto" class="mt20">
        <el-form-item :label="t('originPullMode')">
          <el-radio-group v-model="originConfig.protocol">
            <el-radio :label="0" size="large"> HTTP </el-radio>
            <el-radio :label="1" size="large"> HTTPS </el-radio>
            <el-radio :label="2" size="large">
              {{ t('agreementFollow') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div>{{ t('originServer') }}</div>
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
              <!-- <el-link @click="openOrigin('editOrigin', row, $index)" type="primary">{{ t('edit') }}</el-link> -->
              <el-link type="primary" @click="originConfig.tableData.splice($index, 1)">
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>

        <template #append>
          <el-button type="primary" class="mr20" @click="openOrigin">
            {{ t('editRule') }}
          </el-button>
          <div class="tip">
            {{ t('addAnyRule', { num: 50 - originConfig.tableData.length }) }}
          </div>
        </template>
      </el-table>
      <div class="df jc base-btn mt20">
        <el-button type="primary" :loading="loading" @click="addDomain">
          {{ t('confirm') }}
        </el-button>
        <el-button plain @click="backRoute()">
          {{ t('cancel') }}
        </el-button>
      </div>
    </div>

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
                        row.address !== config.domain &&
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
                        row.address !== config.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index)
                      "
                      :error-text="
                        row.address === config.domain
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
                    :rules="{
                      validator: () => validPort(row.https_port),
                      message: '',
                      trigger: 'change',
                    }"
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
                        row.address !== config.domain &&
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
                        row.address !== config.domain &&
                        validDomain(row.address) &&
                        tableColumnNotRepeat([...origin.tableA, ...origin.tableB], row, 'address', $index + 1)
                      "
                      :error-text="
                        row.address === config.domain
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
                      v-model.number="row.weight"
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
  </div>
</template>

<script setup lang="ts">
import { level, originTypeList0, areaList, channelTypeList, originTypeList } from '@/assets/data/common.js'
import { _addDomain, _domainValidation, _domainVerify, _domainVerifyRecord } from '@/apis/cdn/domain'
import t from '@/utils/i18n'
import {
  validPort,
  validIP,
  tableColumnNotRepeat,
  notification,
  validDomain2,
  validDomain,
  validWieght,
} from '@/views/cdn/domain/index-domain'
import { getValueMap } from '@/utils/collection-utils'

import type { FromTableData } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'
import { notify } from '@/utils/notification'
import { backRoute } from '@/utils/router-jump'

// const punycode = require('punycode')

const router = useRouter()
const route = useRoute()
const emit = defineEmits<{
  (event: 'switchTab', next: boolean): void
}>()

const config = reactive<{
  channel_type: number
  domain: string
  area_code: number
  remark: string
}>({
  channel_type: (route.query as any).type === '3' ? 3 : 0,
  domain: '',
  area_code: 0,
  remark: '',
})
// const state = reactive<any>({
//   validStatus: 'success',
//   errorType: 0,
//   loading: false,
//   showDomainRecord: false,
//   domainRecord: [],
//   validStep: 1,
//   timer: null,
// })
// const verify = () => {
//   if (state.validStep === 2) {
//     state.validStep--
//   }
//   _domainVerify({ domain: config.domain }).then(res => {
//     if (res.data?.ok) {
//       state.validStatus = 'success'
//       state.errorType = 0
//       state.showDomainRecord = false
//       notify.success({
//         message: 'verifySuccessfully',
//         offset: 100,
//         duration: 5000,
//       })
//     } else {
//       state.validStatus = 'error'
//       state.errorType = 5
//     }
//     state.validStep++
//   })
// }

const remark = reactive<{
  show: boolean
  value: string
}>({
  show: false,
  value: '',
})
const remarkHandle = () => {
  config.remark = remark.value
  remark.show = false
}

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
  if (originConfig.tableData.length > 0) {
    origin.tableA = JSON.parse(JSON.stringify(originConfig.tableData.filter(v => v.priority === 0)))
    origin.tableB = JSON.parse(JSON.stringify(originConfig.tableData.filter(v => v.priority === 1)))
    origin.hostA = origin.tableA[0]?.host || ''
    origin.hostB = origin.tableB[0]?.host || config.domain
  } else {
    origin.tableA = [{ address: '', http_port: '80', https_port: '443', weight: '' }]
    origin.tableB = []
    origin.hostA = origin.hostB = config.domain
  }
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
  originConfig.tableData = JSON.parse(JSON.stringify([...arr1, ...arr2]))
  originConfig.show = false
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

const loading = ref<boolean>(false)
const addDomain = () => {
  if (config.domain.length === 0) {
    notification({ type: 'failed', msg: 'inputDomain' })
    return
  }

  if (originConfig.tableData.length < 1) {
    notification({ type: 'failed', msg: 'lastOneConfig' })
    return
  }
  if (!originConfig.tableData.some(v => v.priority === 0)) {
    notification({ type: 'failed', msg: 'haveOnePrimaryOrigin' })
    return
  }
  loading.value = true

  _addDomain({
    ...config,
    origin_conf: {
      protocol: originConfig.protocol,
      servers: originConfig.tableData.map(v => {
        return {
          ...v,
          http_port: +v.http_port,
          https_port: +v.https_port,
          weight: +v.weight || 50,
        }
      }),
    },
  })
    .then(res => {
      if (res.code === 200) {
        localStorage.CDN_DOMAIN = config.domain
        localStorage.CDN_DOMAIN_ID = res.data.id
        localStorage.CDN_SERVICE_ID = res.data.cdn_service_id
        emit('switchTab', true)
      } else if (res.response.data.code === 10000) {
        notification({ type: 'failed', msg: res.data.msg })
      }
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style lang="scss" scoped>
@import '../../index-domain';
</style>
