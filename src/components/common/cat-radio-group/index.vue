<template>
  <div class="cat-radio-list">
    <el-radio-group
      v-model="modelValue"
      :readonly="props.readonly"
      @change="
        v => {
          emit('change', v)
          emit('update:modelValue', v)
        }
      "
    >
      <slot name="start" />
      <el-radio
        v-for="(itemv, itemi) in props.list"
        :key="(itemv.label as any) + itemi"
        :label="itemv.value"
        :disabled="itemv.disabled"
      >
        {{ itemv.label }}
      </el-radio>
      <slot name="end" />
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
interface ListItem {
  label: string | number
  value: string | number
  disabled?: boolean
}
const props = withDefaults(
  defineProps<{
    list: ListItem[]
    modelValue: any
    readonly?: boolean
  }>(),
  {
    readonly: false,
  },
)

const modelValue = ref(props.modelValue)

const emit = defineEmits<{
  (event: 'change', params: any): void
  (event: 'update:modelValue', params: any): void
}>()
</script>

<style lang="scss" scoped>
.cat-radio-list {
  display: flex;
  align-items: center;
}
</style>
