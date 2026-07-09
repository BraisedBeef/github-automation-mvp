<template>
  <div>
    <!-- top-wrap -->
    <el-card shadow="never" class="page-box top-wrap mb20" :body-style="bodyStyle">
      <div class="title">
        {{ t('accountCostCenter.usableQuota') }}
      </div>
      <div class="price-wrap df ac mb20">
        <p class="num">
          <span>{{ priceNum(accountInfo.usableQuota || 0) }}</span>
        </p>
        <div class="btn-wrap">
          <!-- 充值 -->
          <el-button v-permission="['feeApi:createRechargeOrder']" type="primary" @click="toRecharge">
            {{ t('accountCostCenter.recharge') }}
          </el-button>
          <!-- 收支明细 -->
          <el-button
            v-permission="['feeApi:queryIncomeRecordList']"
            style="color: var(--primary-color)"
            @click="toIncomeExpenditure"
          >
            {{ t('incomeExpenditure.incomeExpenditure') }}
          </el-button>
        </div>
      </div>
      <div class="calculate-wrap df ac mb20">
        <!-- 现金余额 -->
        <div class="total-wrap">
          <div class="top df ac">
            <span class="mr4">{{ t('accountCostCenter.balance') }}</span>
            <el-tooltip :content="t('accountCostCenter.balanceTooltip')" placement="top" effect="light">
              <SvgIcon name="question" />
            </el-tooltip>
          </div>
          <div class="bottom price-text">
            <span class="text-14" /><span>{{ priceNum(accountInfo.balance || 0) }}</span>
          </div>
        </div>
        <span v-if="accountInfo.advanceStatus === 2" class="symbol">+</span>
        <!-- 信用额度 -->
        <div v-if="accountInfo.advanceStatus === 2" class="credit-wrap">
          <div class="top df ac">
            <span class="mr4">{{ t('accountCostCenter.advanceQuota') }}</span
            ><el-tooltip :content="t('accountCostCenter.advanceQuotaTooltip')" placement="top" effect="light">
              <SvgIcon name="question" />
            </el-tooltip>
          </div>
          <div class="bottom">
            <span class="text-14" /><span>{{ accountInfo.advanceQuota || 0 }} USD</span>
          </div>
        </div>
        <span class="symbol">+</span>
        <!-- 赠送金余额 -->
        <div class="cash-wrap">
          <div class="top df ac">
            <span class="mr4">{{ t('accountCostCenter.giveMoney') }}</span
            ><el-tooltip :content="t('accountCostCenter.giveMoneyTooltip')" placement="top" effect="light">
              <SvgIcon name="question" />
            </el-tooltip>
          </div>
          <div class="bottom">
            <span class="text-14" /><span>{{ accountInfo.giveMoney || 0 }} USD</span>
          </div>
        </div>
        <span v-if="accountInfo.advanceStatus === 2" class="symbol">-</span>
        <!-- 垫付未回款 -->
        <div v-if="accountInfo.advanceStatus === 2" class="vouchers-wrap">
          <div class="top">
            {{ t('accountCostCenter.advanceWaitRefundMoney') }}
          </div>
          <div class="bottom">
            <span class="text-14" /><span>{{ accountInfo.advanceWaitRefundMoney || 0 }} USD</span>
          </div>
        </div>
      </div>
    </el-card>
    <!-- center-wrap -->
    <el-card shadow="never" class="page-box center-wrap mb20" :body-style="bodyStyle">
      <div class="df">
        <div class="item coupon">
          <div class="top-desc">
            {{ t('accountCostCenter.coupon') }}
          </div>
          <div class="bottom-desc">
            0 <span class="text-14">{{ t('accountCostCenter.couponNum') }}</span>
          </div>
        </div>
        <div v-if="accountInfo.advanceStatus === 2" class="item advance border-l-1">
          <div class="top-desc">
            {{ t('accountCostCenter.advanceWaitRefundMoneys') }}
          </div>
          <div class="bottom-desc">
            <span>{{ accountInfo.advanceWaitRefundMoney || 0 }} USD</span>
          </div>
          <p v-if="accountInfo.advanceWaitRefundMoney" class="text-primary cursor-pointer" @click="toRepayment">
            {{ t('accountCostCenter.payment') }}
          </p>
        </div>
        <div class="item invoicable border-l-1">
          <div class="top-desc">
            {{ t('accountCostCenter.invoicableAmount') }}
          </div>
          <div class="bottom-desc">
            <span>{{ invoiceSummary.invoicableAmount || 0 }} USD</span>
          </div>
          <p v-if="invoiceSummary.invoicableAmount" class="text-primary cursor-pointer" @click="toExpenseBillInvoice">
            {{ t('accountCostCenter.invoice') }}
          </p>
        </div>
      </div>
    </el-card>
    <!-- bottom-wrap -->
    <el-row class="bottom-wrap" :gutter="20">
      <!-- 待支付订单 -->
      <el-col v-permission="['feeApi:queryProductOrderPage']" :span="12">
        <div v-loading="queryOrder.loading" shadow="never" class="item paid-list h-full">
          <div class="title mb20">
            {{ t('accountCostCenter.paidOrder', [queryOrder.total]) }}
          </div>
          <template v-if="queryOrder.list.length">
            <div v-for="(item, index) in queryOrder.list" :key="index" class="item df ac jsb border-b-1">
              <div class="left">
                <div class="top text-14">
                  {{ maoYunDayJs(item?.createTime).format(FORMAT_TIME) }}
                </div>
                <div class="bottom text-14">
                  {{ item?.subProductNameList?.join(',') }}
                </div>
              </div>
              <div class="right">
                <div class="top text-14 text-warning">
                  {{ t('accountCostCenter.priceNum', [item.amount]) }}
                </div>
                <div class="bottom text-14" style="text-align: right; text-decoration: line-through">
                  ${{ item.originalAmount }} USD
                </div>
              </div>
            </div>
            <div class="more mt20">
              <span class="text-primary cursor-pointer" @click="showQueryOrderMore">{{
                t('accountCostCenter.more')
              }}</span>
            </div>
          </template>
          <template v-else>
            <div style="margin-top: 100px">
              <NoData :text="t('accountCostCenter.noDataPaid')" svg-name="no-data-order" />
            </div>
          </template>
        </div>
      </el-col>
      <!-- 月度资源账单 -->
      <el-col v-permission="['feeApi:getTransMonthBillOverview']" :span="12">
        <div v-loading="transMonthBillOverview.loading" class="item month-list h-full">
          <div class="title mb20">
            {{ t('accountCostCenter.monthBill') }}
          </div>

          <template v-if="transMonthBillOverview.list.length">
            <div v-for="(item, index) in transMonthBillOverview.list" :key="index" class="item df ac jsb border-b-1">
              <div class="left">
                <div class="top text-14">
                  {{ item.transDate }}
                </div>
              </div>
              <div class="right">
                <span>{{ t('accountCostCenter.priceNum', [item.discountPrice]) }}</span>
              </div>
            </div>
            <div class="more mt20">
              <span class="text-primary cursor-pointer" @click="showMonthMore">{{ t('accountCostCenter.more') }}</span>
            </div>
          </template>
          <template v-else>
            <div style="margin-top: 100px">
              <NoData :text="t('accountCostCenter.noDataMonth')" svg-name="no-data-month" />
            </div>
          </template>
        </div>
      </el-col>
      <!-- 30天内待续费资源 后续开发-->
      <!-- <el-col :span="8" v-if="false">
        <div class="renew-list item h-full">
          <div class="title mb20">{{ t('accountCostCenter.renewal', [0]) }}</div>
          <template v-if="false">
            <div class="item df ac jsb border-b-1" v-for="item in 4" :key="item">
              <div class="left">
                <div class="top text-14">这里是产品类别 uadhaisqddasd...</div>
                <div class="bottom text-14">这里是地域 / 可用区</div>
              </div>
              <div class="right"><span>剩余</span><span class="text-14 text-error">21小时12分钟</span></div>
            </div>
            <div class="more mt20">
              <span class="text-primary cursor-pointer">{{ t('accountCostCenter.more') }}</span>
            </div>
          </template>
          <template v-else>
            <div style="margin-top: 100px">
              <NoData :text="t('accountCostCenter.noDataRenewal')" svgName="no-data-resource" />
            </div>
          </template>
        </div>
      </el-col> -->
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { _getAccountInfo, _queryOrderPage, _getTransMonthBillOverview } from '@/apis/cost-center/user'
import { _getInvoicableSummary } from '@/apis/cost-center/expense-bill'
import { thousandsCount } from '@/utils/number-utils'
import NoData from './components/no-data.vue'
import { maoYunDayJs, FORMAT_TIME, FORMAT_MONTH_NO_UTC, FORMAT_DAY_NO_UTC } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { pushRoute } from '@/utils/router-jump'

type QueryOrderType = {
  createTime?: string // 创建时间
  productName?: string // 产品名称
  subProductNameList?: string[] // 子产品产品列表
  amount?: number // 金额
  originalAmount?: number // 原价
}

type TransMonthBillOverviewType = {
  transDate: string // 日期
  discountPrice: number // 总金额
}

const bodyStyle = { height: '100%' }
const accountInfo = ref<any>({}) // 用户详情
const invoiceSummary = ref<any>({}) // 可开票金额

// 待支付订单
const queryOrder = reactive<{
  list: QueryOrderType[]
  allList: QueryOrderType[]
  total: number
  loading: boolean
}>({
  list: [],
  allList: [],
  total: 0,
  loading: false,
})

// 月度资源账单
const transMonthBillOverview = reactive<{
  list: TransMonthBillOverviewType[]
  allList: TransMonthBillOverviewType[]
  loading: boolean
}>({
  list: [],
  allList: [],
  loading: false,
})

// 美元数值处理
const priceNum = (num: string | number) => {
  num = Number(num)

  if (num < 0) {
    return `-${Math.abs(num)} USD`
  } else {
    return `${num} USD`
  }
}

// 查询登录用户账户
const getAccountInfo = async () => {
  const res = await _getAccountInfo()

  console.log('getAccountInfo', res)

  if (res.success) {
    accountInfo.value = res.data || {}
  }
}

// 可开票金额
const getInvoicableSummary = async () => {
  const res = await _getInvoicableSummary()
  console.log(`_getInvoicableSummary===>`, res)
  if (res.success) {
    invoiceSummary.value = res.data || {}
  }
}

// 待支付订单
const getQueryOrderPage = async () => {
  try {
    queryOrder.loading = true
    // 目前共用的查询产品订单列表接口，因为没有分页，默认获取1000条数据且获取最近一年的数据
    const end = maoYunDayJs()
    const beginDate = end.subtract(1, 'year').format(FORMAT_DAY_NO_UTC)
    const endDate = end.format(FORMAT_DAY_NO_UTC)
    const params = {
      pageIndex: 1,
      pageSize: 1000,
      beginDate,
      endDate,
      status: 1,
    }
    const res = await _queryOrderPage(params)

    if (res.success) {
      queryOrder.allList = res.data.list || []
      queryOrder.list = res.data.list.slice(0, 4)
      queryOrder.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    queryOrder.loading = false
  }
}

// 获取月度资源账单列表
const getTransMonthBillOverview = async () => {
  try {
    transMonthBillOverview.loading = true
    const params = {
      transMonth: maoYunDayJs().format(FORMAT_MONTH_NO_UTC),
      queryType: 1,
    }
    const res = await _getTransMonthBillOverview(params)
    console.log('_getTransMonthBillOverview', res)
    if (res.success) {
      transMonthBillOverview.allList = res.data
      transMonthBillOverview.list = res.data.reverse().slice(0, 4)
    }
  } catch (error) {
    console.log(error)
  } finally {
    transMonthBillOverview.loading = false
  }
}

const showQueryOrderMore = () => {
  pushRoute({ name: 'order' })
}

const toRecharge = () => {
  pushRoute({
    name: 'cost_center_account_recharge',
    query: {
      title: 'accountCostCenter.accountInfo',
      path: '/cost-center/account/info',
    },
  })
}

const toIncomeExpenditure = () => {
  pushRoute({ name: 'income_expenditure' })
}

const toExpenseBillInvoice = () => {
  pushRoute({ name: 'expense_bill_invoice_list' })
}

const toRepayment = () => {
  pushRoute({
    name: 'cost_center_account_recharge',
    query: {
      title: 'accountCostCenter.accountInfo',
      path: '/cost-center/account/info',
    },
  })
}

const showMonthMore = () => {
  pushRoute({ name: 'expense_bill_bill_list' })
}

onMounted(() => {
  getAccountInfo()
  getQueryOrderPage()
  getTransMonthBillOverview()
  getInvoicableSummary()
})
</script>

<style lang="scss" scoped>
.top-wrap {
  height: 200px;

  .title {
    margin-bottom: 10px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: var(--table-text);
  }

  .price-wrap {
    .num {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 30px;
      color: var(--table-text);
    }

    .btn-wrap {
      margin-left: 40px;
    }
  }

  .calculate-wrap {
    box-sizing: border-box;
    height: 65px;
    padding: 13px;
    background: #f9fafc;

    .top {
      margin-bottom: 6px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }

    .bottom {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;

      // font-weight: 500;
    }

    .cash-wrap,
    .vouchers-wrap {
      color: var(--primary-text);
    }

    .symbol {
      margin-right: 75px;
      margin-left: 75px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--common-text);
    }
  }
}

.center-wrap {
  height: 160px;
  background-image: url('../../../../assets/images/cost-center/user/bg.png');
  background-repeat: no-repeat;

  /* 背景图片不重复 */
  background-position: right center;

  .item {
    flex: 1;

    .top-desc {
      margin-bottom: 10px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      font-weight: 400;
      color: var(--common-text);
    }

    .bottom-desc {
      margin-bottom: 10px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 30px;
      color: var(--primary-text);
    }
  }

  .coupon {
    // placeholder
  }

  .advance {
    padding-left: 20px;
  }

  .invoicable {
    padding-left: 20px;
  }
}

.bottom-wrap {
  min-height: 362px;

  .item {
    padding: 20px;
    background-color: #fff;
  }

  .paid-list {
    .title {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: var(--table-text);
    }

    .item {
      box-sizing: border-box;
      height: 60px;
      line-height: 60px;

      .top {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--primary-text);
      }

      .bottom {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 12px;
        font-weight: 400;
        color: var(--common-text);
      }
    }

    .more {
      text-align: center;
    }
  }

  .renew-list {
    .title {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: var(--table-text);
    }

    .item {
      box-sizing: border-box;
      height: 60px;
      line-height: 60px;

      .top {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--primary-text);
      }

      .bottom {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 12px;
        font-weight: 400;
        color: var(--common-text);
      }
    }

    .more {
      text-align: center;
    }
  }

  .month-list {
    .title {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: var(--table-text);
    }

    .item {
      box-sizing: border-box;
      height: 60px;
      line-height: 60px;

      .top {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--common-text);
      }
    }

    .more {
      text-align: center;
    }
  }
}

.text-14 {
  font-size: 14px;
}

.border-l-1 {
  border-left: 1px solid var(--border-c);
}

.border-b-1 {
  border-bottom: 1px solid var(--border-c);
}
</style>
