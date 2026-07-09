<template>
  <div class="cdn-domain-add-step-v2">
    <section class="cdn-domain-add-step-v2__panel">
      <div class="cdn-domain-add-step-v2__block">
        <h3 class="cdn-domain-add-step-v2__title">
          {{ t('baseConfig') }}
        </h3>

        <el-form
          :model="config"
          label-position="left"
          label-width="auto"
          require-asterisk-position="right"
          class="cdn-domain-add-step-v2__form"
        >
          <div class="cdn-domain-add-step-v2__form-row">
            <div class="cdn-domain-add-step-v2__label">
              {{ t('type') }}
            </div>

            <div class="cdn-domain-add-step-v2__content">
              <CatRadioGroup
                v-if="(route.query as any).type === '3'"
                v-model="config.channel_type"
                :list="[{ label: t('allStations'), value: 3 }]"
              />
              <CatRadioGroup v-else v-model="config.channel_type" :list="channelTypeList" />
            </div>
          </div>

          <div class="cdn-domain-add-step-v2__form-row">
            <div class="cdn-domain-add-step-v2__label cdn-domain-add-step-v2__label--required">
              <span>{{ t('acceleratedDomain') }}</span>
              <span class="cdn-domain-add-step-v2__required">*</span>
            </div>

            <div class="cdn-domain-add-step-v2__content">
              <el-form-item
                prop="domain"
                :spellcheck="false"
                :rules="{
                  validator: (r, v) => validDomain(v),
                  message: config.domain === '' ? '' : t('domainNotVerify'),
                  trigger: 'change',
                  required: true,
                }"
                class="cdn-domain-add-step-v2__form-item"
              >
                <el-input
                  v-model="config.domain"
                  class="cdn-domain-add-step-v2__input"
                  :placeholder="t('inputContent')"
                />
              </el-form-item>
            </div>
          </div>

          <div class="cdn-domain-add-step-v2__form-row">
            <div class="cdn-domain-add-step-v2__label">
              {{ t('accelerationRegion') }}
            </div>

            <div class="cdn-domain-add-step-v2__content">
              <CatRadioGroup v-model="config.area_code" :list="areaList" />
            </div>
          </div>

          <div class="cdn-domain-add-step-v2__form-row">
            <div class="cdn-domain-add-step-v2__label">
              {{ t('remark') }}
            </div>

            <div class="cdn-domain-add-step-v2__content">
              <el-input
                v-model="config.remark"
                class="cdn-domain-add-step-v2__input"
                :placeholder="t('inputContent')"
              />
            </div>
          </div>
        </el-form>
      </div>

      <div class="cdn-domain-add-step-v2__divider" />

      <div class="cdn-domain-add-step-v2__block">
        <div class="cdn-domain-add-step-v2__section-head">
          <h3 class="cdn-domain-add-step-v2__title">
            {{ t('originServerConfig') }}
          </h3>
        </div>

        <div class="cdn-domain-add-step-v2__form-row cdn-domain-add-step-v2__form-row--compact">
          <div class="cdn-domain-add-step-v2__label">
            {{ t('originPullMode') }}
          </div>

          <div class="cdn-domain-add-step-v2__content">
            <el-radio-group v-model="originConfig.protocol">
              <el-radio :label="0" size="large"> HTTP </el-radio>
              <el-radio :label="1" size="large"> HTTPS </el-radio>
              <el-radio :label="2" size="large">
                {{ t('agreementFollow') }}
              </el-radio>
            </el-radio-group>
          </div>
        </div>

        <div class="cdn-domain-add-step-v2__rule-toolbar">
          <div class="cdn-domain-add-step-v2__rule-label">源站规则</div>

          <div class="cdn-domain-add-step-v2__rule-actions">
            <el-button type="primary" @click="openOrigin">
              {{ t('editRule') }}
            </el-button>
            <span class="cdn-domain-add-step-v2__footer-tip">
              {{ t('addAnyRule', { num: 50 - originConfig.tableData.length }) }}
            </span>
          </div>
        </div>

        <TableV2
          :data="originConfig.tableData"
          table-layout="auto"
          :empty-min-height="56"
          class="cdn-domain-add-step-v2__table"
        >
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
            <template #default="{ $index }">
              <button
                class="cdn-domain-add-step-v2__table-link"
                type="button"
                @click="originConfig.tableData.splice($index, 1)"
              >
                {{ t('delete') }}
              </button>
            </template>
          </el-table-column>

          <template #empty>
            <div class="cdn-domain-add-step-v2__table-empty">
              {{ t('noData') || '暂无数据' }}
            </div>
          </template>
        </TableV2>

        <div class="cdn-domain-add-step-v2__actions">
          <el-button type="primary" :loading="loading" @click="addDomain">
            {{ t('confirm') }}
          </el-button>
          <el-button plain @click="backRoute()">
            {{ t('cancel') }}
          </el-button>
        </div>
      </div>
    </section>

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
import { _addDomain } from '@/apis/cdn/domain'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import t from '@/utils/i18n'
import {
  validPort,
  validIP,
  tableColumnNotRepeat,
  notification,
  validDomain,
  validWieght,
} from '@/views/cdn/domain/index-domain'
import { getValueMap } from '@/utils/collection-utils'

import type { FromTableData } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'
import { backRoute } from '@/utils/router-jump'

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

<style scoped lang="scss">
.cdn-domain-add-step-v2 {
  width: 100%;
}

.cdn-domain-add-step-v2__panel {
  background: #fff;
}

.cdn-domain-add-step-v2__block {
  padding: 20px;
}

.cdn-domain-add-step-v2__divider {
  height: 1px;
  margin: 0 20px;
  background: #e8ecf3;
}

.cdn-domain-add-step-v2__section {
  background: #fff;
}

.cdn-domain-add-step-v2__title {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  line-height: 28px;
  color: #191c23;
}

.cdn-domain-add-step-v2__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.cdn-domain-add-step-v2__form {
  margin-top: 24px;
}

.cdn-domain-add-step-v2__form-row {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 24px;
}

.cdn-domain-add-step-v2__form-row:last-child {
  margin-bottom: 0;
}

.cdn-domain-add-step-v2__form-row--compact {
  margin-bottom: 24px;
}

.cdn-domain-add-step-v2__label {
  flex: 0 0 56px;

  // padding-top: 5px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-add-step-v2__label--required {
  display: inline-flex;
  gap: 2px;
  align-items: flex-start;
  white-space: nowrap;
}

.cdn-domain-add-step-v2__required {
  margin-left: 2px;
  color: #f56c6c;
}

.cdn-domain-add-step-v2__content {
  flex: 1;
  min-width: 0;
}

.cdn-domain-add-step-v2__form-item {
  margin-bottom: 0;
}

.cdn-domain-add-step-v2__input {
  width: 366px;
}

.cdn-domain-add-step-v2__rule-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.cdn-domain-add-step-v2__rule-label {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.cdn-domain-add-step-v2__rule-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.cdn-domain-add-step-v2__table {
  width: 100%;
}

.cdn-domain-add-step-v2__table-link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-domain-add-step-v2__table-footer {
  display: flex;
  gap: 16px;
  align-items: center;
}

.cdn-domain-add-step-v2__footer-tip {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-add-step-v2__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid #e8ecf3;
}

.cdn-domain-add-step-v2__table-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  font-size: 14px;
  line-height: 22px;
  color: #909399;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

:deep(.el-radio) {
  margin-right: 0;
}

:deep(.el-form-item__content) {
  line-height: 22px;
}

:deep(.el-input__wrapper) {
  border-radius: 0;
}

:deep(.table-v2 .el-table) {
  border-bottom: 0;
}

:deep(.table-v2 .el-table__inner-wrapper::before) {
  display: none;
}

:deep(.table-v2) {
  border: 0;
}

:deep(.table-v2 .el-table__empty-block) {
  padding: 0;
}
</style>
