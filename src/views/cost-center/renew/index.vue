<template>
  <div class="wrap">
    <!-- tips -->
    <div class="mb20">
      <Tip :text="tips" type="OneToMany" />
    </div>
    <!-- 选项操作 -->
    <el-card
      v-loading="optionsLoading"
      shadow="never"
      class="page-box options-wrap mb20 df ac jsb"
      :body-style="bodyStyle"
    >
      <!-- 时间范围 -->
      <div class="option df ac">
        <div class="key-wrap">
          <span class="key">{{ t('renewalManagement.timeFrame') }}</span>
        </div>
        <div class="value-wrap df ac">
          <div
            v-for="(item, index) in timeOptions"
            :key="index"
            class="item cursor-pointer"
            :class="index === optiosActive.time ? 'actived' : ''"
            @click="changeFilterOption('time', index)"
          >
            <span>{{ timeOptionsMap(item.num)?.[item.timeType] || '' }}</span>
          </div>
        </div>
      </div>

      <!-- 产品类别 -->
      <div v-if="productOptions.length > 0" class="option df ac">
        <div class="key-wrap">
          <span class="key">{{ t('renewalManagement.productCategory') }}</span>
        </div>
        <div class="value-wrap df ac">
          <div
            v-for="(item, index) in productOptions"
            :key="index"
            class="item cursor-pointer"
            :class="index === optiosActive.product ? 'actived' : ''"
            @click="changeFilterOption('product', index)"
          >
            <span>{{ item.productName }}({{ item.num }})</span>
          </div>
        </div>
      </div>

      <!-- 地域 -->
      <div v-if="regionOptions.length > 0" class="option df ac">
        <div class="key-wrap">
          <span class="key">{{ t('renewalManagement.region') }}</span>
        </div>
        <div class="value-wrap df ac">
          <div
            v-for="(item, index) in regionOptions"
            :key="index"
            class="item cursor-pointer"
            :class="index === optiosActive.region ? 'actived' : ''"
            @click="changeFilterOption('region', index)"
          >
            <span>{{ item.regionName }}({{ item.num }})</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="page-box list-wrap" :body-style="bodyStyle">
      <div class="tabs-wrap df jsb mb20">
        <CatTabs v-model="active" class="mb20 tabs" :tabs="tableTabs" @change="() => {}" />

        <div class="df jfe">
          <div style="width: 400px">
            <el-input
              v-model="condition"
              clearable
              :placeholder="t('renewalManagement.searchPlaceholder')"
              @clear="queryOrderPage"
            >
              <template #suffix>
                <svg-icon name="search" @click="queryOrderPage" />
              </template>
            </el-input>
          </div>
          <el-button class="ml14 refresh" @click="queryOrderPage">
            <SvgIcon name="cat-cdn-refresh" />
          </el-button>
        </div>
      </div>
      <el-button-group class="btn-group mb20">
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
        <!-- <div class="btn three" @click="showDialog(noRenewalDialogRef)">设为到期不续</div> -->
      </el-button-group>

      <el-table
        v-loading="tableLoading"
        :data="tableData"
        max-height="450px"
        show-overflow-tooltip
        @selection-change="handleSelectionChange"
      >
        <el-table-column fixed="left" type="selection" width="40" />
        <el-table-column prop="tradeNo" :label="t('renewalManagement.resourceIdOrName')" min-width="240">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <TableCopy :text="row.resourceId" />
              <TableCopy :text="row.resourceName" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productDescList" :label="t('renewalManagement.productDesc')" min-width="220">
          <template #default="{ row }">
            <!-- <div style="padding: 5px 0;display: inline-block;"> -->
            <div class="table-td_tooltip">
              <div v-for="product in row.productDescList" :key="product" class="text-over">
                {{ product }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="subProductNameList" :label="t('renewalManagement.regionOrZone')" min-width="220">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <p class="text-over">
                {{ row.regionName }}
              </p>
              <p class="text-over">
                {{ row.zoneName }}
              </p>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="所属项目" prop="projectName" width="140"></el-table-column> -->
        <el-table-column :label="t('renewalManagement.expirationDate')" prop="expiredTime" min-width="220">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('renewalManagement.expirationDate') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="expiredTime table-td_tooltip">
              <div>{{ row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '-' }}</div>
              <div style="color: #ff4d4f">
                {{ t('renewalManagement.surplusDay', [row.expiredDay || '-']) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('renewalManagement.resourceState')" prop="resourceState" min-width="160" />
        <el-table-column :label="t('renewalManagement.renewPeriodDesc')" prop="renewPeriodDesc" min-width="200" />
        <el-table-column prop="priceDesc" :label="t('renewalManagement.priceDesc')" min-width="160" />
        <el-table-column :label="t('renewalManagement.operate')" :min-width="operateClass" align="center" fixed="right">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr20 text-primary cursor-pointer" @click="showDialog(renewalDialogRef, [row])">{{
                t('renewalManagement.renewal')
              }}</span>
              <el-select
                :teleported="true"
                style="width: 160px"
                class="select-tr"
                :value="t('renewalManagement.moreOperate')"
                :placeholder="t('renewalManagement.moreOperate')"
                :suffix-icon="''"
                :model-value="''"
                @change="() => {}"
              >
                <el-option
                  v-if="active === 1"
                  :value="1"
                  :label="t('renewalManagement.setAutomaticRenewal')"
                  @click="showDialog(autoRenewalDialogRef, [row])"
                />
                <el-option
                  v-if="active === 2"
                  :value="1"
                  :label="t('renewalManagement.setManualRenewal')"
                  @click="showDialog(manualRenewalDialogRef, [row])"
                />
                <!-- <el-option :value="2" :label="'设为到期不续'"></el-option> -->
              </el-select>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <CatPagination
        v-model:pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        :custom-keys="['page', 'pageSize']"
        @change="paginationChange"
      />
    </el-card>
    <!-- 到期不续 -->
    <NoRenewalDialog ref="noRenewalDialogRef" />
    <!-- 续费 -->
    <RenewalDialog ref="renewalDialogRef" />
    <!-- 手动续费 -->
    <ManualRenewalDialog ref="manualRenewalDialogRef" @confirm="dialogConfirm('manual')" />
    <!-- 自动续费 -->
    <AutoRenewalDialog ref="autoRenewalDialogRef" @confirm="dialogConfirm('auto')" />
    <!-- 修改自动续费 -->
    <EditAutoRenewalDialog ref="editAutoRenewalDialogRef" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _getRenewFilter, _getRenewList } from '@/apis/cost-center/renew'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import type { IPagination } from '@/views/account-system/type'
import type { RenewCostCenterFilterList } from '@/apis/cost-center/renew/type'

import NoRenewalDialog from './components/no-renewal-dialog.vue'
import RenewalDialog from './components/renewal-dialog.vue'
import ManualRenewalDialog from './components/manual-renewal-dialog.vue'
import AutoRenewalDialog from './components/auto-renewal-dialog.vue'
import EditAutoRenewalDialog from './components/edit-auto-renewal-dialog.vue'
import { timeOptionsMap } from './config'
import { message } from '@/utils/message'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const operateMap = {
  [ja]: '160',
  [en]: '230',
  [zh]: '140',
}

const operateClass = useI18nStyle(operateMap)

const bodyStyle = { height: '100%' }

const tips = computed(() => [
  {
    main: t('renewalManagement.renewalTipOne'),
    sub: [
      t('renewalManagement.renewalTipTwo'),
      t('renewalManagement.renewalTipThree'),
      t('renewalManagement.renewalTipFour'),
    ],
  },
])

/**
 * filter
 */
const optiosActive = reactive<{
  time: number
  product: number
  region: number
}>({
  time: 0,
  product: 0,
  region: 0,
})
// 产品类别
const productOptions = computed(() => timeOptions.value?.[optiosActive.time || 0]?.productList || [])
// 地域类别
const regionOptions = computed(() => productOptions.value?.[optiosActive.product || 0]?.regionNums || [])
// 切换选项
const changeFilterOption = (type: 'time' | 'product' | 'region', index: number) => {
  optiosActive[type] = index
  switch (type) {
    case 'time':
      // getRenewCostCenterFilter()
      if (optiosActive.product >= productOptions.value.length) optiosActive.product = 0
      if (optiosActive.region >= regionOptions.value.length) optiosActive.region = 0
      break
    case 'product':
      if (optiosActive.region >= regionOptions.value.length) optiosActive.region = 0
      break
    default:
      break
  }

  // 更新列表
  getRenewCostCenterList()
}
const optionsLoading = ref<boolean>(false)
// 时间范围选项
const timeOptions = ref<RenewCostCenterFilterList[]>()
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
onMounted(() => {
  getRenewCostCenterFilter()
})

/**
 * table
 */
const tableLoading = ref<boolean>(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const active = ref<number>(1)
const tableData = ref<any[]>([]) // 列表
const multipleSelection = ref<any[]>([]) // 列表选择项
const condition = ref<string>('') // 查询条件
const tableTabs = reactive([
  { label: `${t('renewalManagement.manualRenewalItem')}(0)`, value: 1 },
  { label: `${t('renewalManagement.automaticRenewalItem')}(0)`, value: 2 },
  // { label: '到期不续项（0）', value: 3 },
])
// 获取列表数据
const getRenewCostCenterList = async () => {
  const time = timeOptions.value?.[optiosActive.time || 0]
  const product = productOptions.value?.[optiosActive.product]
  const region = regionOptions.value?.[optiosActive.region]
  // 没有产品类别或地域类别 则不请求数据
  if (!time || !product || !region) return
  try {
    tableLoading.value = true
    const { data, msg, success } = await _getRenewList({
      timeType: time?.timeType,
      productId: product?.productId,
      regionId: region?.regionId,
      renewType: active.value,
      resourceName: condition.value,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    })
    if (success) {
      tableData.value = data?.renewList?.list || []
      paginationConfig.total = data?.renewList.recordCnt || 0
      // 更新tab
      tableTabs[0].label = `${t('renewalManagement.manualRenewalItem')}(${data?.renewNum || 0})`
      tableTabs[1].label = `${t('renewalManagement.automaticRenewalItem')}(${data?.autoRenewNum || 0})`
      // tableTabs[2].label = `到期不续项（${data?.noRenewalCount || 0}）`
    } else {
      message.error(msg || t('renewalManagement.failedRetrieveData'))
    }
  } finally {
    // TODO 获取数据后...
    tableLoading.value = false
  }
}
watch(
  () => active.value,
  () => {
    getRenewCostCenterList()
  },
)
// 列表选择项
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}
// 分页
const paginationChange = () => {
  getRenewCostCenterList()
}

// 获取订单列表
const queryOrderPage = async () => {
  getRenewCostCenterList()
}

// 弹窗
const noRenewalDialogRef = ref<InstanceType<typeof NoRenewalDialog>>()
const renewalDialogRef = ref<InstanceType<typeof RenewalDialog>>()
const manualRenewalDialogRef = ref<InstanceType<typeof ManualRenewalDialog>>()
const autoRenewalDialogRef = ref<InstanceType<typeof AutoRenewalDialog>>()
const editAutoRenewalDialogRef = ref<InstanceType<typeof EditAutoRenewalDialog>>()

// 弹窗展示
const showDialog = (ins: any, row?: any[]) => {
  if (!ins) return
  console.log('multipleSelection: ', multipleSelection.value)

  ins.productInfo = {
    product: productOptions.value?.[optiosActive.product || 0],
    region: regionOptions.value?.[optiosActive.region || 0],
  }
  ins.list = row || multipleSelection.value
  ins.show = true
}
const dialogConfirm = (type: 'auto' | 'manual' | 'renew', row?: any[]) => {
  switch (type) {
    case 'auto':
    case 'manual':
      // 数据异步更新，导致页面数据可能不一致
      setTimeout(() => {
        getRenewCostCenterList()
      }, 1000)
      break

    default:
      break
  }
}
</script>

<style lang="scss" scoped>
.wrap {
  /* background-color: #fff; */

  .tip-wrap {
    padding: 10px 15px 17px;
    background: #e5e8ff;

    .text-primary {
      width: 100%;
      margin-bottom: 3px;
    }
  }

  .options-wrap {
    // height: 190px;
    .option {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .key-wrap {
      width: 100px;

      .key {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--common-text);
      }
    }

    .value-wrap {
      .item {
        box-sizing: border-box;
        min-width: 100px;
        height: 34px;
        padding: 0 30px;
        margin-right: 10px;
        line-height: 34px;
        text-align: center;
        white-space: nowrap;
        border: 1px solid transparent;

        &.actived {
          color: var(--primary-color);
          background: #f1f7ff;
          border: 1px solid var(--primary-color);
          border-radius: 4px;
        }

        &:hover {
          color: var(--primary-color);
          background: #f1f7ff;
          border: 1px solid var(--primary-color);
          border-radius: 4px;
          transition: border 0.3s ease;
        }
      }
    }
  }

  .list-wrap {
    .tabs-wrap {
      border-bottom: 1px solid var(--border-c);

      .tabs {
        margin-bottom: 0 !important;

        :deep(.cat-tabs__header) {
          padding: 0;
          border: none;
        }
      }
    }

    .btn-wrap {
      margin-right: 10px;
      border-radius: 4px;

      .btn {
        &:not(:first-child) {
          border-left-color: transparent;
        }

        height: 32px;

        /* width: 90px; */
        padding: 0 18px;
        line-height: 32px;
        text-align: center;
        border: 1px solid var(--border-c);
      }

      .one {
        border-radius: 4px 0 0 4px;
      }

      .four {
        border-radius: 0 4px 4px 0;
      }

      .actived {
        /* background: var(--selected-bgc);
        border: 1px solid var(--primary-color) !important;
        color: var(--primary-color); */
      }
    }
  }

  .btn-group {
    :deep(.el-button) {
      margin-left: 0 !important;
      border-radius: 0 !important;
    }
  }

  .select-tr {
    margin-left: -12px;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;

      .el-input__inner {
        &::placeholder {
          color: var(--primary-color) !important;
        }
      }
    }
  }
}
</style>
