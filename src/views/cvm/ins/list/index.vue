<template>
  <div>
    <PageHeader :title="t('ins.list.ins')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <div class="page-box pd20">
        <div class="df jsb flex-wrap">
          <div class="btn-wrap mr20">
            <!-- 新建 -->
            <el-button v-if="checkPermission(permMap.ins.CREATE_VM)" type="primary" class="mb20" @click="create">
              {{ t('ins.list.create') }}
            </el-button>
            <!-- 开机 -->
            <TooltipBtn
              v-if="checkPermission(permMap.ins.START_VM)"
              v-model:visible="powerOnConfig.visible"
              class="mb20"
              :text="t('ins.list.powerOn')"
              :disabled="powerOnConfig.disabled"
              :content="powerOnConfig.content"
              @click="
                () => {
                  powerOnConfig.list = selectList
                  changeShow(powerOnRef)
                }
              "
            />
            <!-- 关机 -->
            <TooltipBtn
              v-if="checkPermission(permMap.ins.STOP_VM)"
              v-model:visible="shutdownConfig.visible"
              class="mb20"
              :text="t('ins.list.shutdown')"
              :disabled="shutdownConfig.disabled"
              :content="shutdownConfig.content"
              @click="
                () => {
                  shutdownConfig.list = selectList
                  changeShow(shutdownRef)
                }
              "
            />
            <!-- 重启 -->
            <TooltipBtn
              v-if="checkPermission('/CVM/REBOOT_VM')"
              v-model:visible="restartConfig.visible"
              class="mb20"
              :text="t('ins.list.restart')"
              :disabled="restartConfig.disabled"
              :content="restartConfig.content"
              @click="
                () => {
                  restartConfig.list = selectList
                  changeShow(restartRef)
                }
              "
            />
            <!-- 续费 -->
            <TooltipBtn
              v-if="checkPermission(permMap.ins.VM_RENEW)"
              v-model:visible="renewConfig.visible"
              class="mb20"
              :text="t('ins.list.renew')"
              :disabled="renewConfig.disabled"
              :content="renewConfig.content"
              @click="
                () => {
                  renewConfig.list = selectList
                  changeShow(renewRef)
                }
              "
            />
            <!-- 重置密码 -->
            <TooltipBtn
              v-if="checkPermission(permMap.ins.RESET_VM_PWD)"
              v-model:visible="setPwdConfig.visible"
              class="mb20"
              :text="t('ins.list.setPwd')"
              :disabled="setPwdConfig.disabled"
              :content="setPwdConfig.content"
              @click="
                () => {
                  setPwdConfig.list = selectList
                  changeShow(setPwdRef)
                }
              "
            />
            <!-- 销毁/退还 -->
            <!-- <TooltipBtn
              class="mb20"
              :text="t('ins.list.destruction')"
              :disabled="destructionConfig.disabled"
              v-model:visible="destructionConfig.visible"
              :content="destructionConfig.content"
              @click="
                () => {
                  destructionConfig.list = selectList
                  changeShow(destructionRef)
                }
              "
            /> -->

            <!-- 更多操作 -->
            <Select
              v-if="insMoreList.length"
              class="ml10 mb20"
              :one-menu-width="moreSelectOneMenuWidth"
              :select-width="moreSelectOneMenuWidth"
              :list="insMoreList"
              :ph="t('ins.list.more')"
              @opt-click="moreOptClickFn"
            />
          </div>
          <div class="search-wrap df mb20">
            <div>
              <FilterInput
                ref="filterInputRef"
                :placeholder="t('ins.list.listPh')"
                :filter-list="iptFilterConfig"
                @search="searchFn"
              />
            </div>
            <CdnIconButton class="ml10" @click="refresh">
              <SvgIcon name="refresh" />
            </CdnIconButton>
            <CdnIconButton class="" @click="changeShow(exportRef)">
              <SvgIcon name="cat-cdn-download" />
            </CdnIconButton>
          </div>
        </div>
        <el-table
          v-loading="loading"
          :data="list"
          @selection-change="handleRowSelectChange"
          @row-click="row => console.log(row)"
        >
          <el-table-column type="selection" width="40" />
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('ins.list.idName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <el-badge v-if="row.autoRenew" :value="t('disk.list.continue')" class="item" type="warning">
                  <div class="text-primary pointer mr10">
                    <Copy :text="row.insUuid" style="display: inline-block" @handle-click="toDetail(row)" />
                  </div>
                </el-badge>
                <div v-else class="text-primary pointer mr4">
                  <Copy :text="row.insUuid" style="display: inline-block" @handle-click="toDetail(row)" />
                </div>
                <div class="text-over">
                  {{ row.instanceName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 监控 -->
          <el-table-column min-width="140" :label="t('ins.list.monitor')">
            <template #default="{ row }">
              <div class="text-primary pointer" @click="toMonitor(row)">
                {{ t('ins.list.seeMonitor') }}
              </div>
            </template>
          </el-table-column>
          <!-- 状态 -->
          <el-table-column min-width="140">
            <template #header>
              <TableHeadFilter
                ref="statesThFilterRef"
                v-model="tableFilterConfig.states.value"
                :label="t('ins.list.state')"
                tip=""
                show-all
                :list="tableFilterConfig.states.opts"
                :field-key="tableFilterConfig.states.fieldKey"
                :field-type="tableFilterConfig.states.fieldType"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div class="df ac">
                <StatusGroup :list="INS_STATE_ARR_MAP" :value="row.state" />
                <SvgIcon v-if="row.loadingState" class="ml4" name="loading" />
              </div>
            </template>
          </el-table-column>
          <!-- 可用区 -->
          <el-table-column min-width="150">
            <template #header>
              <TableHeadFilter
                ref="zoneNameThFilterRef"
                v-model="tableFilterConfig.zoneIds.value"
                :label="t('ins.list.zone')"
                tip=""
                :field-key="tableFilterConfig.zoneIds.fieldKey"
                :field-type="tableFilterConfig.zoneIds.fieldType"
                :list="tableFilterConfig.zoneIds.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              {{ row.zoneName }}
            </template>
          </el-table-column>
          <!-- 实例类型 -->
          <el-table-column min-width="160" :label="t('ins.list.insType')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="df ac">
                  <span class="mr10 text-over" style="max-width: calc(100% - 27px)">{{
                    row.specificationInfo?.typeName
                  }}</span>
                  <SvgIcon
                    style="width: 17px; height: 17px"
                    :name="INS_SYS_SVG_MAP[row.imageInfo?.platform]?.actived || ''"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 实例配置 -->
          <el-table-column min-width="200" :label="t('ins.list.config')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ row.specificationInfo?.vcpus }}vCPUs | {{ row.specificationInfo?.ram }}GB |
                  {{ row.specificationInfo?.specificationName }}
                </div>
                <div class="text-over">
                  {{ row.imageInfo?.imageName }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 主IPv4地址 -->
          <el-table-column min-width="200" :label="t('ins.list.IPv4')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div v-if="handleRowIp(row).show && handleRowIp(row).mainPublicIp" class="text-over">
                  <!-- <span>{{ handleRowIp(row).mainPublicIp }}</span
                  ><span>{{ t('ins.list.eip') }}</span> -->
                  <TableCopy
                    :show-text="`${handleRowIp(row).mainPublicIp}${t('ins.list.eip')}`"
                    :text="handleRowIp(row).mainPublicIp"
                  />
                </div>
                <div v-if="handleRowIp(row).show && handleRowIp(row).mainPrivateIp" class="text-over">
                  <!-- {{ handleRowIp(row).mainPrivateIp }}<span>{{ t('ins.list.private') }}</span> -->
                  <TableCopy
                    :show-text="`${handleRowIp(row).mainPrivateIp}${t('ins.list.private')}`"
                    :text="handleRowIp(row).mainPrivateIp"
                  />
                </div>
                <span v-if="!handleRowIp(row).show">-</span>
              </div>
            </template>
            <!-- <template #default v-else>
              <span>-</span>
            </template> -->
          </el-table-column>
          <!-- 实例计费模式 -->
          <el-table-column min-width="220" show-overflow-tooltip>
            <template #header>
              <TableHeadFilter
                ref="instanceChargeTypeThFilterRef"
                v-model="tableFilterConfig.instanceCostTypes.value"
                :label="t('ins.list.insCostType')"
                tip=""
                :field-key="tableFilterConfig.instanceCostTypes.fieldKey"
                :field-type="tableFilterConfig.instanceCostTypes.fieldType"
                :list="tableFilterConfig.instanceCostTypes.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ COST_TYPE_MAP[row.instanceChargeType] }}
                </div>
                <div v-if="row.instanceChargeType === 1" class="text-over">
                  {{
                    t('ins.list.createTime', [row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : ''])
                  }}
                </div>
                <div v-if="row.instanceChargeType === 2" class="text-over">
                  {{
                    t('ins.list.expiresTime', [row.expiresTime ? maoYunDayJs(row.expiresTime).format(FORMAT_TIME) : ''])
                  }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 网络计费模式 -->
          <el-table-column min-width="200" show-overflow-tooltip>
            <template #header>
              <TableHeadFilter
                ref="networkChangeTypeThFilterRef"
                v-model="tableFilterConfig.networkCostTypes.value"
                :label="t('ins.list.netCostType')"
                tip=""
                show-all
                :field-key="tableFilterConfig.networkCostTypes.fieldKey"
                :field-type="tableFilterConfig.networkCostTypes.fieldType"
                :list="tableFilterConfig.networkCostTypes.opts"
                @change="tableCheckFilterFn"
              />
            </template>
            <template #default="{ row }">
              {{ handleRowNetworkChangeType(row) }}
            </template>
          </el-table-column>
          <!-- 所属项目 -->
          <!-- <el-table-column min-width="200" :label="t('ins.list.project')">
            <template #header>
              <TableHeadFilter
                ref="projectNameThFilterRef"
                v-model="tableFilterConfig.projectName.value"
                :label="t('所属项目')"
                tip=""
                show-all
                :fieldKey="tableFilterConfig.projectName.fieldKey"
                :fieldType="tableFilterConfig.projectName.fieldType"
                :list="tableFilterConfig.projectName.opts"
                @change="tableSelectFilterFn"
              />
            </template>
            <template #default="{ row }">
              <Copy :text="row.projectName" />
            </template>
          </el-table-column> -->
          <!-- 操作 -->
          <el-table-column fixed="right" :min-width="optionsWidth" :label="t('ins.list.opts')">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 修改配置 -->
                <Select
                  v-if="insModifyConfigList(row.instanceChargeType).length"
                  ref="modifyConfigRef"
                  :one-menu-width="modifyConfigSelectOneMenuWidth"
                  :select-width="modifyConfigSelectWidth"
                  :list="insModifyConfigList(row.instanceChargeType)"
                  two-menu-align="lt"
                  :ph="t('ins.list.modifyConfig')"
                  :no-border="true"
                  @opt-click="modifyConfigOptClickFn($event, row)"
                  @visible-change="visibleChangeModifyConfig($event, row)"
                />
                <!-- 续费 -->
                <DisableText
                  v-if="checkPermission(permMap.ins.VM_RENEW)"
                  :disabled="!isRenew(row.instanceChargeType, row.state)"
                  :text="t('ins.list.renew')"
                  disabled-type="hidden"
                  @click="singleRenew(row)"
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
      </div>

      <!-- 开机 -->
      <PowerOn ref="powerOnRef" :ins-list="powerOnConfig.list" @success="listInstanceFn" />
      <!-- 关机 -->
      <Shutdown ref="shutdownRef" :ins-list="shutdownConfig.list" @success="listInstanceFn" />
      <!-- 续费 -->
      <Renew ref="renewRef" :ins-list="renewConfig.list" @success="listInstanceFn" />
      <!-- 重启 -->
      <Restart ref="restartRef" :ins-list="restartConfig.list" @success="listInstanceFn" />
      <!-- 重置密码 -->
      <SetPwd ref="setPwdRef" :ins-list="setPwdConfig.list" @success="listInstanceFn" />
      <!-- 销毁/退还 -->
      <Destruction ref="destructionRef" :ins-list="destructionConfig.list" @success="listInstanceFn" />
      <!-- 修改名称 -->
      <SetName ref="setNameRef" :ins-list="setNameConfig.list" @success="listInstanceFn" />
      <!-- 设置自动续费 -->
      <SetAutoRenew ref="setAutoRenewRef" :ins-list="setAutoRenewConfig.list" @success="listInstanceFn" />
      <!-- 设置定时快照策略 -->
      <SetSnapshotPolicy ref="setSnapshotRef" :ins-list="setSnapshotConfig.list" @success="listInstanceFn" />
      <!-- 解绑弹性公网IP -->
      <UnBindIP ref="unBindIPRef" :ins-detail="unBindIPConfig.item" @success="listInstanceFn" />
      <!-- 解绑弹性网卡 -->
      <UnBindNetworkCard
        ref="unBindNetworkCardRef"
        :ins-detail="unBindNetworkCardConfig.item"
        @success="listInstanceFn"
      />
      <!-- 配置安全组 -->
      <SetSecurityGroup
        ref="setSecurityGroupRef"
        :init-select-list="setSecurityGroupConfig.list"
        @success="listInstanceFn"
      />
      <!-- 加入安全组 -->
      <JoinSecurityGroup
        ref="joinSecurityGroupRef"
        :ins-list="joinSecurityGroupConfig.list"
        @success="listInstanceFn"
      />
      <!-- 加载密钥 -->
      <SetSshKey
        ref="setSshKeyRef"
        :ins-list="setSshKeyConfig.list"
        :type="setSshKeyConfig.type"
        @success="listInstanceFn"
      />
      <!-- 分配至项目 -->
      <SetProject ref="setProjectRef" :ins-list="setProjectConfig.list" @success="listInstanceFn" />
      <!-- 创建自定义镜像 -->
      <CreateCustomImage
        ref="createCustomImageRef"
        :ins-list="createCustomImageConfig.list"
        @success="listInstanceFn"
      />
      <!-- 重装系统 -->
      <SetSystem
        ref="setSystemRef"
        :ins-list="setSystemConfig.list"
        :type="setSystemConfig.type"
        @success="listInstanceFn"
      />
      <!-- 切换系统 -->
      <ChangeSystem
        ref="changeSystemRef"
        :ins-list="changeSystemConfig.list"
        :type="changeSystemConfig.type"
        @success="listInstanceFn"
      />
      <!-- 绑定弹性公网IP -->
      <BindIP ref="bindIPRef" :ins-detail="bindIPConfig.item" @success="listInstanceFn" />
      <!-- 调整网络 -->
      <SetNetwork ref="setNetworkRef" :ins-list="setNetworkConfig.list" @success="listInstanceFn" />
      <!-- 绑定弹性网卡 -->
      <BindNetworkCard ref="bindNetworkCardRef" :ins-detail="bindNetworkCardConfig.item" @success="listInstanceFn" />
      <!-- 调整配置 -->
      <SetConfig ref="setConfigRef" :ins-list="setConfig.list" :type="setConfig.type" @success="listInstanceFn" />
      <!-- 导出实例 -->
      <Export ref="exportRef" :cur-search="curSearch" :ids="selectList.map(el => el.id)" />
      <!-- 云硬盘扩容 -->
      <Expans ref="expansRef" :ins-list="expansConfig.list" @success="listInstanceFn" />
      <!-- 按量转包年包月 -->
      <FlowToTime ref="flowToTimeRef" :ins-list="flowToTimeConfig.list" />
      <!-- 包年包月转按量 -->
      <TimeToFlow ref="timeToFlowRef" :ins-list="timeToFlowConfig.list" @success="listInstanceFn" />

      <!-- <div style="width: 50px;height: 50px; background-color: aqua;" @click="changeShow(renewRef)"></div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTempStore, useCvmStore } from '@/store'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import PowerOn from './components/power-on/index.vue'
import Shutdown from './components/shutdown/index.vue'
import Renew from './components/renew/index.vue'
import Restart from './components/restart/index.vue'
import SetPwd from './components/set-pwd/index.vue'
import Destruction from './components/destruction/index.vue'
import SetName from './components/set-name/index.vue'
import SetAutoRenew from './components/set-auto-renew/index.vue'
import SetSnapshotPolicy from './components/set-snapshot-policy/index.vue'
import UnBindIP from './components/un-bind-ip/index.vue'
import UnBindNetworkCard from './components/un-bind-network-card/index.vue'
import SetSecurityGroup from './components/set-security-group/index.vue'
import JoinSecurityGroup from './components/join-security-group/index.vue'
import SetSshKey from './components/set-ssh-key/index.vue'
import SetProject from './components/set-project/index.vue'
import CreateCustomImage from './components/create-custom-image/index.vue'
import SetSystem from './components/set-system/index.vue'
import BindIP from './components/bind-ip/index.vue'
import SetNetwork from './components/set-network/index.vue'
import BindNetworkCard from './components/bind-network-card/index.vue'
import SetConfig from './components/set-config/index.vue'
import Export from './components/export/index.vue'
import Expans from './components/expans/index.vue'
import ChangeSystem from './components/change-system/index.vue'
import FlowToTime from './components/flow-to-time/index.vue'
import TimeToFlow from './components/time-to-flow/index.vue'

import { getEniRefSg } from '@/apis/network/network-card'
import {
  INS_SYS_SVG_MAP,
  INS_STATE_ARR_MAP,
  INS_NETWORK_CHANGE_TYPE_MAP,
  INS_MORE_OPTS,
  INS_MODIFY_CONFIG_OPTS,
  COST_TYPE_MAP,
  INS_STATE_FILTER_ARR_MAP,
  COST_TYPE_FILTER_ARR_MAP,
  INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP,
  isSetName,
  isSetProject,
  isSetAutoRenew,
  isFlowToTime,
  isSetSnapshot,
  isSetSshKey,
  isSetConfig,
  isOtherBuy,
  isPowerOn,
  isShutdown,
  isRestart,
  isDestruction,
  isSetPwd,
  isSetSystem,
  isChangeSystem,
  isCreateCustomImage,
  isSetConfigBatch,
  isSetSshKeyBatch,
  isSetProjectBatch,
  isSetNameBatch,
  isSetAutoRenewBatch,
  isPowerOnBatch,
  isShutdownBatch,
  isRestartBatch,
  isRenew,
  isRenewBatch,
  isTimeCostBatch,
  isSetPwdBatch,
  isDestructionBatch,
  isSetNetwork,
  isSetPrivateNetwork,
  isBindIP,
  isUnBindIP,
  isBindNetworkCard,
  isUnBindNetworkCard,
  isSetSecurityGroup,
  isExpans,
  isSetNetworkBatch,
  isJoinSecurityGroupBatch,
  isSetPrivateNetworkBatch,
  isRecovery,
  INS_DEFAULT_STATES,
} from '@/views/cvm/ins/config'
import { isDataDisk } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import { useFilter, TableFilterConfigType } from '@/components/cvm/query-filter/use-filter'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { AreaSelectType } from '@/store/cvm'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useUpdateResources } from '@/views/cvm/hooks/use-update-resources'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { NoDefaultCreateType } from '@/views/cvm/ins/type'
import { httpUrl } from '@/config/base-config'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const moreSelectOneMenuWidthMap = {
  [ja]: 300,
  [en]: 260,
  [zh]: 200,
}

const modifyConfigSelectOneMenuWidthMap = {
  [ja]: 370,
  [en]: 260,
  [zh]: 200,
}

const modifyConfigSelectWidthMap = {
  [ja]: 100,
  [en]: 200,
  [zh]: 100,
}

const optionsWidthMap = {
  [ja]: 200,
  [en]: 230,
  [zh]: 200,
}

const moreSelectOneMenuWidth = useI18nStyle(moreSelectOneMenuWidthMap)
const modifyConfigSelectOneMenuWidth = useI18nStyle(modifyConfigSelectOneMenuWidthMap)
const modifyConfigSelectWidth = useI18nStyle(modifyConfigSelectWidthMap)
const optionsWidth = useI18nStyle(optionsWidthMap)

const defaultTableFilterConfig: TableFilterConfigType = {
  states: {
    value: [],
    opts: INS_STATE_FILTER_ARR_MAP,
    fieldKey: 'states',
    fieldType: 'check',
  },
  zoneIds: {
    value: [],
    opts: [],
    fieldKey: 'zoneIds',
    fieldType: 'check',
  },
  instanceCostTypes: {
    value: [],
    opts: COST_TYPE_FILTER_ARR_MAP,
    fieldKey: 'instanceCostTypes',
    fieldType: 'check',
  },
  networkCostTypes: {
    value: [],
    opts: INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP,
    fieldKey: 'networkCostTypes',
    fieldType: 'check',
  },
  projectName: {
    value: [],
    opts: [],
    fieldKey: 'projectName',
  },
}
const defaultIptFilterConfig = [
  { fieldName: t('ins.list.insId'), fieldKey: 'instanceId' }, // 实例id
  { fieldName: t('ins.list.state'), fieldKey: 'states', fieldType: 'check', list: INS_STATE_FILTER_ARR_MAP }, // 状态
  { fieldName: t('ins.list.zone'), fieldKey: 'zoneIds', fieldType: 'check', list: [] }, // 可用区
  {
    fieldName: t('ins.list.insCostType'),
    fieldKey: 'instanceCostTypes',
    fieldType: 'check',
    list: COST_TYPE_FILTER_ARR_MAP,
  }, // 实例计费模式
  {
    fieldName: t('ins.list.netCostType'),
    fieldKey: 'networkCostTypes',
    fieldType: 'check',
    list: INS_NETWORK_CHANGE_TYPE_FILTER_ARR_MAP,
  }, // 网络计费模式
  // { fieldName: t('ins.list.project'), fieldKey: 'projectName' }, // 所属项目
]

const cvmStore = useCvmStore()
const { handleThSelectFn, handleThCheckFn, tableFilterConfig, filterInputRef, iptFilterConfig, resetIptFn } = useFilter(
  defaultTableFilterConfig,
  defaultIptFilterConfig,
)
const { listByRegionId } = useBaseConfig()
const { listInstance, loading } = useIns()

// 地区
const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const modifyConfigRef = ref(null)
const list = ref<any[]>([]) // 列表
const selectList = ref<any>([]) // 选中的
const curSearch = ref<any>({}) // 搜索条件
const modifyConfigRaw = ref<any>({})

// 开机配置
const powerOnConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('ins.list.powerOnTip1'),
})

// 关机配置
const shutdownConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('ins.list.shutdownTip1'),
})

// 重启配置
const restartConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('ins.list.restartTip1'),
})

// 续费配置
const renewConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('ins.list.renewTip1'),
})

// 重置密码配置
const setPwdConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('ins.list.setPwdTip1'),
})

//销毁/退还配置
const destructionConfig = reactive<{
  list: any[]
  disabled: boolean
  visible: boolean
  content: string
}>({
  list: [],
  disabled: true,
  visible: false,
  content: t('ins.list.destructionTip1'),
})

//修改名称配置
const setNameConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//分配至项目配置
const setProjectConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//设置自动续费配置
const setAutoRenewConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//设置按量转包年包月
const flowToTimeConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//设置包年包月转按量
const timeToFlowConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//设置定时快照策略配置
const setSnapshotConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//加载密钥配置
const setSshKeyConfig = reactive<{
  type: 'STOPPED' | 'RUNNING'
  list: any[]
}>({
  list: [],
  type: 'STOPPED',
})

//加入安全组配置
const joinSecurityGroupConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//调整配置
const setConfig = reactive<{
  type: 'STOPPED' | 'RUNNING'
  list: any[]
}>({
  type: 'STOPPED',
  list: [],
})

//调整网络配置
const setNetworkConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//重装系统
const setSystemConfig = reactive<{
  type: 'STOPPED' | 'RUNNING'
  list: any[]
}>({
  type: 'STOPPED',
  list: [],
})

//切换系统
const changeSystemConfig = reactive<{
  type: 'STOPPED' | 'RUNNING'
  list: any[]
}>({
  type: 'STOPPED',
  list: [],
})

//创建自定义镜像
const createCustomImageConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//云硬盘扩容
const expansConfig = reactive<{
  list: any[]
}>({
  list: [],
})

//绑定弹性IP
const bindIPConfig = reactive<{
  item: any
}>({
  item: {},
})

//解绑弹性公网IP
const unBindIPConfig = reactive<{
  item: any
}>({
  item: {},
})

//绑定弹性网卡
const bindNetworkCardConfig = reactive<{
  item: any
}>({
  item: {},
})

//解绑弹性网卡
const unBindNetworkCardConfig = reactive<{
  item: any
}>({
  item: {},
})

//配置安全组
const setSecurityGroupConfig = reactive<{
  list: any[]
}>({
  list: [],
})

const powerOnRef = ref<InstanceType<typeof PowerOn>>() // 开机
const shutdownRef = ref<InstanceType<typeof Shutdown>>() // 关机
const renewRef = ref<InstanceType<typeof Renew>>() // 续费
const restartRef = ref<InstanceType<typeof Restart>>() // 重启
const setPwdRef = ref<InstanceType<typeof SetPwd>>() // 重置密码
const destructionRef = ref<InstanceType<typeof Destruction>>() // 销毁
const setNameRef = ref<InstanceType<typeof SetName>>() // 修改名称
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>() // 设置自动续费
const setSnapshotRef = ref<InstanceType<typeof SetSnapshotPolicy>>() // 设置定时快照策略
const unBindIPRef = ref<InstanceType<typeof UnBindIP>>() // 解绑弹性公网IP
const unBindNetworkCardRef = ref<InstanceType<typeof UnBindNetworkCard>>() // 解绑弹性网卡
const setSecurityGroupRef = ref<InstanceType<typeof SetSecurityGroup>>() // 配置安全组
const joinSecurityGroupRef = ref<InstanceType<typeof JoinSecurityGroup>>() // 加入安全组
const setSshKeyRef = ref<InstanceType<typeof SetSshKey>>() // 加载密钥
const setProjectRef = ref<InstanceType<typeof SetProject>>() // 分配至项目
const createCustomImageRef = ref<InstanceType<typeof CreateCustomImage>>() // 创建自定义镜像
const setSystemRef = ref<InstanceType<typeof SetSystem>>() // 重装操作系统
const changeSystemRef = ref<InstanceType<typeof ChangeSystem>>() // 切换操作系统
const bindIPRef = ref<InstanceType<typeof BindIP>>() // 绑定弹性公网IP
const setNetworkRef = ref<InstanceType<typeof SetNetwork>>() // 调整网络
const bindNetworkCardRef = ref<InstanceType<typeof BindNetworkCard>>() // 绑定弹性网卡
const setConfigRef = ref<InstanceType<typeof SetConfig>>() // 调整配置
const exportRef = ref<InstanceType<typeof Export>>() // 导出实例
const expansRef = ref<InstanceType<typeof Expans>>() // 云硬盘扩容
const flowToTimeRef = ref<InstanceType<typeof FlowToTime>>() // 按量转包年包月
const timeToFlowRef = ref<InstanceType<typeof TimeToFlow>>() // 包年包月转按量
const statesThFilterRef = ref<any>()
const zoneNameThFilterRef = ref<any>()
const instanceChargeTypeThFilterRef = ref<any>()
const networkChangeTypeThFilterRef = ref<any>()
const projectNameThFilterRef = ref<any>()

const { notice, start } = useUpdateResources(
  {
    url: `${httpUrl}/api/vcloudBase/v1/sse/taskState/connect`,
    params: {
      modeType: 1,
    },
    resourcesStateType: 'string',
    deleteStateValue: 'DELETED',
  },
  list,
  toRef(paginationConfig, 'total'),
)

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 更多操作list
const insMoreList = computed(() => {
  const mapCb = el => {
    // 递归处理 children
    if (el.children) {
      const item = el.children.map(child => mapCb(child))
      return {
        ...el,
        children: item, // 将处理后的子元素赋值给 children
      }
    } else {
      return {
        ...el,
        disabled: batchSelectOptDisabled(el),
      }
    }
  }

  const filterCb = el => {
    // 递归过滤 children
    if (el.children) {
      el.children = el.children.filter(filterCb)
      // 移除为空的 children
      return el.children.length > 0
    } else {
      // 判断不同厂商支持的功能
      if (el.perm) {
        return checkPermission(el.perm)
      } else {
        return true
      }
    }
  }

  return INS_MORE_OPTS.map(mapCb).filter(filterCb)
})

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
}

// 修改配置list
const insModifyConfigList = (instanceChargeType: number) => {
  const mapCb = el => {
    if (el.children) {
      const item = el.children.map(mapCb)
      return {
        ...el,
        children: item,
      }
    } else {
      return {
        ...el,
        disabled: modifyConfigSelectOptDisabled(el, modifyConfigRaw.value),
      }
    }
  }

  const filterCb = el => {
    // 递归过滤 children
    if (el.children) {
      el.children = el.children.filter(filterCb)
      // 移除为空的 children
      return el.children.length > 0 && el.costType.includes(instanceChargeType)
    } else {
      // 判断不同厂商和不同计费模式支持的功能
      if (el.perm) {
        return checkPermission(el.perm) && el.costType.includes(instanceChargeType)
      } else {
        return el.costType.includes(instanceChargeType)
      }
    }
  }

  return INS_MODIFY_CONFIG_OPTS.map(mapCb).filter(filterCb)
}

// 修改配置显示
const visibleChangeModifyConfig = (visible, row) => {
  console.log(`visibleChangeModifyConfig===>`, visible, row)

  modifyConfigRaw.value = visible ? row : row
}

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)
  curSearch.value = search
  paginationConfig.pagination.page = 1

  statesThFilterRef.value?.updateCheck(search?.states)
  zoneNameThFilterRef.value?.updateCheck(search?.zoneIds)
  instanceChargeTypeThFilterRef?.value.updateCheck(search?.instanceCostTypes)
  networkChangeTypeThFilterRef?.value.updateCheck(search?.networkCostTypes)
  projectNameThFilterRef.value?.updateCheck(search?.projectName)
  listInstanceFn(search)
}

// 表格的筛选项同步到搜索框搜索项中
const tableCheckFilterFn = (list: any[], fieldKey: string) => {
  console.log(`tableCheckFilterFn===>`, list, fieldKey)
  if (fieldKey === 'states') {
    handleThCheckFn(list, 'states', t('ins.list.state'))
  }
  if (fieldKey === 'zoneIds') {
    handleThCheckFn(list, 'zoneIds', t('ins.list.zone'))
  }

  if (fieldKey === 'instanceCostTypes') {
    handleThCheckFn(list, 'instanceCostTypes', t('ins.list.insCostType'))
  }
  if (fieldKey === 'networkCostTypes') {
    handleThCheckFn(list, 'networkCostTypes', t('ins.list.netCostType'))
  }
}

// 表格的筛选项同步到搜索框搜索项中
const tableSelectFilterFn = (val: any, fieldKey: string) => {
  console.log(`tableSelectFilterFn===>`, val, fieldKey)

  if (fieldKey === 'projectName') {
    //
  }
}

// 创建实例
const create = () => {
  pushRoute({
    name: 'ins_create',
    query: {
      isDefaultCreate: 'true',
      isInit: 'true',
    },
  })
}

// 单个续费
const singleRenew = (row: any) => {
  renewConfig.list = [row]
  changeShow(renewRef.value)
}

// select opt disabled 更多操作
const batchSelectOptDisabled = (v: any) => {
  // console.log(`batchSelectOptDisabled===>`, v)
  if (selectList.value.length) {
    // 修改名称
    if (v.value === 'setName') {
      return !isSetNameBatch(selectList.value.map(el => el.state))
    }

    // 分配至项目
    if (v.value === 'setProject') {
      return !isSetProjectBatch(selectList.value.map(el => el.state))
    }

    // 设置自动续费
    if (v.value === 'setAutoRenew') {
      return !isSetAutoRenewBatch(
        selectList.value.map(el => el.instanceChargeType),
        selectList.value.map(el => el.state),
      )
    }

    // 设置定时快照策略
    if (v.value === 'setSnapshot') {
      const allDisk: any = []
      for (const el of selectList.value) {
        const diskInfos = el.diskInfos.filter(disk => disk) || []
        allDisk.push(...diskInfos)
      }
      //  和创建快照一样 排除系统盘,再筛选出数据盘
      // return !isSetSnapshot(allDisk.filter(el => isDataDisk(el.type)).map(el => el.state))
      return allDisk.filter(el => isDataDisk(el.type)).length ? false : true
    }

    // 加载密钥
    if (v.value === 'setSshKey') {
      return !isSetSshKeyBatch(
        selectList.value.map(el => el.state),
        selectList.value.map(el => el.imageInfo?.platform),
      )
    }

    // 调整配置
    // if (v.value === 'setConfig') {
    //   return !isSetConfigBatch(selectList.value.map(el => el.state))
    // }

    // 调整网络
    if (v.value === 'setNetwork') {
      return isSetNetworkBatch(
        selectList.value,
        selectList.value.map(el => el.state),
      )
    }

    // 切换私有网络
    if (v.value === 'setPrivateNetwork') {
      return !isSetPrivateNetworkBatch()
    }

    // 加入安全组
    if (v.value === 'joinSecurityGroup') {
      return !isJoinSecurityGroupBatch(selectList.value.map(el => el.state))
    }

    return false
  } else {
    return true
  }
}

// select opt disabled 修改配置
const modifyConfigSelectOptDisabled = (v: any, row: any) => {
  // console.log(`modifyConfigSelectOptDisabled===>`, v)

  // 购买相同配置
  if (v.value === 'insSameConfig') {
    return !isOtherBuy()
  }

  // 开机
  if (v.value === 'powerOn') {
    return !isPowerOn(row.state)
  }

  // 关机
  if (v.value === 'shutdown') {
    return !isShutdown(row.state)
  }

  // 重启
  if (v.value === 'restart') {
    return !isRestart(row.state)
  }

  // 销毁/退还
  if (v.value === 'destruction') {
    return !isDestruction(row.state)
  }

  // 修改名称
  if (v.value === 'setName') {
    return !isSetName(row.state)
  }

  // 分配至项目
  if (v.value === 'setProject') {
    return !isSetProject(row.state)
  }

  // 设置自动续费
  if (v.value === 'setAutoRenew') {
    return !isSetAutoRenew(row.instanceChargeType, row.state)
  }

  // 按量转包年包月
  if (v.value === 'flowToTime') {
    return !isFlowToTime(row.instanceChargeType, row.state)
  }

  // 设置定时快照策略
  if (v.value === 'setSnapshot') {
    const diskInfos = row.diskInfos || []
    // 和创建快照一样 排除系统盘,再筛选出数据盘
    // return !isSetSnapshot(diskInfos.filter(el => isDataDisk(el.type)).map(el => el.state))
    return diskInfos.filter(el => isDataDisk(el.type)).length ? false : true
  }

  // 重置密码
  if (v.value === 'setPwd') {
    return !isSetPwd(row.state)
  }

  // 加载密钥
  if (v.value === 'setSshKey') {
    return !isSetSshKey(row.state, row.imageInfo?.platform)
  }

  // 重装系统
  if (v.value === 'setSystem') {
    return !isSetSystem(row.state)
  }

  // 切换系统
  if (v.value === 'changeSystem') {
    return !isChangeSystem(row.state)
  }

  // 创建自定义镜像
  if (v.value === 'createCustomImage') {
    return !isCreateCustomImage(row.state)
  }

  // 调整配置
  if (v.value === 'setConfig') {
    return !isSetConfig(row.state)
  }

  // 云硬盘扩容
  if (v.value === 'expans') {
    return !isExpans(row.state)
  }
  const networkInfo = (row?.networkInfos || []).find(item => item.primaryType === 1)
  // 调整网络
  if (v.value === 'setNetwork') {
    return !isSetNetwork(row.state, networkInfo)
  }

  // 切换私有网络
  if (v.value === 'setPrivateNetwork') {
    return !isSetPrivateNetwork()
  }

  // -------------  网络与安全操作 -----------------
  // 绑定弹性IP
  if (v.value === 'bindIP') {
    return !isBindIP(networkInfo?.state, row.state)
  }

  // 解绑弹性IP
  if (v.value === 'unBindIP') {
    return !isUnBindIP(networkInfo?.state, row.state)
  }

  // 绑定弹性网卡
  if (v.value === 'bindNetworkCard') {
    return !isBindNetworkCard(row.state)
  }

  // 解绑弹性网卡
  if (v.value === 'unBindNetworkCard') {
    return !isUnBindNetworkCard(row.state)
  }

  // 配置安全组
  if (v.value === 'setSecurityGroup') {
    return !isSetSecurityGroup(row.state)
  }

  return false
}

// 点击更多操作opt
const moreOptClickFn = (item: any) => {
  console.log(`optClickFn===>`, item)
  switch (item.value) {
    // 修改名称
    case 'setName':
      setNameConfig.list = selectList.value
      changeShow(setNameRef.value)
      break
    // 分配至项目
    case 'setProject':
      setProjectConfig.list = selectList.value
      changeShow(setProjectRef.value)
      break
    // 设置自动续费
    case 'setAutoRenew':
      setAutoRenewConfig.list = selectList.value
      changeShow(setAutoRenewRef.value)
      break
    // 设置定时快照策略
    case 'setSnapshot':
      setSnapshotConfig.list = selectList.value
      changeShow(setSnapshotRef.value)
      break
    // 加载密钥
    case 'setSshKey':
      setSshKeyConfig.type = selectList.value[0].state
      setSshKeyConfig.list = selectList.value
      changeShow(setSshKeyRef.value)
      break
    // 加入安全组
    case 'joinSecurityGroup':
      joinSecurityGroupConfig.list = selectList.value
      changeShow(joinSecurityGroupRef.value)
      break
    // 调整配置
    // case 'setConfig':
    //   setConfig.type = selectList.value[0].state
    //   setConfig.list = selectList.value
    //   changeShow(setConfigRef.value)
    //   break
    // 调整网络
    case 'setNetwork':
      setNetworkConfig.list = selectList.value
      changeShow(setNetworkRef.value)
      break
    default:
      break
  }
}

// 点击修改配置opt
const modifyConfigOptClickFn = (item: any, row: any) => {
  switch (item.value) {
    // 购买相同配置
    case 'insSameConfig':
      pushRoute({
        name: 'ins_create',
        query: {
          isDefaultCreate: 'false',
          isInit: 'true',
          entry: 'insSameConfig' as NoDefaultCreateType,
          instanceId: row.insUuid,
        },
      })
      break

    // 开机
    case 'powerOn':
      powerOnConfig.list = [row]
      changeShow(powerOnRef.value)
      break
    // 关机
    case 'shutdown':
      shutdownConfig.list = [row]
      changeShow(shutdownRef.value)
      break
    // 重启
    case 'restart':
      restartConfig.list = [row]
      changeShow(restartRef.value)
      break
    // 销毁/退还
    case 'destruction':
      destructionConfig.list = [row]
      changeShow(destructionRef.value)
      break
    // 修改名称
    case 'setName':
      setNameConfig.list = [row]
      changeShow(setNameRef.value)
      break
    // 分配至项目
    case 'setProject':
      setProjectConfig.list = [row]
      changeShow(setProjectRef.value)
      break
    // 设置自动续费
    case 'setAutoRenew':
      setAutoRenewConfig.list = [row]
      changeShow(setAutoRenewRef.value)
      break
    // 按量转包年包月
    case 'flowToTime':
      flowToTimeConfig.list = [row]
      changeShow(flowToTimeRef.value)
      break
    // 设置定时快照策略
    case 'setSnapshot':
      setSnapshotConfig.list = [row]
      changeShow(setSnapshotRef.value)
      break
    // 重置密码
    case 'setPwd':
      setPwdConfig.list = [row]
      changeShow(setPwdRef.value)
      break
    // 加载密钥
    case 'setSshKey':
      setSshKeyConfig.list = [row]
      setSshKeyConfig.type = row.state
      changeShow(setSshKeyRef.value)
      break
    // 重装系统
    case 'setSystem':
      setSystemConfig.list = [row]
      setSystemConfig.type = row.state
      changeShow(setSystemRef.value)
      break
    // 切换系统
    case 'changeSystem':
      changeSystemConfig.list = [row]
      changeSystemConfig.type = row.state
      changeShow(changeSystemRef.value)
      break
    // 创建自定义镜像
    case 'createCustomImage':
      createCustomImageConfig.list = [row]
      changeShow(createCustomImageRef.value)
      break
    // 调整配置
    case 'setConfig':
      setConfig.type = row.state
      setConfig.list = [row]
      changeShow(setConfigRef.value)
      break
    // 云硬盘扩容
    case 'expans':
      expansConfig.list = [row]
      changeShow(expansRef.value)
      break
    // 调整网络
    case 'setNetwork':
      setNetworkConfig.list = [row]
      changeShow(setNetworkRef.value)
      break
    // 绑定弹性IP
    case 'bindIP':
      bindIPConfig.item = row
      changeShow(bindIPRef.value)
      break
    // 解绑弹性IP
    case 'unBindIP':
      unBindIPConfig.item = row
      changeShow(unBindIPRef.value)
      break
    // 绑定弹性网卡
    case 'bindNetworkCard':
      bindNetworkCardConfig.item = row
      changeShow(bindNetworkCardRef.value)
      break
    // 解绑弹性网卡
    case 'unBindNetworkCard':
      unBindNetworkCardConfig.item = row
      changeShow(unBindNetworkCardRef.value)
      break
    // 加入安全组
    case 'setSecurityGroup':
      joinSecurityGroupConfig.list = [row]
      getEniRefSgList(row)
      break
    default:
      break
  }
}

// 获取关联安全组
const getEniRefSgList = async row => {
  const networkInfos = row.networkInfos
  // 获取主网卡
  const item = networkInfos.find(item => item.primaryType === 1)
  if (item) {
    const params = { eniId: item.eniId }
    try {
      const res = await getEniRefSg(params)
      if (res.success) {
        setSecurityGroupConfig.list = (res.data || []).map(item => item.sgId)
        changeShow(setSecurityGroupRef.value)
        ;(setSecurityGroupRef.value as InstanceType<typeof SetSecurityGroup>).eniId = item.eniId
      } else {
        message.warning(res.msg)
      }
    } catch (err) {
      console.log('error', err)
    }
  }
}

// 主内ip地址
const handleRowIp = (row: any) => {
  const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡
  const config: any = {
    show: false,
  }
  config.show = res ? true : false
  config.mainPrivateIp = res?.mainPrivateIp
  config.mainPublicIp = res?.mainPublicIp

  return config
}

// 网络计费模式
const handleRowNetworkChangeType = (row: any) => {
  console.log(`handleRowNetworkChangeType===>`, row)

  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡

  return res?.networkChangeType ? INS_NETWORK_CHANGE_TYPE_MAP[res.networkChangeType] : '-'
}

const refresh = () => {
  start()
  resetIptFn()
  // listInstanceFn()
}

// 跳转详情
const toDetail = (row: any) => {
  const id = row.insUuid
  pushRoute({
    name: 'ins_detail',
    params: {
      id,
      uuid: row.insUuid,
      name: row.instanceName,
    },
  })
}

// 跳转实例监控
const toMonitor = (row: any) => {
  const id = row.insUuid

  pushRoute({
    name: 'ins_detail',
    params: {
      id,
      uuid: row.insUuid,
      name: row.instanceName,
    },
    query: {
      active: 6,
    },
  })
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection

  changePowerOnConfig()
  changeShutdownConfig()
  changeRestartConfig()
  changeRenewConfig()
  changeSetPwdConfig()
  changeDestructionConfig()
}

// 批量开机
const changePowerOnConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    powerOnConfig.content = t('ins.list.powerOnTip1')
    powerOnConfig.disabled = true
    return
  } else {
    // 勾选
    const res = isPowerOnBatch(selectList.value.map(el => el.state))

    if (!res) {
      powerOnConfig.content = t('ins.list.powerOnTip2')
      powerOnConfig.disabled = true
      return
    }

    powerOnConfig.list = selectList.value
    powerOnConfig.disabled = false
  }
}

// 批量关机
const changeShutdownConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    shutdownConfig.content = t('ins.list.shutdownTip1')
    shutdownConfig.disabled = true
    return
  } else {
    // 勾选
    const res = isShutdownBatch(selectList.value.map(el => el.state))

    if (!res) {
      shutdownConfig.content = t('ins.list.shutdownTip2')
      shutdownConfig.disabled = true
      return
    }

    shutdownConfig.list = selectList.value
    shutdownConfig.disabled = false
  }
}

// 批量重启
const changeRestartConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    restartConfig.content = t('ins.list.restartTip1')
    restartConfig.disabled = true
    return
  } else {
    // 勾选
    const res = isRestartBatch(selectList.value.map(el => el.state))

    if (!res) {
      restartConfig.content = t('ins.list.restartTip2')
      restartConfig.disabled = true
      return
    }

    restartConfig.list = selectList.value
    restartConfig.disabled = false
  }
}

// 批量续费
const changeRenewConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    renewConfig.content = t('ins.list.renewTip1')
    renewConfig.disabled = true
    return
  } else {
    // 勾选
    const res1 = isTimeCostBatch(selectList.value.map(el => el.instanceChargeType))

    if (!res1) {
      renewConfig.content = t('ins.list.renewTip1')
      renewConfig.disabled = true
      return
    }

    const res2 = isRenewBatch(
      selectList.value.map(el => el.instanceChargeType),
      selectList.value.map(el => el.state),
    )

    if (!res2) {
      renewConfig.content = t('ins.list.renewTip2')
      renewConfig.disabled = true
      return
    }

    renewConfig.list = selectList.value
    renewConfig.disabled = false
  }
}

// 批量重置密码
const changeSetPwdConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    setPwdConfig.content = t('ins.list.setPwdTip1')
    setPwdConfig.disabled = true
    return
  } else {
    // 勾选
    const res = isSetPwdBatch(selectList.value.map(el => el.state))

    if (!res) {
      setPwdConfig.content = t('ins.list.setPwdTip2')
      setPwdConfig.disabled = true
      return
    }

    setPwdConfig.list = selectList.value
    setPwdConfig.disabled = false
  }
}

// 批量销毁/退还
const changeDestructionConfig = () => {
  // 未勾选
  if (!selectList.value.length) {
    destructionConfig.content = t('ins.list.destructionTip1')
    destructionConfig.disabled = true
    return
  } else {
    // 勾选
    const res = isDestructionBatch(selectList.value.map(el => el.state))

    if (!res) {
      setPwdConfig.content = t('ins.list.destructionTip2')
      setPwdConfig.disabled = true
      return
    }

    destructionConfig.list = selectList.value
    destructionConfig.disabled = false
  }
}

// 分页
const paginationChange = () => {
  listInstanceFn()
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
  if (params.regionId) {
    listByRegionId(params, cb)
  }
}

// 分页查询服务器列表
const listInstanceFn = async (search = filterInputRef.value?.searchParams || {}) => {
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    regionId: cvmStore.areaSelect.id,
    states: INS_DEFAULT_STATES,
    ...search,
  }

  const cb = (res: any) => {
    if (res.success) {
      // 过滤待回收状态
      // list.value = (res.data?.list || []).filter(el => !isRecovery(el.state))
      list.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  }

  notice(1)
  if (params.regionId) {
    listInstance(params, cb)
  }
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    resetIptFn()
    listInstanceFn()
    listByRegionIdFn()
  },
)

onMounted(() => {
  useTempStore().setPageHeader(false)
  listInstanceFn()
  listByRegionIdFn()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
:deep(.el-badge__content.is-fixed) {
  transform: translateY(0%) translateX(100%);
}

.mr10 {
  margin-right: 10px;
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
