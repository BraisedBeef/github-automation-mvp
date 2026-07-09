<template>
  <div class="table-filter df ac">
    <div v-if="!props.tip">
      {{ t(props.label) }}
    </div>
    <el-tooltip v-else :content="t(props.tip)" placement="top">
      <div>{{ t(props.label) }}</div>
    </el-tooltip>
    <el-popover placement="bottom" trigger="click" width="160" :visible="visible">
      <template #default>
        <div :class="onHideDomClass">
          <!-- 多选 check -->
          <div v-if="fieldType === 'check'" class="checkbox-wrap df fdc">
            <div class="top-wrap">
              <!-- 全选 -->
              <el-checkbox
                v-if="showAll"
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                class="checkbox"
                @change="handleCheckAllChange"
              >
                {{ t('cvmCpm.all') }}
              </el-checkbox>
              <!-- 多选 -->
              <el-checkbox-group v-model="checked" :max="checkMax" @change="handleCheckedChange">
                <div v-for="item in list" :key="item" class="checkbox">
                  <el-checkbox :label="item.value" :value="item.value">
                    {{ item.label }}
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
            <!-- line -->
            <div class="line" />
            <!-- bottom -->
            <div class="bottom-wrap df ac">
              <el-button type="primary" @click="confirm">
                {{ t('cvmCpm.confirm') }}
              </el-button>
              <el-button @click="cancel">
                {{ t('cvmCpm.cancel') }}
              </el-button>
            </div>
          </div>
          <!-- 单选 select -->
          <div v-else class="filter-list">
            <div
              v-for="item in list"
              :key="item.value"
              :class="`filter-item ${selectVal == item.value ? 'filter-item-select' : ''}`"
              @click.stop="selectItemFn(item)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </template>
      <template #reference>
        <div :class="`cursor-pointer ${targetDomClass}`" @click="visible = !visible">
          <Svg-icon name="header-filter" />
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useDomClick } from '@/hooks/use-dom-click'
import { CheckboxValueType } from 'element-plus/lib/components/checkbox'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const props = withDefaults(
  defineProps<{
    modelValue: any[] | any
    list: any[]
    label: any
    tip?: string
    iconName?: string
    allValue?: string | number
    showAll?: boolean
    checkMax?: number
    fieldKey?: string
    fieldType?: 'select' | 'check' // select为单选 check为多选
    valueType?: 'string'
    checkKeyType?: 'string' | 'number' // check时 value值是number类型还是string类型
  }>(),
  {
    tip: '',
    iconName: 'header-filter',
    allValue: '',
    showAll: true,
    checkMax: 999,
    fieldKey: '',
    fieldType: 'check',
    checkKeyType: 'number',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', params: any): void
  (event: 'change', params1: any, params2: any): void
}>()

const checkAll = ref<boolean>(false)
const isIndeterminate = ref<boolean>(false)
const checked = ref<any[]>([])
const selectVal = ref<number | string>()
const visible = ref(false)
// 这里类名中带上时间戳确保每个组件内的类名不一样
const timestr = maoYunDayJs().valueOf()
const targetDomClass = `table-filter_target_dom_${timestr}`
const onHideDomClass = `table-filter_onhide_dom${timestr}`
const domClickCallback = key => {
  if (!key) hide()
}
useDomClick(`.${targetDomClass}`, domClickCallback, `.${onHideDomClass}`)

// 全选
const handleCheckAllChange = (val: CheckboxValueType) => {
  console.log(`全选==>`)

  const all = props.list.map(el => el.value)
  checked.value = val ? all : []
  isIndeterminate.value = false
}

// 多选
const handleCheckedChange = (value: CheckboxValueType[]) => {
  console.log(`多选==>`)

  const checkedCount = value.length
  checkAll.value = checkedCount === props.list.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < props.list.length
}

const confirm = () => {
  const params = props?.valueType === 'string' && props.fieldType === 'check' ? checked.value.join(',') : checked.value
  emit('update:modelValue', params)
  emit('change', params, props.fieldKey)
  visible.value = false
}

const selectItemFn = (item: any) => {
  if (selectVal.value === item.value) return
  selectVal.value = item.value
  // const params = props?.valueType === 'string' && props.fieldType === 'check' ? checked.value.join(',') : checked.value
  const params = selectVal.value
  emit('update:modelValue', params)
  emit('change', params, props.fieldKey)
  visible.value = false
}

const cancel = () => {
  visible.value = false
}

const updateCheck = val => {
  console.log('val--->', val)
  if (props.fieldType === 'check') {
    if (props?.valueType === 'string') {
      checked.value = val ? (props.checkKeyType === 'number' ? val.split(',').map(i => Number(i)) : val.split(',')) : []
    } else {
      checked.value = val ? [...val] : []
    }
    handleCheckedChange(checked.value)
  } else {
    selectVal.value = val
  }
}

const hide = () => {
  visible.value = false
}

onMounted(() => {
  console.log('props.modelValue', props)
  if (props.modelValue?.length > 0) updateCheck(props.modelValue)
})

defineExpose({
  updateCheck,
  hide,
})
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

.checkbox-wrap {
  :deep(.el-checkbox) {
    display: flex;
    align-items: center;
    padding: 7px 10px;
    cursor: pointer;

    &:hover {
      background-color: #f1f7ff;
    }
  }

  .top-wrap {
    .checkbox {
      /* margin-bottom: 10px; */
    }
  }

  .line {
    height: 1px;
    margin-bottom: 7px;
    background: var(--border-c);
  }
}

.filter-item {
  min-width: 100px;
  height: 34px;
  padding: 0 10px;
  line-height: 34px;
  cursor: pointer;

  &.filter-item-select {
    background-color: #f1f7ff;
  }

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }
}
</style>
