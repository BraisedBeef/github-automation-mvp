<template>
  <div>
    <PageHeader :title="t('flowPacket.flowPacket')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @update:model-value="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <el-button v-if="checkPermission(permMap.pkg.BUY_TRAFFIC_PACKAGE)" type="primary" @click="setBuyFn">
              {{ t('flowPacket.buyFlowPacket') }}
            </el-button>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('flowPacket.flowPacketListPlaceholder')"
              :filter-list="iptFilterConfig"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="loading" @click="refreshPage">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table v-loading="loading" :data="list" class="mt20 table">
          <!-- ID 名称 -->
          <el-table-column min-width="220" :label="t('flowPacket.idOrName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.pkgUuid" @handle-click="goDetail(row.id, row.pkgUuid)" />
                </div>
                <TableCopy :text="row.pkgName" />
              </div>
            </template>
          </el-table-column>
          <!-- 使用量/总量 -->
          <el-table-column min-width="220" :label="t('flowPacket.usedOrAll')" show-overflow-tooltip>
            <template #default="{ row }">
              <div>
                <div class="mb4 size-box">{{ row.usedSize }}/{{ row.size }}{{ row.unit }}</div>
                <div class="w200">
                  <el-progress
                    :percentage="getPercentage(row)"
                    :show-text="false"
                    :color="row.state === 1 ? '#0063FF' : 'rgba(0, 99, 255, 0.3)'"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column min-width="150" :label="t('flowPacket.state')">
            <template #header>
              <TableHeadFilter
                ref="tableHeadFilterRef"
                v-model="tableFilterConfig.stateList.value"
                :label="t('flowPacket.state')"
                :list="FLOW_PACKET_STATE_MAP"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              {{ FLOW_PACKET_STATE_MAP.find(item => item.value === row.state)?.label }}
            </template>
          </el-table-column>
          <!-- 线路 -->
          <el-table-column min-width="150" :label="t('flowPacket.line')" show-overflow-tooltip>
            <template #default="{ row }">
              {{ eipLineTypeList.find(item => item.value === row.lineType)?.label }}
            </template>
          </el-table-column>
          <!-- 带宽上限 -->
          <el-table-column min-width="150" :label="t('flowPacket.maxBandwidth')" show-overflow-tooltip>
            <template #default="{ row }"> {{ row.maxBandwidth }} Mbps </template>
          </el-table-column>
          <!-- 申请时间 -->
          <el-table-column min-width="220" :label="t('flowPacket.createTime')" show-overflow-tooltip>
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('flowPacket.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
            </template>
          </el-table-column>
          <!-- 到期时间 -->
          <el-table-column min-width="220" :label="t('flowPacket.expiredTime')" show-overflow-tooltip>
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('flowPacket.expiredTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              {{ row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '-' }}
            </template>
          </el-table-column>
          <!-- 已加入弹性公网IP -->
          <el-table-column min-width="280" :label="t('flowPacket.joinedEip')" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="text-primary cursor-pointer" @click="goDetail(row.id, row.pkgUuid)">{{ row.ipNums }}</span>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column width="250" :label="t('disk.snapshot.opts')" fixed="right">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 添加公网IP -->
                <span
                  v-if="checkPermission(permMap.pkg.ADD_EIP)"
                  class="text-primary cursor-pointer mr20"
                  @click="addEipFn(row)"
                  >{{ t('flowPacket.addEip') }}</span
                >
                <div
                  v-if="
                    FLOW_PACKET_MORE_OPTS.filter(i => ((checkPermission(i.perm) as any[])?.length || 0) > 0 || !i.perm)
                  "
                  style="width: 130px"
                >
                  <el-select
                    class="select-tr"
                    :placeholder="t('flowPacket.more')"
                    suffix-icon=""
                    @change="
                      v => {
                        handleOperatechange(v, row)
                      }
                    "
                  >
                    <el-option
                      v-for="item in FLOW_PACKET_MORE_OPTS.filter(i => checkPermission(i.perm) || !i.perm)"
                      :key="item.value"
                      :value="item"
                      :label="item.label"
                      :disabled="item.value === 'removeEip' && !row.ipNums"
                    />
                  </el-select>
                </div>
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

    <SetBuy
      ref="setAddRef"
      :init-eip-line-type-list="eipLineTypeList"
      :init-region-id="cvmStore.areaSelect.id"
      @success="refreshPage"
    />
    <AddEip ref="addEipRef" @success="getList" />
    <RemoveEip ref="removeEipRef" @success="getList" />
  </div>
</template>
<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useCvmStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { FLOW_PACKET_STATE_MAP, FLOW_PACKET_MORE_OPTS } from './config'
import { shareTrafficPackageList } from '@/apis/network/flow-packet'
import { getEipLineType } from '@/apis/network/public-ip'
import { message } from '@/utils/message'
import { lineTypeList } from '@/views/network/public-ip/list/config'
import SetBuy from './components/set-buy/index.vue'
import AddEip from './components/add-eip/index.vue'
import RemoveEip from './components/remove-eip/index.vue'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { pushRoute } from '@/utils/router-jump'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.pkg,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const bodyStyle = { height: '100%' }

const router = useRouter()

// 地区
const area = ref<{ id: number; locationId: number }>({ id: 1, locationId: 1 })

const loading = ref<boolean>(false)

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 筛选项
const defaultTableFilterConfig: TableFilterConfigType = {
  stateList: {
    value: [],
    opts: FLOW_PACKET_STATE_MAP,
    fieldKey: 'stateList',
    fieldType: 'select',
  },
}
const defaultIptFilterConfig = [
  { fieldName: 'ID', fieldKey: 'uuid' },
  { fieldName: t('flowPacket.eipLineType'), fieldKey: 'lineType', fieldType: 'select', list: [] },
  {
    fieldName: t('flowPacket.state'),
    fieldKey: 'stateList',
    fieldType: 'check',
    list: FLOW_PACKET_STATE_MAP,
  },
]
const { handleThSelectFn, handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)
// 表格的筛选项
const tableCheckFilterFn = (list: any) => {
  handleThCheckFn(list, 'stateList', t('flowPacket.state'))
}
const tableHeadFilterRef = ref<any>()
// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  paginationConfig.pagination.page = 1
  tableHeadFilterRef.value?.updateCheck(search?.stateList)
  getList(search)
}
// 列表数据
const list = ref<any[]>([])

// 获取百分比
const getPercentage = row => {
  if (row?.usedSize && row?.size) {
    return (row.usedSize * 100) / row.size
  } else {
    return 0
  }
}

// 查询地区下支持的EIP线路
const eipLineTypeList = ref<any[]>([])
const getEipLineTypeFn = async (regionId = cvmStore.areaSelect.id) => {
  const params = {
    chargeType: 1,
    regionId,
  }
  try {
    const res = await getEipLineType(params)
    if (res.success) {
      const list = lineTypeList.filter(item => (res.data || []).includes(item.value))
      eipLineTypeList.value = list
      iptFilterConfig.value[1].list = list
    }
  } catch (err) {
    console.log('error', err)
  }
}

// 获取列表数据
const getList = async (search = filterInputRef.value?.searchParams || {}) => {
  const params = {
    ...search,
    regionId: cvmStore.areaSelect.id,
    pageSize: paginationConfig.pagination.pageSize,
    pageIndex: paginationConfig.pagination.page,
  }
  loading.value = true
  try {
    const res = await shareTrafficPackageList(params)
    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    loading.value = false
  }
}

const paginationChange = () => {
  getList()
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
  paginationConfig.pagination.page = 1
  resetIptFn()
  getEipLineTypeFn(area?.id)
}

// 刷新列表
const refreshPage = () => {
  paginationConfig.pagination.page = 1
  resetIptFn()
  getEipLineTypeFn()
}

// 新增
const setAddRef = ref<any>()
const setBuyFn = () => {
  setAddRef.value.show = true
}

// 跳转详情
const goDetail = (id, uuid) => {
  pushRoute({
    name: 'network_security_flow-packet_detail',
    query: {
      id,
      uuid,
    },
  })
}

// 添加公网IP
const addEipRef = ref<any>()
const addEipFn = row => {
  addEipRef.value.detailData = row
  addEipRef.value.show = true
}

// 更多操作
const removeEipRef = ref<any>()
const handleOperatechange = (v, row) => {
  if (v.value === 'removeEip') {
    removeEipRef.value.detailData = row
    removeEipRef.value.show = true
  } else if (v.value === 'viewMonitoring') {
    pushRoute({
      name: 'network_security_flow-packet_detail',
      query: {
        id: row.id,
        uuid: row.pkgUuid,
        tab: 2,
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
.table {
  .w200 {
    width: 200px;
  }

  .size-box {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    color: #999;
  }

  .mb4 {
    margin-bottom: 4px;
  }

  .select-tr {
    margin-left: -12px;

    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;

      .el-input__inner {
        &::placeholder {
          color: var(--primary-color) !important;
        }

        color: var(--primary-color) !important;
      }
    }
  }
}
</style>
