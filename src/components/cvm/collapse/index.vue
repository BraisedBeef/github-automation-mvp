<template>
  <div>
    <p class="df ac jsb mb20">
      <slot v-if="$slots.text" name="text" />
      <span v-else class="len">{{ text }}</span>

      <span class="text-primary btn cursor-pointer" @click="changeCollapse">{{
        modelValue ? t('cvmCommon.expand') : t('cvmCommon.collapse')
      }}</span>
    </p>
    <el-collapse-transition v-if="collapseFn">
      <div v-show="!modelValue">
        <slot />
      </div>
    </el-collapse-transition>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

interface PropType {
  text: string
  modelValue: boolean
  collapseFn?: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  text: '',
  modelValue: false,
  collapseFn: true,
})
const emits = defineEmits<{
  (event: 'change', value: boolean): void
  (event: 'update:modelValue', value: boolean): void
}>()

const changeCollapse = () => {
  emits('update:modelValue', !props.modelValue)
  emits('change', !props.modelValue)
}
</script>

<style lang="scss" scoped>
.len {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;
}

.btn {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #0063ff;
}
</style>
