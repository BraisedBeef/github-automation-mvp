<template>
  <div class="batch-operaion-log">
    <!-- 日志列表 -->
    <template v-if="state.type === 1">
      <div class="batch-operaion-log-type-1">
        <div class="batch-operaion-log-type-1-header">
          <SvgIcon name="tip-info" />
          {{ t('batchOperation.logTip') }}
        </div>
        <div class="batch-operaion-log-type-1-table-wrap">
          <TableV2
            v-model:pagination="state.pagination"
            v-loading="state.loading"
            :data="state.tableData"
            :total="state.total"
            row-key="id"
            show-pagination
            :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
            @change="getData"
          >
            <el-table-column
              v-for="item in type1columns"
              :key="item.prop"
              :prop="item.prop"
              :label="item.label"
              :class="item.prop"
              :width="item.width"
              :fixed="item.fixed"
              :show-overflow-tooltip="item.tooltip"
            >
              <template #header>
                <div class="custom-table-header">
                  {{ item.label }}
                  <template v-if="item.prop === 'createTime'">
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" class="ml5" />
                    </el-tooltip>
                  </template>
                </div>
              </template>
              <template #default="{ row }">
                <template v-if="item.prop === 'taskName'">
                  {{ t(row.taskType) }}
                </template>
                <div v-else-if="item.prop === 'result'">
                  {{
                    t('batchOperation.sucessCount', { success: row.success }) +
                    ', ' +
                    t('batchOperation.failCount', { fail: row.fail })
                  }}
                </div>
                <!-- 操作时间 -->
                <div v-else-if="item.prop === 'createTime'">
                  {{ maoYunDayJs(row.createTime).format(FORMAT_TIME) }}
                </div>
                <div v-else-if="item.prop === 'handle'">
                  <el-link type="primary" @click="type1RowClick(row)">
                    {{ t('batchOperation.detail') }}
                  </el-link>
                </div>
              </template>
            </el-table-column>
          </TableV2>
        </div>
      </div>
    </template>
    <!-- 操作结果展示 -->
    <template v-else>
      <div class="batch-operaion-log-type-2">
        <div class="batch-operaion-log-type-2-header">
          <div class="back-btn" @click="() => (state.type = 1)">
            <SvgIcon name="sub-back" pointer />
            <!-- {{ t("common.back") }} -->
            {{ t('batchOperation.back') }}{{ t(state.task.taskType) }}
          </div>

          <div class="time">
            {{ maoYunDayJs(state.task.createTime).format(FORMAT_TIME) + ' ' }}
          </div>
          <div class="type">{{ t(state.task.taskType) }}：</div>
          <div class="hand">
            <!-- 操作s条 -->
            <div>
              {{ t('batchOperation.taskTotal') }}
              <span class="t-total">{{ state.task.total }}</span>
              {{ t('batchOperation.taskUnit') }}
            </div>
            <!-- 成功x条 -->
            <div>
              {{ t('batchOperation.taskSuccess') }}
              <span class="t-success">{{ state.task.success }}</span>
              {{ t('batchOperation.taskUnit') }}
            </div>
            <!-- 失败y条 -->
            <div>
              {{ t('batchOperation.taskFail') }}
              <span class="t-fail">{{ state.task.fail }}</span>
              {{ t('batchOperation.lastTaskUnit') }}
            </div>
          </div>
        </div>
        <div class="batch-operaion-log-type-2-table-wrap">
          <CollapseTable
            :columns="computedColumns === 1 ? type2columns1 : type2columns2"
            :table-data="state.filterDetailData"
            :custom-item-width="computedColumns === 1 ? [] : type2columns2Width"
            class="custom-collaspe"
            open
            auto
            is-children
          >
            <template #header="{ row }">
              <template v-if="row.prop === 'status'">
                <el-dropdown trigger="hover" popper-class="re-down" @command="handleCommand">
                  <span class="opt-filter">
                    {{ t('columns.optResult') }}
                    <SvgIcon name="header-filter" />
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="1">
                        {{ t('common.all') }}
                      </el-dropdown-item>
                      <el-dropdown-item command="2">
                        {{ t('common.processing') }}
                      </el-dropdown-item>
                      <el-dropdown-item command="3">
                        {{ t('common.success') }}
                      </el-dropdown-item>
                      <el-dropdown-item command="4">
                        {{ t('common.fail') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </template>
            <!-- 需要在父级显示状态: BATCH_ADD_DOMAIN    BATCH_DELETE_DOMAIN -->
            <!-- 不需要显示状态: BATCH_ADD_ANALYSIS    BATCH_MODIFY_ANALYSIS -->
            <template #default="{ item, row }">
              <div v-if="item.prop === 'status'" class="table-status">
                <template v-if="['BATCH_ADD_DOMAIN', 'BATCH_DELETE_DOMAIN'].includes(state.task.taskType)">
                  <!-- 圆点 -->
                  <span :class="type2StatusOption.find(item => item.value === row.status)?.class" />
                  <!-- 文字 -->
                  {{ type2StatusOption.find(item => row.status === item.value)?.label }}
                  <!-- 原因 -->
                  <el-tooltip
                    v-if="row.status !== 1"
                    :content="row.reason"
                    popper-class="cat-tooltip-popper"
                    placement="top"
                  >
                    <SvgIcon name="tip-error" />
                  </el-tooltip>
                </template>
              </div>
            </template>
            <!-- 线路类型回显 -->
            <template #open_item="{ item, row }">
              <div v-if="item.prop === 'lineType'">
                {{ _matchRouteType(row.lineTypeId, state.lineTypes)?.lineName }}
              </div>
              <!-- 状态 -->
              <div v-else-if="item.prop === 'status'" class="table-status">
                <!-- 圆点 -->
                <span :class="type2StatusOption.find(item => item.value === row.status)?.class" />
                <!-- 文字 -->
                {{ type2StatusOption.find(item => item.value === row.status)?.label }}
                <!-- 原因 -->
                <el-tooltip
                  v-if="row.status === 2"
                  :content="row.reason"
                  popper-class="cat-tooltip-popper"
                  placement="top"
                >
                  <SvgIcon name="tip-error" />
                </el-tooltip>
              </div>
            </template>
          </CollapseTable>
        </div>
        <div v-if="false" class="batch-operaion-log-type-2-handle">
          <el-button type="primary" @click="() => (state.type = 1)">
            {{ t('batchOperation.backToLog') }}
          </el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { type1columns, type2columns1, type2columns2, type2StatusOption, type2columns2Width } from './config'
import { _getHandleLog, _getHandleLogDetail } from '@/apis/dns/batch'
import { _formatRouteType, _matchRouteType } from '@/utils/dns-utils'
import { _getLineTypes } from '@/apis/dns/sys'
import t from '@/utils/i18n'
import { _deepClone } from '@/utils/collection-utils'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
const route = useRoute()
const state = reactive<{
  type: 1 | 2
  loading: boolean
  pagination: Pager
  total: number
  tableData: any[]
  detailData: any[]
  filterDetailData: any[]
  isMeanwhile: boolean
  task: any
  lineTypes: any[]
}>({
  type: 1, // 1: 日志列表 2: 某一条的操作结果展示
  loading: false,
  pagination: {
    page: 1,
    pageSize: 10,
  },
  total: 0,
  tableData: [],
  detailData: [],
  filterDetailData: [],
  isMeanwhile: true, // 用来判断数据里面是否有@和www这种
  task: {},
  lineTypes: [],
})
/************************ type1 methods start **********************************/
const type1RowClick = (row: any) => {
  getDataDetail(row.taskId)
}

// 获取列表
const getData = async () => {
  try {
    state.loading = true
    const { code, data } = await _getHandleLog(state.pagination)
    state.loading = false
    if (code === 200) {
      const { list, total } = data

      state.total = total || 0
      state.tableData = list || []
    }
  } catch (error) {
    state.loading = false
  }
}
/************************ type1 methods end **********************************/

/************************ type2 methods start **********************************/
// 判断用哪个columns
const computedColumns = computed(() => {
  // 添加域名: 如果添加域名没有勾选同时添加a和www记录
  // 删除域名
  if (state.task.taskType === 'BATCH_DELETE_DOMAIN') {
    return 1
  } else if (state.task.taskType === 'BATCH_ADD_DOMAIN') {
    if (state.detailData[0].children[0]) {
      return 2
    } else {
      return 1
    }
  } else {
    return 2
  }
})

// 筛选操作日志详情
const handleCommand = (command: '1' | '2' | '3' | '4') => {
  let data: any[] = []
  const shadowDetail = _deepClone(state.detailData)
  const isRecord = state.task.taskType === 'BATCH_ADD_ANALYSIS' || state.task.taskType === 'BATCH_MODIFY_ANALYSIS'
  switch (command) {
    case '1':
      data = shadowDetail.filter(item => item)
      break
    case '2':
      data = shadowDetail.filter(item => {
        if (item.children) {
          item.children = item.children.filter(citem => citem.status === 0)
        }
        return isRecord ? item : item.status === 0
      })
      break
    case '3':
      data = shadowDetail.filter(item => {
        if (item.children) {
          item.children = item.children.filter(citem => citem.status === 1)
        }
        return isRecord ? item : item.status === 1
      })
      break
    case '4':
      data = shadowDetail.filter(item => {
        if (item.children) {
          item.children = item.children.filter(citem => citem.status === 2)
          console.log('children', item.children)
        }
        return isRecord ? item : item.status === 2
      })
      break
    default:
      data = state.detailData.filter(item => item)
      break
  }
  state.filterDetailData = data
  // console.log("筛选后", state.detailData, state.filterDetailData);
}

// 获取操作日志详情
const getDataDetail = async (taskId: string) => {
  try {
    state.loading = true
    state.detailData = []
    const { code, data } = await _getHandleLogDetail({ taskId })
    state.loading = false

    if (code === 200) {
      const { list, task } = data
      state.task = task || {}
      // ps: 如果任务成功数+任务失败数 ！== 总数, 将所有状态改为执行中
      const isProcessing = task.success + task.fail !== task.total
      console.log('是否执行中', isProcessing, state.task)
      list &&
        list.forEach((item: any) => {
          if (isProcessing) {
            item.status = 3
          }
          !item.parentId && state.detailData.push(item)
        })
      state.detailData = list
        .filter((item: any) => !item.parentId)
        .map((item: any) => ({
          children: [],
          id: item.id,
          hostRecord: item.domain,
          status: item.status,
          reason: item.reason,
        }))
      const childArr = list.filter((item: any) => item.parentId !== 0)
      if (state.detailData.length === 1) {
        state.detailData[0].children = childArr
      } else {
        state.detailData.forEach(item => {
          childArr.forEach((citem: any) => {
            if (citem.parentId === item.id) {
              item.children.push(citem)
            }
          })
        })
      }
      handleCommand('1')
      console.log('详情', state.detailData)

      state.type = 2
    }
  } catch (error) {
    state.loading = false
  }
}

// 获取线路列表
const getLineTypes = async () => {
  try {
    state.loading = true
    const { code, data } = await _getLineTypes()
    if (code === 200) {
      state.lineTypes = data ? _formatRouteType(data) : []
    }
    state.loading = false
  } catch (error) {
    console.log('线路error', error)
    state.loading = false
  }
}

/************************ type2 methods end **********************************/

onMounted(() => {
  getData()
  getLineTypes()
  const { type, jobId } = route.query
  if (Number(type) === 2) {
    state.type === 2
    getDataDetail(jobId as string)
  }
})
</script>

<style scoped lang="scss">
.batch-operaion-log {
  & > div {
    width: 100%;
    height: 100%;
  }

  .batch-operaion-log-type-1 {
    .batch-operaion-log-type-1-header {
      display: flex;
      align-items: center;
      height: var(--input-height);
      padding: 0 12px;
      margin-bottom: 20px;
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;

      /* border-radius: 4px; */
      color: var(--primary-color);
      background-color: var(--info-box-bgc);

      svg {
        width: 16px;
        height: 16px;
        margin-right: 10px;
        color: var(--primary-color);
      }
    }
  }

  .batch-operaion-log-type-2 {
    .batch-operaion-log-type-2-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      margin-left: -2px;
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--table-text);

      .back-btn {
        display: flex;
        align-items: center;
        margin-right: 40px;
        color: var(--primary-text);
        cursor: pointer;

        svg {
          width: 16px;
          height: 16px;
          margin-right: 4px;
          color: var(--primary-color);
        }
      }

      .time {
        margin-right: 8px;
        color: #555;
      }

      .type {
        color: #555;
      }

      .hand {
        display: flex;
        font-size: 14px;
        font-weight: 400;
        color: #000;

        & > div {
          margin-right: 8px;
        }
      }

      .t-total {
        color: var(--primary-color);
      }

      .t-success {
        color: var(--success-color);
      }

      .t-fail {
        color: var(--error-color);
      }
    }

    .batch-operaion-log-type-2-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 40px;

      .el-button {
        padding: 0 36px;
      }
    }
  }
}

.table-status {
  display: flex;
  align-items: center;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: var(--table-text);

  span {
    width: 6px;
    height: 6px;
    margin-right: 5px;
    border-radius: 50%;

    &.success {
      background-color: var(--success-color);
    }

    &.error {
      background-color: var(--error-color);
    }

    &.warning {
      background-color: var(--warning-color);
    }
  }

  svg {
    width: 14px;
    height: 14px;
    margin-left: 4px;
  }
}

.opt-filter {
  font-family: 'PingFang SC', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--common-text);

  svg {
    width: 14px;
    height: 14px;
    color: #999;
  }
}

.ml5 {
  margin-left: 5px;
}
</style>
