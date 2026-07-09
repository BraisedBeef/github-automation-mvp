<template>
  <div class="batch-amendant-record-filter">
    <!-- 记录类型 -->
    <el-select
      v-model="state.filter.recordType"
      style="width: 120px; margin-right: 20px; margin-bottom: 20px"
      :style="{ width: computedWidth.r_type }"
      :placeholder="t('components.recordTypePlaceholder')"
    >
      <el-option v-for="item in recordTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <!-- 线路类型 -->
    <DnsLine
      v-model:id="state.filter.lineTypeId"
      :options="lineTypes"
      tele-class="bbb"
      :style="{ width: computedWidth.l_type }"
      style="margin-right: 20px; margin-bottom: 20px"
    />
    <!-- 主机记录 -->
    <el-input
      v-model.trim="state.filter.hostRecord"
      class="filter-route-dns"
      style="margin-right: 20px; margin-bottom: 20px"
      :style="{ width: computedWidth.h_type }"
      :placeholder="t('components.hostPlaceholder')"
    >
      <template #prepend>
        {{ t('components.host') }}
      </template>
    </el-input>
    <!-- 记录值 -->
    <el-input
      v-model.trim="state.filter.recordValue"
      class="filter-route-IPv4"
      style="margin-right: 68px; margin-bottom: 20px"
      :style="{ width: computedWidth.v }"
      :placeholder="t('components.recordValuePlaceholder')"
    >
      <template #prepend>
        {{ t('components.recordValue') }}
      </template>
    </el-input>
    <!-- 右侧操作按钮 -->
    <div class="handle-btn">
      <el-button
        :loading="loading"
        :disabled="disabled"
        type="primary"
        class="confirm"
        style="margin-bottom: 20px"
        @click="submit"
      >
        {{ t('components.query') }}
      </el-button>
      <el-button plain :disabled="loading" style="margin-bottom: 20px; margin-left: 0" @click="clear">
        {{ t('components.clear') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _throttle } from '@/utils/timing-utils'
import { useBaseStore } from '@/store'
import { LANGUAGE_MAP } from '@/config/constant-config'
import DnsLine from '../dns-line/index.vue'
import { _matchRouteType } from '@/utils/dns-utils'
const baseStore = useBaseStore()
export interface Filter {
  hostRecord: string // 主机记录
  recordType: number | string // 记录类型
  lineType: string // 线路类型
  lineTypeId: string
  recordValue: string // 记录值
}
const props = withDefaults(
  defineProps<{
    recordTypeOptions: any[]
    lineTypes: any[]
    loading: boolean
    disabled: boolean
  }>(),
  {
    recordTypeOptions: () => [],
    loading: false,
  },
)

const emit = defineEmits<{
  (event: 'submit', filter: Filter): void
  (event: 'clear'): void
}>()

const state = reactive<{
  filter: Filter
}>({
  filter: {
    recordType: '', // 记录类型
    lineType: '', // 线路类型
    lineTypeId: '',
    hostRecord: '', // 主机记录
    recordValue: '', // 记录值
  },
})

// submit
const submit = _throttle(() => {
  // lineType
  const { lineTypeId } = state.filter
  const line = _matchRouteType(lineTypeId, props.lineTypes)
  state.filter.lineType = line?.lineValue
  state.filter.lineTypeId = line?.lineTypeId
  emit('submit', state.filter)
}, 1000)
// clear
const clear = _throttle(() => {
  state.filter = {
    recordType: '', // 记录类型
    lineType: '', // 线路类型
    lineTypeId: '',
    hostRecord: '', // 主机记录
    recordValue: '', // 记录值
  }
  emit('clear')
}, 300)
// 宽度
const computedWidth = computed((): any => {
  let obj: any = {}
  switch (baseStore.lang) {
    case LANGUAGE_MAP.zh.i18nParam:
      obj = {
        r_type: '120px',
        l_type: '120px',
        h_type: '240px',
        v: '240px',
      }
      break
    case LANGUAGE_MAP.en.i18nParam:
      obj = {
        r_type: '140px',
        l_type: '140px',
        h_type: '300px',
        v: '280px',
      }
      break
    default:
      obj = {
        r_type: '140px',
        l_type: '140px',
        h_type: '260px',
        v: '240px',
      }
      break
  }
  return obj
})
</script>

<style scoped lang="scss">
.batch-amendant-record-filter {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  .el-select,
  .el-cascader,
  .el-input-group .el-button {
    height: var(--input-height);
  }

  .handle-btn {
    display: flex;

    /* margin-left: 68px; */

    /* margin-left: auto; */
  }

  :deep(.el-input) {
    .el-input-group__prepend {
      color: #555;
      background-color: var(--selected-bgc);
    }
  }
}
</style>
