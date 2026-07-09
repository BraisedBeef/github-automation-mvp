<template>
  <div class="cost-renew-v2">
    <PageBreadcrumbToolbar :items="[t('renewalManagement.renewalManagement')]" @doc="openHelpDoc" />

    <section class="cost-renew-v2__notice">
      <div class="cost-renew-v2__notice-icon">
        <SvgIcon name="v2-cat-message-info" />
      </div>
      <div class="cost-renew-v2__notice-content">
        <div v-for="item in tips" :key="item" class="cost-renew-v2__notice-line">
          {{ item }}
        </div>
      </div>
    </section>

    <section v-loading="optionsLoading" class="cost-renew-v2__card cost-renew-v2__filters">
      <div class="cost-renew-v2__filter-row">
        <div class="cost-renew-v2__filter-label">
          {{ t('renewalManagement.timeFrame') }}
        </div>
        <div class="cost-renew-v2__segmented">
          <button
            v-for="(item, index) in timeOptions"
            :key="`${item.timeType}-${index}`"
            type="button"
            class="cost-renew-v2__segmented-item"
            :class="{ 'is-active': index === optiosActive.time }"
            @click="changeFilterOption('time', index)"
          >
            {{ timeOptionsMap(item.num)?.[item.timeType] || '' }}
          </button>
        </div>
      </div>

      <div v-if="productOptions.length > 0" class="cost-renew-v2__filter-row">
        <div class="cost-renew-v2__filter-label">
          {{ t('renewalManagement.productCategory') }}
        </div>
        <div class="cost-renew-v2__segmented">
          <button
            v-for="(item, index) in productOptions"
            :key="`${item.productId}-${index}`"
            type="button"
            class="cost-renew-v2__segmented-item"
            :class="{ 'is-active': index === optiosActive.product }"
            @click="changeFilterOption('product', index)"
          >
            {{ item.productName }}({{ item.num }})
          </button>
        </div>
      </div>

      <div v-if="regionOptions.length > 0" class="cost-renew-v2__filter-row">
        <div class="cost-renew-v2__filter-label">
          {{ t('renewalManagement.region') }}
        </div>
        <div class="cost-renew-v2__segmented">
          <button
            v-for="(item, index) in regionOptions"
            :key="`${item.regionId}-${index}`"
            type="button"
            class="cost-renew-v2__segmented-item"
            :class="{ 'is-active': index === optiosActive.region }"
            @click="changeFilterOption('region', index)"
          >
            {{ item.regionName }}({{ item.num }})
          </button>
        </div>
      </div>
    </section>

    <section class="cost-renew-v2__card cost-renew-v2__list-card">
      <div class="cost-renew-v2__tabs">
        <button
          v-for="item in tableTabs"
          :key="item.value"
          type="button"
          class="cost-renew-v2__tab"
          :class="{ 'is-active': active === item.value }"
          @click="active = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="cost-renew-v2__toolbar">
        <div class="cost-renew-v2__toolbar-left">
          <el-button :disabled="multipleSelection.length === 0" @click="showDialog(renewalDialogRef)">
            {{ t('renewalManagement.batchRenewal') }}
          </el-button>
          <el-button
            v-if="active === 1"
            :disabled="multipleSelection.length === 0"
            @click="showDialog(autoRenewalDialogRef)"
          >
            {{ t('renewalManagement.setAutomaticRenewal') }}
          </el-button>
          <el-button
            v-if="active === 2"
            :disabled="multipleSelection.length === 0"
            @click="showDialog(manualRenewalDialogRef)"
          >
            {{ t('renewalManagement.setManualRenewal') }}
          </el-button>
        </div>

        <div class="cost-renew-v2__toolbar-right">
          <el-input
            v-model="condition"
            clearable
            class="cost-renew-v2__search"
            :placeholder="t('renewalManagement.searchPlaceholder')"
            @keyup.enter="queryOrderPage"
            @clear="queryOrderPage"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <button class="cost-renew-v2__icon-btn" type="button" @click="queryOrderPage">
            <SvgIcon name="cat-cdn-refresh" />
          </button>
        </div>
      </div>

      <TableV2
        ref="tableRef"
        v-loading="tableLoading"
        :data="tableData"
        :total="paginationConfig.total"
        :pagination="pagination"
        show-pagination
        @selection-change="handleSelectionChange"
        @update:pagination="handlePaginationChange"
      >
        <el-table-column fixed="left" type="selection" width="58" />

        <el-table-column min-width="210" :label="t('renewalManagement.resourceIdOrName')">
          <template #default="{ row }">
            <div class="cost-renew-v2__multi-line">
              <TableCopy :text="row.resourceId" />
              <TableCopy :text="row.resourceName" />
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="210" :label="t('renewalManagement.productDesc')">
          <template #default="{ row }">
            <div class="cost-renew-v2__multi-line">
              <div v-for="product in row.productDescList" :key="product" class="cost-renew-v2__ellipsis">
                {{ product }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="t('renewalManagement.regionOrZone')">
          <template #default="{ row }">
            <div class="cost-renew-v2__multi-line">
              <div class="cost-renew-v2__ellipsis">
                {{ row.regionName || '-' }}
              </div>
              <div class="cost-renew-v2__ellipsis">
                {{ row.zoneName || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="160">
          <template #header>
            <div class="cost-renew-v2__time-header">
              <span>{{ t('renewalManagement.expirationDate') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="cost-renew-v2__multi-line">
              <div>{{ row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '-' }}</div>
              <div class="cost-renew-v2__expire-text">
                {{ t('renewalManagement.surplusDay', [row.expiredDay || '-']) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="120" :label="t('renewalManagement.resourceState')">
          <template #default="{ row }">
            <div class="cost-renew-v2__status">
              <span class="cost-renew-v2__status-dot" />
              <span>{{ row.resourceState || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="t('renewalManagement.renewPeriodDesc')" prop="renewPeriodDesc" />

        <el-table-column min-width="140" :label="t('renewalManagement.priceDesc')" prop="priceDesc" />

        <el-table-column fixed="right" min-width="150" :label="t('renewalManagement.operate')">
          <template #default="{ row }">
            <div class="cost-renew-v2__actions">
              <button type="button" class="cost-renew-v2__text-btn" @click="showDialog(renewalDialogRef, [row])">
                {{ t('renewalManagement.renewal') }}
              </button>
              <el-dropdown trigger="click" @command="command => handleMoreAction(command, row)">
                <button type="button" class="cost-renew-v2__text-btn">
                  {{ t('renewalManagement.moreOperate') }}
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="active === 1" command="auto">
                      {{ t('renewalManagement.setAutomaticRenewal') }}
                    </el-dropdown-item>
                    <el-dropdown-item v-if="active === 2" command="manual">
                      {{ t('renewalManagement.setManualRenewal') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <NoRenewalDialog ref="noRenewalDialogRef" />
    <RenewalDialog ref="renewalDialogRef" />
    <ManualRenewalDialog ref="manualRenewalDialogRef" @confirm="dialogConfirm('manual')" />
    <AutoRenewalDialog ref="autoRenewalDialogRef" @confirm="dialogConfirm('auto')" />
    <EditAutoRenewalDialog ref="editAutoRenewalDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import { _getRenewFilter, _getRenewList } from '@/apis/cost-center/renew'
import type { RenewCostCenterFilterList } from '@/apis/cost-center/renew/type'
import t from '@/utils/i18n'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import type { IPagination } from '@/views/account-system/type'
import { timeOptionsMap } from '@/views/cost-center/renew/config'
import NoRenewalDialog from '@/views/cost-center/renew/components/no-renewal-dialog.vue'
import RenewalDialog from '@/views/cost-center/renew/components/renewal-dialog.vue'
import ManualRenewalDialog from '@/views/cost-center/renew/components/manual-renewal-dialog.vue'
import AutoRenewalDialog from '@/views/cost-center/renew/components/auto-renewal-dialog.vue'
import EditAutoRenewalDialog from '@/views/cost-center/renew/components/edit-auto-renewal-dialog.vue'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const tableRef = ref<InstanceType<typeof TableV2>>()

const tips = computed(() => [
  t('renewalManagement.renewalTipOne'),
  t('renewalManagement.renewalTipTwo'),
  t('renewalManagement.renewalTipThree'),
  t('renewalManagement.renewalTipFour'),
])

const optiosActive = reactive<{
  time: number
  product: number
  region: number
}>({
  time: 0,
  product: 0,
  region: 0,
})

const optionsLoading = ref(false)
const timeOptions = ref<RenewCostCenterFilterList[]>()
const productOptions = computed(() => timeOptions.value?.[optiosActive.time || 0]?.productList || [])
const regionOptions = computed(() => productOptions.value?.[optiosActive.product || 0]?.regionNums || [])

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const pagination = computed(() => ({
  page: paginationConfig.pagination.page,
  pageSize: paginationConfig.pagination.pageSize,
}))

const tableLoading = ref(false)
const active = ref<number>(1)
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const condition = ref('')
const tableTabs = reactive([
  { label: `${t('renewalManagement.manualRenewalItem')}(0)`, value: 1 },
  { label: `${t('renewalManagement.automaticRenewalItem')}(0)`, value: 2 },
])

const noRenewalDialogRef = ref<InstanceType<typeof NoRenewalDialog>>()
const renewalDialogRef = ref<InstanceType<typeof RenewalDialog>>()
const manualRenewalDialogRef = ref<InstanceType<typeof ManualRenewalDialog>>()
const autoRenewalDialogRef = ref<InstanceType<typeof AutoRenewalDialog>>()
const editAutoRenewalDialogRef = ref<InstanceType<typeof EditAutoRenewalDialog>>()

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const resetTableSelection = () => {
  nextTick(() => {
    tableRef.value?.clearSelection()
  })
  multipleSelection.value = []
}

const getRenewCostCenterList = async () => {
  const time = timeOptions.value?.[optiosActive.time || 0]
  const product = productOptions.value?.[optiosActive.product]
  const region = regionOptions.value?.[optiosActive.region]

  if (!time || !product || !region) return

  try {
    tableLoading.value = true
    const { data, msg, success } = await _getRenewList({
      timeType: time.timeType,
      productId: product.productId,
      regionId: region.regionId,
      renewType: active.value,
      resourceName: condition.value,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    })

    if (success) {
      tableData.value = data?.renewList?.list || []
      paginationConfig.total = data?.renewList?.recordCnt || 0
      tableTabs[0].label = `${t('renewalManagement.manualRenewalItem')}(${data?.renewNum || 0})`
      tableTabs[1].label = `${t('renewalManagement.automaticRenewalItem')}(${data?.autoRenewNum || 0})`
      resetTableSelection()
    } else {
      message.error(msg || t('renewalManagement.failedRetrieveData'))
    }
  } finally {
    tableLoading.value = false
  }
}

const getRenewCostCenterFilter = async () => {
  try {
    optionsLoading.value = true
    const { data, success, msg } = await _getRenewFilter({ timeType: optiosActive.time })
    if (success) {
      timeOptions.value = data?.list || []
      await getRenewCostCenterList()
    } else {
      message.error(msg || t('renewalManagement.failedRetrieveData'))
    }
  } finally {
    optionsLoading.value = false
  }
}

const changeFilterOption = (type: 'time' | 'product' | 'region', index: number) => {
  optiosActive[type] = index

  switch (type) {
    case 'time':
      if (optiosActive.product >= productOptions.value.length) optiosActive.product = 0
      if (optiosActive.region >= regionOptions.value.length) optiosActive.region = 0
      break
    case 'product':
      if (optiosActive.region >= regionOptions.value.length) optiosActive.region = 0
      break
    default:
      break
  }

  paginationConfig.pagination.page = 1
  getRenewCostCenterList()
}

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
  paginationConfig.pagination.page = page
  paginationConfig.pagination.pageSize = pageSize
  getRenewCostCenterList()
}

const queryOrderPage = () => {
  paginationConfig.pagination.page = 1
  getRenewCostCenterList()
}

const showDialog = (ins: any, row?: any[]) => {
  if (!ins) return

  ins.productInfo = {
    product: productOptions.value?.[optiosActive.product || 0],
    region: regionOptions.value?.[optiosActive.region || 0],
  }
  ins.list = row || multipleSelection.value
  ins.show = true
}

const dialogConfirm = (type: 'auto' | 'manual' | 'renew') => {
  switch (type) {
    case 'auto':
    case 'manual':
      setTimeout(() => {
        getRenewCostCenterList()
      }, 1000)
      break
    default:
      break
  }
}

const handleMoreAction = (command: 'auto' | 'manual', row: any) => {
  if (command === 'auto') {
    showDialog(autoRenewalDialogRef.value, [row])
    return
  }
  if (command === 'manual') {
    showDialog(manualRenewalDialogRef.value, [row])
  }
}

watch(
  () => active.value,
  () => {
    paginationConfig.pagination.page = 1
    getRenewCostCenterList()
  },
)

onMounted(() => {
  getRenewCostCenterFilter()
})
</script>

<style scoped lang="scss">
.cost-renew-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.cost-renew-v2__notice,
.cost-renew-v2__card {
  background: #fff;
}

.cost-renew-v2__notice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 16px;
  background: #dbe9ff;
}

.cost-renew-v2__notice-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  color: #06f;

  :deep(svg) {
    width: 20px;
    height: 20px;
  }
}

.cost-renew-v2__notice-content {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 28px;
  color: #06f;
}

.cost-renew-v2__filters {
  padding: 20px;
}

.cost-renew-v2__filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cost-renew-v2__filter-row + .cost-renew-v2__filter-row {
  margin-top: 20px;
}

.cost-renew-v2__filter-label {
  flex: none;
  width: 56px;
  padding-top: 6px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.cost-renew-v2__segmented {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  min-width: 0;
}

.cost-renew-v2__segmented-item {
  position: relative;
  min-width: 96px;
  height: 34px;
  padding: 0 16px;
  margin-left: -1px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;

  &:first-child {
    margin-left: 0;
  }

  &:hover {
    z-index: 1;
    color: #06f;
  }

  &.is-active {
    z-index: 2;
    color: #06f;
    border-color: #06f;
  }
}

.cost-renew-v2__list-card {
  padding: 10px 20px 0;
}

.cost-renew-v2__tabs {
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #e8ecf3;
}

.cost-renew-v2__tab {
  padding: 10px 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;

  &.is-active {
    color: #06f;
    border-bottom-color: #06f;
  }
}

.cost-renew-v2__toolbar,
.cost-renew-v2__toolbar-left,
.cost-renew-v2__toolbar-right,
.cost-renew-v2__time-header,
.cost-renew-v2__status,
.cost-renew-v2__actions {
  display: flex;
  align-items: center;
}

.cost-renew-v2__toolbar {
  gap: 16px;
  justify-content: space-between;
  padding: 20px 0;
}

.cost-renew-v2__toolbar-left {
  flex: 1;
  flex-wrap: wrap;
  gap: 16px;
}

.cost-renew-v2__toolbar-right {
  gap: 12px;
}

.cost-renew-v2__search {
  width: 290px;
}

.cost-renew-v2__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;

  &:hover {
    color: #06f;
    border-color: #b7d0ff;
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.cost-renew-v2__multi-line {
  line-height: 22px;
}

.cost-renew-v2__ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cost-renew-v2__expire-text {
  color: #e54839;
}

.cost-renew-v2__time-header {
  gap: 6px;
}

.cost-renew-v2__status {
  gap: 8px;
  color: #01a66f;
}

.cost-renew-v2__status-dot {
  width: 6px;
  height: 6px;
  background: #01a66f;
  border-radius: 50%;
}

.cost-renew-v2__actions {
  gap: 20px;
}

.cost-renew-v2__text-btn {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

@media (width <= 1024px) {
  .cost-renew-v2__toolbar,
  .cost-renew-v2__filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .cost-renew-v2__filter-label {
    width: auto;
    padding-top: 0;
  }

  .cost-renew-v2__toolbar-right {
    justify-content: space-between;
  }

  .cost-renew-v2__search {
    width: 100%;
  }
}

@media (width <= 768px) {
  .cost-renew-v2__filters,
  .cost-renew-v2__list-card {
    padding-right: 16px;
    padding-left: 16px;
  }

  .cost-renew-v2__tabs {
    gap: 20px;
    overflow-x: auto;
  }

  .cost-renew-v2__segmented {
    overflow-x: auto;
  }

  .cost-renew-v2__toolbar-right {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
