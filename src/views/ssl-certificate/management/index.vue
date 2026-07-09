<template>
  <div class="page-container">
    <cat-tabs v-model="tabType" :tabs="listTabs" full-container @change="setTabType" />
    <el-card v-if="tabType === '0'" shadow="never" class="overview mt20">
      <el-row :gutter="40">
        <el-col :span="6" class="overview-item">
          <div class="label">
            {{ t('ssl-certificate.management.index.639259-0') }}
          </div>
          <div class="value">
            {{ statusStore.data?.uncommitted_cert_cnt ?? '-' }}
          </div>
          <div class="setting">
            <el-text class="info" type="info">
              {{ t('ssl-certificate.management.index.639259-1') }}
              {{ statusStore.data?.unverified_cert_cnt ?? '-' }}
            </el-text>
          </div>
        </el-col>
        <el-col :span="6" class="overview-item">
          <div class="label">
            {{ t('ssl-certificate.management.index.639259-2') }}
          </div>
          <div class="value">
            {{ statusStore.data?.expiring_cert_cnt ?? '-' }}
          </div>
          <div class="setting">
            <!-- <el-link type="primary" @click="handleRenewCertificate">去续期</el-link> -->
          </div>
        </el-col>
        <el-col :span="6" class="overview-item">
          <div class="label">
            {{ t('ssl-certificate.management.index.639259-3') }}
          </div>
          <div class="value">{{ statusStore.data?.expired_cert_cnt ?? '-' }} <span style="font-size: 14px" /></div>
          <div class="setting">
            <el-link type="primary" @click="handleExpiredCertificate">
              {{ t('ssl-certificate.management.index.639259-4') }}
            </el-link>
          </div>
        </el-col>
        <el-col :span="6" class="overview-item">
          <div class="label">
            {{ t('ssl-certificate.management.index.639259-5') }}
          </div>
          <div class="value">
            {{ statusStore.data?.issued_cert_cnt ?? '-' }}
          </div>
          <div class="setting">
            <el-link type="primary" @click="handleCertificateHosting">
              {{ t('ssl-certificate.management.index.639259-6') }}
            </el-link>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <section class="table-container">
      <div class="df ac jsb table-form-group">
        <div class="btn-group">
          <el-button v-if="['0', '1', '2'].includes(tabType)" type="primary" @click="handleApplyCertificate">
            {{ t('ssl-certificate.management.index.639259-7') }}
          </el-button>
          <el-button v-if="['0', '2'].includes(tabType)" @click="handleUploadCertificate">
            {{ t('ssl-certificate.management.index.639259-8') }}
          </el-button>
          <el-button v-if="['3'].includes(tabType)" type="primary" @click="handleCreateCrs">
            {{ t('ssl-certificate.management.index.639259-9') }}
          </el-button>
        </div>
        <div class="df ac jfe search-group" style="flex: 1">
          <FilterInput
            ref="filterInputRef"
            class="mr10"
            :placeholder="t(filterListPlaceholder)"
            :filter-list="filterList"
            @search="filterSearchFn"
          />
          <CdnIconButton @click="reset">
            <SvgIcon name="cat-cdn-refresh" />
          </CdnIconButton>
        </div>
      </div>
      <div class="table-group">
        <keep-alive>
          <NormalTable
            v-if="['0', '1', '2'].includes(tabType)"
            ref="normalTableRef"
            :table-form="tableForm.data"
            :tab-type="tabType"
            @get-analysis-group-by-status-count="getAnalysisGroupByStatusCount"
          />
          <CrsTable v-else ref="crsTableRef" :table-form="tableForm.data" />
        </keep-alive>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _s_getItem, _s_setItem } from '@/utils/storage'
import NormalTable from './components/table.vue'
import CrsTable from './components/crs-table.vue'
import { SSL_CERTIFICATE_MANAGEMENT_TAB, StatusTypeEnum } from './config'
import FilterInput, { FilterListType } from '@/components/cvm/query-filter/filter-input.vue'
import { _getAnalysisGroupByStatusCount } from '@/apis/ssl-certificate/management'
import { message } from '@/utils/message'
import { StatisticCertResp } from '@/apis/ssl-certificate/management/type'
import { CertificateSource } from '../config'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()

/// tab
// init tabType
// 证书列表tab选项
const listTabs = [
  {
    label: t('ssl-certificate.management.config.844970-3'),
    value: '0',
  },
  {
    label: t('ssl-certificate.management.config.844970-4'),
    value: '1',
  },
  {
    label: t('ssl-certificate.management.config.844970-5'),
    value: '2',
  },
  {
    label: t('ssl-certificate.management.config.844970-6'),
    value: '3',
  },
]
const tabTypeFromSession = _s_getItem(SSL_CERTIFICATE_MANAGEMENT_TAB)
const tabType = ref(tabTypeFromSession?.toString() || '0')

const setTabType = tab => {
  _s_setItem(SSL_CERTIFICATE_MANAGEMENT_TAB, tab.value)
  tabType.value = tab.value
  switch (tab.value) {
    case '0':
      tableForm.data.source = CertificateSource.ALL
      break
    case '1':
      tableForm.data.source = CertificateSource.FREE
      break
    case '2':
      tableForm.data.source = CertificateSource.SELF
      break
    case '3':
      tableForm.data.source = undefined
      break
    default:
      break
  }

  if (['0', '1', '2'].includes(tab.value)) {
    filterListPlaceholder.value = t('ssl-certificate.management.index.639259-10')
    filterList.value = [
      {
        fieldName: t('ssl-certificate.management.index.639259-11'),
        fieldKey: 'cert_id',
      },
      {
        fieldName: t('ssl-certificate.management.index.639259-12'),
        fieldKey: 'domain',
      },
    ]
    reset()
  }
  if (['3'].includes(tab.value)) {
    filterListPlaceholder.value = t('ssl-certificate.management.index.639259-13')
    filterList.value = [
      {
        fieldName: t('ssl-certificate.management.index.639259-14'),
        fieldKey: 'csr_name',
      },
      {
        fieldName: t('ssl-certificate.management.index.639259-12'),
        fieldKey: 'domain',
      },
    ]
    reset()
  }
}
onMounted(() => {
  setTabType({ value: tabTypeFromSession?.toString() || '0' })
})

const statusStore = reactive<{
  data?: StatisticCertResp
  loading: boolean
}>({
  loading: false,
})
const getAnalysisGroupByStatusCount = async () => {
  try {
    statusStore.loading = true
    const { code, msg, data } = await _getAnalysisGroupByStatusCount()
    if (code === 200 && data) {
      statusStore.data = data
    } else {
      message.error(msg)
    }
  } finally {
    statusStore.loading = false
  }
}

/// 按钮
// 查看即将过期的证书
const handleRenewCertificate = () => {
  normalTableRef.value?.updateState(StatusTypeEnum.EXPIRING)
  getTableList()
}
// 查看已过期的证书
const handleExpiredCertificate = () => {
  normalTableRef.value?.updateState(StatusTypeEnum.EXPIRED)
  getTableList()
}

// 证书托管
const handleCertificateHosting = () => {
  pushRoute({ name: 'ssl_certificate_hosting' })
}

// 申请免费证书
const handleApplyCertificate = () => {
  pushRoute({ name: 'ssl_certificate_purchase' })
}
// 上传证书
const handleUploadCertificate = () => {
  pushRoute({ name: 'ssl_certificate_upload' })
}
// 创建CRS
const handleCreateCrs = () => {
  pushRoute({ name: 'ssl_certificate_create_csr' })
}

const filterListPlaceholder = ref(t('ssl-certificate.management.index.639259-10'))
const filterList = ref<FilterListType[]>([
  {
    fieldName: t('ssl-certificate.management.index.639259-11'),
    fieldKey: 'cert_id',
  },
  {
    fieldName: t('ssl-certificate.management.index.639259-12'),
    fieldKey: 'domain',
  },
])
const filterSearchFn = data => {
  getTableList(data)
}

/// 表格
const crsTableRef = ref<InstanceType<typeof CrsTable>>()
const normalTableRef = ref<InstanceType<typeof NormalTable>>()

const tableForm = reactive<{
  data: {
    domain?: string
    cert_id?: string
    csr_name?: string
    source?: number
  }
  loading: boolean
}>({
  data: {
    source: tabType.value,
  },
  loading: false,
})

const filterInputRef = ref<InstanceType<typeof FilterInput>>()
const getTableList = async (data?: any) => {
  getAnalysisGroupByStatusCount()

  switch (tabType.value) {
    case '0':
    case '1':
    case '2':
      if (data) {
        tableForm.data.domain = data.domain
        tableForm.data.cert_id = data.cert_id
      }
      nextTick(() => {
        normalTableRef.value?.getTableList()
      })
      break
    case '3':
      if (data) {
        tableForm.data.domain = data.domain
        tableForm.data.csr_name = data.csr_name
      }
      nextTick(() => {
        crsTableRef.value?.getTableList()
      })
      break
    default:
      break
  }
}
const reset = () => {
  normalTableRef.value?.updateState(undefined)
  if (filterInputRef.value) filterInputRef.value.searchList = []
}

// onMounted(() => {
//   getAnalysisGroupByStatusCount()
// })
</script>

<style lang="scss" scoped>
.page-container {
  width: 100%;
}

.overview-item {
  &:not(:last-child) {
    border-right: 1px solid #ececec;
  }

  .label {
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 20px;
    color: #000;
  }

  .value {
    margin-bottom: 16px;
    font-size: 24px;
    font-weight: 500;
    line-height: 33px;
    color: #000;
  }

  .setting {
    .info {
      margin-right: 24px;
    }
  }
}

.table-container {
  padding: 20px;
  margin-top: 20px;
  background-color: #fff;
}
</style>
