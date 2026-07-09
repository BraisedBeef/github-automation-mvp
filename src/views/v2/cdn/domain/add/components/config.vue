<template>
  <div class="cdn-domain-add-config-v2">
    <section class="cdn-domain-add-config-v2__section">
      <div class="cdn-domain-add-config-v2__section-head">
        <h3 class="cdn-domain-add-config-v2__title">
          {{ t('improveHit') }}
        </h3>
      </div>

      <div class="cdn-domain-add-config-v2__form-block">
        <div class="cdn-domain-add-config-v2__label">
          {{ t('cacheRule') }}
        </div>

        <div class="cdn-domain-add-config-v2__content">
          <div class="cdn-domain-add-config-v2__toolbar">
            <el-button type="primary" @click="editCacheRule('add')">
              {{ t('addRule') }}
            </el-button>
            <p class="cdn-domain-add-config-v2__desc">
              {{ t('cacheRuleTip') }}
            </p>
          </div>

          <TableV2 :data="cacheConfig.tableData" table-layout="auto">
            <el-table-column prop="type" :label="t('type')" min-width="110">
              <template #default="{ row }">
                {{ getValueMap(cacheType, row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="content" :label="t('content1')" min-width="140">
              <template #default="{ row }">
                {{ row.content || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="priority" :label="t('priority')" min-width="90" />
            <el-table-column prop="url_params_status" :label="t('ignoresParams')" min-width="110">
              <template #default="{ row }">
                {{ getValueMap(urlParams, row.url_params_status) }}
              </template>
            </el-table-column>
            <el-table-column prop="url_params" :label="t('setParams')" min-width="110">
              <template #default="{ row }">
                {{ row.url_params || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="cache_status" :label="t('effectiveMode')" min-width="110">
              <template #default="{ row }">
                {{ getValueMap(cacheMode, row.cache_status) }}
              </template>
            </el-table-column>
            <el-table-column prop="ttl" :label="t('cacheExpireTime')" min-width="110">
              <template #default="{ row }">
                {{ row.cache_status === 2 ? row.ttl + getValueMap(cacheTime, row.ttl_unit) : '-' }}
              </template>
            </el-table-column>
            <el-table-column :label="t('operation')" min-width="100">
              <template #default="{ row, $index }">
                <div class="cdn-domain-add-config-v2__table-actions">
                  <button
                    type="button"
                    class="cdn-domain-add-config-v2__action-link"
                    @click="editCacheRule('edit', row, $index)"
                  >
                    {{ t('edit') }}
                  </button>
                  <button
                    type="button"
                    class="cdn-domain-add-config-v2__action-link"
                    :disabled="row.type === 0"
                    @click="cacheConfig.tableData.splice($index, 1)"
                  >
                    {{ t('delete') }}
                  </button>
                </div>
              </template>
            </el-table-column>
          </TableV2>
        </div>
      </div>

      <div class="cdn-domain-add-config-v2__form-block">
        <div class="cdn-domain-add-config-v2__label">
          {{ t('browserExpireTIme') }}
        </div>

        <div class="cdn-domain-add-config-v2__content">
          <div class="cdn-domain-add-config-v2__toolbar">
            <el-button type="primary" @click="editBrowserCache('add')">
              {{ t('addRule') }}
            </el-button>
            <p class="cdn-domain-add-config-v2__desc">
              {{ t('browserCacheTip') }}
            </p>
          </div>

          <TableV2 :data="browserCache.tableData" table-layout="auto">
            <el-table-column prop="type" :label="t('type')" min-width="160">
              <template #default="{ row }">
                {{ getValueMap(cacheType, row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="content" :label="t('content1')" min-width="160">
              <template #default="{ row }">
                {{ row.content || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="priority" :label="t('priority')" min-width="90" />
            <el-table-column prop="cache_status" :label="t('effectiveMode')" min-width="160">
              <template #default="{ row }">
                {{ getValueMap(cacheMode, row.cache_status) }}
              </template>
            </el-table-column>
            <el-table-column prop="ttl" :label="t('cacheExpireTime')" min-width="100">
              <template #default="{ row }">
                {{ row.cache_status === 2 ? row.ttl + getValueMap(cacheTime, row.ttl_unit) : '-' }}
              </template>
            </el-table-column>
            <el-table-column :label="t('operation')" min-width="100">
              <template #default="{ row, $index }">
                <div class="cdn-domain-add-config-v2__table-actions">
                  <button
                    type="button"
                    class="cdn-domain-add-config-v2__action-link"
                    @click="editBrowserCache('edit', row, $index)"
                  >
                    {{ t('edit') }}
                  </button>
                  <button
                    type="button"
                    class="cdn-domain-add-config-v2__action-link"
                    @click="browserCache.tableData.splice($index, 1)"
                  >
                    {{ t('delete') }}
                  </button>
                </div>
              </template>
            </el-table-column>
          </TableV2>
        </div>
      </div>
    </section>

    <section class="cdn-domain-add-config-v2__section">
      <div class="cdn-domain-add-config-v2__section-head">
        <h3 class="cdn-domain-add-config-v2__title">
          {{ t('improvePerformance') }}
        </h3>
        <p class="cdn-domain-add-config-v2__desc">
          {{ t('httpsOrhttpTip') }}
        </p>
      </div>

      <div class="cdn-domain-add-config-v2__switch-row">
        <div class="cdn-domain-add-config-v2__label">
          {{ t('rangePull') }}
        </div>
        <div class="cdn-domain-add-config-v2__content">
          <div class="cdn-domain-add-config-v2__switch-line">
            <el-switch v-model="state.back_source_range" @click="startHandle('back_source_range')" />
          </div>
          <p class="cdn-domain-add-config-v2__sub-desc">
            {{ t('startRangeTip') }}
          </p>
        </div>
      </div>

      <div class="cdn-domain-add-config-v2__switch-row">
        <div class="cdn-domain-add-config-v2__label">
          {{ t('pullFollow') }}
        </div>
        <div class="cdn-domain-add-config-v2__content">
          <div class="cdn-domain-add-config-v2__switch-line">
            <el-switch v-model="state.back_source_follow" @click="startHandle('back_source_follow')" />
          </div>
          <p class="cdn-domain-add-config-v2__sub-desc">
            {{ t('pullFollowTip') }}
          </p>
        </div>
      </div>

      <div class="cdn-domain-add-config-v2__switch-row">
        <div class="cdn-domain-add-config-v2__label">
          {{ t('intelligentCompression') }}
        </div>
        <div class="cdn-domain-add-config-v2__content">
          <div class="cdn-domain-add-config-v2__switch-line">
            <el-switch v-model="state.smart_compress.status" />
          </div>
          <p class="cdn-domain-add-config-v2__sub-desc">
            {{ t('startZipTip') }}
          </p>
        </div>
      </div>

      <div v-show="state.smart_compress.status" class="cdn-domain-add-config-v2__nested-table">
        <TableV2 :data="[state.smart_compress]" table-layout="auto">
          <el-table-column :label="t('compressionType')" min-width="320">
            <template #default>
              {{ getValueMap(zipList, state.smart_compress.algorithm!) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('compressionMethod')" min-width="520">
            <template #default>
              {{ state.smart_compress.file_types || 'js;html;css;xml;json;shtml;htm' }}
            </template>
          </el-table-column>
          <el-table-column :label="t('operation')" min-width="100">
            <template #default>
              <button
                type="button"
                class="cdn-domain-add-config-v2__action-link"
                @click="
                  () => {
                    state.zipForm = { ...state.smart_compress }
                    state.zipDialog = true
                  }
                "
              >
                {{ t('edit') }}
              </button>
            </template>
          </el-table-column>
        </TableV2>
      </div>
    </section>

    <section class="cdn-domain-add-config-v2__section">
      <div class="cdn-domain-add-config-v2__section-head">
        <h3 class="cdn-domain-add-config-v2__title">
          {{ t('accessSecurity') }}
        </h3>
      </div>

      <div class="cdn-domain-add-config-v2__switch-row">
        <div class="cdn-domain-add-config-v2__label">
          {{ t('httpsConfig') }}
        </div>
        <div class="cdn-domain-add-config-v2__content">
          <div class="cdn-domain-add-config-v2__switch-line">
            <el-switch v-model="https_conf.status" :disabled="https_conf.cdn_service_id == 2" />
          </div>
          <p class="cdn-domain-add-config-v2__sub-desc">
            {{ t('startHttpsTip') }}
          </p>
        </div>
      </div>

      <div v-show="https_conf.status" class="cdn-domain-add-config-v2__content-offset">
        <el-button v-show="https_conf.tableData.length === 0" type="primary" @click="editCert('upload')">
          {{ t('configcert') }}
        </el-button>

        <TableV2 v-show="https_conf.tableData.length > 0" :data="https_conf.tableData" table-layout="auto">
          <el-table-column prop="create_from" :label="t('certFrom')" min-width="200">
            <template #default>
              {{ t('managedCert') }}
            </template>
          </el-table-column>
          <el-table-column prop="cert_name" :label="t('certName')" min-width="160" />
          <el-table-column prop="domain" :label="t('domain')" min-width="160" />
          <el-table-column prop="expire_at" :label="t('expirationTime')" min-width="180" />
          <el-table-column :label="t('certStatus')" min-width="140">
            <template #default>
              {{ t('uploadSuccess') }}
            </template>
          </el-table-column>
          <el-table-column :label="t('operation')" min-width="100">
            <template #default="{ row }">
              <div class="cdn-domain-add-config-v2__table-actions">
                <button type="button" class="cdn-domain-add-config-v2__action-link" @click="editCert('edit', row)">
                  {{ t('edit') }}
                </button>
                <button type="button" class="cdn-domain-add-config-v2__action-link" @click="https_conf.tableData = []">
                  {{ t('delete') }}
                </button>
              </div>
            </template>
          </el-table-column>
        </TableV2>
      </div>

      <div class="cdn-domain-add-config-v2__switch-row">
        <div class="cdn-domain-add-config-v2__label">
          {{ t('ipFreqSet') }}
        </div>
        <div class="cdn-domain-add-config-v2__content">
          <div class="cdn-domain-add-config-v2__switch-line">
            <el-switch v-model="ipFrequency.status" />
            <button
              v-show="ipFrequency.status"
              type="button"
              class="cdn-domain-add-config-v2__action-link"
              @click="ipFrequencyHandle"
            >
              {{ t('edit') }}
            </button>
          </div>
          <p class="cdn-domain-add-config-v2__sub-desc">
            {{ t('freqTip') }}
          </p>
        </div>
      </div>

      <div v-show="ipFrequency.status" class="cdn-domain-add-config-v2__nested-table">
        <TableV2 :data="[{ QPS: ipFrequency.QPS || '-' }]" table-layout="auto">
          <el-table-column :label="t('ruleType')">
            <template #default="{ row }"> {{ row.QPS }}QPS </template>
          </el-table-column>
          <el-table-column :label="t('operation')">
            <template #default>
              <button type="button" class="cdn-domain-add-config-v2__action-link" @click="ipFrequencyHandle">
                {{ t('edit') }}
              </button>
            </template>
          </el-table-column>
        </TableV2>
      </div>
    </section>

    <section class="cdn-domain-add-config-v2__footer">
      <el-button type="primary" :loading="loading" @click="sendConfig">
        {{ t('confirm') }}
      </el-button>
      <el-button plain @click="pushRoute('/cdn/domain')">
        {{ t('cancel') }}
      </el-button>
    </section>

    <CatDialog
      v-model:dialog="cacheConfig.show"
      :title="cacheConfig.title + 'cacheRule'"
      width="680"
      destroy-on-close
      @confirm="sureAddCacheRule"
      @update:dialog="(v: boolean) => !v && cacheConfigFormDom?.resetFields()"
    >
      <el-form ref="cacheConfigFormDom" :model="cacheConfig.form!" label-width="auto" label-position="left">
        <el-form-item v-if="cacheConfig.form!.type === 0" :label="t('type')" prop="type">
          <CatRadioGroup v-model="cacheConfig.form!.type" :list="[{ label: t('allFiles'), value: 0 }]" readonly />
        </el-form-item>
        <el-form-item v-else :label="t('type')" prop="type">
          <CatRadioGroup v-model="cacheConfig.form!.type" :list="cacheType1" />
        </el-form-item>
        <el-form-item
          :label="t('content1')"
          prop="content"
          :rules="{
            validator: (r, v) => validContent(v, cacheConfig.form!.type),
            message: !cacheConfig.form!.content ? '' : t('inputFormatFalseTip'),
            trigger: 'change',
          }"
        >
          <el-input
            v-model="cacheConfig.form!.content"
            :disabled="cacheConfig.form!.type === 0 || cacheConfig.form!.type === 4"
            :placeholder="getPlaceholder(cacheConfig.form!.type)!"
          />
        </el-form-item>
        <el-form-item
          :label="t('priority')"
          prop="priority"
          :rules="{
            validator: (r, v) =>
              v > 0 &&
              v < 101 &&
              tableColumnNotRepeat(cacheConfig.tableData, cacheConfig.form, 'priority', cacheConfig.dialogIndex),
            message: !tableColumnNotRepeat(cacheConfig.tableData, cacheConfig.form, 'priority', cacheConfig.dialogIndex)
              ? t('priorityRepeat')
              : '',
            trigger: 'change',
          }"
        >
          <el-input v-model.number="cacheConfig.form!.priority" :placeholder="t('1-100number')" />
        </el-form-item>
        <el-form-item :label="t('ignoresParams')" prop="url_params_status">
          <CatRadioGroup v-model="cacheConfig.form!.url_params_status" :list="urlParams" />
        </el-form-item>
        <el-form-item
          v-if="cacheConfig.form!.url_params_status > 1"
          :label="t('setParams')"
          prop="url_params"
          :rules="{
            validator: (r, v) => validParams(v, cacheConfig.form!.url_params_status),
            message: !cacheConfig.form!.url_params ? '' : t('support0to9Tip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="cacheConfig.form!.url_params" :placeholder="t('setParamsTip')" />
        </el-form-item>
        <el-form-item :label="t('effectiveMode')" prop="cache_status">
          <CatSelect v-model="cacheConfig.form!.cache_status" :list="cacheMode" />
        </el-form-item>
        <el-form-item v-if="cacheConfig.form!.cache_status === 2" :label="t('cacheExpireTime')">
          <el-form-item
            prop="ttl"
            class="mr14"
            :rules="{
              validator: (r, v) => validTime(v, cacheConfig.form!.ttl_unit),
              message: !cacheConfig.form!.ttl ? '' : t('cacheTimeout365Tip'),
              trigger: 'change',
            }"
          >
            <el-input v-model.number="cacheConfig.form!.ttl" style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <CatSelect v-model="cacheConfig.form!.ttl_unit" :list="cacheTime" />
          </el-form-item>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="browserCache.show"
      :title="browserCache.title + 'BrowserCacheTimeoutRule'"
      width="680"
      destroy-on-close
      @confirm="sureAddBrowserCache"
      @update:dialog="v => !v && browserCacheFormDom!.resetFields()"
    >
      <el-form ref="browserCacheFormDom" :model="browserCache.form!" label-width="auto" label-position="left">
        <el-form-item :label="t('type')" prop="type">
          <CatRadioGroup
            v-model="browserCache.form!.type"
            :list="cacheType"
            @change="browserCacheFormDom!.resetFields(['content'])"
          />
        </el-form-item>
        <el-form-item
          :label="t('content1')"
          prop="content"
          :rules="{
            validator: (r, v) => validContent(v, browserCache.form!.type),
            message: !browserCache.form!.content ? '' : t('inputFormatFalseTip'),
            trigger: 'change',
          }"
        >
          <el-input
            v-model="browserCache.form!.content"
            :disabled="browserCache.form!.type === 0 || browserCache.form!.type === 4"
            :placeholder="getPlaceholder(browserCache.form!.type)!"
          />
        </el-form-item>
        <el-form-item
          :label="t('priority')"
          prop="priority"
          :rules="{
            validator: (r, v) =>
              v > 0 &&
              v < 101 &&
              tableColumnNotRepeat(browserCache.tableData, browserCache.form, 'priority', browserCache.dialogIndex),
            message: !tableColumnNotRepeat(
              browserCache.tableData,
              browserCache.form,
              'priority',
              browserCache.dialogIndex,
            )
              ? t('priorityRepeat')
              : '',
            trigger: 'change',
          }"
        >
          <el-input v-model.number="browserCache.form!.priority" :placeholder="t('1-100number')" />
        </el-form-item>
        <el-form-item :label="t('effectiveMode')" prop="cache_status">
          <CatSelect v-model="browserCache.form!.cache_status" :list="cacheMode" />
        </el-form-item>
        <el-form-item v-if="browserCache.form!.cache_status === 2" :label="t('cacheExpireTime')">
          <el-form-item
            prop="ttl"
            class="mr14"
            :rules="{
              validator: (r, v) => validTime(v, browserCache.form!.ttl_unit),
              message: !browserCache.form!.ttl ? '' : t('cacheTimeout365Tip'),
              trigger: 'change',
            }"
          >
            <el-input v-model.number="browserCache.form!.ttl" style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <CatSelect v-model="browserCache.form!.ttl_unit" :list="cacheTime" />
          </el-form-item>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="state.zipDialog"
      title="intelligentCompression"
      width="680"
      destroy-on-close
      @confirm="updateZip"
    >
      <el-form ref="zipDom" :model="state.zipForm" label-position="left" label-width="auto">
        <el-form-item :label="t('compressionType')" prop="algorithm">
          <CatRadioGroup v-model="state.zipForm.algorithm" :list="zipList" />
        </el-form-item>
        <el-form-item
          :label="t('targetAddress')"
          prop="file_types"
          :rules="{ validator: (r, v) => validateType(v), message: '', trigger: 'change' }"
        >
          <el-input v-model="state.zipForm.file_types" />
          <el-text type="info" class="mt10">
            {{ t('compressionMethodTip') }}
          </el-text>
        </el-form-item>
      </el-form>
    </CatDialog>

    <CertificateDialog
      ref="httpsDom"
      :title="certDialog.dialogTitle"
      :form="certDialog.dialogForm as CertificateUpload"
      :table-data="certDialog.dialogTableData"
      @sure="sure"
    />

    <CatDialog
      v-model:dialog="ipFrequency.showDialog"
      title="configIPfreq"
      width="680"
      destroy-on-close
      @confirm="setIpFrequency"
    >
      <CatTip>{{ t('freqDialogTip') }}</CatTip>
      <el-form ref="ipFreqDom" :model="ipFrequency.form" label-width="auto" label-position="left" class="mt20">
        <el-form-item
          :label="t('accessThreshold')"
          prop="QPS"
          :rules="{ validator: (r, v) => v !== '' && v > 0 && v <= 100000, message: '', trigger: 'change' }"
        >
          <el-input-number v-model="ipFrequency.form.QPS" :min="1" :max="100000" :step="1" :step-strictly="true" />
        </el-form-item>
      </el-form>
      <el-text type="info">
        {{ t('freqTip2') }}
      </el-text>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { urlParams, cacheMode, cacheTime, cacheType, cacheType1, zipList } from '@/assets/data/common.js'
import CertificateDialog from '@/components/cdn/certificate-dialog/index.vue'
import { message } from '@/utils/message'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import {
  validContent,
  getPlaceholder,
  validParams,
  validTime,
  tableColumnNotRepeat,
} from '@/views/cdn/domain/index-domain'
import { _getDomainConfig, _updateDomainConfig } from '@/apis/cdn/domain'
import { getValueMap } from '@/utils/collection-utils'
import t from '@/utils/i18n'

import type { CertificateUpload, HttpsTableData, CacheRule, BrowserCacheRule, ZIPconfig } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'
import { notify } from '@/utils/notification'
import { pushRoute } from '@/utils/router-jump'

const route: any = useRoute()
const emit = defineEmits<{ (event: 'switchTab', next: boolean): void }>()

const getDomainConfig = () => {
  _getDomainConfig(localStorage.CDN_DOMAIN_ID).then(res => {
    cacheConfig.tableData = res.data.cache_rule_conf.rules.map(v => ({
      ...v,
      content: v.content?.join(';') || '',
      url_params: v.url_params?.join(';') || '',
    }))
    browserCache.tableData = res.data.browser_cache_conf.rules.map(v => ({
      ...v,
      content: v.content?.join(';') || '',
    }))
  })
}
getDomainConfig()

const cacheConfig = reactive({
  tableData: [] as CacheRule[],
  show: false,
  title: 'add',
  dialogIndex: undefined as number | undefined,
  form: null as CacheRule | null,
  rawForm: {
    type: 1,
    content: '',
    priority: 1,
    url_params_status: 0,
    url_params: '',
    cache_status: 0,
    ttl: 0,
    ttl_unit: 1,
  } as CacheRule,
  delDialog: false,
})
const cacheConfigFormDom = ref<FormInstance | null>(null)
const editCacheRule = (title: string, row?: CacheRule, index?: number | undefined) => {
  cacheConfig.dialogIndex = index
  cacheConfig.form = row ? { ...row } : { ...cacheConfig.rawForm }
  cacheConfig.title = title
  cacheConfig.show = true
}
const sureAddCacheRule = async () => {
  const valid = await cacheConfigFormDom.value!.validate(b => b)
  if (!valid) return
  const obj = { ...cacheConfig.form } as CacheRule
  if (cacheConfig.dialogIndex !== undefined) cacheConfig.tableData[cacheConfig.dialogIndex] = obj
  else cacheConfig.tableData.push(obj)
  cacheConfig.show = false
}

const browserCache = reactive({
  tableData: [] as BrowserCacheRule[],
  show: false,
  title: 'add',
  dialogIndex: undefined as number | undefined,
  form: null as BrowserCacheRule | null,
  rawForm: {
    type: 0,
    content: '',
    priority: 1,
    cache_status: 0,
    ttl: 0,
    ttl_unit: 1,
  } as BrowserCacheRule,
  delDialog: false,
})
const browserCacheFormDom = ref<FormInstance | null>(null)
const editBrowserCache = (title: string, row?: CacheRule, index?: number | undefined) => {
  browserCache.dialogIndex = index
  browserCache.form = row ? { ...row } : { ...browserCache.rawForm }
  browserCache.title = title
  browserCache.show = true
}
const sureAddBrowserCache = async () => {
  const valid = await browserCacheFormDom.value!.validate(bool => bool)
  if (!valid) return
  const obj: any = { ...browserCache.form }
  if (browserCache.dialogIndex !== undefined) browserCache.tableData[browserCache.dialogIndex] = obj
  else browserCache.tableData.push(obj)
  browserCache.show = false
}

const state = reactive({
  back_source_range: false,
  back_source_follow: false,
  smart_compress: {
    status: false,
    algorithm: 1,
    file_types: '',
  } as ZIPconfig,
  zipDialog: false,
  zipForm: {
    status: false,
    algorithm: 1,
    file_types: '',
  } as ZIPconfig,
  ip_freq_limit: {
    status: false,
  },
})
const startHandle = k => {
  if (+route.query.type === 3) {
    notify.error({ message: t('notValidWorkType'), offset: 100, duration: 2000 })
    state[k] = false
  }
}
const zipDom = ref<any>(null)
const validateType = content => {
  if (content.length === 0) return true
  if (content.lenth > 200) return false
  const extensions = content.split(';')
  const regex = /^[a-zA-Z0-9]+$/
  for (let i = 0; i < extensions.length; i++) {
    if (!regex.test(extensions[i]) || extensions[i].length > 50) return false
  }
  return true
}
const updateZip = async () => {
  const valid = await zipDom.value?.validate(b => b)
  if (!valid) return
  state.smart_compress = { ...state.zipForm }
  state.zipDialog = false
}

const certDialog = reactive({
  dialog: false,
  dialogTitle: 'add',
  dialogForm: null as CertificateUpload | null,
  rawForm: {
    domain_id: '',
    create_from: 0,
    cert_name: '',
    uploadType: 0,
    content: '',
    private_key: '',
  } as CertificateUpload,
  dialogTableData: [
    {
      checked: false,
      id: '9TJgU3ws',
      name: 'name1',
      domain: 'baidu.com',
      timeout: '2024-01-16 15:18:50',
    },
  ] as HttpsTableData[],
})
const httpsDom = ref<any>(null)
const editCert = (title: string, row?: CertificateUpload) => {
  certDialog.dialogForm = row ? { ...row } : { ...certDialog.rawForm }
  certDialog.dialogTitle = title
  httpsDom.value.show = true
}
const sure = (v: CertificateUpload | any) => {
  https_conf.tableData = [{ ...v, domain: localStorage.CDN_DOMAIN }]
  httpsDom.value.show = false
}

const https_conf = reactive({
  status: localStorage.CDN_SERVICE_ID == 2,
  tableData: [] as any[],
  cdn_service_id: localStorage.CDN_SERVICE_ID as any,
})

const ipFrequency = reactive({
  status: 0 as any,
  showDialog: false,
  QPS: 1,
  form: {
    QPS: 1,
  },
})
const ipFrequencyHandle = () => {
  ipFrequency.form.QPS = ipFrequency.QPS
  ipFrequency.showDialog = true
}
const ipFreqDom = ref<FormInstance | null>(null)
const setIpFrequency = async () => {
  const valid = await ipFreqDom.value?.validate(b => b)
  if (!valid) return
  ipFrequency.QPS = ipFrequency.form.QPS
  ipFrequency.showDialog = false
}

const loading = ref(false)
const sendConfig = () => {
  const params: any = {
    cache_rules: cacheConfig.tableData.map(v => ({
      ...v,
      content: v.content.length > 0 ? v.content.split(';') : [],
      url_params: v.url_params.length > 0 ? v.url_params.split(';') : [],
    })),
    browser_cache_rules: browserCache.tableData.map(v => ({
      ...v,
      content: v.content.length > 0 ? v.content.split(';') : [],
    })),
    back_source_range: { status: +state.back_source_range },
    back_source_follow: { status: +state.back_source_follow },
    smart_compress: { status: +state.smart_compress.status },
    https_conf: { status: +https_conf.status },
    ip_freq_limit: { status: +ipFrequency.status },
  }
  if (state.smart_compress.status) {
    params.smart_compress.algorithm = state.smart_compress.algorithm
    params.smart_compress.file_types = state.smart_compress.file_types
      ? state.smart_compress.file_types.split(';')
      : ['js', 'html', 'css', 'xml', 'json', 'shtml', 'htm']
  }
  if (https_conf.status) {
    if (https_conf.tableData.length === 0) {
      message.error(t('pleaseConfigCertTip'))
      return
    }
    if (https_conf.tableData[0].checked) {
      params.https_conf.certificate_id = https_conf.tableData[0].id
    } else {
      params.https_conf.new_certificate = {
        name: https_conf.tableData[0].cert_name,
        content: https_conf.tableData[0].content_text,
        private_key: https_conf.tableData[0].private_key_text,
      }
    }
  }
  if (ipFrequency.status) {
    params.ip_freq_limit.freq = +ipFrequency.QPS
  }
  loading.value = true
  _updateDomainConfig({ id: localStorage.CDN_DOMAIN_ID, form: params })
    .then(res => {
      if (res.code === 200) emit('switchTab', true)
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped lang="scss">
.cdn-domain-add-config-v2 {
  display: flex;
  flex-direction: column;
  background: #fff;
}

.cdn-domain-add-config-v2__section,
.cdn-domain-add-config-v2__footer {
  padding: 20px;
  background: transparent;
}

.cdn-domain-add-config-v2__section + .cdn-domain-add-config-v2__section,
.cdn-domain-add-config-v2__section + .cdn-domain-add-config-v2__footer {
  border-top: 1px solid #e8ecf3;
}

.cdn-domain-add-config-v2__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cdn-domain-add-config-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cdn-domain-add-config-v2__desc,
.cdn-domain-add-config-v2__sub-desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-add-config-v2__form-block,
.cdn-domain-add-config-v2__switch-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 24px;
}

.cdn-domain-add-config-v2__label {
  flex: 0 0 126px;
  padding-top: 6px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-add-config-v2__content {
  flex: 1;
  min-width: 0;
}

.cdn-domain-add-config-v2__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.cdn-domain-add-config-v2__table-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.cdn-domain-add-config-v2__action-link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-domain-add-config-v2__action-link:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.cdn-domain-add-config-v2__switch-line {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 22px;
  margin-bottom: 8px;
}

.cdn-domain-add-config-v2__nested-table,
.cdn-domain-add-config-v2__content-offset {
  padding-left: 142px;
  margin-top: 16px;
}

.cdn-domain-add-config-v2__footer {
  display: flex;
  gap: 16px;
  align-items: center;
}

:deep(.el-switch) {
  --el-switch-on-color: #06f;
}
</style>
