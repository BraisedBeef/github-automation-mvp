<template>
  <div class="price-fixed">
    <el-popover placement="top" :width="200" trigger="hover" :disabled="tab === 2">
      <template #reference>
        <div class="line-wrap">
          <span class="text">{{ t('oss.buyPage.currentCost') }} :</span>
        </div>
      </template>
      <div class="oss-num-popover">
        <div class="tit">
          {{ t('oss.buyPage.configureCostDetails') }}
        </div>
        <div class="desc">
          {{ t('oss.buyPage.actualDiscountAmount') }}
        </div>
        <!-- 计费项 -->
        <div class="num-item df ac bg">
          <div class="key" :style="keyClass">
            {{ t('oss.buyPage.billingItem') }}
          </div>
          <span class="val">{{ t('oss.buyPage.price') }}</span>
        </div>
        <!-- 存储容量 -->
        <div class="num-item df ac">
          <div class="key" :style="keyClass">
            {{ t('oss.buyPack.categoryLabel1') }}
          </div>
          <span class="val text-warning">${{ priceSource.items[0]?.finalTotal.toFixed(2) || 0 }}</span>
        </div>
        <!-- 流量 -->
        <div class="num-item df ac">
          <div class="key" :style="keyClass">
            {{ t('oss.buyPack.categoryLabel2') }}
          </div>
          <span class="val text-warning">${{ priceSource.items[1]?.finalTotal.toFixed(2) || 0 }}</span>
        </div>
        <!-- 读写请求 -->
        <div class="num-item df ac">
          <div class="key" :style="keyClass">
            {{ t('oss.buyPack.categoryLabel3') }}
          </div>
          <span class="val text-warning">${{ priceSource.items[2]?.finalTotal.toFixed(2) || 0 }}</span>
        </div>
      </div>
    </el-popover>
    <div class="price-wrap">
      <div class="price df ac">
        <!-- 现价 -->
        <p>${{ priceSource.finalTotal.toFixed(2) }} USD</p>
        <!-- 原价 -->
        <p class="origin-price">
          {{ t('oss.buyPage.originalPrice') }}：${{ priceSource.originalTotal.toFixed(2) }} USD
        </p>
      </div>
      <el-button type="primary" @click="buy">
        {{ t('oss.buyPage.buyNow') }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useOss } from '@/views/oss/hooks/use-oss'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const keyMap = {
  [ja]: { width: '160px' },
  [en]: { width: '160px' },
  [zh]: { width: '120px' },
}
const keyClass = useI18nStyle(keyMap)

const { priceSource, tab, submit } = useOss()

const buy = () => {
  console.log('submit')
  submit()
}
</script>

<style lang="scss" scoped>
.price-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 11;
  display: flex;
  width: 100%;
  height: 118px;
  padding: 20px 120px;
  margin: auto;
  background: #fff;
  box-shadow: 0 -2px 4px 0 rgb(0 0 0 / 8%);

  .line-wrap {
    margin-top: 6px;
    margin-right: 40px;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #555;

    .text {
      cursor: pointer;
      border-bottom: 1px solid #555;
    }
  }

  .price-wrap {
    .price {
      gap: 20px;
      align-items: baseline;
      margin-bottom: 10px;
      font-size: 24px;
      font-weight: 500;
      color: #ff6700;

      .origin-price {
        font-size: 14px;
        font-weight: 400;
        color: #999;
        text-decoration-line: line-through;
      }
    }
  }
}
</style>

<style lang="scss">
.oss-num-popover {
  box-sizing: border-box;
  padding: 4px;

  .tit {
    margin-bottom: 8px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    color: #000;
  }

  .desc {
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 400;
    color: #999;
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

    .val {
      min-width: 60px;
    }
  }

  .bg {
    font-weight: bold;
    background: #f9fafc;
  }
}
</style>
