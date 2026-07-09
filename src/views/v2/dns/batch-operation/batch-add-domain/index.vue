<template>
  <div class="batch-add-domain">
    <template v-if="state.type === 1">
      <div class="type-1-handle">
        <el-form label-position="left" label-width="auto" class="the-form">
          <el-form-item :label="t('common.addDomains')">
            <div class="type-1-handle-content">
              <DnsDomainTextarea
                ref="dns_domain_textarea"
                v-model:domains="state.domains"
                :placeholder="t('batchOperation.addDomainPlaceholder')"
              />
              <el-checkbox
                v-model="state.meanwhile"
                :label="t('batchOperation.addValueLable')"
                style="margin-top: 14px"
                @change="handleMeanwhileChange"
              />
              <el-input
                v-show="state.meanwhile"
                v-model.trim="state.IPv4"
                class="IPv4"
                type="text"
                :placeholder="t('batchOperation.addValuePlaceholder')"
                @blur="IPv4Validate"
              />
              <div v-show="state.isIPv4Error" class="ipv4 error-msg">
                {{ t('batchOperation.addValueEmpty') }}
              </div>
            </div>
          </el-form-item>
          <el-form-item label=" ">
            <el-button type="primary" class="type-1-btn" @click="handleAdd">
              {{ t('common.batchAdd') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </template>
    <!-- 添加完后显示列表 -->
    <template v-else>
      <div class="type-2">
        <div class="type-2-counts">
          <!-- 如果选择了添加记录值 就用记录值的数量 否则就用域名的数量 -->
          {{
            t('batchOperation.type2Title', {
              count: state.domainsList.length * (state.tableData.length || 1),
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
            :columns="columns"
            :table-data="state.domainsList"
            :open-table="state.tableData"
            all-width
            :custom-item-width="type2columns2Width"
            open
            auto
          />
        </div>
      </div>
    </template>

    <ResultDialog
      v-model:dialog="state.resultDialog"
      :total="state.domainsList.length * (state.tableData.length || 1)"
      :job-id="state.jobId"
      :cancel-t="t('batchOperation.continueAddDomain')"
      @update:dialog="updateCallback"
    />
  </div>
</template>

<script setup lang="ts">
import DnsDomainTextarea from '@/components/dns/dns-domain-textarea/index.vue'
import { columns } from './config'
import { _batchAddDomain } from '@/apis/dns/batch'
import t from '@/utils/i18n'
import { _matchRouteType } from '@/utils/dns-utils'
import { _getAnalysisTypeList } from '@/apis/dns/sys'
import { useBaseStore } from '@/store'
import ResultDialog from '../result-dialog.vue'
import { type2columns2Width } from '../batch-operation-log/config'
import { IPv4_REG } from '@/utils/reg'
const baseStore = useBaseStore()
const state = reactive<{
  loading: boolean
  type: 1 | 2 // 添加中 or 添加后开始显示列表
  domains: string
  meanwhile: boolean
  IPv4: string
  isIPv4Error: boolean
  domainsList: any[]
  tableData: any[]
  resultDialog: boolean
  jobId: string
}>({
  loading: false,
  type: 1,
  domains: '', // 填写的域名
  meanwhile: false,
  IPv4: '',
  isIPv4Error: false, // IPv4校验失败
  domainsList: [], // 生成的域名列表
  tableData: [],
  resultDialog: false,
  jobId: '',
})
const dns_domain_textarea = ref()

/***************************  type1 methods ****************************************/
// IPv4校验
const IPv4Validate = () => {
  state.isIPv4Error = !state.IPv4
  if (!state.IPv4 || !IPv4_REG.test(state.IPv4)) {
    state.isIPv4Error = true
  } else {
    state.isIPv4Error = false
  }
}
// 添加
const handleAdd = () => {
  state.isIPv4Error = false
  // 获取textarea校验结果
  const validateRes = dns_domain_textarea.value?.getValidateValue()
  console.log('validateRes', validateRes)

  // 如果选择了同时添加@和A但是没有填写IPv4地址
  if (state.meanwhile && !state.IPv4) {
    state.isIPv4Error = true
  }
  // 如果IPv4的格式错误
  if (state.meanwhile && !IPv4_REG.test(state.IPv4)) {
    state.isIPv4Error = true
  }
  if (validateRes && !state.isIPv4Error) {
    // 校验通过,获取域名数组,生成域名列表
    const domains = dns_domain_textarea.value?.getDomains()
    state.domainsList = domains.map((domain: string, i: number) => ({
      key: i,
      host: domain,
      id: i,
      disabled: !state.meanwhile,
    }))
    state.tableData = []
    if (state.meanwhile) {
      for (let i = 0; i < 2; i++) {
        state.tableData.push({
          key: i,
          host: i ? '@' : 'www',
          record_type: 'A',
          route_type: t('common.default'),
          record_value: state.IPv4,
          weight: '-',
          mx: '-',
          TTL: '600',
        })
      }
    }
    state.type = 2
  } else {
    console.log('校验失败', validateRes)
  }
}

const handleMeanwhileChange = () => {
  state.IPv4 = ''
  state.isIPv4Error = false
}

// 批量添加
const batchAdd = async () => {
  try {
    state.loading = true
    const _data = {
      domainList: state.domainsList.map(item => item.host),
      recordValue: state.IPv4 || '',
    }
    const {
      code,
      data: { jobId },
    } = await _batchAddDomain(_data)
    state.loading = false
    if (code === 200) {
      state.jobId = jobId
      state.resultDialog = true
    }
  } catch (error) {
    state.loading = false
  }
}

const updateCallback = () => {
  state.type = 1
  state.domains = ''
  state.domainsList = []
  state.meanwhile = false
  state.IPv4 = ''
}
/************************** type2 methods end **************************************/
</script>

<style scoped lang="scss">
.batch-add-domain {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow: auto;

  & > div {
    flex-shrink: 0;
    width: 100%;
  }

  .type-1-handle {
    :deep(.the-form) {
      .el-form-item__label-wrap {
        height: 20px;
      }

      .el-form-item__label {
        color: #999;
      }

      .IPv4 {
        display: block;

        .el-input__wrapper {
          width: 360px;
        }
      }
    }

    .type-1-handle-content {
      position: relative;
      flex: 1;
      flex-shrink: 0;

      .error-msg {
        font-family: 'PingFang SC-Regular', 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: var(--error-color);

        &.ipv4 {
          margin-top: 4px;
          font-size: 12px;
        }
      }

      :deep(.IPv4) {
        width: 360px;
        margin-top: 14px;
      }
    }
  }

  .type-1-btn {
    padding: 7px 24px !important;
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
</style>
