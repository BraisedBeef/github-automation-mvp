<template>
  <div>
    <PageHeader :title="t('routeTable.routeTable')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="areaChange" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df search-wrap">
          <div class="df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('routeTable.placeholder')"
              :filter-list="filterList"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="state.loading" @click="areaChange">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table v-loading="state.loading" :data="state.list" class="mt20 table">
          <!-- ID/名称 -->
          <el-table-column min-width="320" :label="t('routeTable.idOrName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.rbUuid" @handle-click="goDetail(row.id, row.rbUuid)" />
                </div>
                <TableCopy :text="row.rbName" />
              </div>
            </template>
          </el-table-column>
          <!-- 类型 -->
          <el-table-column min-width="130" :label="t('routeTable.type')">
            <template #default="{ row }">
              <div>{{ typeList.find(item => item.value === row.type)?.label }}</div>
            </template>
          </el-table-column>
          <!-- 所属网络 -->
          <el-table-column min-width="300" :label="t('routeTable.belongingNetwork')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.vpcUuid" @handle-click="goVpc(row.vpcId, row.vpcUuid)" />
                </div>
                <div class="text-over">
                  {{ row.vpcName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 关联子网数 -->
          <el-table-column min-width="240" :label="t('routeTable.associatedSubnetNum')">
            <template #default="{ row }">
              <div class="text-primary cursor-pointer" @click="goSubnet(row.rbUuid)">
                {{ row.subnetNum }}
              </div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('routeTable.createTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('routeTable.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}</div>
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
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { useBaseStore, useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import { getQueryRouteTablePage } from '@/apis/network/route-table'
import { QueryRouteTablePageType } from '@/apis/network/type/route-table'
import { message } from '@/utils/message'
import { typeList } from './config'
import { pushRoute, replaceRoute } from '@/utils/router-jump'

const route = useRoute()
const router = useRouter()

const bodyStyle = { height: '100%' }

// 地区
const area = ref<{ id: number; locationId: number }>({ id: 0, locationId: 0 })

const filterInputRef = ref<any>()

const filterList = [
  { fieldName: 'ID', fieldKey: 'rbUuid' },
  { fieldName: t('subnet.belongingNetworkId'), fieldKey: 'vpcUuid' },
  { fieldName: t('routeTable.name'), fieldKey: 'name' },
]

const paginationConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})

const state = reactive<{
  condition: string // 查询条件
  loading: boolean
  list: any[] // 列表
}>({
  condition: '',
  loading: false,
  list: [],
})

// 获取列表
const getList = async (search = filterInputRef.value?.searchParams || {}) => {
  const params: QueryRouteTablePageType = {
    pageSize: paginationConfig.pagination.pageSize,
    pageIndex: paginationConfig.pagination.page,
    regionId: area.value?.id as number,
    ...search,
  }
  if (state.condition !== '') {
    params.id = Number(state.condition)
  }
  state.loading = true
  try {
    const res = await getQueryRouteTablePage(params)
    state.loading = false
    if (res.success) {
      state.list = res.data?.list
      paginationConfig.total = res.data?.recordCnt
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

// 切换地区的方法
const areaChange = () => {
  paginationConfig.pagination.page = 1
  filterInputRef.value.searchList = []
  // 从私有网络跳转进入，带入vpcUuid进行过滤查询
  if (route.query?.vpcUuid) {
    const { vpcUuid } = route.query
    filterInputRef.value.searchList = [
      { fieldName: t('subnet.belongingNetworkId'), fieldKey: 'vpcUuid', value: vpcUuid },
    ]
    replaceRoute({ name: 'network_security_route_table_list' }) // 赋值完成清除query参数
  }
}

// 搜索方法
const searchFn = search => {
  paginationConfig.pagination.page = 1
  getList(search)
}

// 分页
const paginationChange = () => {
  getList()
}

// 跳转所属网络
const goVpc = (id: number, uuid: string) => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id, uuid },
  })
}

// 跳转子网
const goSubnet = (rbUuid: string) => {
  pushRoute({
    name: 'network_security_subnet_list',
    query: { rbUuid },
  })
}

// 跳转详情页面
const goDetail = (id: number, uuid: string) => {
  pushRoute({
    name: 'network_security_route_table_detail',
    query: { id, uuid },
  })
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.flex-direction-row-reverse {
  flex-direction: row-reverse;
}

:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}
</style>
