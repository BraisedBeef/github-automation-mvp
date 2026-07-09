<template>
  <div>
    <header class="cdn-domain-list-v2__hero">
      <PageBreadcrumbToolbar :items="[t('routes.myDomains')]" />
    </header>

    <div class="tipClass">
      <InfoNotice :text="t('myDomains.listTip')" type="OneToOne" />
    </div>

    <div class="dns-my-domain">
      <div class="page-box" style="padding: 0 20px">
        <div class="content-handle">
          <div class="left">
            <el-button
              type="primary"
              :disabled="state.loading || state.dialogLoading"
              class="add-btn"
              @click="handleAdd"
            >
              +
              {{ t('common.addDomains') }}
            </el-button>
            <el-button :disabled="disabled.delete" class="delete-btn normal" @click="handleDelete(null)">
              {{ t('common.delete') }}
            </el-button>
            <el-button :disabled="disabled.lock" class="lock-btn normal" @click="handleLock('multi')">
              {{ t('common.lock') }}
            </el-button>
            <el-button
              :disabled="disabled.unlock"
              class="unlock-btn normal"
              style="margin-right: 20px"
              @click="handleUnlock('multi')"
            >
              {{ t('common.unlock') }}
            </el-button>
            <el-select
              :model-value="t('common.batchOperation')"
              :disabled="state.loading || state.dialogLoading"
              class="batch-select"
              :class="baseStore.lang"
              @change="batchChange"
            >
              <el-option v-for="item in batchOption" :key="item.name" :label="item.label" :value="item.name" />
            </el-select>
            <!-- <el-select :model-value="t('myDomains.addToGroup')" :disabled="state.loading || state.dialogLoading"
            :teleported="false" :class="['no-set-value', 'group-select', baseStore.lang]" @change="changeDomainGroup"
            :popper-class="state.groupList[0] ? 'is-edit-group' : 'is-edit-group nothing'">
            <el-option v-for="item in state.groupList" :key="item.value" :label="item.label" :value="item.value" />
            <el-option :label="t('myDomains.editGroup')" value="edit"> </el-option>
          </el-select> -->
          </div>
          <!-- 搜索框 -->
          <div class="right">
            <el-input
              v-model.trim="state.searchValue"
              :placeholder="t('myDomains.searchPlaceholder')"
              class="input-with-select"
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
        <TableV2
          ref="my_domain_table"
          v-loading="state.loading"
          :data="state.tableData"
          :total="state.total"
          :pagination="state.pagination"
          show-pagination
          scrollbar-always-on
          :row-class-name="rowClassName"
          :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
          @selection-change="handleSelectionChange"
          @select-all="handleSelectAll"
          @update:pagination="handlePaginationChange"
        >
          <el-table-column type="selection" width="58" />
          <el-table-column
            v-for="(item, index) in columnsChange"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :class="item.prop"
            :min-width="item.minWidth"
            :fixed="item.fixed"
            :show-overflow-tooltip="item.tooltip"
          >
            <template #header>
              <div class="custom-table-header">
                {{ item.label }}
                <template v-if="item.utcTip">
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" class="ml5" />
                  </el-tooltip>
                </template>
                <template v-if="item.tip">
                  <SvgIcon
                    pointer
                    :name="!item.sort ? 'sort' : item.sort === 'up' ? 'sort-up' : 'sort-down'"
                    class="table-sort"
                    @click="handleSort(item.prop, index)"
                  />
                </template>
              </div>
            </template>
            <template #default="{ row, $index }">
              <div v-if="item.prop === 'domain'" class="table-dns text-over" @click="toRecordMana(row)">
                <!-- 2024.7.5之前 -->
                <!-- 锁定状态显示黄点,异常状态显示红点,其余显示绿点 -->
                <!-- 2024.7.5之后 -->
                <!-- 只判断域名状态: 1正常 2暂停 3异常 -->
                <!-- 2024.7.16修改 -->
                <!-- 1.域名锁定, 状态锁定 2.域名暂停, 状态暂停 3.状态(接管)异常, 异常 4.域名正常 状态正常 -->
                <!-- <SvgIcon v-if="row.statusLoading" name="dialog-loading" class="loading-svg" />
              <el-tooltip v-else :content="domainStatus(row).tip" placement="top" popper-class="cat-tooltip-popper">
                <SvgIcon :name="domainStatus(row).icon" pointer class="domain-svg" />
              </el-tooltip> -->
                <span class="text-over round-text">
                  {{ row.domain }}
                </span>
              </div>
              <!-- 接管状态 -->
              <div
                v-else-if="item.prop === 'status'"
                class="table-status"
                @mouseenter="state.rightServer ? null : getDomainInfo(row)"
              >
                <SvgIcon v-if="row.statusLoading" name="dialog-loading" class="loading-svg" />
                <el-tooltip v-else :content="domainStatus(row).tip" placement="top" popper-class="cat-tooltip-popper">
                  <SvgIcon
                    :name="domainStatus(row).icon"
                    pointer
                    class="status-reason__icon"
                    :class="domainStatus(row).className"
                  />
                </el-tooltip>
                <!-- ↑ 正确的dns服务器设置只需要获取一次 -->
                <template v-if="domainStatus(row).statusReason">
                  <span class="status-reason">
                    <el-popover placement="top" trigger="hover" popper-class="take-over-popover" :show-arrow="true">
                      <template #reference>
                        <span class="status-reason__text text-error">
                          {{ row.dnsStatusReason }}
                        </span>
                      </template>
                      <div class="take-over-tooltip">
                        <div class="take-over-tooltip__warning">
                          <SvgIcon name="tip-error" />
                          <span>{{ t('myDomains.takeOverTip1') }}</span>
                        </div>
                        <div class="take-over-tooltip__title">
                          {{ t('myDomains.takeOverTip2') }}
                        </div>
                        <div class="take-over-tooltip__servers">
                          <div
                            v-for="(item, index) in state.rightServer"
                            :key="index"
                            class="take-over-tooltip__server"
                          >
                            <span>{{ item }}</span>
                            <SvgIcon name="copy" pointer @click="handleCopy(item)" />
                          </div>
                        </div>
                        <div class="take-over-tooltip__actions">
                          <el-link type="primary" :disabled="state.loading" @click="viewDomainDetail(row)">
                            {{ t('myDomains.viewDetail') }}
                          </el-link>
                          <button
                            class="take-over-tooltip__verify"
                            type="button"
                            :disabled="state.loading || state.takeOverLoading"
                            @click.stop="refreshDomain(row)"
                          >
                            <span>
                              {{ state.takeOverLoading ? t('domainLayout.verifying') : t('domainLayout.reVerify') }}
                            </span>
                            <SvgIcon name="loading" :loading="state.takeOverLoading" />
                          </button>
                        </div>
                      </div>
                    </el-popover>
                  </span>
                </template>
                <!-- 正常状态(非锁定 且接管状态正常) -->
                <span v-else :class="domainStatus(row).className">{{ domainStatus(row).statusText }}</span>
              </div>
              <!-- 记录数 -->
              <div v-else-if="item.prop === 'parseCount'">
                {{ t('batchOperation.count', { count: row.parseCount }) }}
              </div>
              <div v-else-if="item.prop === 'updateTime'">
                {{ row.updateTime > 0 ? _formateTimeDayjs(row.updateTime * 1000, FORMAT_TIME) : '-' }}
              </div>
              <!-- 域名分组 -->
              <div v-else-if="item.prop === 'groupId'" class="text-over">
                {{ state.groupList.find(item => item.value === row.groupId)?.label }}
              </div>

              <div v-else-if="item.prop === 'handle'" class="table-handle">
                <el-link type="primary" :disabled="state.loading" @click="toRecordMana(row)">
                  {{ t('myDomains.parse') }}
                </el-link>
                <el-link type="primary" :disabled="state.loading" @click="toChart(row)">
                  {{ t('myDomains.statistics') }}
                </el-link>

                <el-link type="primary" :disabled="state.loading" @click="startRemark($index)">
                  {{ t('domainSet2.remark') }}
                </el-link>
                <el-dropdown
                  trigger="hover"
                  class="cat-dropdown"
                  popper-class="cat-dropdown my-domains-more"
                  placement="bottom"
                >
                  <el-link type="primary">
                    {{ t('myDomains.more') }}
                    <SvgIcon name="down-arrow" />
                  </el-link>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleSet(row)">
                        {{ t('common.settings') }}
                      </el-dropdown-item>
                      <!-- 已锁定 显示解除锁定-->
                      <template v-if="row.lockStatus === 1">
                        <el-dropdown-item @click="handleUnlock('single', row)">
                          {{ t('common.toUnlock') }}
                        </el-dropdown-item>
                      </template>
                      <!-- 未锁定 显示域名锁定  -->
                      <template v-if="row.lockStatus === 0">
                        <el-dropdown-item @click="handleLock('single', row)">
                          {{ t('common.notLock') }}
                        </el-dropdown-item>
                      </template>
                      <!-- 解析 -->
                      <el-dropdown-item @click="handleParse($index)">
                        {{ row.status === 1 ? t('recordMana.status2') : t('recordMana.startParse') }}
                      </el-dropdown-item>
                      <!-- 删除 -->
                      <el-dropdown-item @click="handleDelete(row.domainId)">
                        {{ t('common.delete') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </TableV2>
      </div>
      <!-- 编辑分组Modal -->
      <GroupDialog v-model:dialog="state.groupDialog" :list="state.groupList" @refresh="getGroupList" />
      <!-- 删除的dialog -->
      <CatDialog
        v-model:dialog="state.deleteDialog"
        :loading="state.dialogLoading"
        :width="500"
        @confirm="deleteConfirm"
      >
        <div class="delete-cont">
          <SvgIcon name="dialog-warning" />
          <div>
            <div class="t">
              {{ t('myDomains.deleteDomains') }}
            </div>
            <div class="c">
              {{ t('myDomains.deleteDomainTip') }}
            </div>
          </div>
        </div>
      </CatDialog>
      <!-- 解锁域名 -->
      <UnlockDialog v-model:dialog="state.unlockDialog" :domain-id="state.domainId" @success="getData" />
      <!-- 密码设置 -->
      <UnlockPasswordDialog
        v-model:dialog="state.unlockPasswordDialog"
        :domain-id="state.domainId"
        @success="getData"
      />
      <!-- 添加域名 -->
      <AddDomainDialog v-model:dialog="state.addDomainDialog" @success="getDataAndRefresh" />
      <!-- 接管状态 -->
      <TakeoverDialog v-model:dialog="state.takeOverDialog" :info="state.takeOverInfo" />
      <!-- 备注 -->
      <RemarkDialog
        v-model:dialog="state.remarkDialog"
        :info="state.tableData && state.tableData[state.current]"
        @success="getData"
      />
      <!-- 解析 -->
      <CatDialog
        v-model:dialog="state.parseDialog"
        :loading="parseLoading"
        :title="activeRow && activeRow.status === 1 ? t('recordMana.status2') : t('recordMana.startParse')"
        @confirm="parseConfirm"
      >
        <template v-if="activeRow">
          {{
            activeRow.status === 1
              ? t('recordMana.parseTextStop', { domain: activeRow.domain })
              : t('recordMana.parseTextStart', { domain: activeRow.domain })
          }}
        </template>
      </CatDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import { columns, batchOption } from './config'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import GroupDialog from './group-dialog.vue'
import AddDomainDialog from './add-domain-dialog.vue'
import UnlockDialog from './unlock-dialog.vue'
import UnlockPasswordDialog from './unlock-password-dialog.vue'
import RemarkDialog from './remark-dialog.vue'

import t from '@/utils/i18n'
import {
  _addDomain,
  _changeDomainInfo,
  _deleteDomains,
  _domainLock,
  _getDomainInfo,
  _getDomainList,
  _refreshDomainStatus,
} from '@/apis/dns/domain'
import { _changeDomainGroup, _getGroupList } from '@/apis/dns/group'
import { _getItem, _setItem } from '@/utils/storage'
import { _debounce, _throttle } from '@/utils/timing-utils'
import { handleCopyValue } from '@/utils/dom-utils'
import { _formateTimeDayjs } from '@/utils/format-time'
import TakeoverDialog from './takeover-dialog.vue'
import { message } from '@/utils/message'
import { useBaseStore, useUserStore } from '@/store'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'
const baseStore = useBaseStore()
const state = reactive<{
  loading: boolean
  dialogLoading: boolean
  pagination: Pager
  total: number
  tableData: any[]
  multipleSelection: any[]
  searchValue: undefined | string
  groupDialog: boolean
  deleteDialog: boolean
  unlockDialog: boolean
  unlockPasswordDialog: boolean
  addDomainDialog: boolean
  remarkDialog: boolean
  groupList: any[]
  domainId: string
  current: number
  // 记录当前选择的row
  currentId: any
  columns: TableColumn[]
  // 接管状态相关
  takeOverLoading: boolean
  takeOverId: any
  takeOverInfo: any
  takeOverDialog: boolean
  rightServer: any
  parseDialog: boolean
  getStatusList: any[]
  getStatusTimeout: any
}>({
  loading: false,
  dialogLoading: false,
  pagination: {
    page: 1,
    pageSize: 10,
  },
  total: 0,
  tableData: [],
  multipleSelection: [], // 多选
  searchValue: void 0, // 搜索
  groupDialog: false, // 分组
  deleteDialog: false, // 删除
  unlockDialog: false, // 解锁
  unlockPasswordDialog: false, // 设置解锁密码
  addDomainDialog: false, // 添加域名
  remarkDialog: false,
  groupList: [], // 分组列表
  domainId: '',
  current: 0,

  currentId: void 0,
  columns,

  takeOverLoading: false,
  takeOverId: void 0,
  takeOverInfo: {},
  takeOverDialog: false,
  rightServer: void 0, // 正确的DNS服务器
  parseDialog: false,
  getStatusList: [],
  getStatusTimeout: null,
})

const domainStatus = row => {
  let tip: string = ''
  let icon: string = ''
  let statusText: string = ''
  let statusReason: boolean = false
  let className: string = ''
  // 锁定优先
  if (row.lockStatus) {
    tip = t('myDomains.statusLocked')
    icon = 'dns-lock'
    statusText = t('common.locked')
    statusReason = false
    className = 'lock'
  }
  // 域名暂停
  else if (row.status === 2) {
    tip = t('myDomains.statusStopped')
    icon = 'pause'
    statusText = t('myDomains.pause')
    statusReason = false
    className = 'warning'
  }
  // 接管异常
  else if (row.dnsStatus === 2) {
    tip = t('myDomains.statusError')
    icon = 'warn-red'
    statusText = row.dnsStatusReason
    statusReason = true
    className = 'error'
  }
  // 接管正常 域名正常
  else if (row.status === 1) {
    tip = t('myDomains.statusSuccess')
    icon = 'success-icon'
    statusText = t('myDomains.normal')
    statusReason = false
    className = 'success'
  }
  return {
    tip,
    icon,
    statusText,
    statusReason,
    className,
  }
}

const activeRow = computed(() => {
  return state.current !== -1 ? state.tableData[state.current] : null
})

const columnsChange = computed(() => {
  if (useBaseStore().lang === LANGUAGE_MAP.zh.i18nParam) {
    state.columns[state.columns.length - 1].minWidth = 220
  } else {
    state.columns[state.columns.length - 1].minWidth = 300
  }
  return state.columns
})

// 解锁密码校验
const my_domain_table = ref<any>(null)
// 多选
const handleSelectionChange = (val: any[]) => {
  state.multipleSelection = val
}
// 全选
const handleSelectAll = (val: any[]) => {
  console.log('全选', val)
}
// 打开备注
const startRemark = (i: number) => {
  state.current = i
  state.remarkDialog = true
  console.log(state.tableData[state.current])
}
// 搜索
const handleSearch = _debounce(() => {
  getData()
}, 300)

const handlePaginationChange = (pagination: { page: number; pageSize: number }) => {
  state.pagination = pagination
  getData()
}

const batchChange = (name: string) => {
  // baseStore.selectedKeys = 'BatchOperation'

  pushRoute({ name })
}
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
// 添加域名
const handleAdd = () => {
  clearSelection()
  state.addDomainDialog = true
}
// 打开删除弹框
const handleDelete = (domainId?: any) => {
  state.currentId = domainId || void 0
  state.deleteDialog = true
}
const deleteConfirm = async () => {
  try {
    state.dialogLoading = true
    const { code } = await _deleteDomains({
      domainId: state.currentId ? state.currentId + '' : state.multipleSelection.map(item => item.domainId).join(','),
    })
    state.dialogLoading = false
    if (code === 200) {
      message.success(t('common.deleteSuccess'))
      getData()
      state.dialogLoading = false
      state.deleteDialog = false
    }
  } catch (error) {
    state.dialogLoading = false
  }
}
// 锁定
const handleLock = async (_t: 'multi' | 'single', row?: any) => {
  if (_t === 'multi') {
    // 判断是否存在没有设置密码的item
    const noPwd = state.multipleSelection.filter(item => item.lockPwd === 0)
    if (noPwd[0]) {
      message.warning(
        t('myDomains.lockWarning', {
          domainName: noPwd.map(item => item.domain).join(','),
        }),
      )
    } else {
      state.domainId = state.multipleSelection.map(item => item.domainId).join(',')
      // 锁定不用输密码
      try {
        state.dialogLoading = true
        const { code } = await _domainLock({
          type: 'lock',
          domainId: state.domainId,
          password: '',
        })
        state.dialogLoading = false
        if (code === 200) {
          message.success(t('myDomains.lockSuccess'))
          getData()
        }
      } catch (error) {
        state.dialogLoading = false
      }
    }
  } else {
    clearSelection()
    state.domainId = row.domainId + ''
    if (row.lockPwd === 0) {
      // 未设置密码
      console.log('设置密码', row)
      state.unlockPasswordDialog = true
    } else {
      // 锁定不用输密码
      try {
        state.dialogLoading = true
        const { code } = await _domainLock({
          type: 'lock',
          domainId: state.domainId,
          password: '',
        })
        state.dialogLoading = false
        if (code === 200) {
          message.success(t('myDomains.lockSuccess'))
          getData()
        }
      } catch (error) {
        state.dialogLoading = false
      }
    }
  }
}
// 解锁
const handleUnlock = async (_t: 'multi' | 'single', row?: any) => {
  if (_t === 'multi') {
    // 判断是否存在没有设置密码的item
    const noPwd = state.multipleSelection.filter(item => item.lockPwd === 0)
    if (noPwd[0]) {
      message.warning(noPwd.map(item => item.domain).join(',') + t('plsSetUnlockPwd'))
    } else {
      state.domainId = state.multipleSelection.map(item => item.domainId).join(',')
      state.unlockDialog = true
    }
  } else {
    clearSelection()
    state.domainId = row.domainId + ''
    if (row.lockPwd === 0) {
      // 打开设置解锁密码弹框
      state.unlockPasswordDialog = true
    } else {
      // 打开解锁弹框
      state.unlockDialog = true
    }
  }
}

// 解析
const handleParse = (i: number) => {
  state.current = i
  state.parseDialog = true
}

const parseLoading = ref(false)
// 确认解析
const parseConfirm = async () => {
  try {
    parseLoading.value = true
    const { code } = await _changeDomainInfo({
      domainId: Number(activeRow.value.domainId),
      ttl: activeRow.value.ttl,
      status: activeRow.value.status === 1 ? 2 : 1,
      remark: activeRow.value.remark,
    })
    parseLoading.value = false
    if (code === 200) {
      getData()
      state.parseDialog = false
      message.success(t('batchOperation.resultTitle'))
    }
  } catch (error) {
    parseLoading.value = false
  }
}

const rowClassName = ({ row }) => {
  if (state.multipleSelection.find(item => item.domain === row.domain)) {
    return 'is-checked'
  } else {
    return ''
  }
}

// 清空所有选择
const clearSelection = () => {
  my_domain_table.value?.clearSelection()
}
// 是否允许点击锁定,解锁,删除(多个操作)
const disabled = computed(() => {
  if (state.multipleSelection.length === 0) {
    return {
      lock: true,
      unlock: true,
      delete: true,
    }
  } else {
    // 是否存在已经锁定的item
    const isExsitLock = state.multipleSelection.some(item => item.lockStatus === 1)
    const isExsitUnlock = state.multipleSelection.some(item => item.lockStatus === 0)
    return {
      lock: isExsitLock || state.loading || state.dialogLoading,
      unlock: isExsitUnlock || state.loading || state.dialogLoading,
      delete: state.loading || state.dialogLoading,
    }
  }
})
// 修改分组
const changeDomainGroup = async (value: number | string) => {
  if (value === 'edit') {
    state.groupDialog = true
  } else if (state.multipleSelection.length === 0) {
    message.warning(t('myDomains.groupWarning'))
    return
  } else {
    const domainId = state.multipleSelection.map(item => item.domainId).join(',')
    const groupId = value as number
    try {
      state.loading = true
      const { code } = await _changeDomainGroup({
        domainId,
        groupId,
      })
      state.loading = false
      if (code === 200) {
        message.success(t('common.changeSuccess'))
        await getData()
      }
    } catch (error) {
      state.loading = false
    }
  }
}
// 去记录管理
const toRecordMana = (row: any) => {
  pushRoute({
    name: 'DomainLayout',
    query: {
      name: row.domain,
      id: row.domainId,
    },
  })
}

// 查看详情(获取域名信息)
const viewDomainDetail = (row: any) => {
  getDomainInfo(row)
  state.takeOverDialog = true
}

// 获取域名信息
const getDomainInfo = _throttle(async (row: any) => {
  if (row.domainId === state.takeOverId) {
    return
  }
  if (row.dnsStatus !== 2) return
  if (state.takeOverLoading) return
  try {
    state.takeOverLoading = true
    const { code, data } = await _getDomainInfo({
      domainId: row.domainId,
    })
    state.takeOverLoading = false
    if (code === 200) {
      // 正确的dns服务器设置
      state.rightServer = data && data.cloudDnsServer
      state.takeOverInfo = { ...data, domainId: row.domainId } || {}
    }
  } catch (error) {
    state.takeOverLoading = false
  }
}, 1000)
// 这个方法限制每次请求状态接口的数量，每次请求状态的接口不超过10个，超过部分间隔2秒执行
const getStatusFn = () => {
  if (state.getStatusTimeout) {
    clearTimeout(state.getStatusTimeout)
    state.getStatusTimeout = null
  }
  let list = state.getStatusList.splice(0, 10)
  if (list.length > 0) {
    list.forEach(item => {
      refreshDomain(item)
    })
  }
  console.log('state.getStatusList====>', state.getStatusList)
  if (state.getStatusList.length > 0) {
    state.getStatusTimeout = setTimeout(() => {
      getStatusFn()
    }, 2000)
  }
}
// 刷新域名状态
const refreshDomain = async (row: any) => {
  const timeStamp = row.timeStamp
  try {
    state.takeOverLoading = true
    const { code, data } = await _refreshDomainStatus({
      domainId: row.domainId,
    })
    state.takeOverLoading = false
    if (code === 200 && data.length > 0) {
      // getData();
      const statusData = data[0]
      // 这里用时间戳加id进行匹配，保证能正确的显示最后获取的状态
      const idx = state.tableData.findIndex(i => i.statusId === `${statusData.domainId}-${timeStamp}`)
      if (idx >= 0) {
        state.tableData.splice(idx, 1, {
          ...state.tableData[idx],
          statusLoading: false,
          dnsStatus: statusData.dnsStatus,
          dnsStatusReason: statusData.dnsStatusReason,
        })
      }
    }
  } catch (error) {
    state.takeOverLoading = false
  }
}

const handleCopy = _throttle(async (v: string) => {
  await handleCopyValue(v)
  message.success(t('domainSet2.copySuccess'))
}, 1000)

// 图表
const toChart = (row: any) => {
  pushRoute({
    name: 'DomainLayout',
    query: {
      name: row.domain,
      id: row.domainId,
      active: 2,
    },
  })
}
// 设置
const handleSet = (row: any) => {
  pushRoute({
    name: 'DomainLayout',
    query: {
      name: row.domain,
      id: row.domainId,
      active: 1,
    },
  })
}
const getDataAndRefresh = async () => {
  getData()
}
// 获取列表
const getData = async () => {
  try {
    const params = {
      ...state.pagination,
      keyword: state.searchValue,
      groupId: '',
    }
    state.loading = true
    const { code, data } = await _getDomainList(params)
    state.loading = false
    if (code === 200) {
      // data.list[1].status = 1
      // data.list[1].lockStatus = 1
      // data.list[1].dnsStatus = 1
      state.tableData = (data.list || []).map(item => {
        if (item.status === 2) {
          return {
            ...item,
            statusLoading: false,
          }
        }
        // 这里添加时间戳标识，保证在多次频繁刷新的时候能够正确的显示最后一次获取的状态
        const timeStamp = new Date().getTime()
        const tableItem = {
          ...item,
          statusLoading: true,
          statusId: `${item.domainId}-${timeStamp}`,
          timeStamp,
        }
        return tableItem
      })
      state.getStatusList = state.tableData.filter(item => item.status !== 2)
      getStatusFn()
      state.total = data.total || 0
      state.columns.forEach(item => (item.sort = undefined))
    }
  } catch (error) {
    state.loading = false
  }
}

// 获取分组列表
const getGroupList = async () => {
  try {
    state.dialogLoading = true
    const { code, data } = await _getGroupList()
    state.dialogLoading = false
    if (code === 200) {
      state.groupList =
        (data &&
          data.map((item: any) => ({
            label: item.name,
            value: item.groupId,
          }))) ||
        []
    }
  } catch (error) {
    state.dialogLoading = false
  }
}

onMounted(async () => {
  getGroupList()
  getData()
  // console.log(useUserStore().user.productDTOS);
})
</script>

<style scoped lang="scss">
.tipClass {
  margin-top: 20px !important;
}

.dns-my-domain {
  width: 100%;
  margin-top: 20px;

  .content-handle {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;

    & > div {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .add-btn {
      min-width: 102px;

      /* margin-right: 20px; */
    }

    .batch-select {
      width: 160px;
      margin-right: 20px;

      &.zh {
        width: 120px;
      }
    }

    .group-select {
      width: 160px;
      margin-right: 20px;

      &.zh {
        width: 120px;
      }
    }

    .el-input {
      width: 240px;
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
        width: 14px;
        height: 14px;
        color: #999;
        transition: transform 0.3s;
      }
    }
  }

  :deep(.account-table-v2) {
    border-color: #e8ecf3;

    .el-table__header-wrapper th.el-table__cell {
      height: 46px;
      padding: 0;
      background: #f9fafc;
    }

    .el-table__body-wrapper td.el-table__cell {
      height: 56px;
      padding: 0;
    }

    th.el-table__cell .cell {
      display: flex;
      align-items: center;
      min-height: 46px;
      padding: 0 16px !important;
      line-height: 20px !important;
    }

    td.el-table__cell .cell {
      display: flex;
      align-items: center;
      min-height: 56px;
      padding: 0 16px !important;
      line-height: 22px !important;
    }

    .el-table-column--selection .cell {
      justify-content: center;
      padding: 0 !important;
    }

    .custom-table-header {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      line-height: 20px;

      .table-sort {
        flex-shrink: 0;
        margin-left: 6px;
        color: #8a94a6;
      }
    }

    .table-dns {
      display: inline-flex;
      align-items: center;
      width: 100%;
      min-width: 0;
      color: var(--primary-color);
      cursor: pointer;

      svg {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        margin-right: 8px;
      }

      .round-text {
        display: block;
        flex: 1;
        min-width: 0;
        line-height: 22px;
      }
    }

    .table-status {
      display: flex;
      align-items: center;

      .status-reason {
        display: inline-flex;
        align-items: center;
        max-width: 100%;
        line-height: 22px;
      }

      .status-reason__icon {
        flex-shrink: 0;
        margin-right: 8px;
      }

      .status-reason__text {
        overflow: hidden;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
      }

      .success {
        color: var(--success-color);
      }

      .error {
        color: var(--error-color);
      }

      .warning {
        color: var(--warning-color);
      }

      .lock {
        color: #555;
      }
    }

    .table-handle {
      display: inline-flex;
      gap: 20px;
      align-items: center;
      white-space: nowrap;

      .el-link {
        margin-right: 0;
      }
    }
  }
}

.start-analysis {
  color: var(--primary-color);
  cursor: pointer;
}

.is-delete {
  display: flex;
  align-items: center;
  padding: 16px 40px 20px;

  svg {
    margin-right: 5px;
  }
}

:deep(.cat-dropdown) {
  .svg-icon {
    transition: transform 0.2s;
  }

  &:hover {
    .svg-icon {
      color: var(--primary-color);
      transform: rotateZ(180deg);
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
</style>

<style lang="scss">
.my-domains-more.cat-dropdown {
  min-width: 116px !important;

  .el-popper__arrow {
    display: block;
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

.domain-svg:focus {
  outline: none;
}

.take-over-popover {
  padding: 16px !important;
  border-color: #e5eaf3 !important;
  box-shadow: 0 8px 24px 0 rgb(25 28 35 / 12%) !important;

  .el-popper__arrow::before {
    border-color: #e5eaf3 !important;
  }
}

.take-over-tooltip {
  width: 312px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #191c23;

  &__warning {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 12px;
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 22px;
    color: #f53f3f;
    background: #fff1f1;

    .svg-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  }

  &__title {
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
  }

  &__servers {
    padding-bottom: 12px;
    border-bottom: 1px solid #e5eaf3;
  }

  &__server {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    font-size: 14px;
    line-height: 22px;
    color: #00a870;

    &:last-child {
      margin-bottom: 0;
    }

    .svg-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin-left: 8px;
      color: #8a94a6;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
  }

  &__actions .el-link {
    font-size: 14px;
    line-height: 22px;
  }

  &__verify {
    display: inline-flex;
    align-items: center;
    padding: 0;
    font: inherit;
    font-size: 14px;
    line-height: 22px;
    color: #06f;
    cursor: pointer;
    background: transparent;
    border: 0;

    &:disabled {
      color: #8a94a6;
      cursor: not-allowed;
    }

    .svg-icon {
      width: 18px;
      height: 18px;
      margin-left: 6px;
      color: currentcolor;
    }
  }
}

/* 定义关键帧 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.loading-svg {
  color: var(--table-text);
  animation: rotate 2s linear infinite;
}

.ml5 {
  margin-left: 5px;
}
</style>
