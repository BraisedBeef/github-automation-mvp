<template>
  <div>
    <!-- 隐藏 -->
    <template v-if="disabledType === 'hidden'">
      <span v-if="!disabled" class="text-primary cursor-pointer" @click="emits('click')">{{ text }}</span>
    </template>
    <!-- 置灰 -->
    <template v-else>
      <el-tooltip :visible="tooltipVisible" :content="tooltipContent" effect="light" placement="top">
        <span v-if="!disabled" class="text-primary cursor-pointer" @click="emits('click')">{{ text }}</span>
        <span v-else class="cursor-not-allowed disabled-text" @mouseenter="mouseenter" @mouseleave="mouseleave">{{
          text
        }}</span>
        <template #content>
          <slot name="content" />
        </template>
      </el-tooltip>
    </template>
  </div>
</template>

<script setup lang="ts">
interface PropType {
  disabled: boolean
  text: string
  disabledType?: 'hidden' | 'text' // 禁止形式：隐藏或者置灰
  openTooltip?: boolean // 是否开启禁止时 开启tooltip 注意：只会在禁止形式：置灰才显示
  tooltipContent?: string
}

const props = withDefaults(defineProps<PropType>(), {
  disabled: true,
  text: '',
  disabledType: 'text',
  openTooltip: false,
  tooltipContent: '',
})

const emits = defineEmits<{
  (event: 'click'): void
}>()

const slots = useSlots()

const tooltipVisible = ref<boolean>(false)

const mouseenter = () => {
  if (props.disabled && props.openTooltip) {
    tooltipVisible.value = true
  } else {
    tooltipVisible.value = false
  }
}

const mouseleave = () => {
  tooltipVisible.value = false
}
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';
</style>
