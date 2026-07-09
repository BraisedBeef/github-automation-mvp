<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <CatTabs v-model="state.ruleActive" class="tabs" :tabs="ruleTabs" @change="changeRuleTabs" />
    <div class="df ac mt20">
      <div class="btn-wrap">
        <el-button
          v-if="
            state.ruleActive === 'ingress'
              ? checkPermission(permMap.group.ADD_INBOUND_RULE)
              : checkPermission(permMap.group.ADD_OUTBOUND_RULE)
          "
          type="primary"
          @click="changeShow(setInboundAddRef)"
        >
          {{ t('securityGroup.addRules') }}
        </el-button>
        <el-button
          v-if="
            state.ruleActive === 'ingress'
              ? checkPermission(permMap.group.IMPORT_INBOUND_RULES)
              : checkPermission(permMap.group.IMPORT_OUTBOUND_RULES)
          "
          type=""
          @click="changeShow(batchImportRef)"
        >
          {{ t('securityGroup.importRules') }}
        </el-button>
        <el-button
          v-if="
            state.ruleActive === 'ingress'
              ? checkPermission(permMap.group.DELETE_INBOUND_RULES_BULK)
              : checkPermission(permMap.group.DELETE_OUTBOUND_RULES_BULK)
          "
          type=""
          :disabled="!state.selectRuleList.length"
          @click="deleteFn(setInboundDeleteRef)"
        >
          {{ t('securityGroup.delete') }}
        </el-button>
        <el-button
          v-if="
            state.ruleActive === 'ingress'
              ? checkPermission(permMap.group.OPEN_ALL_INBOUND_TRAFFIC)
              : checkPermission(permMap.group.OPEN_ALL_OUTBOUND_TRAFFIC)
          "
          type=""
          @click="changeShow(setReleaseRef)"
        >
          {{ t('securityGroup.oneClickRelease') }}
        </el-button>
      </div>
    </div>
    <el-form ref="editableFormRef" :model="state.ruleEditForm" :rules="rules" label-width="0">
      <el-table
        v-loading="state.ruleLoading"
        :data="state.ruleList"
        class="mt20 table"
        @selection-change="handleRowSelectChange"
      >
        <el-table-column type="selection" width="40" />
        <!-- 优先级 -->
        <el-table-column :label="t('securityGroup.priority')" min-width="120">
          <template #default="{ row, $index }">
            <el-input-number
              v-if="state.priorityEditIndex === $index"
              v-model="state.priorityEditForm.priority"
              style="width: 100%"
              controls-position="right"
              :min="1"
              :max="100"
              :tooltip="false"
            />
            <div v-else>
              {{ row.priority }}
            </div>
          </template>
        </el-table-column>
        <!-- 来源 or 目标 -->
        <el-table-column
          :show-overflow-tooltip="false"
          min-width="200"
          :label="state.ruleActive === 'ingress' ? t('securityGroup.source') : t('securityGroup.target')"
        >
          <template #default="{ row, $index }">
            <div v-if="state.ruleEditIndex === $index" class="py11" style="width: 80%">
              <el-select
                v-model="state.ruleEditForm.type"
                class="select-opts w-full"
                :placeholder="t('securityGroup.selectSource')"
              >
                <el-option v-for="item in sourceTypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <!-- 参数模板 - IP 地址组 -->
              <div v-if="state.ruleEditForm.type === 3" class="mt10">
                <el-form-item label="" prop="remoteAddressGroupId">
                  <el-select
                    v-model="state.ruleEditForm.remoteAddressGroupId"
                    v-loading="state.remoteAddressGroupLoading"
                    class="select-opts w-full"
                    :placeholder="t('securityGroup.selectParamTemplate')"
                    @visible-change="getIpGroupListFn"
                  >
                    <el-option
                      v-for="item in state.remoteAddressGroupList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <!-- 安全组 -->
              <div v-else-if="state.ruleEditForm.type === 2" class="mt10">
                <el-form-item label="" prop="remoteGroupId">
                  <el-select
                    v-model="state.ruleEditForm.remoteGroupId"
                    v-loading="state.remoteGroupLoading"
                    class="select-opts w-full"
                    :placeholder="t('securityGroup.placeSelectSecurityGroup')"
                    @visible-change="getListSecurityGroupFn"
                  >
                    <el-option
                      v-for="item in state.remoteGroupIdList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <!-- IP 地址或 CIDR 段 -->
              <div v-else class="mt10">
                <el-form-item label="" prop="remoteIpPrefix">
                  <el-input v-model.trim="state.ruleEditForm.remoteIpPrefix" />
                </el-form-item>
              </div>
            </div>
            <div v-else-if="row.type === 2">
              <div class="text-primary cursor-pointer" @click="goRuleDetail(row)">
                {{ row.remoteGroupId }}
              </div>
              <div>{{ row.remoteGroupName || '' }}</div>
            </div>
            <div v-else-if="row.type === 3">
              <div class="text-primary cursor-pointer">
                {{ row.remoteAddressGroupId }}
              </div>
              <div>{{ row.remoteAddressGroupName || '' }}</div>
            </div>
            <div v-else>
              {{ row.remoteIpPrefix }}
            </div>
          </template>
        </el-table-column>
        <!-- 协议端口 -->
        <el-table-column min-width="140" :label="t('securityGroup.protocolPort')">
          <template #default="{ row, $index }">
            <div v-if="state.ruleEditIndex === $index" class="py11" style="width: 80%">
              <el-form-item label="" prop="port" :tool-tip="false">
                <el-input v-model.trim="state.ruleEditForm.port" />
              </el-form-item>
            </div>
            <div v-else>{{ row.protocol }}{{ row.multiport && row.multiport !== '' ? `:${row.multiport}` : '' }}</div>
          </template>
        </el-table-column>
        <!-- 策略 -->
        <el-table-column min-width="200" :label="t('securityGroup.strategy')">
          <template #default="{ row, $index }">
            <div v-if="state.ruleEditIndex === $index" class="py11" style="width: 80%">
              <el-select
                v-model="state.ruleEditForm.action"
                class="select-opts w-full"
                :placeholder="t('securityGroup.selectStrategy')"
              >
                <el-option v-for="item in actionTypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <!-- 策略为允许时显示绿色 -->
            <div v-else :class="row.action === 'allow' ? 'allowSuccess' : ''">
              {{ actionMap.get(row.action) }}
            </div>
          </template>
        </el-table-column>
        <!-- 描述 -->
        <el-table-column min-width="200" :label="t('securityGroup.describe')" show-overflow-tooltip>
          <template #default="{ row, $index }">
            <div v-if="state.ruleEditIndex === $index" class="py11" style="width: 80%">
              <el-input v-model.trim="state.ruleEditForm.description" />
            </div>
            <div v-else class="table-td_tooltip">
              <div class="text-over">
                {{ !!row?.description ? row.description : '-' }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 修改时间 -->
        <el-table-column min-width="220" :label="t('securityGroup.editTime')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('securityGroup.editTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row?.updateTime ? maoYunDayJs(row?.updateTime).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column min-width="240" :label="t('securityGroup.operate')" fixed="right">
          <template #default="{ row, $index }">
            <!-- 入站规则 - 编辑 -->
            <div v-if="state.ruleEditIndex === $index">
              <el-button type="primary" @click="editRuleFn">
                {{ t('securityGroup.save') }}
              </el-button>
              <el-button type="" @click="cancelRuleEdit">
                {{ t('securityGroup.cancel') }}
              </el-button>
            </div>
            <!-- 出站规则 - 编辑 -->
            <div v-else-if="state.priorityEditIndex === $index">
              <el-button type="primary" @click="editPriorityFn">
                {{ t('securityGroup.save') }}
              </el-button>
              <el-button type="" @click="cancelPriorityEdit">
                {{ t('securityGroup.cancel') }}
              </el-button>
            </div>
            <!-- 默认按钮 -->
            <div v-else class="df ac">
              <span
                v-if="
                  state.ruleActive === 'ingress'
                    ? checkPermission(permMap.group.EDIT_INBOUND_RULE)
                    : checkPermission(permMap.group.EDIT_OUTBOUND_RULE)
                "
                class="text-primary mr20 cursor-pointer"
                @click="ruleEditFn($index, row)"
                >{{ t('securityGroup.edit') }}</span
              >
              <span
                v-if="
                  state.ruleActive === 'ingress'
                    ? checkPermission(permMap.group.MODIFY_INBOUND_RULE_PRIORITY)
                    : checkPermission(permMap.group.MODIFY_OUTBOUND_RULE_PRIORITY)
                "
                class="text-primary mr20 cursor-pointer"
                @click="priorityEditFn($index, row)"
                >{{ t('securityGroup.editPriority') }}</span
              >
              <!-- <div style="width: 44px;">
                <el-select
                    class="select-tr mr20"
                    :placeholder="'插入'"
                    suffix-icon=""
                    @change="
                    v => {
                        handleOperatechange(v, row)
                    }
                    "
                >
                    <el-option :value="item" :label="item.label" v-for="item in operateOpts" :key="item.value">
                    </el-option>
                </el-select>
                </div> -->
              <span
                v-if="
                  state.ruleActive === 'ingress'
                    ? checkPermission(permMap.group.DELETE_INBOUND_RULE_SINGLE)
                    : checkPermission(permMap.group.DELETE_OUTBOUND_RULE_SINGLE)
                "
                class="text-primary cursor-pointer"
                @click="deleteFn(setInboundDeleteRef, row)"
                >{{ t('securityGroup.delete') }}</span
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <CatPagination
      v-model:pagination="rulePageConfig.pagination"
      :total="rulePageConfig.total"
      :custom-keys="['page', 'pageSize']"
      @change="getRuleList"
    />
    <!-- 删除 -->
    <SetInboundDelete
      ref="setInboundDeleteRef"
      :region-id="state.regionId"
      :group-id="props.detailId"
      :direction="state.ruleActive"
      :ins-num="props.insNumber"
      @success="changeRuleTabs"
    />
    <!-- 添加规则 -->
    <SetInboundAdd
      ref="setInboundAddRef"
      :region-id="state.regionId"
      :detail-id="props.detailId"
      :ruleactive="state.ruleActive"
      @success="changeRuleTabs"
    />
    <!-- 一键放通 -->
    <SetRelease
      ref="setReleaseRef"
      :region-id="state.regionId"
      :detail-id="props.detailId"
      :ruleactive="state.ruleActive"
      @success="changeRuleTabs"
    />
    <!-- 导入规则 -->
    <BatchImport
      ref="batchImportRef"
      :region-id="state.regionId"
      :group-id="props.detailId"
      :rule-active="state.ruleActive"
      @success="changeRuleTabs"
    />
  </el-card>
</template>
<script lang="ts" setup>
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import dayjs from 'dayjs'
import { useCvmStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import { FormRules } from 'element-plus/es/components/form/src/types'
import SetInboundDelete from '../set-inbound-delete/index.vue'
import SetInboundAdd from '../set-inbound-add/index.vue'
import SetRelease from '../set-release/index.vue'
import BatchImport from '../batch-import/index.vue'
import {
  getListSecurityGroupRule,
  editSecurityGroupRule,
  editSecurityGroupRulePriority,
} from '@/apis/network/security-group'
import { ListSecurityGroupRuleType } from '@/apis/network/type/security-group'
import { ruleTabs } from '../../config'
import { SecurityGroupRuleInterface, EditSecurityGroupRuleInterface } from '../../type'
import { actionMap } from '../../../list/config'
import { sourceTypeList, actionTypeList, multiportAllProtocolTypeList } from '../../config'
import { getListSecurityGroup } from '@/apis/network/security-group'
import { getIpGroupList } from '@/apis/network/ip-group'
import { message } from '@/utils/message'
import { securityGroutRules } from '../../config'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.group,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

interface PropType {
  detailId: number
  insNumber: number
}

const props = withDefaults(defineProps<PropType>(), {})

const route = useRoute()
const router = useRouter()

const bodyStyle = { height: '100%' }

const initRuleEditForm = {
  type: 1,
  port: '',
  action: '',
  description: '',
  direction: '',
  groupId: '',
  id: 0,
  multiport: '',
  priority: 0,
  protocol: '',
  remoteAddressGroupId: '',
  remoteGroupId: '',
  remoteIpPrefix: '',
}

const initPrirityEditForm = {
  groupId: '',
  ruleId: '',
  direction: '',
  priority: '',
}

const state = reactive<{
  ruleActive: 'ingress' | 'egress' // 入站/出战规则tab ingress: 入站，egress: 出战
  regionId: number // 区域id
  ruleList: SecurityGroupRuleInterface[] // 入站，出战规则列表数据
  selectRuleList: SecurityGroupRuleInterface[] // 选中的入站，出站规则
  ruleLoading: boolean // 入站，出战规则列表数据
  ruleEditIndex: number // 规则当前编辑的ndex
  ruleEditForm: EditSecurityGroupRuleInterface // 当前编辑的数据
  priorityEditIndex: number // 规则优先级当前编辑的index
  priorityEditForm: any // 规则优先级当前编辑数据
  remoteAddressGroupList: any[] // ip组列表
  remoteAddressGroupLoading: boolean // 获取ip组列表loading
  remoteGroupIdList: any[] // 安全组列表
  remoteGroupLoading: boolean // 获取安全组列表loading
}>({
  ruleActive: 'ingress',
  regionId: cvmStore.areaSelect.id,
  ruleList: [],
  selectRuleList: [],
  ruleLoading: false,
  ruleEditIndex: NaN,
  ruleEditForm: initRuleEditForm,
  priorityEditIndex: NaN,
  priorityEditForm: initPrirityEditForm,
  remoteAddressGroupList: [],
  remoteAddressGroupLoading: false,
  remoteGroupIdList: [],
  remoteGroupLoading: false,
})

const rules = reactive<FormRules<any>>({
  remoteAddressGroupId: [
    {
      validator: (rule, value, callback) => {
        if (state.ruleEditForm.type === 3) {
          if (/\d+/g.test(value)) {
            callback()
          } else {
            callback(new Error(''))
          }
        } else {
          callback()
        }
      },
    },
  ],
  remoteGroupId: [
    {
      validator: (rule, value, callback) => {
        if (state.ruleEditForm.type === 2) {
          if (/\d+/g.test(value)) {
            callback()
          } else {
            callback(new Error(''))
          }
        } else {
          callback()
        }
      },
    },
  ],
  remoteIpPrefix: [
    {
      validator: (rule, value, callback) => {
        if (state.ruleEditForm.type === 1) {
          const key = securityGroutRules.remoteIpPrefix(value)
          if (key) {
            callback()
          } else {
            callback(new Error(''))
          }
        } else {
          callback()
        }
      },
    },
  ],
  port: [
    {
      validator: (rule, value, callback) => {
        const key = securityGroutRules.port(value)
        if (key) {
          callback()
        } else {
          callback(new Error(''))
        }
      },
    },
  ],
})

// 入站，出战规则分页配置
const rulePageConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})

// 获取入站，出站规则列表数据
const getRuleList = async () => {
  cancelPriorityEdit()
  cancelRuleEdit()
  const params: ListSecurityGroupRuleType = {
    pageIndex: rulePageConfig.pagination.page,
    pageSize: rulePageConfig.pagination.pageSize,
    securityGroupId: props.detailId,
    direction: state.ruleActive,
  }
  state.ruleLoading = true
  try {
    const res = await getListSecurityGroupRule(params)
    state.ruleLoading = false
    if (res.success) {
      state.ruleList =
        res.data?.list?.map((i: any) => ({
          ...i,
          remoteIpPrefix: i.remoteIpPrefix === 'all' ? 'ALL' : i.remoteIpPrefix,
          protocol: i.protocol.toUpperCase(),
          multiport: i.multiport === 'all' ? 'ALL' : i.multiport,
        })) || []
      rulePageConfig.total = res.data?.recordCnt || 0
    }
  } catch (err) {
    state.ruleLoading = false
    console.log('error', err)
  }
}

// 编辑入站规则
const ruleEditFn = async (index: number, row: SecurityGroupRuleInterface) => {
  const type = row.type
  const multiport =
    multiportAllProtocolTypeList.findIndex(item => item === row.protocol) >= 0 ||
    !row?.multiport ||
    row.multiport === ''
      ? ''
      : ':' + row.multiport
  // 如果是安全组或ip组  要先查一下对应的列表   不然下拉框内数据无法正确显示
  if (type === 2) {
    await getListSecurityGroupFn(true)
    state.ruleEditIndex = index
    state.ruleEditForm = {
      ...row,
      remoteGroupId: Number(row.remoteGroupId),
      remoteAddressGroupId: '',
      port: `${row.protocol}${multiport}`,
      type,
    }
  } else if (type === 3) {
    await getIpGroupListFn(true)
    state.ruleEditIndex = index
    state.ruleEditForm = {
      ...row,
      remoteAddressGroupId: Number(row.remoteAddressGroupId),
      remoteGroupId: '',
      port: `${row.protocol}${multiport}`,
      type,
    }
  } else {
    state.ruleEditIndex = index
    state.ruleEditForm = {
      ...row,
      port: `${row.protocol}${multiport}`,
      remoteAddressGroupId: '',
      remoteGroupId: '',
      type,
    }
  }
  console.log('state.ruleEditForm', state.ruleEditForm)
}
// 取消编辑规则
const cancelRuleEdit = () => {
  state.ruleEditIndex = NaN
  state.ruleEditForm = initRuleEditForm
}

const editableFormRef = ref<any>()
// 提交编辑
const editRuleFn = async () => {
  await editableFormRef.value.validate()
  const portList = state.ruleEditForm.port.split(':')
  if (portList[0] === 'icmpv6' && !securityGroutRules.ipv6(state.ruleEditForm.remoteIpPrefix)) {
    message.warning(t('securityGroup.icmpv6Msg'))
    return false
  }
  const rule: any = {
    type: state.ruleEditForm.type,
    description: state.ruleEditForm.description,
    direction: state.ruleEditForm.direction,
    protocol: portList[0].toLowerCase(),
    // 如果协议为['icmp','icmpv6', 'gre', 'all']中的一个 端口固定为all
    multiport: multiportAllProtocolTypeList.findIndex(item => item === portList[0]) >= 0 ? 'all' : portList[1],
    action: state.ruleEditForm.action,
    priority: state.ruleEditForm.priority,
  }
  if (state.ruleEditForm.type === 1) {
    rule.remoteIpPrefix = state.ruleEditForm.remoteIpPrefix === 'ALL' ? 'all' : state.ruleEditForm.remoteIpPrefix
    rule.remoteGroupId = null
    rule.remoteAddressGroupId = null
  }
  if (state.ruleEditForm.type === 3) {
    rule.remoteIpPrefix = null
    rule.remoteGroupId = null
    rule.remoteAddressGroupId = state.ruleEditForm.remoteAddressGroupId
  }
  if (state.ruleEditForm.type === 2) {
    rule.remoteIpPrefix = null
    rule.remoteGroupId = state.ruleEditForm.remoteGroupId
    rule.remoteAddressGroupId = null
  }
  const params = {
    regionId: state.regionId,
    groupId: props.detailId,
    id: state.ruleEditForm.id,
    direction: state.ruleEditForm.direction,
    rule,
  }
  state.ruleLoading = true
  try {
    const res = await editSecurityGroupRule(params)
    state.ruleLoading = false
    if (res.success) {
      message.success(t('securityGroup.editSuccess'))
      cancelRuleEdit()
      getRuleList()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.ruleLoading = false
    console.log('error', err)
  }
}

// 编辑优先级
const priorityEditFn = (index: number, row: SecurityGroupRuleInterface) => {
  state.priorityEditIndex = index
  state.priorityEditForm = {
    ruleId: row.id,
    groupId: row.groupId,
    direction: row.direction,
    priority: row.priority,
  }
}
// 取消编辑优先级
const cancelPriorityEdit = () => {
  state.priorityEditIndex = NaN
  state.priorityEditForm = initPrirityEditForm
}
const editPriorityFn = async () => {
  const params = { ...state.priorityEditForm, regionId: state.regionId }
  state.ruleLoading = true
  try {
    const res = await editSecurityGroupRulePriority(params)
    state.ruleLoading = false
    if (res.success) {
      message.success(t('securityGroup.editPrioritySuccess'))
      cancelPriorityEdit()
      getRuleList()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.ruleLoading = false
    console.log('error', err)
  }
}

// 跳转安全组详情
const goRuleDetail = async row => {
  const url = router.resolve({
    name: 'network_security_security_group_detail',
    query: { id: row.remoteGroupId, name: row.remoteGroupName },
  })
  window.open(url.href, '_blank')
}

// 插入 ------------ 后端说不好实现，暂时取消此功能 ----------
const operateOpts = [
  { value: 'createHardDisk', label: '向上插入一行' },
  { value: 'createmirror', label: '向下插入一行' },
]
const handleOperatechange = (v: any, row: any) => {
  console.log('handleOperatechange===>', v, row)
}

const setInboundDeleteRef = ref<InstanceType<typeof SetInboundDelete>>() // 删除
const setInboundAddRef = ref<InstanceType<typeof SetInboundAdd>>() // 添加规则
const setReleaseRef = ref<InstanceType<typeof SetRelease>>() // 一键放通
const batchImportRef = ref<InstanceType<typeof BatchImport>>() // 导入规则
const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 切换入站/出站tab
const changeRuleTabs = () => {
  cancelPriorityEdit()
  cancelRuleEdit()
  rulePageConfig.pagination.page = 1
  state.selectRuleList = []
  getRuleList()
}

// 删除安全组规则
const deleteFn = (ins, row?: SecurityGroupRuleInterface) => {
  if (!ins) return
  state.regionId = cvmStore.areaSelect.id // 这里重新取值  避免还未初始化
  ins.show = true
  ins.ruleList = row ? [row] : state.selectRuleList
}

// 选择入站/出站规则
const handleRowSelectChange = val => {
  state.selectRuleList = [...val]
}

// 获取安全组列表
const getListSecurityGroupFn = async key => {
  if (!key) return
  const params = { regionId: state.regionId, pageIndex: 1, pageSize: 1000 }
  state.remoteGroupLoading = true
  try {
    const res = await getListSecurityGroup(params)
    state.remoteGroupLoading = false
    if (res.success) {
      state.remoteGroupIdList = (res.data?.list || []).map(item => ({
        ...item,
        label: `${item.id}(${item.name})`,
        value: item.id,
      }))
    }
  } catch (err) {
    console.log('error', err)
    state.remoteGroupLoading = false
  }
}

// 获取IP地址列表
const getIpGroupListFn = async key => {
  if (!key) return
  const params = { regionId: state.regionId, pageIndex: 1, pageSize: 1000 }
  state.remoteAddressGroupLoading = true
  try {
    const res = await getIpGroupList(params)
    console.log(res, '获取IP地址列表-编辑')

    state.remoteAddressGroupLoading = false
    state.remoteAddressGroupList = (res.data?.list || []).map(item => ({
      ...item,
      label: `${item.id}(${item.name})`,
      value: item.id,
    }))
  } catch (err) {
    console.log('error', err)
    state.remoteAddressGroupLoading = false
  }
}

defineExpose({
  changeRuleTabs,
})
</script>

<style lang="scss" scoped>
.tabs-wrap {
  /* margin-left: -20px; */

  /* width: calc(100% + 40px); */

  /* margin-top: -20px; */
  box-sizing: border-box;
  background: #fff;

  :deep(.cat-tabs__header) {
    /* padding-left: 8px; */
    border-color: transparent;
  }
}

.py11 {
  padding: 11px 0;
}

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

.allowSuccess {
  color: var(--success-color);
}

.overFlowText {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
