<template>
  <div class="df">
    <!-- 公网流量费用 -->
    <div v-if="showNetworkSingle" class="ml20 mr20 df ip-num-wrap">
      <p class="key mr20">
        {{ t('ins.fast.publicNetTrafficCost') }}
      </p>
      <p class="text-warning value">${{ price.networkPrice.discountPrice || 0 }}/GB</p>
    </div>
    <el-popover placement="top" :width="200" trigger="hover" :teleported="false">
      <template #reference>
        <div class="line-wrap mr20 white-space-nowrap">
          <span class="text">{{ t('ins.fast.configCost') }}</span>
          <div class="line" />
        </div>
      </template>

      <template #default>
        <div class="num-popover">
          <div class="tit mb10">
            {{ t('ins.fast.configCostDetail') }}
          </div>
          <!-- 计费项 -->
          <div class="num-item df ac bg">
            <div class="key" :style="keyClass">
              {{ t('ins.fast.costItem') }}
            </div>
            <span class="val">{{ t('ins.fast.price') }}</span>
          </div>
          <!-- 实例 -->
          <div class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('ins.fast.ins') }}
            </div>
            <span class="val text-warning">${{ price.instancePrice.discountPrice }}</span>
          </div>
          <!-- 镜像 -->
          <div class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('ins.fast.image') }}
            </div>
            <span class="val text-warning">${{ price.imagePrice.discountPrice }}</span>
          </div>
          <!-- 系统盘 -->
          <div class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('ins.fast.sysDiskRam') }}
            </div>
            <span class="val text-warning">${{ price.systemDiskPrice.discountPrice }}</span>
          </div>
          <!-- 数据盘 -->
          <div class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('ins.fast.dataDiskRam') }}
            </div>
            <span class="val text-warning">${{ price.dataDiskPrice.discountPrice }}</span>
          </div>
          <!-- 公网带宽 -->
          <div v-if="!showNetworkSingle" class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('ins.custom.publicNetBandwidth') }}
            </div>
            <span class="val text-warning">${{ price.networkPrice.discountPrice }} </span>
          </div>
        </div>
      </template>
    </el-popover>
    <div class="mr20 num-wrap">
      <p class="text-warning num-top white-space-nowrap">
        ${{ allPrcie.sum }} {{ isTimeCost(insCostType) ? 'USD' : 'USD/H' }}
      </p>
      <p class="num-bottm">
        {{ t('ins.fast.pay') }} ${{ allPrcie.coupon }} {{ isTimeCost(insCostType) ? 'USD' : 'USD/H' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import NP from 'number-precision'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { isTimeCost } from '@/views/cvm/ins/config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const keyMap = {
  [ja]: { width: '160px' },
  [en]: { width: '160px' },
  [zh]: { width: '120px' },
}

const keyClass = useI18nStyle(keyMap)

NP.enableBoundaryChecking(false)

interface PropType {
  price: any
  showNetworkSingle: boolean
  insCostType: number
}

const props = withDefaults(defineProps<PropType>(), {
  price: () => ({}),
  showNetworkSingle: false, // 是否单独显示网络价格
})

/**
 * @Desc 总价
 * 公网ip带宽计费模式为按带宽计费,公网ip价格汇总总金额
 * 公网ip带宽计费模式为按流量计费,公网ip价格单独展示，不计入总和
 *
 */
const allPrcie = computed(() => {
  let sum: number = 0 // 总价
  let coupon: number = 0 // 优惠

  // 不管实例为按量计费/包年包月，后端给的networkPrice（eip）都是有值，需要前端判断eip为按流量计费，则无需累计networkPrice，反之需要
  const priceFields = props.showNetworkSingle
    ? ['dataDiskPrice', 'imagePrice', 'instancePrice', 'systemDiskPrice']
    : ['dataDiskPrice', 'imagePrice', 'instancePrice', 'networkPrice', 'systemDiskPrice']

  for (let key of priceFields) {
    sum = NP.plus(sum, props.price[key].discountPrice)
    coupon = NP.plus(coupon, NP.minus(props.price[key].originalPrice, props.price[key].discountPrice))
  }

  return {
    sum,
    coupon,
  }
})
</script>

<style lang="scss" scoped>
.num-wrap {
  margin-top: -5px;

  .num-top {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 24px;
    color: #fc8c00;
  }

  .num-bottm {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    color: #999;
  }
}

.num-popover {
  box-sizing: border-box;
  padding: 10px;

  // width: 200px;

  /* height: 264px; */

  .tit {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 12px;
    color: #000;
  }

  .num-item {
    &:hover {
      background: #f9fafc;
    }

    height: 34px;

    // padding-left: 10px;
    padding: 0 10px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 12px;
    font-weight: 400;
    line-height: 34px;
    color: #555;
    cursor: pointer;

    .key {
      // width: 120px;
      margin-right: 20px;
    }
  }

  .bg {
    font-weight: bold;
    background: #f9fafc;
  }
}

.ip-num-wrap {
  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }

  .value {
    margin-top: -5px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 24px;
    color: #fc8c00;
  }
}

.line-wrap {
  position: relative;
  height: 21px;

  .text {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }

  .line {
    position: absolute;
    bottom: 3px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #000;
  }
}

.white-space-nowrap {
  white-space: nowrap;
}
</style>
