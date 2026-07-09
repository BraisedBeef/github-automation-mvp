<template>
  <el-card shadow="never" class="page-box mb20" :body-style="bodyStyle">
    <div class="df ac">
      <BtnsGroup
        v-model="btnValue"
        :list="btnsGroupList"
        :style="{
          width: '100px',
        }"
        @change-value="changeDate"
      />

      <div class="df ac">
        <div class="df ac">
          <span class="mr10">{{ t('common.select_time') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" />
          </el-tooltip>
        </div>
        <!-- 日期选择范围 -->
        <el-date-picker
          v-model="dateTime"
          style="width: 260px"
          class="ml10"
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

    <el-table v-loading="loading" :data="list" class="mt20 table">
      <!-- 操作时间 -->
      <el-table-column min-width="220" :label="t('disk.log.optTime')">
        <template #header>
          <div class="df ac">
            <span>{{ t('disk.log.optTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <div>{{ row?.updateTime ? maoYunDayJs(row?.updateTime).format(FORMAT_TIME) : '-' }}</div>
        </template>
      </el-table-column>
      <!-- 操作名称 -->
      <el-table-column min-width="200" :label="t('disk.log.optName')">
        <template #default="{ row }">
          <div>{{ row.operateName || '-' }}</div>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column min-width="200" :label="t('disk.log.opts')">
        <template #default="{ row }">
          <div>{{ row.operate || '-' }}</div>
        </template>
      </el-table-column>
      <!-- 操作者 -->
      <el-table-column min-width="200" :label="t('disk.log.optUser')">
        <template #default="{ row }">
          <div>{{ row.userName || '-' }}</div>
        </template>
      </el-table-column>
      <!-- 操作结果 -->
      <el-table-column min-width="200" :label="t('disk.log.optRes')">
        <template #default="{ row }">
          <div>
            <!-- 执行中 -->
            <span v-if="row.state == 1" class="text-primary">{{ LOG_STATE_MAP[row.state] }}</span>
            <!-- 成功 -->
            <span v-if="row.state == 2" class="text-success">{{ LOG_STATE_MAP[row.state] }}</span>
            <!-- 失败 -->
            <span v-if="row.state == 3" class="text-error">{{ LOG_STATE_MAP[row.state] }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <CatPagination
      v-model:pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      :custom-keys="['page', 'pageSize']"
      @change="paginationChange"
    />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
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

const bodyStyle = { height: '100%' }
// 获取时间
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
    text: t('disk.log.3dLast'), // 最近三天
    value: () => {
      return getDateTime(3, 'day')
    },
  },
  {
    text: t('order.oneWeek'), // 最近一周
    value: () => {
      return getDateTime(1, 'week')
    },
  },
  {
    text: t('order.oneMonth'), // 最近一个月
    value: () => {
      return getDateTime(1, 'month')
    },
  },
  {
    text: t('order.threeMonth'), // 最近三个月
    value: () => {
      return getDateTime(3, 'month')
    },
  },
]
// 日期选择范围
const defaultTime = shortcuts[0].value()
const dateTime = ref<any>(defaultTime)
const list = ref<any[]>([]) // 列表
const loading = ref<boolean>(false)

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 日期按钮
const btnValue = ref<any>({
  label: t('disk.log.3d'),
  value: '3d',
})

// 日期按钮切换
const changeDate = v => {
  console.log(`changeDate===>`, v)

  if (v.value === '3d') {
    dateTime.value = shortcuts[0].value()
  } else {
    dateTime.value = shortcuts[1].value()
  }
}

// 分页
const paginationChange = () => {
  operateLogList()
}

// 操作日志列表
const operateLogList = async () => {
  try {
    loading.value = true
    const startTime = dateTime.value[0]
    const endTime = dateTime.value[1]

    const res = await _operateLogList({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      resourceId: props.detail.id, // 资源id
      operateType: props.detail.operateType, // 日志类型1实例2镜像3安全组4子网5私有网络6弹性公网ip7弹性网卡8硬盘9快照
      startTime, // 开始时间
      endTime, // 结束时间
    })

    console.log(`_operateLogList===>`, res)

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

// 监听datetime
watch(dateTime, () => {
  const startTime = dateTime.value[0]
  const endTime = dateTime.value[1]

  // 使用 dayjs.diff() 计算两个日期之间的天数差异
  const diffDays = maoYunDayJs(endTime).diff(maoYunDayJs(startTime), 'day')
  console.log(`watch diffDays===>`, diffDays)

  if (diffDays === 3) {
    // 最近三天
    btnValue.value = btnsGroupList[0]
  } else if (diffDays === 7) {
    // 最近一周
    btnValue.value = btnsGroupList[1]
  } else {
    // 其他
    btnValue.value = {}
  }

  operateLogList()
})

onMounted(() => {
  operateLogList()
})
</script>

<style lang="scss" scoped></style>
