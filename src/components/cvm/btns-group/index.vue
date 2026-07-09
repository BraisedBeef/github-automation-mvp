<template>
  <div
    v-for="(list, index) in listMap"
    :key="index"
    class="btn-wrap cursor-pointer df"
    :class="listMap.length > 1 ? 'must' : 'single'"
  >
    <!-- <div class="row df" :class="index !== 0 && 'no-first-and-last-row'"> -->
    <div
      v-for="(item, indey) in list"
      :key="indey"
      :style="style"
      class="btn"
      :class="[
        modelValue.value === item.value ? 'actived' : item?.disabled ? 'disabled-btn' : '',
        list.length === 1 && (item?.disabled ? 'disabled-btn br4' : 'br4'),
        index >= 1 && 'no-first-and-last-row',
      ]"
      @click="changeValue(item)"
    >
      {{ item.label }}
    </div>
    <!-- </div> -->
  </div>
</template>

<script setup lang="ts">
type BtnType = {
  label?: string | number
  value?: string | number
  [x: string]: any
}

interface PropType {
  list: any[]
  modelValue: BtnType
  style?: {
    [x: string]: string
  }
  rowItemLen?: number // 每行展示多少个
}

const props = withDefaults(defineProps<PropType>(), {
  list: () => [],
  modelValue: () => ({
    label: '',
    value: '',
  }),
})
const emits = defineEmits<{
  (event: 'changeValue', value: BtnType): void
  (event: 'update:modelValue', value: BtnType): void
}>()

const listMap = computed(() => {
  if (props.rowItemLen) {
    const result: any[] = []

    for (let i = 0; i < props.list.length; i += props.rowItemLen) {
      result.push(props.list.slice(i, i + props.rowItemLen))
    }
    return result
  } else {
    return [props.list]
  }
})

const changeValue = (item: BtnType) => {
  if (item?.disabled || props.modelValue.value === item.value) return
  emits('update:modelValue', item)
  emits('changeValue', item)
}
</script>

<style lang="scss" scoped>
.btn-wrap {
  margin-right: 10px;
  border-radius: 4px;

  .btn {
    &:not(:first-child) {
      border-left-color: transparent;
    }

    &:first-child {
      border-radius: 4px 0 0 4px;
    }

    &:last-child {
      border-radius: 0 4px 4px 0;
    }

    /* min-width: 150px; */
    height: 32px;
    padding: 0 5px;
    line-height: 32px;

    /* flex-grow: 1; //  按钮宽度根据内容自适应 */
    text-align: center;
    border: 1px solid var(--border-c);
  }

  .br4 {
    border-radius: 4px !important;
  }

  .actived {
    color: var(--primary-color);
    background: var(--selected-bgc);
    border: 1px solid var(--primary-color) !important;
  }

  .disabled-btn {
    opacity: 0.5;
  }
}

.must {
  .no-first-and-last-row {
    /* .btn { */
    border-top-color: transparent;

    /* } */
  }
}
</style>
