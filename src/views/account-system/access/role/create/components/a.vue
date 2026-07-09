<template>
  <div class="a-wrap pd20">
    <div class="df jc">
      <!-- 选择策略 -->
      <el-row class="w50p">
        <el-col :span="24">
          <div class="title mb10">
            <span>{{ t('role.selectStrategy') }}</span>
            <span>({{ t('role.selectStrategyNum', [strategyList.length]) }})</span>
          </div>
          <div class="left-list-wrap">
            <div class="search-wrap">
              <el-input v-model.trim="condition" maxlength="30" :placeholder="t('role.createSearchPlaceholder')" />
            </div>
            <!-- 不做分页 滚动 -->
            <el-table
              ref="tableLeftRef"
              v-loading="loading"
              height="320px"
              :data="strategyList"
              header-row-class-name="header-row"
              :row-class-name="tableRowClassName"
              show-overflow-tooltip
              @selection-change="handleRowSelectChange"
            >
              <el-table-column type="selection" />
              <el-table-column prop="strategyName" :label="t('strategy.strategyName')" width="200" />
              <el-table-column prop="description" :label="t('strategy.description')" />
            </el-table>
          </div>
        </el-col>
      </el-row>
      <!-- switch -->
      <el-row class="switch-wrap ml14 mr14 df ac">
        <div>
          <span>
            <SvgIcon :style="switchStyle" class="mb10" name="form-left" />
          </span>
          <span>
            <SvgIcon :style="switchStyle" name="form-right" />
          </span>
        </div>
      </el-row>

      <!-- 已选择 -->
      <el-row class="w50p">
        <el-col :span="24">
          <div class="title mb10">
            <span>{{ t('role.alreadySelectStrategy', [selectStrategyList.length]) }}</span>
          </div>
          <div class="right-list-wrap">
            <el-table
              v-loading="loading"
              height="320px"
              :data="selectStrategyList"
              header-row-class-name="header-row"
              :row-class-name="'row'"
              show-overflow-tooltip
            >
              <el-table-column prop="strategyName" :label="t('strategy.strategyName')" width="200" />
              <el-table-column prop="description" :label="t('strategy.description')" />
              <!-- 操作 -->
              <el-table-column prop="number" align="right">
                <template #default="{ row }">
                  <!-- 删除 -->
                  <el-icon @click="deleteSelectRowList(row)">
                    <CircleCloseFilled />
                  </el-icon>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="btn-wrap">
      <el-button @click="backRoute()">
        {{ t('common.back') }}
      </el-button>
      <el-button type="primary" @click="next">
        {{ t('common.next') }}
      </el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { _getStrategyList } from '@/apis/account-system/access/strategy'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { backRoute } from '@/utils/router-jump'

const emits = defineEmits<{
  (event: 'changeStep', stepStatus: string): void
  (event: 'changeStrategy', ids: string[], list: any[]): void
}>()

const switchStyle = {
  width: '24px',
  height: '24px',
}

const tableLeftRef = ref<any>(null)
const strategyList = ref<any[]>([]) // 策略列表
const condition = ref<string>('') // 查询条件
const loading = ref<boolean>(false)
const selectStrategyList = ref<any[]>([]) // 选中的策略列表

// table left 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectStrategyList.value = selection
}

// 设置row类名
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  return selectStrategyList.value.includes(row) ? 'select-row row' : 'row'
}

// 策略列表
const getStrategyList = async () => {
  try {
    loading.value = true
    const res = await _getStrategyList({
      pageIndex: 1,
      pageSize: 9999,
      condition: condition.value,
    })

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      strategyList.value = res.data?.list || []
    } else {
      strategyList.value = []
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// table right 删除当前行
const deleteSelectRowList = (row: any) => {
  console.log(`deleteSelectRowList===>`, row)

  const i = selectStrategyList.value.findIndex(el => el.id === row.id)

  console.log(`deleteSelectRowList===>`, i)

  // 删除table right
  if (i !== -1) {
    selectStrategyList.value.splice(i, 1)
  }
  // 删除table left
  tableLeftRef.value?.toggleRowSelection(row)
}

// 下一步
const next = () => {
  if (selectStrategyList.value.length) {
    const ids = selectStrategyList.value.map(el => el.id)

    emits('changeStep', 'b')
    emits('changeStrategy', ids, selectStrategyList.value)
  } else {
    message.warning(t('role.deleteStrategyWarn'))
  }
}

// 条件
watch(condition, () => {
  getStrategyList()
})

onMounted(() => {
  getStrategyList()
})
</script>

<style lang="scss" scoped>
:deep(.el-table) {
  --el-table-row-hover-bg-color: var(--selected-bgc);

  .el-table__inner-wrapper::before {
    background: transparent !important;
  }

  .header-row {
    background-color: #fff;

    .el-table__cell {
      /* border-width: 0px; */
      background-color: #fff !important;
    }
  }

  // 选中row
  .select-row {
    td {
      .cell {
        color: var(--primary-color);

        /* background: var(--el-table-current-row-bg-color); */
        background: var(--selected-bgc) !important;
      }
    }
  }

  .row {
    height: 38px;

    &:hover {
      background: var(--selected-bgc) !important;
    }

    .el-table__cell {
      height: 34px;
      border-width: 0;

      .cell {
        width: 100% !important;
        height: 34px;
        line-height: 34px !important;
      }
    }
  }
}

:deep(.el-scrollbar) {
  .el-scrollbar__wrap {
    height: 100% !important;
  }
}

.a-wrap {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--primary-text);
  }

  .left-list-wrap,
  .right-list-wrap {
    box-sizing: border-box;

    /* width: 360px; */
    height: 372px;
    padding: 11px;
    border: 1px solid var(--border-c);
    border-radius: 4px;
  }

  .switch-wrap {
    /* margin-left: ; */
  }

  .btn-wrap {
    margin-top: 40px;
  }

  .w50p {
    min-width: 50%;

    .mt15 {
      margin-top: 15px;
    }
  }
}
</style>
