<template>
  <div>
    <PageHeader :title="t('networkCard.networkCard')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df ac jsb">
          <div class="df ac btn-wrap">
            <el-button v-if="checkPermission(permMap.eni.CREATE_ENI)" type="primary" @click="addFn">
              {{ t('networkCard.add') }}
            </el-button>
            <el-button
              v-if="batchDeleteKey && checkPermission(permMap.eni.DELETE_ENI_BULK)"
              type=""
              @click="batchDelete"
            >
              {{ t('networkCard.delete') }}
            </el-button>
            <div v-else class="ml10">
              <el-tooltip
                v-if="checkPermission(permMap.eni.DELETE_ENI_BULK)"
                effect="light"
                :content="state.selectList.length ? t('networkCard.cannotDeleteTip') : t('networkCard.selectDeleteTip')"
              >
                <el-button disabled type="">
                  {{ t('networkCard.delete') }}
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('networkCard.placeholder')"
              :filter-list="filterList"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="state.loading" @click="refresh">
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
          <el-table-column type="selection" width="40" />
          <!-- ID 名称 -->
          <el-table-column min-width="320" :label="t('networkCard.idOrName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.eniUuid" @handle-click="goDetail(row.eniId)" />
                </div>
                <TableCopy :text="row.name" />
              </div>
            </template>
          </el-table-column>
          <!-- 网卡属性 -->
          <el-table-column min-width="180" :label="t('networkCard.networkCardProperties')">
            <template #header>
              <TableHeadFilter
                ref="tableHeadFilterRef"
                v-model="state.primaryType"
                :label="t('networkCard.networkCardProperties')"
                show-all
                :list="primaryTypeOpts"
                @update:model-value="tableFilter"
              />
            </template>
            <template #default="{ row }">
              <div>{{ primaryTypeOpts.find(item => item.value === row.primaryType)?.label }}</div>
            </template>
          </el-table-column>
          <!-- 所属网络 -->
          <el-table-column min-width="320" :label="t('networkCard.belongingNetwork')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <TableCopy :text="row.vpcUuid" @handle-click="goVpc(row.vpcId, row.vpcUuid)" />
                </div>
                <div class="text-over">
                  {{ row.vpcName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 绑定资源 -->
          <el-table-column min-width="200" :label="t('networkCard.bindResources')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <template v-if="!!row?.resourceId">
                  <div class="text-primary cursor-pointer">
                    <Copy
                      :text="row.resourceUuid"
                      @handle-click="goExample(row.resourceId, row.resourceUuid, row.resourceName)"
                    />
                  </div>
                  <div class="text-over">
                    {{ row.resourceName }}
                  </div>
                </template>
                <div v-else>-</div>
              </div>
            </template>
          </el-table-column>
          <!-- 绑定资源类型 -->
          <el-table-column min-width="180" :label="t('networkCard.bindResourcesType')">
            <template #default="{ row }">
              <div v-if="!!row?.resourceType">
                {{ resourceTypeOpts.find(item => item.value === row.resourceType)?.label }}
              </div>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <!-- 内网IP -->
          <el-table-column min-width="180" :label="t('networkCard.internalIP')">
            <template #default="{ row }">
              <!-- 只有一个内网IP，直接显示 -->
              <TableCopy v-if="row?.privateIps?.length === 1" :text="row.privateIps[0]?.ip || '-'" />
              <!-- 含有多个内网IP显示数量，悬浮气泡显示所有IP -->
              <el-tooltip v-else-if="row?.privateIps?.length > 1" effect="light" placement="right">
                <template #content>
                  <div v-for="(item, index) in row?.privateIps" :key="index">
                    <Copy :text="item?.ip || '-'" />
                  </div>
                </template>
                <span class="text-primary" style="cursor: pointer">{{ row.privateIps.length || '-' }}</span>
              </el-tooltip>
              <div v-else>-</div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('networkCard.createTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('networkCard.createTime') }}</span>
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
          <el-table-column min-width="180" :label="t('networkCard.operate')" fixed="right">
            <template #default="{ row }">
              <el-tooltip
                v-if="!!row.resourceId && checkPermission(permMap.eni.DELETE_ENI)"
                effect="light"
                :content="t('networkCard.cannotDeleteTip')"
              >
                <span class="text-primary disabled-btn mr20">{{ t('networkCard.delete') }}</span>
              </el-tooltip>
              <span
                v-if="!row.resourceId && checkPermission(permMap.eni.DELETE_ENI)"
                class="text-primary cursor-pointer mr20"
                @click="deleteFn(row)"
                >{{ t('networkCard.delete') }}</span
              >
              <el-tooltip
                v-if="!!row.resourceId && row.primaryType === 1 && checkPermission(permMap.eni.ENI_UNBIND_INSTANCE)"
                effect="light"
                :content="t('networkCard.cannotUnbindTip')"
              >
                <span class="text-primary disabled-btn">{{ t('networkCard.unbind') }}</span>
              </el-tooltip>
              <span
                v-else-if="!!row.resourceId && checkPermission(permMap.eni.ENI_UNBIND_INSTANCE)"
                class="text-primary cursor-pointer"
                @click="unbindFn(row)"
                >{{ t('networkCard.unbind') }}</span
              >
              <span v-else
                ><span
                  v-if="checkPermission(permMap.eni.ENI_BIND_INSTANCE) && !row.resourceId"
                  class="text-primary cursor-pointer"
                  @click="bindFn(row)"
                  >{{ t('networkCard.bind') }}</span
                ></span
              >
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
    <SetDelete ref="setDeleteRef" @success="refreshLoading" />
    <!-- 解除绑定 -->
    <SetUnbind ref="setUnbindRef" @success="getList" />
    <!-- 新建 -->
    <SetAdd ref="setAddRef" :region-id="area.id" @success="refresh" />
    <!-- 绑定 -->
    <SetBind ref="setBindRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useBaseStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import SetDelete from './components/set-delete/index.vue'
import SetUnbind from './components/set-unbind/index.vue'
import SetAdd from './components/set-add/index.vue'
import SetBind from './components/set-bind/index.vue'
import { getEniPage } from '@/apis/network/network-card'
import { message } from '@/utils/message'
import { primaryTypeOpts, resourceTypeOpts } from './config'
import { useCvmStore } from '@/store'

import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { pushRoute, replaceRoute } from '@/utils/router-jump'
const bodyStyle = { height: '100%' }

const route = useRoute()
const router = useRouter()

// 地区
const area = ref<{ id: number; locationId: number }>({ id: 1, locationId: 1 })

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.eni,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const filterInputRef = ref<any>()
const tableHeadFilterRef = ref<any>()

const filterList = [
  { fieldName: t('ID'), fieldKey: 'eniUuid' },
  {
    fieldName: t('networkCard.networkCardProperties'),
    fieldKey: 'primaryType',
    fieldType: 'check',
    list: primaryTypeOpts,
  },
  { fieldName: t('subnet.belongingNetworkId'), fieldKey: 'vpcUuid' },
]

const paginationConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})

const state = reactive<{
  loading: boolean
  list: any // 列表
  selectList: any // 选中的
  primaryType: number // 网卡属性筛选
}>({
  loading: false,
  list: [],
  selectList: [],
  primaryType: NaN,
})

const batchDeleteKey = computed(() => {
  return state.selectList.length && state.selectList.findIndex(item => !!item.resourceId) < 0
})

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  state.selectList = selection
}

const setDeleteRef = ref<InstanceType<typeof SetDelete>>() // 删除
const setUnbindRef = ref<InstanceType<typeof SetUnbind>>() // 解除绑定
const setAddRef = ref<InstanceType<typeof SetAdd>>() // 新建
const setBindRef = ref<InstanceType<typeof SetBind>>() // 绑定

// 获取列表数据
const getList = async (search = filterInputRef.value?.searchParams || {}) => {
  const params = {
    regionId: cvmStore.areaSelect.id,
    pageSize: paginationConfig.pagination.pageSize,
    pageIndex: paginationConfig.pagination.page,
    ...search,
  }
  state.loading = true
  try {
    const res = await getEniPage(params)
    state.loading = false
    if (res.success) {
      state.list = res.data?.list
      paginationConfig.total = res.data?.recordCnt || 0
      console.log('res.data', res.data)
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

const refreshLoading = () => {
  state.loading = true
  setTimeout(() => {
    refresh()
  }, 4000)
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
  paginationConfig.pagination.page = 1
  filterInputRef.value.searchList = []
  // 从私有网络跳转进入，带入vpcUuid进行过滤查询
  if (route.query?.vpcUuid) {
    const { vpcUuid } = route.query
    filterInputRef.value.searchList = [
      { fieldName: t('subnet.belongingNetworkId'), fieldKey: 'vpcUuid', value: vpcUuid },
    ]
    replaceRoute({ name: 'network_security_network_card_list' }) // 赋值完成清除query参数
  }
}

const refresh = () => {
  paginationConfig.pagination.page = 1
  filterInputRef.value.searchList = []
}

// 搜索方法
const searchFn = search => {
  paginationConfig.pagination.page = 1
  // 搜索框可用区搜索项同步到表格的筛选项中
  const item = search?.primaryType
  tableHeadFilterRef.value?.updateCheck(item)
  getList(search)
}

// 表格筛选
const tableFilter = list => {
  // 表格的筛选项同步到搜索框可用区搜索项中
  const index = filterInputRef.value.searchList.findIndex(item => item.fieldKey === 'primaryType')
  if (!list.length && index >= 0) {
    filterInputRef.value.searchList.splice(index, 1)
    return
  }
  if (index >= 0) {
    const filterItem = filterInputRef.value.searchList.find(item => item.fieldKey === 'primaryType')
    filterInputRef.value.searchList.splice(index, 1, {
      ...filterItem,
      value: list,
      label: primaryTypeOpts.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
    })
  } else {
    filterInputRef.value.searchList.push({
      fieldName: t('networkCard.networkCardProperties'),
      fieldKey: 'primaryType',
      value: list,
      label: primaryTypeOpts.filter(item => list.indexOf(item.value) >= 0).map(item => item.label),
    })
  }
}

// 刷新的方法
// const refreshFn = () => {
//   filterInputRef.value.searchList = []
// }

// 分页
const paginationChange = () => {
  getList()
}

// 跳转详情
const goDetail = id => {
  pushRoute({
    name: 'network_security_network_card_detail',
    query: { id },
  })
}

// 跳转私网详情
const goVpc = (id, uuid) => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id, uuid },
  })
}

// 跳转实例详情
const goExample = (id, uuid, name) => {
  pushRoute({
    name: 'ins_detail',
    params: {
      id: uuid,
      uuid,
      name,
    },
  })
}

// 新建
const addFn = () => {
  ;(setAddRef.value as InstanceType<typeof SetAdd>).show = true
  ;(setAddRef.value as InstanceType<typeof SetAdd>).getVpcList()
  ;(setAddRef.value as InstanceType<typeof SetAdd>).getSecurityGroupList()
}

// 批量删除
const batchDelete = () => {
  ;(setDeleteRef.value as InstanceType<typeof SetDelete>).show = true
  ;(setDeleteRef.value as InstanceType<typeof SetDelete>).list = [...state.selectList]
}

// 删除
const deleteFn = row => {
  ;(setDeleteRef.value as InstanceType<typeof SetDelete>).show = true
  ;(setDeleteRef.value as InstanceType<typeof SetDelete>).list = [{ ...row }]
}

// 解除绑定
const unbindFn = row => {
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).show = true
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).detail = row
}

// 绑定
const bindFn = row => {
  ;(setBindRef.value as InstanceType<typeof SetBind>).show = true
  ;(setBindRef.value as InstanceType<typeof SetBind>).eniId = row.eniId
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.disabled-btn {
  cursor: not-allowed;
  opacity: 0.5;
}

:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}
</style>
