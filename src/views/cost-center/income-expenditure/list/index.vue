<template>
  <div class="wrap">
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <div class="df jsb ac">
      <div class="query-wrap mb20 df ac">
        <BtnsGroup v-model="btnValue" class="mr10" :style="btnStyle" :list="btnsGroupList" @change-value="changeDate" />

        <div class="df ac mr10">
          <span class="mr10">{{ t('common.select_time') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
        </div>

        <!-- 日期选择范围 -->
        <el-date-picker
          v-model="dateTime"
          class="mr10"
          type="daterange"
          start-placeholder=""
          end-placeholder=""
          :shortcuts="shortcuts"
          :range-separator="t('export.to')"
          :clearable="false"
          value-format="YYYY-MM-DD"
        />

        <!-- 交易类型 -->
        <el-select
          v-model="query.type"
          class="mr10"
          :teleported="true"
          :placeholder="t('incomeExpenditure.allTypePlaceholder')"
          @change="getList"
        >
          <el-option v-for="item in query.selectOpts" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>

        <el-checkbox v-model="query.show" :label="t('incomeExpenditure.showZero')" size="large" @change="getList" />
      </div>

      <el-button class="ml14 refresh" @click="download">
        <SvgIcon name="cat-cdn-download" />
      </el-button>
    </div>

    <div class="page-box cost-wrap mb20 df ac jsb">
      <div class="left-cost">
        <p class="key">
          {{ t('incomeExpenditure.summaryDesc1') }}
        </p>
        <p class="value">
          {{ t('incomeExpenditure.summaryDesc2', [tableData.info?.incomeMoney, tableData.info?.payoutMoney]) }}
        </p>
      </div>
      <div class="right-cost df ac">
        <!-- 充值 -->
        <div style="flex: 1; padding-left: 20px" class="border-l-1">
          <p class="key">
            {{ t('incomeExpenditure.rechargeMoney') }}
          </p>
          <p class="value text-success">${{ tableData.info?.rechargeMoney }} USD</p>
        </div>
        <!-- 冻结 -->
        <div style="flex: 1; padding-left: 20px" class="border-l-1">
          <p class="key">
            {{ t('incomeExpenditure.freeze') }}
          </p>
          <p class="value text-warning">${{ tableData.info?.freezeMoney }} USD</p>
        </div>
        <!-- 扣费 -->
        <div style="flex: 1; padding-left: 20px" class="border-l-1">
          <p class="key">
            {{ t('incomeExpenditure.deductionMoney') }}
          </p>
          <p class="value text-warning">${{ tableData.info?.deductionMoney }} USD</p>
        </div>
        <!-- 退款 -->
        <div style="flex: 1; padding-left: 20px" class="border-l-1">
          <p class="key">
            {{ t('incomeExpenditure.refund') }}
          </p>
          <p class="value text-error">${{ tableData.info?.refundMoney }} USD</p>
        </div>
        <!-- 解冻 -->
        <div style="flex: 1; padding-left: 20px" class="border-l-1">
          <p class="key">
            {{ t('incomeExpenditure.thaw') }}
          </p>
          <p class="value text-success">${{ tableData.info?.unfreezeMoney }} USD</p>
        </div>
      </div>
    </div>

    <el-card shadow="never" class="page-box" :body-style="bodyStyle">
      <el-table v-loading="loading" :data="tableData.list" show-overflow-tooltip>
        <!-- 交易时间 -->
        <el-table-column min-width="240" prop="transTime" :label="t('incomeExpenditure.transTime')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('incomeExpenditure.transTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span>{{ row.transTime ? maoYunDayJs(row.transTime).format(FORMAT_TIME) : '-' }}</span>
          </template>
        </el-table-column>
        <!-- 交易类型 -->
        <el-table-column min-width="150" prop="incomeType" :label="t('incomeExpenditure.incomeType')">
          <template #default="{ row }">
            {{ query.selectOpts.find(i => i.value === row.incomeType)?.label }}
          </template>
        </el-table-column>
        <!-- 交易渠道 -->
        <el-table-column min-width="220" prop="channel" :label="t('incomeExpenditure.channel')">
          <template #default="{ row }">
            {{ CHANNEL_MAP[row.channel] || '-' }}
          </template>
        </el-table-column>
        <el-table-column min-width="400" prop="description" :label="t('incomeExpenditure.description')" />
        <!-- 入账 -->
        <el-table-column min-width="160" :label="t('incomeExpenditure.enter')">
          <template #default="{ row }">
            {{ row.moneyType === 1 ? row.money || 0 : '-' }}
          </template>
        </el-table-column>
        <!-- 支出 -->
        <el-table-column min-width="160" :label="t('incomeExpenditure.expenditure')">
          <template #default="{ row }">
            {{ row.moneyType === 2 ? row.money || 0 : '-' }}
          </template>
        </el-table-column>
        <el-table-column min-width="140" prop="transMonth" :label="t('incomeExpenditure.transMonth')" />
        <!-- 冻结金额 -->
        <el-table-column min-width="160" :label="t('incomeExpenditure.freezePrice')">
          <template #default="{ row }">
            {{ row.freezeMoney || 0 }}
          </template>
        </el-table-column>
        <!-- 现金余额 -->
        <el-table-column min-width="180" :label="t('incomeExpenditure.balance')">
          <template #default="{ row }">
            {{ row.balance || 0 }}
          </template>
        </el-table-column>
        <el-table-column min-width="180" :label="t('incomeExpenditure.giveMoney')">
          <template #default="{ row }">
            {{ row.giveMoney || 0 }}
          </template>
        </el-table-column>
        <!-- 垫付未回款 -->
        <el-table-column min-width="300" :label="t('incomeExpenditure.advancePayBalance')">
          <template #default="{ row }">
            {{ row.advanceMoney || 0 }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" min-width="100" :label="t('common.operation')">
          <template #default="{ row }">
            <DisableText
              disabled-type="hidden"
              class="mr10"
              :disabled="!isSeeDetail(row.incomeType)"
              :text="t('incomeExpenditure.detail')"
              @click="goDetail(row)"
            />
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
  </div>
</template>

<script setup lang="ts">
import { _incomeRecordList, _incomeRecordExport } from '@/apis/cost-center/income-expenditure'
import { IncomeRecordListReq, IncomeRecordExportReq } from '@/apis/cost-center/income-expenditure/type'
import { maoYunDayJs, FORMAT_DAY_NO_UTC, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import { CHANNEL_MAP, INCOME_TYPE_ARR_MAP, isSeeDetail } from '@/views/cost-center/income-expenditure/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

interface TableDataType {
  id: number // ID
  incomeType: number // 交易类型 1 充值 2扣费 3 垫付 4 垫付回款 5 充帐 6 退款
  channel: number // 交易渠道 1 用户余额 2 微信 3 支付宝 4 foxpay 5 信用卡 101 线下汇款 102 充帐 103 退款 104 垫付 105 垫付回款
  description: string // 描述
  moneyType: number // 收支类型 1 收入 2 支出 3 不变
  money: number // 交易金额
  giveMoney: number // 剩余赠送金额
  balance: number // 可用余额
  advanceMoney: number // 未回款垫付金额
  transMonth: string // 交易月份 2024-01
  transTime: string // 交易时间 2024-01-25 11:44:10
}
interface TableDataInfo {
  incomeMoney?: number // 收入合计
  payoutMoney?: number // 支出合计
  rechargeMoney?: number // 充值合计
  deductionMoney?: number // 扣费合计
  refundMoney?: number // 退款合计
  freezeMoney?: number // 冻结合计
  unfreezeMoney?: number // 解冻合计
}

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const btnStyleMap = {
  [ja]: {
    width: '80px',
  },
  [en]: {
    width: '140px',
  },
  [zh]: {
    width: '80px',
  },
}

const btnStyle = useI18nStyle(btnStyleMap)

const bodyStyle = { height: '100%' }
const btnsGroupList = [
  {
    label: t('incomeExpenditure.curMonth'),
    value: 'curMonth',
  },
  {
    label: t('incomeExpenditure.lastMonth'),
    value: 'lastMonth',
  },
]

const btnValue = ref<any>({
  label: t('incomeExpenditure.curMonth'),
  value: 'curMonth',
})

const shortcuts = [
  {
    text: t('incomeExpenditure.curMonth'), // 本月
    value: () => {
      // 当前日期
      const end = maoYunDayJs()
      // 当前月的第一天
      const start = end.startOf('month')
      return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
    },
  },
  {
    text: t('incomeExpenditure.lastMonth'), // 上月
    value: () => {
      // 获取上个月的最后一天
      const end = maoYunDayJs().subtract(1, 'month')
      // 获取上个月的第一天
      const start = end.startOf('month')
      return [start.format(FORMAT_DAY_NO_UTC), end.endOf('month').format(FORMAT_DAY_NO_UTC)]
    },
  },
  {
    text: t('incomeExpenditure.lastMonths'), // 最近一个月
    value: () => {
      const end = maoYunDayJs()
      const start = end.subtract(1, 'month')
      return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
    },
  },
  {
    text: t('incomeExpenditure.lastThreeMonths'), // 最近三个月
    value: () => {
      const end = maoYunDayJs()
      const start = end.subtract(3, 'month')
      return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
    },
  },
]
// 日期选择范围 默认本月
const defaultTime = shortcuts[0].value()
const dateTime = ref<any>(defaultTime)
const query = reactive<{
  dateActive: number
  selectOpts: any[]
  type: any
  show: boolean
}>({
  dateActive: 1,
  type: 0,
  selectOpts: INCOME_TYPE_ARR_MAP,
  show: false,
})
const tableData = reactive<{
  list: TableDataType[]
  info: TableDataInfo
}>({
  list: [],
  info: {},
})
const loading = ref<boolean>(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const tips = computed(() => [
  {
    main: t('incomeExpenditure.incomeExpenditureTip1'),
    sub: [
      t('incomeExpenditure.incomeExpenditureTip2'),
      t('incomeExpenditure.incomeExpenditureTip3'),
      t('incomeExpenditure.incomeExpenditureTip4'),
    ],
  },
])

// 更新日期
const changeDate = (v: any) => {
  if (v.value === 'curMonth') {
    dateTime.value = shortcuts[0].value()
  } else {
    dateTime.value = shortcuts[1].value()
  }
}

// 跳转详情页
const goDetail = row => {
  console.log(`goDetail===>`, row, row.id)

  if (row.incomeType === 2) {
    // 扣款类型跳转到明细账单
    pushRoute({
      name: 'expense_bill_bill_list',
      query: {
        active: 4,
        incomeSerialNo: row.incomeSerialNo,
      },
    })
  } else {
    // 其他跳转到收支详情
    pushRoute({
      name: 'income_expenditure_detail',
      params: {
        id: row.id,
        incomeType: row.incomeType,
      },
      query: {
        title: 'incomeExpenditure.incomeExpenditure',
        path: '/cost-center/income-expenditure/list',
      },
    })
  }
}

// 创建下载收支明细任务
const download = async () => {
  const params: IncomeRecordExportReq = {
    beginDate: dateTime.value[0],
    endDate: dateTime.value[1],
    showZero: query.show ? 1 : 2,
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
  }
  if (query.type !== 0) {
    params.transType = query.type
  }
  console.log('download params ===>', params)
  const res = await _incomeRecordExport(params)
  console.log('res', res)
  if (res.success) {
    pushRoute({
      name: 'export',
      query: {
        type: 7,
      },
    })
  }
}

// 查询收支明细列表
const getList = async () => {
  try {
    loading.value = true

    const params: IncomeRecordListReq = {
      beginDate: dateTime.value[0],
      endDate: dateTime.value[1],
      showZero: query.show ? 1 : 2,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    }
    // 交易类型
    if (query.type !== 0) {
      params.transType = query.type
    }
    // console.log('getList params ===>', params)
    const res = await _incomeRecordList(params)
    // console.log('res', res)
    if (res.success) {
      tableData.info = {
        incomeMoney: res.data.incomeMoney,
        payoutMoney: res.data.payoutMoney,
        rechargeMoney: res.data.rechargeMoney,
        deductionMoney: res.data.deductionMoney,
        refundMoney: res.data.refundMoney,
        freezeMoney: res.data.freezeMoney,
        unfreezeMoney: res.data.unfreezeMoney,
      }
    }
    tableData.list = res.data?.list || []

    paginationConfig.total = res.data.recordCnt
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 分页
const paginationChange = () => {
  getList()
}

// 监听datetime
watch(dateTime, () => {
  const curMonthTime = shortcuts[0].value()
  const lastMonthTime = shortcuts[1].value()

  // 当前选中是否当前月
  const isCurrentMonth = curMonthTime[0] === dateTime.value[0] && curMonthTime[1] === dateTime.value[1]
  // 当前选中是否上个月
  const isLastMonth = lastMonthTime[0] === dateTime.value[0] && lastMonthTime[1] === dateTime.value[1]

  if (isCurrentMonth) {
    // 本月
    btnValue.value = btnsGroupList[0]
  } else if (isLastMonth) {
    // 上月
    btnValue.value = btnsGroupList[1]
  } else {
    // 其他
    btnValue.value = {}
  }

  getList()
})

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.wrap {
  .cost-wrap {
    box-sizing: border-box;
    height: 120px;
    padding: 0 20px;

    .left-cost {
      flex: 1;

      .key {
        margin-bottom: 8px;
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 16px;
        color: var(--primary-text);
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--common-text);
      }
    }

    .right-cost {
      flex: 1;

      .key {
        margin-bottom: 8px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--common-text);
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 16px;

        /* color: #0FBE5B; */
      }
    }
  }
}

.border-l-1 {
  border-left: 1px solid var(--border-c);
}
</style>
