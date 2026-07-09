<template>
  <!-- 一对多 -->
  <div class="tip-wrap" :class="hideMarginBottom ? '' : 'mb20'" :style="tipStyle">
    <template v-for="(item, index) in text" :key="index">
      <!-- main -->
      <div class="tip">
        <!-- icon -->
        <SvgIcon :name="svgIconName" class="mr4 mt4" />
        <span class="text" :class="tipClassName">{{ item.main }} </span>
      </div>
      <!-- sub -->
      <div v-for="(subItem, indey) in item.sub" :key="indey" class="tip">
        <SvgIcon name="xxx" class="mr4" />
        <span class="text" :class="tipClassName">{{ subItem }}</span>
      </div>
    </template>
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

  .tip {
    display: flex;
  }

  .text {
    flex: 1; /* 自动填充剩余空间 */
    flex-basis: 0; /* 使子元素平分剩余空间 */
  }
}
</style>
