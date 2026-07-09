<template>
  <div class="batch-add-record">
    <template v-if="state.type === 1">
      <el-form label-position="left" label-width="auto" class="the-form">
        <el-form-item :label="t('batchOperation.selectDomain')" style="margin-bottom: 35px">
          <!-- <DnsDomainTextarea :placeholder="t('batchOperation.addRecordPlaceholder')" v-model:domains="state.domains"
            ref="dns_domain_textarea" :disabled="true">
            <template #errors>
              <el-button plain @click="chooseWithList">
                {{ t('batchOperation.selectFromList') }}
              </el-button>
            </template>
          </DnsDomainTextarea> -->
          <DnsDomainTransfer :selected="state.domains" :error="state.domainsError" @confirm="transferConfirm" />
        </el-form-item>
        <el-form-item :label="t('batchOperation.addRecord')" class="tb">
          <div class="type-1-add-content">
            <el-table
              v-loading="state.loading"
              class="batch-table"
              :data="state.recordData"
              :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
            >
              <el-table-column
                v-for="item in type1columns"
                :key="item.prop"
                :prop="item.prop"
                :label="item.label"
                :class="item.prop"
                :width="item.width"
                :min-width="item.minWidth"
              >
                <template #default="{ row, $index }">
                  <!-- 主机记录 -->
                  <div v-if="item.prop === 'hostRecord'">
                    <el-tooltip
                      :visible="row.is_host_error"
                      trigger="click"
                      placement="top"
                      :content="row.host_error"
                      popper-class="add-record-tooltip"
                    >
                      <el-input
                        v-model.trim="row.hostRecord"
                        :class="{ 'type1-error-input': row.host_error }"
                        @focus="type1InputFocus(item.prop, row[item.prop], $index)"
                        @blur="type1InputBlur(item.prop, row[item.prop], $index)"
                      />
                    </el-tooltip>
                  </div>
                  <!-- 记录类型 -->
                  <div v-else-if="item.prop === 'recordType'" class="table-record_type">
                    <el-select v-model="row.recordType">
                      <el-option
                        v-for="item in state.analysis.filter(item => item.status === 1)"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                  <!-- 线路路线 -->
                  <div v-else-if="item.prop === 'lineType'" class="table-line_type">
                    <DnsLine
                      v-model:id="row.lineTypeId"
                      :options="state.lineTypes"
                      :tele-class="'ll1-' + $index"
                      style="display: inline-block; width: 100%"
                    />
                  </div>
                  <!-- 记录值 -->
                  <div v-if="item.prop === 'recordValue'">
                    <el-tooltip
                      :visible="row.is_recordValue_error"
                      trigger="click"
                      placement="top"
                      :content="row.recordValue_error"
                      popper-class="add-record-tooltip"
                    >
                      <el-input
                        v-model.trim="row.recordValue"
                        :class="{
                          'type1-error-input': row.recordValue_error,
                        }"
                        @focus="type1InputFocus(item.prop, row[item.prop], $index)"
                        @blur="type1InputBlur(item.prop, row[item.prop], $index)"
                      />
                    </el-tooltip>
                  </div>
                  <!-- 权重 -->
                  <div v-if="item.prop === 'weight'" class="table-weight">
                    <el-tooltip
                      v-if="state.analysis.find(item => item.type === row.recordType)?.weight === 1"
                      :visible="row.is_weight_error"
                      trigger="click"
                      placement="top"
                      :content="row.weight_error"
                      popper-class="add-record-tooltip"
                    >
                      <el-input
                        v-model.number="row.weight"
                        :class="{ 'type1-error-input': row.weight_error }"
                        @focus="type1InputFocus(item.prop, row[item.prop], $index)"
                        @blur="type1InputBlur(item.prop, row[item.prop], $index)"
                      />
                    </el-tooltip>
                    <div v-else>
                      {{ row.weight }}
                    </div>
                  </div>
                  <!-- 优先级 -->
                  <div v-if="item.prop === 'mx'">
                    <el-tooltip
                      v-if="state.analysis.find(item => item.type === row.recordType)?.mx === 1"
                      :visible="row.is_mx_error"
                      trigger="click"
                      placement="top"
                      :content="row.mx_error"
                      popper-class="add-record-tooltip"
                    >
                      <el-input
                        v-model.number="row.mx"
                        :class="{ 'type1-error-input': row.mx_error }"
                        @focus="type1InputFocus(item.prop, row[item.prop], $index)"
                        @blur="type1InputBlur(item.prop, row[item.prop], $index)"
                      />
                    </el-tooltip>
                    <div v-else>
                      {{ row.mx }}
                    </div>
                  </div>
                  <!-- ttl -->
                  <div v-if="item.prop === 'ttl'">
                    <el-tooltip
                      :visible="row.is_ttl_error"
                      trigger="click"
                      placement="top"
                      :content="row.ttl_error"
                      popper-class="add-record-tooltip"
                    >
                      <el-input
                        v-model.number="row.ttl"
                        :class="{ 'type1-error-input': row.ttl_error }"
                        @focus="type1InputFocus(item.prop, row[item.prop], $index)"
                        @blur="type1InputBlur(item.prop, row[item.prop], $index)"
                      />
                    </el-tooltip>
                  </div>

                  <!-- 操作 -->
                  <div v-if="item.prop === 'handle'" class="table-handle">
                    <el-link type="primary" :disabled="state.recordData.length === 1" @click="type1RowDelete($index)">
                      {{ t('common.delete') }}
                    </el-link>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="state.recordData.length < 10" class="type-1-table-add cat-flex">
              <SvgIcon name="monitor-header-add" pointer @click="type1AddRow" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label=" ">
          <el-button
            type="primary"
            :disabled="!!state.recordData.find(item => !item.lineTypeId)"
            @click="type1HandleAdd"
          >
            {{ t('common.batchAdd') }}
          </el-button>
        </el-form-item>
      </el-form>
    </template>
    <!-- 表格 -->
    <template v-else>
      <div class="type-2">
        <div class="type-2-counts">
          {{
            t('batchOperation.type2Title', {
              count: state.recordData.length * state.tableData.length,
            })
          }}
        </div>
        <div class="type-2-handle">
          <el-button type="primary" :loading="state.loading" @click="batchAdd">
            {{ t('common.batchAdd') }}
          </el-button>
          <el-button plain :disabled="state.loading" @click="() => (state.type = 1)">
            {{ t('batchOperation.backType1') }}
          </el-button>
        </div>
        <div class="type-2-table-wrap">
          <CollapseTable
            :columns="type2Columns"
            :table-data="state.tableData"
            :open-table="state.recordData"
            :custom-item-width="type2columns2Width"
            all-width
            open
            auto
          >
            <template #open_item="{ item, row }">
              <template v-if="item.prop === 'recordType'">
                {{ state.analysis.find(analysis => analysis.type === row.recordType)?.name }}
              </template>

              <template v-else-if="item.prop === 'lineType'">
                {{ _matchRouteType(row.lineTypeId, state.lineTypes)?.lineName }}
              </template>
            </template>
          </CollapseTable>
        </div>
      </div>
    </template>
    <!-- 域名穿梭框 -->

    <ResultDialog
      v-model:dialog="state.resultDialog"
      :total="state.recordData.length * state.tableData.length"
      :job-id="state.jobId"
      :cancel-t="t('batchOperation.continueAddRecord')"
    />
  </div>
</template>

<script setup lang="ts">
import DnsDomainTransfer from '@/components/dns/dns-domain-transfer/index.vue'
import { type1columns, singleValidate, multipleValidate, type1ClearValidate, type2Columns } from './config'
import { _getAnalysisTypeList, _getLineTypes } from '@/apis/dns/sys'
import { _batchAddAnalysis } from '@/apis/dns/batch'
import { _formatRouteType, _matchRouteType, _setRecordType } from '@/utils/dns-utils'
import { _getDomainList } from '@/apis/dns/domain'
import t from '@/utils/i18n'
import { checkDomainsAllowsUser } from '../config'
import { useBaseStore } from '@/store'
import ResultDialog from '../result-dialog.vue'
import { type2columns2Width } from '../batch-operation-log/config'
import { message } from '@/utils/message'
import DnsLine from '@/components/dns/dns-line/index.vue'
import { ElMessage } from 'element-plus'
const baseStore = useBaseStore()
const state = reactive<{
  loading: boolean
  type: 1 | 2
  domains: string
  // transferDialog: boolean
  domainsError: string
  recordData: any[]
  tableData: any[]
  analysis: any[]
  lineTypes: any[]
  domainList: any[]
  resultDialog: boolean
  jobId: string
}>({
  loading: false,
  type: 1, // 1: 添加记录 2:添加完后的列表
  domains: '', // textarea选择的域名
  // transferDialog: false, // domains选择->穿梭框
  domainsError: '',
  // 添加记录的表格
  recordData: [],
  tableData: [],
  analysis: [],
  lineTypes: [],
  domainList: [],
  resultDialog: false,
  jobId: '',
})

// const dns_domain_textarea = ref()

// 从域名列表中选择
// const chooseWithList = () => {
//   state.transferDialog = true
// }

const transferConfirm = (domains: string) => {
  state.domains = domains
  if (state.domains.length) {
    state.domainsError = ''
  } else {
    state.domainsError = t('batchOperation.domainEmpty1')
  }
  // state.domains = '' // 先清空
  // if (state.domains[0]) {
  //   // 如果textarea没有值
  //   state.domains = state.domains + '\n' + domains
  // } else {
  //   // 如果textarea里存在值
  //   state.domains += domains
  // }
  // state.domains = Array.from(new Set(state.domains.split('\n'))).join('\n')
}

// 删除
const type1RowDelete = (i: number) => {
  state.recordData = state.recordData.filter((item, index) => index !== i)
  state.recordData.forEach((item, index) => item.key === index)
}

// input聚焦
const type1InputFocus = (key: string, value: string, i: number) => {
  type1ClearValidate(state.recordData)
  // 校验当前input
  state.recordData[i] = {
    ...state.recordData[i],
    ...singleValidate[key](value),
  }
}
// input失焦
const type1InputBlur = (key: string, value: string, i: number) => {
  type1ClearValidate(state.recordData)
  // 校验当前input
  state.recordData[i] = {
    ...state.recordData[i],
    ...singleValidate[key](value),
  }
  console.log('校验结果', key, value, state.recordData[i])
}

// 添加一行
const type1AddRow = () => {
  const defaultLine = state.lineTypes.find(item => item.isDefault)
  state.recordData.push({
    key: state.recordData.length,
    hostRecord: '@',
    recordType: _setRecordType(state.analysis), // 记录类型,
    lineType: defaultLine?.lineValue,
    lineTypeId: defaultLine.lineId,
    weight: 0,
    mx: 0,
    ttl: 0,
    recordValue: '',
  })
  type1ClearValidate(state.recordData)
}

// 批量添加->校验所有input框
const type1HandleAdd = () => {
  // 判断当前写入的域名是否是当前用户拥有的域名
  const { n } = checkDomainsAllowsUser(state.domains, state.domainList)
  if (n[0]) {
    message.error(t('batchOperation.cannotChange', { domains: n.join(',') }))
    return
  }
  // 校验选择域名框
  const res = state.domains.length > 0
  if (res) {
    state.domainsError = ''
  } else {
    state.domainsError = t('batchOperation.domainEmpty1')
  }
  console.log('校验选择域名框', res)

  // 校验添加记录框
  state.recordData = state.recordData.map(item => multipleValidate(item))
  const res2 = state.recordData.some(
    item =>
      item.is_host_error || item.is_mx_error || item.is_ttl_error || item.is_recordValue_error || item.is_weight_error,
  )

  // 校验所有线路是否都选择了
  const isEmptyLine = state.recordData.find(item => !item.lineTypeId)

  console.log('校验添加记录框', res2)
  if (res && !res2) {
    state.tableData = state.domains
      .split('\n')
      .filter(item => item)
      .map((item, i: number) => ({
        domain: item,
        key: i,
        id: i,
        hostRecord: item,
      }))
    console.log('校验成功', state.tableData, state.recordData)
    state.type = 2
  }
}

// 批量添加
const batchAdd = async () => {
  try {
    state.loading = true

    const domainList = state.tableData.map(item => item.domain)
    const recordList = state.recordData.map(item => {
      const line = _matchRouteType(item.lineTypeId, state.lineTypes)
      return {
        hostRecord: item.hostRecord,
        recordType: item.recordType,
        lineType: line?.lineValue,
        lineTypeId: line?.lineTypeId,
        mx: item.mx,
        ttl: item.ttl,
        weight: item.weight,
        value: item.recordValue,
      }
    })
    const {
      code,
      data: { jobId },
    } = await _batchAddAnalysis({
      domainList,
      recordList,
    })
    state.loading = false
    if (code === 200) {
      state.jobId = jobId
      state.resultDialog = true
    }
  } catch (error) {
    state.loading = false
  }
}

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
      state.analysis = types || []
      const defaultLine = state.lineTypes.find(item => item.isDefault)
      state.recordData.push({
        key: 0,
        hostRecord: '@', // 主机记录
        recordType: _setRecordType(state.analysis), // 记录类型,
        lineType: defaultLine?.lineValue, // 线路类型
        lineTypeId: defaultLine?.lineId,
        weight: 0, // 权重
        mx: 0, // 优先级
        ttl: 0,
        recordValue: '',
      })
      console.log('seee', state.recordData)
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
// 获取域名列表
const getDomainList = async () => {
  try {
    state.loading = true
    const { code, data } = await _getDomainList({
      page: 1,
      pageSize: 999,
    })
    state.loading = false
    if (code === 200) {
      const { list } = data
      list &&
        list.forEach((item: any) => {
          item.label = item.domain
          item.value = item.domain
          item.id = item.domainId
        })
      state.domainList = list || []
    }
  } catch (error) {
    state.loading = false
  }
}

onMounted(async () => {
  await getLineTypes()
  getAnalysisData()
  getDomainList()
})

/************************  type1 methods end *******************************/
</script>

<style scoped lang="scss">
.batch-add-record {
  & > div {
    width: 100%;
    height: 100%;
  }

  :deep(.the-form) {
    .el-form-item__label-wrap {
      height: 20px;

      .el-form-item__label {
        color: #999;
      }
    }

    .tb {
      margin-bottom: 40px;
    }
  }

  .type-1-add-content {
    position: relative;
    flex: 1;
    flex-shrink: 0;
    overflow: hidden;
    border: 1px solid var(--border-c);

    .type-1-table-wrap {
      width: 100%;
    }

    .type-1-table-add {
      width: 100%;
      height: 60px;
      cursor: pointer;

      svg {
        width: 24px;
        height: 24px;
      }
    }
  }

  .type-2 {
    height: 100%;
    overflow: auto;

    .type-2-counts {
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--table-text);
    }

    .type-2-handle {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 20px 0;
    }
  }
}
</style>

<style lang="scss">
.add-record-tooltip {
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
    }
  }
}

.the-cas {
  margin-top: -7px;

  .el-popper__arrow {
    display: none;
  }
}
</style>
