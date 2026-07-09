<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <div class="title">
      <span>{{ t('order.prePayOrder') }}</span>
    </div>

    <!-- search -->
    <div class="options-wrap df ac jsb flex-wrap">
      <div :lg="18">
        <div class="df ac mt20">
          <!-- 合并付款 -->
          <el-button class="mr10 btn" :type="selectList.length ? 'primary' : ''" @click="handleBatchPay">
            {{ t('order.consolidatePay') }}
          </el-button>

          <div class="df ac mr10">
            <span class="mr10">{{ t('common.select_time') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>

          <div>
            <!-- 日期选择范围 -->
            <el-date-picker
              v-model="dateTime"
              style="width: 260px"
              class="mr10"
              type="daterange"
              start-placeholder=""
              end-placeholder=""
              :shortcuts="shortcuts"
              :range-separator="t('export.to')"
              :clearable="false"
              value-format="YYYY-MM-DD"
            />
          </div>
          <!-- 产品id -->
          <el-select
            v-model="productId"
            :placeholder="t('order.productPh')"
            :teleported="true"
            class="mr10"
            @change="changeProduct"
          >
            <el-option v-for="item in productOpts" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
          <!-- 子产品id -->
          <el-select
            v-model="subProductId"
            :placeholder="t('order.suPproductPh')"
            :teleported="true"
            @change="changeSubProduct"
          >
            <el-option v-for="item in curProductSubOpts" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
      </div>

      <div :lg="6" class="df jfe mt20">
        <div class="search-wrap">
          <!-- 后端模糊查询只支持查询订单号 -->
          <el-input v-model="condition" :placeholder="t('order.tradeNoPlaceholder')" :suffix-icon="Search" />
        </div>
        <el-button :disabled="list?.length === 0" class="ml14 download" @click="download">
          <SvgIcon name="cat-cdn-download" />
        </el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" class="mt20 table" @selection-change="handleRowSelectChange">
      <el-table-column type="selection" width="40" :selectable="row => isPay(row.status)" />
      <el-table-column min-width="250" prop="tradeNo" :label="t('order.tradeNo')" />
      <!-- 产品 -->
      <el-table-column min-width="160" prop="productNameList" :label="t('order.productName')">
        <template #default="{ row }">
          {{ row.productNameList.join('/') }}
        </template>
      </el-table-column>
      <!-- 子产品 -->
      <el-table-column min-width="160" prop="subProductNameList" :label="t('order.subProductNameList')">
        <template #default="{ row }">
          {{ row.subProductNameList.join('/') }}
        </template>
      </el-table-column>
      <!-- 计费类型 -->
      <el-table-column min-width="180" :label="t('order.costType')" show-overflow-tooltip>
        <template #default="{ row }">
          <span>
            {{ COST_TYPE_MAP[row.costType] }}
          </span>
        </template>
      </el-table-column>
      <!-- 类型 -->
      <el-table-column min-width="160" :label="t('order.type')">
        <template #header>
          <CatTableHeadFilter v-model="orderType" :label="t('order.type')" tip="" show-all :list="orderTypeList" />
        </template>
        <template #default="{ row }">
          <span>{{ ORDER_TYPE_MAP[row.type] }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="220" :label="t('order.createTime')">
        <template #header>
          <div class="df ac">
            <span>{{ t('order.createTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>
      <!-- 状态 -->
      <el-table-column min-width="200" :label="t('order.status')">
        <template #default="{ row }">
          <span :class="statusTypeClass(row.status)">{{ ORDER_STATUS_MAP[row.status] }}</span>
        </template>
      </el-table-column>
      <!-- 实付金额 -->
      <el-table-column min-width="250" prop="amount" :label="t('order.amount')" />
      <el-table-column fixed="right" min-width="150" :label="t('common.operation')">
        <template #default="{ row }">
          <div class="df ac">
            <!-- 详情 -->
            <DisableText :disabled="!isSeeDetail(row.status)" :text="t('order.detail')" @click="toDetail(row)" />
            <!-- 付款 -->
            <DisableText
              :disabled="!isPay(row.status)"
              :text="t('order.pay')"
              disabled-type="hidden"
              class="ml20"
              @click="handlePay(row)"
            />
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
</template>

<script setup lang="ts">
import { message } from '@/utils/message'
import { Search } from '@element-plus/icons-vue'
import { _queryOrderPage, _exportOrder } from '@/apis/cost-center/order'
import { _productList, _listProductSubType } from '@/apis/product'
import { maoYunDayJs, ManipulateType, FORMAT_TIME, FORMAT_DAY_NO_UTC } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import {
  ORDER_TYPE_MAP,
  ORDER_STATUS_MAP,
  ORDER_STATUS_CLASS_NAME_MAP,
  isSeeDetail,
  isPay,
} from '@/views/cost-center/order/config'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { pushRoute } from '@/utils/router-jump'

const bodyStyle = { height: '100%' }
const orderTypeList = Object.keys(ORDER_TYPE_MAP).map(el => ({
  label: ORDER_TYPE_MAP[el],
  value: el,
}))
// 获取时间
const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
}
const shortcuts = [
  {
    text: t('order.oneWeek'), // 最近一周
    value: () => {
      return getDateTime(1, 'week')
    },
  },
  {
    text: t('order.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month')
    },
  },
  {
    text: t('order.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month')
    },
  },
]
// 日期选择范围 默认
const defaultTime = shortcuts[0].value()
const dateTime = ref<any>(defaultTime)
const productOpts = ref<any[]>([]) // 产品列表
const productSubOpts = ref<any[]>([]) // 子产品列表
const productId = ref<any>('') // 产品ID
const subProductId = ref<any>('') // 子产品ID
const condition = ref<string>('') // 查询条件
const list = ref<any[]>([]) // 订单列表
const selectList = ref<any>([]) // 选中的订单
const payIds = ref<number[]>([]) // 付款id
const orderType = ref<string>('') // 类型
// 订单类型列表
const loading = ref<boolean>(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 子产品
const curProductSubOpts = computed(() => {
  const arr: any = [
    {
      value: '',
      label: t('order.allSubPlaceholder'),
    },
  ]
  if (!productId.value) {
    return [...arr]
  } else {
    const product = productOpts.value.find(el => el.value === productId.value)
    if (product) {
      return [...arr, ...productSubOpts.value.filter(el => el.symbol === product.symbol)]
    } else {
      return [...arr]
    }
  }
})

// 切换产品
const changeProduct = () => {
  subProductId.value = ''
}

// 切换子产品
const changeSubProduct = () => {}

// 状态className
const statusTypeClass = (key: number) => {
  return ORDER_STATUS_CLASS_NAME_MAP[key]
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// 跳转详情页
const toDetail = row => {
  console.log(`toDetail===>`, row, row.tradeNo)

  pushRoute({
    name: 'order_detail',
    params: {
      tradeNo: row.tradeNo,
    },
    query: {
      title: 'order.order',
      path: '/cost-center/order/list',
    },
  })
}

// 分页
const paginationChange = () => {
  queryOrderPage()
}

// 单个支付
const handlePay = (row: any) => {
  console.log(`handlePay==>`, row)

  pushRoute({
    name: 'payment_product_order',
    params: {
      tradeNo: row.tradeNo,
    },
    query: { type: 'order' },
  })
}

// 批量支付
const handleBatchPay = () => {
  if (!selectList.value.length) {
    return message.warning(t('order.payWarn'))
  }
  // 待支付的数据
  payIds.value = selectList.value.filter(el => el.status == 1).map(el => el.tradeNo)

  if (!payIds.value.length) {
    return message.warning(t('order.payWarn'))
  }

  pushRoute({
    name: 'payment_product_order',
    params: {
      tradeNo: payIds.value.join('-'),
    },
    query: { type: 'order' },
  })
}

// 获取订单列表
const queryOrderPage = async () => {
  try {
    loading.value = true
    const beginDate = dateTime.value[0]
    const endDate = dateTime.value[1]

    const params: any = {
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      tradeNo: condition.value,
      beginDate,
      endDate,
      productId: productId.value || '',
      subProductId: subProductId.value || '',
    }
    // 订单类型
    if (orderType.value) {
      params.type = orderType.value
    }

    const res = await _queryOrderPage(params)

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 查询产品列表
const productList = async () => {
  try {
    const res = await _productList()

    console.log(`_productList===>`, res)

    if (res.success) {
      const arr: any[] = [
        {
          value: '',
          label: t('order.allPlaceholder'),
        },
      ]
      for (const el of res?.data || []) {
        arr.push({
          value: el.productId,
          label: el.name,
          symbol: el.symbol,
        })
      }

      productOpts.value = arr
    }
  } catch (error) {
    console.log(error)
  }
}

// 查询子产品类型列表
const listProductSubType = async () => {
  try {
    const res = await _listProductSubType({
      id: '',
      symbol: '',
    })

    console.log(`_listProductSubType===>`, res)

    if (res.success) {
      const arr: any[] = []
      for (const el of res?.data || []) {
        if (el.subTypeList?.length) {
          for (const item of el.subTypeList) {
            arr.push({
              value: item.id,
              label: item.typeName,
              symbol: el.symbol,
            })
          }
        }
      }

      productSubOpts.value = arr
    }
  } catch (error) {
    console.log(error)
  }
}

// 创建下载订单管理任务
const download = async () => {
  const beginDate = dateTime.value[0]
  const endDate = dateTime.value[1]

  const params: any = {
    tradeNo: condition.value,
    beginDate,
    endDate,
    productId: productId.value,
    subProductId: subProductId.value,
  }

  console.log('download params ===>', params)
  const res = await _exportOrder(params)
  console.log('res', res)
  if (res.success) {
    pushRoute({
      name: 'export',
      query: {
        type: 5,
      },
    })
  }
}

// 订单类型 条件 产品id 子产品id datetime
watch([orderType, condition, productId, subProductId, dateTime], () => {
  queryOrderPage()
})

onMounted(async () => {
  queryOrderPage()
  productList()
  listProductSubType()
})
</script>

<style lang="scss" scoped>
.btn {
  color: #fff;
  background-color: var(--btn-hover);
  border-color: var(--btn-hover);

  // 触摸
  &:hover {
    color: #fff;
    background-color: var(--btn-hover);
    border-color: var(--btn-hover);
  }

  // 点击
  &:focus {
    /* background-color: var(--btn-hover);
    border-color: var(--btn-hover);
    color: #fff; */
  }
}

.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 16px;
  line-height: 22px;

  // font-weight: 500;
  color: var(--table-text);
}

.options-wrap {
  .download {
    width: 34px;
    height: 34px;
  }
}

.search-wrap {
  width: 360px;
  height: 34px;
  border-radius: 4px;
}

.table {
  .select-th {
    margin-left: -12px;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;

      .el-input__inner {
        &::placeholder {
          color: var(--table-text) !important;
        }
      }
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

  :deep(.is-disabled .el-checkbox__inner) {
    background: #eee !important;
  }
}

.cancel-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--table-text);
}
</style>
