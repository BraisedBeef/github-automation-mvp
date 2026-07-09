<template>
  <div class="price-fixed">
    <div class="price-fixed__inner">
      <el-popover placement="top" :width="200" trigger="hover" :disabled="tab === 2">
        <template #reference>
          <div class="price-fixed__label">
            <span class="price-fixed__label-text">{{ t('oss.buyPage.currentCost') }}：</span>
          </div>
        </template>
        <div class="oss-num-popover">
          <div class="tit">
            {{ t('oss.buyPage.configureCostDetails') }}
          </div>
          <div class="desc">
            {{ t('oss.buyPage.actualDiscountAmount') }}
          </div>
          <div class="num-item df ac bg">
            <div class="key" :style="keyClass">
              {{ t('oss.buyPage.billingItem') }}
            </div>
            <span class="val">{{ t('oss.buyPage.price') }}</span>
          </div>
          <div class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('oss.buyPack.categoryLabel1') }}
            </div>
            <span class="val text-warning">${{ priceSource.items[0]?.finalTotal.toFixed(2) || 0 }}</span>
          </div>
          <div class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('oss.buyPack.categoryLabel2') }}
            </div>
            <span class="val text-warning">${{ priceSource.items[1]?.finalTotal.toFixed(2) || 0 }}</span>
          </div>
          <div class="num-item df ac">
            <div class="key" :style="keyClass">
              {{ t('oss.buyPack.categoryLabel3') }}
            </div>
            <span class="val text-warning">${{ priceSource.items[2]?.finalTotal.toFixed(2) || 0 }}</span>
          </div>
        </div>
      </el-popover>

      <div class="price-fixed__summary">
        <div class="price-fixed__current">
          <span class="price-fixed__current-value">${{ priceSource.finalTotal.toFixed(2) }}</span>
          <span class="price-fixed__current-unit">USD</span>
        </div>
        <el-button type="primary" class="price-fixed__button" @click="buy">
          {{ t('oss.buyPage.buyNow') }}
        </el-button>
      </div>

      <div class="price-fixed__origin">
        <span>{{ t('oss.buyPage.originalPrice') }}：</span>
        <span class="price-fixed__origin-value">${{ priceSource.originalTotal.toFixed(2) }} USD</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import t from '@/utils/i18n'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useOss } from '@/views/v2/oss/hooks/use-oss'
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
  z-index: 20;
  width: 100%;
  background: #fff;
  border-top: 1px solid #dcdfe6;
}

.price-fixed__inner {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  width: 100%;
  padding: 24px 56px;
  margin: 0 auto;
}

.price-fixed__label {
  padding-top: 16px;
}

.price-fixed__label-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  border-bottom: 1px solid currentcolor;
}

.price-fixed__summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.price-fixed__current {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  color: #ff720d;
}

.price-fixed__current-value {
  font-size: 32px;
  font-weight: 500;
  line-height: 44px;
}

.price-fixed__current-unit {
  padding-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.price-fixed__origin {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 38px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.price-fixed__origin-value {
  text-decoration: line-through;
}

.price-fixed__button {
  width: 120px;
  min-height: 48px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 0;
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
