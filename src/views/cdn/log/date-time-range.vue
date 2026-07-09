<template>
  <div class="custom-datetimerange">
    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
      <SvgIcon class="mr10" name="cat-cdn-help" />
    </el-tooltip>
    <!-- 开始时间 -->
    <ElDatePicker
      v-model="startTime"
      type="datetime"
      :clearable="false"
      :disabled-date="date => props.pickerOptions?.disabledDate?.(date, 'start')"
      :disabled-hours="props.pickerOptions?.disabledTime?.('start').disabledHours"
      :disabled-minutes="props.pickerOptions?.disabledTime?.('start').disabledMinutes"
      :disabled-seconds="props.pickerOptions?.disabledTime?.('start').disabledSeconds"
      :format="datetimeFormat"
      :value-format="datetimeFormat"
      :placeholder="startPlaceholder"
      @change="handleStartChange"
      @visible-change="handleStartVisibleChange"
    />

    <span class="separator">{{ separatorText }}</span>

    <!-- 结束时间 -->
    <ElDatePicker
      ref="endDatePickerRef"
      v-model="endTime"
      type="datetime"
      :clearable="false"
      :disabled="!startTime"
      :disabled-date="endDisabledTime"
      :disabled-hours="props.pickerOptions?.disabledTime?.('end').disabledHours"
      :disabled-minutes="props.pickerOptions?.disabledTime?.('end').disabledMinutes"
      :disabled-seconds="props.pickerOptions?.disabledTime?.('end').disabledSeconds"
      :format="datetimeFormat"
      :value-format="datetimeFormat"
      :placeholder="endPlaceholder"
      @change="handleEndChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { _debounce } from '@/utils/timing-utils'
import { ElDatePicker } from 'element-plus'

type TimeRange = (Date | string | null)[]

interface DisabledTime {
  disabledHours?: () => number[]
  disabledMinutes?: (hour: number) => number[]
  disabledSeconds?: (hour: number, minute: number) => number[]
}

const props = withDefaults(
  defineProps<{
    modelValue?: TimeRange
    datetimeFormat?: string
    separatorText?: string
    startPlaceholder?: string
    endPlaceholder?: string
    pickerOptions?: {
      disabledDate?: (date: Date, type: 'start' | 'end') => boolean
      disabledTime?: (type: 'start' | 'end') => DisabledTime
    }
  }>(),
  {
    datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
    separatorText: t('to'),
    startPlaceholder: t('pleaseStartTime'),
    endPlaceholder: t('pleaseEndTime'),
  },
)
const endDisabledTime = date => {
  // 如果开始时间存在，则结束时间不能早于开始时间 同时满足disabledDate的设置
  if (props.modelValue?.[0]) {
    return (
      maoYunDayJs(date).valueOf() < maoYunDayJs(props.modelValue[0]).startOf('day').valueOf() ||
      props.pickerOptions?.disabledDate?.(date, 'end')
    )
  } else {
    return props.pickerOptions?.disabledDate?.(date, 'end')
  }
}

const emit = defineEmits<{
  (e: 'change', value: TimeRange): void
  (e: 'update:modelValue', value: TimeRange): void
}>()

const endDatePickerRef = ref<InstanceType<typeof ElDatePicker>>()

const startTime = computed({
  get: () => props.modelValue?.[0],
  set: val => {
    emit('update:modelValue', [val || null, props.modelValue?.[1] || null])
  },
})

const debounceMessage = _debounce(() => {
  ElMessage({
    message: t('common.endTimeBeforeStartTips'),
    type: 'warning',
  })
}, 500)

const endTime = computed({
  get: () => props.modelValue?.[1],
  set: val => {
    if (startTime.value && val && maoYunDayJs(val) < maoYunDayJs(startTime.value)) {
      debounceMessage()
      return
    }
    emit('update:modelValue', [props.modelValue?.[0] || null, val || null])
  },
})

const handleStartChange = () => {
  if (startTime.value && endTime.value && startTime.value > endTime.value) {
    endTime.value = null
  }
}
const handleStartVisibleChange = (visible: boolean) => {
  if (!visible && endDatePickerRef.value) {
    // 如果开始时间选择器打开，结束时间选择器打开
    endDatePickerRef.value?.focus()
  }
}
const handleEndChange = () => {
  if (endTime.value && startTime.value && maoYunDayJs(endTime.value) < maoYunDayJs(startTime.value)) {
    debounceMessage()
    return
  }
  // @ts-ignore
  emit('change', [startTime.value, endTime.value])
}
// 动态计算结束时间禁用范围
watch(startTime, newVal => {
  if (newVal && endTime.value && newVal > endTime.value) {
    endTime.value = null
  }
})
</script>

<style scoped>
.custom-datetimerange {
  display: inline-flex;
  align-items: center;

  .el-date-editor {
    width: 180px;

    & + .el-date-editor {
      margin-left: 0;

      :deep(.el-input__inner) {
        border-left: 0;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }

    &:first-child {
      :deep(.el-input__inner) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }

  .separator {
    padding: 0 8px;
    color: var(--el-text-color-regular);
  }
}
</style>
