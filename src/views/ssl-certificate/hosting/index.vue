<template>
  <TipsBar class="mb20" :tips="t('ssl-certificate.hoting.index.614567-0')" />
  <el-card shadow="never" class="table-container">
    <div class="df ac jsb table-form-group mb20">
      <div class="btn-group">
        <el-button type="primary" @click="handleAdd">
          {{ t('ssl-certificate.hoting.index.614567-1') }}
        </el-button>
      </div>
      <div class="df ac jfe search-group" style="flex: 1">
        <FilterInput
          ref="filterInputRef"
          class="mr10"
          :placeholder="t('ssl-certificate.hoting.index.614567-2')"
          :filter-list="filterList"
          @search="filterSearchFn"
        />
        <CdnIconButton @click="reset">
          <SvgIcon name="cat-cdn-refresh" />
        </CdnIconButton>
      </div>
    </div>
    <div class="table-group">
      <el-table
        v-loading="tableData.loading"
        show-overflow-tooltip
        :data="tableData.listData"
        @selection-change="tableSelect"
      >
        <!-- <el-table-column fixed="left" type="selection" /> -->
        <el-table-column prop="cert_id" :label="t('ssl-certificate.hoting.index.614567-3')" width="200">
          <template #default="{ row }">
            <Copy class="id" :text="row.cert_id">
              ID：<span @click="handleOperate('details', row)">{{ row.cert_id }}</span>
            </Copy>
            <P class="text"> {{ t('ssl-certificate.hoting.index.614567-4') }}{{ row.remark || 'undefined' }} </P>
          </template>
        </el-table-column>
        <el-table-column prop="domain" :label="t('ssl-certificate.hoting.index.614567-5')" width="180">
          <template #default="{ row }">
            <Copy v-if="row.domain" :text="row.domain">
              {{ row.domain }}
            </Copy>
            <template v-else> - </template>
          </template>
        </el-table-column>
        <el-table-column prop="id" :label="t('ssl-certificate.hoting.index.614567-6')" width="220">
          <template #header>
            <div class="df ac">
              <span class="mr4">{{ t('ssl-certificate.hoting.index.614567-6') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <p>{{ filterArray(StatusTypeMap, 'value', row.status)?.label || '-' }}</p>
            <p>
              {{
                getDateDayjs(row.cert_expire_at < 0 ? row.cert_expire_at : row.cert_expire_at * 1000, 'string', true)
              }}
            </p>
          </template>
        </el-table-column>
        <el-table-column prop="associated_type" :label="t('ssl-certificate.hoting.index.614567-7')" width="170">
          <template #default="{ row }">
            <div class="associated">
              <div class="info ellipsis">
                <span v-if="row.associated_type == AssociatedTypeEnum.AUTO" class="ellipsis" style="flex: 1">{{
                  t('ssl-certificate.hoting.index.614567-8')
                }}</span>
                <span v-else-if="row.associated_type == AssociatedTypeEnum.MANUAL">
                  {{ t('ssl-certificate.hoting.index.614567-60', [row.associated_cert_id]) }}
                </span>
                <span v-else>-</span>
              </div>
              <SvgIcon name="cat-cdn-edit" class="pointer ml4 copy-icon" @click="handleOperate('relevance', row)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('ssl-certificate.hoting.index.614567-9')">
          <template #header>
            <TableHeadFilter
              ref="networkChangeTypeThFilterRef"
              v-model="tableForm.status"
              :label="t('ssl-certificate.hoting.index.614567-9')"
              show-all
              field-type="select"
              field-key=""
              :list="StatusTypeMap"
              @change="getTableList"
            />
          </template>
          <template #default="{ row }">
            {{ filterArray(StatusTypeMap, 'value', row.status)?.label || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" :label="t('ssl-certificate.hoting.index.614567-10')">
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="t('ssl-certificate.hoting.index.614567-11')" min-width="170">
          <template #default="{ row }">
            <div class="df" style="flex-wrap: wrap">
              <el-link
                v-for="operate in getOperateMap(row)"
                :key="operate.key"
                :disabled="operate.disabled"
                type="primary"
                class="mr10"
                @click="() => operate.event(row)"
              >
                {{ operate.label(row) }}
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <CatPagination
        v-model:pagination="tableData.pagination"
        :total="tableData.total"
        :custom-keys="['page', 'page_size']"
        @change="getTableList"
      />
    </div>
  </el-card>
  <!-- 关联弹窗 -->
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
          <div class="id">
            <el-link type="primary">
              <Copy class="id" :text="tableData.selectRow?.cert_id"> ID：{{ tableData.selectRow?.cert_id }} </Copy>
            </el-link>
          </div>
          <div class="cert_expire_at form-tips mt10 mb10">
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
        <p class="form-tips">
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
        <p class="form-tips">
          {{ t('ssl-certificate.hoting.index.614567-24', { time: newCertExpireTime }) }}
        </p>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="mb10" style="text-align: center">
        <el-button type="primary" :loading="relevanceDialogStore.loading" @click="relevanceConfirm">
          {{ t('ssl-certificate.hoting.index.614567-25') }}
        </el-button>
        <el-button @click="relevanceDialogStore.visible = false">
          {{ t('ssl-certificate.hoting.index.614567-26') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 取消托管弹窗 -->
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
  <!-- 编辑弹窗 -->
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
          <!-- <el-checkbox value="2" label="2" style="height: 32px !important">
            {{ t('ssl-certificate.hoting.index.614567-30') }}
          </el-checkbox> -->
        </el-checkbox-group>
        <p style="width: 100%; color: #999">
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
        <p style="color: #999">
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
        <p style="color: #999">
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
  <!-- 查看详情弹窗 -->
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
        <EllipsisTooltip :text="`ID：${detailsStore.data?.old_cert_id || '-'} | ${detailsStore.data?.domain || '-'}`" />
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
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { type FormRules, type FormInstance, ElMessage, ElMessageBox } from 'element-plus/es'
import {
  _associateCert,
  _cancelHosting,
  _delHosting,
  _getAssociateCerts,
  _getHostingDetails,
  _getHostingList,
  _hostingSetting,
} from '@/apis/ssl-certificate/hosting'
import {
  AssociateCertReq,
  GetAssociateCertResp,
  GetHostingDetailsResp,
  HostingSettingReq,
  ListHostingResp,
} from '@/apis/ssl-certificate/hosting/type'
import FilterInput, { FilterListType } from '@/components/cvm/query-filter/filter-input.vue'
import TipsBar from '@/views/ssl-certificate/management/components/tips-bar.vue'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'
import TableHeadFilter from '@/components/cvm/query-filter/table-head-filter.vue'
import Copy from '../management/components/copy.vue'
import { message } from '@/utils/message'
import { getDateDayjs } from '@/utils/format-time'
import { filterArray } from '@/utils/filter'
import { AssociatedTypeEnum, associatedTypeMap, HostingStatusEnum, StatusTypeMap } from '../config'
import { HostingDateEnum } from './config'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()

/// 表格
const tableForm = reactive<{
  cert_id?: string
  domain?: string
  status: any
}>({
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
const filterSearchFn = data => {
  tableForm.cert_id = data.cert_id
  tableForm.domain = data.domain
  getTableList()
}

interface TableDataType {
  listData: ListHostingResp['items']
  selectListData: ListHostingResp['items']
  selectRow?: ListHostingResp['items'][0]
  loading: boolean
  height: number
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
  height: 450,
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})
const tableSelect = (rows: ListHostingResp['items']) => {
  tableData.selectListData = rows
}
const filterInputRef = ref<InstanceType<typeof FilterInput>>()
const networkChangeTypeThFilterRef = ref<InstanceType<typeof TableHeadFilter>>()
const getTableList = async () => {
  // 获取列表数据
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
const reset = () => {
  networkChangeTypeThFilterRef.value?.updateCheck(0)
  tableForm.status = 0
  if (filterInputRef.value) filterInputRef.value.searchList = []
}

const handleAdd = () => {
  // 新增托管
  pushRoute('/ssl/hosting/add')
}

/// 取消托管弹窗
const cancelHostingDialogStore = reactive({
  visible: false,
  loading: false,
})
const cancelHostingConfirm = async () => {
  // 取消托管
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

// 关联弹窗
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

const newCertExpireTime = computed(() => {
  if (!relevanceDialogStore.fromData.associated_cert_id) return '-'

  const cert = relevanceDialogStore.certList.find(v => v.cert_id === relevanceDialogStore.fromData.associated_cert_id)
  if (!cert) return '-'

  return getDateDayjs(cert.expire_at * 1000, 'string', true)
})

const getUpdateCert = async () => {
  if (!tableData.selectRow?.cert_id) {
    return
  }
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

    // 用户自定义关联证书
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

/// 编辑弹窗
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
        // 时间间隔要大于1小时
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
const editDialogStore = reactive<{
  visible: boolean
  loading: boolean
  fromData: HostingSettingReq
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
const editConfirm = async () => {
  await ruleFormRef.value?.validate()

  // 编辑托管
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

// 关闭弹窗
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

// 详情弹窗
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

// 删除托管
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

// 证书操作
const operate_map: {
  key: string
  label: (row: ListHostingResp['items'][0]) => string
  disabled?: boolean
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
      // 编辑
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
      // 查看详情
      getHostingDetails()
    },
  },
  // 删除
  {
    key: 'delete',
    label: () => t('ssl-certificate.hoting.index.614567-67'),
    show: status => [HostingStatusEnum.Status3, HostingStatusEnum.Status4].includes(status),
    event: row => {
      tableData.selectRow = row
      // 删除
      deleteHostingHistory()
    },
  },
]
const getOperateMap = (row: ListHostingResp['items'][0]) => operate_map.filter(item => item.show(row.status))

const handleOperate = (operate: string, row: ListHostingResp['items'][0]) => {
  // 操作
  tableData.selectRow = row

  switch (operate) {
    case 'relevance':
      getUpdateCert()
      relevanceDialogStore.fromData.associated_type = row.associated_type
      relevanceDialogStore.fromData.associated_cert_id = row.associated_cert_id
      relevanceDialogStore.visible = true
      break
    case 'cancel_hosting':
      cancelHostingDialogStore.visible = true
      break
    case 'edit':
      // 编辑
      editDialogStore.fromData.hosting_type = '1'
      editDialogStore.fromData.hosting_date = row.hosting_date
      editDialogStore.fromData.hosting_time = row.hosting_time
      editDialogStore.fromData.hosting_type_arr = '1'.split(',').map(item => item)

      editDialogStore.visible = true
      break
    case 'details':
      // 查看详情
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

<style lang="scss">
.id {
  color: #0063ff;
  cursor: pointer;
}

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

.associated {
  display: flex;
  align-items: center;
  width: 100%;

  .info {
    flex: auto;
  }
}

.form-tips {
  width: 100%;
  color: #999;
}
</style>
<style lang="scss">
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
