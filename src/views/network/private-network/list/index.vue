<template>
  <div>
    <PageHeader :title="t('privateNetwork.privateNetwork')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <el-button v-if="checkPermission(permMap.vpc.CREATE_VPC)" type="primary" @click="createVpc()">
              {{ t('privateNetwork.createVPC') }}
            </el-button>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('privateNetwork.placeholder')"
              :filter-list="filterList"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="state.loading" @click="refreshFn()">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table v-loading="state.loading" :data="state.list" class="mt20 table">
          <!-- ID/名称 -->
          <el-table-column min-width="310" :label="t('privateNetwork.idOrName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.vpcUuid" @handle-click="goDetail(row.id, row.vpcUuid)" />
                </div>
                <TableCopy :text="row.vpcName" />
              </div>
            </template>
          </el-table-column>
          <!-- IPv4 CIDR -->
          <el-table-column min-width="200" :label="t('IPv4 CIDR')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="row?.cidrBlock && row.cidrBlock !== ''" class="text-over">
                  {{ row.cidrBlock }} {{ `(${t('privateNetwork.mainNetworkSegment')})` }}
                </div>
                <div v-else>-</div>
              </div>
            </template>
          </el-table-column>
          <!-- 子网 -->
          <el-table-column min-width="100" :label="t('privateNetwork.subnet')">
            <template #default="{ row }">
              <div
                :class="row.subnetNum > 0 ? 'text-primary cursor-pointer' : ''"
                @click="row.subnetNum > 0 ? goSubnet(row.vpcUuid) : null"
              >
                {{ row.subnetNum }}
              </div>
            </template>
          </el-table-column>
          <!-- 路由表 -->
          <el-table-column min-width="180" :label="t('privateNetwork.routingTable')">
            <template #default="{ row }">
              <div
                :class="row.subnetNum > 0 ? 'text-primary cursor-pointer' : ''"
                @click="row.subnetNum > 0 ? goRouteTable(row.vpcUuid) : null"
              >
                {{ row.rbNum }}
              </div>
            </template>
          </el-table-column>
          <!-- 服务器 -->
          <el-table-column min-width="100" :label="t('privateNetwork.server')">
            <template #default="{ row }">
              <div class="df ac">
                <span
                  :class="row.insNum > 0 ? 'text-primary cursor-pointer' : ''"
                  @click="row.insNum > 0 ? goServer(false) : () => {}"
                >
                  {{ row.insNum }}
                </span>
                <SvgIcon
                  v-if="checkPermission(permMap.vpc.JUMP_CREATE_VM)"
                  style="width: 16px; height: 16px; margin-left: 10px"
                  class="cursor-pointer"
                  name="export-outlined"
                  @click="goServer(true, row.vpcUuid)"
                />
              </div>
            </template>
          </el-table-column>
          <!-- 默认私有网络 -->
          <el-table-column min-width="280" :label="t('privateNetwork.defaultPrivateNetwork')">
            <template #default="{ row }">
              <div>{{ isDefaultList.find(item => item.value === row.isDefault)?.label }}</div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('privateNetwork.createTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('privateNetwork.createTime') }}</span>
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
          <el-table-column :min-width="operateClass" :label="t('publicIp.operate')" fixed="right">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 删除 -->
                <DisableText
                  v-if="checkPermission(permMap.vpc.DELETE_VPC)"
                  :disabled="row.isDefault === '1'"
                  :text="t('privateNetwork.deleteVPC')"
                  disabled-type="text"
                  @click="deleteVpc(row)"
                />
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
    </div>

    <!-- 新建VPC -->
    <PrivateAdd ref="privateAddRef" :region-id="area?.id" @success="refreshFn()" />

    <PrivateDelete ref="privateDeleteRef" @success="refreshFn()" @go-subnet="goSubnet" @go-server="goServer(false)" />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

import { useCvmStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { getQueryVpcPage } from '@/apis/network/private-network'
import { QueryVpcPageType } from '@/apis/network/type/private-network'
import { isDefaultList } from './config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { pushRoute } from '@/utils/router-jump'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import PrivateAdd from './components/private-add/index.vue'
import PrivateDelete from './components/private-delete/index.vue'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.vpc,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const bodyStyle = { height: '100%' }

// 地区
const area = ref<{ id: number; locationId: number }>()

const filterInputRef = ref<any>()
// -------------------------------  测试代码 ------------------------------------
// const getTemplateList: () => Promise<{ label: string, value: string | number }[]> = async () => {
//   const params = { pageIndex: 1, pageSize: 100, regionId: 1 }
//   const res = await getQueryVpcPage(params) // 这里是请求数据的方法
//   const list = res.data.list;
//   return list.map(item => ({ label: item.vpcName, value: item.id }))
// }
// const filterList = [
//   { fieldName: '名称', fieldKey: 'name' },
//   { fieldName: 'ID', fieldKey: 'id' },
//   { fieldName: '类型', fieldKey: 'type', fieldType: 'select', getList: getTemplateList },
//   { fieldName: '多选', fieldKey: 'check', fieldType: 'check', list: [
//     { label: '多选1', value: 1 },
//     { label: '多选2', value: 2 },
//     { label: '多选3', value: 3 },
//     { label: '多选4', value: 4 },
//     { label: '多选5', value: 5 },
//   ] }
// ]
// const searchFn = (params) => {
//   console.log('params====>', params)
// }
// ---------------------------------- 测试代码结束 -----------------------------------

const filterList = [
  { fieldName: 'ID', fieldKey: 'vpcUuid' },
  { fieldName: t('privateNetwork.name'), fieldKey: 'vpcName' },
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

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const operateMap = {
  [ja]: '120',
  [en]: '120',
  [zh]: '120',
}
const operateClass = useI18nStyle(operateMap)

// 获取列表数据
const getList = async (search = filterInputRef.value?.searchParams || {}) => {
  const params: QueryVpcPageType = {
    pageSize: paginationConfig.pagination.pageSize,
    pageIndex: paginationConfig.pagination.page,
    regionId: area.value?.id as number,
    ...search,
  }
  // ------------ 这里需要调整 ---------------
  if (state.condition !== '') {
    params.vpcId = Number(state.condition)
  }
  state.loading = true
  try {
    const res = await getQueryVpcPage(params)
    state.loading = false
    if (res.success) {
      state.list = res?.data?.list || []
      paginationConfig.total = res.data?.recordCnt
    }
  } catch (error) {
    state.loading = false
  }
}

// 搜索方法
const searchFn = (search: Record<string, any>) => {
  paginationConfig.pagination.page = 1
  getList(search)
}

// 切换地域
const changeArea = (area: { id: number; locationId: number }) => {
  permConfig.regionId = area.id
  refreshFn()
}

// 刷新的方法
const refreshFn = () => {
  paginationConfig.pagination.page = 1
  filterInputRef.value.searchList = []
}

// 分页
const paginationChange = () => {
  getList()
}

const privateAddRef = ref<InstanceType<typeof PrivateAdd>>() // 新建VPC
const privateDeleteRef = ref<InstanceType<typeof PrivateDelete>>() // 删除VPC
// 新建VPC
const createVpc = () => {
  privateAddRef.value.show = true
}

// 删除Vpc
const deleteVpc = (row: any) => {
  privateDeleteRef.value.rowData = row
  privateDeleteRef.value.show = true
}

// 跳转详情页面
const goDetail = (id: number, uuid: string) => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id, uuid },
  })
}

// 跳转子网
const goSubnet = (vpcUuid: string) => {
  pushRoute({
    name: 'network_security_subnet_list',
    query: { vpcUuid },
  })
}

// 跳转路由表
const goRouteTable = (vpcUuid: string) => {
  pushRoute({
    name: 'network_security_route_table_list',
    query: { vpcUuid },
  })
}

// 跳转云服务器界面
const goServer = (isAdd: boolean, vpcUuid?: string) => {
  if (isAdd) {
    pushRoute({
      name: 'ins_create',
      query: {
        isDefaultCreate: 'true',
        isInit: 'true',
        vpcUuid,
      },
    })
  } else {
    pushRoute({
      name: 'ins',
      query: {
        vpcUuid,
      },
    })
  }
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
