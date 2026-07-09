<template>
  <div class="ssl-update-v2">
    <PageToolbar :title="pageTitle" :show-doc="false" />

    <section class="ssl-update-v2__panel">
      <el-form
        ref="formRef"
        :model="formStore"
        :rules="formRules"
        label-position="left"
        label-width="134px"
        class="ssl-update-v2__form"
      >
        <el-form-item
          :label="t('ssl-certificate.management.update.124800-0')"
          prop="is_notify"
          class="ssl-update-v2__item ssl-update-v2__item--notify"
        >
          <div>
            <el-radio-group v-model="formStore.is_notify">
              <el-radio :label="1">
                {{ t('ssl-certificate.management.update.124800-1') }}
              </el-radio>
              <el-radio :label="2">
                {{ t('ssl-certificate.management.update.124800-2') }}
              </el-radio>
            </el-radio-group>
            <p class="ssl-update-v2__hint">
              {{ t('ssl-certificate.management.update.124800-3') }}{{ query.cert_id
              }}{{ t('ssl-certificate.management.update.124800-4') }}
            </p>
          </div>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.update.124800-5')"
          prop="source"
          class="ssl-update-v2__item"
        >
          <el-radio-group v-model="source" @change="handleSourceTypeChange">
            <el-radio :label="1">
              {{ t('ssl-certificate.management.update.124800-6') }}
            </el-radio>
            <el-radio :label="2">
              {{ t('ssl-certificate.management.update.124800-7') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.update.124800-8')"
          prop="new_cert_id"
          class="ssl-update-v2__item"
        >
          <el-select
            v-model="formStore.new_cert_id"
            filterable
            :loading="updateCertStore.loading"
            class="ssl-update-v2__control"
            @change="handleUpdateCertChange"
          >
            <el-option
              v-for="cert in updateCertStore.data"
              :key="cert.cert_id"
              :label="`${cert.cert_id} | ${cert.domain}`"
              :value="cert.cert_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.update.124800-9')"
          class="ssl-update-v2__item ssl-update-v2__item--resource"
        >
          <div class="ssl-update-v2__resource">
            <p class="ssl-update-v2__resource-tip">
              {{ t('ssl-certificate.management.update.124800-10') }}
              <span class="ssl-update-v2__link" @click="handleDeploy">
                {{ t('ssl-certificate.management.update.124800-11') }}
              </span>
            </p>

            <el-select v-model="formStore.update_type" class="ssl-update-v2__control">
              <el-option :label="t('ssl-certificate.management.update.124800-12')" :value="1" />
            </el-select>

            <div v-loading="oldDomainStore.loading" class="ssl-update-v2__tables">
              <div class="ssl-update-v2__table-pane">
                <el-input
                  v-model="oldDomainStore.query"
                  :placeholder="t('ssl-certificate.management.update.124800-13')"
                  class="ssl-update-v2__search"
                />
                <TableV2
                  :data="filterAvailableDomain"
                  class="ssl-update-v2__table"
                  empty-text="暂无数据"
                  table-layout="fixed"
                >
                  <el-table-column width="52">
                    <template #header>
                      <el-checkbox v-model="oldDomainStore.allCheck" @change="allCheck" />
                    </template>
                    <template #default="{ row }">
                      <el-checkbox
                        v-model="row.check"
                        :disabled="row.status == 2 || row.disableUpdate == DisableUpdateDomain.DISABLED"
                        @change="rowCheck"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="domain"
                    :label="t('ssl-certificate.management.update.124800-14')"
                    min-width="180"
                  />
                  <el-table-column :label="t('ssl-certificate.management.update.124800-15')" min-width="120">
                    <template #default="{ row }">
                      {{ ServerStatusMap[row.status] }}
                    </template>
                  </el-table-column>
                  <el-table-column :label="t('ssl-certificate.management.update.124800-25')" min-width="120">
                    <template #default="{ row }">
                      {{ UpdateDomainMap[row.disableUpdate] || '-' }}
                    </template>
                  </el-table-column>
                </TableV2>
              </div>

              <div class="ssl-update-v2__table-pane ssl-update-v2__table-pane--selected">
                <TableV2
                  :data="selectedDomains"
                  class="ssl-update-v2__table ssl-update-v2__table--selected"
                  empty-text="暂无数据"
                  table-layout="fixed"
                >
                  <el-table-column
                    prop="domain"
                    :label="t('ssl-certificate.management.update.124800-14')"
                    min-width="180"
                  />
                  <el-table-column :label="t('ssl-certificate.management.update.124800-15')" min-width="120">
                    <template #default="{ row }">
                      {{ ServerStatusMap[row.status] }}
                    </template>
                  </el-table-column>
                  <el-table-column :label="t('ssl-certificate.management.update.124800-25')" min-width="120">
                    <template #default="{ row }">
                      <div class="ssl-update-v2__status-cell">
                        <span>{{ UpdateDomainMap[row.disableUpdate] || '-' }}</span>
                        <SvgIcon
                          name="table-close"
                          class="ssl-update-v2__remove-icon"
                          @click="deleteDomainHandle(row.domain)"
                        />
                      </div>
                    </template>
                  </el-table-column>
                </TableV2>
              </div>
            </div>

            <TipsBar
              v-if="filterAvailableDomain.some(v => v.disableUpdate == DisableUpdateDomain.DISABLED)"
              class="ssl-update-v2__warning"
              :tips="t('ssl-certificate.management.update.124800-24')"
              color="#f7b500"
              background="#fff3d3"
            />
          </div>
        </el-form-item>
      </el-form>

      <div class="ssl-update-v2__footer">
        <el-button
          type="primary"
          :disabled="selectedDomains.length <= 0"
          :loading="submitStore.loading"
          @click="onSubmit"
        >
          {{ t('ssl-certificate.management.update.124800-18') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus/es'
import { _getUpdateCert, _getUpdateDomain, _updateCert } from '@/apis/ssl-certificate/management'
import type { SubmitUpdateReq, UpdateCertResp, UpdateDomainResp } from '@/apis/ssl-certificate/management/type'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute, replaceRoute } from '@/utils/router-jump'
import { _s_setItem } from '@/utils/storage'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import { SSL_CERTIFICATE_DETAILS_TAB } from '@/views/ssl-certificate/management/config'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const query = route.query as unknown as { cert_id?: string; id?: string; domain?: string }
const pageTitle = computed(() => `${query.cert_id || ''} ${t('ssl-certificate.management.update.516958-0')}`.trim())

const ServerStatusMap = [
  '-',
  t('ssl-certificate.management.update.124800-16'),
  t('ssl-certificate.management.update.124800-17'),
]

enum DisableUpdateDomain {
  ENABLED = 1,
  DISABLED = 2,
}

const UpdateDomainMap = [
  '-',
  t('ssl-certificate.management.update.124800-26'),
  t('ssl-certificate.management.update.124800-27'),
]

const source = ref(1)
const formRef = ref<FormInstance>()
const formStore = reactive<SubmitUpdateReq>({
  is_notify: 1,
  update_type: 1,
  old_cert_id: query.cert_id!,
  old_cid: Number(query.id),
  new_cert_id: '',
  new_cid: '',
  domains: [],
})
const formRules: FormRules<typeof formStore> = {
  new_cert_id: [{ required: true, message: t('ssl-certificate.management.update.124800-28'), trigger: 'change' }],
}

const updateCertStore = reactive<{
  loading: boolean
  data: UpdateCertResp['items']
}>({
  loading: false,
  data: [],
})

const oldDomainStore = reactive<{
  loading: boolean
  query: string
  allCheck: boolean
  data: UpdateDomainResp['items']
}>({
  loading: false,
  query: '',
  allCheck: false,
  data: [],
})

const filterAvailableDomain = computed(() => {
  const list = oldDomainStore.data.filter(item => item.domain.includes(oldDomainStore.query))
  const newCert = updateCertStore.data.find(item => item.cert_id === formStore.new_cert_id)

  list.forEach(item => {
    if (!newCert) {
      item.disableUpdate = DisableUpdateDomain.ENABLED
      return
    }
    if (!newCert.dns_domains?.length) {
      item.disableUpdate = DisableUpdateDomain.DISABLED
      return
    }

    item.disableUpdate = newCert.dns_domains.some(dnsDomain => {
      const regexPattern = dnsDomain.replace(/\./g, '\\.').replace(/\*/g, '[^.]+')
      return dnsDomain === item.domain || new RegExp(`^${regexPattern}$`).test(item.domain)
    })
      ? DisableUpdateDomain.ENABLED
      : DisableUpdateDomain.DISABLED
  })

  return list
})

const selectedDomains = computed(() => oldDomainStore.data.filter(item => item.check))

const allCheck = (checked: boolean) => {
  if (!checked) oldDomainStore.allCheck = false
  filterAvailableDomain.value.forEach(item => {
    if (item.status == 1 && item.disableUpdate != DisableUpdateDomain.DISABLED) item.check = checked
  })
}

const rowCheck = () => {
  oldDomainStore.allCheck = oldDomainStore.data.every(item => item.check)
}

const deleteDomainHandle = (domain: string) => {
  oldDomainStore.data.forEach(item => {
    if (item.domain === domain) item.check = false
  })
  oldDomainStore.allCheck = false
}

const getUpdateCert = async () => {
  formStore.new_cert_id = ''
  if (!query.cert_id) {
    message.error(t('ssl-certificate.management.update.124800-19'))
    return
  }

  try {
    updateCertStore.loading = true
    const { code, msg, data } = await _getUpdateCert({
      old_cert_id: query.cert_id,
      cert_source: source.value,
      deployed_domains: oldDomainStore.data.map(item => item.domain),
    })
    if (code === 200 && data) {
      updateCertStore.data = data.items
      allCheck(false)
    } else {
      message.error(msg || t('ssl-certificate.management.update.124800-20'))
    }
  } finally {
    updateCertStore.loading = false
  }
}

const getUpdateDomain = async () => {
  if (!query.cert_id) return

  try {
    oldDomainStore.loading = true
    const { code, msg, data } = await _getUpdateDomain({ old_cert_id: query.cert_id })
    if (code === 200 && data) {
      oldDomainStore.data = data.items
      getUpdateCert()
    } else {
      message.error(msg || t('ssl-certificate.management.update.124800-21'))
    }
  } finally {
    oldDomainStore.loading = false
  }
}

const handleUpdateCertChange = (certId: UpdateCertResp['items'][0]['cert_id']) => {
  const item = updateCertStore.data.find(cert => cert.cert_id === certId)
  if (!item) {
    message.error(t('ssl-certificate.management.update.124800-19'))
    return
  }
  formStore.new_cert_id = item.cert_id
  formStore.new_cid = item.cid
  allCheck(false)
}

const handleSourceTypeChange = () => {
  formStore.new_cert_id = ''
  oldDomainStore.data.forEach(item => {
    item.disableUpdate = undefined
  })
  getUpdateCert()
}

const handleDeploy = () => {
  pushRoute({
    name: 'ssl_certificate_deploy',
    params: { id: props.id },
    query,
  })
}

const submitStore = reactive({ loading: false })
const onSubmit = async () => {
  await formRef.value?.validate()
  try {
    submitStore.loading = true
    const { code, msg } = await _updateCert({
      ...formStore,
      domains: selectedDomains.value.map(item => ({ domain: item.domain, domain_id: item.domain_id })),
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.update.124800-22'))
      _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '2')
      replaceRoute({
        name: 'ssl_certificate_details',
        params: { id: props.id },
        query,
      })
    } else {
      message.error(msg || t('ssl-certificate.management.update.124800-23'))
    }
  } finally {
    submitStore.loading = false
  }
}

onMounted(getUpdateDomain)
</script>

<style scoped lang="scss">
.ssl-update-v2 {
  min-height: 100%;
  background: #f3f6fa;
}

.ssl-update-v2__panel {
  padding: 24px 24px 0;
  margin-top: 16px;
  background: #fff;
}

.ssl-update-v2__form {
  max-width: 100%;

  :deep(.el-form-item__label) {
    height: 34px;
    padding-right: 16px;
    font-size: 14px;
    line-height: 34px;
    color: #828b9c;
  }

  :deep(.el-form-item__content) {
    line-height: 22px;
  }
}

.ssl-update-v2__item {
  margin-bottom: 24px;
}

.ssl-update-v2__item--notify {
  margin-bottom: 32px;
}

.ssl-update-v2__item--resource {
  align-items: flex-start;
  margin-bottom: 0;

  :deep(.el-form-item__label) {
    height: 22px;
    line-height: 22px;
  }
}

.ssl-update-v2__hint {
  margin-top: 4px;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.ssl-update-v2__control {
  width: 400px;
}

.ssl-update-v2__resource {
  width: 100%;
}

.ssl-update-v2__resource-tip {
  margin-bottom: 16px;
  color: #191c23;
}

.ssl-update-v2__link {
  color: #06f;
  cursor: pointer;
}

.ssl-update-v2__tables {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.ssl-update-v2__table-pane {
  flex: 1 1 0;
  min-width: 0;
}

.ssl-update-v2__table-pane--selected {
  padding-top: 50px;
}

.ssl-update-v2__search {
  width: 400px;
  margin-bottom: 16px;
}

.ssl-update-v2__table {
  height: 326px;
}

.ssl-update-v2__status-cell {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.ssl-update-v2__remove-icon {
  width: 16px;
  height: 16px;
  color: #828b9c;
  cursor: pointer;

  &:hover {
    color: #06f;
  }
}

.ssl-update-v2__warning {
  margin-top: 16px;
}

.ssl-update-v2__footer {
  padding: 24px 0;
  margin-top: 24px;
  border-top: 1px solid #e8ecf3;

  :deep(.el-button) {
    min-width: 76px;
  }
}

@media (width <= 1100px) {
  .ssl-update-v2__tables {
    flex-direction: column;
  }

  .ssl-update-v2__table-pane--selected {
    padding-top: 0;
  }
}
</style>
