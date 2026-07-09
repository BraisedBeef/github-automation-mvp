<template>
  <!-- 搜索框 -->
  <div ref="selectRef" :class="`select-input el-select ${randomClass}`" @click="clickFn">
    <!-- 条件筛选下拉框 -->
    <transition name="el-zoom-in-top">
      <div
        v-if="state.showList && state.filterArr.length"
        class="filter-list"
        :style="`width: ${state.width}px;top: ${state.top}px`"
      >
        <div
          v-for="item in state.filterArr"
          :key="item.fieldKey"
          class="filter-item"
          @click.stop="() => filterSelect(item)"
        >
          {{ item.fieldName }}
        </div>
      </div>
    </transition>

    <div class="el-select_content">
      <!-- 已添加的搜索项列表 -->
      <span class="select_tags-list">
        <el-tag
          v-for="(item, index) in searchList"
          :key="item.value"
          closable
          class="select_tags-item"
          @close="() => deleteItem(index)"
          >{{ item.fieldName }}:{{ getTagText(item) }}</el-tag
        >
      </span>
      <!-- 当前搜索项名称 -->
      <p v-if="state.nowSearch" class="now-seacth-name">{{ state.nowSearch?.fieldName }}:</p>
      <!-- 当前搜索项输入框 -->
      <div class="select__input_parent">
        <input
          ref="selectInputRef"
          v-model="state.inputVal"
          class="el-select__input"
          :placeholder="state.nowSearch?.fieldName || searchList.length ? '' : placeholder"
          @focus="focusFn"
          @blur="blurFn"
          @input="inputFn"
          @keyup.enter="addSearchItem"
          @keyup.delete="deleteFn"
        />
        <!-- select类型的搜索项下拉框  -->
        <transition name="el-zoom-in-top">
          <div
            v-if="state.nowSearch?.fieldType === 'select'"
            ref="selectFilterRef"
            class="filter-list"
            :style="`left:-13px;top: ${state.top}px;width: ${state.width}px`"
          >
            <div
              v-for="item in state.selectList"
              :key="item.value"
              class="filter-item"
              @click.stop="() => selectItemFn(item)"
            >
              {{ item.label }}
            </div>
          </div>
        </transition>
        <!-- check类型的搜索项下拉框 -->
        <transition name="el-zoom-in-top">
          <div
            v-if="state.nowSearch?.fieldType === 'check'"
            ref="checkFilterRef"
            name="el-zoom-in-top"
            class="filter-list"
            :style="`left: -13px;top: ${state.top}px;width: ${state.width}px`"
          >
            <el-checkbox-group v-model="state.nowSearch.value" class="select-checkbox" @keyup.enter="addSearchItem">
              <div>
                <el-checkbox v-for="item in state.selectList" :key="item.value" :label="item.value">
                  {{ item.label }}
                </el-checkbox>
              </div>
            </el-checkbox-group>
            <div class="line" />
            <div class="btn-wrap df jfe">
              <el-button type="primary" @click.stop="addSearchItem">
                {{ t('cvmCpm.confirm') }}
              </el-button>
              <el-button @click.stop="cancelClickFn">
                {{ t('cvmCpm.cancel') }}
              </el-button>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <div class="icon-box">
      <!-- 清除所有已添加的搜索项 -->
      <div v-if="!!searchList.length" class="icon-item">
        <SvgIcon name="transfer-delete" @click.stop="removeSearch" />
      </div>
      <!-- 发起搜索 -->
      <div class="icon-item" @click.stop="addSearchItem">
        <SvgIcon name="search" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { _debounce } from '@/utils/timing-utils'
import { useDomClick } from '@/hooks/use-dom-click'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

// 获取class唯一值区分多个相同组件
const randomClass = `filter-target_dom-${maoYunDayJs().valueOf()}`
/*
  ---------------------- 传参示例 -----------------------

  const getTemplateList: () => Promise<{ label: string, value: string | number }[]> = async () => {
    const params = { ... }
    const res = await getList(params) // 这里是请求数据的方法
    const list = res.data.list;
    return list.map(item => ({ label: item.name, value: item.id }))
  }
  const filterList1: FilterListType[] = [
    { fieldName: 'ID', fieldKey: 'id' },   // 搜索框
    { fieldName: '类型', fieldKey: 'type', fieldType: 'select', getList: getTemplateList },  // 单选下拉框（从接口获取数据，如果不需要从接口获取则传‘list’）
    { fieldName: '多选', fieldKey: 'check', fieldType: 'check', list:
     [
        { label: '多选1', value: 1 },
        { label: '多选2', value: 2 },
        { label: '多选3', value: 3 },
        { label: '多选4', value: 4 },
        { label: '多选5', value: 5 },
      ],
      valueType?: 'string' // 选中项返回值类型，如果传'string' 则返回的值为字符串类型，如果不传则为数组类型
    }  // 多选下拉框
  ]

  // ------------------ 动态添加搜索项示例(请慎用此方式添加) -------------------
  const filterInputRef = ref<any>()

  filterInputRef.value.searchList.push({ fieldName: '名称', fieldKey: 'name', value: '123' })
  或
  filterInputRef.value.searchList.push({ fieldName: '名称', fieldKey: 'name', value: 1， label: '123' }) // 类型为‘select’的筛选项
  或
  filterInputRef.value.searchList.push({ fieldName: '名称', fieldKey: 'name', value: [1,2]， label: ['111', '222'] }) //  类型为‘check’的筛选项
*/

export interface FilterListType {
  fieldName: string // 筛选项的名称
  fieldKey: string // 筛选项的key
  fieldType?: string // 筛选项的类型 可选值 'input'：输入框, 'select'：单选框, 'check'：多选框 为输入框时可不传此字段
  list?: any[] // 筛选项类型为'select'或'check'时 下拉列表的数据 如果没有传'getList'方法则需要传
  getList?: () => Promise<{ label: string; value: string | number }[]> // 筛选项类型为'select'或'check'时 获取下拉列表数据的方法
}

interface PropType {
  filterList: FilterListType[]
  placeholder: string
  optionWidth?: string // 下拉选项宽度
}

const props = withDefaults(defineProps<PropType>(), {
  placeholder: '',
  optionWidth: '',
})

const emits = defineEmits<{
  (event: 'search', params: any): void
}>()

// 已添加的搜索项列表
const searchList = ref<
  {
    fieldName: string // 字段名
    fieldKey: string // 字段对应的key
    value: string | number | string[] | number[] // 字段对应的值
    label?: string | string[] // 类型为‘select’或‘check’时对应已选项的label 为了显示时使用
    valueType?: string // 返回值的类型 只有在筛选项类型为“check”时有用
  }[]
>([])

const searchParams = ref<any>({})

const selectRef = ref<any>()
const selectInputRef = ref<any>()
const selectFilterRef = ref<any>()
const checkFilterRef = ref<any>()
const nextClear = ref<boolean>(false)

const state = reactive<{
  filterArr: FilterListType[] // 筛选项列表
  nowSearch: {
    fieldName: string
    fieldKey: string
    fieldType?: string
    list?: any[]
    value?: string[] | number[]
    valueType?: string
  } | null // 当前搜索项
  selectList: { label: string; value: string | number }[] // 当前搜索项类型为select时 下拉框列表数据
  inputVal: string // 输入框内容
  showList: boolean // 是否显示筛选项下拉框
  top: number // ‘条件筛选下拉框’样式的top值
  width: number // ‘条件筛选下拉框’样式的width值
}>({
  filterArr: [...props.filterList],
  nowSearch: null,
  selectList: [],
  inputVal: '',
  showList: false,
  top: 34,
  width: 200,
})

const domClickCallback = (key: boolean) => {
  if (!key) {
    state.nowSearch = null
    nextClear.value = false
  }
}
useDomClick(`.${randomClass}`, domClickCallback)

// 处理tag显示的内容
const getTagText = item => {
  if (!item.label) {
    return item.value
  }
  if (typeof item.label === 'string') {
    return item.label
  }
  return item.label.join(',')
}

// 更新条‘件筛选下拉框’选项（已经添加的条件筛选项不展示在‘条件筛选下拉框’）
const updateFilterList = () => {
  if (searchList.value.length === 0) {
    state.filterArr = [...props.filterList]
  } else {
    state.filterArr = props.filterList.filter(item => {
      return searchList.value.findIndex(val => val.fieldKey === item.fieldKey) < 0
    })
  }
}

// 搜索项添加成功后执行的方法
const addSearchTermCallback = () => {
  console.log('searchList===>', searchList.value)
  if (!searchList.value.length) {
    state.inputVal = ''
  }
  updateFilterList()
  searchFn()
}

// 点击‘搜索框’的方法
const clickFn = () => {
  selectInputRef.value.focus()
  if (state.nowSearch) {
    state.showList = false
  } else {
    // 获取‘搜索框’的高度（设置‘条件筛选下拉框’的top值）
    state.top = selectRef.value.offsetHeight + 4
    state.width = props.optionWidth ? props.optionWidth : selectRef.value.offsetWidth
    state.showList = true
  }
}

// 计算下拉框显示位置
const calculateLocation = dom => {
  const inputWidth = selectInputRef.value?.offsetWidth
  const filterWidth = dom?.offsetWidth
  if (inputWidth < filterWidth - 55) {
    dom.style.left = inputWidth - filterWidth + 55 + 'px'
  }
}

// 点击‘条件筛选下拉框’选择要筛选的项
const filterSelect = async item => {
  state.nowSearch = item
  if (item?.fieldType === 'select') {
    if (item?.getList) {
      state.selectList = await item.getList()
    } else {
      state.selectList = item?.list || []
    }
    // nextTick(() => {
    //   calculateLocation(selectFilterRef.value)
    // })
  }
  if (item?.fieldType === 'check') {
    if (item?.getList) {
      state.selectList = await item.getList()
    } else {
      state.selectList = item?.list || []
    }
    state.nowSearch = { ...item, value: [] }
    // nextTick(() => {
    //   calculateLocation(checkFilterRef.value)
    // })
  }
  state.showList = false
  selectInputRef.value.focus()
}

// 点击‘发起搜索’icon添加搜索项
const addSearchItem = () => {
  if (!state.nowSearch) return false
  // 如果类型是‘select’不需要点击此按钮发起搜索 直接点击‘select类型的搜索项下拉框’可发起搜索
  if (state.nowSearch?.fieldType === 'select') return false
  if (state.nowSearch?.fieldType === 'check') {
    // 类型是‘check’时需要判断当前是否已选择check列表项
    if ((state.nowSearch.value as any[]).length === 0) return false
    searchList.value.push({
      fieldName: state.nowSearch.fieldName,
      fieldKey: state.nowSearch.fieldKey,
      value: state.nowSearch.value as any[],
      // 这里的label字段是为了在‘已添加的搜索项列表’tag中显示已选值
      label: state.nowSearch.list
        ?.filter(item => (state.nowSearch?.value || [])?.findIndex(val => val === item.value) >= 0)
        .map(item => item.label),
      valueType: state.nowSearch?.valueType,
    })
  } else {
    if (state.inputVal === '') return false
    searchList.value.push({
      ...state.nowSearch,
      value: state.inputVal?.trim(),
    })
  }
  state.nowSearch = null
  nextClear.value = false
  state.inputVal = ''
}

// 删除单个筛选项
const deleteItem = index => {
  searchList.value.splice(index, 1)
}

// 清除筛选列表
const removeSearch = () => {
  searchList.value = []
}

// 选择‘select类型的搜索项下拉框’ 这里选择直接添加搜索项
const selectItemFn = item => {
  if (!state.nowSearch) return false
  searchList.value.push({
    ...state.nowSearch,
    ...item,
  })
  state.nowSearch = null
  nextClear.value = false
  state.inputVal = ''
}

// 如果当前筛选项类型为‘select’或‘check’时，在‘当前搜索项输入框’中输入内容则视为筛选‘select类型的搜索项下拉框’或‘check类型的搜索项下拉框’中的选项
const inputFn = _debounce(el => {
  if (state.nowSearch?.fieldType === 'select' || state.nowSearch?.fieldType === 'check') {
    const val = el?.target?.value || ''
    state.selectList = (state.nowSearch?.list || []).filter(item => item.label.indexOf(val) >= 0)
  }
  // 如果是‘check类型的搜索项下拉框’还会清空已选择的项
  if (state.nowSearch?.fieldType === 'check') {
    state.nowSearch.value = []
  }
}, 300)

// ‘当前搜索项输入框’获取焦点时需要给最外层元素添加类名
const focusFn = () => {
  selectRef.value.classList.add('is-focus')
}

// ‘当前搜索项输入框’失去焦点时需要给最外层元素删除类名
const blurFn = () => {
  selectRef.value.classList.remove('is-focus')
  // 处理点击‘搜索框’外部时隐藏‘条件筛选下拉框’，（这里不加setTimeout会导致选择‘条件筛选下拉框’时不能成功添加搜索项）
  setTimeout(() => {
    if (!state.nowSearch) {
      state.showList = false
    }
  }, 300)
}

// input输入框点击删除时触发(删除搜索条件)
const deleteFn = () => {
  if (state.inputVal.length > 0) return
  else if (state.inputVal.length === 0 && !nextClear.value) return (nextClear.value = true)
  else {
    state.nowSearch = null
    nextClear.value = false
  }
}

// 点击多选框取消按钮的执行方法
const cancelClickFn = () => {
  state.nowSearch = null
  nextClear.value = false
}

// 搜索的方法
const searchFn = () => {
  const params = {}
  searchList.value.forEach(item => {
    // 如果筛选类型为'check'需要返回的结果是"string"类型，则需将筛选结果处理为'string'类型
    params[item.fieldKey] =
      item?.valueType === 'string' && Array.isArray(item.value)
        ? (item.value as string[] | number[]).join(',')
        : item.value
  })
  searchParams.value = params
  emits('search', params)
}

// 监听搜索项列表变化，这里是有watch是为了外部改变searchList时能够执行搜索的方法
watch(searchList, addSearchTermCallback, { deep: true })

defineExpose({
  searchList,
  searchParams,
  updateFilterList,
})
</script>
<style lang="scss" scoped>
.select-input {
  position: relative;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  min-width: 550px !important;
  height: auto;

  // min-width: 650px !important;
  padding-right: 55px;
  padding-left: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;

  &.is-focus {
    border-color: #409eff;
  }

  .icon-box {
    position: absolute;
    right: 7px;
    bottom: 0;
    display: flex;
    align-items: center;
    height: 34px;

    .icon-item {
      height: 34px;
      padding: 0 5px;
      line-height: 34px;
      cursor: pointer;
    }
  }

  .filter-list {
    position: absolute;
    top: 34px;
    left: 0;
    z-index: 1025;
    min-width: 200px;
    padding: 8px;
    background-color: #fff;
    box-shadow:
      0 9px 28px 8px rgb(0 0 0 / 5%),
      0 6px 16px 0 rgb(0 0 0 / 8%),
      0 3px 6px -4px rgb(0 0 0 / 12%);

    .filter-item {
      width: 100%;
      width: 260px;
      height: 34px;
      padding: 0 10px;
      margin-top: 2px;
      margin-bottom: 2px;
      font-size: 14px;
      line-height: 34px;
      cursor: pointer;

      &:hover {
        width: 100%;
        color: #0063ff;
        background: #f1f7ff;
      }
    }

    .line {
      height: 1px;
      margin-top: 7px;
      margin-bottom: 7px;
      background: var(--border-c);
    }

    .btn-wrap {
      padding-right: 20px;
    }
  }

  .now-seacth-name {
    margin-right: 10px;
    white-space: nowrap;
  }

  .select__input_parent {
    display: inline-block;
    flex: 1;

    // position: relative;
  }

  .el-select_content {
    position: relative;
    display: flex;

    // flex-wrap: wrap;
    flex-wrap: nowrap;
    align-items: center;

    // width: 600px;
    width: 420px;

    .select_tags-list {
      position: relative;
      left: -6px;
      display: flex;
      max-width: 550px;
      overflow-x: hidden;
    }

    .select_tags-item {
      display: inline-flex;
      align-items: center;
      margin: 2px 6px 2px 0 !important;

      :deep(.el-tag__content) {
        position: relative;
        display: inline-block;
        max-width: 90px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .el-select__input {
    width: 100%;
    height: 32px;
    padding: 0;
    margin-left: 0;
    font-size: 14px;
    line-height: 32px;
    color: #666;
    appearance: none;
    background-color: transparent;
    border: none;
    outline: none;

    &::placeholder {
      color: #ccc;
    }
  }

  .el-tag {
    box-sizing: border-box;
    display: inline-block;
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
    line-height: 30px;
    color: #409eff;
    white-space: nowrap;
    background-color: #ecf5ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;
  }

  .select-checkbox {
    max-height: 450px;
    overflow-y: auto;

    :deep(.el-checkbox) {
      display: flex;
      align-items: center;
      min-width: calc(100% - 20px);
      padding: 7px 10px;
      cursor: pointer;

      &:hover {
        background-color: #f1f7ff;
      }
    }
  }
}
</style>
