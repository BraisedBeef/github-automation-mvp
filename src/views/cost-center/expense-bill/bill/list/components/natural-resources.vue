<template>
  <div class="wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <div class="mb20 list-wrap page-box">
      <div class="mb20">
        <FilterInput
          ref="filterInputRef"
          :placeholder="t('cvmCommon.listPh')"
          :filter-list="iptFilterConfig"
          style="width: 100%"
          option-width="200"
          @search="searchFn"
        />
      </div>

      <div class="df ac">
        <!-- 总费用 -->
        <p>
          {{ t('bill.originalPrice') }}<span class="price-text">{{ cost.discountPrice }} USD</span>
        </p>
        =
        <!-- 现金支付 -->
        <p>{{ t('bill.money') }} {{ cost.money }} USD</p>
        +
        <!-- 代金券支付 -->
        <p>{{ t('bill.voucherMoney') }} {{ cost.voucherMoney }} USD</p>
        +
        <!-- 赠送金支付 -->
        <p>{{ t('bill.giftGoldMoney') }} {{ cost.giftGoldMoney }} USD</p>
        +
        <!-- 平台垫付 -->
        <p>{{ t('bill.platformAdvancePaymentMoney') }} {{ cost.platformAdvancePaymentMoney }} USD</p>
      </div>
      <!-- list -->
      <el-table v-loading="loading" :data="list" class="mt20 table" show-overflow-tooltip>
        <!-- 资源id/实例别名 -->
        <el-table-column min-width="250">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.resourceId') }}</span>
              <el-tooltip :content="t('bill.resourceIdtTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div v-if="handleId(row).show">
                {{ row.instanceId }}
              </div>
              <div v-if="handleId(row).show" class="text-over">
                {{ row.alias }}
              </div>
              <div v-if="!handleId(row).show">-</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="payerUin" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.payerUin') }}</span>
              <el-tooltip :content="t('bill.payerUinTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userUin" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.userUin') }}</span>
              <el-tooltip :content="t('bill.userUinTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productName" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.productId') }}</span>
              <el-tooltip :content="t('bill.productIdTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <!-- 子产品名称 -->
        <el-table-column prop="subProductName" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.subProductName') }}</span>
              <el-tooltip
                :content="t('bill.subProductNameTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="billingMode" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.billingModes') }}</span>
              <el-tooltip :content="t('bill.billingModeTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ COST_TYPE_MAP[row.billingMode] }}
          </template>
        </el-table-column>
        <!-- 交易类型 -->
        <el-table-column prop="transactionType" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.transactionType') }}</span>
              <el-tooltip
                :content="t('bill.transactionTypeTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ TRANSACTION_TYPE_MAP[row.transactionType] }}
          </template>
        </el-table-column>
        <!-- 扣费时间 -->
        <el-table-column prop="transTime" min-width="220">
          <template #header>
            <div class="table-header">
              <span class="mr10">{{ t('bill.transTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
              <el-tooltip :content="t('bill.transTimeTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row?.transTime ? maoYunDayJs(row.transTime).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <!-- 开始使用时间 -->
        <el-table-column prop="useStartDate" min-width="220">
          <template #header>
            <div class="table-header">
              <span class="mr10">{{ t('bill.useStartDate') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
              <el-tooltip :content="t('bill.useStartDateTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row?.useStartDate ? maoYunDayJs(row.useStartDate).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <!-- 结束使用时间 -->
        <el-table-column prop="useEndDate" min-width="220">
          <template #header>
            <div class="table-header">
              <span class="mr10">{{ t('bill.useEndDate') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
              <el-tooltip :content="t('bill.useEndDateTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row?.useEndDate ? maoYunDayJs(row.useEndDate).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="description" min-width="300">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.description') }}</span>
              <el-tooltip :content="t('bill.descriptionTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        <!-- 项目名称 -->
        <!-- <el-table-column prop="projectName" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.projectName') }}</span>
              <el-tooltip :content="t('bill.projectNameTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.projectName || '-' }}
          </template>
        </el-table-column> -->
        <el-table-column prop="regionName" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.regionName') }}</span>
              <el-tooltip :content="t('bill.regionNameTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.regionName || '-' }}
          </template>
        </el-table-column>
        <!-- 可用区 -->
        <el-table-column prop="zoneName" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.zoneName') }}</span>
              <el-tooltip :content="t('bill.zoneNameTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.zoneName || '-' }}
          </template>
        </el-table-column>
        <!-- 原价 -->
        <el-table-column prop="originalPrice" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.originalPrices') }}</span>
              <el-tooltip :content="t('bill.originalPriceTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.originalPrice || 0 }}
          </template>
        </el-table-column>
        <!-- 现价 -->
        <el-table-column prop="discountedPrice" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.curPrice') }}</span>
              <el-tooltip :content="t('bill.curPriceTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.discountedPrice || 0 }}
          </template>
        </el-table-column>
        <!-- 代金券支付 -->
        <el-table-column prop="voucherMoney" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.voucherMoney') }}</span>
              <el-tooltip :content="t('bill.voucherMoneyTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.voucherMoney || 0 }}
          </template>
        </el-table-column>
        <!-- 赠送金支付 -->
        <el-table-column prop="giftGoldMoney" :label="t('bill.giftGoldMoney')" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.giftGoldMoney') }}</span>
              <el-tooltip :content="t('bill.giftGoldMoneyTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.giftGoldMoney || 0 }}
          </template>
        </el-table-column>
        <!-- 平台垫付 -->
        <el-table-column prop="platformAdvancePaymentMoney" min-width="220">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.platformAdvancePaymentMoney') }}</span>
              <el-tooltip
                :content="t('bill.platformAdvancePaymentMoneyTooltip')"
                placement="top"
                popper-class="table-header_tooltip"
              >
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.platformAdvancePaymentMoney || 0 }}
          </template>
        </el-table-column>
        <!-- 现金支付 -->
        <el-table-column prop="money" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.money') }}</span>
              <el-tooltip :content="t('bill.moneyTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.money || 0 }}
          </template>
        </el-table-column>
        <!-- 拓展字段 -->
        <el-table-column prop="expand" min-width="200">
          <template #header>
            <div class="table-header">
              <span>{{ t('bill.expand') }}</span>
              <el-tooltip :content="t('bill.expandTooltip')" placement="top" popper-class="table-header_tooltip">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.expand || '-' }}
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column min-width="100" :label="t('common.operation')" fixed="right">
          <template #default="{ row }">
            <span
              class="text-primary cursor-pointer"
              @click="
                pushRoute({
                  name: 'expense_bill_bill_natural_resources_detail',
                  params: {
                    billId: row.billId,
                  },
                  query: {
                    active: 3,
                    transMonth: date,
                    title: 'bill.bill',
                    path: '/cost-center/expense-bill/bill/list',
                  },
                })
              "
              >{{ t('bill.detail') }}</span
            >
          </template>
        </el-table-column>
      </el-table>

      <CatPagination
        v-model:pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        :custom-keys="['page', 'pageSize']"
        @change="paginationChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { _resourceBill, _getBillTotalMoney } from '@/apis/cost-center/expense-bill'
import { maoYunDayJs, FORMAT_TIME, FORMAT_YEAR_NO_UTC, FORMAT_ONLY_MONTH_NO_UTC } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import {
  COST_TYPE_MAP,
  TRANSACTION_TYPE_MAP,
  COST_TYPE_ARR_MAP,
  TRANSACTION_TYPE_ARR_MAP,
} from '@/views/cost-center/expense-bill/config'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { _productList } from '@/apis/product'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'

const props = withDefaults(
  defineProps<{
    date: string
  }>(),
  { date: '' },
)

const defaultIptFilterConfig = [
  { fieldName: t('bill.instanceId'), fieldKey: 'instanceId' }, // 实例ID
  { fieldName: t('bill.payerUin'), fieldKey: 'payerUin' }, // 支付者 UIN
  {
    fieldName: t('bill.userUin'),
    fieldKey: 'userUin',
  }, // 使用者 UIN
  {
    fieldName: t('bill.productIds'),
    fieldKey: 'productIds',
    fieldType: 'check',
    list: [],
  }, // 产品ID
  {
    fieldName: t('bill.costType'),
    fieldKey: 'billingMode',
    fieldType: 'select',
    list: COST_TYPE_ARR_MAP,
  }, // 计费模式
  {
    fieldName: t('bill.transactionTypes'),
    fieldKey: 'transactionType',
    fieldType: 'select',
    list: TRANSACTION_TYPE_ARR_MAP,
  }, // 按量计费模式
  {
    fieldName: t('bill.projectIds'),
    fieldKey: 'projectIds',
    fieldType: 'check',
    list: [],
  }, // 项目ID
  {
    fieldName: t('bill.regionIds'),
    fieldKey: 'regionIds',
    fieldType: 'check',
    list: [],
  }, // 地域节点
  {
    fieldName: t('bill.zone'),
    fieldKey: 'zoneIds',
    fieldType: 'check',
    list: [],
  }, // 可用区节点
]

const { filterInputRef, iptFilterConfig } = useFilter({}, defaultIptFilterConfig)
const { getAllZoneList, getListWithRegion, getUserProject } = useBaseConfig()

const list = ref<any[]>([]) // 列表
const loading = ref<boolean>(false)

// 账单花费
const cost = reactive<{
  originalPrice: string
  money: string
  voucherMoney: string
  giftGoldMoney: string
  platformAdvancePaymentMoney: string
  discountPrice: string
}>({
  originalPrice: '',
  money: '',
  voucherMoney: '',
  giftGoldMoney: '',
  platformAdvancePaymentMoney: '',
  discountPrice: '',
})

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const tips = computed(() => [
  {
    main: t('bill.naturalResourcesTip1', [
      maoYunDayJs(props.date).format(FORMAT_YEAR_NO_UTC),
      maoYunDayJs(props.date).format(FORMAT_ONLY_MONTH_NO_UTC),
    ]),
    sub: [t('bill.naturalResourcesTip2'), t('bill.naturalResourcesTip3')],
  },
])

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)
  paginationConfig.pagination.page = 1

  resourceBill(search)
}

// 处理资源id/实例别名
const handleId = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = row.instanceId || row.alias ? true : false
  config.instanceId = row.instanceId
  config.alias = row.alias

  return config
}

// 分页
const paginationChange = () => {
  resourceBill()
  getBillTotalMoney()
}

// 资源账单
const resourceBill = async (search = filterInputRef.value?.searchParams || {}) => {
  try {
    loading.value = true

    const res = await _resourceBill({
      month: props.date,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      ...search,
    })
    // console.log(`resourceBill===>`, res)

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    } else {
      list.value = []
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 资源账单总费用
const getBillTotalMoney = async () => {
  const res = await _getBillTotalMoney({ month: props.date })
  // console.log(`_getBillTotalMoney===>`, res)

  if (res.success) {
    cost.originalPrice = res.data?.originalPrice
    cost.discountPrice = res.data?.discountPrice
    cost.money = res.data?.money
    cost.voucherMoney = res.data?.voucherMoney
    cost.giftGoldMoney = res.data?.giftGoldMoney
    cost.platformAdvancePaymentMoney = res.data?.platformAdvancePaymentMoney
  }
}

// 查询产品列表
const productList = async () => {
  try {
    const res = await _productList()

    console.log(`_productList===>`, res)

    if (res.success) {
      iptFilterConfig.value[3].list = res?.data.map(el => ({
        label: el.name,
        value: el.productId,
      }))
    }
  } catch (error) {
    console.log(error)
  }
}

// 用户项目列表
const getUserProjectFn = async () => {
  const cb = (res: any) => {
    iptFilterConfig.value[6].list = res?.data.map(el => ({
      label: el.projectName,
      value: el.id,
    }))
  }

  getUserProject({}, cb)
}

// 查询所有可用区
const getAllZoneListFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      const zoneList = res.data || []
      const arr = zoneList.map(el => ({
        label: el.zoneName,
        value: el.id,
      }))

      iptFilterConfig.value[8].list = arr
    }
  }

  getAllZoneList(cb)
}

// 获取大区列表及其地区
const getListWithRegionFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      let allArea: any[] = [] // 所有地区

      for (const el of res.data || []) {
        const regionDTOS = el.regionDTOS || []
        allArea.push(...regionDTOS)
      }

      const arr = allArea.map(el => ({
        label: el.regionName,
        value: el.id,
      }))

      console.log(`getListWithRegionFn===>`, allArea)

      iptFilterConfig.value[7].list = arr
    }
  }
  getListWithRegion(cb)
}

// 监听date
watch(
  () => props.date,
  () => {
    resourceBill()
    getBillTotalMoney()
  },
)

onMounted(() => {
  getUserProjectFn()
  productList()
  resourceBill()
  getBillTotalMoney()
  getAllZoneListFn()
  getListWithRegionFn()
})
</script>

<style lang="scss" scoped>
.wrap {
  .list-wrap {
    padding: 20px;
    background-color: #fff;
  }
}

.price-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--warning-color);
}

:deep(.table-header) {
  display: flex;
  align-items: center;

  .table-header_icon {
    margin-left: 5px;
  }
}
</style>
