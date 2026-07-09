<template>
  <div class="date-time-picker df ac">
    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
      <SvgIcon class="mr10" name="cat-cdn-help" />
    </el-tooltip>
    <el-date-picker
      v-model="state.start_time"
      :disabled="props.loading"
      :clearable="false"
      type="datetimerange"
      :range-separator="t('to')"
      :disabled-date="disabledDate"
      :start-placeholder="t('pleaseStartTime')"
      :end-placeholder="t('pleaseEndTime')"
      @change="
        v => {
          changeTime(v, 'start')
        }
      "
    />

    <div v-if="state.compare && showCompareButton" class="ml20">
      {{ t('contrast') }}
    </div>

    <el-date-picker
      v-if="state.compare && showCompareButton"
      v-model="state.end_time"
      :disabled="props.loading"
      :clearable="false"
      type="datetimerange"
      :range-separator="t('to')"
      :disabled-date="disabledDate"
      :start-placeholder="t('pleaseStartTime')"
      :end-placeholder="t('pleaseEndTime')"
      class="ml20"
      @change="
        v => {
          changeTime(v, 'end')
        }
      "
    />

    <div v-if="state.compare" class="ml20">
      <SvgIcon
        v-if="showCompareButton"
        name="v2-dialog-close"
        class="icon-hover"
        :size="8"
        @click="compareHandle(false)"
      />
      <el-button v-else class="nowrap contrast" plain @click="compareHandle(true)">
        {{ t('dataContrast') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setDateTimeRangeDayjs, getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'

const showCompareButton = ref<boolean>(false)

const props = withDefaults(
  defineProps<{
    start_time: any
    end_time?: any
    compare: boolean
    loading: boolean
    disabledDate?: Function
  }>(),
  {
    compare: false,
    loading: false,
    end_time: () => [],
  },
)
const emits = defineEmits<{
  (event: 'change', params: any): void
  (event: 'update:start_time', params: any): void
  (event: 'update:end_time', params: any): void
}>()

const state = reactive<{
  compare: boolean
  start_time: any
  end_time: any
}>({
  compare: false,
  start_time: [],
  end_time: [],
})

const compareHandle = bool => {
  showCompareButton.value = bool
}

const changeTime = (v, type) => {
  const timeRange = [
    `${getDateDayjs(v[0])[0].join('-')} ${getDateDayjs(v[0])[1].join(':')}`,
    `${getDateDayjs(v[1])[0].join('-')} ${getDateDayjs(v[1])[1].join(':')}`,
  ]
  if (type === 'start') {
    state.start_time = timeRange
    emits('update:start_time', state.start_time)
  }
  if (type === 'end') {
    state.end_time = timeRange
    emits('update:end_time', state.end_time)
  }
  emits('change', { start_time: state.start_time, end_time: state.end_time })
}

watch(
  () => ({ ...props }),
  n => {
    state.start_time = n.start_time
    state.end_time = n.end_time
    state.compare = n.compare
  },
  {
    immediate: true,
    deep: true,
  },
)

defineExpose({ showCompareButton })
</script>

<style lang="scss" scoped>
.date-time-picker {
  width: fit-content;
  overflow-x: auto;

  .contrast {
    color: var(--primary-color);
  }

  :deep(.dialog-close) {
    position: unset;
  }

  :deep(.el-date-editor .el-range-input) {
    // width: auto;
    flex: 1;
  }

  :deep(.el-date-editor .el-range-separator) {
    flex: unset;
  }
}
</style>
