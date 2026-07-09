<template>
  <el-select ref="selectRef" v-model="showText" :disabled="props.loading" @visible-change="visibleHandle">
    <template #empty>
      <div class="transfer-container">
        <div class="transfer-body">
          <div class="content-left mr20">
            <el-input v-model="searchValue" :placeholder="t('components.search')" clearable @input="searchHandle" />
            <el-table ref="queryTableRef" :data="queryTable" max-height="300" class="mt20" style="height: 300px">
              <el-table-column prop="check" width="40">
                <template #header>
                  <div class="df ac"><el-checkbox v-model="checkAll" @change="checkAllHandle" />&nbsp;</div>
                </template>
                <template #default="{ row }">
                  <div class="df ac">
                    <el-checkbox
                      v-model="row.check"
                      @change="
                        v => {
                          checkItem(row, v)
                        }
                      "
                    />&nbsp;
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="domain" :label="t('batchOperation.allDomains')" show-overflow-tooltip>
                <template #default="{ row }">
                  <div style="display: inline-block">
                    <div class="df ac">
                      <div class="mr10">
                        {{ row.domain }}
                      </div>
                      <el-text v-show="row.status === 6" type="info"> ({{ t('deleted') }}) </el-text>
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="content-right">
            <div class="df ac jsb">
              <div class="mr20">{{ t('components.selected') }} ({{ selectedTable.length }})</div>
              <el-button :disabled="!selectedTable.length" plain @click="clearAll">
                {{ t('components.clearAll') }}
              </el-button>
            </div>
            <el-table :data="selectedTable" max-height="300" class="mt20" style="height: 300px">
              <el-table-column prop="domain" :label="t('batchOperation.selectedDomains')" show-overflow-tooltip />
              <el-table-column width="50">
                <template #default="{ row, $index }">
                  <SvgIcon name="cat-cdn-delete" class="icon-hover" @click="handleDelete(row, $index)" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="content-footer">
          <el-button type="primary" :loading="loading" @click="confirm"> 确定 </el-button>
          <el-button :disabled="loading" plain @click="cancel"> 取消 </el-button>
        </div>
      </div>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'

const props = defineProps<{
  loading: boolean
  modelValue: any[]
  list: any[]
}>()

const emit = defineEmits<{ (event: 'update:modelValue', domain_ids: any[]): void }>()

const rawTable = ref<any[]>([])
const queryTable = ref<any[]>([])
const selectedTable = ref<any[]>([])

const queryTableRef = ref<any>(null)

// ids 回显
watch(
  () => props.modelValue,
  n => {
    selectedTable.value = rawTable.value.filter(v => n.includes(v.id))
    if (selectedTable.value.length === rawTable.value.length) {
      checkAll.value = true
    } else {
      checkAll.value = false
    }

    queryTable.value.forEach(v => {
      if (n.includes(v.id)) {
        v.check = true
      } else {
        v.check = false
      }
    })
  },
)

watch(
  () => props.list,
  n => {
    const list = n.map(v => ({ ...v, check: true }))
    if (n.length > 0) {
      checkAll.value = true
    } else {
      checkAll.value = false
    }
    rawTable.value = list
    queryTable.value = list
    selectedTable.value = JSON.parse(JSON.stringify(list))
    emit(
      'update:modelValue',
      rawTable.value.map(v => v.id),
    )
  },
)

const checkAll = ref<boolean>(false)
const checkAllHandle = v => {
  queryTable.value.forEach(row => (row.check = v))
  selectedTable.value = rawTable.value.filter(v => v.check)
  emit(
    'update:modelValue',
    selectedTable.value.map(v => v.id),
  )
}
const checkItem = (row, v) => {
  row.check = v
  if (row.check) {
    selectedTable.value.push(row)
  } else {
    selectedTable.value = queryTable.value.filter(v => v.check)
  }
  if (rawTable.value.every(v => v.check)) {
    checkAll.value = true
  } else {
    checkAll.value = false
  }
  emit(
    'update:modelValue',
    selectedTable.value.map(v => v.id),
  )
}

const searchValue = ref('')
const searchHandle = () => {
  queryTable.value = rawTable.value.filter(v => v.domain.includes(searchValue.value))
  if (rawTable.value.every(v => v.check)) {
    checkAll.value = true
  } else {
    checkAll.value = false
  }
}

const clearAll = () => {
  queryTable.value.forEach(v => {
    v.check = false
  })
  checkAll.value = false
  selectedTable.value = []
  emit(
    'update:modelValue',
    selectedTable.value.map(v => v.id),
  )
}

const handleDelete = (row, i) => {
  selectedTable.value.splice(i, 1)
  queryTable.value.find(v => {
    if (v.id === row.id) {
      v.check = false
    }
  })
  if (queryTable.value.every(v => v.check)) {
    checkAll.value = true
  } else {
    checkAll.value = false
  }
  emit(
    'update:modelValue',
    selectedTable.value.map(v => v.id),
  )
}

const showText = computed(() => {
  if (selectedTable.value.length === 0) {
    return t('components.selectDomainPlaceholder')
  }
  if (rawTable.value.length === selectedTable.value.length) {
    return t('batchOperation.allDomains')
  } else {
    return t('components.selectedDomains', { count: selectedTable.value.length })
  }
})

const selectRef = ref<any>(null)
const confirm = () => {
  emit(
    'update:modelValue',
    selectedTable.value.map(v => v.id),
  )
  selectRef.value.visible = false
}
const cancel = () => {
  emit(
    'update:modelValue',
    selectedTable.value.map(v => v.id),
  )
  selectRef.value.visible = false
}

const visibleHandle = v => {
  searchValue.value = ''
  queryTable.value = rawTable.value
}
</script>

<style scoped lang="scss">
.transfer-container {
  display: flex;
  flex-direction: column;
  width: 800px;
  padding: 10px;
}

.transfer-body {
  display: flex;

  :deep(.el-table .el-table__inner-wrapper .cell) {
    padding: 0 10px;
  }

  :deep(.el-table .el-table__empty-block) {
    min-height: 40.5px;
    padding: 10px 0;

    .el-table__empty-text {
      line-height: 1;
    }
  }

  .content-left,
  .content-right {
    flex: 1;
    width: 0;
  }
}

.content-footer {
  padding-top: 20px;
  padding-bottom: 10px;
  text-align: center;

  .el-button {
    width: 80px;
  }
}
</style>
