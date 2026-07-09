<template>
  <div class="batch-import-reocrd">
    <template v-if="state.type === 1">
      <el-form label-position="left" label-width="auto" class="the-form">
        <el-form-item :label="t('batchOperation.selectDomain')" class="first" style="margin-bottom: 35px">
          <!-- <DnsDomainTextarea :placeholder="t('batchOperation.importRecordPlaceholder')" v-model:domains="state.domains"
            ref="dns_domain_textarea" :disabled="true">
            <template #errors>
              <el-button plain @click="chooseWithList" class="select-btn">
                {{ t('batchOperation.selectFromList') }}
              </el-button>
            </template>
          </DnsDomainTextarea> -->
          <DnsDomainTransfer :selected="state.domains" :error="state.domainsError" @confirm="transferConfirm" />
        </el-form-item>
        <el-form-item :label="t('batchOperation.importRecordLabel1')">
          <div class="import-content">
            <DnsUpload
              :file="state.file"
              :disabled="state.file.status === 'loading'"
              @failed="uploadFailed"
              @success="uploadSuccess"
              @clear="uploadClear"
            >
              <template #tips>
                <div class="upload-tips">
                  <div>{{ t('batchOperation.importRecordTip1') }}</div>
                  <div class="t">
                    {{ t('batchOperation.importRecordTip2') }}
                  </div>
                  <div class="t">
                    {{ t('batchOperation.importRecordTip3') }}
                  </div>
                  <div class="t">
                    {{ t('batchOperation.importRecordTip4') }}
                    <el-link
                      v-for="(item, index) in state.templates"
                      :key="index"
                      type="primary"
                      :disabled="!item.url"
                      @click="downloadTemplate(item.url)"
                    >
                      {{ item.name }}
                    </el-link>
                  </div>
                </div>
              </template>
            </DnsUpload>
          </div>
        </el-form-item>
        <el-form-item label=" ">
          <el-button
            type="primary"
            :loading="state.loading"
            class="import-btn"
            :disabled="!state.domains || !state.file.file || state.file.status === 'failed'"
            @click="getData"
          >
            {{ t('batchOperation.batchImport') }}
          </el-button>
        </el-form-item>
      </el-form>
    </template>
    <template v-else>
      <div class="type-2">
        <div class="type-2-counts">
          {{
            t('batchOperation.type2Title', {
              count: state.openTable.length * state.tableData.length,
            })
          }}
        </div>
        <div class="type-2-handle">
          <el-button type="primary" :loading="state.loading" @click="handleAdd">
            {{ t('common.batchAdd') }}
          </el-button>
          <el-button plain :disabled="state.loading" @click="() => (state.type = 1)">
            {{ t('batchOperation.backType1') }}
          </el-button>
        </div>
        <div class="type-2-table-wrap">
          <CollapseTable
            :columns="columns"
            :table-data="state.tableData"
            :open-table="state.openTable"
            :custom-item-width="type2columns2Width"
            all-width
            auto
            open
            keyword="key"
          >
            <template #open_item="{ item, row }">
              <!-- 线路类型回显 -->
              <div v-if="item.prop === 'lineType'">
                {{ _matchRouteType(row.lineTypeId, state.lineTypes)?.lineName }}
              </div>
            </template>
          </CollapseTable>
        </div>
      </div>
    </template>
    <!-- 域名穿梭框 -->
    <!-- <DnsDomainTransfer v-model:dialog="state.transferDialog" :selected="state.domains" @confirm="transferConfirm" /> -->

    <CatDialog
      v-model:dialog="state.fileDialog"
      :width="500"
      class="file-dialog"
      :title="t('batchOperation.fileUpload')"
      no-cancel
      @confirm="() => (state.fileDialog = false)"
    >
      <el-form label-position="left" label-width="auto" class="eh-form">
        <el-form-item :label="t('batchOperation.importRecordResult')" class="l-1">
          {{ t('batchOperation.importRecordFail') }}
        </el-form-item>
        <el-form-item :label="t('batchOperation.importRecordReason')" class="l-2">
          {{ t('batchOperation.importRecordReasonV') }}
        </el-form-item>
      </el-form>
    </CatDialog>
    <ResultDialog
      v-model:dialog="state.resultDialog"
      :total="state.openTable.length * state.tableData.length"
      :job-id="state.jobId"
      :cancel-t="t('batchOperation.continueImportDomain')"
    />
  </div>
</template>

<script setup lang="ts">
import DnsDomainTransfer from '@/components/v2/dns/dns-domain-transfer/index.vue'
import { _explainAnalysisFile, _uploadAnalysisFile } from '@/apis/dns/analysis'
import { _batchAddAnalysis } from '@/apis/dns/batch'
import { _getAnalysisTypeList, _getCommonData, _getLineTypes } from '@/apis/dns/sys'
import CatDialog from '@/components/common/cat-dialog/index.vue'
import DnsUpload from '@/components/dns/dns-upload/index.vue'
import { columns } from './config'
import { _getDomainList } from '@/apis/dns/domain'
import { _formatRouteType, _matchRouteType } from '@/utils/dns-utils'
import t from '@/utils/i18n'
import { checkDomainsAllowsUser } from '../config'
import { useBaseStore } from '@/store'
import ResultDialog from '../result-dialog.vue'
import { type2columns2Width } from '../batch-operation-log/config'
import { message } from '@/utils/message'
const baseStore = useBaseStore()
const dns_domain_textarea = ref()
const state = reactive<{
  loading: boolean
  type: 1 | 2
  domains: string
  // transferDialog: boolean
  domainsError: string
  file: {
    file: any
    status: 'success' | 'failed' | '' | 'loading'
  }
  fileDialog: boolean
  objectId: string
  analysis: any[] // 解析列表
  tableData: any[] // type2 table数据
  openTable: any[]
  domainList: any[]
  lineTypes: any[]
  templates: any[] // 上传tip模版文字
  resultDialog: boolean
  jobId: string
}>({
  loading: false,
  type: 1,
  domains: '',
  // transferDialog: false,
  domainsError: '',
  file: {
    file: void 0,
    status: '',
  },
  fileDialog: false,
  objectId: '', // 上传文件成功后的文件id
  analysis: [],
  tableData: [],
  openTable: [],
  domainList: [],
  lineTypes: [],
  templates: [],
  resultDialog: false,
  jobId: '',
})
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
// 文件校验失败(大小和格式)
const uploadFailed = (file: any) => {
  console.log('失败', file)
  state.file.status = 'loading'
  state.file.file = file
  setTimeout(() => {
    state.file.status = 'failed'
    state.fileDialog = true
  }, 2000)
}
// 上传
const uploadSuccess = async (file: any) => {
  state.file.status = 'loading'
  state.file.file = file
  try {
    state.loading = true
    const formData = new FormData()
    formData.append('uploadFile', file)
    const { code, data } = await _uploadAnalysisFile(formData)
    state.loading = false
    if (code === 200) {
      state.file.status = 'success'
      state.objectId = data.objectId
    }
  } catch (error) {
    state.file.status = 'failed'
    state.loading = false
  }
}
// 清空
const uploadClear = () => {
  state.file = {
    file: void 0,
    status: '',
  }
}

// 最终的提交
const handleAdd = async () => {
  try {
    state.loading = true
    const domainList = state.domains.split('\n')
    // const defaultLine = state.lineTypes.find(item => item.isDefault)

    state.openTable.forEach(item => {
      item.value = item.recordValue
      // item.lineTypeId = item.lineTypeId || defaultLine?.lineId
    })
    const {
      code,
      data: { jobId },
    } = await _batchAddAnalysis({
      domainList,
      recordList: state.openTable,
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

// 下载模版
const downloadTemplate = (url: string) => {
  if (!url) {
    message.warning(t('common.noData'))
    return
  }
  window.open(url)
}

// 获取列表
const getData = async () => {
  const res = state.domains.length > 0
  if (!res) {
    state.domainsError = t('batchOperation.domainEmpty1')
    return
  } else {
    state.domainsError = ''
  }
  // 判断当前写入的域名是否是当前用户拥有的域名
  const { n } = checkDomainsAllowsUser(state.domains, state.domainList)
  if (n[0]) {
    message.error(t('batchOperation.cannotChange', { domains: n.join(',') }))
    return
  }
  try {
    state.loading = true
    const { code, data } = await _explainAnalysisFile({
      objectId: state.objectId,
    })
    state.loading = false
    if (code === 200) {
      state.tableData = state.domains.split('\n').map((item, index) => ({
        id: index,
        key: index,
        hostRecord: item,
      }))
      const defaultLine = state.lineTypes.find(item => item.isDefault)
      data.forEach(item => {
        const match = _matchRouteType(item.lineType, state.lineTypes, '', 'lineName')
        item.lineType = (match && match?.lineName) || defaultLine?.lineName
        item.lineTypeId = (match && match.lineTypeId) || defaultLine?.lineId
      })
      state.openTable = data
      console.log('返回的', state.openTable)

      state.type = 2
    }
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
    }
    state.loading = false
  } catch (error) {
    console.log('线路error', error)
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
    }
    state.loading = false
  } catch (error) {
    state.loading = false
  }
}

// 获取文件模版
const getFileTemplates = async () => {
  try {
    state.loading = true
    const { code, data } = await _getCommonData()
    if (code === 200) {
      state.templates = data.importTemplate || []
    }
    state.loading = false
  } catch (error) {
    state.loading = false
  }
}

onMounted(() => {
  getLineTypes()
  getDomainList()
  getAnalysisData()
  getFileTemplates()
})
</script>

<style scoped lang="scss">
.batch-import-reocrd {
  :deep(.the-form) {
    .el-form-item__label-wrap {
      height: 20px;

      .el-form-item__label {
        color: #999;
      }
    }
  }

  .import-content {
    position: relative;
    flex-shrink: 0;

    :deep(.dns-upload) {
      width: 380px;
      height: 158px;
    }
  }

  .import-textarea {
    display: flex;
  }

  .upload {
    display: flex;
    margin-top: 20px;
  }

  .import-btn {
    padding: 7px 16px !important;
    margin-top: 20px;
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

.file-dialog-content {
  .file-dialog-item {
    display: flex;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;

    & > div:first-child {
      flex-shrink: 0;
      color: #999;
    }

    & > div:last-child {
      color: #000;
    }
  }
}

.upload-tips {
  font-family: 'PingFang SC-Regular', 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #828b9c;

  & > div {
    display: flex;
    align-items: center;
    max-width: 720px;
    margin-bottom: 8px;
    line-height: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    &:first-child {
      margin-bottom: 12px;
    }
  }

  .t {
    position: relative;
    padding-left: 14px;

    &::before {
      position: absolute;
      top: 10px;
      left: 4px;
      display: inline-block;
      width: 2px;
      height: 2px;
      content: '';
      background-color: #555;
      border-radius: 50%;
    }
  }

  .el-link {
    margin-right: 12px;
    margin-left: 0;
    text-decoration: underline;
  }
}

:deep(.eh-form) {
  .l-1 {
    margin-bottom: 4px;
  }

  .l-2 {
    margin-bottom: 0;

    .el-form-item__label-wrap {
      height: 20px;
    }

    .el-form-item__content {
      line-height: 20px;
    }
  }
}
</style>

<style lang="scss"></style>
