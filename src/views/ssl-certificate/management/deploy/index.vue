<template>
  <el-card class="page-container" shadow="never">
    <p class="title">
      {{ t('ssl-certificate.management.deploy.835774-0') }}
    </p>
    <el-form ref="formRef" :model="form" :rules="formRules" label-position="left" label-width="auto" class="ssl-form">
      <el-form-item :label="t('ssl-certificate.management.deploy.835774-1')">
        {{ query.cert_id }}
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.deploy.835774-2')" prop="name">
        {{ filterArray(CERTIFICATE_TYPES_MAP, 'id', query.cert_type)?.fullName }}
        {{ filterArray(CERT_DOMAIN_TYPES_MAP, 'id', cert_domain_type)?.name }}
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.deploy.835774-3')" prop="content">
        {{ query.domain }}
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.deploy.835774-4')" prop="key" style="margin-bottom: 12px">
        <el-radio-group v-model="form.deploy_type">
          <el-radio :label="1">
            {{ t('ssl-certificate.management.deploy.835774-5') }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('ssl-certificate.management.deploy.835774-6')">
        <p class="mb10" style="margin-top: 1px; color: #999">
          <span style="margin-right: 5px; color: #000">{{ t('ssl-certificate.management.deploy.835774-7') }}</span
          >{{ t('ssl-certificate.management.deploy.835774-8') }}
        </p>
        <div v-loading="domainListStore.loading" class="df jsb domain-container">
          <div class="left mr20">
            <el-input v-model="domainListStore.query" :placeholder="t('ssl-certificate.management.deploy.835774-9')" />
            <el-table
              :data="filterAvailableDomain"
              show-overflow-tooltip
              :loading="domainListStore.loading"
              max-height="330px"
              table-layout="auto"
              class="mt10"
              style="height: 330px; border: 1px solid #ddd"
            >
              <el-table-column prop="domain" :label="t('ssl-certificate.management.deploy.835774-10')">
                <template #header>
                  <div class="df ac">
                    <el-checkbox v-model="domainListStore.allCheck" style="margin-right: 10px" @change="allCheck" />
                    {{ t('ssl-certificate.management.deploy.835774-10') }}
                  </div>
                </template>
                <template #default="{ row }">
                  <div class="df ac">
                    <el-checkbox
                      v-model="row.check"
                      style="margin-right: 10px"
                      :disabled="row.status == 2"
                      @change="rowCheck"
                    />
                    {{ row.domain }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="cert_id" :label="t('ssl-certificate.management.deploy.835774-11')">
                <template #default="{ row }">
                  <span v-if="row.cid != -1"
                    >ID: {{ row.cid != -1 ? row.cert_id : '-' }} | {{ row.remark || 'undefined' }}</span
                  >
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" :label="t('ssl-certificate.management.deploy.835774-12')">
                <template #default="{ row }">
                  {{
                    [
                      '-',
                      t('ssl-certificate.management.deploy.835774-13'),
                      t('ssl-certificate.management.deploy.835774-14'),
                    ][row.status]
                  }}
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="right">
            <el-table
              :data="domainListStore.data.filter(v => v.check)"
              show-overflow-tooltip
              max-height="374"
              table-layout="auto"
              style="height: 374px; border: 1px solid #ddd"
            >
              <el-table-column prop="domain" :label="t('ssl-certificate.management.deploy.835774-10')" />
              <el-table-column prop="cert_id" :label="t('ssl-certificate.management.deploy.835774-11')">
                <template #default="{ row }">
                  <span v-if="row.cid != -1"
                    >ID: {{ row.cid != -1 ? row.cert_id : '-' }} | {{ row.remark || 'undefined' }}</span
                  >
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" :label="t('ssl-certificate.management.deploy.835774-12')">
                <template #default="{ row }">
                  {{
                    [
                      '-',
                      t('ssl-certificate.management.deploy.835774-13'),
                      t('ssl-certificate.management.deploy.835774-14'),
                    ][row.status]
                  }}
                </template>
              </el-table-column>
              <el-table-column prop="" label="" width="50">
                <template #default="{ row }">
                  <SvgIcon name="cat-cdn-delete" class="icon-hover" @click="deleteDomainHandle(row.domain)" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-form-item>
      <el-divider style="border-color: #eee" />
      <el-form-item>
        <el-button style="min-width: 75px" :loading="deployLoading" type="primary" @click="onSubmit">
          {{ t('ssl-certificate.management.deploy.835774-15') }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _deployCert, _getAvailableDomains } from '@/apis/ssl-certificate/management'
import { AvailableDomainsListResp } from '@/apis/ssl-certificate/management/type'
import { message } from '@/utils/message'
import { filterArray } from '@/utils/filter'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import type { FormInstance, FormRules } from 'element-plus/es'
import { SSL_CERTIFICATE_CERT_DOMAIN_TYPE, SSL_CERTIFICATE_DETAILS_TAB } from '../config'
import { CERT_DOMAIN_TYPES_MAP, CERTIFICATE_TYPES_MAP } from '../../config'
import { replaceRoute } from '@/utils/router-jump'

const router = useRouter()
const route = useRoute()
const query = route.query as unknown as { cert_id?: string; id?: string; domain?: string; cert_type?: number }
const cert_domain_type = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE)
/// props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

/// 实例表格
const domainListStore = reactive<{
  show: boolean
  query: string
  loading: boolean
  allCheck: boolean
  data: AvailableDomainsListResp['items']
}>({
  show: false,
  query: '',
  loading: false,
  allCheck: false,
  data: [],
})
// 搜索
const filterAvailableDomain = computed(() => domainListStore.data.filter(v => v.domain.includes(domainListStore.query)))
//
const getAvailableDomains = async () => {
  try {
    domainListStore.loading = true

    const { code, msg, data } = await _getAvailableDomains({
      cert_id: props.id,
    })
    if (code === 200 && data) {
      domainListStore.data = data.items
    } else {
      message.error(msg || t('ssl-certificate.management.deploy.835774-16'))
    }
  } finally {
    domainListStore.loading = false
  }
}
onMounted(() => {
  getAvailableDomains()
})

// 已选择的实例
const selectCertificateData = computed(() => domainListStore.data.filter(v => v.check))

const allCheck = bool => {
  filterAvailableDomain.value?.forEach(v => (v.status == 1 ? (v.check = bool) : ''))
}
const rowCheck = () => {
  domainListStore.allCheck = domainListStore.data.every(v => v.check)
}
const deleteDomainHandle = domain => {
  domainListStore.data.forEach(v => {
    if (v.domain === domain) {
      v.check = false
    }
  })
  domainListStore.allCheck = false
}

/// form data
const formRef = ref<FormInstance>()
const form = reactive({
  deploy_type: 1,
})
const deployLoading = ref(false)
const formRules: FormRules<typeof form> = {}
const onSubmit = async () => {
  // 部署证书
  if (!selectCertificateData.value.length) {
    message.error(t('ssl-certificate.management.deploy.835774-17'))
    return
  }
  if (!query.id || !query.cert_id) {
    message.error('error')
    return
  }

  try {
    deployLoading.value = true
    const { code, msg, data } = await _deployCert({
      new_cert_id: query.cert_id,
      new_cid: Number(query.id),
      deploy_items: selectCertificateData.value.map(v => ({
        cid: v.cid,
        domain: v.domain,
        cert_id: v.cert_id,
      })),
      deploy_type: form.deploy_type,
    })
    if (code === 200 && data) {
      message.success(t('ssl-certificate.management.deploy.835774-18'))
      _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '1')
      replaceRoute({
        name: 'ssl_certificate_details',
        params: {
          id: props.id,
        },
        query: query,
      })
    } else {
      message.error(msg || t('ssl-certificate.management.deploy.835774-19'))
    }
  } finally {
    deployLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.title {
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: bold;
  color: #000;
}

.domain-container {
  .left,
  .right {
    flex: 1 1 0;
    width: 0;
  }
}
</style>
