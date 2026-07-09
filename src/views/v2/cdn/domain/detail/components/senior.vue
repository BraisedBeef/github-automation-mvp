<template>
  <div class="cdn-domain-detail-senior-v2">
    <section class="cdn-domain-detail-senior-v2__section">
      <div class="cdn-domain-detail-senior-v2__section-head">
        <h3 class="cdn-domain-detail-senior-v2__title">
          {{ t('customErrorPageConfig') }}
        </h3>
        <p class="cdn-domain-detail-senior-v2__desc">
          {{ t('customErrorTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-senior-v2__action-row">
        <el-button :disabled="isReadOnly" type="primary" @click="editErrorRule('add')">
          {{ t('add') }}
        </el-button>
      </div>

      <TableV2 :data="senior.error_page_conf.rules" class="cdn-domain-detail-senior-v2__table" table-layout="auto">
        <el-table-column prop="error_code" :label="t('statusCode')" min-width="140" />
        <el-table-column prop="redirect_code" :label="t('redirect')" min-width="140" />
        <el-table-column prop="redirect_to" :label="t('targetAddress')" min-width="260" />
        <el-table-column :label="t('operation')" min-width="140">
          <template #default="{ row }">
            <div class="cdn-domain-detail-senior-v2__table-handle">
              <el-link :disabled="isReadOnly" type="primary" @click="editErrorRule('edit', row)">
                {{ t('edit') }}
              </el-link>
              <el-link :disabled="isReadOnly" type="primary" @click="delErrorRule(row)">
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CatDialog
      v-model:dialog="error.show"
      :title="error.title + 'customErrorPageConfig'"
      width="550"
      destroy-on-close
      @confirm="addErrorRule"
    >
      <el-form ref="errorDom" :model="error.form!" label-position="left" label-width="auto">
        <el-form-item
          :label="t('statusCode')"
          prop="error_code"
          :rules="{
            validator: (r, v) => v !== '',
            message: '',
            trigger: 'change',
          }"
        >
          <CatSelect v-model="error.form!.error_code" :list="statusCodeCurrent" />
        </el-form-item>
        <el-form-item :label="t('redirect')" prop="redirect_code">
          <CatRadioGroup v-model="error.form!.redirect_code" :list="redriectCodeList" />
        </el-form-item>
        <el-form-item
          :label="t('targetAddress')"
          prop="redirect_to"
          :rules="{
            validator: (r, v) => seniorValidHttpUrl(v),
            message: !error.form!.redirect_to ? '' : t('targetAddressErrorTip'),
            trigger: 'change',
          }"
        >
          <div class="df fdc w-full">
            <el-input v-model="error.form!.redirect_to" :placeholder="t('targetAddressInputTip')" />
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>

    <section class="cdn-domain-detail-senior-v2__section">
      <div class="cdn-domain-detail-senior-v2__section-head">
        <h3 class="cdn-domain-detail-senior-v2__title">
          {{ t('httpResConfig') }}
        </h3>
        <p class="cdn-domain-detail-senior-v2__desc">
          {{ t('httpResTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-senior-v2__action-row">
        <el-button :disabled="isReadOnly" type="primary" @click="editHttpResponse">
          {{ t('edit') }}
        </el-button>
      </div>

      <TableV2 :data="senior.response_header_conf.rules" class="cdn-domain-detail-senior-v2__table" table-layout="auto">
        <el-table-column :label="t('responseOpe')" min-width="160">
          <template #default="{ row }">
            {{ getValueMap(headOperate, row.operation) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('params')" prop="header_name" min-width="220" />
        <el-table-column :label="t('value')" prop="header_value" min-width="260">
          <template #default="{ row }">
            {{ row.header_value || '--' }}
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CatDialog
      v-model:dialog="response.show"
      title="configHttpHeader"
      width="90%"
      destroy-on-close
      @confirm="updateHttpHead"
    >
      <el-form ref="httpHeadDom" :model="response">
        <el-table :data="response.tableData" table-layout="auto">
          <el-table-column :label="t('responseOpe')" width="200px">
            <template #default="{ row }">
              <CatSelect
                v-model="row.operation"
                :list="
                  headOperate.filter(
                    v =>
                      !(
                        v.value === 2 &&
                        (row.header_name === 'Content-Disposition' || row.header_name === 'Content-Language')
                      ),
                  )
                "
                @change="
                  v => {
                    changeOperation(v, row)
                  }
                "
              />
            </template>
          </el-table-column>
          <el-table-column :label="t('params')" width="450px">
            <template #default="{ row }">
              <div class="df ac">
                <CatSelect
                  v-model="row.header_name"
                  :list="
                    requestHead.filter(
                      v => response.tableData.every(vv => vv.header_name !== v.value) || v.value === '',
                    )
                  "
                  @change="
                    v => {
                      changeHeaderParams(v, row)
                    }
                  "
                />
                <el-form-item
                  v-if="row.header_name === ''"
                  prop="header_custom"
                  :rules="{
                    validator: () => /^[a-zA-Z-]{1,}$/.test(row.header_custom),
                    message: '',
                    trigger: 'change',
                  }"
                >
                  <div class="ml14" style="width: 300px">
                    <TipInput
                      v-model="row.header_custom"
                      :rule="/^[a-zA-Z-]{1,}$/.test(row.header_custom)"
                      placeholder="inputCustomResName"
                      teleported
                      placement="top"
                      error-text="resErrorTip"
                    />
                  </div>
                </el-form-item>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('value')">
            <template #default="{ row }">
              <el-form-item
                prop="header_value"
                :rules="{
                  validator: () => validHttpHeadValue(row.header_name, row.header_value) || row.operation === 2,
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model="row.header_value"
                  :rule="validHttpHeadValue(row.header_name, row.header_value)"
                  :placeholder="getPlaceholder(row.header_name)"
                  :error-text="getHttpHeaderTip(row.header_name)"
                  teleported
                  placement="top"
                  :disabled="row.operation === 2"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="t('operation')">
            <template #default="{ $index }">
              <el-link type="primary" @click="response.tableData.splice($index, 1)">
                {{ t('delete') }}
              </el-link>
            </template>
          </el-table-column>
          <template #append>
            <el-button type="primary" @click="addResponse">
              {{ t('add') }}
            </el-button>
          </template>
        </el-table>
      </el-form>
    </CatDialog>

    <section class="cdn-domain-detail-senior-v2__section">
      <div class="cdn-domain-detail-senior-v2__section-head">
        <h3 class="cdn-domain-detail-senior-v2__title">
          {{ t('intelligentCompression') }}
        </h3>
        <p class="cdn-domain-detail-senior-v2__desc">
          {{ t('compressionZIPtip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-senior-v2__switch-row">
        <span class="cdn-domain-detail-senior-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-senior-v2__switch-content">
          <el-switch
            v-model="senior.smart_compress_conf.status"
            :before-change="switchZIP"
            :loading="zip.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="senior.smart_compress_conf.status"
            class="cdn-domain-detail-senior-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editZIP"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <template v-if="senior.smart_compress_conf.status">
        <div class="cdn-domain-detail-senior-v2__info-row">
          <span class="cdn-domain-detail-senior-v2__label">{{ t('compressionType') }}</span>
          <div class="cdn-domain-detail-senior-v2__content">
            {{ getValueMap(zipList, senior.smart_compress_conf.algorithm) }}
          </div>
        </div>
        <div class="cdn-domain-detail-senior-v2__info-row">
          <span class="cdn-domain-detail-senior-v2__label">{{ t('compressionMethod') }}</span>
          <div class="cdn-domain-detail-senior-v2__content">
            {{ senior.smart_compress_conf.file_types || zip.file_default_type }}
          </div>
        </div>
      </template>
    </section>

    <CatDialog
      v-model:dialog="zip.show"
      title="intelligentCompression"
      width="680"
      destroy-on-close
      @confirm="updateZIP"
    >
      <el-form ref="zipDom" :model="zip.form" label-position="left" label-width="auto">
        <el-form-item :label="t('compressionType')" prop="algorithm">
          <CatRadioGroup v-model="zip.form.algorithm" :list="zipList" />
        </el-form-item>
        <el-form-item
          :label="t('targetAddress')"
          prop="file_types"
          :rules="{
            validator: (r, v) => validateType(zip.form.file_types),
            message: '',
            trigger: 'change',
          }"
        >
          <div>
            <el-input v-model="zip.form.file_types" />
            <div class="form-tip">
              {{ t('compressionMethodTip') }}
            </div>
          </div>
        </el-form-item>
      </el-form>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import { statusCode, headOperate, requestHead, redriectCodeList, zipList } from '@/assets/data/common.js'
import { validHttpHeadValue, notification, validHttpUrl } from '@/views/cdn/domain/index-domain'
import {
  _getSeniorConfig,
  _addErrorRule,
  _updateErrorRule,
  _delErrorRule,
  _updateHttpHead,
  _updateZip,
} from '@/apis/cdn/domain'
import t from '@/utils/i18n'
import { getValueMap } from '@/utils/collection-utils'
import { _throttle } from '@/utils/timing-utils'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

import type { ErrorTableItem, HttpHead, ZIPconfig } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'

const route: any = useRoute()
const isReadOnly = computed(() => +route.query.status > 2 || route.query.is_lock == 1)

const senior = ref<{
  error_page_conf: {
    status: number
    rules: ErrorTableItem[]
  }
  response_header_conf: {
    status: number
    rules: HttpHead[]
  }
  smart_compress_conf: {
    status: number
    algorithm: number
    file_types: any
  }
}>({
  error_page_conf: {
    status: 0,
    rules: [],
  },
  response_header_conf: {
    status: 0,
    rules: [],
  },
  smart_compress_conf: {
    status: 0,
    algorithm: 1,
    file_types: [],
  },
})
const getSeniorConfig = async () => {
  await _getSeniorConfig(route.query.id).then(res => {
    senior.value = res.data
    senior.value.smart_compress_conf.status = !!senior.value.smart_compress_conf.status as any
    senior.value.smart_compress_conf.file_types = senior.value.smart_compress_conf.file_types?.join(';') || ''
  })
}
getSeniorConfig()

const error = reactive<{
  show: boolean
  title: string
  form: ErrorTableItem | null
  rawForm: ErrorTableItem
}>({
  show: false,
  title: 'add',
  form: null,
  rawForm: {
    error_code: '',
    redirect_code: 301,
    redirect_to: '',
  },
})
const errorDom = ref<FormInstance | null>(null)
const statusCodeCurrent = computed(() => {
  return statusCode.map((vv: any) => {
    vv.disabled = senior.value.error_page_conf.rules.some(v => v.error_code == vv.value)
    return vv
  })
})
const seniorValidHttpUrl = v => {
  return validHttpUrl(v) && !/[\u4e00-\u9fa5]/.test(v)
}
const editErrorRule = (title: string, row?: ErrorTableItem) => {
  error.form = row ? { ...row } : { ...error.rawForm }
  error.title = title
  error.show = true
}
const addErrorRule = async () => {
  const valid = await errorDom.value!.validate(b => b)
  if (!valid) return
  let code
  if (error.title === 'add') {
    code = await _addErrorRule({ id: route.query.id, form: error.form as any }).then(res => res.code)
  } else {
    code = await _updateErrorRule({ id: route.query.id, form: error.form as any }).then(res => res.code)
  }
  if (code == 200) {
    getSeniorConfig()
    notification({ type: 'success', msg: 'setSuccess' })
  } else {
    notification({ type: 'failed', msg: 'configFailed' })
  }
  error.show = false
}
const delErrorRule = (row: ErrorTableItem) => {
  _delErrorRule({ id: route.query.id, rule_id: row.id })
    .then(() => {
      getSeniorConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      error.show = false
    })
}

const response = reactive<{
  show: boolean
  tableData: HttpHead[]
}>({
  show: false,
  tableData: [],
})
const httpHeadDom = ref<FormInstance | null>(null)
const changeOperation = (index, row) => {
  if (index === 2) {
    row.header_value = ''
  }
}
const changeHeaderParams = (v, row) => {
  if (v === 'Content-Disposition' || v === 'Content-Language') {
    row.operation = 1
  }
  row.header_value = ''
}
const editHttpResponse = () => {
  response.tableData = senior.value.response_header_conf.rules.map(v => ({
    ...v,
    header_name: requestHead.find(vv => vv.value === v.header_name) ? v.header_name : '',
    header_custom: requestHead.find(vv => vv.value === v.header_name) ? '' : v.header_name,
  }))
  response.show = true
}
const addResponse = () => {
  response.tableData.push({
    operation: 1,
    header_name: '',
    header_custom: '',
    header_value: '',
  })
}
const updateHttpHead = async () => {
  const valid = await httpHeadDom.value?.validate(b => b)
  if (!valid) return
  const params = response.tableData.map(v => ({
    ...v,
    header_name: v.header_name ? v.header_name : v.header_custom,
  }))
  _updateHttpHead({ id: route.query.id, tableData: params as any })
    .then(() => {
      getSeniorConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      response.show = false
    })
}
const getPlaceholder = head => {
  if (head === 'Access-Control-Allow-Origin') return 'inputAllowOrigin'
  if (head === 'Access-Control-Allow-Methods') return 'inputAllowMethod'
  if (head === 'Access-Control-Max-Age') return 'inputAllowMaxTime'
  if (head === 'Access-Control-Expose-Headers') return 'inputAllowExpose'
  if (head === 'Content-Disposition') return 'inputAllowDisposition'
  if (head === 'Content-Language') return 'inputAllowLang'
}
const getHttpHeaderTip = head => {
  if (head === 'Access-Control-Allow-Origin') return 'allowOriginTip'
  if (head === 'Access-Control-Max-Age') return 'allowMaxTimeTip'
  if (head === 'Access-Control-Expose-Headers') return 'allowExposeTip'
  if (head === '') return 'allowCustomTip'
  return 'formatErrorTip'
}

const zip = reactive<{
  show: boolean
  loading: boolean
  form: ZIPconfig
  file_default_type: string
}>({
  show: false,
  loading: false,
  form: {
    status: 1,
    algorithm: 1,
    file_types: '',
  },
  file_default_type: 'js;html;css;xml;json;shtml;htm',
})
const editZIP = () => {
  zip.form = { ...senior.value.smart_compress_conf }
  zip.show = true
}
const zipDom = ref<any>(null)
const validateType = content => {
  if (content.length === 0) return true
  if (content.lenth > 200) return false
  const extensions = content.split(';')
  const regex = /^[a-zA-Z0-9]+$/
  for (let i = 0; i < extensions.length; i++) {
    if (!regex.test(extensions[i]) || extensions[i].length > 50) {
      return false
    }
  }
  return true
}
const switchZIP = _throttle(() => {
  updateZIP(true)
}, 2000)
const updateZIP = async (isSwitch = false) => {
  let params
  if (isSwitch) {
    params = {
      ...senior.value.smart_compress_conf,
      status: +!senior.value.smart_compress_conf.status,
      file_types:
        senior.value.smart_compress_conf.file_types.length > 0
          ? senior.value.smart_compress_conf.file_types.split(';')
          : zip.file_default_type.split(';'),
    }
  } else {
    const valid = await zipDom.value?.validate(b => b)
    if (!valid) return
    params = {
      ...zip.form,
      status: +zip.form.status,
      file_types: zip.form.file_types.length > 0 ? zip.form.file_types.split(';') : zip.file_default_type.split(';'),
    }
  }
  zip.loading = true
  return _updateZip({ id: route.query.id, form: params })
    .then(() => {
      getSeniorConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      zip.show = false
      zip.loading = false
    })
}
</script>

<style lang="scss" scoped>
.cdn-domain-detail-senior-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-detail-senior-v2__section {
  padding: 20px;
  background: #fff;
}

.cdn-domain-detail-senior-v2__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cdn-domain-detail-senior-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #191c23;
}

.cdn-domain-detail-senior-v2__desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-detail-senior-v2__action-row,
.cdn-domain-detail-senior-v2__table,
.cdn-domain-detail-senior-v2__switch-row,
.cdn-domain-detail-senior-v2__info-row {
  margin: 16px 0;
}

.cdn-domain-detail-senior-v2__switch-row,
.cdn-domain-detail-senior-v2__info-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cdn-domain-detail-senior-v2__label {
  flex: 0 0 84px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.cdn-domain-detail-senior-v2__content,
.cdn-domain-detail-senior-v2__switch-content {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-domain-detail-senior-v2__link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:disabled {
    color: #bbc0ca;
    cursor: not-allowed;
  }
}

.cdn-domain-detail-senior-v2__table-handle {
  display: flex;
  gap: 16px;
  align-items: center;
}

:deep(.el-switch) {
  --el-switch-on-color: #06f;
  --el-switch-off-color: #bbc0ca;
}

@media (width <= 768px) {
  .cdn-domain-detail-senior-v2__section {
    padding: 16px;
  }

  .cdn-domain-detail-senior-v2__switch-row,
  .cdn-domain-detail-senior-v2__info-row {
    flex-wrap: wrap;
  }

  .cdn-domain-detail-senior-v2__label {
    flex-basis: 100%;
    padding-top: 0;
  }
}
</style>
