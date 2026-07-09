<template>
  <div class="domain-list">
    <CatTabs v-model="tabType" :tabs="tabMenuList" full-container @change="setTabType" />

    <div class="domain-content pd20 page-box mt20">
      <div class="table-set jsb df">
        <div class="left df ac">
          <el-button type="primary" @click="pushRoute({ path: '/cdn/domain/add', query: { type: tabType } })">
            {{ tabType === '0,1,2' ? t('addStaticAcceleration') : t('addWholeAcceleration') }}
          </el-button>
          <el-button plain style="color: var(--primary-color)" @click="pushRoute('/cdn/buyFlow')">
            {{ t('purchaseTraffic') }}
          </el-button>
          <el-tooltip
            :visible="showButtonTip === 'start'"
            effect="light"
            :content="t('buttonStartTip')"
            placement="top-start"
          >
            <el-button
              :disabled="isDisabled(4)"
              @click="tableHandle('start')"
              @mouseenter="buttonEnter(4, 'start')"
              @mouseleave="showButtonTip = ''"
            >
              {{ t('enable') }}
            </el-button>
          </el-tooltip>
          <el-tooltip
            :visible="showButtonTip === 'stop'"
            effect="light"
            :content="t('buttonStopTip')"
            placement="top-start"
          >
            <el-button
              :disabled="isDisabled(1)"
              @click="tableHandle('stop')"
              @mouseenter="buttonEnter(1, 'stop')"
              @mouseleave="showButtonTip = ''"
            >
              {{ t('stop') }}
            </el-button>
          </el-tooltip>
          <el-tooltip
            :visible="showButtonTip === 'del'"
            effect="light"
            :content="t('buttonDeleteTip')"
            placement="top-start"
          >
            <el-button
              :disabled="isDisabled(4)"
              @click="tableHandle('del')"
              @mouseenter="buttonEnter(4, 'del')"
              @mouseleave="showButtonTip = ''"
            >
              {{ t('delete') }}
            </el-button>
          </el-tooltip>
        </div>
        <div class="right df ac">
          <el-input
            v-model.trim="domain_name"
            :placeholder="t('myDomains.searchPlaceholder')"
            maxlength="256"
            class="input-with-select mr20"
            @keydown.enter="getDomainList"
          >
            <template #suffix>
              <SvgIcon name="dns-search" @click="getDomainList" />
            </template>
          </el-input>
          <CdnIconButton @click="setTableHead">
            <SvgIcon name="cat-cdn-set" />
          </CdnIconButton>
          <CdnIconButton @click="downloadDomainList">
            <SvgIcon name="cat-cdn-download" />
          </CdnIconButton>
          <CdnIconButton @click="refresh">
            <SvgIcon name="cat-cdn-refresh" :loading="domain.loading" />
          </CdnIconButton>
        </div>
      </div>
      <CatCdnTable v-loading="domain.loading" :data="domain.tableData" @selection-change="tableSelect">
        <el-table-column type="selection" />
        <el-table-column prop="domain">
          <template #header>
            <el-tooltip :content="t('domainAddress')" placement="top-start">
              {{ t('acceleratedDomain') }}
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div class="df ac hover-item">
              <el-tooltip
                v-if="row.is_lock == 1"
                effect="light"
                :content="t('operationTip')"
                placement="top-start"
                popper-class="max-400"
              >
                <SvgIcon v-if="row.is_lock == 1" name="password-gray" class="mr4" color="var(--warning-color)" />
              </el-tooltip>
              <CatTooltip :content="row.domain" width="200px">
                <el-link type="primary" @click="toDetail(row)">
                  {{ row.domain }}
                </el-link>
              </CatTooltip>
              <SvgIcon name="cat-cdn-copy" class="ml4 icon-hover" @click="copyText(row.domain)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[1].show && tabType === '0,1,2'" prop="channel_type">
          <template #header>
            <CatTableHeadFilter
              v-model="search.channel_type"
              label="type"
              tip="domainSpeedType"
              show-all
              all-value="0,1,2"
              :list="channelTypeList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(channelTypeList, row.channel_type) }}
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[2].show" prop="status">
          <template #header>
            <CatTableHeadFilter
              v-model="search.status"
              label="status"
              tip="domainCurrentStatus"
              show-all
              :list="AccelerationStatusList.filter(v => v.value < 5)"
            />
          </template>
          <template #default="{ row }">
            <!-- 域名配置锁 -->
            <div class="df ac">
              <el-tooltip
                v-if="row.stop_reason == 1"
                effect="light"
                :content="t('statusTip')"
                placement="top-start"
                popper-class="max-400"
              >
                <SvgIcon name="cat-cdn-warning" style="color: var(--warning-color)" class="mr4" />
              </el-tooltip>
              <el-text :type="row.status === 1 ? 'success' : row.status === 4 ? 'danger' : ''">
                <el-tooltip :disabled="row.status !== 0" placement="top" effect="light">
                  {{ getValueMap(AccelerationStatusList, row.status) }}
                  <template #content>
                    <div style="max-width: 270px">
                      {{ t('deployingStatusTip') }}
                    </div>
                  </template>
                </el-tooltip>
              </el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[3].show" prop="cname">
          <template #header>
            <el-tooltip :content="t('cnameTip')" placement="top-start" popper-class="max-400">
              {{ t('cnameDomain') }}
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div class="df ac hover-item">
              <SvgIcon v-if="domain.domainStatesLoading" name="dialog-loading" class="rotate mr4" />
              <el-tooltip
                v-else
                effect="light"
                :content="t(['cnameNotValid', 'cnameValid'][row.cname_status] || 'cnameStateGetError')"
                placement="top-start"
                popper-class="max-400"
              >
                <SvgIcon
                  :name="['cat-cdn-warning', 'cat-cdn-success'][row.cname_status] || 'cat-cdn-warning'"
                  :style="{
                    color: ['var(--warning-color)', 'var(--success-color)'][row.cname_status] || 'var(--error-color)',
                  }"
                  class="mr4"
                />
              </el-tooltip>
              <CatTooltip :content="row.cname" width="200px">
                <div>{{ row.cname }}</div>
              </CatTooltip>
              <SvgIcon name="cat-cdn-copy" class="ml4 icon-hover" @click="copyText(row.cname)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[4].show" prop="area_code">
          <template #header>
            <CatTableHeadFilter
              v-model="search.area_codes"
              label="region"
              tip="domainRegion"
              show-all
              :list="areaList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(areaList, row.area_code) }}
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[5].show" prop="https_status">
          <template #header>
            <CatTableHeadFilter
              v-model="search.https_status"
              label="httpsAcceleration"
              tip="httpsStatus"
              show-all
              :list="httpsStartList"
            />
          </template>
          <template #default="{ row }">
            {{ row.https_status ? t('enable') : t('notEnabled') }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="tableHead[6].show"
          prop="origin_servers"
          :show-overflow-tooltip="{ effect: 'light', popperClass: 'domain-remark' }"
          width="200"
        >
          <template #header>
            <el-tooltip :content="t('locateAddress')" placement="top-start">
              {{ t('pullHost') }}
            </el-tooltip>
          </template>
          <template #default="{ row }">
            {{ row.origin_servers[0]?.host }}
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[7].show" prop="item">
          <template #header>
            <el-tooltip :content="t('projectIn')" placement="top-start">
              {{ t('belongProject') }}
            </el-tooltip>
          </template>
          <template #default>
            {{ t('default') }}
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[8].show" prop="origin_servers">
          <template #header>
            <el-tooltip :content="t('primaryServerTip')" placement="top-start">
              {{ t('primaryServer') }}
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div>{{ row.origin_servers.filter(v => v.priority === 0)[0]?.address }}</div>
            <div v-if="row.origin_servers.filter(v => v.priority === 0).length > 1" class="df">
              {{ t('moreIP', { num: row.origin_servers.filter(v => v.priority === 0).length }) }}&nbsp;
              <el-link type="primary" @click="tableHandle('detail', row, 0)">
                {{ t('more') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[9].show" prop="origin_servers">
          <template #header>
            <el-tooltip :content="t('standbyServerTip')" placement="top-start">
              {{ t('standbyServer') }}
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div>{{ row.origin_servers.filter(v => v.priority === 1)[0]?.address || '-' }}</div>
            <div v-if="row.origin_servers.filter(v => v.priority === 1).length > 1" class="df">
              {{ t('moreIP', { num: row.origin_servers.filter(v => v.priority === 1).length }) }}&nbsp;
              <el-link type="primary" @click="tableHandle('detail', row, 1)">
                {{ t('more') }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="tableHead[10].show"
          prop="remark"
          :show-overflow-tooltip="{ effect: 'light', popperClass: 'domain-remark' }"
          width="300"
        >
          <template #header>
            {{ t('remark') }}
          </template>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="tableHead[11].show" prop="update_time">
          <template #header>
            <div>
              <span>{{ t('modificationTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon class="ml4 mr4" name="cat-cdn-help" />
              </el-tooltip>
              <SvgIcon
                :name="!search.order ? 'sort' : search.order === 'asc' ? 'sort-up' : 'sort-down'"
                @click="search.order = search.order === 'desc' ? 'asc' : 'desc'"
              />
            </div>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.update_time * 1000, 'string', true) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right">
          <template #header>
            {{ t('operation') }}
          </template>
          <template #default="{ row }">
            <div class="table-handle">
              <!-- 域名配置锁 -->
              <el-tooltip
                effect="light"
                :content="t('operationTip')"
                :disabled="!row.is_lock"
                placement="top-start"
                popper-class="max-400"
              >
                <el-link :disabled="row.is_lock" type="primary" @click="toDetail(row)">
                  {{ t('set') }}
                </el-link>
              </el-tooltip>

              <el-link
                :disabled="![0, 1].includes(row.status) || row.is_lock == 1"
                type="primary"
                @click="tableHandle('remark', row)"
              >
                <el-tooltip
                  placement="top-start"
                  :disabled="!row.remark"
                  :content="row.remark"
                  effect="light"
                  popper-class="max-400"
                >
                  {{ t('remark') }}
                </el-tooltip>
              </el-link>
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  <div class="more-list df fdc">
                    <el-button
                      @click="pushRoute({ path: '/cdn/domain/copy', query: { id: row.id, domain: row.domain } })"
                    >
                      {{ t('copyConfig') }}
                    </el-button>
                    <el-tooltip
                      :visible="showTableItemTip === 'start'"
                      effect="light"
                      placement="left"
                      :teleported="false"
                    >
                      <template #content>
                        <div class="popper-text">
                          {{ t('buttonStartTip') }}
                        </div>
                      </template>
                      <el-button
                        :disabled="tableButtonDisabled(row.status, 'start')"
                        @click="tableHandle('start', row)"
                        @mouseenter="tableButtonEnter(row.status, 'start')"
                        @mouseleave="showTableItemTip = ''"
                      >
                        {{ t('enable') }}
                      </el-button>
                    </el-tooltip>
                    <el-tooltip
                      :visible="showTableItemTip === 'stop'"
                      effect="light"
                      placement="left"
                      :teleported="false"
                    >
                      <template #content>
                        <div class="popper-text">
                          {{ t('buttonStopTip') }}
                        </div>
                      </template>
                      <el-button
                        :disabled="tableButtonDisabled(row.status, 'stop')"
                        @click="tableHandle('stop', row)"
                        @mouseenter="tableButtonEnter(row.status, 'stop')"
                        @mouseleave="showTableItemTip = ''"
                      >
                        {{ t('stop') }}
                      </el-button>
                    </el-tooltip>
                    <el-tooltip
                      :visible="showTableItemTip === 'del'"
                      effect="light"
                      placement="left"
                      :teleported="false"
                    >
                      <template #content>
                        <div class="popper-text">
                          {{ t('buttonDeleteTip') }}
                        </div>
                      </template>
                      <el-button
                        :disabled="tableButtonDisabled(row.status, 'del')"
                        @click="tableHandle('del', row)"
                        @mouseenter="tableButtonEnter(row.status, 'del')"
                        @mouseleave="showTableItemTip = ''"
                      >
                        {{ t('delete') }}
                      </el-button>
                    </el-tooltip>
                  </div>
                </template>
                <el-link type="primary">
                  {{ t('more') }}
                  <SvgIcon name="cat-cdn-select-more" class="ml4" />
                </el-link>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </CatCdnTable>

      <CatPagination
        v-model:pagination="domain.pagination"
        :total="domain.total"
        :custom-keys="['page', 'page_size']"
        @change="getDomainList"
      />
    </div>

    <CatDialog
      v-model:dialog="state.set"
      title="customList"
      width="550"
      destroy-on-close
      @confirm="comfirmTableHead"
      @cancel="cancelTableHead"
    >
      <div class="df ac" style="flex-wrap: wrap">
        <span>{{ t('selected') }}</span>
        <el-text type="primary" class="ml4 mr4"> {{ currentTableSelected }}/{{ currentTableHead.length }} </el-text>
        <span style="word-break: break-all">{{ t('clearCacheCustomList') }}</span>
      </div>
      <el-table
        :data="currentTableHead"
        :cell-style="{ height: '44px' }"
        :show-header="false"
        max-height="380"
        class="mt20"
        style="border: var(--el-table-border)"
      >
        <el-table-column>
          <template #default="{ row }">
            <el-checkbox v-model="row.show" :label="t(row.title)" :disabled="row.disabled" />
          </template>
        </el-table-column>
      </el-table>
    </CatDialog>

    <CatDialog
      v-model:dialog="state.sure"
      :title="
        state.type === 'start' ? 'startAcceleration' : state.type === 'stop' ? 'stopAcceleration' : 'delAcceleration'
      "
      width="630px"
      destroy-on-close
      @confirm="updateSure"
    >
      <div v-if="state.type === 'start'">
        {{ t('sureStartService') }}
      </div>
      <div v-if="state.type === 'stop'">
        {{ t('sureStopService') }}
      </div>
      <div v-if="state.type === 'del'">
        {{ t('sureDeleteService') }}
      </div>
    </CatDialog>

    <CatDialog
      v-model:dialog="state.start"
      title="startAcceleration"
      width="630px"
      destroy-on-close
      @confirm="resetTableData"
      @cancel="cancelDialog('start')"
    >
      <el-progress :stroke-width="10" :percentage="(operate.length / operate.rows.length) * 100" :show-text="false" />
      <div class="mt10">
        {{ t('startingAccelerateService')
        }}<el-text type="primary"> {{ operate.length }}/{{ operate.rows.length }} </el-text>
      </div>
      <div class="mt10">
        <el-text type="primary"> {{ t('log') }}： </el-text>
      </div>
      <div class="dialog-content-bg mt10 pd20">
        <div v-for="(r, i) in operate.showList" :key="'r' + i">
          {{ r.domain }}{{ t('startAccelerateService')
          }}<el-text :type="r.state ? 'success' : 'danger'" class="ml14">
            {{ r.state ? t('success') : t('fail') }}
          </el-text>
        </div>
      </div>
    </CatDialog>

    <CatDialog
      v-model:dialog="state.stop"
      title="stopAcceleration"
      width="630px"
      destroy-on-close
      @confirm="resetTableData"
      @cancel="cancelDialog('stop')"
    >
      <el-progress :stroke-width="10" :percentage="(operate.length / operate.rows.length) * 100" :show-text="false" />
      <div class="mt10">
        {{ t('stoppingAccelerateService')
        }}<el-text type="primary"> {{ operate.length }}/{{ operate.rows.length }} </el-text>
      </div>
      <div class="mt10">
        <el-text type="primary">
          {{ t('log：') }}
        </el-text>
      </div>
      <div class="dialog-content-bg mt10 pd20">
        <div v-for="(r, i) in operate.showList" :key="'r' + i">
          {{ r.domain }}{{ t('stopAccelerateService')
          }}<el-text :type="r.state ? 'success' : 'danger'" class="ml14">
            {{ r.state ? t('success') : t('fail') }}
          </el-text>
        </div>
      </div>
    </CatDialog>

    <CatDialog
      v-model:dialog="state.del"
      title="delAcceleration"
      width="630px"
      destroy-on-close
      @confirm="resetTableData"
      @cancel="cancelDialog('del')"
    >
      <el-progress :stroke-width="10" :percentage="(operate.length / operate.rows.length) * 100" :show-text="false" />
      <div class="mt10">
        {{ t('deletingService') }}<el-text type="primary"> {{ operate.length }}/{{ operate.rows.length }} </el-text>
      </div>
      <div class="mt10">
        <el-text type="primary"> {{ t('log') }}： </el-text>
      </div>
      <div class="dialog-content-bg mt10 pd20">
        <div v-for="(r, i) in operate.showList" :key="'r' + i">
          {{ r.domain }}{{ t('deleteAccelerateService')
          }}<el-text :type="r.state ? 'success' : 'danger'" class="ml14">
            {{ r.state ? t('success') : t('fail') }}
          </el-text>
        </div>
      </div>
    </CatDialog>

    <CatDialog
      v-model:dialog="state.remark"
      title="remark"
      width="630px"
      :disabled="!state.remarkInput || state.remarkInput.length > 200"
      destroy-on-close
      @confirm="updateStatus('remark')"
    >
      <el-input
        v-model="state.remarkInput"
        :placeholder="t('pleaseInputRemark')"
        type="textarea"
        :rows="5"
        resize="none"
        show-word-limit
        maxlength="200"
      />
    </CatDialog>

    <!-- <CatDialog v-model:dialog="state.detail" @confirm="state.detail = false" title='details' width="630px"
      destroy-on-close>
      <el-input :model-value="operate.rows.join('\n')" type="textarea" :rows="10" resize="none" readonly />
    </CatDialog> -->
  </div>
</template>

<script setup lang="ts">
import {
  _getDomainList,
  _downloadDomainList,
  _delDomain,
  _updateDomain,
  _updateBaseConfig,
  _getDomainStatus,
} from '@/apis/cdn/domain'
import { copyText } from '@/utils/dom-utils'
import { getValueMap } from '@/utils/collection-utils'
import { getDateDayjs } from '@/utils/format-time'
import { channelTypeList, AccelerationStatusList, areaList, httpsStartList, tabMenuList } from '@/assets/data/common.js'
import t from '@/utils/i18n'
import { downloadExportFiles } from '@/utils/download'
import { showErrorTip } from '@/views/cdn/domain/index-domain'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()
const route = useRoute()
watch(
  () => route.query.tab_Type,
  () => {
    setTabType({
      value: route.query?.tab_Type || '0,1,2',
    })
  },
)
onMounted(() => {
  if (route.query.tab_Type) {
    setTabType({
      value: route.query.tab_Type,
    })
  }
})

const tabType = ref<string>('0,1,2')
const setTabType = item => {
  tabType.value = item.value
  search.channel_type = item.value
  sessionStorage.cdn_domain_page_type = item.value
}

interface TableDataItem {
  id: number
  domain: string
  channel_type: number | string
  status: number
  cname: string
  area_code: number
  https_status: number
  origin_servers: any[]
  create_time: string
  support_ipv6: number
  remark: string
  update_time: number
  more: boolean
  tip: string
  [k: string]: any
}
const domain = reactive<{
  loading: boolean
  domainStatesLoading: boolean
  tableData: TableDataItem[]
  total: number
  pagination: {
    page: number
    page_size: number
  }
}>({
  loading: false,
  domainStatesLoading: false,
  tableData: [],
  total: 0,
  pagination: {
    page: 1,
    page_size: 10,
  },
})
const search = reactive<{
  channel_type: string | number
  status: number | string
  area_codes: number | string
  https_status: number | string
  order: string
}>({
  channel_type: '0,1,2',
  status: '',
  area_codes: '',
  https_status: '',
  order: '',
})
const domain_name = ref<string>('')
const getDomainList = async () => {
  domain.loading = true
  const params = { ...search, ...domain.pagination, domain_name: domain_name.value }
  const res = await _getDomainList(params)
  if (res.code !== 200) {
    return
  }
  // cname_status CNAME解析状态 异步更新 -1 未查询到 0 解析失败 1 解析成功
  domain.tableData = res.data.data?.map(v => ({ ...v, more: false, cname_status: -1 })) || []
  domain.total = res.data.total || 0
  domain.loading = false

  // 更新CNAME解析状态
  if (domain.tableData.length > 0) {
    domain.domainStatesLoading = true
    const domainNames = domain.tableData.map(v => v.domain).join(',')
    try {
      const domainStates = await _getDomainStatus(domainNames)
      if (domainStates.code === 200 && domainStates.data?.data?.length > 0) {
        domain.tableData.forEach(domainInfo => {
          const domainState = domainStates.data.data.find(v => v.domain_name === domainInfo.domain)
          if (domainState) {
            domainInfo.cname_status = domainState.status ?? -1
          }
        })
      }
    } finally {
      domain.domainStatesLoading = false
    }
  }
}

if (sessionStorage.cdn_domain_page_type) {
  search.channel_type = sessionStorage.cdn_domain_page_type
  tabType.value = sessionStorage.cdn_domain_page_type
}
onMounted(() => {
  getDomainList()
})
onBeforeUnmount(() => {
  sessionStorage.cdn_domain_page_type = tabType.value
})

watch(
  () => ({ ...search }),
  () => {
    nextTick(() => {
      getDomainList()
    })
  },
  { deep: true },
)
const downloadDomainList = async () => {
  const blob = await _downloadDomainList({
    ...search,
    ...domain.pagination,
    page_size: 9999,
    domain_name: domain_name.value,
  })
  downloadExportFiles(blob, `${t('allDomains')}.xlsx`)
}
const refresh = () => {
  domain_name.value = ''
  getDomainList()
}

const operate = reactive<{
  rows: TableDataItem[]
  length: number
  showList: { domain: string; state: boolean }[]
}>({
  rows: [],
  length: 0,
  showList: [],
})
interface State {
  set: boolean
  sure: boolean
  start: boolean
  stop: boolean
  del: boolean
  remark: boolean
  type: string
  detail: boolean
  remarkInput: string
}
const state = reactive<State>({
  set: false,
  sure: false,
  start: false,
  stop: false,
  del: false,
  remark: false,
  type: '',
  detail: false,
  remarkInput: '',
})
const toDetail = (row: TableDataItem) => {
  pushRoute({
    path: '/cdn/domain/detail',
    query: {
      id: row.id,
      domain: row.domain,
      status: row.status,
      is_lock: row.is_lock,
    },
  })
}
const tableHandle = (type: keyof State, row?: TableDataItem, origin_servers?: 0 | 1) => {
  if (row) {
    if (origin_servers === 0 || origin_servers === 1) {
      const arr = row.origin_servers.filter((v: any) => v.priority == origin_servers).map(vv => vv.address)
      operate.rows = JSON.parse(JSON.stringify(arr))
    } else {
      operate.rows = JSON.parse(JSON.stringify([row]))
    }
  }
  if (type === 'detail' || type === 'remark') {
    if (type === 'remark') {
      state.remarkInput = operate.rows[0].remark
    }
    state[type] = true
  } else {
    state.type = type
    state.sure = true
  }
}
const updateSure = () => {
  state.sure = false
  state[state.type] = true
  updateStatus(state.type as keyof State)
}
const updateStatus = async (type: keyof State) => {
  switch (type) {
    case 'start':
      for (let i = 0; i < operate.rows.length; i++) {
        await _updateDomain({ id: operate.rows[i].id, status: 1 })
          .then(() => {
            operate.showList.push({ domain: operate.rows[i].domain, state: true })
          })
          .catch(error => {
            operate.showList.push({ domain: operate.rows[i].domain, state: false })
            showErrorTip(error.response.data.msg)
          })
          .finally(() => {
            operate.length++
          })
      }
      break
    case 'stop':
      for (let i = 0; i < operate.rows.length; i++) {
        await _updateDomain({ id: operate.rows[i].id, status: 3 })
          .then(() => {
            operate.showList.push({ domain: operate.rows[i].domain, state: true })
          })
          .catch(error => {
            operate.showList.push({ domain: operate.rows[i].domain, state: false })
            showErrorTip(error.response.data.msg)
          })
          .finally(() => {
            operate.length++
          })
      }
      break
    case 'del':
      for (let i = 0; i < operate.rows.length; i++) {
        await _delDomain(operate.rows[i].id)
          .then(() => {
            operate.showList.push({ domain: operate.rows[i].domain, state: true })
          })
          .catch(error => {
            operate.showList.push({ domain: operate.rows[i].domain, state: false })
            showErrorTip(error.response.data.msg)
          })
          .finally(() => {
            operate.length++
          })
      }
      break
    case 'remark':
      _updateBaseConfig({
        id: operate.rows[0].id,
        form: { remark: state.remarkInput, area_code: operate.rows[0].area_code },
      }).finally(() => {
        state.remark = false
        getDomainList()
      })
      break
    default:
      break
  }
}
const resetTableData = () => {
  getDomainList()
  operate.showList = []
  operate.length = 0
  state[state.type] = false
}
const tableSelect = v => {
  operate.rows = JSON.parse(JSON.stringify(v))
}
type Type = 'start' | 'del' | 'stop'
const cancelDialog = (type: Type) => {
  state[type] = false
  operate.length = 0
  operate.showList = []
  operate.rows = []
  // getDomainList()
}
const showButtonTip = ref<string>('')
const isDisabled = (status: 1 | 4) => {
  if (operate.rows.length === 0) return true
  if (operate.rows.every(v => v.status === status)) return false
  return true
}
const buttonEnter = (status: 1 | 4, type: Type) => {
  if (isDisabled(status)) {
    showButtonTip.value = type
  } else {
    showButtonTip.value = ''
  }
}
const showTableItemTip = ref<string>('')
const tableButtonDisabled = (status: 1 | 4, type: Type) => {
  if (status === 4 && type === 'start') {
    return false
  } else if (status === 1 && type === 'stop') {
    return false
  } else if (status === 4 && type === 'del') {
    return false
  } else {
    return true
  }
}
const tableButtonEnter = (status: 1 | 4, type: Type) => {
  if (tableButtonDisabled(status, type)) {
    showTableItemTip.value = type
  } else {
    showTableItemTip.value = ''
  }
}

const tableHeadAll = ref<any>([
  {
    title: 'acceleratedDomain',
    show: true,
    disabled: true,
    parent: '0,1,2,3',
  },
  {
    title: 'type',
    show: true,
    disabled: false,
    parent: '0,1,2',
  },
  {
    title: 'status',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'cnameDomain',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'region',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'httpsAcceleration',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'pullHost',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'belongProject',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'primaryServer',
    show: false,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'standbyServer',
    show: false,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'remark',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'modificationTime',
    show: true,
    disabled: false,
    parent: '0,1,2,3',
  },
  {
    title: 'operation',
    show: true,
    disabled: true,
    parent: '0,1,2,3',
  },
])
const tableHead = ref<any>([])
const currentTableHead = ref<any>([])
const currentTableSelected = computed(() => currentTableHead.value.filter(v => v.show).length)
const initTableHead = () => {
  try {
    currentTableHead.value = JSON.parse(localStorage.headList)
    tableHead.value = JSON.parse(localStorage.headList)
  } catch {
    currentTableHead.value = JSON.parse(JSON.stringify(tableHeadAll.value))
    tableHead.value = JSON.parse(JSON.stringify(tableHeadAll.value))
    localStorage.headList = JSON.stringify(tableHeadAll.value)
  }
}
initTableHead()
const setTableHead = () => {
  tableHead.value = JSON.parse(JSON.stringify(currentTableHead.value))
  state.set = true
}
const comfirmTableHead = () => {
  tableHead.value = JSON.parse(JSON.stringify(currentTableHead.value))
  localStorage.headList = JSON.stringify(currentTableHead.value)
  state.set = false
}
const cancelTableHead = () => {
  currentTableHead.value = JSON.parse(JSON.stringify(tableHead.value))
}
</script>

<style lang="scss" scoped>
.domain-list {
  .hover-item .icon-hover {
    visibility: hidden;
  }

  .hover-item:hover .icon-hover {
    visibility: visible;
  }

  // 转圈圈
  .rotate {
    @include rotate;
  }
}

.dialog-content-bg {
  background-color: #f9fafc;
}

.more-list {
  .el-button {
    margin-bottom: 4px;
    margin-left: 0 !important;
    border: none;

    &:hover {
      background-color: rgb(241 242 252);
    }

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .el-popper {
    .popper-text {
      width: max-content;
    }
  }
}
</style>
