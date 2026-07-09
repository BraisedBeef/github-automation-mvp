<template>
  <div class="flow-order">
    <div class="order-title df ac">
      <span class="title">CDN{{ t('resourcePkg') }}</span>
      <span style="color: #ddd">&emsp;|&emsp;</span>
      <span class="text-primary back cursor-pointer" @click="backRoute()">{{ t('backToConfigTitle') }}</span>
      <SvgIcon name="cat-cdn-back" class="ml4" />
    </div>

    <div class="order-tips">
      <el-tag class="mr20">
        {{ t('oderIns') }}
      </el-tag>
      <span>{{ t('sureProductInfoTip1') }}</span>
      <el-text type="danger">
        {{ t('sureProductInfoTip2') }}
      </el-text>
    </div>

    <div class="product-wrap">
      <div class="name df ac mb20">
        <div class="react" />
        <div>{{ t('prodList') }}</div>
      </div>

      <div class="df ac jsb amount-row pd0-20">
        <div class="df ac" style="font-size: 16px">
          <SvgIcon
            class="icon-hover"
            name="cat-cdn-slide"
            :style="{ transform: `rotate(${tableHeight ? 0 : -90}deg)` }"
            @click="showTable"
          />
          <div>{{ t('prepaidProd') }}（{{ tableData[0].count }}）</div>
        </div>
        <div>
          <span>{{ t('showPayable') }}：</span>
          <el-text type="warning">
            <strong>${{ formatPrice(tableData[0].price * tableData[0].count) }} USD</strong>
          </el-text>
        </div>
      </div>

      <el-table
        :data="tableData"
        :style="{ height: tableHeight ? 'auto' : 0 }"
        table-layout="auto"
        :header-cell-style="{ 'background-color': '#fff !important' }"
      >
        <el-table-column prop="productID" :label="t('productName')">
          <template #default="{ row }">
            {{ getValueMap(areaList1, row.accelerationRegion) }} {{ row.accelerationType ? 'ECDN' : 'CDN' }}
            {{ getValueMap(resourcePkgList, row.class) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('config')">
          <template #default="{ row }">
            <el-form class="form-item-config" label-width="auto" label-position="left">
              <el-form-item :label="t('effectiveRegion')">
                {{ getValueMap(areaList1, row.accelerationRegion) }}
              </el-form-item>
              <el-form-item :label="t('moneyUseClass') + '：'">
                {{ getValueMap(resourcePkgType, row.class) }}
              </el-form-item>
              <!-- <el-form-item :label="t('bill.billingModes') + '：'">
                {{ getValueMap(payTypeList, row.chargeMode) }}
              </el-form-item> -->
              <el-form-item :label="t('specifications') + '：'">
                {{ row.class ? getRequest(row.flux) : getFlux(row.flux) }}
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column :label="t('type')">
          {{ t('newBuy') }}
        </el-table-column>
        <el-table-column prop="price" :label="t('unitPrice')">
          <template #default="{ row }"> ${{ formatPrice(row.price) }} USD/{{ t('numUnit') }} </template>
        </el-table-column>
        <el-table-column prop="count" :label="t('quantity')" />
        <el-table-column prop="fluxPeriod" :label="t('timeLong')">
          <template #default="{ row }">
            {{ t('numMonth', { num: row.fluxPeriod }) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('orderPrice')">
          <template #header>
            <span class="mr20">{{ t('orderPrice') }}</span>
          </template>
          <template #default="{ row }">
            <el-text type="warning"> ${{ formatPrice(row.price * row.count) }} USD </el-text>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="payment-wrap df jfe ac page-box">
      <div class="df ac">
        <div class="mr20 df ac">
          <el-tooltip effect="light" placement="top">
            <div class="text-14">
              {{ t('realPay') }}
            </div>
            <template #content>
              <div class="tip-container">
                <div class="df jsb">
                  <div>{{ t('payment.prePay') }}</div>
                  <div class="amount">${{ formatPrice(tableData[0].price * tableData[0].count) }} USD</div>
                </div>
                <!-- <div class="df jsb">
                  <div class="df ac">
                    <div>{{ t('payment.owingMoney') }}</div>
                    <el-tooltip effect="light" placement="top-start">
                      <SvgIcon name="cat-cdn-warning" class="icon ml4" />
                      <template #content>{{ t('payment.owingMoneyTooltip') }}</template>
      </el-tooltip>
    </div>
    <div class="amount">$1000</div>
  </div> -->
                <el-divider />
                <div class="df jsb real-pay">
                  <div class="title">
                    {{ t('payment.actualPrice') }}
                  </div>
                  <el-text type="warning"> ${{ formatPrice(tableData[0].price * tableData[0].count) }} USD </el-text>
                </div>
                <div class="el-text el-text--danger">
                  {{ t('payment.actualPriceTip') }}
                </div>
              </div>
            </template>
          </el-tooltip>
          <el-text type="warning" class="text-24">
            ${{ formatPrice(tableData[0].price * tableData[0].count) }} USD
          </el-text>
        </div>
        <el-button :loading="buyLoading" type="primary" @click="createProductOrder">
          {{ t('toPay') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { _createProductOrder, _createProductOrder2 } from '@/apis/cost-center/payment'
import { useTempStore, useUserStore } from '@/store'
import { getValueMap } from '@/utils/collection-utils'
import { formatPrice } from '@/utils/number-utils'
import { areaList1, resourcePkgType, resourcePkgList, payTypeList } from '@/assets/data/common'
import { getFlux, getRequest } from '@/utils/unit'
import t from '@/utils/i18n'
import { useProductOrder } from '@/views/cost-center/hooks/use-product-order'
import { backRoute } from '@/utils/router-jump'

const store = useTempStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const { createProductOrder: createProductOrderPresets } = useProductOrder()

onBeforeMount(() => {
  store.setSlider(false)
})
onBeforeUnmount(() => {
  store.setSlider(true)
})
onBeforeRouteLeave(() => {
  store.setSlider(true)
})

const tableHeight = ref<number>(1)
const showTable = () => {
  tableHeight.value = +!tableHeight.value
}

const tableData = reactive<any[]>([])
tableData.push(JSON.parse(atob(route.query.product as any)))
// console.log(tableData[0]);

const buyLoading = ref<boolean>(false)

const createProductOrder = async () => {
  try {
    buyLoading.value = true
    const product = tableData[0]

    if (product.id && tableData[0].count) {
      const { data, code, msg } = await _createProductOrder2({
        // uid: userStore.user.id,
        pkgID: product.productID,
        pkgVersion: product.version,
        num: product.count,
      })

      createProductOrderPresets(data.serialNo, 'cdn')
    }
  } catch (error) {
    console.log(error)
  } finally {
    buyLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.flow-order {
  width: calc(100% + 40px);
  height: calc(100% + 40px);
  padding: 40px 60px;
  margin: -20px;
  background-color: #fff;

  .order-tips {
    margin: 40px 0;
  }

  .order-title {
    .title {
      font-size: 24px;
      line-height: 33px;

      // font-weight: 500;
      color: var(--table-text);
    }
  }

  .desc-wrap {
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--table-text);
  }

  .product-wrap {
    .name {
      font-size: 18px;
      font-weight: 700;
      color: var(--primary-text);

      .react {
        width: 2px;
        height: 20px;
        margin-right: 10px;
        background-color: var(--primary-color);
      }
    }

    .amount-row {
      height: 60px;
      color: var(--common-text);
      user-select: none;
      background-color: #f9fafc;
      border: 1px solid #ebeef5;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;

      .icon-hover {
        margin-top: 2px;
        margin-right: 10px;
      }
    }
  }

  .payment-wrap {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 74px;
    padding-right: 60px;
    background-color: #fff;
    box-shadow: 0 -2px 4px 0 rgb(0 0 0 / 8%);

    .text-24 {
      font-size: 24px;
    }

    .text-14 {
      margin-right: 30px;
      font-size: 14px;
      text-decoration: underline;
      cursor: default;
    }
  }

  .form-item-config {
    padding: 20px 0;

    :deep(.el-form-item__label-wrap, .el-form-item__label),
    :deep(.el-form-item__label) {
      height: 24px !important;
      line-height: 1.5 !important;
    }

    :deep(.el-form-item__content) {
      height: 24px !important;
      line-height: 1.5 !important;
      color: var(--common-text);
    }
  }

  :deep(.el-table) {
    border-right: 1px solid #ebeef5;
    border-left: 1px solid #ebeef5;
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;

    tbody {
      .cell {
        color: var(--common-text);
      }
    }
  }
}

.tip-container {
  width: max-content;
  padding: 10px;

  .icon {
    color: #999;
  }

  .amount {
    font-weight: 700;
    color: var(--primary-text);
  }

  .real-pay {
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 700;

    .title {
      color: var(--primary-text);
    }

    .el-text {
      font-size: 16px;
    }
  }

  .el-text--danger {
    text-align: right;
  }
}
</style>
