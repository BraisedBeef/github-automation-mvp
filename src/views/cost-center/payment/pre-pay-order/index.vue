<template>
  <div class="wrap">
    <!-- title -->
    <div class="title-wrap df">
      <span class="title mr20">{{ detail.productName }}</span>
      <!-- if 从官网跳转进入 - 隐藏返回入口 -->
      <p v-if="!(route.query?.form === 'activity')" class="df ac">
        <span class="text-primary back cursor-pointer" @click="backRoute()">{{ t('backToConfigTitle') }}</span>
        <SvgIcon name="cat-cdn-back" class="ml4" />
      </p>
    </div>
    <!-- desc -->
    <el-row class="desc-wrap" align="middle">
      <el-tag class="mr10">
        {{ t('oderIns') }}
      </el-tag>
      <span>{{ t('sureProductInfoTip1') }}</span>
      <el-text type="danger">
        {{ t('sureProductInfoTip2') }}
      </el-text>
    </el-row>

    <!-- 订单列表 -->
    <div class="product-wrap">
      <div class="name df ac mb20">
        <div class="react" />
        <span>{{ t('prodList') }}</span>
      </div>

      <div class="df ac jsb amount-row pd0-20">
        <span class="lt"
          ><SvgIcon
            class="icon-hover"
            name="cat-cdn-slide"
            :style="{ transform: `rotate(${tableHeight ? 0 : -90}deg)` }"
            @click="showTable"
          />{{ t('payment.prepaidProducts', [orderList.length || 0]) }}</span
        >
        <p class="rt">
          <span>{{ t('payment.paySum') }}</span
          ><span class="text-warning ml20 font-bold">${{ detail.amount }} USD</span>
        </p>
      </div>
      <el-table
        ref="tableRef"
        v-loading="listLoading"
        :data="orderList"
        :highlight-current-row="false"
        :style="{ height: tableHeight ? 'auto' : 0 }"
        table-layout="auto"
      >
        <!-- 产品名称 -->
        <el-table-column prop="productDesc" :label="t('payment.productName')">
          <template #default="{ row }">
            <span class="table-text">{{ t(row.subProductTypeName) }}</span>
          </template>
        </el-table-column>
        <!-- 配置 -->
        <el-table-column :label="t('payment.configurate')">
          <template #default="{ row }">
            <div class="configurate-wrap">
              <table class="table_box">
                <tbody>
                  <template v-for="(item, index) in row.configs" :key="index">
                    <tr v-if="item.value">
                      <td class="key pr20">
                        {{ t(item.key) }}
                      </td>
                      <td class="value">
                        {{ item.value }}
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column :label="t('type')">
          <template #default="{ row }">
            <span class="table-text">{{ ORDER_TYPE_MAP[row.publicInfo.type] }}</span>
          </template>
        </el-table-column>
        <!-- 单价 -->
        <el-table-column prop="price" :label="t('payment.price')">
          <template #default="{ row }">
            <span class="table-text">${{ row.price }} USD</span>
          </template>
        </el-table-column>
        <!-- 数量 -->
        <el-table-column prop="num" :label="t('payment.num')">
          <template #default="{ row }">
            <span class="table-text">{{ row.num }}</span>
          </template>
        </el-table-column>
        <!-- 时长 -->
        <el-table-column :label="t('payment.duration')">
          <template #default="{ row }">
            <span class="table-text">{{ `${row.duration}${row.durationUnit}` }}</span>
          </template>
        </el-table-column>
        <!-- 订单金额 -->
        <el-table-column align="right">
          <template #header>
            <span class="mr20">{{ t('payment.amount') }}</span>
          </template>
          <template #default="{ row }">
            <span class="text-warning mr20">${{ row.amount }} USD</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="payment-wrap df jfe ac page-box">
      <div class="df ac">
        <div class="mr20 df ac">
          <el-tooltip effect="light" placement="top">
            <div class="text-14 underline">
              {{ t('realPay') }}
            </div>
            <template #content>
              <div class="tip-container">
                <div class="df jsb mt10">
                  <div>{{ t('payment.prePay') }}</div>
                  <div class="amount">${{ detail.amount }} USD</div>
                </div>
                <el-divider />
                <div class="df jsb real-pay">
                  <div class="title">
                    {{ t('payment.actualPrice') }}
                  </div>
                  <el-text type="warning"> ${{ detail.amount }} USD </el-text>
                </div>
                <div class="el-text el-text--danger">
                  {{ t('payment.actualPriceTip') }}
                </div>
              </div>
            </template>
          </el-tooltip>
          <el-text type="warning" class="text-24"> ${{ detail.amount }} USD </el-text>
        </div>
        <el-button :loading="loading" type="primary" @click="pay">
          {{ t('toPay') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
// import { formatPrice } from '@/utils/shared-utils'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import { ORDER_TYPE_MAP } from '@/views/cost-center/order/config'
import { useProductOrder, BusinessType } from '@/views/cost-center/hooks/use-product-order'
import { backRoute } from '@/utils/router-jump'

/**
 * @desc 升配=>预付款
 */

const route = useRoute()
const router = useRouter()
const { queryPreProductOrder, loading: listLoading } = usePreProductOrder()
const { createProductOrder, loading } = useProductOrder()

const serialNo = ref<string>('') // 预付款单号
const type = ref<BusinessType>() // 预付款产品类型
const tableHeight = ref<number>(1)
const detail = ref<any>({})

// 订单列表
const orderList = computed(() => {
  console.log(`detail.orderList===>`, detail.value.subPreOrderDetailDTOS)

  const list: any[] = []

  for (const order of detail.value.subPreOrderDetailDTOS || []) {
    const publicInfo = {
      type: detail.value.type,
    }
    list.push({ ...order, publicInfo })
  }

  return list
})

const showTable = () => {
  tableHeight.value = +!tableHeight.value
}

const pay = () => {
  if (type.value) {
    createProductOrder(serialNo.value, type.value)
  }
}

// 预订单详情
const queryPreProductOrderFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      detail.value = res.data || {}
    }
  }
  serialNo.value && queryPreProductOrder(serialNo.value, cb)
}

onMounted(() => {
  if (route.params?.serialNo) {
    serialNo.value = route.params?.serialNo as string
    queryPreProductOrderFn()
  }
  if (route.query?.type) {
    type.value = route.query?.type as BusinessType
  }
})

watch(
  () => route.params.serialNo,
  () => {
    queryPreProductOrderFn()
  },
)
</script>

<style lang="scss" scoped>
@use '@/views/cost-center/payment/style/pre-order';
</style>
