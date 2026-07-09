<template>
  <div>
    <PageHeader :title="t('subnet.subnet')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" @get-region-data="getRegionData" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <el-button
              v-if="checkPermission(permMap.subnet.CREATE_SUBNET)"
              type="primary"
              @click="changeShow(setAddRef)"
            >
              {{ t('subnet.add') }}
            </el-button>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('subnet.placeholder')"
              :filter-list="filterList"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="state.loading" @click="initData">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table
          v-loading="state.loading"
          :data="state.list"
          class="mt20 table"
          @selection-change="handleRowSelectChange"
        >
          <!-- <el-table-column type="selection" width="40" /> -->
          <!-- ID 名称 -->
          <el-table-column min-width="300" :label="t('subnet.idOrName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.subnetUuid" @handle-click="goDetail(row.id, row.subnetUuid)" />
                </div>
                <TableCopy :text="row.subnetName" />
              </div>
            </template>
          </el-table-column>
          <!-- 所属网络 -->
          <el-table-column min-width="300" :label="t('subnet.belongingNetwork')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.vpcUuid" @handle-click="goPrivateNetword(row.vpcId, row.vpcUuid)" />
                </div>
                <div class="text-over">
                  {{ row.vpcName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- CIDR -->
          <el-table-column min-width="140" :label="t('CIDR')">
            <template #default="{ row }">
              <div>{{ row.cidrBlock }}</div>
            </template>
          </el-table-column>
          <!-- 可用区 -->
          <el-table-column min-width="160" :label="t('subnet.usableArea')">
            <template #header>
              <TableHeadFilter
                v-if="state.usableAreaOpts?.length > 0"
                ref="tableHeadFilterRef"
                v-model="state.usableArea"
                :label="t('subnet.usableArea')"
                show-all
                :list="state.usableAreaOpts"
                value-type="string"
                @update:model-value="tableFilter"
              />
            </template>
            <template #default="{ row }">
              <div>{{ row.zoneName }}</div>
            </template>
          </el-table-column>
          <!-- 关联路由表 -->
          <el-table-column min-width="300" :label="t('subnet.associationRoutingTable')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.rbUuid" @handle-click="goRouteTable(row.rbId, row.rbUuid)" />
                </div>
                <div class="text-over">
                  {{ row.rbName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 服务器 -->
          <el-table-column min-width="100" :label="t('subnet.server')">
            <template #default="{ row }">
              <div class="df ac">
                <span>{{ row.insNum }}</span>
                <SvgIcon
                  style="width: 16px; height: 16px; margin-left: 8px"
                  class="cursor-pointer"
                  name="export-outlined"
                  @click="goServer"
                />
              </div>
            </template>
          </el-table-column>
          <!-- 可用IP -->
          <el-table-column min-width="100" :label="t('subnet.availableIP')">
            <template #default="{ row }">
              <div>{{ row.usableIpCount }}</div>
            </template>
          </el-table-column>
          <!-- 默认子网 -->
          <el-table-column min-width="120" :label="t('subnet.defaultSubnet')">
            <template #default="{ row }">
              <div>{{ IS_DEFAULT_LIST.find(item => item.value === row.isDefault)?.label }}</div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('subnet.createTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('subnet.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}</div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column min-width="120" :label="t('subnet.operate')" fixed="right">
            <template #default="{ row }">
              <span
                v-if="(row.isDefault !== 1 || row.vendor === 4) && checkPermission(permMap.subnet.DELETE_SUBNET)"
                class="text-primary cursor-pointer"
                @click="showDeleteDialog(setDeleteRef, row)"
              >
                {{ t('subnet.delete') }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="nowPageList"
        />
      </el-card>
    </div>
    <!-- 删除子网 -->
    <SetDelete ref="setDeleteRef" @success="refreshFn" />
    <!-- 新增子网 -->
    <SetAdd
      ref="setAddRef"
      :region-id="area.id"
      :location-id="area.locationId"
      :sub-list="state.allList"
      :reserve-ip-num="state.reserveIpNum"
      @success="refreshFn"
    />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useCvmStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import SetDelete from './components/set-delete/index.vue'
import SetAdd from './components/set-add/index.vue'
import { getQuerySubnetPage, getSubnetIpConfig } from '@/apis/network/subnet'
import { QuerySubnetPageQuery } from '@/apis/network/type/subnet'
import { _listByRegionId } from '@/apis/cvm/base'
import { IS_DEFAULT_LIST } from './config'
import { message } from '@/utils/message'
import { isArray } from '@/utils/is'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { pushRoute, replaceRoute } from '@/utils/router-jump'
// import { calculateAllowedSubnets } from './config'

const route = useRoute()
const router = useRouter()

const bodyStyle = { height: '100%' }

// 地区
const area = ref<{ id: number; locationId: number }>({ id: 1, locationId: 1 })

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.subnet,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const filterList = ref<any[]>([])

const paginationConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})

const state = reactive<{
  condition: string // 查询条件
  loading: boolean
  allList: any[] // 全部列表
  list: any[] // 列表
  selectList: any[] // 选中的
  usableAreaOpts: any[] // 可用区列表
  usableArea: string[] | number[] // 选中的可用区
  reserveIpNum: number // 预留IP个数
}>({
  condition: '',
  loading: false,
  allList: [],
  list: [],
  selectList: [],
  usableAreaOpts: [],
  usableArea: [],
  reserveIpNum: 0,
})

const filterInputRef = ref<any>()
const tableHeadFilterRef = ref<any>()

// 获取列表数据
const getList = async (search = filterInputRef.value?.searchParams || {}) => {
  const params: QuerySubnetPageQuery = {
    pageIndex: 1,
    pageSize: 200, // 这里需要查出全部子网，为了新建是排除已添加的子网网段 （一个私网下只能添加200个子网） 分页由前端处理
    regionId: cvmStore.areaSelect.id,
    ...search,
    zoneIds: search.zoneIds ? search.zoneIds?.split(',') : [],
  }
  if (state.condition !== '') {
    params.subnetName = state.condition // ----------  这里只能查询名称，无法名称和id一起查  ----------
  }
  state.loading = true
  try {
    const res = await getQuerySubnetPage(params)
    state.loading = false
    if (res.success) {
      state.allList = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt
      nowPageList()
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

// 搜索的方法
const searchFn = search => {
  paginationConfig.pagination.page = 1
  // 搜索框可用区搜索项同步到表格的筛选项中
  const item = search?.zoneIds
  tableHeadFilterRef.value?.updateCheck(item)
  getList(search)
}

// 表格筛选
const tableFilter = list => {
  // 表格的筛选项同步到搜索框可用区搜索项中
  const index = filterInputRef.value.searchList.findIndex(item => item.fieldKey === 'zoneIds')
  if (!list.length && index >= 0) {
    filterInputRef.value.searchList.splice(index, 1)
    return
  }
  if (index >= 0) {
    const filterItem = filterInputRef.value.searchList.find(item => item.fieldKey === 'zoneIds')
    filterInputRef.value.searchList.splice(index, 1, {
      ...filterItem,
      value: list,
      label: state.usableAreaOpts.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
    })
  } else {
    filterInputRef.value.searchList.push({
      fieldName: t('subnet.usableArea'),
      fieldKey: 'zoneIds',
      value: list,
      label: state.usableAreaOpts.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
    })
  }
}

// 获取子网默认配置
const getSubnetIpConfigFn = async () => {
  const params = { regionId: cvmStore.areaSelect.id }
  try {
    const res = await getSubnetIpConfig(params)
    state.reserveIpNum = res.data?.reserveIpNum || 0
  } catch (err) {
    console.log('error', err)
  }
}

// 获取可用区列表
const zoneListByRegion = async () => {
  const params = { regionId: cvmStore.areaSelect.id }
  try {
    const res = await _listByRegionId(params)
    if (res.success) {
      state.usableAreaOpts = (res?.data || []).map(item => ({
        label: item.zoneName,
        value: item.id,
      }))
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    filterList.value = [
      { fieldName: 'ID', fieldKey: 'subnetUuid' },
      { fieldName: t('subnet.name'), fieldKey: 'subnetName' },
      { fieldName: t('subnet.belongingNetworkId'), fieldKey: 'vpcUuid' },
      { fieldName: t('subnet.rbUuid'), fieldKey: 'rbUuid' },
      {
        fieldName: t('subnet.usableArea'),
        fieldKey: 'zoneIds',
        fieldType: 'check',
        list: state.usableAreaOpts,
        valueType: 'string',
      },
    ]
    nextTick(() => {
      filterInputRef.value.updateFilterList()
    })
  }
}

// 获取当前页面需要展示的数据
const nowPageList = () => {
  const start = (paginationConfig.pagination.page - 1) * paginationConfig.pagination.pageSize
  const endNum = paginationConfig.pagination.page * paginationConfig.pagination.pageSize
  const end = endNum > paginationConfig.total ? paginationConfig.total : endNum
  state.list = state.allList.slice(start, end)
}

const refreshFn = () => {
  paginationConfig.pagination.page = 1
  filterInputRef.value.searchList = []
  tableHeadFilterRef.value?.updateCheck()
}

const changeArea = area => {
  permConfig.regionId = area.id
  initData()
}

const initData = () => {
  refreshFn()
  getSubnetIpConfigFn()
  // 从私有网络跳转进入，带入vpcUuid进行过滤查询
  if (route.query?.vpcUuid) {
    const { vpcUuid } = route.query
    filterInputRef.value.searchList = [
      { fieldName: t('subnet.belongingNetworkId'), fieldKey: 'vpcUuid', value: vpcUuid },
    ]
    replaceRoute({ name: 'network_security_subnet_list' }) // 赋值完成清除query参数
  } else if (route.query?.rbUuid) {
    //  // 从路由表跳转进入，带入vpcUuid进行过滤查询
    const { rbUuid } = route.query
    filterInputRef.value.searchList = [{ fieldName: t('subnet.rbUuid'), fieldKey: 'rbUuid', value: rbUuid }]
    replaceRoute({ name: 'network_security_subnet_list' }) // 赋值完成清除query参数
  }
}

// 跳转详情
const goDetail = (id: number, uuid: string) => {
  pushRoute({
    name: 'network_security_subnet_detail',
    query: { id, uuid },
  })
}

// 跳转私有网络
const goPrivateNetword = (id: number, uuid: string) => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id, uuid },
  })
}

// 跳转路由表
const goRouteTable = (id: number, uuid: string) => {
  pushRoute({
    // 这里要跳转到详情页面
    name: 'network_security_route_table_detail',
    query: { id, uuid },
  })
}

// 跳转云服务器界面
const goServer = () => {
  pushRoute({
    name: 'ins',
  })
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  state.selectList = selection
}

const setDeleteRef = ref<InstanceType<typeof SetDelete>>() // 删除
const showDeleteDialog = (ins: any, row: any) => {
  if (!ins) return
  ins.show = true
  ins.detail = row
}

const setAddRef = ref<InstanceType<typeof SetAdd>>() // 新增
const changeShow = (ins: any, zoneId?: any) => {
  if (!ins) return
  ins.show = true
  ins.showCallback(zoneId)
}
const getRegionData = data => {
  console.log('getRegionData', data)
  // 活动页购买服务器，在没有可用子网的情况下，快速创建子网
  if (route.query.zoneId && isArray(data)) {
    data.forEach(item => {
      const region = (item.regionDTOS || []).find(i => i.id === Number(route.query.regionId))
      if (region) {
        cvmStore.setAreaSelect(region)
        cvmStore.setRegionName(region.regionName)
        area.value = region
      }
    })
    nextTick(() => {
      changeShow(setAddRef.value, route.query.zoneId)
      replaceRoute({ path: router.currentRoute.value.path, query: {} })
    })
  }
}
onMounted(async () => {
  useTempStore().setPageHeader(false)
  zoneListByRegion()
  // console.log('calculateAllowedSubnets', calculateAllowedSubnets('10.0.56.0/22'))
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}

:deep(.select-input) {
  width: 650px;

  .el-select_content {
    width: 580px;

    .select_tags-list {
      max-width: 480px;
    }
  }
}
</style>
