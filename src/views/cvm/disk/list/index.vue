<template>
  <div>
    <PageHeader :title="t('disk.list.disk')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <div style="padding: 20px" class="page-box">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <!-- 新建 -->
            <el-button v-if="checkPermission(permMap.disk.CREATE_HD)" type="primary" @click="changeShow(createDiskRef)">
              {{ t('disk.list.create') }}
            </el-button>
            <!-- 挂载 -->
            <TooltipBtn
              v-if="checkPermission(permMap.disk.ATTACH_HD_TO_VM)"
              v-model:visible="monutConfig.visible"
              :text="t('disk.list.monut')"
              :disabled="monutConfig.disabled"
              :content="monutConfig.content"
              @click="changeShow(mountRef)"
            />
            <!-- 卸载 -->
            <TooltipBtn
              v-if="checkPermission(permMap.disk.DETTACH_HD_FROM_VM)"
              v-model:visible="uninstallConfig.visible"
              :text="t('disk.list.uninstall')"
              :disabled="uninstallConfig.disabled"
              :content="uninstallConfig.content"
              @click="changeShow(uninstallRef)"
            />
            <!-- 销毁/退还 -->
            <!-- <TooltipBtn
              :text="t('disk.list.destruction')"
              :disabled="destructionConfig.disabled"
              v-model:visible="destructionConfig.visible"
              :content="destructionConfig.content"
              @click="changeShow(destructionRef)"
            /> -->
          </div>

          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('disk.list.listPh')"
              :filter-list="iptFilterConfig"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" @click="refresh">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table
          v-loading="loading"
          :data="list"
          class="mt20 table"
          @selection-change="handleRowSelectChange"
          @row-click="row => console.log(row)"
        >
          <el-table-column type="selection" width="40" />
          <!-- ID/名称 -->
          <el-table-column min-width="240" :label="t('disk.list.idName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <el-badge v-if="row.renewFlag === 1" :value="t('disk.list.continue')" class="item" type="warning">
                  <div class="text-primary pointer mr10">
                    <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
                  </div>
                </el-badge>
                <div v-else class="text-primary pointer mr4">
                  <Copy :text="row.diskId" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
                <div class="text-over">
                  {{ row.diskName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column min-width="230" :label="t('disk.list.state')" show-overflow-tooltip>
            <template #header>
              <TableHeadFilter
                ref="stateThFilterRef"
                v-model="tableFilterConfig.states.value"
                :label="t('disk.list.state')"
                tip=""
                :field-key="tableFilterConfig.states.fieldKey"
                :field-type="tableFilterConfig.states.fieldType"
                :list="tableFilterConfig.states.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div style="display: inline-block">
                <div class="df ac">
                  <StatusGroup :list="DISK_STATE_ARR_MAP" :value="row.state" />
                  <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 可用区 -->
          <el-table-column min-width="150" :label="t('disk.list.zone')">
            <template #header>
              <TableHeadFilter
                ref="zoneNameThFilterRef"
                v-model="tableFilterConfig.zoneIds.value"
                :label="t('disk.list.zone')"
                tip=""
                :field-key="tableFilterConfig.zoneIds.fieldKey"
                :field-type="tableFilterConfig.zoneIds.fieldType"
                :list="tableFilterConfig.zoneIds.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div>{{ row.zoneName }}</div>
            </template>
          </el-table-column>
          <!-- 属性 -->
          <el-table-column min-width="150" :label="t('disk.list.attr')">
            <template #header>
              <TableHeadFilter
                ref="typeThFilterRef"
                v-model="tableFilterConfig.typeList.value"
                :label="t('disk.list.attr')"
                tip=""
                :field-key="tableFilterConfig.typeList.fieldKey"
                :field-type="tableFilterConfig.typeList.fieldType"
                :list="tableFilterConfig.typeList.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div>{{ DISK_TYPE_MAP[row.type] }}</div>
            </template>
          </el-table-column>
          <!-- 数据保护 后端没有字段-->
          <!-- <el-table-column min-width="200" :label="t('数据保护')">
            <template #header>
              <TableHeadFilter v-model="status" :label="t('数据保护')" tip="" show-all :list="statusOpts" />
            </template>
            <template #default="{ row }">
              <div>数据保护</div>
            </template>
          </el-table-column> -->
          <!-- 类型 -->
          <el-table-column min-width="200" :label="t('disk.list.diskType')">
            <template #header>
              <TableHeadFilter
                ref="diskTypeThFilterRef"
                v-model="tableFilterConfig.diskTypeList.value"
                :label="t('disk.list.diskType')"
                tip=""
                :field-key="tableFilterConfig.diskTypeList.fieldKey"
                :field-type="tableFilterConfig.diskTypeList.fieldType"
                :list="tableFilterConfig.diskTypeList.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div>{{ row.diskType || '-' }}</div>
            </template>
          </el-table-column>
          <!-- 容量 -->
          <el-table-column min-width="120" sortable :label="t('disk.list.size')" :sort-method="sortMethod">
            <template #default="{ row }">
              <div>{{ row.size }}GiB</div>
            </template>
          </el-table-column>
          <!-- 关联实例 -->
          <el-table-column min-width="200" :label="t('disk.list.associateIns')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="handleAssociateIns(row).show" class="text-primary">
                  {{ row.insUuid }}
                </div>
                <div v-if="handleAssociateIns(row).show" class="text-over">
                  {{ row.instanceName }}
                </div>
                <div v-if="!handleAssociateIns(row).show">-</div>
              </div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('disk.list.createTime')" show-overflow-tooltip>
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('disk.list.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <span>{{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}</span>
            </template>
          </el-table-column>
          <!-- 过期时间 -->
          <el-table-column min-width="220" :label="t('disk.list.expiredTime')" show-overflow-tooltip>
            <template #header>
              <div class="df ac">
                <span>{{ t('disk.list.expiredTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <span>{{ row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '-' }}</span>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column fixed="right" min-width="280" :label="t('disk.list.opts')">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 续费 -->
                <DisableText
                  v-if="checkPermission(permMap.disk.HD_RENEWAL)"
                  class="mr20"
                  :disabled="!isRenew(row.type, row.costType, row.state)"
                  :text="t('disk.list.renew')"
                  @click="handleRenew(row)"
                />
                <!-- 创建快照 -->
                <DisableText
                  v-if="checkPermissionSnapshot(permMap.snapshot.CREATE_HD_SNAPSHOT)"
                  class="mr20"
                  :disabled="!isCreateSnapshot(row.type, row.state)"
                  :text="t('disk.list.createSnapshot')"
                  @click="handleCreateSnapshot(row)"
                />
                <!-- 更多 -->
                <div v-if="diskMoreList(row.costType).length" style="width: 130px">
                  <el-select
                    :teleported="true"
                    class="select-tr"
                    :placeholder="t('disk.list.more')"
                    suffix-icon=""
                    @change="
                      v => {
                        handleOperatechange(v, row)
                      }
                    "
                  >
                    <el-option
                      v-for="item in diskMoreList(row.costType)"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label"
                      :disabled="selectOptDisabled(item, row)"
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
      </div>
    </div>

    <!-- 创建硬盘 -->
    <CreateDisk ref="createDiskRef" @success="listDiskFn" />
    <!-- 挂载 -->
    <Mount ref="mountRef" :disk-list="monutConfig.list" @success="listDiskFn" />
    <!-- 卸载 -->
    <Uninstall ref="uninstallRef" :disk-list="uninstallConfig.list" @success="listDiskFn" />
    <!-- 销毁/退还 -->
    <Destruction ref="destructionRef" :disk-list="destructionConfig.list" @success="listDiskFn" />
    <!-- 续费 -->
    <Renew ref="renewRef" :disk="disk" @success="listDiskFn" />
    <!-- 创建快照 -->
    <CreateSnapshot ref="createSnapshotRef" :disk="disk" @success="listDiskFn" />
    <!-- 分配至项目 -->
    <SetProject ref="setProjectRef" :disk="disk" @success="listDiskFn" />
    <!-- 自动续费 -->
    <SetAutoRenew ref="setAutoRenewRef" :disk="disk" @success="listDiskFn" />
    <!-- 取消自动续费 -->
    <CancelAutoRenew ref="cancelAutoRenewRef" :disk="disk" @success="listDiskFn" />
    <!-- 重新初始化云硬盘 -->
    <!-- <Init ref="initRef" /> -->
    <!-- 按量转包年包月 -->
    <FlowToTime ref="flowToTimeRef" :disk="disk" />
    <!-- 包年包月转按量 -->
    <TimeToFlow ref="timeToFlowRef" @success="listDiskFn" />
    <!-- 云硬盘扩容 -->
    <Expans ref="expansRef" :disk="disk" @success="listDiskFn" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import CreateSnapshot from './components/create-snapshot.vue'
import SetProject from './components/set-project.vue'
import Mount from './components/mount.vue'
import SetAutoRenew from './components/set-auto-renew.vue'
import CancelAutoRenew from './components/cancel-auto-renew.vue'
import Destruction from './components/destruction.vue'
import Uninstall from './components/uninstall.vue'
// import Init from './components/init.vue'
import Renew from './components/renew.vue'
import FlowToTime from './components/flow-to-time.vue'
import TimeToFlow from './components/time-to-flow.vue'
import CreateDisk from './components/create-disk.vue'
import Expans from './components/expans.vue'
import { AreaSelectType } from '@/store/cvm'
import {
  DISK_TYPE_MAP,
  DISK_STATE_ARR_MAP,
  DISK_MORE_OPTS,
  DISK_STATE_FILTER_ARR_MAP,
  DISK_TYPE_FILTER_MAP,
  isMount,
  isRenew,
  isExpans,
  isUninstall,
  isDestruction,
  isSetAutoRenew,
  isSetProject,
  isCreateSnapshot,
  isDataDisk,
  isMountBatch,
  isUninstallBatch,
  isDestructionBatch,
  isTimeCost,
  isFlowCost,
  isRecovery,
  isFlowToTime,
  DISK_DEFAULT_STATES,
} from '@/views/cvm/disk/config'
import { useCvmStore } from '@/store'

import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { httpUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const defaultTableFilterConfig: TableFilterConfigType = {
  states: {
    value: [],
    opts: DISK_STATE_FILTER_ARR_MAP,
    fieldKey: 'states',
    fieldType: 'check',
  },
  zoneIds: {
    value: [],
    opts: [],
    fieldKey: 'zoneIds',
    fieldType: 'check',
  },
  typeList: {
    value: [],
    opts: DISK_TYPE_FILTER_MAP,
    fieldKey: 'typeList',
    fieldType: 'check',
  },
  diskTypeList: {
    value: [],
    opts: [],
    fieldKey: 'diskTypeList',
    fieldType: 'check',
  },
}

const defaultIptFilterConfig = [
  { fieldName: t('disk.list.diskId'), fieldKey: 'diskId' },
  { fieldName: t('disk.list.state'), fieldKey: 'states', fieldType: 'check', list: DISK_STATE_FILTER_ARR_MAP },
  { fieldName: t('disk.list.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] },
  { fieldName: t('disk.list.attr'), fieldKey: 'typeList', fieldType: 'check', list: DISK_TYPE_FILTER_MAP },
  {
    fieldName: t('disk.list.diskType'),
    fieldKey: 'diskTypeList',
    fieldType: 'check',
    list: [],
  },
]

const cvmStore = useCvmStore()
const { listDiskPrice, listDisk, loading } = useDisk()
const { listByRegionId } = useBaseConfig()
const { handleThSelectFn, handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)

// 地区
const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})

const disk = ref<any>({}) // 当前硬盘
const list = ref<any[]>([]) // 列表
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const selectList = ref<any[]>([]) // 选中的
// 挂载配置
const monutConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('disk.list.monutDesc1'),
})

// 卸载配置
const uninstallConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('disk.list.uninstallDesc1'),
})

// 销毁/退还配置
const destructionConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('disk.list.destructionDesc1'),
})

const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>() // 创建快照
const setProjectRef = ref<InstanceType<typeof SetProject>>() // 分配至项目
const mountRef = ref<InstanceType<typeof Mount>>() // 挂载云硬盘
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>() // 自动续费
const cancelAutoRenewRef = ref<InstanceType<typeof CancelAutoRenew>>() // 取消自动续费
const destructionRef = ref<InstanceType<typeof Destruction>>() // 销毁
const uninstallRef = ref<InstanceType<typeof Uninstall>>() // 卸载
// const initRef = ref<InstanceType<typeof Init>>() // 重新初始化云硬盘
const renewRef = ref<InstanceType<typeof Renew>>() // 续费
const flowToTimeRef = ref<InstanceType<typeof FlowToTime>>() // 按量转包年包月
const timeToFlowRef = ref<InstanceType<typeof TimeToFlow>>() // 包年包月转按量
const createDiskRef = ref<InstanceType<typeof CreateDisk>>() // 创建硬盘
const expansRef = ref<InstanceType<typeof Expans>>() // 云硬盘扩容
const stateThFilterRef = ref<any>()
const zoneNameThFilterRef = ref<any>()
const typeThFilterRef = ref<any>()
const diskTypeThFilterRef = ref<any>()
let listDiskRequestId = 0

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 2,
    },
    resourcesStateType: 'number',
    deleteStateValue: [10, 99],
  },
  list,
)
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.disk,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)
// 厂商权限配置
const permConfigSnapshot = reactive({
  moduleId: moduleMap.snapshot,
  regionId: 0,
})
const { checkPermission: checkPermissionSnapshot } = useCvmAndNetworkPermission(permConfigSnapshot)

// 更多操作list
const diskMoreList = (costType: number) => {
  const filterCb = el => {
    // 判断不同厂商和不同计费模式支持的功能
    if (el.perm) {
      return checkPermission(el.perm) && el.costType.includes(costType)
    } else {
      return el.costType.includes(costType)
    }
  }

  return DISK_MORE_OPTS.filter(filterCb)
}

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)

  paginationConfig.pagination.page = 1

  stateThFilterRef.value?.updateCheck(search?.states)
  zoneNameThFilterRef.value?.updateCheck(search?.zoneIds)
  typeThFilterRef?.value.updateCheck(search?.typeList)
  diskTypeThFilterRef?.value.updateCheck(search?.diskTypeList)

  listDiskFn(search)
}

// 表格的筛选项同步到搜索框搜索项中
const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  console.log(`tableCheckFilterFn===>`, list, fieldKey)
  if (fieldKey === 'zoneIds') {
    handleThCheckFn(list, 'zoneIds', t('disk.list.zone'))
  }
  if (fieldKey === 'states') {
    handleThCheckFn(list, 'states', t('disk.list.state'))
  }
  if (fieldKey === 'typeList') {
    handleThCheckFn(list, 'typeList', t('disk.list.attr'))
  }
  if (fieldKey === 'diskTypeList') {
    handleThCheckFn(list, 'diskTypeList', t('disk.list.diskType'))
  }
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
  permConfigSnapshot.regionId = area.id
}

// 关联实例
const handleAssociateIns = (row: any) => {
  const config: any = {
    show: false,
  }
  config.show = row.insUuid || row.instanceName ? true : false

  return config
}

const refresh = () => {
  start()
  resetIptFn()
  // listDiskFn()
}

// 跳转详情
const toDetail = (row: any) => {
  const id = row.id

  pushRoute({
    name: 'disk_detail',
    params: {
      id,
    },
  })
}

// 排序
const sortMethod = (a, b) => {
  return a.size - b.size
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 续费
const handleRenew = (row: any) => {
  disk.value = row
  changeShow(renewRef.value)
}

// 创建快照
const handleCreateSnapshot = (row: any) => {
  disk.value = row
  changeShow(createSnapshotRef.value)
}

// select opt disabled
const selectOptDisabled = (v: any, row: any) => {
  // 扩容
  if (v.value === 'expans') {
    return !isExpans(row.state)
  }

  // 挂载
  if (v.value === 'mount') {
    return !isMount(row.type, row.state)
  }

  // 卸载
  if (v.value === 'uninstall') {
    return !isUninstall(row.type, row.state)
  }

  // 自动续费
  if (v.value === 'setAutoRenew') {
    return !isSetAutoRenew(row.type, row.costType, row.state)
  }

  // 销毁/退还
  if (v.value === 'destruction') {
    return !isDestruction(row.type, row.state)
  }

  // 分配至项目
  if (v.value === 'setProject') {
    return !isSetProject(row.state)
  }

  // 按量转包年包月
  if (v.value === 'flowToTime') {
    return !isFlowToTime(row.type, row.costType, row.state)
  }
}

// 操作
const handleOperatechange = (v: any, row: any) => {
  // console.log(`handleOperatechange===>`, v, row)

  // 扩容
  if (v === 'expans') {
    if (isExpans(row.state)) {
      disk.value = row
      changeShow(expansRef.value)
    }
  }

  // 挂载
  if (v === 'mount') {
    if (isMount(row.type, row.state)) {
      monutConfig.list = [row]
      changeShow(mountRef.value)
    }
  }

  // 卸载
  if (v === 'uninstall') {
    if (isUninstall(row.type, row.state)) {
      uninstallConfig.list = [row]
      changeShow(uninstallRef.value)
    }
  }

  // 销毁/退还
  if (v === 'destruction') {
    if (isDestruction(row.type, row.state)) {
      destructionConfig.list = [row]
      changeShow(destructionRef.value)
    }
  }

  // 自动续费
  if (v === 'setAutoRenew') {
    if (isSetAutoRenew(row.type, row.costType, row.state)) {
      disk.value = row
      changeShow(row.renewFlag === 1 ? cancelAutoRenewRef.value : setAutoRenewRef.value)
    }
  }

  // 分配至项目
  if (v === 'setProject') {
    if (isSetProject(row.state)) {
      disk.value = row
      changeShow(setProjectRef.value)
    }
  }

  // 按量转包年包月
  if (v === 'flowToTime') {
    if (isFlowToTime(row.type, row.costType, row.state)) {
      disk.value = row
      changeShow(flowToTimeRef.value)
    }
  }
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  // console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection

  changeMonutConfig()
  changeUninstallConfig()
  changeDestructionConfig()
}

// 批量挂载
const changeMonutConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    monutConfig.content = t('disk.list.monutDesc1')
    monutConfig.disabled = true
    return
  } else {
    // 勾选

    // 数量
    const numberBool: boolean = selectList.value.length > 10
    console.log(`numberBool===>`, numberBool)

    if (numberBool) {
      monutConfig.content = t('disk.list.monutDesc2')
      monutConfig.disabled = true
      return
    }

    // 磁盘属性为数据盘
    const typeBool: boolean = selectList.value.every(el => isDataDisk(el.type))
    console.log(`typeBool===>`, typeBool)

    if (!typeBool) {
      monutConfig.content = t('disk.list.monutDesc3')
      monutConfig.disabled = true
      return
    }

    // 仅支持批量挂载在同一可用区的云硬盘
    const zoneIds: any[] = selectList.value.map(el => el.zoneId)
    const zoneIdBool: boolean = zoneIds.every(el => el === zoneIds[0])
    // console.log(`zoneIdBool===>`, zoneIdBool, zoneIds)

    if (!zoneIdBool) {
      monutConfig.content = t('disk.list.monutDesc1')
      monutConfig.disabled = true
      return
    }

    // 磁盘状态
    const stateBool: boolean = isMountBatch(
      selectList.value.map(el => el.type),
      selectList.value.map(el => el.state),
    )
    // console.log(`stateBool===>`, stateBool)

    if (!stateBool) {
      monutConfig.content = t('disk.list.monutDesc4')
      monutConfig.disabled = true
      return
    }

    monutConfig.list = selectList.value
    monutConfig.disabled = false
  }
}

// 批量卸载
const changeUninstallConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    uninstallConfig.content = t('disk.list.uninstallDesc1')
    uninstallConfig.disabled = true
    return
  } else {
    // 勾选

    // 数量
    const numberBool: boolean = selectList.value.length > 10
    // console.log(`numberBool===>`, numberBool)

    if (numberBool) {
      uninstallConfig.content = t('disk.list.uninstallDesc2')
      uninstallConfig.disabled = true
      return
    }

    // 磁盘属性为数据盘
    const typeBool: boolean = selectList.value.every(el => isDataDisk(el.type))
    // console.log(`typeBool===>`, typeBool)

    if (!typeBool) {
      uninstallConfig.content = t('disk.list.uninstallDesc3')
      uninstallConfig.disabled = true
      return
    }

    // 磁盘状态
    const stateBool: boolean = isUninstallBatch(
      selectList.value.map(el => el.type),
      selectList.value.map(el => el.state),
    )
    // console.log(`stateBool===>`, stateBool)

    if (!stateBool) {
      uninstallConfig.content = t('disk.list.uninstallDesc1')
      uninstallConfig.disabled = true
      return
    }

    uninstallConfig.list = selectList.value
    uninstallConfig.disabled = false
  }
}

// 批量销毁/退还
const changeDestructionConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    destructionConfig.content = t('disk.list.destructionDesc1')
    destructionConfig.disabled = true
    return
  } else {
    // 勾选

    // 数量
    const numberBool: boolean = selectList.value.length > 10
    // console.log(`批量销毁/退还 numberBool===>`, numberBool)

    if (numberBool) {
      destructionConfig.content = t('disk.list.destructionDesc2')
      destructionConfig.disabled = true
      return
    }

    // 磁盘属性为数据盘
    const typeBool: boolean = selectList.value.every(el => isDataDisk(el.type))

    if (!typeBool) {
      destructionConfig.content = t('disk.list.destructionDesc3')
      destructionConfig.disabled = true
      return
    }

    // 所选只能是包年包月或按量计费
    const timeCostRes = selectList.value.every(el => isTimeCost(el.costType))
    const flowCostRes = selectList.value.every(el => isFlowCost(el.costType))
    if (!(timeCostRes || flowCostRes)) {
      destructionConfig.content = t('disk.list.destructionDesc4')
      destructionConfig.disabled = true
      return
    }

    // 磁盘状态
    const stateBool: boolean = isDestructionBatch(
      selectList.value.map(el => el.type),
      selectList.value.map(el => el.state),
      selectList.value.map(el => el.costType),
    )
    // console.log(`批量销毁/退还 stateBool===>`, stateBool)

    if (!stateBool) {
      destructionConfig.content = t('disk.list.destructionDesc1')
      destructionConfig.disabled = true
      return
    }

    destructionConfig.list = selectList.value
    destructionConfig.disabled = false
  }
}

// 分页
const paginationChange = () => {
  listDiskFn()
}

// 硬盘列表
const listDiskFn = async (search = filterInputRef.value?.searchParams) => {
  const requestId = ++listDiskRequestId
  const cb = (res: any) => {
    if (requestId !== listDiskRequestId) return

    if (res.success) {
      // 过滤待回收状态
      // list.value = (res.data?.list || []).filter(el => !isRecovery(el.state))
      list.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  }
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    regionId: cvmStore.areaSelect.id,
    states: DISK_DEFAULT_STATES,
    ...search,
  }

  notice(2)
  listDisk(params, cb)
}

// 硬盘类型列表
const listDiskPriceFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      iptFilterConfig.value[4].list = (res.data || []).map(el => ({ value: el.diskName, label: el.diskName }))
      tableFilterConfig.diskTypeList.opts = (res.data || []).map(el => ({ value: el.diskName, label: el.diskName }))
    }
  }

  const params = {
    costType: 2,
    regionId: cvmStore.areaSelect.id,
  }

  listDiskPrice(params, cb)
}

// 处理可用区
const listByRegionIdFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      const zoneList = res.data || []
      const arr = zoneList.map(el => ({
        label: el.zoneName,
        value: el.id,
      }))

      iptFilterConfig.value[2].list = arr
      tableFilterConfig.zoneIds.opts = arr
    }
  }
  const params = {
    regionId: cvmStore.areaSelect.id,
  }
  listByRegionId(params, cb)
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    resetIptFn()
    listDiskFn()
    listByRegionIdFn()
    listDiskPriceFn()
  },
)

onMounted(() => {
  useTempStore().setPageHeader(false)
  listDiskFn()
  listByRegionIdFn()
  listDiskPriceFn()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';

.table {
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

:deep(.chargeTypeColumn .cell) {
  overflow: visible;
}

:deep(.el-badge__content.is-fixed) {
  transform: translateY(0%) translateX(100%);
}

:deep(.select-input) {
  width: 650px;

  .el-select_content {
    width: 580px;

    .select_tags-list {
      max-width: 450px;
    }
  }
}
</style>
