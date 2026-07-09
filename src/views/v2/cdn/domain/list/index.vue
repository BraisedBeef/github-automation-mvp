<template>
  <section class="cdn-domain-list-v2">
    <header class="cdn-domain-list-v2__hero">
      <PageBreadcrumbToolbar :items="[t('domainManage')]" />

      <div class="cdn-domain-list-v2__tabs">
        <button
          v-for="item in tabItems"
          :key="item.value"
          class="cdn-domain-list-v2__tab"
          :class="{ 'is-active': activeTab === item.value }"
          type="button"
          @click="handleTabChange(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <!-- <InfoNotice
      v-if="showNotice"
      class="cdn-domain-list-v2__notice"
    >
      <div class="cdn-domain-list-v2__notice-content">
        <span>{{ t('serviceOverviewNotice') }}</span>
        <button
          class="cdn-domain-list-v2__notice-close"
          type="button"
          @click="showNotice = false"
        >
          <SvgIcon name="close" />
        </button>
      </div>
    </InfoNotice> -->

    <section class="cdn-domain-list-v2__panel">
      <div class="cdn-domain-list-v2__toolbar">
        <div class="cdn-domain-list-v2__toolbar-left">
          <el-button type="primary" @click="pushRoute({ path: '/cdn/domain/add', query: { type: activeTab } })">
            {{ activeTab === '0,1,2' ? t('addDomain') : t('addWholeAcceleration') }}
          </el-button>
          <el-button plain class="cdn-domain-list-v2__buy-btn" @click="pushRoute('/cdn/buyFlow')">
            {{ t('purchaseTraffic') }}
          </el-button>
          <el-tooltip :disabled="!enableDisabledReason" :content="enableDisabledReason" effect="light" placement="top">
            <span>
              <el-button :disabled="!selectedRows.length || !!enableDisabledReason" @click="handleBatchAction('start')">
                {{ t('enable') }}
              </el-button>
            </span>
          </el-tooltip>
          <el-tooltip :disabled="!stopDisabledReason" :content="stopDisabledReason" effect="light" placement="top">
            <span>
              <el-button :disabled="!selectedRows.length || !!stopDisabledReason" @click="handleBatchAction('stop')">
                {{ t('stop') }}
              </el-button>
            </span>
          </el-tooltip>
          <el-tooltip :disabled="!deleteDisabledReason" :content="deleteDisabledReason" effect="light" placement="top">
            <span>
              <el-button :disabled="!selectedRows.length || !!deleteDisabledReason" @click="handleBatchAction('del')">
                {{ t('delete') }}
              </el-button>
            </span>
          </el-tooltip>
        </div>

        <div class="cdn-domain-list-v2__toolbar-right">
          <el-input
            v-model.trim="domainName"
            :placeholder="t('myDomains.searchPlaceholder')"
            maxlength="256"
            class="cdn-domain-list-v2__search"
            @keydown.enter="handleSearch"
          >
            <template #prefix>
              <SvgIcon name="dns-search" />
            </template>
          </el-input>
          <button class="cdn-domain-list-v2__tool-btn" type="button" @click="columnDialogVisible = true">
            <SvgIcon name="cat-cdn-set" />
          </button>
          <button class="cdn-domain-list-v2__tool-btn" type="button" @click="downloadDomainList">
            <SvgIcon name="cat-cdn-download" />
          </button>
          <button class="cdn-domain-list-v2__tool-btn" type="button" @click="refreshList">
            <SvgIcon name="cat-cdn-refresh" :loading="tableState.loading" />
          </button>
        </div>
      </div>

      <TableV2
        ref="tableRef"
        v-loading="tableState.loading"
        :data="tableState.tableData"
        :total="tableState.total"
        :pagination="{
          page: tableState.pagination.page,
          pageSize: tableState.pagination.page_size,
        }"
        show-pagination
        scrollbar-always-on
        empty-text="暂无相关数据"
        @selection-change="handleSelectionChange"
        @update:pagination="handlePaginationChange"
      >
        <el-table-column type="selection" width="58" fixed />

        <el-table-column v-if="isColumnVisible('domain')" prop="domain" min-width="280" show-overflow-tooltip>
          <template #header>
            {{ t('acceleratedDomain') }}
          </template>
          <template #default="{ row }">
            <div class="cdn-domain-list-v2__domain-cell">
              <el-link type="primary" @click="toDetail(row)">
                {{ row.domain }}
              </el-link>
              <SvgIcon name="copy" class="cdn-domain-list-v2__copy-icon" @click="copyText(row.domain)" />
            </div>
          </template>
        </el-table-column>

        <el-table-column
          v-if="isColumnVisible('channel_type') && activeTab === '0,1,2'"
          prop="channel_type"
          min-width="90"
        >
          <template #header>
            <CatTableHeadFilter
              v-model="search.channel_type"
              label="type"
              tip="domainSpeedType"
              show-all
              all-value="0,1,2"
              :list="channelTypeList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(channelTypeList, row.channel_type) }}
          </template>
        </el-table-column>

        <el-table-column v-if="isColumnVisible('status')" prop="status" min-width="120">
          <template #header>
            <CatTableHeadFilter
              v-model="search.status"
              label="status"
              tip="domainCurrentStatus"
              show-all
              :list="AccelerationStatusList.filter(v => v.value < 5)"
            />
          </template>
          <template #default="{ row }">
            <div class="cdn-domain-list-v2__status-cell" :class="`is-${statusTone(row.status)}`">
              <div class="cdn-domain-list-v2__status-dot" />
              <span>{{ getValueMap(AccelerationStatusList, row.status) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column v-if="isColumnVisible('cname')" prop="cname" min-width="320" show-overflow-tooltip>
          <template #header>
            {{ t('cnameDomain') }}
          </template>
          <template #default="{ row }">
            <div class="cdn-domain-list-v2__cname-cell">
              <SvgIcon
                v-if="tableState.domainStatesLoading"
                name="dialog-loading"
                class="cdn-domain-list-v2__loading-icon"
              />
              <el-tooltip
                v-else
                :content="row.cname_status === 1 ? t('cnameValid') : t('cnameNotValid')"
                effect="light"
                placement="top"
              >
                <SvgIcon
                  :name="row.cname_status === 1 ? 'cat-cdn-success' : 'cat-cdn-warning'"
                  :class="row.cname_status === 1 ? 'is-success' : 'is-danger'"
                />
              </el-tooltip>
              <span class="cdn-domain-list-v2__cname-text">{{ row.cname }}</span>
              <SvgIcon name="copy" class="cdn-domain-list-v2__copy-icon" @click="copyText(row.cname)" />
            </div>
          </template>
        </el-table-column>

        <el-table-column v-if="isColumnVisible('area_code')" prop="area_code" min-width="100">
          <template #header>
            <CatTableHeadFilter
              v-model="search.area_codes"
              label="region"
              tip="domainRegion"
              show-all
              :list="areaList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(areaList, row.area_code) }}
          </template>
        </el-table-column>

        <el-table-column v-if="isColumnVisible('https_status')" prop="https_status" min-width="120">
          <template #header>
            <CatTableHeadFilter
              v-model="search.https_status"
              label="httpsAcceleration"
              tip="httpsStatus"
              show-all
              :list="httpsStartList"
            />
          </template>
          <template #default="{ row }">
            {{ row.https_status ? t('enable') : t('notEnabled') }}
          </template>
        </el-table-column>

        <el-table-column
          v-if="isColumnVisible('origin_host')"
          prop="origin_servers"
          min-width="180"
          show-overflow-tooltip
        >
          <template #header>
            {{ t('pullHost') }}
          </template>
          <template #default="{ row }">
            {{ row.origin_servers?.[0]?.host || '--' }}
          </template>
        </el-table-column>

        <el-table-column v-if="isColumnVisible('project')" prop="item" min-width="90">
          <template #header>
            {{ t('belongProject') }}
          </template>
          <template #default>
            {{ t('default') }}
          </template>
        </el-table-column>

        <el-table-column v-if="isColumnVisible('remark')" prop="remark" min-width="90" show-overflow-tooltip>
          <template #header>
            <span>{{ t('remark') }}</span>
          </template>
          <template #default="{ row }">
            {{ row.remark || '--' }}
          </template>
        </el-table-column>

        <el-table-column v-if="isColumnVisible('update_time')" prop="update_time" min-width="190">
          <template #header>
            <div class="cdn-domain-list-v2__sort-head" @click="toggleOrder">
              <span>{{ t('modificationTime') }}</span>
              <SvgIcon class="cdn-domain-list-v2__sort-icon" :name="sortIconName" />
            </div>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.update_time * 1000, 'string', true) }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" min-width="190">
          <template #header>
            {{ t('operation') }}
          </template>
          <template #default="{ row }">
            <div class="cdn-domain-list-v2__actions">
              <el-link type="primary" :disabled="row.is_lock" @click="toDetail(row)">
                {{ t('set') }}
              </el-link>
              <el-link
                type="primary"
                :disabled="![0, 1].includes(row.status) || row.is_lock == 1"
                @click="openRemarkDialog(row)"
              >
                {{ t('remark') }}
              </el-link>
              <el-dropdown trigger="click" @command="command => handleRowCommand(command, row)">
                <button class="cdn-domain-list-v2__more-btn" type="button">
                  <span>{{ t('more') }}</span>
                  <SvgIcon name="cat-cdn-select-more" />
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="copy">
                      {{ t('copyConfig') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="start" :disabled="getSingleActionDisabledReason(row, 'start') !== ''">
                      {{ t('enable') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="stop" :disabled="getSingleActionDisabledReason(row, 'stop') !== ''">
                      {{ t('stop') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="del" :disabled="getSingleActionDisabledReason(row, 'del') !== ''">
                      {{ t('delete') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <el-dialog v-model="columnDialogVisible" :title="t('customList')" width="560px">
      <div class="cdn-domain-list-v2__column-dialog">
        <el-checkbox v-for="column in columns" :key="column.key" v-model="column.visible" :disabled="column.required">
          {{ column.label }}
        </el-checkbox>
      </div>
    </el-dialog>

    <el-dialog v-model="remarkDialogVisible" :title="t('remark')" width="560px" @closed="resetRemarkState">
      <el-input
        v-model="remarkValue"
        :placeholder="t('pleaseInputRemark')"
        type="textarea"
        :rows="5"
        maxlength="200"
        show-word-limit
        resize="none"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="remarkDialogVisible = false">{{ t('cancel') }}</el-button>
          <el-button type="primary" :disabled="!currentRemarkRow" @click="submitRemark">{{ t('confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import {
  _delDomain,
  _downloadDomainList,
  _getDomainList,
  _getDomainStatus,
  _updateBaseConfig,
  _updateDomain,
} from '@/apis/cdn/domain'
import { AccelerationStatusList, areaList, channelTypeList, httpsStartList } from '@/assets/data/common.js'
import { copyText } from '@/utils/dom-utils'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'
import { getValueMap } from '@/utils/collection-utils'
import { showErrorTip } from '@/views/cdn/domain/index-domain'

interface TableDataItem {
  id: number
  domain: string
  channel_type: number | string
  status: number
  cname: string
  cname_status: number
  area_code: number
  https_status: number
  origin_servers: Array<{ host?: string; address?: string; priority?: number }>
  is_lock?: number
  remark: string
  update_time: number
  [key: string]: any
}

type BatchAction = 'start' | 'stop' | 'del'

const route = useRoute()
const router = useRouter()
const tableRef = ref<InstanceType<typeof TableV2>>()

const showNotice = ref(true)
const domainName = ref('')
const activeTab = ref<'0,1,2' | '3'>('0,1,2')
const selectedRows = ref<TableDataItem[]>([])
const columnDialogVisible = ref(false)
const remarkDialogVisible = ref(false)
const currentRemarkRow = ref<TableDataItem | null>(null)
const remarkValue = ref('')

const columns = reactive([
  { key: 'domain', label: t('acceleratedDomain'), visible: true, required: true },
  { key: 'channel_type', label: t('type'), visible: true, required: false },
  { key: 'status', label: t('status'), visible: true, required: false },
  { key: 'cname', label: t('cnameDomain'), visible: true, required: false },
  { key: 'area_code', label: t('region'), visible: true, required: false },
  { key: 'https_status', label: t('httpsAcceleration'), visible: true, required: false },
  { key: 'origin_host', label: t('pullHost'), visible: true, required: false },
  { key: 'project', label: t('belongProject'), visible: true, required: false },
  { key: 'remark', label: t('remark'), visible: true, required: false },
  { key: 'update_time', label: t('modificationTime'), visible: true, required: false },
])

const tabItems = computed(() => [
  { label: t('staticAcceleration'), value: '0,1,2' as const },
  { label: t('wholeAcceleration'), value: '3' as const },
])

const tableState = reactive({
  loading: false,
  domainStatesLoading: false,
  tableData: [] as TableDataItem[],
  total: 0,
  pagination: {
    page: 1,
    page_size: 10,
  },
})

const search = reactive<{
  channel_type: string | number
  status: number | string
  area_codes: number | string
  https_status: number | string
  order: string
}>({
  channel_type: '0,1,2',
  status: '',
  area_codes: '',
  https_status: '',
  order: '',
})

const sortIconName = computed(() => {
  if (search.order === 'asc') return 'sort-up'
  if (search.order === 'desc') return 'sort-down'
  return 'sort'
})

const enableDisabledReason = computed(() => getBatchActionDisabledReason('start'))
const stopDisabledReason = computed(() => getBatchActionDisabledReason('stop'))
const deleteDisabledReason = computed(() => getBatchActionDisabledReason('del'))

const isColumnVisible = (key: string) => columns.find(column => column.key === key)?.visible ?? true

const statusTone = (status: number) => {
  if (status === 1) return 'success'
  if (status === 4) return 'danger'
  return 'default'
}

const syncTabFromRoute = () => {
  const queryTab = route.query.tab_Type === '3' ? '3' : '0,1,2'
  activeTab.value = queryTab
  search.channel_type = queryTab
}

const getDomainList = async () => {
  tableState.loading = true
  try {
    const res = await _getDomainList({
      ...search,
      ...tableState.pagination,
      domain_name: domainName.value,
    })
    if (res.code !== 200) return

    tableState.tableData = (res.data.data || []).map(item => ({
      ...item,
      cname_status: -1,
    }))
    tableState.total = res.data.total || 0
    selectedRows.value = []
    tableRef.value?.clearSelection()

    if (!tableState.tableData.length) return

    tableState.domainStatesLoading = true
    try {
      const domainStates = await _getDomainStatus(tableState.tableData.map(item => item.domain).join(','))
      if (domainStates.code === 200 && Array.isArray(domainStates.data?.data)) {
        tableState.tableData.forEach(domainInfo => {
          const current = domainStates.data.data.find(item => item.domain_name === domainInfo.domain)
          if (current) domainInfo.cname_status = current.status ?? -1
        })
      }
    } finally {
      tableState.domainStatesLoading = false
    }
  } finally {
    tableState.loading = false
  }
}

const handleSearch = () => {
  tableState.pagination.page = 1
  getDomainList()
}

const refreshList = () => {
  domainName.value = ''
  selectedRows.value = []
  getDomainList()
}

const handlePaginationChange = (pagination: { page: number; pageSize: number }) => {
  tableState.pagination.page = pagination.page
  tableState.pagination.page_size = pagination.pageSize
  getDomainList()
}

const handleSelectionChange = (rows: TableDataItem[]) => {
  selectedRows.value = rows
}

const handleTabChange = (value: '0,1,2' | '3') => {
  if (value === activeTab.value) return
  router.replace({
    path: '/cdn/domain/list',
    query: {
      ...route.query,
      tab_Type: value,
    },
  })
}

const toggleOrder = () => {
  search.order = search.order === 'desc' ? 'asc' : 'desc'
}

const toDetail = (row: TableDataItem) => {
  pushRoute({
    path: '/cdn/domain/detail',
    query: {
      id: row.id,
      domain: row.domain,
      status: row.status,
      is_lock: row.is_lock,
    },
  })
}

const getActionDisabledReason = (rows: TableDataItem[], action: BatchAction) => {
  if (!rows.length) return ''
  if (action === 'start') {
    return rows.every(row => row.status === 4) ? '' : t('buttonStartTip')
  }
  if (action === 'stop') {
    return rows.every(row => row.status === 1) ? '' : t('buttonStopTip')
  }
  return rows.every(row => row.status === 4) ? '' : t('buttonDeleteTip')
}

const getBatchActionDisabledReason = (action: BatchAction) => {
  if (!selectedRows.value.length) return ''
  return getActionDisabledReason(selectedRows.value, action)
}

const getSingleActionDisabledReason = (row: TableDataItem, action: BatchAction) => {
  return getActionDisabledReason([row], action)
}

const confirmActionTextMap: Record<BatchAction, string> = {
  start: 'sureStartService',
  stop: 'sureStopService',
  del: 'sureDeleteService',
}

const statusActionMap: Record<Exclude<BatchAction, 'del'>, number> = {
  start: 1,
  stop: 3,
}

const runAction = async (action: BatchAction, rows: TableDataItem[]) => {
  for (const row of rows) {
    try {
      if (action === 'del') {
        await _delDomain(row.id)
      } else {
        await _updateDomain({ id: row.id, status: statusActionMap[action] })
      }
    } catch (error: any) {
      showErrorTip(error?.response?.data?.msg || error?.message || 'error')
    }
  }
  await getDomainList()
}

const handleBatchAction = async (action: BatchAction) => {
  const disabledReason = getBatchActionDisabledReason(action)
  if (disabledReason) return
  try {
    await ElMessageBox.confirm(
      t(confirmActionTextMap[action]),
      t(action === 'del' ? 'delAcceleration' : `${action}Acceleration`),
      {
        type: 'warning',
      },
    )
  } catch {
    return
  }
  await runAction(action, selectedRows.value)
}

const handleRowCommand = async (command: string, row: TableDataItem) => {
  if (command === 'copy') {
    pushRoute({
      path: '/cdn/domain/copy',
      query: { id: row.id, domain: row.domain },
    })
    return
  }
  if (command === 'start' || command === 'stop' || command === 'del') {
    const disabledReason = getSingleActionDisabledReason(row, command)
    if (disabledReason) {
      ElMessage.warning(disabledReason)
      return
    }
    try {
      await ElMessageBox.confirm(
        t(confirmActionTextMap[command]),
        t(command === 'del' ? 'delAcceleration' : `${command}Acceleration`),
        {
          type: 'warning',
        },
      )
    } catch {
      return
    }
    await runAction(command, [row])
  }
}

const openRemarkDialog = (row: TableDataItem) => {
  currentRemarkRow.value = row
  remarkValue.value = row.remark || ''
  remarkDialogVisible.value = true
}

const resetRemarkState = () => {
  currentRemarkRow.value = null
  remarkValue.value = ''
}

const submitRemark = async () => {
  if (!currentRemarkRow.value) return
  await _updateBaseConfig({
    id: currentRemarkRow.value.id,
    form: {
      remark: remarkValue.value,
      area_code: currentRemarkRow.value.area_code,
    },
  })
  remarkDialogVisible.value = false
  await getDomainList()
}

const downloadDomainList = async () => {
  const blob = await _downloadDomainList({
    ...search,
    ...tableState.pagination,
    page_size: 9999,
    domain_name: domainName.value,
  })
  downloadExportFiles(blob, `${t('allDomains')}.xlsx`)
}

watch(
  () => route.query.tab_Type,
  () => {
    syncTabFromRoute()
  },
)

watch(
  () => [search.status, search.area_codes, search.https_status, search.channel_type, search.order],
  () => {
    tableState.pagination.page = 1
    getDomainList()
  },
)

onMounted(() => {
  syncTabFromRoute()
  getDomainList()
})
</script>

<style scoped lang="scss">
.cdn-domain-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cdn-domain-list-v2__hero,
.cdn-domain-list-v2__panel {
  background: #fff;
}

.cdn-domain-list-v2__hero {
  padding: 16px 16px 0;
}

.cdn-domain-list-v2__tabs,
.cdn-domain-list-v2__toolbar,
.cdn-domain-list-v2__toolbar-left,
.cdn-domain-list-v2__toolbar-right,
.cdn-domain-list-v2__notice-content,
.cdn-domain-list-v2__domain-cell,
.cdn-domain-list-v2__cname-cell,
.cdn-domain-list-v2__actions,
.cdn-domain-list-v2__sort-head {
  display: flex;
  align-items: center;
}

.cdn-domain-list-v2__toolbar,
.cdn-domain-list-v2__notice-content {
  justify-content: space-between;
}

.cdn-domain-list-v2__crumb-btn,
.cdn-domain-list-v2__tool-btn,
.cdn-domain-list-v2__notice-close,
.cdn-domain-list-v2__more-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-domain-list-v2__tabs {
  gap: 32px;
  margin-top: 12px;
}

.cdn-domain-list-v2__tab {
  position: relative;
  padding: 0 0 14px;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cdn-domain-list-v2__tab.is-active {
  font-weight: 500;
  color: #06f;
}

.cdn-domain-list-v2__tab.is-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  content: '';
  background: #06f;
}

.cdn-domain-list-v2__notice {
  :deep(.v2-info-notice__text) {
    width: 100%;
  }
}

.cdn-domain-list-v2__notice-close {
  color: #06f;
}

.cdn-domain-list-v2__panel {
  padding: 20px;
}

.cdn-domain-list-v2__toolbar {
  gap: 16px;
  margin-bottom: 20px;
}

.cdn-domain-list-v2__toolbar-left,
.cdn-domain-list-v2__toolbar-right,
.cdn-domain-list-v2__actions {
  gap: 12px;
}

.cdn-domain-list-v2__btn-icon {
  margin-right: 4px;
}

.cdn-domain-list-v2__buy-btn {
  margin-left: 0 !important;
  color: #06f;
  background-color: rgb(0 102 255 / 8%);
  border-color: #dbe9ff;
}

.cdn-domain-list-v2__search {
  width: 320px;
}

.cdn-domain-list-v2__tool-btn {
  width: 32px;
  height: 32px;
  color: #191c23;
  border: 1px solid #dcdfe6;
}

.cdn-domain-list-v2__domain-cell,
.cdn-domain-list-v2__cname-cell {
  gap: 6px;
  min-width: 0;
}

.cdn-domain-list-v2__cname-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cdn-domain-list-v2__copy-icon {
  flex-shrink: 0;
  color: #8a94a6;
  cursor: pointer;
}

.cdn-domain-list-v2__loading-icon {
  color: #8a94a6;
  animation: rotating 1s linear infinite;
}

.cdn-domain-list-v2__status-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cdn-domain-list-v2__status-dot {
  width: 8px;
  height: 8px;
  border: 2px solid currentcolor;
  border-radius: 50%;
}

.cdn-domain-list-v2__status-cell.is-success {
  color: #00a870;
}

.cdn-domain-list-v2__status-cell.is-danger {
  color: #f53f3f;
}

.cdn-domain-list-v2__status-cell.is-default {
  color: #191c23;
}

.cdn-domain-list-v2__cname-cell :deep(.svg-icon.is-success) {
  color: #00a870;
}

.cdn-domain-list-v2__cname-cell :deep(.svg-icon.is-danger) {
  color: #f53f3f;
}

.cdn-domain-list-v2__sort-head {
  gap: 6px;
  cursor: pointer;
}

.cdn-domain-list-v2__sort-icon {
  color: #8a94a6;
}

.cdn-domain-list-v2__more-btn {
  gap: 4px;
  color: #06f;
}

.cdn-domain-list-v2__column-dialog {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (width <= 1280px) {
  .cdn-domain-list-v2__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .cdn-domain-list-v2__toolbar-right {
    justify-content: flex-end;
  }
}

@media (width <= 960px) {
  .cdn-domain-list-v2__hero-main,
  .cdn-domain-list-v2__toolbar-left,
  .cdn-domain-list-v2__toolbar-right {
    flex-wrap: wrap;
  }

  .cdn-domain-list-v2__search {
    width: 100%;
  }
}

:deep(.v2-page-breadcrumb-toolbar) {
  padding: 0;
}
</style>
