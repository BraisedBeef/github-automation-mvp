<template>
  <div class="contrast-data df page-box pd20 mt20 mb20">
    <div class="data-start">
      <div class="data-title">
        {{ props.compareTime.startTime || dateRange }}
      </div>
      <div class="data-list df fdc">
        <div v-for="(item1, index) in props.startData" :key="'item1' + index" class="data-item">
          <div class="data-title mt20">
            {{ t(item1.title) }}
          </div>
          <div v-show="item1.value">
            <span class="data-count">{{ item1.value }}</span>
            <span class="data-unit">{{ t(item1.unit, { show: false }) }}</span>
          </div>
          <div v-show="!item1.value" class="null">-</div>
          <div class="data-time">
            {{ item1.time || nowDate }}
          </div>
        </div>
      </div>
    </div>
    <div class="data-end">
      <div class="data-title">
        {{ props.compareTime.endTime || dateRange }}
      </div>
      <div class="data-list df fdc">
        <div v-for="(item2, index) in props.endData" :key="'item2' + index" class="data-item">
          <div class="data-title mt20">
            {{ t(item2.title) }}
          </div>
          <div v-show="item2.value">
            <span class="data-count">{{ item2.value }}</span>
            <span class="data-unit">{{ t(item2.unit, { show: false }) }}</span>
          </div>
          <div v-show="!item2.value" class="null">-</div>
          <div class="data-time">
            {{ item2.time || nowDate }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = defineProps<{
  startData: any[]
  endData: any[]
  compareTime: {
    startTime: any
    endTime: any
  }
}>()

const nowDate = computed(() => {
  return getDateDayjs(maoYunDayJs().valueOf(), 'string', true)
})
const dateRange = computed(() => {
  return (
    getDateDayjs(maoYunDayJs().valueOf(), 'string', true) +
    ' ~ ' +
    getDateDayjs(maoYunDayJs().valueOf(), 'string', true)
  )
})
</script>

<style lang="scss" scoped>
.contrast-data {
  .data-start {
    margin-right: 20px;
    border-right: 1px solid #e5e5e5;
  }

  .data-start,
  .data-end {
    flex: 1;
    width: 0;
    padding-right: 20px;
    font-weight: 700;

    .data-title {
      color: var(--primary-text);
    }

    .data-item {
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e5e5;

      &:last-of-type {
        padding-bottom: 0;
        border-bottom: none;
      }

      .data-time {
        font-weight: 400;
        color: var(--sub-text);
      }

      .null {
        font-size: 36px;
        color: var(--primary-text);
      }

      .data-count {
        margin-right: 10px;
        font-size: 36px;
        color: var(--primary-color);
      }

      .data-unit {
        color: var(--primary-text);
      }
    }
  }
}
</style>
