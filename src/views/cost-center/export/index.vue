<template>
  <el-card shadow="never" class="page-box cost-center-export">
    <el-select
      v-model="select.type"
      class="mb20"
      :teleported="true"
      style="width: 140px"
      :placeholder="t('export.all')"
      @change="getList"
    >
      <el-option v-for="item in select.options" :key="item.value" :value="item" :label="item.label" />
    </el-select>

    <el-table v-loading="loading" :data="tableData.list" show-overflow-tooltip>
      <el-table-column min-width="200" prop="fileType" :label="t('export.fileType')">
        <template #default="{ row }">
          <span class="text-primary cursor-pointer">
            {{ select.options.find(i => i.value === row.fileType)?.label }}
          </span>
        </template>
      </el-table-column>
      <el-table-column min-width="300" prop="fileName" :label="t('export.fileName')" />
      <!-- 状态 -->
      <el-table-column min-width="200" prop="status" :label="t('export.status')">
        <!-- 初始化 -->
        <template #default="{ row }">
          <StatusColumn :row="row" />
        </template>
      </el-table-column>
      <!-- 文件生成时间 -->
      <el-table-column min-width="200" prop="fileTime" :label="t('export.fileTime')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('export.fileTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span v-if="row.status === 0" class="text-primary"> {{ t('export.fileGenerating') }} </span>
          <!-- 初始化↑ -->

          <!-- 文件已生成 -->
          <span v-if="row.status === 1"> {{ row.fileTime ? maoYunDayJs(row.fileTime).format(FORMAT_TIME) : '-' }}</span>
          <!-- 文件生成失败 -->
          <span v-if="row.status === 2"> - </span>
        </template>
      </el-table-column>
      <!-- 最近下载时间 -->
      <el-table-column min-width="200" prop="lastDownloadTime" :label="t('export.lastDownloadTime')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('export.lastDownloadTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span>{{ row.exportTime ? maoYunDayJs(row.exportTime).format(FORMAT_TIME) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="150" fixed="right" :label="t('common.operation')">
        <template #default="{ row }">
          <span class="cursor-pointer" :class="row.status === 1 ? 'text-primary' : 'disabled'" @click="download(row)">{{
            t('export.download')
          }}</span>
        </template>
      </el-table-column>
    </el-table>

    <CatPagination
      v-model:pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      :custom-keys="['page', 'pageSize']"
      @change="getList"
    />
  </el-card>
</template>
<script setup lang="ts">
import { _generatePage, _getPath } from '@/apis/cost-center/export'
import { message } from '@/utils/message'
import { usePermission } from '@/hooks/permission/use-permission'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import StatusColumn from './components/status-column.vue'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

type GeneratePageType = {
  createTime: string // 创建时间
  downloadUrl: string // 下载地址
  fileName: string // 文件名称
  filePath: string // 文件路径
  fileTime: string // 文件生成时间
  fileType: number // 文件类型 1:L0_PDF账单 2:L1_账单汇总 3:L2_资源账单 4:L3_账单明细 5:订单管理 6:续费管理 7:收支明细
  id: number
  parentId: number
  status: number // 状态 0 初始化 1 完成 2 失败
}

const generateGetPathPermission = usePermission('feeApi:generateGetPath') // 下载权限

const route = useRoute()
const timeId = ref<any>(null) // 定时器
const loading = ref<boolean>(false)
const select = reactive<{
  options: any[]
  type: any
}>({
  type: {
    value: 0,
    label: t('export.all'),
  },
  options: [
    {
      value: 0,
      label: t('export.all'), // 全部文件类型
    },
    {
      value: 1,
      label: t('export.fileType0'), // L0_PDF账单
    },
    {
      value: 2,
      label: t('export.fileType1'), // L1_账单汇总
    },
    {
      value: 3,
      label: t('export.fileType2'), // L2_资源账单
    },
    {
      value: 4,
      label: t('export.fileType3'), // L3_账单明细
    },
    {
      value: 5,
      label: t('export.fileType4'), // 订单管理
    },
    {
      value: 6,
      label: t('export.fileType5'), // 续费管理
    },
    {
      value: 7,
      label: t('export.fileType6'), // 收支明细
    },
  ],
})

const tableData = reactive<{
  list: GeneratePageType[]
}>({
  list: [],
})

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 点击下载
const download = (row: any) => {
  if (!generateGetPathPermission.checkPermissionRes) {
    generateGetPathPermission.dialog({
      show: true,
      i18nKey: 'export.downloadPerm',
    })
    return
  }

  console.log(`download===`, row)

  if (row.status === 1) {
    getPath(row.id)
  } else {
    message.warning(t('export.downloadFail'))
  }
}

// 导出记录
const getList = async () => {
  try {
    if (!timeId.value) {
      loading.value = true
    }

    const params = {
      fileType: select.type.value as number,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
    }

    const res = await _generatePage(params)
    console.log('getList===>', res)

    if (res.success) {
      tableData.list = res.data.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 获取下载地址
const getPath = async (id: number) => {
  const res = await _getPath({
    id,
  })

  console.log('getPath===>', res)
  if (res.success) {
    const url = res.data

    if (url) {
      window.open(url)
      // message.success(t('export.downloadSuccess'))
      getList()
    } else {
      message.warning(t('export.downloadFail'))
    }
  }
}

onMounted(() => {
  // type有值 则是收支明细 订单管理 账单下载中心入口进来
  const type = route.query.type

  if (type) {
    select.type = select.options.find(el => el.value === Number(type))
  }

  // 轮询
  timeId.value = setInterval(() => {
    getList()
  }, 3 * 1000)

  getList()
})

onBeforeUnmount(() => {
  clearInterval(timeId.value)
})
</script>

<style lang="scss" scoped>
.table-status {
  display: flex;
  align-items: center;
}

.table-status_value {
  margin-left: 5px;
}

.disabled {
  color: var(--sub-text);
  cursor: not-allowed;
}
</style>
