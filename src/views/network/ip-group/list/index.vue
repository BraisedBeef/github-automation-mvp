<template>
  <div>
    <PageHeader :title="t('ipGroup.ipGroup')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <el-button
              v-if="checkPermission(permMap.ipGroup.CREATE_IP_ADDRESS_GROUP)"
              type="primary"
              @click="changeShow(setAddRef)"
            >
              {{ t('ipGroup.addIpGroup') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.ipGroup.DELETE_IP_ADDRESS_GROUPS_BULK)"
              :disabled="!state.selectList.length"
              @click="batchDelete(setDeleteRef)"
            >
              {{ t('ipGroup.delete') }}
            </el-button>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('ipGroup.placeholder')"
              :filter-list="filterList"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="state.loading" @click="refreshFn">
              <SvgIcon name="refresh" />
            </CdnIconButton>
            <CdnIconButton class="" @click="exportTemplate">
              <SvgIcon name="cat-cdn-download" />
            </CdnIconButton>
          </div>
        </div>

        <el-table
          v-loading="state.loading"
          :data="state.list"
          class="mt20 table"
          @selection-change="handleRowSelectChange"
        >
          <el-table-column type="selection" width="40" />
          <!-- ID 名称 -->
          <el-table-column min-width="200" :label="t('ipGroup.idOrName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.groupUuid" @handle-click="goDetail(row)" />
                </div>
                <TableCopy :text="row.name" />
              </div>
            </template>
          </el-table-column>
          <!-- 已使用 -->
          <el-table-column min-width="140" :label="t('ipGroup.usedAlready')">
            <template #default="{ row }">
              <div>{{ row.usedCount || 0 }}/{{ row?.totalCount || 0 }}</div>
            </template>
          </el-table-column>
          <!-- IP类型 -->
          <el-table-column min-width="200" :label="t('ipGroup.ipType')">
            <template #default="{ row }">
              <div>{{ row.etherType }}</div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('ipGroup.createTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('ipGroup.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row?.createTime ? maoYunDayJs(row?.createTime).format(FORMAT_TIME) : '-' }}</div>
            </template>
          </el-table-column>
          <!-- 备注 -->
          <el-table-column min-width="200" :label="t('ipGroup.remark')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ !!row?.description ? row.description : '-' }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column :min-width="operateClass" :label="t('ipGroup.operate')">
            <template #default="{ row }">
              <span
                v-if="checkPermission(permMap.ipGroup.EDIT_IP_ADDRESS_GROUP)"
                class="text-primary cursor-pointer mr20"
                @click="goDetail(row)"
                >{{ t('ipGroup.edit') }}</span
              >
              <span
                v-if="checkPermission(permMap.ipGroup.DELETE_IP_ADDRESS_GROUP_SINGLE)"
                class="text-primary cursor-pointer mr20"
                @click="deleteFn(setDeleteRef, row)"
                >{{ t('ipGroup.delete') }}</span
              >
              <span
                v-if="checkPermission(permMap.ipGroup.VIEW_ASSOCIATED_SECURITY_GROUPS)"
                class="text-primary cursor-pointer"
                @click="showAssociations(viewAssociationsRef, row)"
                >{{ t('ipGroup.viewAssociations') }}</span
              >
              <span />
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
    </div>
    <!-- 删除 -->
    <SetDelete ref="setDeleteRef" :region-id="area.id" @success="refreshFn" />
    <!-- 新建 -->
    <SetAdd ref="setAddRef" :region-id="area.id" @success="refreshFn" />
    <!-- 查看关联 -->
    <ViewAssociations ref="viewAssociationsRef" :region-id="area.id" />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useBaseStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import dayjs from 'dayjs'
import { IPagination } from '@/views/account-system/type'
import { getIpGroupList, exportIpGroupTemplate, downloadIpGroup } from '@/apis/network/ip-group'
import { message } from '@/utils/message'
import SetDelete from './components/set-delete/index.vue'
import SetAdd from './components/set-add/index.vue'
import ViewAssociations from './components/view-associations/index.vue'
import { downloadExportFiles } from '@/utils/download'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ipGroup,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const operateMap = {
  [ja]: '200',
  [en]: '270',
  [zh]: '200',
}

const operateClass = useI18nStyle(operateMap)

const router = useRouter()

const bodyStyle = { height: '100%' }

const filterList = [
  { fieldName: 'ID', fieldKey: 'groupUuid' },
  { fieldName: t('ipGroup.name'), fieldKey: 'name' },
]

// 地区
const area = ref<{ id: number; locationId: number }>({ id: 1, locationId: 1 })

const paginationConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})

const state = reactive<{
  condition: string // 查询条件
  loading: boolean
  list: any[] // 列表
  selectList: any[] // 选中的
}>({
  condition: '',
  loading: false,
  list: [],
  selectList: [],
})

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  state.selectList = selection
}

const filterInputRef = ref<any>() // 条件筛选框

const setDeleteRef = ref<InstanceType<typeof SetDelete>>() // 删除
const setAddRef = ref<InstanceType<typeof SetAdd>>() // 新建
const viewAssociationsRef = ref<InstanceType<typeof ViewAssociations>>()

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 获取数据列表
const getList = async (search = filterInputRef.value?.searchParams || {}) => {
  console.log('search', search)
  const params = {
    regionId: area?.value?.id,
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    ...search,
  }
  state.loading = true
  try {
    const res = await getIpGroupList(params)
    state.loading = false
    if (res.success) {
      state.list = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
  refreshFn()
}

// 搜索的方法
const searchFn = search => {
  state.selectList = []
  paginationConfig.pagination.page = 1
  getList(search)
}

// 刷新的方法
const refreshFn = () => {
  paginationConfig.pagination.page = 1
  filterInputRef.value.searchList = []
  state.selectList = []
}

// 分页
const paginationChange = () => {
  getList()
}

// 跳转详情
const goDetail = row => {
  pushRoute({
    name: 'network_security_ip_group_detail',
    query: {
      id: row.id,
    },
  })
}

// 批量删除
const batchDelete = (ins: any) => {
  changeShow(ins)
  ins.list = state.selectList
}

// 删除
const deleteFn = (ins: any, row: any) => {
  changeShow(ins)
  ins.list = [row]
}

// 查看关联
const showAssociations = (ins, row) => {
  changeShow(ins)
  ins.ipGroupId = row.id
  ins.getipSecurityGroupList()
}

// 下载模板
const exportTemplate = async () => {
  const params = {
    regionId: area?.value?.id,
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    ...filterInputRef.value?.searchParams,
  }
  const blob = await downloadIpGroup(params)
  downloadExportFiles(blob, `${t('ipGroup.ipGroup')}.xlsx`)
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}
</style>
