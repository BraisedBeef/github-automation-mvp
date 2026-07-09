<template>
  <div class="batch-delete-domain">
    <div class="e-tip">
      <SvgIcon name="tip-error" />
      {{ t('batchOperation.deleteDomainError') }}
    </div>
    <el-form label-position="left" label-width="auto" class="the-form">
      <el-form-item :label="t('batchOperation.selectDomain')" class="first">
        <div class="textarea-wrap">
          <!-- <DnsDomainTextarea :placeholder="t('batchOperation.deleteDomainPlaceholder')" v-model:domains="state.domains"
            ref="dns_domain_textarea" :disabled="true">
            <template #errors>
              <el-button plain @click="chooseWithList" class="select-btn">
                {{ t('batchOperation.selectFromList') }}
              </el-button>
            </template>
          </DnsDomainTextarea> -->
          <DnsDomainTransfer :error="state.domainsError" :selected="state.domains" @confirm="transferConfirm" />
        </div>
      </el-form-item>
      <el-form-item label=" " class="btn">
        <el-button
          class="delete-btn"
          type="primary"
          :disabled="!state.domains"
          :loading="state.loading"
          @click="handleDelete"
        >
          {{ t('batchOperation.deleteDomainConfirm') }}
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 域名穿梭框 -->
    <!-- <DnsDomainTransfer v-model:dialog="state.transferDialog" :selected="state.domains" @confirm="transferConfirm" /> -->
    <ResultDialog
      v-model:dialog="state.resultDialog"
      :total="state.domains.split('\n').length"
      :job-id="state.jobId"
      :cancel-t="t('batchOperation.continueDeleteDoamin')"
    />
  </div>
</template>

<script setup lang="ts">
import { _batchDelete } from '@/apis/dns/batch'
import { _getDomainList } from '@/apis/dns/domain'
import t from '@/utils/i18n'
import { checkDomainsAllowsUser } from '../config'
import ResultDialog from '../result-dialog.vue'
import { useBaseStore } from '@/store'
import { message } from '@/utils/message'
const baseStore = useBaseStore()
// const dns_domain_textarea = ref()
const state = reactive<{
  loading: boolean
  domains: string
  // transferDialog: boolean
  domainsError: string
  domainList: any[]
  resultDialog: boolean
  jobId: string
}>({
  loading: false,
  domains: '',
  // transferDialog: false, // 控制穿梭框显示隐藏
  domainsError: '',
  domainList: [],
  resultDialog: false,
  jobId: '',
})
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
  if (state.domains.length) {
    state.domainsError = ''
  } else {
    state.domainsError = t('batchOperation.domainEmpty1')
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

const handleDelete = async () => {
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
    const domainIdList: number[] = []
    state.domainList.forEach(item => {
      if (domains.includes(item.domain)) {
        domainIdList.push(item.domainId)
      }
    })
    const {
      code,
      data: { jobId },
    } = await _batchDelete({
      domainIdList,
    })
    state.loading = false
    if (code === 200) {
      state.jobId = jobId
      state.resultDialog = true
    }
  } catch (error) {
    console.log('删除', error)
    state.loading = false
  }
}

onMounted(() => {
  getDomainList()
})
</script>

<style scoped lang="scss">
.batch-delete-domain {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: auto;

  .e-tip {
    padding: 7px 12px;
    margin-bottom: 20px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--error-color);
    background-color: #ffe8e8;
    border-radius: 4px;

    svg {
      width: 16px;
      height: 16px;
      margin-top: -2px;
    }
  }

  .type-1-label {
    flex-shrink: 0;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .type-1-content {
    flex: 1;
    flex-shrink: 0;
  }

  .type-1-textarea {
    display: flex;
    margin-bottom: 20px;
  }

  .error-tip {
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--error-color);
  }

  :deep(.delete-btn) {
    padding: 7px 16px !important;
  }
}

:deep(.the-form) {
  .el-form-item__label-wrap {
    height: 20px;

    .el-form-item__label {
      color: #999;
    }
  }

  .first {
    margin-bottom: 30px;
  }

  .err-tip {
    margin-top: -12px;
    margin-bottom: 40px;
  }

  .btn {
    margin-top: 20px;
  }
}

.textarea-wrap {
  display: flex;
  width: 100%;

  .select-btn {
    margin-top: 4px;
  }
}
</style>
