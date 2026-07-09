<template>
  <div class="batch-amendant-record" :class="{ 'no-table': !state.type1TableData || !state.type1TableData[0] }">
    <template v-if="state.type === 1">
      <el-form label-position="left" label-width="auto" class="the-form">
        <el-form-item :label="t('batchOperation.selectDomain')" style="margin-bottom: 35px">
          <!-- <DnsDomainTextarea :placeholder="t('batchOperation.changeRecordPlaceholder')" v-model:domains="state.domains"
            ref="dns_domain_textarea" :disabled="true">
            <template #errors>
              <el-button plain @click="chooseWithList">
                {{ t('batchOperation.selectFromList') }}
              </el-button>
            </template>
          </DnsDomainTextarea> -->
          <DnsDomainTransfer :selected="state.domains" :error="state.domainsError" @confirm="transferConfirm" />
        </el-form-item>
        <el-form-item :label="t('batchOperation.changeRecordLabel1')" class="rec">
          <!-- 选择要修改的记录 -->
          <div class="type-1-content">
            <!-- 筛选 -->
            <div class="type-1-content-title">
              {{ t('batchOperation.changeRecordTip1') }}
            </div>
            <!-- 筛选框 -->
            <DnsDomainFilterVue
              :record-type-options="[...state.analysis]"
              :line-types="state.lineTypes"
              :loading="state.loading"
              :disabled="!state.domains"
              @clear="() => (state.type1TableData = void 0)"
              @submit="handleFilter"
            />
            <div v-if="state.type1TableData && state.type1TableData[0]" class="type-1-change">
              <div class="type-1-change-title">
                {{
                  t('batchOperation.changeRecordTip2', {
                    count: resultRecords,
                  })
                }}
              </div>
              <el-table
                ref="batch_amendant_table"
                v-loading="state.loading"
                class="batch-amendant-table"
                row-key="id"
                :data="state.type1TableData"
                default-expand-all
                :tooltip-options="{ popperClass: 'cat-tooltip-popper' }"
                :row-class-name="rowClass"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" class="batch-amendant-checkbox" width="118" />
                <el-table-column
                  v-for="item in type1Columns"
                  :key="item.prop"
                  :prop="item.prop"
                  :label="item.label"
                  :class="item.prop"
                  :min-width="item.minWidth"
                >
                  <template #default="{ row }">
                    <!-- 主机记录 -->
                    <div v-if="item.prop === 'hostRecord'" style="width: 800px; margin-left: -52px; text-indent: 0">
                      {{
                        row?.parentId
                          ? row.hostRecord
                          : row.hostRecord +
                            t('batchOperation.records', {
                              total: row.children ? row.children.length : 0,
                            })
                      }}
                    </div>
                    <!-- 记录类型回显 -->
                    <div v-if="item.prop === 'recordType'">
                      {{ state.analysis.find(analysis => analysis.type === row.recordType)?.name }}
                    </div>
                    <!-- 线路类型回显 -->
                    <div v-else-if="item.prop === 'lineTypeId'">
                      {{ _matchRouteType(row.lineTypeId, state.lineTypes, ' ')?.lineName }}
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          v-if="selectedRecords.length > 0"
          :label="t('batchOperation.modifyRecord')"
          class="modify-record-item"
        >
          <div class="type-1-content">
            <div class="type-1-content-title">
              {{
                t('batchOperation.selectTotal', {
                  count: selectedRecords.length,
                })
              }}
            </div>
            <!-- 主机记录 -->
            <div class="type-1-content-box dns">
              <div class="type-1-content-box-title">
                {{ t('columns.hostRecord') }}
              </div>
              <el-radio-group v-model="state.type1Radios.hostRecord">
                <el-radio :label="0">
                  {{ t('batchOperation.noChange') }}
                </el-radio>
                <el-radio :label="1">
                  {{ t('batchOperation.changeTo') }}
                  <el-input
                    v-model.trim="state.type1New.hostRecord.value"
                    :disabled="state.type1Radios.hostRecord === 0"
                    style="width: 360px; height: 34px; margin-left: 14px"
                    :placeholder="t('batchOperation.such')"
                    :class="{
                      'error-input': state.type1New.hostRecord.error,
                    }"
                    @blur="radioInputValidate('hostRecord')"
                  />
                </el-radio>
              </el-radio-group>
              <!-- 错误信息 -->
              <div v-show="state.type1Radios.hostRecord === 1" class="type-1-content-box-error">
                {{ state.type1New.hostRecord.error }}
              </div>
            </div>
            <!-- 记录类型/记录值 -->
            <div class="type-1-content-box record-type">
              <div class="type-1-content-box-title">
                {{ t('batchOperation.typeAndValue') }}
              </div>
              <el-radio-group v-model="state.type1Radios.recordType">
                <el-radio :label="0">
                  {{ t('batchOperation.noChange') }}
                </el-radio>
                <el-radio :label="1">
                  {{ t('batchOperation.changeTo') }}
                  <!-- 记录类型 -->
                  <el-select
                    v-model="state.type1New.recordType.value"
                    :placeholder="t('columns.recordType')"
                    :disabled="state.type1Radios.recordType === 0"
                    :class="{
                      'error-input': state.type1New.recordType.error,
                    }"
                    style="width: 139px; height: 34px; margin-left: 14px"
                  >
                    <el-option
                      v-for="item in state.analysis.filter(item => item.status === 1)"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <!-- 记录值 -->
                  <el-input
                    v-model.trim="state.type1New.recordType.recordValue"
                    :disabled="state.type1Radios.recordType === 0"
                    :placeholder="t('columns.recordValue')"
                    :class="{
                      'error-input': state.type1New.recordType.error,
                    }"
                    style="width: 360px; height: 34px; margin-left: 20px"
                    @blur="radioInputValidate('recordType')"
                  />
                </el-radio>
              </el-radio-group>
              <!-- 错误信息 -->
              <div v-show="state.type1Radios.recordType === 1" class="type-1-content-box-error">
                {{ state.type1New.recordType.error }}
              </div>
            </div>
            <!-- 线路类型 -->
            <div class="type-1-content-box">
              <div class="type-1-content-box-title">
                {{ t('columns.lineType') }}
              </div>
              <el-radio-group v-model="state.type1Radios.lineTypeId">
                <el-radio :label="0">
                  {{ t('batchOperation.noChange') }}
                </el-radio>
                <el-radio :label="1">
                  {{ t('batchOperation.changeTo') }}
                  <DnsLine
                    v-model:id="state.type1New.lineTypeId.value"
                    :options="state.lineTypes"
                    tele-class="ttc"
                    style="display: inline-block"
                    :disabled="state.type1Radios.lineTypeId === 0"
                  />
                </el-radio>
              </el-radio-group>
            </div>
            <!-- TTL -->
            <div class="type-1-content-box">
              <div class="type-1-content-box-title">TTL</div>

              <el-radio-group v-model="state.type1Radios.ttl">
                <el-radio :label="0">
                  {{ t('batchOperation.noChange') }}
                </el-radio>
                <el-radio :label="1">
                  {{ t('batchOperation.changeTo') }}
                  <el-input
                    v-model.trim="state.type1New.ttl.value"
                    style="width: 139px; height: 34px; margin-left: 14px"
                    :disabled="state.type1Radios.ttl === 0"
                    :placeholder="t('batchOperation.suchTTL')"
                    :class="{
                      'error-input': state.type1New.ttl.error,
                    }"
                    @blur="radioInputValidate('ttl')"
                  />
                </el-radio>
              </el-radio-group>
              <div v-show="state.type1Radios.ttl === 1" class="type-1-content-box-error">
                {{ state.type1New.ttl.error }}
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label=" " class="bt">
          <el-button type="primary" :disabled="btnDisabled" @click="type1HandleAmendant">
            {{ t('batchOperation.batchChange') }}
          </el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-else>
      <div class="type-2">
        <div class="type-2-counts">
          {{ t('batchOperation.type2Title', { count: type2Records }) }}
        </div>
        <div class="type-2-handle">
          <el-button type="primary" :loading="state.loading" @click="handleAdd">
            {{ t('batchOperation.batchChange') }}
          </el-button>
          <el-button plain @click="typeBack">
            {{ t('batchOperation.backType1') }}
          </el-button>
        </div>
        <div class="type-2-table-wrap">
          <CollapseTable
            :columns="type1Columns"
            :table-data="state.type2TableData"
            :custom-item-width="type2columns2Width"
            all-width
            open
            auto
            is-children
          >
            <template #open_item="{ item, row }">
              <div v-if="item.prop === 'recordType'">
                {{ state.analysis.find(analysis => analysis.type === row.recordType)?.name }}
              </div>
              <!-- 线路类型回显 -->
              <div v-else-if="item.prop === 'lineTypeId'">
                {{ _matchRouteType(row.lineTypeId, state.lineTypes)?.lineName }}
              </div>
            </template>
          </CollapseTable>
        </div>
      </div>
    </template>
    <!-- <DnsDomainTransfer v-model:dialog="state.transferDialog" :selected="state.domains" @confirm="transferConfirm" /> -->
    <!-- 域名穿梭框 -->
    <ResultDialog
      v-model:dialog="state.resultDialog"
      :total="type2Records"
      :job-id="state.jobId"
      :cancel-t="t('batchOperation.continueAmendantRecord')"
    />
  </div>
</template>

<script setup lang="ts">
import DnsDomainTransfer from '@/components/v2/dns/dns-domain-transfer/index.vue'
import DnsDomainFilterVue, { Filter } from '@/components/dns/dns-domain-filter/index.vue'
import { type1Columns, type1NewValidate, type1NewValidateAll } from './config'
import { _getAnalysisTypeList, _getLineTypes } from '@/apis/dns/sys'
import { _getDomainList } from '@/apis/dns/domain'
import { _getAnalysisListFilter, _batchChangeAnalysis } from '@/apis/dns/analysis'
import { _getGroupList } from '@/apis/dns/group'
import { _formatRouteType, _matchRouteType } from '@/utils/dns-utils'
import t from '@/utils/i18n'
import { checkDomainsAllowsUser } from '../config'
import { useBaseStore } from '@/store'
import ResultDialog from '../result-dialog.vue'
import { type2columns2Width } from '../batch-operation-log/config'
import { message } from '@/utils/message'
const baseStore = useBaseStore()
// const dns_domain_textarea = ref()
const rowClass = ({ row }) => {
  return row.isChildren ? 'child' : ''
}
const state = reactive<{
  loading: boolean
  type: 1 | 2
  domains: string
  // transferDialog: boolean
  domainsError: string
  type1TableData: any
  type1Radios: {
    hostRecord: number
    recordType: number
    lineTypeId: number
    ttl: number
    // mx: number;
  }
  type1New: {
    hostRecord: {
      value: string
      error: string // 错误信息
    }
    recordType: {
      value: any
      recordValue: string
      error: string
    }
    lineTypeId: {
      value: string
      error: string
    }
    ttl: {
      value: string
      error: string
    }
  }
  type2TableData: any[]
  analysis: any[]
  domainList: any[]
  lineTypes: any[]
  multipleSelection: any[]
  resultDialog: boolean
  jobId: string
}>({
  loading: false,
  type: 1,
  domains: '', // 域名
  // transferDialog: false, // 控制穿梭框显示隐藏
  domainsError: '',
  type1TableData: void 0, //表格
  // radio的选择
  type1Radios: {
    hostRecord: 0,
    recordType: 0,
    lineTypeId: 0,
    ttl: 0,
    // mx: 0,
  },
  type1New: {
    // 新的主机记录
    hostRecord: {
      value: '',
      error: '',
    },
    // 新的记录类型
    recordType: {
      value: 0, // 类型选择
      recordValue: '', // 记录值
      // weight: "", // 权重
      error: '',
    },
    // 新的线路类型id
    lineTypeId: {
      value: '',
      error: '',
    },
    // 新的TTL
    ttl: {
      value: '',
      error: '',
    },
    // mx: {
    //   value: "",
    //   error: "",
    // },
  },
  type2TableData: [],
  analysis: [],
  domainList: [],
  lineTypes: [],
  multipleSelection: [],
  resultDialog: false,
  jobId: '',
})
const batch_amendant_table = ref()

/************************  type1 methods start *******************************/
// 多选
const handleSelectionChange = (val: any[]) => {
  state.multipleSelection = val
}
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
  // state.domains = ''
  // if (state.domains[0]) {
  //   state.domains = state.domains + '\n' + domains
  // } else {
  //   state.domains += domains
  // }
  // state.domains = Array.from(new Set(state.domains.split('\n'))).join('\n')
}

// 单个校验(input框失焦触发)
const radioInputValidate = (key: 'hostRecord' | 'recordType' | 'lineTypeId' | 'ttl' /*| "mx"*/) => {
  // 可以校验
  type1NewValidate[key](state.type1New[key])
}

const typeBack = () => {
  // 回显
  state.type = 1
  const selectIds = state.multipleSelection.map(item => item.id)
  nextTick(() => {
    state.type1TableData.forEach(item => {
      selectIds.includes(item.id) && batch_amendant_table.value.toggleRowSelection(item, true)
      item.children &&
        item.children.forEach(citem => {
          selectIds.includes(citem.id) && batch_amendant_table.value.toggleRowSelection(citem, true)
        })
    })
  })
}

// 批量修改
const type1HandleAmendant = () => {
  type1NewValidateAll(state.type1New)
  // 判断是否还有错误信息
  let isError: boolean = false
  const { hostRecord, recordType, ttl, lineTypeId /*mx*/ } = state.type1New
  const { type1Radios } = state
  if (type1Radios.hostRecord === 1) {
    isError = type1NewValidate.hostRecord(hostRecord).error
  }
  if (type1Radios.recordType === 1) {
    isError = type1NewValidate.recordType(recordType).error
  }
  if (type1Radios.ttl === 1) {
    isError = type1NewValidate.ttl(ttl).error
  }
  // if(type1Radios.lineTypeId ===1) {
  //   isError = type1NewValidate.lineTypeId(lineTypeId).error
  // }
  if (isError) {
    console.log('还有错误', isError)
  } else {
    // 格式化tableData2
    state.type2TableData = []
    const setNewRow = (_row: any) => {
      const row = { ..._row }
      if (type1Radios.hostRecord === 1) {
        row.hostRecord = hostRecord.value
      }
      //
      if (type1Radios.recordType === 1) {
        row.recordType = recordType.value
        row.recordValue = recordType.recordValue
      }
      if (type1Radios.lineTypeId === 1) {
        const line = _matchRouteType(lineTypeId.value, state.lineTypes)
        row.lineTypeId = line?.lineTypeId
        row.lineType = line?.lineValue
      }
      if (type1Radios.ttl === 1) {
        row.ttl = ttl.value
      }
      return row
    }
    // 父级
    const parentIdArr: number[] = []
    // 修改被选中的记录
    const records = batch_amendant_table.value.getSelectionRows().filter((item: any) => {
      !parentIdArr.includes(item.parentId) && parentIdArr.push(item.parentId)
      return item.isChildren
    })
    // 替换所有子集的数据
    for (let i = 0; i < records.length; i++) {
      records[i] = setNewRow(records[i])
    }
    const parentArr: any[] = []
    // 父级数组生成
    state.type1TableData.forEach(item => {
      parentIdArr.includes(item.id) && parentArr.push({ ...item })
    })
    // 放到parent中
    parentArr.forEach(item => {
      item.children = []
      records.forEach(citem => {
        if (citem.parentId === item.id) {
          item.children.push(citem)
        }
      })
    })
    state.type2TableData = parentArr
    state.type = 2
    console.log('可以进行修改了', state.type2TableData)
  }
}

// 批量修改按钮
const btnDisabled = computed(() => {
  return state.multipleSelection.length === 0 || Object.values(state.type1Radios).filter(item => item).length === 0
})

// 搜索出来的记录
const resultRecords = computed(() => {
  let count: number = 0
  state.type1TableData.forEach(item => {
    if (item.children) {
      count += item.children.length
    }
  })
  return count
})

// 被选中的记录
const selectedRecords = computed(() => {
  return state.multipleSelection.filter(item => item.isChildren)
})

// type2的记录数量
const type2Records = computed(() => {
  let counts = 0
  state.type2TableData.forEach(item => {
    counts += item.children.length
  })
  return counts
})

// 最终的提交
const handleAdd = async () => {
  try {
    let children: any[] = []
    state.type2TableData.forEach(item => {
      children = [...children, ...item.children]
    })
    const analysisIdList = children.map(item => item.id)
    const one = state.type2TableData[0].children[0]
    const { hostRecord, recordType, lineTypeId, ttl } = state.type1Radios
    console.log('sssss', one, state.type1Radios)

    const data: any = {
      analysisIdList,
      lineType: lineTypeId ? one.lineType : '',
      lineTypeId: lineTypeId ? one.lineTypeId : '',
      recordType: recordType ? Number(one.recordType) : 0,
      hostRecord: hostRecord ? one.hostRecord : '',
      recordValue: recordType ? one.recordValue : '',
      ttl: ttl ? Number(one.ttl) : 0,
    }
    // 是否修改了记录类型->新的记录类型是否有weight和mx
    if (data.recordType) {
      const current = state.analysis.find(item => item.type === data.recordType)
      if (current.weight === 0) {
        data.weight = 0
      }
      if (current.mx === 0) {
        data.mx = 0
      }
    }
    state.loading = true
    const {
      code,
      data: { jobId },
    } = await _batchChangeAnalysis(data)
    state.loading = false
    if (code === 200) {
      state.jobId = jobId
      state.resultDialog = true
    }
  } catch (error) {
    state.loading = false
  }
}

// 筛选
const handleFilter = async (filter: Filter) => {
  const res = state.domains.length > 0
  if (!res) {
    state.domainsError = t('batchOperation.domainEmpty1')
    return
  } else {
    state.domainsError = ''
  }
  // 判断当前写入的域名是否是当前用户拥有的域名
  const { n, domains } = checkDomainsAllowsUser(state.domains, state.domainList)
  if (n[0]) {
    message.error(t('batchOperation.cannotChange', { domains: n.join(',') }))
    return
  }
  try {
    state.loading = true
    const domainId = state.domainList
      .map(item => domains.includes(item.domain) && item.domainId)
      .filter(item => item)
      .join(',')
    const { code, data } = await _getAnalysisListFilter({
      domainId,
      ...filter,
    })

    state.loading = false
    if (code === 200) {
      data.forEach(item => {
        item.id = item.domainId
        item.hostRecord = item.domainName
        item.recordList &&
          item.recordList.forEach(citem => {
            citem.parentId = item.id
            citem.isChildren = true
          })
        item.children = item.recordList
      })
      state.type1TableData = data || []
      console.log('type1TableData', state.type1TableData)
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
    if (code === 200) {
      const { types } = data
      types &&
        types.forEach((item: any) => {
          item.value = item.type
          item.label = item.name
        })
      state.analysis = types || []
      state.type1New.recordType.value = ''
    }
    state.loading = false
  } catch (error) {
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
// 获取线路列表
const getLineTypes = async () => {
  try {
    state.loading = true
    const { code, data } = await _getLineTypes()
    if (code === 200) {
      state.lineTypes = data ? _formatRouteType(data) : []
      const defaultLine = state.lineTypes.find(item => item.isDefault)
      state.type1New.lineTypeId.value = defaultLine?.lineId
    }
    state.loading = false
  } catch (error) {
    console.log('线路error', error)
    state.loading = false
  }
}

// 监听radio
watch(
  () => state.type1Radios,
  (type1Radios: any) => {
    Object.entries(type1Radios).forEach(([key, value]) => {
      if (value === 0) {
        console.log('看看', key, state.type1New)

        // 清除错误信息
        state.type1New[key as keyof typeof state.type1New].error = ''
      }
    })
  },
  { deep: true },
)

onMounted(() => {
  getLineTypes()
  getAnalysisData()
  getDomainList()
})

/************************  type1 methods end *******************************/
</script>

<style scoped lang="scss">
.batch-amendant-record {
  &.no-table {
    .the-form {
      .rec {
        margin-bottom: 20px;
      }
    }
  }

  :deep(.the-form) {
    .el-form-item__label-wrap {
      height: 20px;

      .el-form-item__label {
        color: #999;
      }
    }

    .rec {
      margin-bottom: 38px;
    }
  }

  .type-1-content-box-error {
    margin-bottom: 12px;
    color: var(--error-color);
  }

  .type-1-content-box {
    margin-bottom: 12px;

    .type-1-content-box-title {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 400;
      color: #555;

      .dns-line {
        display: inline-block;
      }
    }

    .el-radio-group {
      .el-radio {
        margin-right: 40px;
      }
    }
  }

  .type-1-content {
    width: 100%;

    .type-1-content-title {
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 400;
      color: #555;
    }

    .type-1-change-title {
      margin-bottom: 16px;
      font-size: 14px;
      font-weight: 400;
      color: #555;
    }
  }

  :deep(.modify-record-item) {
    .el-form-item__label {
      color: #828b9c;
    }
  }

  .modify-record-item {
    .type-1-content-box {
      display: flex;
      align-items: center;
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .type-1-content-box-title {
        flex: 0 0 120px;
        margin-bottom: 0;
        color: #828b9c;
      }

      .el-radio-group {
        display: flex;
        align-items: center;
      }
    }

    .type-1-content-box-error {
      margin-bottom: 0;
      margin-left: 120px;
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
.error-input {
  .el-input__wrapper {
    box-shadow: 0 0 0 1px var(--error-color);

    .el-input__inner {
      color: var(--error-color);
      border-color: var(--error-color);
    }
  }
}

.table-wrap {
  display: flex;
}

.batch-amendant-table {
  border: 1px solid var(--border-c);

  thead {
    tr {
      th {
        height: 40px !important;

        &:first-child {
          padding-left: 44px;

          .cell {
            padding-left: 0;
          }
        }

        &:nth-child(2) {
          text-indent: -56px;

          .cell {
            overflow: visible;
          }
        }
      }
    }
  }

  tbody {
    tr {
      td:first-child {
        padding-left: 24px !important;
      }

      td:nth-child(2) {
        .cell {
          display: flex;
          overflow: visible;
          text-indent: -55px;

          /* white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          margin-left: -60px;
          text-indent: 0;
          width: 140px !important; */

          .el-table__placeholder {
            display: none; // 222222
          }

          .el-table__expand-icon {
            top: 24px;
            left: -76px;
            width: 14px;
            height: 14px;
            margin-right: 20px;
            transition: none;

            .el-icon {
              color: transparent;

              svg {
                display: inline-block;
                width: 14px !important;
                height: 14px !important;
                padding: 1px;
                background: url('@/assets/svg-icon/down-arrow.svg');
                background-size: cover;
                transform: rotateZ(270deg);
              }
            }

            &.el-table__expand-icon--expanded {
              top: 48px;
              left: -102px;
            }
          }
        }
      }

      .cell {
        overflow: visible;
        word-break: break-all !important;
        white-space: normal !important;
      }

      &.el-table-column--selection {
        // placeholder
      }

      &.child {
        background-color: var(--table-head-bgc);

        td:first-child {
          width: 118px !important;

          .cell {
            width: 200px !important;
            height: 60px;
            padding-left: 59px;

            .el-checkbox {
              // placeholder
            }
          }
        }

        td:nth-child(2) {
          padding-left: 22px;
        }

        &:hover {
          td {
            background-color: transparent !important;
          }
        }
      }

      &:not(.child) {
        background-color: #fff;

        td:nth-child(2) {
          width: 720px !important;

          .cell {
            width: 100% !important;
          }
        }

        &:hover {
          td {
            background-color: transparent !important;
          }
        }

        td:hover {
          background-color: transparent !important;
        }
      }
    }
  }

  .el-table__expand-icon {
    position: absolute;
    top: 24px;
    left: -36px;
  }

  .el-table__indent {
    // placeholder
  }

  .el-table__placeholder {
    // placeholder
  }
}
</style>
