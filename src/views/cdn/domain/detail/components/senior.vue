<template>
  <div class="senior">
    <div class="page-box">
      <div class="head">
        {{ t('customErrorPageConfig') }}
      </div>
      <div class="tip mt20">
        {{ t('customErrorTip') }}
      </div>
      <div class="mt20">
        <el-button
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          type="primary"
          @click="editErrorRule('add')"
        >
          {{ t('add') }}
        </el-button>
      </div>
      <el-table :data="senior.error_page_conf.rules" class="mt20" table-layout="auto">
        <el-table-column prop="error_code" :label="t('statusCode')" />
        <el-table-column prop="redirect_code" :label="t('redirect')" />
        <el-table-column prop="redirect_to" :label="t('targetAddress')" />
        <el-table-column :label="t('operation')">
          <template #default="{ row }">
            <div class="table-handle">
              <el-link
                :disabled="+route.query.status > 2 || route.query.is_lock == 1"
                type="primary"
                @click="editErrorRule('edit', row)"
              >
                {{ t('edit') }}
              </el-link>
              <el-link
                :disabled="+route.query.status > 2 || route.query.is_lock == 1"
                type="primary"
                @click="delErrorRule(row)"
              >
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
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

    <div class="page-box mt20">
      <div class="head">
        {{ t('httpResConfig') }}
      </div>
      <div class="tip mt20">
        {{ t('httpResTip') }}
      </div>
      <div class="mt20">
        <el-button
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          type="primary"
          @click="editHttpResponse"
        >
          {{ t('edit') }}
        </el-button>
      </div>
      <el-table :data="senior.response_header_conf.rules" class="mt20" table-layout="auto">
        <el-table-column :label="t('responseOpe')">
          <template #default="{ row }">
            {{ getValueMap(headOperate, row.operation) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('params')" prop="header_name" />
        <el-table-column :label="t('value')" prop="header_value">
          <template #default="{ row }">
            {{ row.header_value || '--' }}
          </template>
        </el-table-column>
      </el-table>
    </div>
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
            <template #default="{ row, $index }">
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

    <div class="page-box mt20">
      <div class="head">
        {{ t('intelligentCompression') }}
      </div>
      <div class="tip mt20">
        {{ t('compressionZIPtip') }}
      </div>
      <div class="mt20 df ac">
        <div class="label">
          {{ t('configStatus') }}
        </div>
        <el-switch
          v-model="senior.smart_compress_conf.status"
          :before-change="switchZIP"
          :loading="zip.loading"
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          class="mr14"
        />
        <el-link
          v-show="senior.smart_compress_conf.status"
          :disabled="+route.query.status > 2 || route.query.is_lock == 1"
          type="primary"
          @click="editZIP"
        >
          {{ t('edit') }}
        </el-link>
      </div>
      <div v-if="senior.smart_compress_conf.status">
        <div class="df ac mt20">
          <div class="label">
            {{ t('compressionType') }}
          </div>
          <div>
            {{ getValueMap(zipList, senior.smart_compress_conf.algorithm) }}
          </div>
        </div>
        <div class="df ac mt20">
          <div class="label">
            {{ t('compressionMethod') }}
          </div>
          <div>{{ senior.smart_compress_conf.file_types || zip.file_default_type }}</div>
        </div>
      </div>
    </div>
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
            <!-- <TipInput v-model="zip.form.file_types" :rule="validateType(zip.form.file_types)" errorText="compressionErrorTip" allowEmpty /> -->
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

import type { ErrorTableItem, HttpHead, ZIPconfig } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'

const route: any = useRoute()

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
  let arr = statusCode.map((vv: any, ii) => {
    if (senior.value.error_page_conf.rules.some(v => v.error_code == vv.value)) {
      vv.disabled = true
    } else {
      vv.disabled = false
    }
    return vv
  })
  return arr
})
const seniorValidHttpUrl = v => {
  // 不能包含中文
  return validHttpUrl(v) && !/[\u4e00-\u9fa5]/.test(v)
}
const editErrorRule = (title: string, row?: ErrorTableItem) => {
  if (row) {
    error.form = { ...row }
  } else {
    error.form = { ...error.rawForm }
  }
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
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
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
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      response.show = false
    })
}
const getPlaceholder = head => {
  if (head === 'Access-Control-Allow-Origin') {
    return 'inputAllowOrigin'
  } else if (head === 'Access-Control-Allow-Methods') {
    return 'inputAllowMethod'
  } else if (head === 'Access-Control-Max-Age') {
    return 'inputAllowMaxTime'
  } else if (head === 'Access-Control-Expose-Headers') {
    return 'inputAllowExpose'
  } else if (head === 'Content-Disposition') {
    return 'inputAllowDisposition'
  } else if (head === 'Content-Language') {
    return 'inputAllowLang'
  }
}
const getHttpHeaderTip = head => {
  if (head === 'Access-Control-Allow-Origin') {
    return 'allowOriginTip'
  } else if (head === 'Access-Control-Max-Age') {
    return 'allowMaxTimeTip'
  } else if (head === 'Access-Control-Expose-Headers') {
    return 'allowExposeTip'
  } else if (head === '') {
    return 'allowCustomTip'
  } else {
    return 'formatErrorTip'
  }
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
    .catch(() => {
      // notification({ type: 'failed', msg: 'configFailed' })
    })
    .finally(() => {
      zip.show = false
      zip.loading = false
    })
}
</script>

<style lang="scss" scoped>
@import '../../index-domain';
</style>
