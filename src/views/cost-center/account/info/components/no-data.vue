<template>
  <div class="">
    <div class="df ac jc mb20">
      <SvgIcon :name="svgName" style="width: 40px; height: 40px" />
    </div>
    <p class="text">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

interface PropType {
  svgName: string
  text: string
}
const props = withDefaults(defineProps<PropType>(), {
  svgName: 'no-data-order',
  text: t('accountCostCenter.noData'),
})
</script>

<style lang="scss" scoped>
.text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--sub-text);
  text-align: center;
}
</style>
