<template>
  <div class="batch-export-record">
    <el-form label-position="left" label-width="auto" class="the-form">
      <el-form-item :label="t('batchOperation.selectDomain')" class="first" style="margin-bottom: 30px">
        <div class="textarea-wrap">
          <!-- <DnsDomainTextarea :placeholder="t('batchOperation.exportRecordPlaceholder')" v-model:domains="state.domains"
            ref="dns_domain_textarea" :disabled="true">
            <template #errors>
              <el-button plain @click="chooseWithList" class="select-btn">
                {{ t('batchOperation.selectFromList') }}
              </el-button>
            </template>
          </DnsDomainTextarea> -->
          <DnsDomainTransfer
            need-id
            :selected="state.domains"
            :error="state.domainsError"
            @confirm="transferConfirm"
            @confirm-ids="(ids: number[]) => (state.domainIds = ids)"
          />
        </div>
      </el-form-item>
      <el-form-item :label="t('batchOperation.exportRecordLabel')" class="ex">
        <div class="export-content">
          <el-radio-group v-model="state.typeActive">
            <el-radio label="xlsx"> XLS </el-radio>
            <el-radio label="txt"> TXT </el-radio>
            <el-radio label="zone"> ZONE </el-radio>
          </el-radio-group>
        </div>
      </el-form-item>
    </el-form>
    <div class="action-footer">
      <el-button
        type="primary"
        class="type-1-btn"
        :loading="state.exportLoading"
        :disabled="!state.domains"
        @click="handleExport"
      >
        {{ t('batchOperation.exportFile') }}
      </el-button>
    </div>
    <!-- <DnsDomainTransfer need-id v-model:dialog="state.transferDialog" :selected="state.domains" @confirm="transferConfirm"
      @confirm-ids="(ids: number[]) => (state.domainIds = ids)" /> -->
    <FeedbackDialog v-model:dialog="state.feedbackDialog" :success="state.success" :error-msg="state.errorMsg" />
  </div>
</template>

<script setup lang="ts">
import DnsDomainTransfer from '@/components/v2/dns/dns-domain-transfer/index.vue'
import FeedbackDialog from './feedback-dialog.vue'
import DnsDomainTextarea from '@/components/dns/dns-domain-textarea/index.vue'
import { _batchExport } from '@/apis/dns/batch'
import { _getDomainList } from '@/apis/dns/domain'
import t from '@/utils/i18n'
import { checkDomainsAllowsUser } from '../config'
import { useBaseStore } from '@/store'
import { message } from '@/utils/message'
const baseStore = useBaseStore()
const route = useRoute()
const state = reactive<{
  domains: string
  domainIds: number[]
  domainList: any[]
  // transferDialog: boolean
  domainsError: string
  typeActive: any
  feedbackDialog: boolean
  success: boolean
  exportLoading: boolean
  errorMsg: string
}>({
  domains: '',
  domainIds: [],
  domainList: [],
  // transferDialog: false,
  domainsError: '',
  typeActive: 'xlsx',
  feedbackDialog: false,
  success: true, // 导出结果
  exportLoading: false,
  errorMsg: '',
})
// const dns_domain_textarea = ref()
// 从域名列表中选择
// const chooseWithList = () => {
//   state.transferDialog = true
// }
const transferConfirm = (domains: string) => {
  // state.domains = ''
  // if (state.domains[0]) {
  //   state.domains = state.domains + '\n' + domains
  // } else {
  //   state.domains += domains
  // }
  // state.domains = Array.from(new Set(state.domains.split('\n'))).join('\n')
  state.domains = domains
  console.log('state.domains===>', state.domains)
  if (state.domains.length) {
    state.domainsError = ''
  } else {
    state.domainsError = t('batchOperation.domainEmpty1')
  }
}

const handleExport = async () => {
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
    state.exportLoading = true
    const { code, msg } = await _batchExport({
      domainIdList: state.domainIds,
      format: state.typeActive,
    })
    state.exportLoading = false
    state.success = code === 200
    state.errorMsg = msg
    state.feedbackDialog = true
  } catch (error) {
    state.exportLoading = false
  }
}

// 获取域名列表
const getDomainList = async () => {
  try {
    const { code, data } = await _getDomainList({
      page: 1,
      pageSize: 999,
    })
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
    state.domainList = []
  }
}

onMounted(async () => {
  const { exportIds } = route.query
  if (exportIds) {
    await getDomainList()
    const domain = state.domainList.find(item => item.id === Number(exportIds))
    state.domains = domain.domain
    state.domainIds = [domain.id]
  } else {
    getDomainList()
  }
})
</script>

<style scoped lang="scss">
.batch-export-record {
  .type-1-label {
    flex-shrink: 0;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .export-content {
    position: relative;
    flex: 1;
    flex-shrink: 0;
  }

  .export-textarea {
    display: flex;
    margin-bottom: 20px;
  }

  .export-type {
    display: flex;
  }

  .type-1-btn {
    padding: 7px 16px !important;
  }

  .action-footer {
    display: flex;
    align-items: center;
    padding: 20px 0 0;
    margin-top: 28px;
    background-color: #fff;
    border-top: 1px solid #e8ecf3;
  }
}

:deep(.the-form) {
  .el-form-item__label-wrap {
    .el-form-item__label {
      color: #999;
    }
  }

  .first {
    margin-bottom: 14px;

    .el-form-item__label-wrap {
      height: 20px;
    }
  }

  .err-tip {
    margin-top: -16px;
  }

  .ex {
    margin-bottom: 18px;
  }

  .btn {
    margin-top: 22px;
  }
}
</style>
