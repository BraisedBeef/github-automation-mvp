<template>
  <!-- 多对多 -->
  <div class="tip-wrap" :class="hideMarginBottom ? '' : 'mb20'" :style="tipStyle">
    <div v-for="(item, index) in text" :key="index" class="tip">
      <!-- icon -->
      <SvgIcon v-if="index === 0" :name="svgIconName" class="mr4 icon" />
      <!-- 占位 -->
      <SvgIcon v-else name="xxx" class="mr4" />
      <!-- main -->
      <span :class="tipClassName">{{ item.main }} </span>
      <!-- sub -->
      <div v-for="(subItem, indey) in item.sub" :key="indey" class="tip">
        <SvgIcon name="xxx" class="mr4" />
        <SvgIcon name="xxx" class="mr4" />
        <span :class="tipClassName">{{ subItem }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ItemType, ThemeType } from './type'
import { useTipTheme } from './use-tip-theme'

const props = withDefaults(
  defineProps<{
    text: ItemType[]
    theme: ThemeType
    hideMarginBottom: boolean // 去除底部marge
  }>(),
  {
    text: () => [],
    hideMarginBottom: false, // 去除底部marge
  },
)

const { tipStyle, tipClassName, svgIconName } = useTipTheme(props.theme)
</script>

<style lang="scss" scoped>
.tip-wrap {
  padding: 10px 15px 17px;

  .icon {
    margin-top: -4px;
  }
}
</style>
