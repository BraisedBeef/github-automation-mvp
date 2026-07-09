<template>
  <CatCdnTable
    v-loading="tableData.loading"
    show-overflow-tooltip
    :data="tableData.listData"
    @selection-change="tableSelect"
  >
    <!-- <el-table-column fixed="left" type="selection" /> -->
    <el-table-column prop="longText" :label="t('ssl-certificate.management.index.922533-0')" width="200">
      <template #default="{ row }">
        <div class="cert-info mt10 mb10">
          <Copy class="id" :text="row.cert_id">
            ID：<span @click="certDetails(row)">{{ row.cert_id }}</span>
          </Copy>

          <div class="remark df ac">
            <P class="text"> {{ t('ssl-certificate.management.index.922533-1') }}{{ row.remark || 'undefined' }} </P>
            <SvgIcon name="cat-cdn-edit" class="pointer ml4 copy-icon" @click="updateCertRemark(row)" />
          </div>
          <p>{{ t('ssl-certificate.management.index.922533-2', { day: row.cert_validity }) }}</p>
          <p>
            {{ t('ssl-certificate.management.index.922533-4')
            }}{{ filterArray(CERTIFICATE_SOURCE_MAP, 'value', row.source)?.label || '-' }}
          </p>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="domains" :label="t('ssl-certificate.management.index.922533-7')" width="180">
      <template #default="{ row }">
        <Copy v-if="row.domain" :text="row.domain">
          {{ row.domain }}
        </Copy>
        <template v-else> - </template>
      </template>
    </el-table-column>
    <el-table-column prop="expire_at" :label="t('ssl-certificate.management.index.922533-8')" width="220">
      <template #header>
        <div class="df ac">
          <div class="mr4">
            {{ t('ssl-certificate.management.index.922533-8') }}
          </div>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
          <!-- <el-tooltip
            :content="'到期前30天会开放续期按钮，续期会生成一个新证书，需要重新进行部署；到期后旧证书不可再用。'"
            placement="top"
            effect="light"
            popper-class="max-400"
          >
            <SvgIcon name="cat-cdn-tip" />
          </el-tooltip> -->
        </div>
      </template>
      <template #default="{ row }">
        <p v-if="!filterArray(STATUS_TYPE_MAP, 'value', row.status)?.issueStatus">
          {{ t('ssl-certificate.management.index.922533-9') }}
        </p>
        <p v-else-if="Date.now() >= row.expire_at * 1000">
          {{ t('ssl-certificate.management.index.922533-10') }}
        </p>
        <template v-else>
          <p>{{ getDateDayjs(row.expire_at * 1000, 'string', true) }}</p>
        </template>
      </template>
    </el-table-column>
    <el-table-column prop="deploy_type" :label="t('ssl-certificate.management.index.922533-11')" width="100">
      <template #header>
        <div class="df ac">
          <el-tooltip
            :content="t('ssl-certificate.management.index.922533-12')"
            placement="top"
            effect="light"
            popper-class="max-400"
          >
            <div class="df ac">
              <div class="mr4">
                {{ t('ssl-certificate.management.index.922533-11') }}
              </div>
              <SvgIcon name="cat-cdn-tip" />
            </div>
          </el-tooltip>
        </div>
      </template>
      <template #default="{ row }">
        <!-- <div class="df ac" v-if="!(refreshResourcesStore.index == $index && refreshResourcesStore.loading)">
          <P style="margin-right: 5px"> 未关联 </P>
          <el-link type="primary" @click="refreshResources(row, $index)">刷新</el-link>
        </div>
        <SvgIcon v-else name="loading" style="color: #0063ff" /> -->
        <SvgIcon v-if="relatedLoading" name="dialog-loading" class="rotate mr4" />
        {{ filterArray(deploy_type_map, 'value', row.deploy_type)?.label || '-' }}
      </template>
    </el-table-column>
    <el-table-column prop="is_hosting" :label="t('ssl-certificate.management.index.922533-13')">
      <template #default="{ row }">
        {{ hosting_type_map[row.hosting_type] || '-' }}
      </template>
    </el-table-column>
    <el-table-column prop="is_notify" :label="t('ssl-certificate.management.index.922533-14')">
      <template #header>
        <div class="df ac">
          <el-tooltip
            :content="t('ssl-certificate.management.index.922533-15')"
            placement="top"
            effect="light"
            popper-class="max-400"
          >
            <div class="df ac">
              <div class="mr4">
                {{ t('ssl-certificate.management.index.922533-14') }}
              </div>
              <SvgIcon name="cat-cdn-tip" />
            </div>
          </el-tooltip>
        </div>
      </template>
      <template #default="{ row }">
        {{
          ['-', t('ssl-certificate.management.index.922533-16'), t('ssl-certificate.management.index.922533-17')][
            row.is_notify
          ] || '-'
        }}
      </template>
    </el-table-column>
    <el-table-column prop="status" :label="t('ssl-certificate.management.index.922533-18')">
      <template #header>
        <TableHeadFilter
          ref="networkChangeTypeThFilterRef"
          v-model="state"
          :label="t('ssl-certificate.management.index.922533-18')"
          show-all
          field-type="select"
          field-key=""
          :list="filterArray(STATUS_TYPE_MAP, 'filter', [true])"
          @change="getTableList"
        />
      </template>
      <template #default="{ row }">
        <p
          :style="{
            color: filterArray(STATUS_TYPE_MAP, 'value', row.status)?.color || '#222222',
          }"
        >
          {{ filterArray(STATUS_TYPE_MAP, 'value', row.status)?.label || '-' }}
        </p>
      </template>
    </el-table-column>
    <el-table-column fixed="right" prop="id" :label="t('ssl-certificate.management.index.922533-19')" width="220">
      <template #default="{ row }">
        <div class="df" style="flex-wrap: wrap">
          <el-link
            v-for="operate in getOperateMap(row).slice(0, 2)"
            :key="operate.key"
            :disabled="operate.disabled"
            type="primary"
            class="mr10"
            @click="() => operate.event(row)"
          >
            {{ operate.label(row) }}
          </el-link>
          <el-dropdown v-if="getOperateMap(row).slice(2).length > 0">
            <el-link type="primary" class="mr10">
              {{ t('ssl-certificate.management.index.922533-20') }}
            </el-link>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="operate in getOperateMap(row).slice(2)"
                  :key="operate.key"
                  :command="operate.key"
                  :disabled="operate.disabled"
                  @click="() => operate.event(row)"
                >
                  {{ operate.label(row) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </template>
    </el-table-column>
  </CatCdnTable>
  <CatPagination
    v-model:pagination="tableData.pagination"
    :total="tableData.total"
    :custom-keys="['page', 'page_size']"
    @change="getTableList"
  />
  <!-- 吊销证书弹窗 -->
  <el-dialog v-model="revokeDialogVisible" :title="t('ssl-certificate.management.index.922533-21')" width="550">
    <span>{{ t('ssl-certificate.management.index.922533-22') }}</span>
    <template #footer>
      <div style="text-align: center">
        <el-button type="primary" @click="revokeCertificate">
          {{ t('ssl-certificate.management.index.922533-23') }}
        </el-button>
        <el-button @click="revokeDialogVisible = false">
          {{ t('ssl-certificate.management.index.922533-24') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 重颁发证书弹窗 -->
  <el-dialog v-model="reIssueDialogVisible" :title="t('ssl-certificate.management.index.922533-21')" width="550">
    <span style="color: #000">
      {{ t('ssl-certificate.management.index.922533-25') }}({{ t('ssl-certificate.management.index.922533-26') }}){{
        t('ssl-certificate.management.index.922533-27')
      }}({{ t('ssl-certificate.management.index.922533-28') }}){{ t('ssl-certificate.management.index.922533-29') }}
    </span>
    <template #footer>
      <div style="margin-bottom: 10px; text-align: center">
        <el-button type="primary" @click="reIssueRevokeCertificate">
          {{ t('ssl-certificate.management.index.922533-23') }}
        </el-button>
        <el-button @click="reIssueDialogVisible = false">
          {{ t('ssl-certificate.management.index.922533-24') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- {{ t('ssl-certificate.management.index.922533-30') }} -->
  <el-dialog v-model="downloadStore.dialogVisible" :title="t('ssl-certificate.management.index.922533-30')" width="760">
    <p class="mb10">
      {{ t('ssl-certificate.management.index.922533-31') }}
    </p>
    <el-table show-overflow-tooltip :data="downloadStore.types">
      <el-table-column prop="tips" :label="t('ssl-certificate.management.index.922533-32')" />
      <el-table-column :label="t('ssl-certificate.management.index.922533-19')" width="210">
        <template #default="{ row }">
          <el-link v-if="!downloadStore.loading" type="primary" @click="handleCertificateDownload(row)">
            {{ t('ssl-certificate.management.index.922533-33') }}
          </el-link>
          <SvgIcon v-else name="loading" />
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div style="text-align: center">
        <el-button
          :loading="downloadStore.loading"
          style="min-width: 80px"
          @click="downloadStore.dialogVisible = false"
        >
          {{ t('ssl-certificate.management.index.922533-24') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import JSZip from 'jszip'
import t from '@/utils/i18n'
import {
  _cancelCert,
  _deleteCert,
  _downloadCert,
  _getCertList,
  _getCertRelatedResources,
  _updateCertRemark,
  _updateNotifyStatus,
} from '@/apis/ssl-certificate/management'
import { createRandomStr } from '@/utils/string-utils'
import { getDateDayjs } from '@/utils/format-time'
import { filterArray } from '@/utils/filter'
import { _s_setItem } from '@/utils/storage'
import { download } from '@/utils/download'
import { message } from '@/utils/message'
import TableHeadFilter from '@/components/cvm/query-filter/table-head-filter.vue'
import type { ListCertReq, ListCertResp } from '@/apis/ssl-certificate/management/type'
import {
  SSL_CERTIFICATE_DETAILS_TAB,
  deploy_type_map,
  hosting_type_map,
  SSL_CERTIFICATE_CERT_DOMAIN_TYPE,
  SSL_CERTIFICATE_VERIFY_TYPE,
  SSL_CERTIFICATE_APPLY_TAB,
  DeployTypeEnum,
  STATUS_TYPE_MAP,
  SSL_CERTIFICATE_FACTORY_ID,
} from '../config'
import TipsBar from './tips-bar.vue'
import Copy from './copy.vue'
import { CERTIFICATE_SOURCE_MAP, SSLCertDownloadEnum, SSLCertTypes } from '../../config'
import { documentUrl } from '@/config/base-config'
import { pushRoute, replaceRoute } from '@/utils/router-jump'

interface TableDataType {
  listData?: ListCertResp['items']
  selectListData?: ListCertResp['items']
  operateData?: ListCertResp['items'][0]
  loading: boolean
  height: number
  pagination: {
    page: ListCertReq['page']
    page_size: ListCertReq['limit']
  }
  total: ListCertResp['total']
}

const zip = new JSZip()
const router = useRouter()
const props = withDefaults(
  defineProps<{
    tabType: string
    tableForm: any
  }>(),
  {
    tabType: '1',
    tableForm: {},
  },
)

const emit = defineEmits(['getAnalysisGroupByStatusCount'])

const networkChangeTypeThFilterRef = ref<InstanceType<typeof TableHeadFilter>>()
const state = ref()
const updateState = status => {
  state.value = status
  networkChangeTypeThFilterRef.value?.updateCheck(status)
}

const tableData = reactive<TableDataType>({
  listData: [],
  selectListData: [],
  operateData: undefined,
  loading: false,
  height: 450,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 10,
})

const tableSelect = (rows: ListCertResp['items']) => {
  tableData.selectListData = rows
}

const relatedLoading = ref(false)
const getCertRelatedResources = async () => {
  if (!tableData.listData || tableData.listData.length <= 0) return
  try {
    relatedLoading.value = true
    const { code, data, msg } = await _getCertRelatedResources({
      cids: tableData.listData.map(item => item.id),
    })
    if (code === 200 && data) {
      tableData.listData.forEach(item => {
        item.deploy_type = data[item.id]
        if (data.cdn_resources.includes(item.id)) {
          item.deploy_type = DeployTypeEnum.CDN
        } else {
          item.deploy_type = DeployTypeEnum.NotAssociated
        }
      })
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-65'))
    }
  } finally {
    relatedLoading.value = false
  }
}
const getTableList = async () => {
  try {
    tableData.loading = true
    const { code, data, msg } = await _getCertList({
      domain: props.tableForm.domain,
      cert_id: props.tableForm.cert_id,
      status: state.value,
      source: props.tableForm.source,
      page: tableData.pagination.page,
      limit: tableData.pagination.page_size,
    })
    if (code === 200 && data) {
      tableData.listData = data.items
      tableData.total = data.total
      getCertRelatedResources()
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-34'))
    }
  } finally {
    tableData.loading = false
  }
}

const updateCertRemark = async (row: ListCertResp['items'][0]) => {
  // 修改备注
  ElMessageBox.prompt(
    t('ssl-certificate.management.index.922533-35'),
    t('ssl-certificate.management.index.922533-21'),
    {
      confirmButtonText: t('ssl-certificate.management.index.922533-23'),
      inputPattern: /^.+$/,
      inputErrorMessage: t('ssl-certificate.management.index.922533-36'),
      // inputValue: row.remark || ' ',
    },
  ).then(async ({ value }) => {
    const { code, msg } = await _updateCertRemark({
      cert_id: row.cert_id,
      remark: value,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.922533-37'))
      row.remark = value
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-38'))
    }
  })
}

// 查看详情
const certDetails = (row: ListCertResp['items'][0]) => {
  _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '0')
  _s_setItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE, row.cert_domain_type)
  _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
  pushRoute({
    name: 'ssl_certificate_details',
    params: {
      id: row.cert_id,
    },
    query: {
      cert_id: row.cert_id,
      id: row.id,
      factory_id: row.factory_id,
      cert_type: row.cert_type,
    },
  })
}

// 证书操作
const operate_map: {
  key: string
  label: (row: ListCertResp['items'][0]) => string
  disabled?: boolean
  show: (status: ListCertResp['items'][0]['status']) => boolean
  event: (row: ListCertResp['items'][0]) => void
}[] = [
  {
    key: 'submitApply',
    label: () => t('ssl-certificate.management.index.922533-39'),
    show: status => [1].includes(status),
    event: row => {
      // 跳转到提交申请页面
      _s_setItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE, row.cert_domain_type)
      _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
      pushRoute({
        name: 'ssl_certificate_apply',
        query: { cert_id: row.cert_id, factory_id: row.factory_id, cert_type: row.cert_type },
      })
    },
  },
  {
    key: 'verifyDomain',
    label: () => t('ssl-certificate.management.index.922533-40'),
    show: status => [2, 3].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_APPLY_TAB, 1)
      _s_setItem(SSL_CERTIFICATE_VERIFY_TYPE, row.validate_type)
      _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
      pushRoute({ name: 'ssl_certificate_apply', query: { cert_id: row.cert_id, factory_id: row.factory_id } })
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-41'),
    show: status => [2, 3, 4, 10].includes(status),
    event: row => {
      cancelCert(row)
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-42'),
    show: status => [4, 10].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '0')
      _s_setItem(SSL_CERTIFICATE_FACTORY_ID, row.factory_id)
      pushRoute({
        name: 'ssl_certificate_verify_info',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          factory_id: row.factory_id,
          validate_type: row.validate_type,
        },
      })
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-43'),
    show: status => [5, 7].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_CERT_DOMAIN_TYPE, row.cert_domain_type)
      pushRoute({
        name: 'ssl_certificate_deploy',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          id: row.id,
          domain: row.domain,
          cert_type: row.cert_type,
        },
      })
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-33'),
    show: status => [5, 7].includes(status),
    event: row => {
      // 存储当前操作数据
      tableData.operateData = row
      downloadStore.dialogVisible = true
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-44'),
    show: status => [5, 7].includes(status),
    event: row => {
      pushRoute({
        name: 'ssl_certificate_update',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          id: row.id,
          domain: row.domain,
          cert_type: row.cert_type,
        },
      })
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-45'),
    show: status => [5, 7].includes(status),
    event: row => {
      _s_setItem(SSL_CERTIFICATE_DETAILS_TAB, '1')
      replaceRoute({
        name: 'ssl_certificate_details',
        params: {
          id: row.cert_id,
        },
        query: {
          cert_id: row.cert_id,
          id: row.id,
          domain: row.domain,
        },
      })
    },
  },
  {
    key: '',
    label: row =>
      row.is_notify == 1
        ? t('ssl-certificate.management.index.922533-46')
        : t('ssl-certificate.management.index.922533-47'),
    show: status => [5, 7].includes(status),
    event: row => {
      updateNotify(row)
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-48'),
    show: status => [1, 5, 6, 7, 8, 11].includes(status),
    disabled: relatedLoading.value,
    event: row => {
      deleteCert(row)
    },
  },
  {
    key: '',
    label: () => t('ssl-certificate.management.index.922533-49'),
    show: status => [5, 7].includes(status),
    event: row => {
      window.open(documentUrl + `document/detail?type=ssl&docs=2671230721613`)
    },
  },
  // {
  //   key: '',
  //   label: () => '重新申请',
  //   show: status => [6].includes(status),
  //   event: row => {
  //     // 存储当前操作数据
  //     tableData.operateData = row
  //     reIssueDialogVisible.value = true
  //   },
  // },
]
const getOperateMap = (row: ListCertResp['items'][0]) => operate_map.filter(item => item.show(row.status))

// 修改证书通知提醒状态
const updateNotifyStore = reactive({
  loading: false,
})
const updateNotify = async (row: ListCertResp['items'][0]) => {
  ElMessageBox({
    title: t('ssl-certificate.management.index.922533-21'),
    message: h(
      'div',
      row.is_notify == 1
        ? t('ssl-certificate.management.index.922533-50')
        : t('ssl-certificate.management.index.922533-51'),
    ),
    showCancelButton: true,
    customClass: 'delete-message-box',
    confirmButtonText: t('ssl-certificate.management.index.922533-23'),
    confirmButtonClass: 'mb-confirm',
    cancelButtonText: t('ssl-certificate.management.index.922533-24'),
    cancelButtonClass: 'mb-cancel',
  }).then(async () => {
    try {
      updateNotifyStore.loading = true
      const status = row.is_notify === 1 ? 2 : 1
      const { code, msg } = await _updateNotifyStatus({
        cert_id: row.cert_id,
        status,
      })
      if (code === 200) {
        ElMessage.success(t('ssl-certificate.management.index.922533-52'))
        row.is_notify = status
      } else {
        ElMessage.error(msg || t('ssl-certificate.management.index.922533-38'))
      }
    } finally {
      updateNotifyStore.loading = false
    }
  })
}

// 删除证书
const deleteStore = reactive({
  // dialogVisible: false,
  loading: false,
})
const deleteCert = async (row: ListCertResp['items'][0]) => {
  if (row.deploy_type === DeployTypeEnum.NotAssociated) {
    // 删除证书
    ElMessageBox({
      title: t('ssl-certificate.management.index.922533-21'),
      message: h('div', t('ssl-certificate.management.index.922533-53')),
      showCancelButton: true,
      customClass: 'delete-message-box',
      confirmButtonText: t('ssl-certificate.management.index.922533-23'),
      confirmButtonClass: 'mb-confirm',
      cancelButtonText: t('ssl-certificate.management.index.922533-24'),
      cancelButtonClass: 'mb-cancel',
    }).then(async () => {
      try {
        deleteStore.loading = true
        const { code, msg } = await _deleteCert({
          cert_id: row.cert_id,
        })
        if (code === 200) {
          getTableList()
          // 更新统计数据
          emit('getAnalysisGroupByStatusCount')
          message.success(t('ssl-certificate.management.index.922533-56-0'))
        } else {
          ElMessage.error(msg || t('ssl-certificate.management.index.922533-56'))
        }
      } finally {
        deleteStore.loading = false
      }
    })
  } else {
    ElMessageBox({
      title: t('ssl-certificate.management.index.922533-21'),
      message: h('div', [
        h(TipsBar, t('ssl-certificate.management.index.922533-54')),
        h(
          'div',
          {
            style: 'margin-top: 20px',
          },
          // t('ssl-certificate.management.index.922533-55', [row.cert_id]),
        ),
      ]),
      confirmButtonText: t('ssl-certificate.management.index.922533-23'),
    })
  }
}

/// 吊销证书弹窗
const revokeDialogVisible = ref(false)
const revokeCertificate = async () => {
  revokeDialogVisible.value = false
  if (!tableData.operateData) {
    ElMessage.error(t('ssl-certificate.management.index.922533-57'))
    return
  }
  pushRoute({
    name: 'ssl_certificate_revoke',
    params: {
      id: tableData.operateData?.id,
    },
  })
}
/// 重颁发证书弹窗
const reIssueDialogVisible = ref(false)
const reIssueRevokeCertificate = async () => {
  // TODO 重颁发证书
  reIssueDialogVisible.value = false
}

/// 证书下载弹窗
const downloadStore = reactive({
  dialogVisible: false,
  loading: false,
  types: SSLCertTypes,
})
const handleCertificateDownload = async (row: (typeof SSLCertTypes)[0]) => {
  if (!tableData.operateData) {
    ElMessage.error(t('ssl-certificate.management.index.922533-61'))
    return
  }
  // 证书下载
  try {
    downloadStore.loading = true
    const { code, msg, data } = await _downloadCert({
      cert_id: tableData.operateData.cert_id,
      type: row.value,
    })
    if (code === 200 && data) {
      switch (row.value) {
        case SSLCertDownloadEnum.Apache:
          if (data.content) zip.file(`${tableData.operateData.cert_id}.crt`, data.content)
          if (data.private_key) zip.file(`${tableData.operateData.cert_id}.key`, data.private_key)
          break
        case SSLCertDownloadEnum.Nginx:
        case SSLCertDownloadEnum.IIS:
          if (data.content) zip.file(`${tableData.operateData.cert_id}.pem`, data.content)
          if (data.content) zip.file(`${tableData.operateData.cert_id}.crt`, data.content)
          if (data.private_key) zip.file(`${tableData.operateData.cert_id}.key`, data.private_key)
          break
        default:
          break
      }
      zip.generateAsync({ type: 'blob' }).then(content => {
        download(content, `${tableData.operateData?.domain}_${row.content}_${createRandomStr(5)}.zip`)
      })
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-62'))
    }
  } finally {
    downloadStore.loading = false
  }
}

/// 取消申请
const cancelCert = (row: ListCertResp['items'][0]) => {
  ElMessageBox({
    title: t('ssl-certificate.management.index.922533-21'),
    message: h('div', t('ssl-certificate.management.index.922533-63')),
    showCancelButton: true,
    customClass: 'delete-message-box',
    confirmButtonText: t('ssl-certificate.management.index.922533-23'),
    confirmButtonClass: 'mb-confirm',
    cancelButtonText: t('ssl-certificate.management.index.922533-24'),
    cancelButtonClass: 'mb-cancel',
  }).then(async () => {
    const { code, msg } = await _cancelCert({
      cert_id: row.cert_id,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.management.index.922533-64'))
      getTableList()
      // 更新统计数据
      emit('getAnalysisGroupByStatusCount')
    } else {
      message.error(msg || t('ssl-certificate.management.index.922533-38'))
    }
  })
}

defineExpose({
  updateState,
  getTableList,
})
</script>

<style lang="scss" scoped>
.cert-info {
  font-size: 14px;
  font-weight: 400;

  .id {
    color: #0063ff;
    cursor: pointer;
  }

  .remark {
    .text {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .copy-icon {
      margin-left: 4px;
      color: #999;

      &:hover {
        color: var(--primary-color) !important;
      }
    }
  }
}

.rotate {
  @include rotate;
}
</style>
<style lang="scss">
.delete-message-box {
  padding-bottom: 24px !important;

  .el-message-box__btns {
    display: flex;
    flex-direction: row-reverse;
    justify-content: center;
    margin-top: 20px;

    .mb-confirm {
      margin-right: 10px;
    }
  }
}
</style>
