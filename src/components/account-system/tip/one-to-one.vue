<template>
  <!-- 一对一 -->
  <div class="tip-wrap df" :class="hideMarginBottom ? '' : 'mb20'" :style="tipStyle">
    <SvgIcon :name="svgIconName" class="mr4 mt4" />
    <div>
      <span :class="tipClassName">{{ text[0].main }}</span>
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
  min-height: 34px;
  padding: 7px 15px;
}
</style>
