<template>
  <div class="ssl-deploy-v2">
    <PageBreadcrumbToolbar :items="[pageTitle]" :show-doc="false" />

    <section class="ssl-deploy-v2__panel">
      <div class="ssl-deploy-v2__section-title">
        {{ pageTitle }}
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="left"
        label-width="132px"
        class="ssl-deploy-v2__form"
      >
        <el-form-item :label="t('ssl-certificate.management.deploy.835774-1')">
          <span class="ssl-deploy-v2__plain-text">{{ query.cert_id }}</span>
        </el-form-item>

        <el-form-item :label="t('ssl-certificate.management.deploy.835774-2')">
          <span class="ssl-deploy-v2__plain-text">
            {{ filterArray(CERTIFICATE_TYPES_MAP, 'id', query.cert_type)?.fullName }}
            {{ filterArray(CERT_DOMAIN_TYPES_MAP, 'id', certDomainType)?.name }}
          </span>
        </el-form-item>

        <el-form-item :label="t('ssl-certificate.management.deploy.835774-3')">
          <span class="ssl-deploy-v2__plain-text">{{ query.domain }}</span>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.deploy.835774-4')"
          class="ssl-deploy-v2__form-item ssl-deploy-v2__form-item--radio"
        >
          <el-radio-group v-model="form.deploy_type">
            <el-radio :label="1">
              {{ t('ssl-certificate.management.deploy.835774-5') }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="t('ssl-certificate.management.deploy.835774-6')"
          class="ssl-deploy-v2__form-item ssl-deploy-v2__form-item--top"
        >
          <div class="ssl-deploy-v2__resource-block">
            <p class="ssl-deploy-v2__resource-tip">
              <span class="ssl-deploy-v2__resource-tip-main">{{
                t('ssl-certificate.management.deploy.835774-7')
              }}</span>
              {{ t('ssl-certificate.management.deploy.835774-8') }}
            </p>

            <div v-loading="domainListStore.loading" class="ssl-deploy-v2__tables">
              <div class="ssl-deploy-v2__table-pane">
                <el-input
                  v-model="domainListStore.query"
                  :placeholder="t('ssl-certificate.management.deploy.835774-9')"
                  class="ssl-deploy-v2__search"
                />

                <TableV2
                  :data="filterAvailableDomain"
                  class="ssl-deploy-v2__table ssl-deploy-v2__table--left"
                  empty-text="暂无数据"
                  table-layout="fixed"
                >
                  <el-table-column width="56">
                    <template #header>
                      <el-checkbox v-model="domainListStore.allCheck" @change="allCheck" />
                    </template>

                    <template #default="{ row }">
                      <el-checkbox v-model="row.check" :disabled="row.status == 2" @change="rowCheck" />
                    </template>
                  </el-table-column>

                  <el-table-column :label="t('ssl-certificate.management.deploy.835774-10')" min-width="180">
                    <template #default="{ row }">
                      <span>{{ row.domain }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column :label="t('ssl-certificate.management.deploy.835774-11')" min-width="250">
                    <template #default="{ row }">
                      <span v-if="row.cid != -1">
                        ID：{{ row.cid != -1 ? row.cert_id : '-' }}｜{{ row.remark || '未命名' }}
                      </span>
                      <span v-else>-</span>
                    </template>
                  </el-table-column>

                  <el-table-column :label="t('ssl-certificate.management.deploy.835774-12')" min-width="120">
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
                </TableV2>
              </div>

              <div class="ssl-deploy-v2__table-pane ssl-deploy-v2__table-pane--selected">
                <TableV2
                  :data="selectCertificateData"
                  class="ssl-deploy-v2__table"
                  empty-text="暂无数据"
                  table-layout="fixed"
                >
                  <el-table-column :label="t('ssl-certificate.management.deploy.835774-10')" min-width="150">
                    <template #default="{ row }">
                      <span>{{ row.domain }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column :label="t('ssl-certificate.management.deploy.835774-11')" min-width="180">
                    <template #default="{ row }">
                      <span v-if="row.cid != -1">
                        ID：{{ row.cid != -1 ? row.cert_id : '-' }}｜{{ row.remark || '未命名' }}
                      </span>
                      <span v-else>-</span>
                    </template>
                  </el-table-column>

                  <el-table-column :label="t('ssl-certificate.management.deploy.835774-12')" min-width="120">
                    <template #default="{ row }">
                      <div class="ssl-deploy-v2__status-cell">
                        <span>
                          {{
                            [
                              '-',
                              t('ssl-certificate.management.deploy.835774-13'),
                              t('ssl-certificate.management.deploy.835774-14'),
                            ][row.status]
                          }}
                        </span>
                        <SvgIcon
                          name="table-close"
                          class="ssl-deploy-v2__remove-icon"
                          @click="deleteDomainHandle(row.domain)"
                        />
                      </div>
                    </template>
                  </el-table-column>
                </TableV2>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div class="ssl-deploy-v2__footer">
        <el-button type="primary" :loading="deployLoading" @click="onSubmit">
          {{ t('ssl-certificate.management.deploy.835774-15') }}
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { _deployCert, _getAvailableDomains } from '@/apis/ssl-certificate/management'
import type { AvailableDomainsListResp } from '@/apis/ssl-certificate/management/type'
import { filterArray } from '@/utils/filter'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { replaceRoute } from '@/utils/router-jump'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import type { FormInstance, FormRules } from 'element-plus/es'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import {
  SSL_CERTIFICATE_CERT_DOMAIN_TYPE,
  SSL_CERTIFICATE_DETAILS_TAB,
} from '@/views/ssl-certificate/management/config'
import { CERT_DOMAIN_TYPES_MAP, CERTIFICATE_TYPES_MAP } from '@/views/ssl-certificate/config'

const route = useRoute()
const query = route.query as unknown as { cert_id?: string; id?: string; domain?: string; cert_type?: number }
const certDomainType = _s_getItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE)

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const pageTitle = computed(() => `${query.cert_id || ''}${t('ssl-certificate.management.deploy.835774-0')}`)

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

const filterAvailableDomain = computed(() => domainListStore.data.filter(v => v.domain.includes(domainListStore.query)))

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

const formRef = ref<FormInstance>()
const form = reactive({
  deploy_type: 1,
})
const deployLoading = ref(false)
const formRules: FormRules<typeof form> = {}

const onSubmit = async () => {
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
        query,
      })
    } else {
      message.error(msg || t('ssl-certificate.management.deploy.835774-19'))
    }
  } finally {
    deployLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.ssl-deploy-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ssl-deploy-v2__panel {
  padding: 24px;
  background: #fff;
}

.ssl-deploy-v2__section-title {
  margin-bottom: 28px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.ssl-deploy-v2__form {
  :deep(.el-form-item__label) {
    font-size: 14px;
    font-weight: 400;
    color: #828b9c;
  }
}

.ssl-deploy-v2__form-item {
  margin-bottom: 18px;
}

.ssl-deploy-v2__form-item--radio {
  margin-bottom: 28px;
}

.ssl-deploy-v2__form-item--top {
  :deep(.el-form-item__content) {
    align-items: flex-start;
  }
}

.ssl-deploy-v2__plain-text {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.ssl-deploy-v2__resource-block {
  width: 100%;
}

.ssl-deploy-v2__resource-tip {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.ssl-deploy-v2__resource-tip-main {
  margin-right: 8px;
  color: #191c23;
}

.ssl-deploy-v2__tables {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 480px;
  gap: 40px;
  align-items: start;
}

.ssl-deploy-v2__table-pane {
  min-width: 0;
}

.ssl-deploy-v2__search {
  // width: min(100%, 682px);
  margin-bottom: 12px;

  :deep(.el-input__wrapper) {
    border-radius: 0;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
  }
}

.ssl-deploy-v2__table {
  width: 100%;

  :deep(.account-table-v2__table) {
    font-size: 14px;
  }

  :deep(.el-table__header-wrapper th.el-table__cell) {
    height: 56px;
  }

  :deep(.el-checkbox) {
    margin-right: 0;
  }
}

.ssl-deploy-v2__status-cell {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.ssl-deploy-v2__remove-icon {
  flex: none;
  color: #a1a9b8;
  cursor: pointer;
}

.ssl-deploy-v2__footer {
  padding-top: 24px;
  margin-top: 20px;
  border-top: 1px solid #e8ecf3;
}

@media (width <= 1200px) {
  .ssl-deploy-v2__tables {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
}
</style>
