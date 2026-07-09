<template>
  <el-card shadow="never" class="wrap page-box">
    <!-- top -->
    <div class="top-wrap df jsb ac">
      <!-- 待支付 -->
      <template v-if="detail.state === 1">
        <div class="left df ac" style="flex-wrap: wrap">
          <div class="icon-wrap df ac">
            <el-image class="bank-img mr20" :src="orderDetailWaitPay" />
            <span class="icon-text">{{ t('order.waitPay') }}</span>
          </div>
          <p class="mr20 fs-14">
            <span>{{ t('order.orderActualPay') }}</span
            ><span class="price-text">${{ detail.amount }} USD</span>
          </p>
          <p class="fs-14">
            <span v-html="t('order.waitPayDesc', [maoYunDayJs(detail.expireTime).format(FORMAT_TIME)])" />
          </p>
        </div>
        <div class="right df" style="flex-shrink: 0; flex-wrap: wrap">
          <el-button
            class="pay-btn"
            color="#fa8d15"
            @click="
              pushRoute({
                name: 'payment_product_order',
                params: {
                  tradeNo: tradeNo,
                },
                query: { type: 'order' },
              })
            "
          >
            {{ t('order.goPay') }}
          </el-button>
          <el-button @click="openCancelDialog">
            {{ t('order.cancelOrder') }}
          </el-button>
        </div>
      </template>
      <!-- 交易成功 -->
      <template v-if="detail.state === 2">
        <div class="left df ac">
          <div class="icon-wrap df ac">
            <el-image class="bank-img mr20" :src="orderDetailSuccess" />
            <span class="icon-text">{{ t('order.tradeSuccess') }}</span>
          </div>
          <p class="mr20 fs-14">
            <span>{{ t('order.orderActualPay') }}</span
            ><span class="price-text">${{ detail.amount }} USD</span>
          </p>
        </div>
      </template>
      <!-- 已取消 -->
      <template v-if="detail.state === 3">
        <div class="left df ac">
          <div class="icon-wrap df ac">
            <el-image class="bank-img mr20" :src="orderDetailCancel" />
            <span class="icon-text">{{ t('order.cancel') }}</span>
          </div>
          <p class="mr20 fs-14">
            <span>{{ t('order.orderActualPay') }}</span
            ><span class="price-text">${{ detail.amount }} USD</span>
          </p>
          <p class="fs-14">
            <span class="mr4">{{ maoYunDayJs(detail.cancelTime).format(FORMAT_TIME) }}</span>
            <span>{{ t('order.orderCancel') }}</span>
          </p>
        </div>
      </template>
      <!-- 已过期 -->
      <template v-if="detail.state === 4">
        <div class="left df ac">
          <div class="icon-wrap df ac">
            <el-image class="bank-img mr20" :src="orderDetaileExpired" />
            <span class="icon-text">{{ t('order.expired') }}</span>
          </div>
          <p class="mr20 fs-14">
            <span>{{ t('order.orderActualPay') }}</span
            ><span class="price-text">${{ detail.amount }} USD</span>
          </p>
          <p class="fs-14">
            <span v-html="t('order.payExpiredDesc', [maoYunDayJs(detail.expireTime).format(FORMAT_TIME)])" />
          </p>
        </div>
      </template>
      <!-- 已失效 -->
      <template v-if="detail.state === 5">
        <div class="left df ac">
          <div class="icon-wrap df ac">
            <el-image class="bank-img mr20" :src="orderDetailInvalid" />
            <span class="icon-text">{{ t('order.invalid') }}</span>
          </div>
          <p class="mr20 fs-14">
            <span>{{ t('order.orderActualPay') }}</span
            ><span class="price-text">${{ detail.amount }} USD</span>
          </p>
          <p class="fs-14">
            <span>{{ t('order.ordeInvalid') }}</span>
          </p>
        </div>
      </template>
      <!-- 已退款 -->
      <template v-if="detail.state === 7">
        <div class="left df ac">
          <div class="icon-wrap df ac">
            <el-image class="bank-img mr20" :src="orderDetailRefund" />
            <span class="icon-text">{{ t('order.refunded') }}</span>
          </div>
          <p class="mr20 fs-14">
            <span>{{ t('order.refundPrice') }}</span
            ><span class="price-text">${{ detail.amount }} USD</span>
          </p>
          <p class="fs-14">
            <i18n-t keypath="order.refundDesc">
              <span class="text-primary ml4 mr4 pointer" @click="pushRoute({ name: 'income_expenditure' })">{{
                t('incomeExpenditure.incomeExpenditure')
              }}</span>
            </i18n-t>
          </p>
        </div>
      </template>
      <!-- 处理失败 -->
      <template v-if="detail.state === 9">
        <div class="left df ac">
          <div class="icon-wrap df ac">
            <el-image class="bank-img mr20" :src="orderDetailProcessingFailed" />
            <span class="icon-text">{{ t('order.processingFailed') }}</span>
          </div>
          <p class="mr20 fs-14">
            <span>{{ t('order.orderActualPay') }}</span
            ><span class="price-text">${{ detail.amount }} USD</span>
          </p>
          <p class="fs-14">
            <i18n-t keypath="order.processingFailedDesc">
              <span class="text-primary ml4 mr4 pointer" @click="pushRoute({ name: 'income_expenditure' })">{{
                t('incomeExpenditure.incomeExpenditure')
              }}</span>
            </i18n-t>
          </p>
        </div>
      </template>
    </div>

    <el-divider style="margin: 0" />
    <!-- center -->
    <el-row class="center-wrap">
      <el-col :span="12">
        <!-- 订单号 -->
        <div class="item mb20 df">
          <div class="key-wrap">
            <span>{{ t('order.tradeNo') }}</span>
          </div>
          <div class="value">
            {{ detail.tradeNo }}
          </div>
        </div>
        <!-- 订单创建人 -->
        <div class="item mb20 df">
          <div class="key-wrap">
            <span>{{ t('order.createUid') }}</span>
          </div>
          <div class="value">
            {{ detail.createUid }}
          </div>
        </div>
        <!-- 订单付款人 交易成功状态下显示-->
        <div v-if="detail.state === 2" class="item df">
          <div class="key-wrap">
            <span>{{ t('order.payUid') }}</span>
          </div>
          <div class="value">
            {{ detail.payUid }}
          </div>
        </div>
        <!-- 退款时间 已退款状态下显示 -->
        <div v-if="detail.state === 7" class="item df">
          <div class="key-wrap">
            <span>{{ t('order.refundTime') }}</span>
          </div>
          <div class="value">
            {{ maoYunDayJs(detail.payTime).format(FORMAT_TIME) }}
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <!-- 订单类型 -->
        <div class="item mb20 df">
          <div class="key-wrap">
            <span>{{ t('order.orderType') }}</span>
          </div>
          <div class="value">
            {{ ORDER_TYPE_MAP[detail.type] }}
          </div>
        </div>
        <!-- 创建时间 -->
        <div class="item mb20 df">
          <div class="key-wrap">
            <span>{{ t('order.createTimes') }}</span>
          </div>
          <div class="value">
            {{ maoYunDayJs(detail.createTime).format(FORMAT_TIME) }}
          </div>
        </div>
        <!-- 付款时间 交易成功状态下显示 -->
        <div v-if="detail.state === 2" class="item df">
          <div class="key-wrap">
            <span>{{ t('order.payTime') }}</span>
          </div>
          <div class="value">
            {{ maoYunDayJs(detail.payTime).format(FORMAT_TIME) }}
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- bottom -->
    <div class="bottom-wrap">
      <p class="title mb20">
        {{ t('order.oderInfo') }}
      </p>
      <!-- 待支付/交易成功/已取消/已过期/已失效/ 已退款/处理失败 -->
      <template v-if="[1, 2, 3, 4, 5, 9].includes(detail.state)">
        <el-table v-loading="loading.list" :data="detail.subOrderList || []" :highlight-current-row="false">
          <el-table-column min-width="300" prop="subTradeNo" :label="t('order.subTradeNo')" />
          <el-table-column min-width="200" prop="productSymbol" :label="t('order.productName')" />
          <!-- 计费类型 -->
          <el-table-column min-width="200" :label="t('order.costType')" show-overflow-tooltip>
            <template #default="{ row }">
              <span>
                {{ COST_TYPE_MAP[row.costType] }}
              </span>
            </template>
          </el-table-column>
          <!-- 规格 -->
          <el-table-column min-width="500" :label="t('order.standard')">
            <template #default="{ row }">
              <div class="mt20 mb20 config-wrap">
                <table class="table_box">
                  <tbody>
                    <template v-for="(item, index) in row.configs" :key="index">
                      <tr v-if="item.value" :key="index">
                        <td class="key pr20">
                          {{ item.key }}
                        </td>
                        <td class="value">
                          {{ item.value }}
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
                <!-- <template v-for="(item, index) in row.configs" :key="index">
                  <p v-if="item.value" :key="index" class="df">
                    <span class="key" :class="labelWidthClass">{{ item.key }}</span
                    ><span class="value">{{ item.value }}</span>
                  </p>
                </template> -->
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="200" prop="price" :label="t('order.price')">
            <template #default="{ row }">
              <span>{{ `$${row.price} USD` }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="200" prop="num" :label="t('order.num')" />
          <el-table-column min-width="200" :label="t('order.duration')">
            <template #default="{ row }">
              <span>{{ `${row.duration}${row.durationUnit}` }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="240" align="right">
            <template #header>
              <span class="mr20">{{ t('order.amountNum') }}</span>
            </template>
            <template #default="{ row }">
              <p class="price-text mr20">
                {{ `$${row.amount} USD` }}
              </p>
              <!-- <p class="line-through sub-text mr20">9,000.00</p> -->
            </template>
          </el-table-column>
        </el-table>
        <div class="df jfe">
          <p class="pay-info mt20">
            <span>{{ t('order.orderActualPay') }} </span>
            <!-- <span class="line-through mr4 sub-text">$377.50</span> -->
            <span class="price-text" style="font-size: 16px">${{ detail.amount }} USD</span>
          </p>
        </div>
      </template>
      <!-- 退款 -->
      <template v-if="detail.state === 7">
        <el-table
          v-loading="loading.list"
          show-overflow-tooltip
          :data="detail.subOrderList || []"
          :highlight-current-row="false"
        >
          <el-table-column min-width="300" prop="subTradeNo" :label="t('order.subTradeNo')" />
          <el-table-column min-width="200" prop="productSymbol" :label="t('order.productName')" />
          <!-- 计费类型 -->
          <el-table-column min-width="200" :label="t('order.costType')">
            <template #default="{ row }">
              <span>
                {{ COST_TYPE_MAP[row.costType] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column min-width="300" :label="t('order.standard')">
            <template #default="{ row }">
              <div class="mt20 mb20 config-wrap">
                <table class="table_box">
                  <tbody>
                    <tr v-for="(item, index) in row.configs" :key="index">
                      <td class="key pr20">
                        {{ item.key }}
                      </td>
                      <td class="value">
                        {{ item.value }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="200" prop="num" :label="t('order.refundForm')">
            <template #default="{ row }">
              <span>{{ t('order.refundFormDesc', [row.refundUid]) }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="200" :label="t('order.refundOrder')">
            <template #default="{ row }">
              <template v-if="row.newBuyList?.length">
                <span>{{ t('order.newBuy') }}</span>
                <span>{{ row.newBuyList.join(',') }}</span>
              </template>
              <template v-if="row.adjustList?.length">
                <span>{{ t('order.adjust') }}</span>
                <span>{{ row.adjustList.join(',') }}</span>
              </template>
              <template v-if="row.renewList?.length">
                <span>{{ t('order.renew') }}</span>
                <span>{{ row.renewList.join(',') }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column min-width="240" align="right">
            <template #header>
              <span class="mr20">{{ t('order.refundPriceUnit') }}</span>
            </template>
            <template #default="{ row }">
              <p class="price-text mr20">
                {{ row.amount }}
              </p>
            </template>
          </el-table-column>
        </el-table>
        <div class="df jfe">
          <p class="pay-info mt20">
            <span>{{ t('order.refundSum') }} </span>
            <span class="price-text" style="font-size: 16px">${{ detail.amount }} USD</span>
          </p>
        </div>
      </template>
    </div>

    <!-- 确认取消 -->
    <CatDialog
      v-model:dialog="showCancel"
      :title="t('capital.hint')"
      width="480px"
      destroy-on-close
      :loading="loading.cancel"
      @confirm="cancelOrder"
      @cancel="() => {}"
    >
      <p class="dialog-text">
        {{ t('order.cancelOrderDesc') }}
      </p>
    </CatDialog>
  </el-card>
</template>

<script setup lang="ts">
import { _queryProductOrder } from '@/apis/cost-center/payment'
import { _cancelOrder } from '@/apis/cost-center/order'
import { message } from '@/utils/message'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import orderDetailWaitPay from '@/assets/images/cost-center/order/order-detail-wait-pay.png'
import orderDetailSuccess from '@/assets/images/cost-center/order/order-detail-success.png'
import orderDetaileExpired from '@/assets/images/cost-center/order/order-detail-expired.png'
import orderDetailCancel from '@/assets/images/cost-center/order/order-detail-cancel.png'
import orderDetailInvalid from '@/assets/images/cost-center/order/order-detail-invalid.png'
import orderDetailRefund from '@/assets/images/cost-center/order/order-detail-refund.png'
import orderDetailProcessingFailed from '@/assets/images/cost-center/order/order-detail-processing-failed.png'
import t from '@/utils/i18n'

import { ORDER_TYPE_MAP, isSeeDetail } from '@/views/cost-center/order/config'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { useUserStore } from '@/store'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w160px',
  [en]: 'key-wrap-w160px',
  [zh]: 'key-wrap-w110px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const userStore = useUserStore()
const route = useRoute()

const loading = reactive<{
  list: boolean
  cancel: boolean
}>({
  list: false,
  cancel: false,
})
const tradeNo = ref<string>(route.params.tradeNo as string) // 订单号
const detail = ref<any>({
  state: 4,
}) // 订单详情
const showCancel = ref<boolean>(false)

// 显示取消弹窗
const openCancelDialog = () => {
  showCancel.value = true
}

// 查询产品订单详情
const queryProductOrder = async () => {
  try {
    loading.list = true
    const res = await _queryProductOrder({
      tradeNoList: [tradeNo.value],
    })

    console.log(`_queryProductOrder===>`, res)

    if (res.success) {
      if (res.data?.orderList.length) {
        detail.value = res.data?.orderList[0]

        // 状态存在更新，需判断
        if (!isSeeDetail(detail.value.state)) {
          message.warning(t('order.orderUpdate'))
          pushRoute({ name: 'order' })
        }
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.list = false
  }
}

// 取消订单
const cancelOrder = async () => {
  try {
    loading.cancel = true
    const res = await _cancelOrder({
      tradeNo: tradeNo.value,
    })

    console.log(`_cancelOrder===>`, res)

    if (res.success) {
      userStore.getUser()
      queryProductOrder()
      showCancel.value = false
      message.success(t('order.cancelSuccess'))
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.cancel = false
  }
}

// 路由
watch(
  () => route.params.tradeNo,
  () => {
    tradeNo.value = route.params.tradeNo as string
    queryProductOrder()
  },
)

onMounted(() => {
  console.log(route.params.tradeNo)

  queryProductOrder()
})
</script>

<style lang="scss" scoped>
.wrap {
  .top-wrap {
    height: 98px;

    .left {
      .icon-wrap {
        margin-right: 50px;

        .icon-text {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 18px;
          line-height: 25px;

          // font-weight: 500;
          color: var(--table-text);
        }
      }
    }

    .right {
      .pay-btn {
        color: #fff;

        &:hover {
          background-color: #fa8d15;
          border-color: #fa8d15;
        }
      }
    }
  }

  .center-wrap {
    margin-top: 40px;
    margin-bottom: 40px;

    .item {
      .key-wrap {
        width: 125px;

        .key {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: var(--common-text);
        }
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--primary-text);
      }
    }
  }

  .bottom-wrap {
    .title {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      line-height: 22px;

      // font-weight: 500;
      color: var(--table-text);
    }

    .pay-info {
      font-size: 14px;

      .key {
        font-family: PingFangSC, 'PingFang SC';
        font-weight: 400;
        line-height: 20px;
        color: var(--primary-text);
      }

      .sub-text {
        font-family: PingFangSC, 'PingFang SC';
        font-weight: 400;
        line-height: 20px;
        color: var(--sub-text);
      }
    }

    .config-wrap {
      .key-wrap-w160px {
        width: 160px;
      }

      .key-wrap-w110px {
        width: 110px;
      }

      .key {
        margin-right: 10px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--common-text);

        // word-wrap: break-word; /* 自动换行 */
        // white-space: normal; /* 默认换行 */
      }

      .value {
        flex: 1;
        overflow-wrap: break-word; /* 自动换行 */
        white-space: normal; /* 默认换行 */
      }
    }
  }

  .dialog-text {
    width: 428px;
    height: 21px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--primary-text);
  }
}

.fs-14 {
  font-size: 14px;
}

.price-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--warning-color);
}

.sub-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--sub-text);
}

.line-through {
  text-decoration: line-through;
}

.pr20 {
  padding-right: 20px;
}

.table_box {
  tr {
    background-color: rgb(255 255 255 / 0%);
  }
}
</style>
