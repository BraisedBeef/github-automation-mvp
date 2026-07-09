<template>
  <div class="buy-flow">
    <div class="title-1 mb20">CDN{{ t('resourcePkg') }}</div>

    <div class="page-box">
      <div class="title-2 mb20">
        {{ t('buyNote') }}
      </div>
      <div class="rules">
        <div class="use-tip">
          <el-tag class="mr14">
            {{ t('instructions') }}
          </el-tag>
          <div class="tip-right">
            {{ t('instructionsDetails') }}
          </div>
        </div>
        <div class="use-tip mt10">
          <el-tag class="mr14">
            {{ t('billingOption') }}
          </el-tag>
          <div class="tip-right">
            {{ t('billingOptionDetails') }}
          </div>
        </div>
        <div class="use-tip mt10">
          <el-tag class="mr14">
            {{ t('refundRules') }}
          </el-tag>
          <div class="tip-right">
            {{ t('refundRulesDetails') }}
          </div>
        </div>
      </div>

      <div class="title-2 mb20">
        {{ t('selectRsourcePkg') }}
      </div>
      <el-form :model="form" label-position="left" label-width="auto" class="mt10">
        <el-form-item :label="t('accelerationType')">
          <CatBlockSelect v-model="form.accelerationType" :list="accelerationTypeList" @change="changeFormItem(0)" />
        </el-form-item>
        <el-form-item :label="t('useInstructions')">
          <div v-show="!form.class" class="df resource-container">
            <div class="resource df ac">
              <SvgIcon name="cat-cdn-warning" class="mr4" style="color: var(--warning-color)" />
              <div>{{ t('useToKnow5') }}</div>
            </div>
            <div class="resource df ac">
              <SvgIcon name="cat-cdn-warning" class="mr4" style="color: var(--warning-color)" />
              <div>{{ t('useToKnow6') }}</div>
            </div>
            <div class="resource df ac">
              <SvgIcon name="cat-cdn-warning" class="mr4" style="color: var(--warning-color)" />
              <div>{{ t('useToKnow7') }}</div>
            </div>
          </div>
          <div v-show="form.class" class="df resource-container">
            <div class="resource df ac">
              <SvgIcon name="cat-cdn-success" class="mr4" style="color: var(--success-color)" />
              <div>{{ t('useToKnow1') }}</div>
            </div>
            <div class="resource df ac">
              <SvgIcon name="cat-cdn-warning" class="mr4" style="color: var(--warning-color)" />
              <div>{{ t('useToKnow2') }}</div>
            </div>
            <div class="resource df ac">
              <SvgIcon name="cat-cdn-warning" class="mr4" style="color: var(--warning-color)" />
              <div>{{ t('useToKnow3') }}</div>
            </div>
            <div class="resource df ac">
              <SvgIcon name="cat-cdn-warning" class="mr4" style="color: var(--warning-color)" />
              <div>{{ t('useToKnow4') }}</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item :label="t('resourcePkgType')">
          <CatBlockSelect v-model="form.class" :list="resourcePkgTypeCom" @change="changeFormItem(1)" />
        </el-form-item>
        <el-form-item :label="t('effectiveRegion')">
          <div>
            <CatBlockSelect
              v-model="form.accelerationRegion"
              :list="accelerationRegionList"
              @change="changeFormItem(2)"
            />
            <el-text type="info" class="df mt10">
              {{ form.accelerationRegion ? t('effectiveRegionTip1') : t('effectiveRegionTip') }}
            </el-text>
          </div>
        </el-form-item>
        <el-form-item v-show="false" :label="t('resourcePkgType')">
          <CatBlockSelect v-model="form.fluxType" :list="fluxTypeList" @change="changeFormItem(3)" />
        </el-form-item>
        <el-form-item :label="t('resourcePkgSpeci')">
          <div>
            <CatBlockSelect v-model="form.id" :list="fluxList" @change="changeFormItem(4)" />
            <el-text type="info" class="df mt10">
              {{
                form.class
                  ? t('resourcePkgRequestTip')
                  : t('resourcePkgSpeciTip', { type: form.accelerationType ? 'ECDN' : 'CDN' })
              }}
            </el-text>
          </div>
        </el-form-item>
        <el-form-item :label="t('validityPeriod')">
          <div>
            <CatBlockSelect v-model="form.fluxPeriod" :list="fluxPeriodList" @change="changeFormItem(5)" />
            <el-text type="info" class="df mt10">
              {{ t('validDateTip', { num: form.fluxPeriod }) }}
            </el-text>
          </div>
        </el-form-item>
        <el-form-item :label="t('buyNums')">
          <el-input-number
            v-model="form.count"
            :min="1"
            :step="1"
            step-strictly
            style="width: 200px"
            @change="changeFormItem(5)"
            @blur="inputNumber"
            @mouseout="
              $event => {
                $event.target.blur()
              }
            "
            @input="
              $nextTick(() => {
                getProductPrice()
              })
            "
          />
        </el-form-item>
        <el-form-item :label="t('currentMoney')" class="flow-money">
          <div>
            <div class="flow-money-top df ac">
              <div class="money df">
                <div v-loading="priceLoading" class="mr4">${{ price }}</div>
                <div class="unit mr20">USD</div>
              </div>
              <div class="old ml4">{{ t('originalPrice') }} ${{ oldPrice }} USD</div>
            </div>
            <el-button
              :disabled="priceLoading || !form.price"
              :loading="buyLoading"
              type="primary"
              class="mt20"
              @click="go"
            >
              {{ t('nowBuyIt') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore, useTempStore } from '@/store'
import { _getAllProducts, _getProductPrice } from '@/apis/cdn/product'
import { _createProductOrder, _createProductOrder2 } from '@/apis/cost-center/payment'
import { resourcePkgType } from '@/assets/data/common.js'
import { getFlux, getRequest, getDiscount, getRequestDetail } from '@/utils/unit'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
import t from '@/utils/i18n'
import { ElMessage } from 'element-plus'

const store = useTempStore()
const route = useRoute()

onBeforeMount(() => {
  store.setSlider(false)
})
onBeforeUnmount(() => {
  store.setSlider(true)
})
onBeforeRouteLeave(() => {
  store.setSlider(true)
})

interface Product {
  class: number
  id: number
  accelerationRegion: number
  accelerationType: number
  fluxType: number
  flux: number
  fluxPeriod: number
  count?: number
  price: number
}
const allProducts = ref<Product[]>([])
const accelerationRegionList = computed(() => {
  const list1 = allProducts.value
    .filter(v => v.class === form.value.class)
    .map(v => v.accelerationRegion)
    .sort((a, b) => a - b)
  const list2 = [...new Set(list1)].map(v => ({
    label: v ? t('outChina') : t('inChina'),
    value: v,
  }))
  return list2
})
const accelerationTypeList = computed(() => {
  const list1 = allProducts.value
    .filter(v => v.accelerationRegion === form.value.accelerationRegion)
    .map(v => v.accelerationType)
    .sort((a, b) => a - b)
  const list2 = [...new Set(list1)].map(v => ({
    label: v ? t('wholeAcceleration') : t('staticAcceleration'),
    value: v,
  }))
  return list2
})
const fluxTypeList = computed(() => {
  const list1 = allProducts.value
    .filter(
      v =>
        v.class === form.value.class &&
        v.accelerationRegion === form.value.accelerationRegion &&
        v.accelerationType === form.value.accelerationType,
    )
    .map(v => v.fluxType)
    .sort((a, b) => a - b)
  const list2 = [...new Set(list1)].map(v => ({
    label: v ? t('idleTimeFlux') : t('fullTimeFlux'),
    value: v,
  }))
  return list2
})
const fluxList = computed(() => {
  const list1 = allProducts.value
    .filter(
      v =>
        v.class === form.value.class &&
        v.accelerationRegion === form.value.accelerationRegion &&
        v.accelerationType === form.value.accelerationType &&
        v.fluxType === form.value.fluxType,
    )
    .sort((a, b) => a.flux - b.flux)
  const list2 = [...new Set(list1)].map((v: any) => {
    return {
      label: form.value.class ? getRequest(v.flux) : getFlux(v.flux),
      value: v.id,
      discount: getDiscount(v.price, v.originalPrice),
    }
  })
  return list2
})
const fluxPeriodList = computed(() => {
  const list1 = allProducts.value
    .filter(
      v =>
        v.class === form.value.class &&
        v.accelerationRegion === form.value.accelerationRegion &&
        v.accelerationType === form.value.accelerationType &&
        v.fluxType === form.value.fluxType &&
        v.id === form.value.id,
    )
    .map(v => v.fluxPeriod)
    .sort((a, b) => a - b)

  const list2 = [...new Set(list1)].map(v => ({
    label: t('numMonth', { num: v }),
    value: v,
  }))
  return list2
})
const resourcePkgTypeCom = computed(() =>
  resourcePkgType.filter(v => (form.value.accelerationType === 0 ? v.value === 0 : true)),
)

const getAllProducts = async () => {
  await _getAllProducts().then(res => {
    allProducts.value = res.data.list.sort((a, b) => a.flux - b.flux) || []
    if (route.query.id) {
      allProducts.value.find(v => {
        if (v.id === +route.query.id!) {
          for (let key in form.value) {
            form.value[key] = v[key]
          }
        }
      })
    } else {
      const currentPkg = allProducts.value.find(
        v => v.class === 0 && v.accelerationRegion === 0 && v.accelerationType === 0,
      )!
      for (let key in form.value) {
        form.value[key] = currentPkg[key]
      }
    }

    // 重置count
    form.value.count = Number(route.query.count || 1)
  })
  getProductPrice()
}
getAllProducts()

const getProduct = () => {
  return allProducts.value.find(
    v =>
      v.class === form.value.class &&
      v.accelerationRegion === form.value.accelerationRegion &&
      v.accelerationType === form.value.accelerationType &&
      v.fluxType === form.value.fluxType &&
      v.id === form.value.id &&
      v.fluxPeriod === form.value.fluxPeriod,
  )
}

const getProductPrice = () => {
  const product: any = getProduct()
  const params = {
    pkgId: product.id,
    pkgVersion: product.version,
    num: form.value.count || 1,
  }
  priceLoading.value = true
  _getProductPrice(params)
    .then(res => {
      oldPrice.value = +res.data.originalTotalAmount.toFixed(4)
      price.value = +res.data.totalAmount.toFixed(4)
    })
    .finally(() => {
      priceLoading.value = false
    })
}

const form = ref<Product>({
  id: 0,
  class: 0,
  accelerationRegion: 0,
  accelerationType: 0,
  fluxType: 0,
  flux: 0,
  fluxPeriod: 0,
  count: Number(route.query.count || 1),
  price: 0,
})
const oldPrice = ref<number>(0)
const price = ref<number>(0)
const priceLoading = ref<boolean>(false)

const inputNumber = () => {
  if (!form.value.count) {
    form.value.count = 1
  }
}
const changeFormItem = (type: number) => {
  if (type < 1) {
    form.value.class = resourcePkgTypeCom.value[0].value
  }
  if (type < 2) {
    form.value.accelerationRegion = accelerationRegionList.value[0].value
  }
  if (type < 3) {
    form.value.fluxType = fluxTypeList.value[0].value
  }
  if (type < 4) {
    form.value.id = fluxList.value[0].value
  }
  if (type < 5) {
    form.value.fluxPeriod = fluxPeriodList.value[0].value
  }
  getProductPrice()
}

// 跳转预订单页面
const { toPrePayOrder } = usePreProductOrder()
const buyLoading = ref<boolean>(false)
const go = async () => {
  const product: any = { ...getProduct(), count: form.value.count || 1 }
  if (!product.id) return
  try {
    buyLoading.value = true
    const { data, code, msg } = await _createProductOrder2({
      // uid: userStore.user.id,
      pkgID: product.productID,
      pkgVersion: product.version,
      num: product.count,
    })
    if (code === 200) {
      toPrePayOrder(data.serialNo, 'cdn')
    } else {
      ElMessage.error(t('common.error_cd'))
    }
  } catch (error) {
    ElMessage.error(t('common.error_cd'))
  } finally {
    buyLoading.value = false
  }
}

onMounted(() => {
  // useBaseStore().selectedKeys = 'cdn_buyFlow'
})
</script>

<style lang="scss" scoped>
.buy-flow {
  .title-1 {
    padding: 0 140px;
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-text);

    .left {
      padding-right: 26px;
      margin-right: 20px;
      border-right: 1px solid var(--tip-text);
    }

    .right {
      font-size: 20px;
    }
  }

  .page-box {
    width: calc(100% + 40px);
    padding: 20px 160px 120px;
    margin-bottom: -20px;
    margin-left: -20px;

    .title-2 {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-text);
    }

    .rules {
      margin-bottom: 40px;
      user-select: none;
      border-radius: 4px;

      .use-tip {
        display: flex;

        .el-tag {
          border: none;
        }

        .tip-right {
          line-height: 24px;
        }
      }
    }

    .el-form {
      .resource-container {
        flex-wrap: wrap;
      }

      .resource {
        margin-right: 20px;
        color: var(--common-text);
      }

      :deep(.el-form-item__label) {
        color: var(--common-text);
      }

      .flow-money {
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 10;
        align-items: flex-start;
        width: 100%;
        height: 120px;
        padding: 20px 160px 0;
        margin-bottom: 0;
        background-color: #fff;
        box-shadow: 0 -2px 4px 0 rgb(0 0 0 / 8%);

        .flow-money-top {
          align-items: flex-end;

          * {
            line-height: 1;
          }
        }

        .money {
          align-items: flex-end;
          font-size: 24px;
          color: #ff6700;
        }

        .unit {
          font-size: 14px;
        }

        .old {
          color: var(--sub-text);
          text-decoration: line-through;
        }
      }
    }
  }
}
</style>
