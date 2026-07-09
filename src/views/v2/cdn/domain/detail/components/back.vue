<template>
  <div class="cdn-domain-detail-back-v2">
    <section class="cdn-domain-detail-back-v2__section">
      <div class="cdn-domain-detail-back-v2__section-head">
        <h3 class="cdn-domain-detail-back-v2__title">
          {{ t('originPullMode') }}
        </h3>
        <p class="cdn-domain-detail-back-v2__desc">
          {{ t('pullMethodTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-back-v2__info-row">
        <span class="cdn-domain-detail-back-v2__label">{{ t('protocolType') }}</span>
        <div class="cdn-domain-detail-back-v2__content">
          <span>{{ getValueMap(backTypeList, back.protocolConf.protocol) }}</span>
          <button
            class="cdn-domain-detail-back-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="backSourceProtocolHandle"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>
    </section>

    <CatDialog
      v-model:dialog="backSourceProtocol.show"
      title="originPullMode"
      width="550px"
      destroy-on-close
      @confirm="updateBackSourceProtocol"
    >
      <el-form :model="backSourceProtocol.form" label-position="left" label-width="auto">
        <el-form-item :label="t('protocolType')" prop="type">
          <CatRadioGroup v-model="backSourceProtocol.form.protocol" :list="backTypeList" />
        </el-form-item>
      </el-form>
    </CatDialog>

    <section class="cdn-domain-detail-back-v2__section">
      <div class="cdn-domain-detail-back-v2__section-head">
        <h3 class="cdn-domain-detail-back-v2__title">
          {{ t('rangePull') }}
        </h3>
        <p class="cdn-domain-detail-back-v2__desc">
          {{ t('startRangeTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-back-v2__switch-row">
        <span class="cdn-domain-detail-back-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-back-v2__switch-content">
          <el-switch
            v-model="back.range_conf.status"
            :before-change="switchBackRange"
            :loading="backRangeLoading"
            :disabled="isReadOnly"
          />
        </div>
      </div>

      <p class="cdn-domain-detail-back-v2__tip">
        {{ t('startRangeSure') }}
      </p>
    </section>

    <section class="cdn-domain-detail-back-v2__section">
      <div class="cdn-domain-detail-back-v2__section-head">
        <h3 class="cdn-domain-detail-back-v2__title">
          {{ t('httpReqConfig') }}
        </h3>
        <p class="cdn-domain-detail-back-v2__desc">
          {{ t('updatePullReq') }}
        </p>
      </div>

      <div class="cdn-domain-detail-back-v2__action-row">
        <el-button type="primary" :disabled="isReadOnly" @click="httpDialogHandle('add')">
          {{ t('add') }}
        </el-button>
      </div>

      <TableV2 :data="back.http_header_conf.rules" class="cdn-domain-detail-back-v2__table" table-layout="auto">
        <el-table-column prop="operation" :label="t('requestOpe')" min-width="180">
          <template #default="{ row }">
            {{ getValueMap(headOperate, row.operation) }}
          </template>
        </el-table-column>
        <el-table-column prop="header_name" :label="t('requestParam')" min-width="220" />
        <el-table-column prop="header_value" :label="t('requestValue')" min-width="260">
          <template #default="{ row }">
            {{ row.operation === 1 ? row.header_value : '--' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('operation')" min-width="140">
          <template #default="{ row }">
            <div class="cdn-domain-detail-back-v2__table-handle">
              <el-link :disabled="isReadOnly" type="primary" @click="httpDialogHandle('edit', row)">
                {{ t('edit') }}
              </el-link>
              <el-link :disabled="isReadOnly" type="primary" @click="httpDialogDelete(row)">
                {{ t('delete') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CatDialog
      v-model:dialog="httpDialog.showAdd"
      :title="httpDialog.title + 'PullResHead'"
      width="550px"
      destroy-on-close
      @confirm="addHttpRule"
    >
      <el-form ref="httpDom" :model="httpDialog.form" label-position="left" label-width="auto">
        <el-form-item :label="t('statusCode')">
          <CatRadioGroup v-model="httpDialog.form.operation" :list="headOperate" />
        </el-form-item>
        <el-form-item
          :label="t('requestParam')"
          prop="header_name"
          :rules="{
            validator: (_r, v) => /^[0-9a-zA-Z-]{1,64}$/.test(v),
            message: !httpDialog.form.header_name ? '' : t('textLength64Tip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="httpDialog.form.header_name" :placeholder="t('inputRequestParam')" />
        </el-form-item>
        <el-form-item
          v-if="!(httpDialog.form.operation === 2)"
          :label="t('requestValue')"
          prop="header_value"
          :rules="{
            validator: (_r, v) => /^[0-9a-zA-Z-_\\*\\.]{1,1000}$/.test(v),
            message: !httpDialog.form.header_value ? '' : t('textLength1000Tip'),
            trigger: 'change',
          }"
        >
          <el-input v-model="httpDialog.form.header_value" :placeholder="t('inputRequestValue')" />
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="httpDialog.showDelete"
      title="删除回源请求头"
      width="550"
      destroy-on-close
      @confirm="delHttpHeader"
    >
      <div>
        <span>{{ t('willDeletePullRequest') }}</span>
        <el-text type="primary">
          {{ httpDialog.form.header_name }}
        </el-text>
      </div>
      <div class="mt20">
        ·
        <el-text type="primary">
          {{ httpDialog.form.header_name }}
        </el-text>
      </div>
    </CatDialog>

    <section class="cdn-domain-detail-back-v2__section">
      <div class="cdn-domain-detail-back-v2__section-head">
        <h3 class="cdn-domain-detail-back-v2__title">
          {{ t('pullFollow') }}
        </h3>
        <p class="cdn-domain-detail-back-v2__desc">
          {{ t('pullFollowTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-back-v2__switch-row">
        <span class="cdn-domain-detail-back-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-back-v2__switch-content">
          <el-switch
            v-model="back.follow_conf.status"
            :before-change="switchBackFollow"
            :loading="backFllowLoading"
            :disabled="isReadOnly"
          />
        </div>
      </div>
    </section>

    <section class="cdn-domain-detail-back-v2__section">
      <div class="cdn-domain-detail-back-v2__section-head">
        <h3 class="cdn-domain-detail-back-v2__title">
          {{ t('pullTimeout') }}
        </h3>
        <p class="cdn-domain-detail-back-v2__desc">
          {{ t('pullTimeoutTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-back-v2__info-row">
        <span class="cdn-domain-detail-back-v2__label">{{ t('pullTimeout') }}</span>
        <div class="cdn-domain-detail-back-v2__content">
          <span>{{ back.timeout_conf.ttl }}{{ t('second') }}</span>
          <button class="cdn-domain-detail-back-v2__link" type="button" :disabled="isReadOnly" @click="editBackTimeout">
            {{ t('edit') }}
          </button>
        </div>
      </div>
    </section>

    <CatDialog
      v-model:dialog="backTimeout.show"
      title="setPullTimeout"
      width="550"
      destroy-on-close
      @confirm="updateBackTimeout"
    >
      <el-form ref="timeoutDom" :model="backTimeout.form" label-position="left" label-width="auto">
        <el-form-item
          :label="t('pullTimeout')"
          prop="ttl"
          :rules="{
            validator: () => backTimeout.form.ttl >= 5 && backTimeout.form.ttl < 301,
            message: '',
            trigger: 'change',
          }"
        >
          <div class="df ac">
            <el-input v-model.number="backTimeout.form.ttl" />
            <span class="ml14">{{ t('second') }}</span>
          </div>
        </el-form-item>
        <el-form-item label="" style="margin-bottom: 0">
          <el-text type="primary">
            {{ t('pullTimeoutTipDefault') }}
          </el-text>
        </el-form-item>
      </el-form>
    </CatDialog>

    <section class="cdn-domain-detail-back-v2__section">
      <div class="cdn-domain-detail-back-v2__section-head">
        <h3 class="cdn-domain-detail-back-v2__title">
          {{ t('pullURLRewriteConfig') }}
        </h3>
        <p class="cdn-domain-detail-back-v2__desc">
          {{ t('anymoreURLrewrite') }}
        </p>
      </div>

      <div class="cdn-domain-detail-back-v2__action-row">
        <el-button :disabled="isReadOnly" type="primary" @click="URLrewriteHandle">
          {{ t('edit') }}
        </el-button>
      </div>

      <TableV2 :data="URLrewrite.pageChangeTableData" class="cdn-domain-detail-back-v2__table" table-layout="auto">
        <el-table-column prop="mate_type" :label="t('matchType')" min-width="160">
          <template #default="{ row }">
            {{ getValueMap(mateTypeList, row.mate_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="source_url" :label="t('waitPullURI')" min-width="260" />
        <el-table-column prop="target_url" :label="t('targetPullURI')" min-width="260" />
        <el-table-column prop="priority" :label="t('priority')" min-width="120" />
      </TableV2>

      <CatPagination
        v-model:pagination="URLrewrite.pagination"
        :total="URLrewrite.total"
        :custom-keys="['page', 'page_size']"
        @change="changePage"
      />
    </section>

    <CatDialog
      v-model:dialog="URLrewrite.show"
      title="configPullURL"
      width="90%"
      destroy-on-close
      @confirm="updateURLrewrite"
    >
      <CatTip>
        <div>{{ t('pullURITip1') }}</div>
        <div>{{ t('pullURITip2') }}</div>
        <div>{{ t('pullURITip3') }}</div>
        <div>{{ t('pullURITip4') }}</div>
      </CatTip>
      <el-form ref="URLdom" :model="URLrewrite">
        <el-table :data="URLrewrite.tableData" class="mt20" table-layout="auto">
          <el-table-column prop="type" :label="t('matchType')">
            <template #default="{ row }">
              <CatSelect v-model="row.mate_type" :list="mateTypeList" />
            </template>
          </el-table-column>
          <el-table-column prop="source_url" :label="t('waitPullURI')">
            <template #default="{ row }">
              <el-form-item
                prop="source_url"
                :rules="{
                  validator: () => PATH_REG.test(row.source_url) && row.source_url !== row.target_url,
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model="row.source_url"
                  :rule="PATH_REG.test(row.source_url) && row.target_url !== row.source_url"
                  placeholder="filePathTip"
                  :error-text="row.source_url === row.target_url ? 'sourceURIandPullURInotRepeat' : 'filePathErrorTip'"
                  teleported
                  placement="top"
                  @change="URLdom?.clearValidate(['target_url'])"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="target_url" :label="t('targetPullURI')">
            <template #default="{ row }">
              <el-form-item
                prop="target_url"
                :rules="{
                  validator: () => PATH_REG.test(row.target_url) && row.target_url !== row.source_url,
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model="row.target_url"
                  :rule="PATH_REG.test(row.target_url) && row.target_url !== row.source_url"
                  placeholder="filePathTip"
                  :error-text="row.source_url === row.target_url ? 'sourceURIandPullURInotRepeat' : 'filePathErrorTip'"
                  teleported
                  placement="top"
                  @change="URLdom?.clearValidate(['source_url'])"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="priority" :label="t('priority')">
            <template #header>
              <div class="df ac">
                <div>{{ t('priority') }}</div>
                <el-tooltip effect="light" :content="t('priorityHeadTip')" placement="top">
                  <div class="dif ac"><SvgIcon name="cat-cdn-help" class="ml4" />&nbsp;</div>
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row, $index }">
              <el-form-item
                prop="priority"
                :rules="{
                  validator: () =>
                    row.priority > 0 &&
                    row.priority < 101 &&
                    tableColumnNotRepeat(URLrewrite.tableData, row, 'priority', $index),
                  message: '',
                  trigger: 'change',
                }"
              >
                <TipInput
                  v-model.number="row.priority"
                  :rule="row.priority > 0 && row.priority < 101"
                  placeholder="input1-100"
                  :error-text="
                    tableColumnNotRepeat(URLrewrite.tableData, row, 'priority', $index)
                      ? 'priorityHeadTip'
                      : 'priorityRepeat'
                  "
                  teleported
                  placement="top"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column :label="t('operation')">
            <template #default="{ $index }">
              <el-link type="primary" @click="URLrewrite.tableData.splice($index, 1)">
                {{ t('delete') }}
              </el-link>
            </template>
          </el-table-column>
          <template #append>
            <div class="df ac">
              <el-button type="primary" class="mr20" style="width: 100px" @click="addURLrewrite">
                {{ t('add') }}
              </el-button>
              <el-text type="primary" size="small">
                {{ t('addAnyRule1', { num: 20 - URLrewrite.tableData.length }) }}
              </el-text>
            </div>
          </template>
        </el-table>
      </el-form>
    </CatDialog>

    <section class="cdn-domain-detail-back-v2__section">
      <div class="cdn-domain-detail-back-v2__section-head">
        <h3 class="cdn-domain-detail-back-v2__title">
          {{ t('pullSNIconfig') }}
        </h3>
        <p class="cdn-domain-detail-back-v2__desc">
          {{ t('pullSNITip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-back-v2__switch-row">
        <span class="cdn-domain-detail-back-v2__label">{{ t('pullSNI') }}</span>
        <div class="cdn-domain-detail-back-v2__switch-content">
          <el-switch
            v-model="back.sni_conf.status"
            :before-change="switchSNI"
            :loading="sni.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="back.sni_conf.status"
            class="cdn-domain-detail-back-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editSNI"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <div v-if="back.sni_conf.status" class="cdn-domain-detail-back-v2__info-row">
        <span class="cdn-domain-detail-back-v2__label">SNI</span>
        <div class="cdn-domain-detail-back-v2__content">
          {{ back.sni_conf.sni || '--' }}
        </div>
      </div>
    </section>

    <CatDialog v-model:dialog="sni.show" title="pullSNIconfig" width="550" destroy-on-close @confirm="updateSNI">
      <el-form ref="sniDom" :model="sni.form" label-position="left" label-width="auto">
        <el-form-item
          :label="t('pullSNI')"
          prop="sni"
          :rules="{
            validator: () => validDomain(sni.form.sni) && sni.form.sni.length < 75,
            message: !sni.form.sni ? '' : sni.form.sni.length >= 75 ? t('length75') : t('domainError'),
            trigger: 'change',
          }"
        >
          <el-input v-model="sni.form.sni" :placeholder="t('inputSNI')" />
        </el-form-item>
      </el-form>
    </CatDialog>
  </div>
</template>

<script lang="ts" setup>
import { headOperate, mateTypeList, backTypeList } from '@/assets/data/common.js'
import {
  _getBackConfig,
  _updateBackSourceProtocol,
  _updateBackRange,
  _addHttpRule,
  _updateHttpHeader,
  _delHttpHeader,
  _updateBackFollow,
  _updateBackTimeout,
  _updateURLrewrite,
  _updateSNI,
} from '@/apis/cdn/domain'
import { IPv4_REG, PATH_REG } from '@/utils/reg'
import t from '@/utils/i18n'
import { tableColumnNotRepeat, notification, checkWildcardDomain, validIP } from '@/views/cdn/domain/index-domain'
import { getValueMap } from '@/utils/collection-utils'
import { _throttle } from '@/utils/timing-utils'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

import type { BackRewrite, HttpHead, URLrewriteItem, BackSNIConfig } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'

const route: any = useRoute()
const isReadOnly = computed(() => +route.query.status > 2 || route.query.is_lock == 1)
const base_info = ref<any>(null)
base_info.value = JSON.parse(sessionStorage.cdn_domain_details)

const back = ref<{
  protocolConf: {
    protocol: number
  }
  range_conf: {
    status: boolean
  }
  http_header_conf: { rules: HttpHead[] }
  follow_conf: {
    status: boolean
  }
  timeout_conf: { ttl: number }
  url_rewrite_conf: { rules: BackRewrite[] }
  sni_conf: BackSNIConfig
}>({
  protocolConf: { protocol: 0 },
  range_conf: { status: false },
  http_header_conf: { rules: [] },
  follow_conf: { status: false },
  timeout_conf: { ttl: 0 },
  url_rewrite_conf: { rules: [] },
  sni_conf: { status: false, sni: '' },
})
const getBackConfig = async () => {
  await _getBackConfig(route.query.id).then(res => {
    back.value = res.data
    for (const key in back.value) {
      if (back.value[key].hasOwnProperty('status')) {
        back.value[key].status = !!res.data[key].status
      }
    }
    URLrewrite.total = back.value.url_rewrite_conf.rules.length
    URLrewrite.pageChangeTableData = back.value.url_rewrite_conf.rules.slice(0, 10)
  })
}
getBackConfig()

const backSourceProtocol = reactive({
  show: false,
  form: { protocol: 0 },
})
const backSourceProtocolHandle = () => {
  backSourceProtocol.form.protocol = back.value.protocolConf.protocol
  backSourceProtocol.show = true
}
const updateBackSourceProtocol = () => {
  _updateBackSourceProtocol({ id: route.query.id, protocol: backSourceProtocol.form.protocol })
    .then(() => {
      getBackConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      backSourceProtocol.show = false
    })
}

const backRangeLoading = ref(false)
const switchBackRange = _throttle(() => {
  backRangeLoading.value = true
  return _updateBackRange({ id: route.query.id, status: +!back.value.range_conf.status })
    .then(() => {
      getBackConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      backRangeLoading.value = false
    })
}, 2000)

const httpDialog = reactive<{
  showAdd: boolean
  title: 'add' | 'edit'
  rawForm: HttpHead
  form: HttpHead | any
  showDelete: boolean
}>({
  showAdd: false,
  title: 'add',
  showDelete: false,
  rawForm: {
    operation: 1,
    header_name: '',
    header_value: '',
  },
  form: null,
})
const httpDialogHandle = (title: 'edit' | 'add', row?: HttpHead) => {
  httpDialog.form = row ? { ...row } : { ...httpDialog.rawForm }
  httpDialog.title = title
  httpDialog.showAdd = true
}
const httpDialogDelete = (row: HttpHead) => {
  httpDialog.form = { ...row }
  httpDialog.showDelete = true
}
const httpDom = ref<FormInstance | null>(null)
const addHttpRule = async () => {
  const valid = await httpDom.value!.validate(b => b)
  if (!valid) return
  let code
  if (httpDialog.title === 'add') {
    code = await _addHttpRule({ id: route.query.id, form: httpDialog.form }).then(res => res.code)
  } else {
    code = await _updateHttpHeader({ id: route.query.id, form: { rule: httpDialog.form } }).then(res => res.code)
  }
  if (code === 200) {
    await getBackConfig()
    notification({ type: 'success', msg: 'setSuccess' })
  } else {
    notification({ type: 'failed', msg: 'configFailed' })
  }
  httpDialog.showAdd = false
}
const delHttpHeader = async () => {
  _delHttpHeader({ id: route.query.id, rule_id: httpDialog.form.id })
    .then(() => {
      getBackConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      httpDialog.showDelete = false
    })
}

const backFllowLoading = ref(false)
const switchBackFollow = _throttle(() => {
  backFllowLoading.value = true
  return _updateBackFollow({ id: route.query.id, status: +!back.value.follow_conf.status })
    .then(() => {
      getBackConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      backFllowLoading.value = false
    })
}, 2000)

const backTimeout = reactive({
  show: false,
  ttl: 0,
  form: { ttl: 0 },
})
const editBackTimeout = () => {
  backTimeout.form.ttl = back.value.timeout_conf.ttl
  backTimeout.show = true
}
const timeoutDom = ref<FormInstance | null>(null)
const updateBackTimeout = async () => {
  const valid = await timeoutDom.value!.validate(v => v)
  if (!valid) return
  _updateBackTimeout({ id: route.query.id, status: +backTimeout.form.ttl })
    .then(() => {
      getBackConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      backTimeout.show = false
    })
}

const URLrewrite = reactive<{
  show: boolean
  pageChangeTableData: URLrewriteItem[]
  tableData: URLrewriteItem[]
  pagination: { page: number; page_size: number }
  total: number
}>({
  show: false,
  pageChangeTableData: [],
  tableData: [],
  pagination: { page: 1, page_size: 10 },
  total: 0,
})
const URLrewriteHandle = () => {
  URLrewrite.tableData = JSON.parse(JSON.stringify(back.value.url_rewrite_conf.rules))
  URLrewrite.show = true
}
const URLdom = ref<FormInstance | null>(null)
const changePage = (v?) => {
  URLrewrite.pageChangeTableData = back.value.url_rewrite_conf.rules.slice(
    (v.page - 1) * v.page_size,
    v.page_size + (v.page - 1) * v.page_size,
  )
}
const addURLrewrite = () => {
  if (URLrewrite.tableData.length < 20) {
    URLrewrite.tableData.push({
      mate_type: 0,
      source_url: '',
      target_url: '',
      priority: '',
    })
  } else {
    notification({ type: 'failed', msg: 'moreThan20Config' })
  }
}
const updateURLrewrite = async () => {
  const valid = await URLdom.value!.validate(b => b)
  if (!valid) return
  URLrewrite.tableData = URLrewrite.tableData.map(v => ({ ...v, priority: +v.priority }))
  _updateURLrewrite({ id: route.query.id, tableData: URLrewrite.tableData })
    .then(() => {
      getBackConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      URLrewrite.show = false
    })
}

const validDomain = (string: string) => {
  const len = string[0] === '*' ? 3 : 2
  if (string.split('.').length < len) return false
  if (!checkWildcardDomain(string) || IPv4_REG.test(string)) return false
  return true
}
const sni = reactive<{
  show: boolean
  loading: boolean
  form: BackSNIConfig
}>({
  show: false,
  loading: false,
  form: { status: 0, sni: '' },
})
const editSNI = () => {
  sni.form = { ...back.value.sni_conf }
  sni.show = true
}
const sniDom = ref<FormInstance | null>(null)
const switchSNI = _throttle(() => {
  if (!back.value.protocolConf.protocol) {
    notification({ type: 'failed', msg: 'setSNItip' })
    return
  }
  sni.form = { ...back.value.sni_conf }
  if (!back.value.sni_conf.status && !back.value.sni_conf.sni) {
    sni.form.status = true
    sni.show = true
    return
  }
  updateSNI(true)
}, 2000)
const updateSNI = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await sniDom.value!.validate(b => b)
    if (!valid) return
  }
  sni.loading = true
  _updateSNI({
    id: route.query.id,
    form: { ...sni.form, status: isSwitch ? +!sni.form.status : +sni.form.status },
  })
    .then(({ code, msg }) => {
      if (code == 200) {
        getBackConfig()
        notification({ type: 'success', msg: 'setSuccess' })
      } else {
        notification({ type: 'failed', msg: msg || 'configFailed' })
      }
    })
    .finally(() => {
      sni.show = false
      sni.loading = false
    })
}
</script>

<style lang="scss" scoped>
.cdn-domain-detail-back-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-detail-back-v2__section {
  padding: 20px;
  background: #fff;
}

.cdn-domain-detail-back-v2__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cdn-domain-detail-back-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cdn-domain-detail-back-v2__desc,
.cdn-domain-detail-back-v2__tip {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-detail-back-v2__tip {
  margin-top: 8px;
}

.cdn-domain-detail-back-v2__table,
.cdn-domain-detail-back-v2__switch-row,
.cdn-domain-detail-back-v2__info-row,
.cdn-domain-detail-back-v2__info-row + .cdn-domain-detail-back-v2__info-row {
  margin-top: 20px;
}

.cdn-domain-detail-back-v2__action-row {
  margin: 16px 0;
}

.cdn-domain-detail-back-v2__switch-row,
.cdn-domain-detail-back-v2__info-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cdn-domain-detail-back-v2__label {
  flex: 0 0 84px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.cdn-domain-detail-back-v2__content,
.cdn-domain-detail-back-v2__switch-content {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-domain-detail-back-v2__link {
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

.cdn-domain-detail-back-v2__table-handle {
  display: flex;
  gap: 16px;
  align-items: center;
}

:deep(.el-switch) {
  --el-switch-on-color: #06f;
  --el-switch-off-color: #bbc0ca;
}

@media (width <= 768px) {
  .cdn-domain-detail-back-v2__section {
    padding: 16px;
  }

  .cdn-domain-detail-back-v2__switch-row,
  .cdn-domain-detail-back-v2__info-row {
    flex-wrap: wrap;
  }

  .cdn-domain-detail-back-v2__label {
    flex-basis: 100%;
    padding-top: 0;
  }
}
</style>
