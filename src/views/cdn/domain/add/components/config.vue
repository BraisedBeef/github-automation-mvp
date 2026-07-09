<template>
  <div>
    <div class="page-box mt20">
      <div class="head">
        {{ t('improveHit') }}
      </div>
      <div class="mt20">
        {{ t('cacheRule') }}
      </div>
      <el-table
        :data="cacheConfig.tableData"
        show-overflow-tooltip
        :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
        class="mt20"
      >
        <el-table-column prop="type" :label="t('type')">
          <template #default="{ row }">
            {{ getValueMap(cacheType, row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" :label="t('content1')">
          <template #default="{ row }">
            {{ row.content || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="t('priority')" />
        <el-table-column prop="url_params_status" :label="t('ignoresParams')">
          <template #default="{ row }">
            {{ getValueMap(urlParams, row.url_params_status) }}
          </template>
        </el-table-column>
        <el-table-column prop="url_params" :label="t('setParams')">
          <template #default="{ row }">
            {{ row.url_params || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="cache_status" :label="t('effectiveMode')">
          <template #default="{ row }">
            {{ getValueMap(cacheMode, row.cache_status) }}
          </template>
        </el-table-column>
        <el-table-column prop="ttl" :label="t('cacheExpireTime')">
          <template #default="{ row }">
            {{ row.cache_status === 2 ? row.ttl + getValueMap(cacheTime, row.ttl_unit) : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('operation')">
          <template #default="{ row, $index }">
            <div class="table-handle">
              <el-link type="primary" @click="editCacheRule('edit', row, $index)">
                {{ t('edit') }}
              </el-link>
              <el-link :disabled="row.type === 0" type="primary" @click="cacheConfig.tableData.splice($index, 1)">
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="df ac mt20">
        <el-button type="primary" class="mr20" @click="editCacheRule('add')">
          {{ t('addRule') }}
        </el-button>
        <div>{{ t('cacheRuleTip') }}</div>
      </div>
    </div>
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

    <div class="page-box mt20">
      <div>{{ t('browserExpireTIme') }}</div>
      <el-table
        :data="browserCache.tableData"
        show-overflow-tooltip
        :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
        class="mt20"
      >
        <el-table-column prop="type" :label="t('type')">
          <template #default="{ row }">
            {{ getValueMap(cacheType, row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" :label="t('content1')">
          <template #default="{ row }">
            {{ row.content || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="t('priority')" />
        <el-table-column prop="cache_status" :label="t('effectiveMode')">
          <template #default="{ row }">
            {{ getValueMap(cacheMode, row.cache_status) }}
          </template>
        </el-table-column>
        <el-table-column prop="ttl" :label="t('cacheExpireTime')">
          <template #default="{ row }">
            {{ row.cache_status === 2 ? row.ttl + getValueMap(cacheTime, row.ttl_unit) : '-' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('operation')">
          <template #default="{ row, $index }">
            <div class="table-handle">
              <el-link type="primary" @click="editBrowserCache('edit', row, $index)">
                {{ t('edit') }}
              </el-link>
              <el-link type="primary" @click="browserCache.tableData.splice($index, 1)">
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="df ac mt20">
        <el-button type="primary" class="mr20" @click="editBrowserCache('add')">
          {{ t('addRule') }}
        </el-button>
        <div class="tip">
          {{ t('browserCacheTip') }}
        </div>
      </div>
    </div>
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

    <div class="page-box mt20">
      <div class="head">
        {{ t('improvePerformance') }}
      </div>
      <div class="tip mt20">
        {{ t('httpsOrhttpTip') }}
      </div>
      <div class="df ac mt20">
        <div class="label">
          {{ t('rangePull') }}
        </div>
        <el-switch v-model="state.back_source_range" @click="startHandle('back_source_range')" />
      </div>
      <div class="tip mt6">
        {{ t('startRangeTip') }}
      </div>
      <div class="df ac mt20">
        <div class="label">
          {{ t('pullFollow') }}
        </div>
        <el-switch v-model="state.back_source_follow" @click="startHandle('back_source_follow')" />
      </div>
      <div class="tip mt6">
        {{ t('pullFollowTip') }}
      </div>
      <div class="df ac mt20">
        <div class="label">
          {{ t('intelligentCompression') }}
        </div>
        <el-switch v-model="state.smart_compress.status" class="mr14" />
        <el-link
          v-show="state.smart_compress.status"
          type="primary"
          @click="
            () => {
              state.zipForm = { ...state.smart_compress }
              state.zipDialog = true
            }
          "
        >
          {{ t('edit') }}
        </el-link>
      </div>
      <div class="tip mt6">
        {{ t('startZipTip') }}
      </div>
      <div v-show="state.smart_compress.status">
        <div class="df ac mt20">
          <div class="label">
            {{ t('compressionType') }}
          </div>
          <div>{{ getValueMap(zipList, state.smart_compress.algorithm!) }}</div>
        </div>
        <div class="df ac mt20">
          <div class="label">
            {{ t('compressionMethod') }}
          </div>
          <div>{{ state.smart_compress.file_types || 'js;html;css;xml;json;shtml;htm' }}</div>
        </div>
      </div>
    </div>
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
          :rules="{
            validator: (r, v) => validateType(v),
            message: '',
            trigger: 'change',
          }"
        >
          <!-- <TipInput v-model="state.zipForm.file_types" :rule="validateType(state.zipForm.file_types)"
            :errorText="t('compressionErrorTip')" allowEmpty/> -->
          <el-input v-model="state.zipForm.file_types" />
          <el-text type="info" class="mt10">
            {{ t('compressionMethodTip') }}
          </el-text>
        </el-form-item>
      </el-form>
    </CatDialog>

    <div class="page-box mt20 safe">
      <div class="head">
        {{ t('accessSecurity') }}
      </div>
      <div class="df ac mt20">
        <div>{{ t('httpsConfig') }}</div>
        <!-- 如果为亚马逊路线禁止关闭 -->
        <el-switch v-model="https_conf.status" :disabled="https_conf.cdn_service_id == 2" class="ml14" />
      </div>
      <div class="tip mt6">
        {{ t('startHttpsTip') }}
      </div>
      <div class="mt20">
        <el-button
          v-show="https_conf.tableData.length === 0 && https_conf.status"
          type="primary"
          @click="editCert('upload')"
        >
          {{ t('configcert') }}
        </el-button>
      </div>
      <el-table v-show="https_conf.tableData.length > 0" :data="https_conf.tableData" class="mt20" table-layout="auto">
        <el-table-column prop="create_from" :label="t('certFrom')">
          <!-- <template #default="{ row }">{{ row.from ? 'managedCert' : 'newUploadCert' }}</template> -->
          <template #default="{ row }">
            {{ t('managedCert') }}
          </template>
        </el-table-column>
        <el-table-column prop="cert_name" :label="t('certName')" />
        <el-table-column prop="domain" :label="t('domain')" />
        <el-table-column prop="expire_at" :label="t('expirationTime')" />
        <el-table-column :label="t('certStatus')">
          {{ t('uploadSuccess') }}
        </el-table-column>
        <el-table-column :label="t('operation')">
          <template #default="{ row }">
            <div class="table-handle">
              <el-link type="primary" @click="editCert('edit', row)">
                {{ t('edit') }}
              </el-link>
              <el-link type="primary" @click="https_conf.tableData = []">
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="df ac mt20">
        <div>{{ t('ipFreqSet') }}</div>
        <el-switch v-model="ipFrequency.status" class="ml14 mr14" />
        <el-link v-show="ipFrequency.status" type="primary" @click="ipFrequencyHandle">
          {{ t('edit') }}
        </el-link>
      </div>
      <div class="tip mt6">
        {{ t('freqTip') }}
      </div>
      <div v-show="ipFrequency.status" class="df ac mt20">
        <div class="label">
          {{ t('ruleType') }}
        </div>
        <div>{{ ipFrequency.QPS || '-' }}QPS</div>
      </div>
      <div class="df jc mt20">
        <el-button type="primary" :loading="loading" @click="sendConfig">
          {{ t('confirm') }}
        </el-button>
        <el-button plain @click="pushRoute('/cdn/domain')">
          {{ t('cancel') }}
        </el-button>
      </div>
    </div>
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

<script lang="ts" setup>
import { urlParams, cacheMode, cacheTime, cacheType, cacheType1, zipList } from '@/assets/data/common.js'
import CertificateDialog from '@/components/cdn/certificate-dialog/index.vue'
import { message } from '@/utils/message'
import {
  validContent,
  getPlaceholder,
  validParams,
  validTime,
  tableColumnNotRepeat,
} from '@/views/cdn/domain/index-domain'
import { _getDomainConfig, _updateDomainConfig, _getCertList } from '@/apis/cdn/domain'
import { getValueMap } from '@/utils/collection-utils'
import t from '@/utils/i18n'

import type { CertificateUpload, HttpsTableData, CacheRule, BrowserCacheRule, ZIPconfig } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'
import { notify } from '@/utils/notification'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()
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

const cacheConfig = reactive<{
  tableData: CacheRule[]
  show: boolean
  title: string
  dialogIndex: number | undefined
  form: CacheRule | null
  rawForm: CacheRule
  delDialog: boolean
}>({
  tableData: [],
  show: false,
  title: 'add',
  dialogIndex: undefined,
  form: null,
  rawForm: {
    type: 1,
    content: '',
    priority: 1,
    url_params_status: 0,
    url_params: '',
    cache_status: 0,
    ttl: 0,
    ttl_unit: 1,
  },
  delDialog: false,
})
const cacheConfigFormDom = ref<FormInstance | null>(null)
const editCacheRule = (title: string, row?: CacheRule, index?: number | undefined) => {
  cacheConfig.dialogIndex = index
  if (row) {
    cacheConfig.form = { ...row }
  } else {
    cacheConfig.form = { ...cacheConfig.rawForm }
  }
  cacheConfig.title = title
  cacheConfig.show = true
}
const sureAddCacheRule = async () => {
  const valid = await cacheConfigFormDom.value!.validate(b => b)
  if (!valid) return
  let obj = { ...cacheConfig.form } as CacheRule
  if (cacheConfig.dialogIndex !== undefined) cacheConfig.tableData[cacheConfig.dialogIndex] = obj
  else cacheConfig.tableData.push(obj)
  cacheConfig.show = false
}

const browserCache = reactive<{
  tableData: BrowserCacheRule[]
  show: boolean
  title: string
  dialogIndex: number | undefined
  form: BrowserCacheRule | null
  rawForm: BrowserCacheRule
  delDialog: boolean
}>({
  tableData: [],
  show: false,
  title: 'add',
  dialogIndex: undefined,
  form: null,
  rawForm: {
    type: 0,
    content: '',
    priority: 1,
    cache_status: 0,
    ttl: 0,
    ttl_unit: 1,
  },
  delDialog: false,
})
const browserCacheFormDom = ref<FormInstance | null>(null)
const editBrowserCache = (title: string, row?: CacheRule, index?: number | undefined) => {
  browserCache.dialogIndex = index
  if (row) {
    browserCache.form = { ...row }
  } else {
    browserCache.form = { ...browserCache.rawForm }
  }
  browserCache.title = title
  browserCache.show = true
}
const sureAddBrowserCache = async () => {
  const valid = await browserCacheFormDom.value!.validate(bool => bool)
  if (!valid) return
  let obj: any = { ...browserCache.form }
  if (browserCache.dialogIndex !== undefined) browserCache.tableData[browserCache.dialogIndex] = obj
  else browserCache.tableData.push(obj)
  browserCache.show = false
}

const state = reactive<{
  back_source_range: boolean
  back_source_follow: boolean
  smart_compress: ZIPconfig
  zipDialog: boolean
  zipForm: ZIPconfig
  ip_freq_limit: {
    status: boolean
  }
}>({
  back_source_range: false,
  back_source_follow: false,
  smart_compress: {
    status: false,
    algorithm: 1,
    file_types: '',
  },
  zipDialog: false,
  zipForm: {
    status: false,
    algorithm: 1,
    file_types: '',
  },
  ip_freq_limit: {
    status: false,
  },
})
const startHandle = k => {
  if (+route.query.type === 3) {
    notify.error({
      message: t('notValidWorkType'),
      offset: 100,
      duration: 2000,
    })
    state[k] = false
    return
  }
}
const zipDom = ref<any>(null)
const validateType = content => {
  if (content.length === 0) return true
  if (content.lenth > 200) {
    return false
  }
  // 分割输入字符串
  const extensions = content.split(';')
  // 创建正则表达式以验证每个文件后缀名
  const regex = /^[a-zA-Z0-9]+$/
  // 验证每个文件后缀名
  for (let i = 0; i < extensions.length; i++) {
    if (!regex.test(extensions[i]) || extensions[i].length > 50) {
      return false
    }
  }
  // 如果所有检查都通过，则返回true
  return true
}
const updateZip = async () => {
  const valid = await zipDom.value?.validate(b => b)
  if (!valid) return
  state.smart_compress = { ...state.zipForm }
  state.zipDialog = false
}

const certDialog = reactive<{
  dialog: boolean
  dialogTitle: string
  dialogForm: CertificateUpload | null
  rawForm: CertificateUpload
  dialogTableData: HttpsTableData[]
}>({
  dialog: false,
  dialogTitle: 'add',
  dialogForm: null,
  rawForm: {
    domain_id: '',
    create_from: 0,
    cert_name: '',
    uploadType: 0,
    content: '',
    private_key: '',
  },
  dialogTableData: [
    {
      checked: false,
      id: '9TJgU3ws',
      name: 'name1',
      domain: 'baidu.com',
      timeout: '2024-01-16 15:18:50',
    },
  ],
})
const httpsDom = ref<any>(null)
const editCert = (title: string, row?: CertificateUpload) => {
  if (row) {
    certDialog.dialogForm = { ...row }
  } else {
    certDialog.dialogForm = { ...certDialog.rawForm }
  }
  certDialog.dialogTitle = title
  httpsDom.value.show = true
}
const sure = (v: CertificateUpload | any) => {
  https_conf.tableData = [{ ...v, domain: localStorage.CDN_DOMAIN }]
  httpsDom.value.show = false
}

const https_conf = reactive<{
  status: boolean
  cdn_service_id?: number
  tableData: any[]
}>({
  status: localStorage.CDN_SERVICE_ID == 2,
  tableData: [],
  cdn_service_id: localStorage.CDN_SERVICE_ID,
})

const ipFrequency = reactive<{
  status: number
  showDialog: boolean
  QPS: number
  form: {
    QPS: number
  }
}>({
  status: 0,
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

const loading = ref<boolean>(false)
const sendConfig = () => {
  let params: any = {
    cache_rules: cacheConfig.tableData.map(v => ({
      ...v,
      content: v.content.length > 0 ? v.content.split(';') : [],
      url_params: v.url_params.length > 0 ? v.url_params.split(';') : [],
    })),
    browser_cache_rules: browserCache.tableData.map(v => ({
      ...v,
      content: v.content.length > 0 ? v.content.split(';') : [],
    })),
    back_source_range: {
      status: +state.back_source_range,
    },
    back_source_follow: {
      status: +state.back_source_follow,
    },
    smart_compress: {
      status: +state.smart_compress.status,
    },
    https_conf: {
      status: +https_conf.status,
    },
    ip_freq_limit: {
      status: +ipFrequency.status,
    },
  }
  if (state.smart_compress.status) {
    params.smart_compress.algorithm = state.smart_compress.algorithm
    if (state.smart_compress.file_types) {
      params.smart_compress.file_types = state.smart_compress.file_types.split(';')
    } else {
      params.smart_compress.file_types = ['js', 'html', 'css', 'xml', 'json', 'shtml', 'htm']
    }
  }

  if (https_conf.status) {
    if (https_conf.tableData.length === 0) {
      message.error(t('pleaseConfigCertTip'))
      return
    } else {
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
  }
  if (ipFrequency.status) {
    params.ip_freq_limit.freq = +ipFrequency.QPS
  }
  loading.value = true
  _updateDomainConfig({ id: localStorage.CDN_DOMAIN_ID, form: params })
    .then(res => {
      if (res.code === 200) {
        emit('switchTab', true)
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
