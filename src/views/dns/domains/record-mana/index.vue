<template>
  <div id="record_mana" class="record-mana">
    <div class="content-handle">
      <div class="left">
        <el-button type="primary" :disabled="state.loading" @click="handleAdd">
          +{{ t('routes.addRecords') }}
        </el-button>
        <el-button plain :disabled="!canPlayPause" @click="setParse('multi', { status: 1 }, 2)">
          {{ t('myDomains.pause') }}
        </el-button>
        <el-button plain :disabled="!canPlayStart" @click="setParse('multi', { status: 2 }, 1)">
          {{ t('common.start') }}
        </el-button>
        <el-button
          plain
          :disabled="state.multipleSelection.length === 0 || isExsitEditRow"
          style="margin-right: 20px"
          @click="handleDelete"
        >
          {{ t('common.delete') }}
        </el-button>
        <el-select
          :model-value="t('common.batchOperation')"
          :disabled="state.loading || state.dialogLoading"
          class=""
          style="width: 160px; margin-right: 20px"
          @change="batchChange"
        >
          <el-option v-for="item in batchOption" :key="item.name" :label="item.label" :value="item.name" />
        </el-select>
      </div>
      <div class="right">
        <el-input
          v-model.trim="state.searchValue"
          :placeholder="t('recordMana.searchPlaceholder')"
          style="width: 240px; height: 34px"
          @keydown.enter="handleSearch"
        >
          <template #suffix>
            <SvgIcon name="dns-search" pointer @click="handleSearch" />
          </template>
        </el-input>
        <div class="handle-refresh">
          <SvgIcon name="refresh" pointer :loading="state.loading" @click="getData" />
        </div>
      </div>
    </div>
    <el-table
      ref="my_dns_table"
      v-loading="state.loading"
      :data="state.tableData"
      style="width: 100%"
      class="record-mana-table cat-table"
      row-key="id"
      :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
      :row-class-name="rowClassName"
      @selection-change="handleSelectionChange"
      @select-all="handleSelectAll"
    >
      <el-table-column type="selection" width="36" />
      <el-table-column type="expand" style="display: none" width="0">
        <template #default="{ $index, row }">
          <div
            v-if="state.noticeId && $index === activeTip && needTip"
            class="notice-box"
            :class="state.noticeId.replace('#', '')"
          >
            <div class="notice-box-title">{{ noticeTitle[state.noticeId] }}：</div>
            <template v-if="state.noticeId === '#record_type'">
              <div class="recommand-a-2">
                {{ t('recordMana.tip2') }}
              </div>
              <div class="notice-box-content">
                <span>{{ getRecordtypeName(state.tableData[activeTip].recordType) }}</span>
                {{
                  noticeObj[state.noticeId].find(
                    item => item.title === getRecordtypeName(state.tableData[activeTip].recordType),
                  )?.text
                }}
              </div>
            </template>
            <template v-else>
              <div v-for="(item, index) in noticeObj[state.noticeId]" :key="index">
                <span v-if="item.title">{{ item.title }}</span>
                {{ item.text }}
                <div v-if="item.fn">
                  <span style="width: auto; margin-right: 20px">{{
                    _matchRouteType(row.lineTypeId, state.lineTypes)?.lineName
                  }}</span>
                  {{
                    _matchRouteType(row.lineTypeId, state.lineTypes)?.isDefault
                      ? t('recordMana.line_type2')
                      : t('recordMana.line_type_custom', {
                          lineName: _matchRouteType(row.lineTypeId, state.lineTypes)?.lineName,
                        })
                  }}
                </div>
              </div>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in columnsChange"
        :key="item.prop"
        :prop="item.prop"
        :width="item.width"
        :min-width="item.minWidth"
        :fixed="item.fixed"
        :show-overflow-tooltip="item.tooltip"
      >
        <template #header>
          <div class="custom-table-header">
            <el-tooltip
              placement="bottom-start"
              :content="item.tip"
              :disabled="!item.tip"
              popper-class="cat-tooltip-popper dark"
              :offset="6"
            >
              {{ item.label }}
            </el-tooltip>
            <SvgIcon
              v-if="(item.tip && item.prop != 'xOptimize') || item.prop === 'lastTime'"
              :name="!item.sort ? 'sort' : item.sort === 'up' ? 'sort-up' : 'sort-down'"
              class="table-sort"
              @click="handleSort(item.prop, index)"
            />
            <el-tooltip
              v-if="item.prop === 'xOptimize'"
              placement="bottom"
              :offset="6"
              popper-class="cat-tooltip-popper func-tooltip"
            >
              <template #content>
                <div class="x-tip-text">
                  <div>{{ t('domainSet2.Xdes1') }}</div>
                  <div>{{ t('domainSet2.Xdes2') }}</div>
                  <div style="margin: 4px 0">
                    {{ t('domainSet2.Xdes3') }}
                  </div>
                  <div>{{ t('domainSet2.Xdes4') }}</div>
                  <div>{{ t('domainSet2.Xdes5') }}</div>
                </div>
              </template>
              <SvgIcon name="tip-icon" style="width: 16px; height: 16px; margin-left: 2px" />
            </el-tooltip>
            <el-tooltip
              v-if="item.prop === 'updateTime'"
              :content="t('common.time_zone_desc')"
              placement="top"
              effect="light"
            >
              <SvgIcon name="tip-icon" style="width: 16px; height: 16px; margin-left: 2px" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row, $index }">
          <div v-if="item.prop === 'hostRecord'">
            <!-- 主机记录 -->
            <template v-if="row.type === 'edit'">
              <el-tooltip
                v-if="row.type === 'edit'"
                :visible="!!state.errors[$index].is_host"
                placement="top"
                effect="light"
                :content="state.errors[$index].is_host"
                popper-class="add-record-tooltip"
              >
                <el-input
                  id="host_record"
                  v-model.trim="row.hostRecord"
                  :class="{
                    'type1-error-input': !!state.errors[$index].is_host,
                  }"
                  style="width: 120px"
                  @click.stop
                  @mouseenter="showNotice('#host_record', row, $index)"
                />
              </el-tooltip>
            </template>
            <el-tooltip
              v-else
              class="cat-tooltip-popper"
              effect="dark"
              :content="row.hostRecord"
              placement="top"
              :offset="20"
              :disabled="state.hostRecordTooltip !== $index"
            >
              <div
                class="special text-over"
                @mouseenter="e => hostRecordEnter(e, $index)"
                @mouseleave="hostRecordLeave"
              >
                <span class="special-span">{{ row.hostRecord }}</span>
              </div>
            </el-tooltip>
          </div>
          <!-- 记录类型 -->
          <div v-else-if="item.prop === 'recordType'">
            <template v-if="row.type === 'edit'">
              <el-select
                id="record_type"
                v-model="row.recordType"
                placeholder="Select"
                style="width: 110px"
                @click.stop
                @mouseenter="showNotice('#record_type', row, $index)"
                @change="type => recordTypeChange(type, $index)"
              >
                <el-option
                  v-for="(item, index) in state.analysis.filter(item => item.status === 1)"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
            <div v-else>
              {{ row.recordTypeName }}
            </div>
          </div>
          <!-- 线路类型 -->
          <div v-else-if="item.prop === 'lineType'" class="table-route_type">
            <template v-if="row.type === 'edit'">
              <div class="tree-select-wrap" @click.stop @mouseenter="showNotice('#line_type', row, $index)">
                <DnsLineVue
                  v-model:id="row.lineTypeId"
                  :options="state.lineTypes"
                  style="width: 100%"
                  :tele-class="'xxx-' + $index"
                />
              </div>
            </template>
            <div v-else class="text-over">
              {{ _matchRouteType(row.lineTypeId, state.lineTypes)?.lineName }}
            </div>
          </div>
          <div v-else-if="item.prop === 'recordValue'" class="text-over">
            <!-- 记录值 -->
            <el-tooltip
              v-if="row.type === 'edit'"
              :visible="!!state.errors[$index].is_record_value"
              placement="top"
              :content="state.errors[$index].is_record_value"
              popper-class="add-record-tooltip"
            >
              <el-input
                id="record_value"
                v-model.trim="row.recordValue"
                style="width: 120px"
                :class="{
                  'type1-error-input': !!state.errors[$index].is_record_value,
                }"
                :placeholder="t('recordMana.recordValuePlaceholder')"
                @click.stop
                @mouseenter="showNotice('#record_value', row, $index)"
              />
            </el-tooltip>
            <div v-else class="text-over" style="width: 100%">
              {{ row.recordValue }}
            </div>
          </div>
          <!-- 权重 -->
          <div v-else-if="item.prop === 'weight'" class="table-weight">
            <el-tooltip
              v-if="row.type === 'edit' && supportMxWeight($index).weight"
              :visible="!!state.errors[$index].is_weight"
              placement="top"
              effect="light"
              :content="state.errors[$index].is_weight"
              popper-class="add-record-tooltip"
            >
              <el-input
                id="weight"
                v-model.number="row.weight"
                style="width: 60px"
                @click.stop
                @mouseenter="showNotice('#weight', row, $index)"
              />
            </el-tooltip>
            <div v-else>
              {{ row.weight }}
            </div>
          </div>
          <!-- 优先级 -->
          <div v-else-if="item.prop === 'mx'">
            <el-tooltip
              v-if="row.type === 'edit' && supportMxWeight($index).mx"
              :visible="!!state.errors[$index].is_mx"
              placement="top"
              effect="light"
              :content="state.errors[$index].is_mx"
              popper-class="add-record-tooltip"
            >
              <el-input
                id="mx"
                v-model.number="row.mx"
                style="width: 60px"
                @click.stop
                @mouseenter="showNotice('#mx', row, $index)"
              />
            </el-tooltip>
            <div v-else>
              {{ row.mx }}
            </div>
          </div>
          <!-- ttl -->
          <div v-else-if="item.prop === 'ttl'">
            <el-tooltip
              v-if="row.type === 'edit'"
              :visible="!!state.errors[$index].is_ttl"
              placement="top"
              effect="light"
              :content="state.errors[$index].is_ttl"
              popper-class="add-record-tooltip"
            >
              <el-input
                id="ttl"
                v-model.number="row.ttl"
                placeholder="TTL"
                style="width: 60px"
                @click.stop
                @mouseenter="showNotice('#ttl', row, $index)"
              />
            </el-tooltip>
            <div v-else>
              {{ row.ttl }}
            </div>
          </div>
          <!-- 监控 -->
          <div v-else-if="item.prop === 'monitor'" class="table-monitor">
            <el-tooltip
              v-if="row.type !== 'edit'"
              placement="top"
              effect="light"
              :disabled="!!row.monitor"
              popper-class="cat-tooltip-popper"
            >
              <template #content>
                {{ t('recordMana.noMonitor')
                }}<span class="add-monitor-span" style="margin-left: 4px" @click="toAddMonitor(row)">{{
                  t('recordMana.toOpenMonitor')
                }}</span>
              </template>
              <SvgIcon pointer :name="row.monitor ? 'monitor-eye-active' : 'monitor-eye'" @click="toMonitorLog(row)" />
            </el-tooltip>
          </div>
          <!-- M优化 -->
          <div v-else-if="item.prop === 'xOptimize'" v-show="row.type !== 'edit'">
            <span :style="{ color: row.xOptimize ? 'var(--success-color)' : '#999999' }">
              {{ row.xOptimize ? t('common.open') : t('common.closed') }}
              <SvgIcon
                :name="xLoading ? 'dialog-loading' : 'handle-edit'"
                pointer
                :loading="xLoading"
                style="color: #999"
                @click="handleOptimize(row, $index)"
              />
            </span>
          </div>
          <!-- 状态 -->
          <div v-else-if="item.prop === 'status'" class="table-status">
            <template v-if="row.status !== void 0 && row.type !== 'edit'">
              <span :class="getActive(row.status, analysisStatus)?.class" />
              {{ getActive(row.status, analysisStatus)?.label }}
            </template>
          </div>
          <!-- 最后操作时间 -->
          <div v-else-if="item.prop === 'updateTime'">
            {{ row.updateTime > 0 ? _formateTimeDayjs(row.updateTime * 1000, FORMAT_TIME) : '-' }}
          </div>
          <!-- 备注 -->
          <div v-else-if="item.prop === 'remark'" class="text-over">
            <el-input
              v-if="row.type === 'edit'"
              v-model="row.remark"
              :placeholder="t('columns.remark')"
              style="width: 80px"
              @click.stop
            />
            <template v-else>
              {{ row.remark }}
            </template>
          </div>
          <!-- 操作 -->
          <div v-else-if="item.prop === 'handle'" class="table-handle">
            <template v-if="row.type === 'edit'">
              <el-link type="primary" @click.stop="handleEditSave(row, $index)">
                {{ t('common.save') }}
              </el-link>
              <el-link type="primary" @click.stop="handleEditCancel(row, $index)">
                {{ t('common.cancel') }}
              </el-link>
              <el-link type="primary" @click="handleHelp(row, $index)">
                {{ needTip ? t('common.pickup') : t('common.help') }}
              </el-link>
              <el-tooltip placement="top-start" popper-class="cat-tooltip-popper">
                <template #content>
                  <div class="record-exchange-content2">
                    <div class="t">
                      {{ t('recordMana.notUseLine') }}
                    </div>
                    <div class="pic">
                      <img :src="RecordLineImg" alt="" />
                    </div>
                    <el-button type="primary" @click="handleExchange($index)">
                      {{ t('recordMana.try') }}
                    </el-button>
                  </div>
                </template>
                <el-link type="primary" @click="handleExchange($index)">
                  {{ t('common.exchange') }}
                </el-link>
              </el-tooltip>
            </template>
            <template v-else>
              <el-link type="primary" :disabled="state.loading" @click.stop="handleEdit(row, $index)">
                {{ t('common.edit') }}
              </el-link>
              <el-link
                v-if="row.status === 1"
                type="primary"
                :disabled="state.loading"
                @click="setParse('single', row, $index)"
              >
                {{ t('common.pause') }}
              </el-link>
              <el-link v-if="row.status === 2" type="primary" @click="setParse('single', row, $index)">
                {{ t('common.start') }}
              </el-link>
              <el-link type="primary" :disabled="state.loading" @click="handleRemark($index)">
                {{ t('common.remark') }}
              </el-link>
              <el-link type="primary" :disabled="state.loading" @click.stop="singleDelete($index)">
                {{ t('common.delete') }}
              </el-link>
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <CatPagination v-model:pagination="state.pagination" :total="state.total" @change="getData" />
    <!-- 删除弹框 -->
    <CatDialog
      v-model:dialog="state.deleteDialog"
      class="delete-dialog"
      :loading="state.dialogLoading"
      :width="500"
      @confirm="deleteConfirm"
    >
      <div class="delete-cont">
        <SvgIcon name="dialog-warning" />
        <div>
          <div class="t">
            {{ t('recordMana.deleteRecord') }}
          </div>
          <div class="c">
            {{ t('recordMana.deleteTip') }}
          </div>
        </div>
      </div>
    </CatDialog>
    <!-- 修改状态完成后的弹框 -->
    <CompleteDialog
      ref="completeDialogRef"
      :dialog="state.showComplete ? state.completeDialog : false"
      @close="() => (state.completeDialog = false)"
      @hide="completeDialogHide"
    />
    <!-- 备注 -->
    <CatDialog
      v-model:dialog="state.remarkDialog"
      :title="t('recordMana.remarkTitle')"
      :loading="state.dialogLoading"
      :disabled="!state.newRemark"
      @confirm="remarkConfirm"
    >
      <div class="remark-cont">
        <el-input
          v-model="state.newRemark"
          maxlength="200"
          :placeholder="t('domainSet2.remarkPlaceholder')"
          show-word-limit
          type="textarea"
        />
      </div>
    </CatDialog>

    <!-- 添加记录弹框 -->
    <AddRecordDialog
      ref="_record_dialog"
      v-model:dialog="addRecordVisible"
      :domain-name="state.domainName"
      :analysis="state.analysis"
      :line-types="state.lineTypes"
      :is-edit="isEditDialog"
      :notice-obj="noticeObj"
      :loading="state.loading"
      :row="state.current === -1 ? {} : state.tableData[state.current]"
      @change-value-tip="updateRecordValueTip"
      @close="exChangeClose"
      @confirm="exChangeConfirm"
      @be-line="beLine"
    />

    <!-- 修改M优化 -->
    <CatDialog2
      v-model:dialog="xDialog"
      :title="state.current == -1 ? '' : state.domainName + t('domainSet2.Xconfig')"
      :width="550"
      :disabled="!xForm.maxReturn || !xForm.sensitivity"
      :loading="xLoading"
      @cancel="() => (xDialog = false)"
      @confirm="handleXconfirm"
    >
      <el-form label-width="auto" label-position="left">
        <el-form-item :label="t('domainSet2.Xsensitivity')">
          <el-select v-model="xForm.sensitivity">
            <el-option v-for="(item, index) in sensitivityArr" :key="index" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('domainSet2.XmaxReturn')">
          <el-select v-model="xForm.maxReturn">
            <el-option label="1" :value="1" />
            <el-option label="2" :value="2" />
            <el-option label="3" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('columns.status')">
          <el-switch v-model="xForm.xOptimize" />
        </el-form-item>
        <div class="notice-b">
          <SvgIcon name="blue-warn" />
          <span>{{ t('recordMana.Mtip') }}</span>
        </div>
      </el-form>
    </CatDialog2>

    <!-- 开启和暂停解析弹框 -->
    <CatDialog v-model:dialog="parseDialog" :title="parseTitle()" :loading="parseLoading" @confirm="parseConfirm">
      <template v-if="activeRow && parseType === 'single'">
        {{ activeRow.status === 1 ? t('recordMana.parseStop') : t('recordMana.parseStart') }}
      </template>
      <template v-else-if="parseType === 'multi'">
        {{ parseStatus !== 1 ? t('recordMana.parseStop') : t('recordMana.parseStart') }}
      </template>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import CompleteDialog from './complete-dialog.vue'
import AddRecordDialog from './add-record-dialog.vue'

import { MyDnsState } from './type'
import { batchOption } from '../my-domains/config'
import { columns, analysisStatus, noticeObj, noticeTitle, singleValidate } from './config'
import { _deepClone, isSameObj, getActive } from '@/utils/collection-utils'
import { _getElClient2, _getElClientX } from '@/utils/dom-utils'
import { _throttle } from '@/utils/timing-utils'
import { _formatRouteType, _matchRouteType, _setRecordType } from '@/utils/dns-utils'
import { getHabit } from '@/utils/habit-utils'
import {
  _getAnalysisList,
  _batchAddAnalysis,
  _editAnalysisDetail,
  _changeAnalysisStatus,
  _deleteAnalysis,
  _changeAnalysisX,
  _editAnalysisRemark,
} from '@/apis/dns/analysis'
import { _getAnalysisTypeList, _getLineTypes } from '@/apis/dns/sys'
import { _formateTimeDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { _changeDomainInfo, _changeDomainX } from '@/apis/dns/domain'
import { message } from '@/utils/message'
import { _s_getItem, _s_setItem, setSessionItemRaw } from '@/utils/storage'
import { LANGUAGE_MAP, USER_HABIT } from '@/config/constant-config'
import { useBaseStore } from '@/store'
import RecordLineImg from '@/assets/images/dns/record-line1.png'
import DnsLineVue from '@/components/dns/dns-line/index.vue'
import CatCdnTable from '@/components/common/cat-cdn-table/index.vue'
import { FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
const HABIT_NAME = 'record-mana'
const route = useRoute()
const my_dns_table = ref()
const state = reactive<MyDnsState>({
  domainId: 0,
  domainName: '',
  loading: false,
  dialogLoading: false,
  showHeaderBoxShadow: false,
  current: 0,
  pagination: {
    page: 1,
    pageSize: 10,
  },
  total: 0,
  title: '',
  searchValue: '',
  multipleSelection: [],
  tableData: [],
  unmodifiedValue: [], // 编辑行未修改之前的值
  // 删除提醒
  deleteDialog: false,
  handleType: 'single',

  analysis: [],
  errors: [],
  completeDialog: false,
  showComplete: true, // 是否需要暂时修改状态后的弹窗(记录点击'不再提醒')
  lineTypes: [],

  remarkDialog: false,
  newRemark: '',
  columns,
  noticeId: '',
  hostRecordTooltip: -1,
})
const _record_dialog = ref<any>(null)
const isAddDialog = ref(false) // 添加记录是否弹出dialog
const needTip = ref(true) // 是否展示tip提示信息
const addRecordVisible = ref(false) // 添加记录弹框
const isEditDialog = ref(false) // 编辑/添加
const activeTip = ref(0) // 显示某一行的提示信息
const parseLoading = ref(false)
const parseDialog = ref(false)

const activeRow = computed(() => {
  return state.current !== -1 ? state.tableData[state.current] : null
})
const parseTitle = () => {
  if (parseType.value === 'single') {
    return activeRow.value && activeRow.value.status === 1 ? t('recordMana.status2') : t('recordMana.startParse')
  } else {
    return parseStatus.value !== 1 ? t('recordMana.status2') : t('recordMana.startParse')
  }
}
const parseStatus = ref<1 | 2>(1)
const parseType = ref<'single' | 'multi'>('single') // 解析

const setParse = (type: 'single' | 'multi', row: any, multiStatus?) => {
  parseType.value = type
  if (type === 'single') {
    state.current = multiStatus
    parseStatus.value = row.status === 1 ? 2 : 1
  } else {
    console.log('我看看', multiStatus)

    parseStatus.value = multiStatus
  }
  parseDialog.value = true
}

// 确认修改解析
const parseConfirm = async () => {
  changeAnalysisStatus(parseType.value, activeRow.value, parseStatus.value)
}

// 修改MX
const xDialog = ref(false)
const xLoading = ref(false)
const sensitivityArr = [
  { label: t('domainSet2.highSensitivity'), value: 2 },
  { label: t('domainSet2.lowSensitivity'), value: 1 },
  // { label: t('domainSet2.noOpen'), value: 0 },
]
const xForm = ref({
  xOptimize: false,
  sensitivity: 0,
  maxReturn: 1,
})
const handleXconfirm = async () => {
  try {
    xLoading.value = true
    const { code, data } = await _changeAnalysisX({
      domainId: state.domainId,
      hostRecord: state.tableData[state.current].hostRecord,
      analysisId: state.tableData[state.current].id,
      xOptimizeState: Number(xForm.value.xOptimize),
      sensitivity: xForm.value.sensitivity,
      maxReturn: xForm.value.maxReturn,
    })
    xLoading.value = false
    if (code === 200) {
      message.success(t('common.operationSuccess'))
      state.tableData[state.current] = data ? { ...data } : {}
      xDialog.value = false
      getData()
      // state.current = -1
    }
  } catch (error) {
    console.log('修改x失败', error)
    xLoading.value = false
  }
}

const hostRecordEnter = (e, i: number) => {
  const span = e.target.children[0]
  if (e.target.offsetWidth <= span.offsetWidth) {
    state.hostRecordTooltip = i
  } else {
    state.hostRecordTooltip = -1
  }
}
const hostRecordLeave = () => {
  // state.hostRecordTooltip = -1
}

const completeDialogHide = () => {
  state.completeDialog = false
  state.showComplete = false
  const habit = getHabit()
  _s_setItem(USER_HABIT, {
    ...habit,
    [HABIT_NAME]: {
      removeComplete: true,
    },
  })
}

const columnsChange = computed(() => {
  if (useBaseStore().lang === LANGUAGE_MAP.zh.i18nParam) {
    state.columns[state.columns.length - 1].width = 240
  } else {
    state.columns[state.columns.length - 1].width = 290
  }
  return state.columns
})

const batchChange = (name: string) => {
  pushRoute({ name })
}
// 选择
const handleSelectionChange = (val: any[]) => {
  state.multipleSelection = val
}
// 全选
const handleSelectAll = (val: any[]) => {
  console.log('全选', val)
}
// 搜索
const handleSearch = () => {
  getData()
}

// 点击M优化
const handleOptimize = async (row, i: number) => {
  // 限制条件: 同一域名下有2条以上A记录的才可以操作M优化
  try {
    xLoading.value = true
    const { code, data } = await _getAnalysisList({
      domainId: state.domainId,
      keyword: '',
      page: 1,
      pageSize: 9999999999,
    })
    xLoading.value = false
    if (code === 200) {
      const l = data ? data.list : []
      let A_count = 0
      l.forEach(item => {
        if (item.hostRecord === row.hostRecord && item.recordType === 1) {
          A_count++
        }
      })
      if (A_count >= 2) {
        state.current = i
        xForm.value = {
          xOptimize: Boolean(row.xOptimize),
          sensitivity: row.sensitivity || '',
          maxReturn: row.maxReturn || '',
        }
        xDialog.value = true
      } else {
        message.warning(t('domainSet2.cannotX'))
      }
    } else {
      console.log('获取记录列表失败--')
    }
  } catch (error) {
    xLoading.value = false
  }
}

// 添加记录
const handleAdd = () => {
  // 打开弹窗
  if (isAddDialog.value) {
    isEditDialog.value = false
    addTableItem()
    state.current = 0
    addRecordVisible.value = true
  } else {
    // 行内添加
    addTableItem()
    state.current = 0
    updateRecordValueTip()
  }
}

// 校验
const validate = (row: any, i: number) => {
  resetError()
  // 校验主机记录
  if (!row.hostRecord) {
    state.errors[i].is_host = singleValidate.host(row.hostRecord)
  }
  //  校验权重
  if (row.weight === 1) {
    state.errors[i].is_weight = singleValidate.weight(row.weight)
  }
  // 校验优先级
  if (row.mx === 1) {
    state.errors[i].is_mx = singleValidate.mx(row.mx)
  }
  // 校验ttl
  state.errors[i].is_ttl = singleValidate.ttl(row.ttl)
  // 校验记录值
  row.recordValue = row.recordValue ? row.recordValue.trim() : row.recordValue
  state.errors[i].is_record_value = singleValidate.record_value(row.recordValue, row)
  return Object.values(state.errors[i]).filter(item => item).length === 0
}

// 编辑
const handleEdit = (row: any, i: number) => {
  hideNotice()
  state.current = i
  state.unmodifiedValue.push(_deepClone(row))
  // 开弹窗
  if (isAddDialog.value) {
    isEditDialog.value = true
    addRecordVisible.value = true
  } else {
    // 行内
    resetError()
    row.type = 'edit'
    // 存放这一行edit之前的值

    row.recordType = _setRecordType(state.analysis, true, row.recordType)
    updateRecordValueTip(row.recordType)
  }
}

const completeDialogRef = ref<any>()

// 编辑保存
const handleEditSave = async (row: any, i: number) => {
  if (!row.recordType) {
    return
  }
  if (!row.hostRecord) {
    row.hostRecord = '@'
  }
  if (!row.ttl) {
    row.ttl = 0
  }
  if (!row.weight) {
    row.weight = 0
  }
  if (!row.mx) {
    row.mx = 0
  }
  if (validate(row, i)) {
    try {
      state.loading = true
      if (row.isNew) {
        const line = _matchRouteType(row.lineTypeId, state.lineTypes)
        // 新增
        const newRow = {
          domainId: state.domainId,
          hostRecord: row.hostRecord,
          recordType: row.recordType,
          lineType: line?.lineValue,
          lineTypeId: line?.lineTypeId,
          recordValue: row.recordValue.trim(),
          ttl: row.ttl ? Number(row.ttl) : 0,
          mx: row.mx,
          weight: row.weight ? Number(row.weight) : 0,
          remark: row.remark,
        }
        const { code, data } = await _batchAddAnalysis(newRow)
        state.loading = false
        hideNotice()
        if (code === 200) {
          if (state.showComplete) {
            // 展示弹框
            completeDialogRef.value.updateTime = data?.updateTime ? data.updateTime * 1000 : Date.now()
            state.completeDialog = true
          } else {
            message.success(t('recordMana.completeMsg'))
          }
          state.tableData[i] = data ? { ...data } : {}
          // addRecordVisible.value = false
          state.current = -1
          if (_record_dialog.value) {
            _record_dialog.value.vmClose()
          }
        }
      } else {
        const line = _matchRouteType(row.lineTypeId, state.lineTypes)
        // 修改
        const editData = {
          domainId: state.domainId,
          analysisId: row.id,
          id: row.id,
          hostRecord: row.hostRecord,
          recordType: row.recordType,
          lineType: line?.lineValue,
          lineTypeId: line?.lineTypeId,
          value: row.recordValue,
          recordValue: row.recordValue.trim(),
          ttl: row.ttl ? Number(row.ttl) : 0,
          mx: row.mx,
          weight: row.weight ? Number(row.weight) : 0,
          remark: row.remark,
        }
        // 判断修改的值和之前存放的值是否是一样的
        const realData = state.unmodifiedValue.find(item => item.id === row.id)
        console.log(realData)
        const isSame = isSameObj(realData, editData, [
          'hostRecord',
          'recordType',
          'lineTypeId',
          'recordValue',
          'weight',
          'mx',
          'ttl',
          'remark',
        ])
        if (isSame) {
          state.current = i
          state.tableData[state.current].type = ''
          state.loading = false
          state.current = -1
          state.unmodifiedValue = state.unmodifiedValue.filter(item => item.id !== editData.id)
          hideNotice()
          if (_record_dialog.value) {
            _record_dialog.value.vmClose()
          }
        } else {
          // 提交编辑修改
          const { code, data } = await _editAnalysisDetail(editData)
          state.loading = false
          if (code === 200) {
            if (state.showComplete) {
              // 展示弹框
              completeDialogRef.value.updateTime = data?.updateTime ? data.updateTime * 1000 : Date.now()
              state.completeDialog = true
            } else {
              message.success(t('recordMana.completeMsg'))
            }
            state.unmodifiedValue = state.unmodifiedValue.filter(item => item.id !== editData.id)
            hideNotice()
            state.tableData[i] = data || {}
            state.current = -1
            if (_record_dialog.value) {
              _record_dialog.value.vmClose()
            }
          }
        }
      }
    } catch (error) {
      state.loading = false
    }
  } else {
    console.log('校验失败', state.errors)
  }
}

// 编辑取消
const handleEditCancel = (row: any, i: number) => {
  hideNotice()
  if (row.isNew) {
    // 如果是新添加的 取消的话
    state.tableData = state.tableData.filter((item, index) => index !== i)
  } else {
    // state.unmodifiedValue 中存放的是旧的值, 所以需要根据 id 找到对应的旧值
    const realData = state.unmodifiedValue.find(item => item.id === row.id)
    // 非新添加, 编辑的是已存在的数据
    state.tableData[i] = { ...realData, type: '' }
  }
  resetError()
}
const handleRemark = (i: number) => {
  state.current = i
  state.newRemark = state.tableData[i].remark
  state.remarkDialog = true
}

const handleHelp = (row, i: number) => {
  needTip.value = !needTip.value
  showNotice('#host_record', row, i)
}

// 切换
const handleExchange = (i: number) => {
  state.current = i
  isAddDialog.value = !isAddDialog.value
  isEditDialog.value = true
  addRecordVisible.value = true
}

const exChangeClose = (row: any) => {
  if (state.current === -1) return
  handleEditCancel(row, state.current)
}

const exChangeConfirm = (row: any) => {
  handleEditSave(row, state.current)
}

// 从弹窗切换到行内
const beLine = (row: any) => {
  isAddDialog.value = false
  resetError()
  if (isEditDialog.value) {
    state.tableData[state.current] = { ...row, type: 'edit' }
  } else {
    state.tableData[state.current] = { ...row, type: 'edit' }
  }
  state.current = -1
  if (_record_dialog.value) {
    _record_dialog.value.vmClose()
  }
  updateRecordValueTip()
}

const rowClassName = ({ row, rowIndex }) => {
  if (state.multipleSelection.find(item => item.id === row.id)) {
    return `is-checked ${'row-' + rowIndex}`
  } else {
    return `${'row-' + rowIndex}`
  }
}

// 修改备注
const remarkConfirm = async () => {
  try {
    state.dialogLoading = true
    const row = state.tableData[state.current]
    const { code } = await _editAnalysisRemark({
      domainId: state.domainId,
      analysisId: row.id,
      remark: state.newRemark,
    })
    state.dialogLoading = false
    if (code === 200) {
      message.success(t('common.changeSuccess'))
      state.remarkDialog = false
      if (state.current !== -1) {
        state.tableData[state.current].remark = state.newRemark
      }
    }
  } catch (error) {
    state.dialogLoading = false
  }
}

// 批量删除
const handleDelete = () => {
  state.handleType = 'multi'
  state.deleteDialog = true
}
// 单个删除
const singleDelete = (i: number) => {
  clearSelection()
  state.handleType = 'single'
  state.current = i
  state.deleteDialog = true
}
// 删除确认
const deleteConfirm = async () => {
  try {
    state.dialogLoading = true
    let data: any = { domainId: state.domainId }
    if (state.handleType === 'single') {
      data.analysisId = state.tableData[state.current].id + ''
    } else {
      data.analysisId = state.multipleSelection.map(item => item.id).join(',')
    }
    const { code } = await _deleteAnalysis(data)
    state.dialogLoading = false
    if (code === 200) {
      message.success(t('common.deleteSuccess'))
      state.deleteDialog = false
      getData()
    }
  } catch (error) {
    state.dialogLoading = false
  }
}
const clearSelection = () => {
  my_dns_table.value?.clearSelection()
}
//
const recordTypeChange = (type: number, i: number) => {
  const { mx, weight } = state.analysis.find(item => item.type === type)
  // 看是否支持mx, weight
  if (mx) {
    state.tableData[i].mx = 5
  } else {
    state.tableData[i].mx = 0
  }
  if (!weight) {
    state.tableData[i].weight = 0
  }
  updateRecordValueTip(type)
}

// 判断是否支持mx和weight
const supportMxWeight = (i: number): { mx: number; weight: number } => {
  const { mx, weight } = state.analysis.find(item => item.type === state.tableData[i].recordType)
  return {
    mx,
    weight,
  }
}

// 更新记录值的提示语
const updateRecordValueTip = (type?: number) => {
  if (!state.analysis[0]) return
  if (!type) {
    type = state.analysis[0].type
  }
  let record_value_tip: any[] = []
  // 记录值的提示语更新
  switch (type) {
    // A记录
    case 1:
      record_value_tip = [t('recordMana.record_value_1')]
      break
    // MA
    case 1001:
      record_value_tip = [t('recordMana.record_value_1_1')]
      break
    // CNAME
    case 5:
      record_value_tip = [t('recordMana.record_value_2')]
      break
    // MCNAME
    case 1005:
      record_value_tip = [t('recordMana.record_value_2_1')]
      break
    // LINK
    case 1006:
      record_value_tip = [t('recordMana.record_value_2_2')]
      break
    case 15:
      record_value_tip = [t('recordMana.record_value_3')]
      break
    case 16:
      record_value_tip = [t('recordMana.record_value_4')]
      break
    case 28:
      record_value_tip = [t('recordMana.record_value_5')]
      break
    case 257:
      record_value_tip = [
        t('recordMana.record_value_7_1'),
        t('recordMana.record_value_7_2'),
        t('recordMana.record_value_7_3'),
        t('recordMana.record_value_7_4'),
      ]
      break
    case 33:
      record_value_tip = [t('recordMana.record_value_8')]
      break
    case 65:
      record_value_tip = [t('recordMana.record_value_9')]
      break
    case 64:
      record_value_tip = [t('recordMana.record_value_10')]
      break
    case 99:
      record_value_tip = [t('recordMana.record_value_11')]
      break
    case 301:
      record_value_tip = [t('recordMana.record_value_12')]
      break
    case 303:
      record_value_tip = [t('recordMana.record_value_13')]
      break
    default:
      record_value_tip = []
      break
  }
  record_value_tip = record_value_tip.map(item => ({
    text: item,
  }))
  noticeObj['#record_value'] = record_value_tip[0] ? [{ text: t('recordMana.record_value1') }, ...record_value_tip] : []
}

// showNotice
const showNotice = (id: string, row: any, i: number) => {
  if (noticeObj['#record_value'].length === 0) {
    return
  }
  activeTip.value = i || 0
  // recordTypeChange(state.tableData[i].recordType, i)
  updateRecordValueTip(state.tableData[i].recordType)
  state.noticeId = id
  my_dns_table.value?.toggleRowExpansion(row, true)
}

const hideNotice = (row?: any) => {
  state.noticeId = ''
  if (row) {
    my_dns_table.value?.toggleRowExpansion(row, false)
  } else {
    state.tableData.forEach(_row => {
      my_dns_table.value?.toggleRowExpansion(_row, false)
    })
  }
}

// 排序
const sort = (key, i) => {
  state.tableData.sort((a, b) => {
    if (typeof a[key] === 'string') {
      return state.columns[i].sort === 'up' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key])
    } else {
      return state.columns[i].sort === 'up' ? a[key] - b[key] : b[key] - a[key]
    }
  })
}
// 排序
const handleSort = (key: string, i: number) => {
  if (!state.columns[i].sort) {
    // 初始模样 默认升序
    state.columns[i].sort = 'up'
    sort(key, i)
  } else {
    state.columns[i].sort = state.columns[i].sort === 'up' ? 'down' : 'up'
    sort(key, i)
  }
}

// ** ------------------计算属性
// 当前是否存在正在编辑的域名
const isExsitEditRow = computed(() => {
  return !!state.tableData.find(item => item.type === 'edit')
})
// 判断能否点击暂停按钮
const canPlayPause = computed(() => {
  if (state.multipleSelection.length === 0) {
    return false
  } else if (state.loading) {
    return false
  } else if (isExsitEditRow.value) {
    return false
  } else {
    return true
  }
})
// 判断能否点击开启按钮
const canPlayStart = computed(() => {
  if (state.multipleSelection.length === 0) {
    return false
  } else if (state.loading) {
    return false
  } else if (isExsitEditRow.value) {
    return false
  } else {
    return true
  }
})

// 获取列表
const getData = async () => {
  state.unmodifiedValue = []
  try {
    state.loading = true
    const { code, data } = await _getAnalysisList({
      domainId: state.domainId,
      keyword: state.searchValue,
      ...state.pagination,
    })
    state.loading = false
    hideNotice()
    if (code === 200) {
      state.tableData = data.list || []
      state.total = data.total
      state.columns.forEach(item => (item.sort = undefined))
      resetError()
    }
  } catch (error) {
    state.loading = false
    state.tableData = []
    state.errors = []
    state.total = 0
    hideNotice()
    resetError()
  }
}

// 获取记录类型名称
const getRecordtypeName = (type: number) => {
  return state.analysis.find(item => item.value === type)?.name
}

const addTableItem = () => {
  const defaultLine = state.lineTypes.find(item => item.isDefault)
  console.log('default', defaultLine)
  state.errors.unshift({
    is_host: '',
    is_mx: '',
    is_record_value: '',
    is_ttl: '',
    is_weight: '',
  })
  state.tableData.unshift({
    key: +new Date(),
    hostRecord: '@',
    recordType: _setRecordType(state.analysis), // 记录类型
    lineTypeId: defaultLine?.lineId, // 路线类型id
    lineType: defaultLine?.lineValue,
    mx: 0, // 优先级
    weight: 0, // 权重
    ttl: 600, // ttl
    recordValue: void 0, // 记录值
    monitor: void 0, // 监控
    xOptimize: void 0, // M优化
    status: void 0, // 状态
    type: 'edit',
    isNew: true,
  })
  console.log('state.tableData', state.tableData[0])
}

const resetError = (i?: number) => {
  if (typeof i === 'number') {
    state.errors[i] = {
      is_host: '',
      is_mx: '',
      is_record_value: '',
      is_ttl: '',
      is_weight: '',
    }
  } else {
    state.errors = state.tableData?.map(item => ({
      is_host: '',
      is_mx: '',
      is_record_value: '',
      is_ttl: '',
      is_weight: '',
    }))
  }
}

// 修改状态
const changeAnalysisStatus = _throttle(async (type: 'single' | 'multi', row: any, multiStatus) => {
  try {
    state.loading = true
    let analysisId: string = ''
    let status: 1 | 2 = 1
    if (type === 'single') {
      analysisId = row.id + ''
      status = row.status === 2 ? 1 : 2
    } else {
      analysisId = state.multipleSelection.map(item => item.id).join(',')
      status = multiStatus
    }
    const { code } = await _changeAnalysisStatus({
      domainId: state.domainId,
      analysisId,
      status,
    })
    state.loading = false
    if (code === 200) {
      parseDialog.value = false
      if (state.showComplete) {
        state.completeDialog = true
      } else {
        message.success(t('recordMana.completeMsg'))
      }
      getData()
    }
  } catch (error) {
    state.loading = false
  }
}, 1000)

// 获取域名解析类型列表
const getAnalysisData = async () => {
  try {
    state.loading = true
    const { code, data } = await _getAnalysisTypeList()
    state.loading = false
    if (code === 200) {
      const { types } = data
      types &&
        types.forEach((item: any) => {
          item.value = item.type
          item.label = item.name
        })
      const recordValueNotice =
        types &&
        types
          .map((item: any) => ({
            title: item.name,
            text: item.d2,
            status: item.status,
          }))
          .filter(item => item.status === 1)

      state.analysis = types || []
      noticeObj['#record_type'] = [
        { text: t('recordMana.record_type1') },
        { text: t('recordMana.record_type2') },
        ...recordValueNotice,
      ]
      updateRecordValueTip()
    }
  } catch (error) {
    state.loading = false
  }
}
// 获取线路列表
const getLineTypes = async () => {
  try {
    state.loading = true
    const { code, data } = await _getLineTypes()
    state.loading = false
    if (code === 200) {
      state.lineTypes = data ? _formatRouteType(data) : []
    }
  } catch (error) {
    console.log('线路error', error)
    state.loading = false
  }
}
// 跳转添加监控页面
const toAddMonitor = (row: any) => {
  // 需要把name和id都存起来
  setSessionItemRaw(
    'temp-data',
    JSON.stringify({
      name: state.domainName,
      id: state.domainId,
    }),
  )
  pushRoute({
    name: 'AddMonitor',
    query: {
      edit: row.monitor ? 1 : 0,
      id: row.monitor,
      name: 'RecordMana',
      backTitle: 'recordMana.backFromMonitor',
    },
  })
}
// 跳转监控日志
const toMonitorLog = row => {
  if (!row.monitor) return
  pushRoute({
    name: 'MonitorTask',
    query: {
      active: 2,
      keyword: state.domainName,
    },
  })
}

onMounted(() => {
  state.domainId = Number(route.query.id)
  const { name } = route.query
  state.domainName = name as string

  const habit = getHabit()
  if (habit && habit[HABIT_NAME]) {
    // 不再展示complete弹框
    state.showComplete = !habit[HABIT_NAME]
  }

  getLineTypes()
  getData()
  getAnalysisData()
})
</script>

<style scoped lang="scss">
.special {
  width: 130px;
  text-indent: 0;
  transform: translateX(-30px);
}

.record-mana {
  position: relative;
  padding: 0 20px;
}

.content-handle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;

  & > div {
    display: flex;
    align-items: center;
  }

  .el-input {
    width: 240px;
    height: var(--input-height);
  }

  .el-select {
    height: var(--input-height);
  }

  .handle-refresh {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--input-height);
    height: var(--input-height);
    margin-left: 20px;
    cursor: pointer;
    border: 1px solid var(--border-c);
    border-radius: 4px;

    svg {
      width: 16px;
      height: 16px;
      color: #999;
      transition: transform 0.3s;
    }
  }
}

// 表格
:deep(.record-mana-table) {
  .el-table__inner-wrapper {
    .el-table__header-wrapper {
      .el-table__header {
        thead {
          tr {
            background-color: #f9fafc;

            th:nth-child(2) {
              width: 0;
              padding: 0;
            }

            th:nth-child(3) {
              .cell {
                padding-left: 0;
                overflow: visible;
                text-indent: -30px;
              }
            }
          }
        }
      }
    }

    .el-table__body-wrapper {
      .el-scrollbar {
        .el-scrollbar__wrap {
          .el-scrollbar__view {
            .el-table__body {
              tbody {
                tr {
                  background-color: #fff;

                  &:not([class]) {
                    td {
                      height: 0;

                      /* border: 0; */
                    }
                  }
                }

                .el-table__row {
                  td:nth-child(2) {
                    width: 0;

                    .cell {
                      padding: 0 !important;

                      .el-table__expand-icon {
                        display: none !important;
                      }
                    }
                  }

                  td:nth-child(3) {
                    .cell {
                      padding-left: 0;
                      overflow: visible;
                      text-indent: -30px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.table-monitor {
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;

    &.deact {
      cursor: not-allowed !important;
    }
  }
}

.table-status {
  display: flex;
  align-items: center;

  span {
    flex-shrink: 0;
    align-self: center;
    width: 6px;
    height: 6px;
    margin-right: 5px;
    border-radius: 50%;
  }

  .text-success {
    background-color: var(--success-color);
  }

  .text-warning {
    background-color: var(--warning-color);
  }

  .text-error {
    background-color: var(--error-color);
  }
}

.notice-box {
  max-height: 540px;
  padding: 20px;
  overflow-x: auto;
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;

  .notice-box-title {
    margin-bottom: 8px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    line-height: 20;
    color: #000;
  }

  & > div:nth-child(2) {
    color: #000;
  }

  & > div:last-child {
    margin-bottom: 0;
  }

  & > div {
    margin-bottom: 6px;
    line-height: 22px !important;
    color: #555;
  }

  span {
    display: inline-block;
    width: 76px;
    color: var(--primary-color);
    word-break: break-all;
  }

  &.record_type {
    .recommand-a {
      font-weight: bold;
      color: #000;
    }

    .recommand-a-2 {
      counter-reset: #000;
    }
  }
}

.notice-arrow {
  position: fixed;
  width: 0;
  height: 0;
  border-right: 7px solid transparent;
  border-bottom: 7px solid #fff;
  border-left: 7px solid transparent;
}

.table-route_type {
  position: relative;
  width: 100%;
  height: 100%;
}

.tree-select-wrap {
  position: relative;

  .shadow-custom-tree-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.remark-cont {
  :deep(.el-textarea) {
    .el-textarea__inner {
      min-height: 120px !important;
    }
  }
}

.record-exchange-content2 {
  width: 280px !important;
  padding: 2px;

  .t {
    margin-bottom: 8px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    color: #000;
  }

  .pic {
    width: 100%;
    height: 160px;
    margin-bottom: 8px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .el-button {
    width: 100%;
  }
}

.notice-b {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 20px;
  color: var(--primary-color);
  background-color: #e3edff;
  border-radius: 4px;

  svg {
    align-self: baseline;
    width: 16px;
    height: 16px;
    margin-top: 2px;
    margin-right: 8px;
  }
}
</style>

<style lang="scss"></style>

<style lang="scss">
.add-record-tooltip {
  font-size: 12px;
  color: #a60b00 !important;
  background: #f7cfca !important;
  border-color: #f7cfca !important;

  .el-popper__arrow {
    &::before {
      background: #f7cfca !important;
      border-color: #f7cfca !important;
    }
  }
}

.type1-error-input {
  height: 100%;

  .el-input__wrapper {
    box-shadow: 0 0 0 1px var(--error-color, var(--error-color)) inset;

    .el-input__inner {
      color: var(--error-color);
      border-color: var(--error-color);

      &::placeholder {
        text-indent: -999px;
      }
    }
  }
}

.delete-cont {
  display: flex;

  svg {
    width: 32px !important;
    height: 32px !important;
    margin-right: 12px;
    cursor: initial;
  }

  .t {
    margin-bottom: 8px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 16px;
    color: #000;
  }

  .c {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }
}

.el-select {
  // 个别情况 加上类名生效
  &.no-set-value {
    .select-trigger {
      .el-input.is-focus {
        .el-input__wrapper {
          position: relative;

          .el-input__inner {
            text-indent: -999px;

            &::placeholder {
              display: none;
              text-indent: -999px;
            }
          }

          &::after {
            position: absolute;
            top: 50%;
            left: 8px;
            z-index: 99;
            display: inline-block;
            width: 1px;
            height: 50%;
            content: '';
            background-color: #000;
            transform: translateY(-50%);
          }
        }
      }

      .el-input {
        .el-input__wrapper {
          .el-input__inner {
            &::placeholder {
              color: var(--tip-text);
              text-indent: 0;
            }

            font-family: 'PingFang SC-Regular', 'PingFang SC';
            font-size: 14px;
            font-weight: 400;
            color: #000;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.func-tooltip {
  width: 450px;

  .x-tip-title {
    margin-top: 2px;
    margin-bottom: 2px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 14px;
    line-height: 22px;
    color: #555;
  }

  .x-tip-text {
    font-size: 14px;
    font-weight: 400;
    color: #555;
  }
}

.add-monitor-span {
  color: var(--primary-color);
  cursor: pointer;
}
</style>
