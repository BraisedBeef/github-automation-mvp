<template>
  <section class="cvm-ins-log-v2">
    <div class="cvm-ins-log-v2__toolbar">
      <BtnsGroup
        v-model="btnValue"
        :list="btnsGroupList"
        :style="{
          width: '100px',
        }"
        @change-value="changeDate"
      />

      <div class="cvm-ins-log-v2__date">
        <div class="cvm-ins-log-v2__date-label">
          <span>{{ t('common.select_time') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
        </div>

        <el-date-picker
          v-model="dateTime"
          class="cvm-ins-log-v2__picker"
          type="daterange"
          start-placeholder=""
          end-placeholder=""
          :shortcuts="shortcuts"
          :range-separator="t('export.to')"
          :clearable="false"
          value-format="YYYY-MM-DD"
        />
      </div>
    </div>

    <TableV2
      v-model:pagination="paginationConfig.pagination"
      v-loading="loading"
      :data="list"
      :total="paginationConfig.total"
      :empty-min-height="280"
      show-pagination
      @change="paginationChange"
    >
      <el-table-column min-width="220">
        <template #header>
          <div class="cvm-ins-log-v2__th">
            <span>{{ t('disk.log.optTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="cvm-ins-log-v2__th-icon" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row?.updateTime ? maoYunDayJs(row?.updateTime).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>

      <el-table-column min-width="180" :label="t('disk.log.optName')">
        <template #default="{ row }">
          {{ row.operateName || '-' }}
        </template>
      </el-table-column>

      <el-table-column min-width="180" :label="t('disk.log.opts')">
        <template #default="{ row }">
          {{ row.operate || '-' }}
        </template>
      </el-table-column>

      <el-table-column min-width="200" :label="t('disk.log.optUser')">
        <template #default="{ row }">
          {{ row.userName || '-' }}
        </template>
      </el-table-column>

      <el-table-column min-width="160" :label="t('disk.log.optRes')">
        <template #default="{ row }">
          <span v-if="row.state == 1" class="cvm-ins-log-v2__result cvm-ins-log-v2__result--primary">
            {{ LOG_STATE_MAP[row.state] }}
          </span>
          <span v-else-if="row.state == 2" class="cvm-ins-log-v2__result cvm-ins-log-v2__result--success">
            {{ LOG_STATE_MAP[row.state] }}
          </span>
          <span v-else-if="row.state == 3" class="cvm-ins-log-v2__result cvm-ins-log-v2__result--error">
            {{ LOG_STATE_MAP[row.state] }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </TableV2>
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { IPagination } from '@/views/account-system/type'
import { _operateLogList } from '@/apis/cvm/disk'
import { maoYunDayJs, ManipulateType, FORMAT_TIME, FORMAT_DAY_NO_UTC } from '@/utils/mao-yun-day-js'
import { LOG_STATE_MAP } from '@/views/cvm/disk/config'

interface PropType {
  detail: any
  operateType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
}

const props = withDefaults(defineProps<PropType>(), {
  detail: () => ({}),
})

const getDateTime = (value: number, unit: ManipulateType) => {
  const end = maoYunDayJs()
  const start = end.subtract(value, unit)
  return [start.format(FORMAT_DAY_NO_UTC), end.format(FORMAT_DAY_NO_UTC)]
}

const btnsGroupList = [
  {
    label: t('disk.log.3d'),
    value: '3d',
  },
  {
    label: t('disk.log.7d'),
    value: '7d',
  },
]

const shortcuts = [
  {
    text: t('disk.log.3dLast'),
    value: () => getDateTime(3, 'day'),
  },
  {
    text: t('order.oneWeek'),
    value: () => getDateTime(1, 'week'),
  },
  {
    text: t('order.oneMonth'),
    value: () => getDateTime(1, 'month'),
  },
  {
    text: t('order.threeMonth'),
    value: () => getDateTime(3, 'month'),
  },
]

const defaultTime = shortcuts[0].value()
const dateTime = ref<any>(defaultTime)
const list = ref<any[]>([])
const loading = ref(false)

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const btnValue = ref<any>({
  label: t('disk.log.3d'),
  value: '3d',
})

const changeDate = v => {
  if (v.value === '3d') {
    dateTime.value = shortcuts[0].value()
  } else {
    dateTime.value = shortcuts[1].value()
  }
}

const paginationChange = () => {
  operateLogList()
}

const operateLogList = async () => {
  try {
    loading.value = true
    const startTime = dateTime.value[0]
    const endTime = dateTime.value[1]

    const res = await _operateLogList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      resourceId: props.detail.id,
      operateType: props.detail.operateType,
      startTime,
      endTime,
    })

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

watch(dateTime, () => {
  const startTime = dateTime.value[0]
  const endTime = dateTime.value[1]
  const diffDays = maoYunDayJs(endTime).diff(maoYunDayJs(startTime), 'day')

  if (diffDays === 3) {
    btnValue.value = btnsGroupList[0]
  } else if (diffDays === 7) {
    btnValue.value = btnsGroupList[1]
  } else {
    btnValue.value = {}
  }

  paginationConfig.pagination.page = 1
  operateLogList()
})

onMounted(() => {
  operateLogList()
})
</script>

<style lang="scss" scoped>
.cvm-ins-log-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-log-v2__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
}

.cvm-ins-log-v2__date {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.cvm-ins-log-v2__date-label {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #191c23;
}

.cvm-ins-log-v2__picker {
  width: 260px;
}

.cvm-ins-log-v2__th {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-ins-log-v2__th-icon {
  color: #8b95a7;
}

.cvm-ins-log-v2__result {
  font-weight: 500;
}

.cvm-ins-log-v2__result--primary {
  color: #06f;
}

.cvm-ins-log-v2__result--success {
  color: #23b26d;
}

.cvm-ins-log-v2__result--error {
  color: #f04438;
}

@media (width <= 768px) {
  .cvm-ins-log-v2 {
    padding: 16px;
  }

  .cvm-ins-log-v2__toolbar,
  .cvm-ins-log-v2__date {
    align-items: flex-start;
  }

  .cvm-ins-log-v2__picker {
    width: 100%;
  }
}

:deep(.btn-wrap .btn:first-child) {
  border-radius: 0 !important;
}

:deep(.btn-wrap .btn:last-child) {
  border-radius: 0 !important;
}
</style>
