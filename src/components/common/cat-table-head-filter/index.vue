<template>
  <div class="table-filter df ac">
    <div v-if="!props.tip">
      {{ t(props.label) }}
    </div>
    <el-tooltip v-else :content="t(props.tip)" placement="top">
      <div>{{ t(props.label) }}</div>
    </el-tooltip>
    <el-popover ref="popoverRef" placement="bottom" trigger="click">
      <template #default>
        <div class="filter-button df fdc">
          <el-button
            v-if="props.showAll"
            :type="props.modelValue === props.allValue ? 'primary' : ''"
            text
            @click="changeActiveItem({ value: props.allValue })"
          >
            {{ t('all') }}
          </el-button>
          <el-button
            v-for="(btnv, btni) in props.list"
            :key="'btnv' + btni"
            :type="props.modelValue === (btnv.value as any) ? 'primary' : ''"
            text
            @click="changeActiveItem({ value: btnv.value })"
          >
            {{ btnv.label }}
          </el-button>
        </div>
      </template>
      <template #reference>
        <div><Svg-icon name="header-filter" /></div>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    list: any[]
    label?: any
    tip?: string
    iconName?: string
    allValue?: string | number
    showAll?: boolean
  }>(),
  {
    tip: '',
    label: '',
    iconName: 'header-filter',
    allValue: '',
    showAll: true,
  },
)

const popoverRef = ref()

const emit = defineEmits<{
  (event: 'update:modelValue', params: any): void
  (event: 'change', params: any): void
}>()

const changeActiveItem = v => {
  emit('update:modelValue', v.value)
  emit('change', v.value)
  popoverRef.value && popoverRef.value.hide && popoverRef.value.hide()
}
</script>

<style lang="scss" scoped>
.table-filter {
  & div:first-child {
    margin-right: 10px;
  }

  .svg-icon {
    font-size: 12px;
  }
}

:deep(.el-button--primary) {
  background-color: transparent !important;
}
</style>
