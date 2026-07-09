<template>
  <div class="cdn-domain-detail-https-v2">
    <section class="cdn-domain-detail-https-v2__section">
      <div class="cdn-domain-detail-https-v2__section-head">
        <h3 class="cdn-domain-detail-https-v2__title">
          {{ t('httpsConfig') }}
        </h3>
        <p class="cdn-domain-detail-https-v2__desc">
          {{ t('httpsStartTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-https-v2__switch-row">
        <span class="cdn-domain-detail-https-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-https-v2__switch-content">
          <el-switch
            v-model="https.https_conf.status"
            :before-change="switchHttps"
            :loading="cert.loading"
            :disabled="isReadOnly"
          />
        </div>
      </div>

      <div v-if="https.https_conf.status" class="cdn-domain-detail-https-v2__action-row">
        <el-button :disabled="isReadOnly" type="primary" @click="configHttps('config')">
          {{ t('configcert') }}
        </el-button>
      </div>
      <div
        v-if="https.https_conf.certificate.length > 0 && https.https_conf.status"
        class="cdn-domain-detail-https-v2__table"
      >
        <TableV2 :data="https.https_conf.certificate" table-layout="auto">
          <el-table-column prop="create_from" :label="t('certFrom')" min-width="140">
            <template #default="{ row }">
              {{ row.create_from ? t('managedCert') : t('uploadCert') }}
            </template>
          </el-table-column>
          <el-table-column prop="cert_name" :label="t('certName')" min-width="220">
            <template #default="{ row }">
              <div v-if="row.cert_name || row.cert_str_id">
                ID: {{ row.cert_name || '-' }} | {{ row.cert_str_id || '-' }}
              </div>
              <p v-else>-</p>
            </template>
          </el-table-column>
          <el-table-column prop="domain" :label="t('domain')" min-width="160" />
          <el-table-column prop="expire_at" :label="t('expirationTime')" min-width="180">
            <template #default="{ row }">
              {{ getDateDayjs(row.expire_at * 1000, 'string', true) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="t('certStatus')" min-width="140">
            <template #default="{ row }">
              {{ row.status ? t('setSuccess') : t('configFailed') }}
            </template>
          </el-table-column>
          <el-table-column :label="t('operation')" min-width="140">
            <template #default="{ row }">
              <div class="cdn-domain-detail-https-v2__table-handle">
                <el-link :disabled="isReadOnly" type="primary" @click="configHttps('edit', row)">
                  {{ t('edit') }}
                </el-link>
                <el-link :disabled="isReadOnly" type="primary" @click="delSSLcertDialog = true">
                  {{ t('delete') }}
                </el-link>
              </div>
            </template>
          </el-table-column>
        </TableV2>
      </div>
    </section>

    <CertificateDialog ref="httpsDom" :title="cert.title" :form="cert.form!" type="config" @sure="updateHttps" />

    <CatDialog
      v-model:dialog="delSSLcertDialog"
      title="deleteCert"
      width="780px"
      destroy-on-close
      @confirm="delSSLcert"
    >
      <div>{{ t('deleteCertTip1') }}</div>
    </CatDialog>

    <section class="cdn-domain-detail-https-v2__section">
      <div class="cdn-domain-detail-https-v2__section-head">
        <h3 class="cdn-domain-detail-https-v2__title">
          {{ t('http20') }}
        </h3>
        <p class="cdn-domain-detail-https-v2__desc">
          {{ t('httpsStartTip1') }}
        </p>
      </div>

      <div class="cdn-domain-detail-https-v2__switch-row">
        <span class="cdn-domain-detail-https-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-https-v2__switch-content">
          <el-switch
            v-model="https.http20_conf.status"
            :before-change="updateHttp20"
            :loading="http20Loading"
            :disabled="isReadOnly"
          />
        </div>
      </div>
    </section>

    <section class="cdn-domain-detail-https-v2__section">
      <div class="cdn-domain-detail-https-v2__section-head">
        <h3 class="cdn-domain-detail-https-v2__title">
          {{ t('forceJump') }}
        </h3>
        <p class="cdn-domain-detail-https-v2__desc">
          {{ t('httpsOrhttpTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-https-v2__switch-row">
        <span class="cdn-domain-detail-https-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-https-v2__switch-content">
          <el-switch
            v-model="https.force_redirect_conf.status"
            :before-change="switchForce"
            :loading="force.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="https.force_redirect_conf.status"
            class="cdn-domain-detail-https-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editForce"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <template v-if="https.force_redirect_conf.status">
        <div class="cdn-domain-detail-https-v2__info-row">
          <span class="cdn-domain-detail-https-v2__label">{{ t('jumpType') }}</span>
          <div class="cdn-domain-detail-https-v2__content">
            {{ getValueMap(redirectTypeList, https.force_redirect_conf.redirect_type) }}
          </div>
        </div>
        <div class="cdn-domain-detail-https-v2__info-row">
          <span class="cdn-domain-detail-https-v2__label">{{ t('jumpMethod') }}</span>
          <div class="cdn-domain-detail-https-v2__content">
            {{ https.force_redirect_conf.redriect_code }}
          </div>
        </div>
      </template>
    </section>

    <CatDialog v-model:dialog="force.show" title="forceJump" width="780px" destroy-on-close @confirm="updateForce">
      <el-form :model="force.form" label-position="left" label-width="auto">
        <el-form-item :label="t('jumpType')">
          <CatSelect v-model="force.form.redirect_type" :list="redirectTypeList" />
        </el-form-item>
        <el-form-item :label="t('jumpMethod')">
          <CatSelect v-model="force.form.redriect_code" :list="redriectCodeList" />
        </el-form-item>
      </el-form>
    </CatDialog>

    <section class="cdn-domain-detail-https-v2__section">
      <div class="cdn-domain-detail-https-v2__section-head">
        <h3 class="cdn-domain-detail-https-v2__title">
          {{ t('hstsConfig') }}
        </h3>
        <p class="cdn-domain-detail-https-v2__desc">
          {{ t('hstsTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-https-v2__switch-row">
        <span class="cdn-domain-detail-https-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-https-v2__switch-content">
          <el-switch
            v-model="https.hsts_conf.status"
            :before-change="switchHSTS"
            :loading="hsts.loading"
            :disabled="isReadOnly"
          />
          <button
            v-if="https.hsts_conf.status"
            class="cdn-domain-detail-https-v2__link"
            type="button"
            :disabled="isReadOnly"
            @click="editHSTS"
          >
            {{ t('edit') }}
          </button>
        </div>
      </div>

      <template v-if="https.hsts_conf.status">
        <div class="cdn-domain-detail-https-v2__info-row">
          <span class="cdn-domain-detail-https-v2__label">{{ t('expireTime1') }}</span>
          <div class="cdn-domain-detail-https-v2__content">{{ https.hsts_conf.ttl }}{{ t('second') }}</div>
        </div>
        <div class="cdn-domain-detail-https-v2__info-row">
          <span class="cdn-domain-detail-https-v2__label">{{ t('includeChildDomain') }}</span>
          <div class="cdn-domain-detail-https-v2__content">
            {{ https.hsts_conf.include_sub_domain_name ? t('include') : t('notInclude') }}
          </div>
        </div>
      </template>
    </section>

    <CatDialog v-model:dialog="hsts.show" title="hstsConfig" width="780px" destroy-on-close @confirm="updateHSTS">
      <CatTip>{{ t('startHSTStip') }}</CatTip>
      <el-form ref="hstsDom" :model="hsts.form" label-width="auto" label-position="left" class="mt20">
        <el-form-item
          :label="t('expireTime1')"
          prop="ttl"
          :rules="{
            validator: (_r, v) => (v === 0 || v > 0) && v <= '63072000',
            message: '',
            trigger: 'change',
          }"
          style="margin-bottom: 0"
        >
          <div class="df ac">
            <el-input
              v-model.number="hsts.form.ttl"
              :min="0"
              :max="63072000"
              step="1"
              :placeholder="t('inputCacheTime')"
            />
            <div class="ml14">
              {{ t('second') }}
            </div>
          </div>
        </el-form-item>
        <el-form-item label=" ">
          <div class="form-tip">
            {{ t('hstsTime') }}
          </div>
        </el-form-item>
        <el-form-item :label="t('includeChildDomain')">
          <CatRadioGroup
            v-model="hsts.form.include_sub_domain_name"
            :list="[
              { label: t('notInclude'), value: 0 },
              { label: t('include'), value: 1 },
            ]"
          />
        </el-form-item>
      </el-form>
    </CatDialog>

    <section class="cdn-domain-detail-https-v2__section">
      <div class="cdn-domain-detail-https-v2__section-head">
        <h3 class="cdn-domain-detail-https-v2__title">
          {{ t('tlsVersion') }}
        </h3>
        <p class="cdn-domain-detail-https-v2__desc">
          {{ t('tlsTip') }}
        </p>
      </div>

      <div class="cdn-domain-detail-https-v2__action-row">
        <el-button :disabled="isReadOnly" type="primary" @click="configTLS">
          {{ t('modifyConfig') }}
        </el-button>
      </div>

      <div class="cdn-domain-detail-https-v2__tls-list">
        <div
          v-for="(tls_v1, tls_key1) in https.tls_conf"
          :key="'tls_v1' + tls_key1"
          class="cdn-domain-detail-https-v2__tls-item"
        >
          <span>TLS 1.{{ tls_key1.slice(2) }}</span>
          <el-text type="primary">
            {{ tls_v1 ? t('opened') : t('closed') }}
          </el-text>
        </div>
      </div>
    </section>

    <CatDialog v-model:dialog="tls.show" title="modifyTLSconfig" width="780px" destroy-on-close @confirm="updateTLS">
      <CatTip>{{ t('tlsDialogTip') }}</CatTip>
      <div class="df ac mt20">
        <div>{{ t('chooseOpenVersion') }}</div>
        <div class="df ac ml20">
          <el-checkbox v-model="tls.form.v10" label="TLS 1.0" class="mr20" />
          <el-checkbox v-model="tls.form.v11" label="TLS 1.1" class="mr20" />
          <el-checkbox v-model="tls.form.v12" label="TLS 1.2" class="mr20" />
          <el-checkbox v-model="tls.form.v13" label="TLS 1.3" class="mr20" />
        </div>
      </div>
    </CatDialog>

    <section class="cdn-domain-detail-https-v2__section">
      <div class="cdn-domain-detail-https-v2__section-head">
        <h3 class="cdn-domain-detail-https-v2__title">
          {{ t('ocspConfig') }}
        </h3>
        <p class="cdn-domain-detail-https-v2__desc">
          {{ t('httpsStartTip1') }}
        </p>
      </div>

      <div class="cdn-domain-detail-https-v2__switch-row">
        <span class="cdn-domain-detail-https-v2__label">{{ t('configStatus') }}</span>
        <div class="cdn-domain-detail-https-v2__switch-content">
          <el-switch
            v-model="https.ocsp_conf.status"
            :before-change="switchOCSP"
            :loading="ocspLoading"
            :disabled="isReadOnly"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { redirectTypeList, redriectCodeList } from '@/assets/data/common.js'
import CertificateDialog from '@/components/cdn/certificate-dialog/index.vue'
import { notification } from '@/views/cdn/domain/index-domain'
import { getDateDayjs } from '@/utils/format-time'
import { getValueMap } from '@/utils/collection-utils'
import { _throttle } from '@/utils/timing-utils'
import {
  _getHttpsConfig,
  _updateHttps,
  _updateHttp20,
  _updateForceDirect,
  _updateHSTS,
  _updateOCSP,
  _updateTLS,
} from '@/apis/cdn/domain'
import { _delSSLcert } from '@/apis/cdn/certificate'
import t from '@/utils/i18n'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

import type { CertificateUpload, CertTableItem, ForceRedirect, HSTSconfig, TLSconfig } from '@/views/cdn/common'
import type { FormInstance } from 'element-plus/es'

const route: any = useRoute()
const isReadOnly = computed(() => +route.query.status > 2 || route.query.is_lock == 1)

const https = ref<{
  https_conf: {
    status: boolean
    certificate: CertTableItem[]
  }
  http20_conf: {
    status: boolean
  }
  force_redirect_conf: ForceRedirect
  hsts_conf: HSTSconfig
  tls_conf: TLSconfig
  ocsp_conf: {
    status: boolean
  }
}>({
  https_conf: {
    status: false,
    certificate: [],
  },
  http20_conf: {
    status: false,
  },
  force_redirect_conf: {
    status: false,
    redirect_type: 0,
    redriect_code: 0,
  },
  hsts_conf: {
    status: false,
    ttl: 10,
    include_sub_domain_name: 0,
  },
  tls_conf: {
    v10: false,
    v11: false,
    v12: false,
    v13: false,
  },
  ocsp_conf: {
    status: false,
  },
})
const getHttpsConfig = async () => {
  await _getHttpsConfig(route.query.id).then(res => {
    https.value = res.data
    for (const key in https.value) {
      if (https.value[key].hasOwnProperty('status')) {
        https.value[key].status = !!res.data[key].status
      }
    }
    https.value.https_conf.certificate = res.data.https_conf.certificate ? [res.data.https_conf.certificate] : []
  })
}
getHttpsConfig()

const cert = reactive<{
  title: string
  loading: boolean
  form: CertificateUpload | null
  rawForm: CertificateUpload
  new_certificate: CertificateUpload | null
}>({
  title: 'config',
  loading: false,
  form: null,
  rawForm: {
    domain_id: '',
    create_from: 0,
    cert_name: '',
    uploadType: 0,
    content: '',
    private_key: '',
  },
  new_certificate: null,
})
const httpsDom = ref<any>(null)
const switchHttps = _throttle(() => {
  cert.form = { ...cert.rawForm }
  if (!https.value.https_conf.status && !https.value.https_conf.certificate.length) {
    httpsDom.value.show = true
    return
  }
  const params: any = {
    status: +!https.value.https_conf.status,
  }
  if (https.value.https_conf.certificate[0]) {
    params.certificate_id = https.value.https_conf.certificate[0].cert_id
  } else {
    params.new_certificate = null
  }
  cert.loading = true
  return _updateHttps({ id: route.query.id, form: params })
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      cert.loading = false
    })
}, 2000)
const updateHttps = form => {
  cert.new_certificate = { ...form }
  const params: any = {
    status: 1,
  }
  if (form.id) {
    params.certificate_id = form.id
  } else {
    params.new_certificate = {
      name: form.cert_name,
      content: form.content_text,
      private_key: form.private_key_text,
    }
  }
  _updateHttps({ id: route.query.id, form: params })
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      httpsDom.value.show = false
    })
}
const configHttps = (title: string, row?: CertificateUpload) => {
  if (row) {
    cert.form = { ...row, uploadType: 0 }
  } else {
    cert.form = { ...cert.rawForm, cert_id: https.value.https_conf?.certificate?.[0]?.cert_id } as any
  }
  cert.title = title
  httpsDom.value.show = true
}
const delSSLcertDialog = ref(false)
const delSSLcert = () => {
  _delSSLcert(+route.query.id!)
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      delSSLcertDialog.value = false
    })
}

const http20Loading = ref(false)
const updateHttp20 = _throttle(() => {
  if (!https.value.https_conf.status) {
    notification({ type: 'failed', msg: 'shouldToEnableHttpsTip' })
    return
  }
  http20Loading.value = true
  return _updateHttp20({ id: route.query.id, status: +!https.value.http20_conf.status })
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      http20Loading.value = false
    })
}, 2000)

const force = reactive<{
  show: boolean
  loading: boolean
  form: ForceRedirect
}>({
  show: false,
  loading: false,
  form: {
    status: false,
    redirect_type: 1,
    redriect_code: 301,
  },
})
const editForce = () => {
  force.form = { ...https.value.force_redirect_conf }
  force.show = true
}
const switchForce = _throttle(() => {
  if (!https.value.https_conf.status) {
    notification({ type: 'failed', msg: 'shouldToEnableHttpsTip' })
    return
  }
  updateForce(true)
}, 2000)
const updateForce = (isSwitch = false) => {
  let params
  if (isSwitch) {
    params = https.value.force_redirect_conf
  } else {
    params = force.form
  }
  params.status = isSwitch ? +!params.status : +params.status
  force.loading = true
  return _updateForceDirect({ id: route.query.id, form: params })
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      force.show = false
      force.loading = false
    })
}

const hsts = reactive<{
  show: boolean
  loading: boolean
  form: HSTSconfig
}>({
  show: false,
  loading: false,
  form: {
    status: 0,
    ttl: 0,
    include_sub_domain_name: 0,
  },
})
const editHSTS = () => {
  hsts.form = { ...https.value.hsts_conf }
  hsts.show = true
}
const hstsDom = ref<FormInstance | null>(null)
const switchHSTS = _throttle(() => {
  if (!https.value.https_conf.status) {
    notification({ type: 'failed', msg: 'shouldToEnableHttpsTip' })
    return
  }
  updateHSTS(true)
}, 2000)
const updateHSTS = async (isSwitch = false) => {
  if (!isSwitch) {
    const valid = await hstsDom.value!.validate(b => b)
    if (!valid) return
  }
  let params
  if (isSwitch) {
    params = https.value.hsts_conf
  } else {
    params = hsts.form
  }
  params.status = isSwitch ? +!params.status : +params.status
  hsts.loading = true
  return _updateHSTS({ id: route.query.id, form: params })
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      hsts.loading = false
      hsts.show = false
    })
}

const tls = reactive<{
  show: boolean
  form: TLSconfig
}>({
  show: false,
  form: {
    v10: false,
    v11: false,
    v12: false,
    v13: false,
  },
})
const configTLS = _throttle(() => {
  if (!https.value.https_conf.status) {
    notification({ type: 'failed', msg: 'shouldToEnableHttpsTip' })
    return
  }
  tls.form = { ...https.value.tls_conf }
  tls.show = true
}, 2000)
const checkTLS = (arr: boolean[]) => {
  if (arr.every(val => val === false)) return false
  if (arr.every(val => val === true)) return true
  const firstTrue = arr.indexOf(true)
  const lastTrue = arr.lastIndexOf(true)
  for (let i = firstTrue; i <= lastTrue; i++) {
    if (arr[i] === false) return false
  }
  return true
}
const updateTLS = async () => {
  const arr: boolean[] = []
  for (const key in tls.form) {
    arr.push(tls.form[key])
  }
  if (!checkTLS(arr)) {
    notification({ type: 'failed', msg: 'tlsTip' })
    return
  }
  _updateTLS({ id: route.query.id, form: tls.form })
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      tls.show = false
    })
}

const ocspLoading = ref(false)
const switchOCSP = _throttle(() => {
  if (!https.value.https_conf.status) {
    notification({ type: 'failed', msg: 'shouldToEnableHttpsTip' })
    return
  }
  ocspLoading.value = true
  return _updateOCSP({ id: route.query.id, status: +!https.value.ocsp_conf.status })
    .then(() => {
      getHttpsConfig()
      notification({ type: 'success', msg: 'setSuccess' })
    })
    .finally(() => {
      ocspLoading.value = false
    })
}, 2000)
</script>

<style lang="scss" scoped>
.cdn-domain-detail-https-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-detail-https-v2__section {
  padding: 20px;
  background: #fff;
}

.cdn-domain-detail-https-v2__section-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cdn-domain-detail-https-v2__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cdn-domain-detail-https-v2__desc {
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cdn-domain-detail-https-v2__action-row,
.cdn-domain-detail-https-v2__table,
.cdn-domain-detail-https-v2__switch-row,
.cdn-domain-detail-https-v2__info-row {
  margin-top: 20px;
}

.cdn-domain-detail-https-v2__switch-row,
.cdn-domain-detail-https-v2__info-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cdn-domain-detail-https-v2__label {
  flex: 0 0 84px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
  white-space: nowrap;
}

.cdn-domain-detail-https-v2__content,
.cdn-domain-detail-https-v2__switch-content {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-domain-detail-https-v2__link {
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

.cdn-domain-detail-https-v2__table-handle {
  display: flex;
  gap: 16px;
  align-items: center;
}

.cdn-domain-detail-https-v2__tls-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-top: 20px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.cdn-domain-detail-https-v2__tls-item {
  display: inline-flex;
  gap: 16px;
  align-items: center;
}

:deep(.el-switch) {
  --el-switch-on-color: #06f;
  --el-switch-off-color: #bbc0ca;
}

@media (width <= 768px) {
  .cdn-domain-detail-https-v2__section {
    padding: 16px;
  }

  .cdn-domain-detail-https-v2__switch-row,
  .cdn-domain-detail-https-v2__info-row {
    flex-wrap: wrap;
  }

  .cdn-domain-detail-https-v2__label {
    flex-basis: 100%;
    padding-top: 0;
  }
}
</style>
