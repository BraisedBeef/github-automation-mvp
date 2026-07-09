<template>
  <div class="monitor-info-box">
    <div v-for="(item, index) in props.infoArr" :key="item.title + index" class="monitor-info-box-item">
      <div class="title">
        {{ t(item.title) }}
      </div>
      <div v-show="item.value" class="value">
        <span class="value-v">{{ item.value }}</span>
        <span class="value-unit">{{ t(item.unit!, { show: false }) }}</span>
      </div>
      <div v-show="!item.value" class="value null">-</div>
      <div class="time">
        {{ item.time || nowDate }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

export interface InfoBoxInterface {
  title: string
  value: any
  unit: string
  time: any
  doubleTime?: boolean
  type?: any
}

const props = defineProps<{
  infoArr: InfoBoxInterface[]
}>()

const nowDate = computed(() => getDateDayjs(maoYunDayJs(), 'string', true))
</script>

<style scoped lang="scss">
.monitor-info-box {
  display: flex;
  flex-wrap: nowrap;

  .monitor-info-box-item {
    flex: 1;
    width: 0;
    margin: 20px;
    margin-right: 0;
    font-weight: 700;
    border-right: 1px solid var(--border-c);

    .title {
      color: var(--primary-text);
    }

    .value {
      .value-v {
        margin-right: 10px;
        font-size: 36px;
        color: var(--primary-color);
      }

      .value-unit {
        color: var(--primary-text);
      }
    }

    .null {
      font-size: 36px;
      color: var(--primary-text);
    }

    .time {
      font-size: 12px;
      font-weight: 400;
      color: var(--sub-text);
    }

    &:last-child {
      border-right: none;
    }
  }
}
</style>
