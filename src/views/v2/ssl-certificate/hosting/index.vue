<template>
  <div class="ssl-hosting-v2">
    <PageBreadcrumbToolbar :items="[t('ssl-certificate.router.065749-0')]" @doc="openHelpDoc" />
    <InfoNotice>
      <span>{{ t('ssl-certificate.hoting.index.614567-0') }}</span>
    </InfoNotice>

    <section class="ssl-hosting-v2__panel">
      <div class="ssl-hosting-v2__toolbar">
        <el-button type="primary" @click="handleAdd">
          {{ t('ssl-certificate.hoting.index.614567-1') }}
        </el-button>

        <div class="ssl-hosting-v2__toolbar-right">
          <FilterInput
            ref="filterInputRef"
            :placeholder="t('ssl-certificate.hoting.index.614567-2')"
            class="ssl-hosting-v2__search"
            :filter-list="filterList"
            @search="filterSearchFn"
          />

          <button class="ssl-hosting-v2__icon-btn" type="button" @click="reset">
            <SvgIcon name="cat-cdn-refresh" :loading="tableData.loading" />
          </button>
        </div>
      </div>

      <TableV2
        v-loading="tableData.loading"
        :data="tableData.listData"
        :total="tableData.total"
        :pagination="pagination"
        show-pagination
        @update:pagination="handlePaginationChange"
      >
        <el-table-column :label="t('ssl-certificate.hoting.index.614567-3')" min-width="220">
          <template #default="{ row }">
            <div class="ssl-hosting-v2__primary">
              <Copy class="ssl-hosting-v2__link" :text="row.cert_id">
                ID：<span @click="handleOperate('details', row)">{{ row.cert_id }}</span>
              </Copy>
              <div class="ssl-hosting-v2__sub-text">
                {{ t('ssl-certificate.hoting.index.614567-4') }}{{ row.remark || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.hoting.index.614567-5')" prop="domain" min-width="180">
          <template #default="{ row }">
            <Copy v-if="row.domain" :text="row.domain">
              <span>{{ row.domain }}</span>
            </Copy>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.hoting.index.614567-6')" min-width="200">
          <template #default="{ row }">
            <div class="ssl-hosting-v2__primary">
              <div class="ssl-hosting-v2__status" :class="`is-${getStatusTone(row.status)}`">
                <span class="ssl-hosting-v2__status-dot" />
                <span>{{ filterArray(StatusTypeMap, 'value', row.status)?.label || '-' }}</span>
              </div>
              <div class="ssl-hosting-v2__sub-text">
                {{
                  getDateDayjs(row.cert_expire_at < 0 ? row.cert_expire_at : row.cert_expire_at * 1000, 'string', true)
                }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.hoting.index.614567-7')" min-width="220">
          <template #default="{ row }">
            <div class="ssl-hosting-v2__associate">
              <span class="ssl-hosting-v2__associate-text">
                {{
                  row.associated_type == AssociatedTypeEnum.AUTO
                    ? t('ssl-certificate.hoting.index.614567-8')
                    : row.associated_type == AssociatedTypeEnum.MANUAL
                      ? t('ssl-certificate.hoting.index.614567-60', [row.associated_cert_id])
                      : '-'
                }}
              </span>
              <button class="ssl-hosting-v2__text-btn" type="button" @click="handleOperate('relevance', row)">
                {{ t('ssl-certificate.hoting.index.614567-13') }}
              </button>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.hoting.index.614567-9')" min-width="140">
          <template #default="{ row }">
            <div class="ssl-hosting-v2__status" :class="`is-${getStatusTone(row.status)}`">
              <span class="ssl-hosting-v2__status-dot" />
              <span>{{ filterArray(StatusTypeMap, 'value', row.status)?.label || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.hoting.index.614567-10')" prop="remark" min-width="180">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>

        <el-table-column :label="t('ssl-certificate.hoting.index.614567-11')" min-width="220" fixed="right">
          <template #default="{ row }">
            <div class="ssl-hosting-v2__ops">
              <button
                v-for="operate in getOperateMap(row)"
                :key="operate.key"
                type="button"
                @click="() => operate.event(row)"
              >
                {{ operate.label(row) }}
              </button>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <el-dialog
      v-model="relevanceDialogStore.visible"
      :title="t('ssl-certificate.hoting.index.614567-7')"
      @close="handleDialogClose('relevance')"
    >
      <el-form
        ref="relevanceForm"
        :rules="relevanceFormRules"
        :model="relevanceDialogStore.fromData"
        label-position="left"
        label-width="auto"
      >
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-16')">
          <div style="margin-top: 7px">
            <div class="ssl-hosting-v2__link">
              <Copy class="ssl-hosting-v2__link" :text="tableData.selectRow?.cert_id">
                ID：{{ tableData.selectRow?.cert_id }}
              </Copy>
            </div>
            <div class="ssl-hosting-v2__form-tip mt10 mb10">
              {{ t('ssl-certificate.hoting.index.614567-17')
              }}{{ getDateDayjs(tableData.selectRow?.cert_expire_at! * 1000, 'string', true) }}
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-18')" prop="domain">
          <EllipsisTooltip :text="tableData.selectRow?.domain || '-'" />
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-19')" prop="associated_type">
          <el-radio-group v-model="relevanceDialogStore.fromData.associated_type">
            <el-radio v-for="a in associatedTypeMap" :key="a.value" :label="a.value">
              {{ a.label }}
            </el-radio>
          </el-radio-group>
          <p class="ssl-hosting-v2__form-tip">
            {{ filterArray(associatedTypeMap, 'value', relevanceDialogStore.fromData.associated_type)?.desc }}
          </p>
        </el-form-item>
        <el-form-item
          v-if="relevanceDialogStore.fromData.associated_type == AssociatedTypeEnum.MANUAL"
          :label="t('ssl-certificate.hoting.index.614567-23')"
          prop="associated_cert_id"
        >
          <el-select v-model="relevanceDialogStore.fromData.associated_cert_id" filterable>
            <el-option
              v-for="cert in relevanceDialogStore.certList"
              :key="cert.cert_id"
              :label="`${cert.cert_id} | ${cert.domain}`"
              :value="cert.cert_id"
            />
          </el-select>
          <p class="ssl-hosting-v2__form-tip">
            {{ t('ssl-certificate.hoting.index.614567-24', { time: newCertExpireTime }) }}
          </p>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="primary" :loading="relevanceDialogStore.loading" @click="relevanceConfirm">
            {{ t('ssl-certificate.hoting.index.614567-25') }}
          </el-button>
          <el-button @click="relevanceDialogStore.visible = false">
            {{ t('ssl-certificate.hoting.index.614567-26') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="cancelHostingDialogStore.visible"
      :title="t('ssl-certificate.hoting.index.614567-12')"
      width="420"
      @close="handleDialogClose('cancel')"
    >
      <span style="color: #000">{{ t('ssl-certificate.hoting.index.614567-27') }}</span>
      <template #footer>
        <div style="text-align: center">
          <el-button type="primary" :loading="cancelHostingDialogStore.loading" @click="cancelHostingConfirm">
            {{ t('ssl-certificate.hoting.index.614567-25') }}
          </el-button>
          <el-button @click="cancelHostingDialogStore.visible = false">
            {{ t('ssl-certificate.hoting.index.614567-26') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editDialogStore.visible"
      :title="t('ssl-certificate.hoting.index.614567-15')"
      width="810"
      @close="handleDialogClose('edit')"
    >
      <el-form
        ref="ruleFormRef"
        :rules="formRules"
        :model="editDialogStore.fromData"
        label-position="left"
        label-width="auto"
      >
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-28')" prop="hosting_type_arr">
          <el-checkbox-group v-model="editDialogStore.fromData.hosting_type_arr">
            <el-checkbox value="1" label="1" style="height: 32px !important; margin-right: 40px">
              {{ t('ssl-certificate.hoting.index.614567-29') }}
            </el-checkbox>
          </el-checkbox-group>
          <p class="ssl-hosting-v2__form-tip">
            {{ t('ssl-certificate.hoting.index.614567-31') }}
          </p>
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-32')" prop="hosting_date">
          <el-radio-group v-model="editDialogStore.fromData.hosting_date">
            <el-radio :label="HostingDateEnum.Date1">
              {{ t('ssl-certificate.hoting.index.614567-34-0', [HostingDateEnum.Date1]) }}
            </el-radio>
            <el-radio :label="HostingDateEnum.Date2">
              {{ t('ssl-certificate.hoting.index.614567-34-0', [HostingDateEnum.Date2]) }}
            </el-radio>
          </el-radio-group>
          <p class="ssl-hosting-v2__form-tip">
            {{ t('ssl-certificate.hoting.index.614567-37', { day: editDialogStore.fromData.hosting_date }) }}
          </p>
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-38')" prop="hosting_time_arr">
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon class="mr10" name="cat-cdn-help" />
          </el-tooltip>
          <div style="width: 240px">
            <el-time-picker
              v-model="editDialogStore.fromData.hosting_time_arr"
              is-range
              range-separator="~"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 240px"
            />
          </div>
          <p class="ssl-hosting-v2__form-tip">
            {{ t('ssl-certificate.hoting.index.614567-39') }}
          </p>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="primary" :loading="editDialogStore.loading" @click="editConfirm">
            {{ t('ssl-certificate.hoting.index.614567-25') }}
          </el-button>
          <el-button @click="editDialogStore.visible = false">
            {{ t('ssl-certificate.hoting.index.614567-26') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailsStore.visible"
      :title="t('ssl-certificate.hoting.index.614567-40')"
      size="50%"
      class="hot-drawer"
      modal-class="detail-modal"
    >
      <template #header="{ titleId, titleClass }">
        <p :id="titleId" :class="titleClass" class="title">
          {{ t('ssl-certificate.hoting.index.614567-40') }}
        </p>
      </template>
      <el-form v-loading="detailsStore.loading" label-position="left" label-width="auto">
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-28')">
          {{ [t('ssl-certificate.hoting.index.614567-29')][Number(detailsStore.data?.host_type || 0) - 1] || '-' }}
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-16')">
          <EllipsisTooltip
            :text="`ID：${detailsStore.data?.old_cert_id || '-'} | ${detailsStore.data?.domain || '-'}`"
          />
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-19')">
          {{ filterArray(associatedTypeMap, 'value', detailsStore.data?.associated_type)?.label || '-' }}
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-23')">
          <EllipsisTooltip
            v-if="detailsStore.data?.associated_cert_id"
            :text="`ID：${detailsStore.data?.associated_cert_id || '-'} | ${detailsStore.data?.associated_cert_domain || '-'}`"
          />
          <span v-else>-</span>
        </el-form-item>
        <el-form-item :label="t('ssl-certificate.hoting.index.614567-32')">
          <EllipsisTooltip
            :text="`${getDateDayjs(new Date(`${detailsStore.data?.hosting_date || ''} ${detailsStore.data?.hosting_time}`), 'string', true)} ~ ${getDateDayjs(new Date(`${detailsStore.data?.hosting_date || ''} ${detailsStore.data?.hosting_end_time}`), 'string', true)}`"
          />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { documentUrl } from '@/config/base-config'
import {
  _associateCert,
  _cancelHosting,
  _delHosting,
  _getAssociateCerts,
  _getHostingDetails,
  _getHostingList,
  _hostingSetting,
} from '@/apis/ssl-certificate/hosting'
import type {
  AssociateCertReq,
  GetAssociateCertResp,
  GetHostingDetailsResp,
  HostingSettingReq,
  ListHostingResp,
} from '@/apis/ssl-certificate/hosting/type'
import Copy from '@/views/ssl-certificate/management/components/copy.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import FilterInput, { type FilterListType } from '@/components/cvm/query-filter/filter-input.vue'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import { filterArray } from '@/utils/filter'
import { AssociatedTypeEnum, associatedTypeMap, HostingStatusEnum, StatusTypeMap } from '@/views/ssl-certificate/config'
import { HostingDateEnum } from '@/views/ssl-certificate/hosting/config'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus/es'

const tableForm = reactive<{
  cert_id?: string
  domain?: string
  status: number
}>({
  cert_id: '',
  domain: '',
  status: 0,
})

const filterList: FilterListType[] = [
  {
    fieldName: t('ssl-certificate.hoting.index.614567-3'),
    fieldKey: 'cert_id',
  },
  {
    fieldName: t('ssl-certificate.hoting.index.614567-44'),
    fieldKey: 'domain',
  },
]

const filterInputRef = ref<InstanceType<typeof FilterInput>>()

interface TableDataType {
  listData: ListHostingResp['items']
  selectListData: ListHostingResp['items']
  selectRow?: ListHostingResp['items'][0]
  loading: boolean
  pagination: {
    page: number
    page_size: number
  }
  total: number
}

const tableData = reactive<TableDataType>({
  listData: [],
  selectListData: [],
  loading: false,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: tableData.pagination.page,
  pageSize: tableData.pagination.page_size,
}))

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  tableData.pagination.page = page
  tableData.pagination.page_size = pageSize
  getTableList()
}

const filterSearchFn = data => {
  tableForm.cert_id = data.cert_id
  tableForm.domain = data.domain
  tableData.pagination.page = 1
  getTableList()
}

const reset = () => {
  tableForm.status = 0
  tableForm.cert_id = ''
  tableForm.domain = ''
  tableData.pagination.page = 1
  if (filterInputRef.value) {
    filterInputRef.value.searchList = []
  }
  getTableList()
}

const getStatusTone = (status: number) => {
  if (status === HostingStatusEnum.Status1 || status === HostingStatusEnum.Status2) return 'success'
  if (status === HostingStatusEnum.Status4) return 'danger'
  return 'muted'
}

const getTableList = async () => {
  try {
    tableData.loading = true
    const { code, msg, data } = await _getHostingList({
      ...tableForm,
      ...tableData.pagination,
    })
    if (code === 200 && data) {
      tableData.listData = data.items
      tableData.total = data.total
    } else {
      message.error(msg || t('ssl-certificate.hoting.index.614567-46'))
    }
  } finally {
    tableData.loading = false
  }
}

const handleAdd = () => {
  pushRoute('/ssl/hosting/add')
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const cancelHostingDialogStore = reactive({
  visible: false,
  loading: false,
})

const cancelHostingConfirm = async () => {
  if (!tableData.selectRow) {
    message.error(t('ssl-certificate.hoting.index.614567-47'))
    return
  }
  try {
    cancelHostingDialogStore.loading = true
    const { code, msg } = await _cancelHosting({
      hosting_id: tableData.selectRow.id,
    })
    if (code === 200) {
      message.success(t('ssl-certificate.hoting.index.614567-48'))
      cancelHostingDialogStore.visible = false
      getTableList()
    } else {
      message.error(msg || t('ssl-certificate.hoting.index.614567-49'))
    }
  } finally {
    cancelHostingDialogStore.loading = false
  }
}

const relevanceDialogStore = reactive<{
  visible: boolean
  loading: boolean
  fromData: Partial<AssociateCertReq>
  certList: GetAssociateCertResp['items']
}>({
  visible: false,
  loading: false,
  fromData: {
    associated_type: 1,
  },
  certList: [],
})

const relevanceForm = ref<FormInstance>()
const relevanceFormRules = reactive<FormRules<typeof relevanceDialogStore.fromData>>({
  associated_cert_id: [
    {
      validator(rule, value, callback) {
        if (relevanceDialogStore.fromData.associated_type == AssociatedTypeEnum.MANUAL) {
          if (!value) {
            callback(new Error(t('ssl-certificate.hoting.index.614567-50')))
          } else {
            const cert = relevanceDialogStore.certList.find(
              v => v.cert_id === relevanceDialogStore.fromData.associated_cert_id,
            )
            if (tableData.selectRow!.cert_expire_at >= cert!.expire_at) {
              callback(new Error(t('ssl-certificate.hoting.index.614567-61')))
            } else {
              callback()
            }
          }
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
})

const newCertExpireTime = computed(() => {
  if (!relevanceDialogStore.fromData.associated_cert_id) return '-'
  const cert = relevanceDialogStore.certList.find(v => v.cert_id === relevanceDialogStore.fromData.associated_cert_id)
  if (!cert) return '-'
  return getDateDayjs(cert.expire_at * 1000, 'string', true)
})

const getUpdateCert = async () => {
  if (!tableData.selectRow?.cert_id) return
  const { code, data, msg } = await _getAssociateCerts({
    cert_id: tableData.selectRow.cert_id,
  })
  if (code === 200 && data) {
    relevanceDialogStore.certList = data.items
  } else {
    message.error(msg || t('ssl-certificate.hoting.index.614567-46'))
  }
}

const relevanceConfirm = async () => {
  await relevanceForm.value?.validate()
  if (!tableData.selectRow) {
    ElMessage.error(t('ssl-certificate.hoting.index.614567-51'))
    return
  }
  try {
    relevanceDialogStore.loading = true
    const data: AssociateCertReq = {
      associated_type: relevanceDialogStore.fromData.associated_type!,
      hosting_id: tableData.selectRow.id,
    }
    if (relevanceDialogStore.fromData.associated_type == AssociatedTypeEnum.MANUAL) {
      data.associated_cert_id = relevanceDialogStore.fromData.associated_cert_id
    }
    const { code, msg } = await _associateCert(data)
    if (code === 200) {
      message.success(t('ssl-certificate.hoting.index.614567-52'))
      getTableList()
      relevanceDialogStore.visible = false
    } else {
      message.error(msg || t('ssl-certificate.hoting.index.614567-53'))
    }
  } finally {
    relevanceDialogStore.loading = false
  }
}

const editDialogStore = reactive<{
  visible: boolean
  loading: boolean
  fromData: HostingSettingReq & {
    hosting_type_arr: string[]
    hosting_time_arr: string[]
  }
}>({
  visible: false,
  loading: false,
  fromData: {
    hosting_date: HostingDateEnum.Date1,
    hosting_id: 0,
    hosting_time: '',
    hosting_end_time: '',
    hosting_type: '',
    hosting_type_arr: [],
    hosting_time_arr: [],
  },
})

watch(
  () => editDialogStore.fromData.hosting_type_arr,
  () => {
    editDialogStore.fromData.hosting_type = editDialogStore.fromData.hosting_type_arr.join(',')
  },
)

const ruleFormRef = ref<FormInstance>()
const formRules = reactive<FormRules<typeof editDialogStore.fromData>>({
  hosting_type_arr: [
    {
      required: true,
      validator(rule, value, callback) {
        if (editDialogStore.fromData.hosting_type_arr.length === 0) {
          callback(new Error(t('ssl-certificate.hoting.index.614567-54')))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  hosting_date: [
    {
      required: true,
      validator(rule, value, callback) {
        if (!value || (value !== HostingDateEnum.Date1 && value !== HostingDateEnum.Date2)) {
          callback(new Error(t('ssl-certificate.hoting.index.614567-62')))
        } else {
          tableData.selectRow!.cert_expire_at * 1000 - new Date().getTime() > value * 24 * 60 * 60 * 1000 ||
          value == HostingDateEnum.Date2
            ? callback()
            : callback(new Error(t('ssl-certificate.hoting.add.140323-31', [value])))
        }
      },
      trigger: 'change',
    },
  ],
  hosting_time_arr: [
    {
      required: true,
      validator(rule, value: string[], callback) {
        if (!value || value.length === 0) {
          callback(new Error(t('ssl-certificate.hoting.add.140323-25')))
          return
        }
        const startTime = value[0]
          .split(':')
          .map((d, i) => (i === 0 ? Number(d) * 60 : Number(d)))
          .reduce((a, b) => a + b, 0)
        const endTime = value[1]
          .split(':')
          .map((d, i) => (i === 0 ? Number(d) * 60 : Number(d)))
          .reduce((a, b) => a + b, 0)

        if (endTime - startTime < 60) {
          callback(new Error(t(t('ssl-certificate.hoting.add.304631-0'))))
        }
        callback()
      },
      trigger: 'change',
    },
  ],
})

const editConfirm = async () => {
  await ruleFormRef.value?.validate()
  if (!tableData.selectRow) {
    ElMessage.error(t('ssl-certificate.hoting.index.614567-51'))
    return
  }
  try {
    editDialogStore.loading = true
    const { code, msg } = await _hostingSetting({
      hosting_date: editDialogStore.fromData.hosting_date,
      hosting_id: tableData.selectRow.id,
      hosting_time: editDialogStore.fromData.hosting_time_arr[0],
      hosting_end_time: editDialogStore.fromData.hosting_time_arr[1],
      hosting_type: editDialogStore.fromData.hosting_type,
    })
    if (code === 200) {
      ElMessage.success(t('ssl-certificate.hoting.index.614567-56'))
      editDialogStore.visible = false
      getTableList()
    } else {
      ElMessage.error(msg || t('ssl-certificate.hoting.index.614567-57'))
    }
  } finally {
    editDialogStore.loading = false
  }
}

const handleDialogClose = (type: string) => {
  switch (type) {
    case 'relevance':
      relevanceDialogStore.fromData = {
        associated_type: 1,
      }
      relevanceForm.value?.resetFields()
      break
    case 'edit':
      editDialogStore.fromData = {
        hosting_date: HostingDateEnum.Date1,
        hosting_id: 0,
        hosting_time: '',
        hosting_end_time: '',
        hosting_type: '',
        hosting_type_arr: [],
        hosting_time_arr: [],
      }
      ruleFormRef.value?.resetFields()
      break
    default:
      break
  }
  return true
}

const detailsStore = reactive<{
  visible: boolean
  loading: boolean
  data?: GetHostingDetailsResp
}>({
  visible: false,
  loading: false,
})

const getHostingDetails = async () => {
  detailsStore.visible = true
  if (!tableData.selectRow) {
    ElMessage.error(t('ssl-certificate.hoting.index.614567-58'))
    return
  }
  try {
    detailsStore.loading = true
    const { code, msg, data } = await _getHostingDetails({
      id: tableData.selectRow.id,
    })
    if (code === 200 && data) {
      detailsStore.data = data
    } else {
      ElMessage.error(msg || t('ssl-certificate.hoting.index.614567-59'))
    }
  } finally {
    detailsStore.loading = false
  }
}

const deleteHostingHistory = async () => {
  ElMessageBox({
    title: t('ssl-certificate.management.index.922533-21'),
    message: h('div', t('ssl-certificate.hoting.index.614567-68')),
    showCancelButton: true,
    customClass: 'delete-message-box',
    confirmButtonText: t('ssl-certificate.hoting.index.614567-25'),
    confirmButtonClass: 'mb-confirm',
    cancelButtonText: t('ssl-certificate.hoting.index.614567-26'),
    cancelButtonClass: 'mb-cancel',
  }).then(async () => {
    if (!tableData.selectRow) {
      ElMessage.error(t('ssl-certificate.hoting.index.614567-58'))
      return
    }

    const { code, msg } = await _delHosting({
      id: tableData.selectRow.id,
    })
    if (code === 200) {
      ElMessage.success(t('ssl-certificate.management.index.922533-56-0'))
      getTableList()
    } else {
      ElMessage.error(msg || t('ssl-certificate.management.index.922533-56'))
    }
  })
}

const operate_map: {
  key: string
  label: (row: ListHostingResp['items'][0]) => string
  show: (status: ListHostingResp['items'][0]['status']) => boolean
  event: (row: ListHostingResp['items'][0]) => void
}[] = [
  {
    key: 'cancel_hosting',
    label: () => t('ssl-certificate.hoting.index.614567-12'),
    show: status => [HostingStatusEnum.Status1].includes(status),
    event: row => {
      tableData.selectRow = row
      cancelHostingDialogStore.visible = true
    },
  },
  {
    key: 'edit',
    label: () => t('ssl-certificate.hoting.index.614567-13'),
    show: status => [HostingStatusEnum.Status1].includes(status),
    event: row => {
      tableData.selectRow = row
      editDialogStore.fromData.hosting_type = '1'
      editDialogStore.fromData.hosting_date = row.hosting_date
      editDialogStore.fromData.hosting_time_arr[0] = row.hosting_time || ''
      editDialogStore.fromData.hosting_time_arr[1] = row.hosting_end_time || ''
      editDialogStore.fromData.hosting_type_arr = '1'.split(',').map(item => item)
      editDialogStore.visible = true
    },
  },
  {
    key: 'details',
    label: () => t('ssl-certificate.hoting.index.614567-14'),
    show: status => [HostingStatusEnum.Status2].includes(status),
    event: row => {
      tableData.selectRow = row
      getHostingDetails()
    },
  },
  {
    key: 'delete',
    label: () => t('ssl-certificate.hoting.index.614567-67'),
    show: status => [HostingStatusEnum.Status3, HostingStatusEnum.Status4].includes(status),
    event: row => {
      tableData.selectRow = row
      deleteHostingHistory()
    },
  },
]

const getOperateMap = (row: ListHostingResp['items'][0]) => operate_map.filter(item => item.show(row.status))

const handleOperate = (operate: string, row: ListHostingResp['items'][0]) => {
  tableData.selectRow = row
  switch (operate) {
    case 'relevance':
      getUpdateCert()
      relevanceDialogStore.fromData.associated_type = row.associated_type
      relevanceDialogStore.fromData.associated_cert_id = row.associated_cert_id
      relevanceDialogStore.visible = true
      break
    case 'details':
      getHostingDetails()
      break
    default:
      break
  }
}

onMounted(() => {
  getTableList()
})
</script>

<style lang="scss" scoped>
.ssl-hosting-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ssl-hosting-v2__panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;

  // border-radius: 0 0 16px 16px;
}

.ssl-hosting-v2__toolbar,
.ssl-hosting-v2__toolbar-right,
.ssl-hosting-v2__primary,
.ssl-hosting-v2__status,
.ssl-hosting-v2__associate,
.ssl-hosting-v2__ops {
  display: flex;
}

.ssl-hosting-v2__toolbar {
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.ssl-hosting-v2__toolbar-right {
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.ssl-hosting-v2__search {
  width: 360px;
  max-width: 100%;
}

.ssl-hosting-v2__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: #6b7280;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d7deea;
}

.ssl-hosting-v2__icon-btn:hover {
  color: #06f;
  border-color: #b7d0ff;
}

.ssl-hosting-v2__primary {
  flex-direction: column;
  gap: 4px;
}

.ssl-hosting-v2__sub-text {
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;
}

.ssl-hosting-v2__link {
  color: #06f;
  cursor: pointer;
}

.ssl-hosting-v2__status {
  gap: 8px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.ssl-hosting-v2__status.is-success {
  color: #12a150;
}

.ssl-hosting-v2__status.is-danger {
  color: #f04438;
}

.ssl-hosting-v2__status.is-muted {
  color: #667085;
}

.ssl-hosting-v2__status-dot {
  width: 8px;
  height: 8px;
  background: currentcolor;
  border-radius: 50%;
}

.ssl-hosting-v2__associate {
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.ssl-hosting-v2__associate-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ssl-hosting-v2__text-btn,
.ssl-hosting-v2__ops button {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ssl-hosting-v2__ops {
  flex-wrap: wrap;
  gap: 12px;
}

.ssl-hosting-v2__form-tip {
  width: 100%;
  color: #999;
}

@media (width <= 960px) {
  .ssl-hosting-v2__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .ssl-hosting-v2__toolbar-right {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .ssl-hosting-v2__search {
    width: 100%;
  }
}
</style>

<style lang="scss">
.hot-drawer {
  .title {
    font-weight: bold;
    color: #000;
  }

  .el-drawer__header {
    padding: 20px 40px 20px 20px;
    margin-bottom: 0;
    border-bottom: 1px solid #e8e8e8;
  }
}

.el-time-spinner__list::after,
.el-time-spinner__list::before {
  height: 0 !important;
}

.el-time-panel__content::before {
  margin-top: -81px;
}

.el-time-spinner__wrapper {
  max-height: 162px;
}

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
