<template>
  <div class="">
    <ChartLayout :title="t('ins.monitor.disk')">
      <el-row class="w-full" :gutter="20">
        <el-col v-for="(item, index) in list" :key="index" :span="8">
          <Chart :refresh-num="item.refreshNum" :params="item.params" :config="item.config" :legend="item.legend" />
        </el-col>
      </el-row>
    </ChartLayout>
  </div>
</template>

<script setup lang="ts">
import ChartLayout from './chart-layout.vue'
import Chart from './chart.vue'
import { PropType } from './type'
import t from '@/utils/i18n'

const props = withDefaults(defineProps<PropType>(), {
  list: () => [],
})
</script>

<style lang="scss" scoped></style>
