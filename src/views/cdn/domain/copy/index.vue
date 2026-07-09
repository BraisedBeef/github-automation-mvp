<template>
  <div class="domain-copy page-box">
    <div class="head">
      {{ t('copyConfigTitle', { domain: route.query.domain }) }}
    </div>

    <CatTip class="mt10">
      <span class="dif mr4">{{ t('importantTip') }}</span
      ><span>{{ t('copyConfigTip') }}</span>
    </CatTip>

    <el-form ref="domainDom" :model="form" label-width="auto" class="mt20">
      <el-form-item
        v-for="(v, i) in form.domain"
        :key="'v' + i"
        :label="i > 0 ? ' ' : t('acceleratedDomain')"
        prop="domain"
        :rules="{
          validator: () => tableColumnNotRepeat(form.domain, v, 'domain', i) && validDomain(v.domain),
          message: tableColumnNotRepeat(form.domain, v, 'domain', i)
            ? t('inputDomainPlaceholder')
            : t('domainRepeatPleaseRewrite'),
          trigger: 'change',
        }"
        :validate-status="v.validType"
      >
        <div>
          <el-input v-model="v.domain" style="width: 360px" @input="inputHandle(v, i)" />
          <el-link v-if="i > 0" class="ml10" type="primary" @click="form.domain.splice(i, 1)">
            {{ t('delete') }}
          </el-link>
          <SvgIcon
            v-show="v.validType === 'success'"
            name="cat-cdn-success"
            style="color: var(--success-color)"
            class="ml10"
          />
          <SvgIcon
            v-show="v.validType === 'error'"
            name="cat-cdn-warning"
            style="color: var(--error-color)"
            class="ml10"
          />
        </div>
      </el-form-item>
      <el-form-item label=" ">
        <el-button plain :disabled="!form.domain.every(v => v.validType === 'success')" @click="addConfig">
          {{ t('add') }}
        </el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <el-button type="primary" @click="sureCopy">
      {{ t('sureCopy') }}
    </el-button>

    <CatDialog
      v-model:dialog="dialog.show1"
      width="580px"
      :title="t('copyConfigToNewTip')"
      :confirm-text="t('confirmCopy')"
      destroy-on-close
      @confirm="sure"
    >
      <div>{{ t('copyConfigInfo') }}</div>
    </CatDialog>

    <CatDialog v-model:dialog="dialog.show2" title="copyConfig" width="580px" destroy-on-close>
      <el-progress :stroke-width="10" :percentage="(dialog.length / form.domain.length) * 100" :show-text="false" />
      <div class="mt10">
        <span class="mr4">{{ t('copyingConfig') }}</span>
        <el-text type="primary"> {{ dialog.length }}/{{ form.domain.length }} </el-text>
      </div>
      <el-table :data="dialog.list" class="mt20 mb20">
        <el-table-column :label="t('domain')" prop="domain" />
        <el-table-column :label="t('status')">
          <template #default="{ row }">
            <el-text :type="row.status ? 'success' : 'danger'">
              {{ t('copy') }}{{ row.status ? t('success') : t('fail') }}
            </el-text>
          </template>
        </el-table-column>
      </el-table>
      <div>{{ t('domainCopyTip') }}</div>
      <template #footer>
        <div class="cat-dialog-footer">
          <el-button class="mr20" type="primary" @click="backRoute()">
            {{ t('backDomainManage') }}
          </el-button>
          <el-button @click="continueAdd">
            {{ t('continueAdd') }}
          </el-button>
        </div>
      </template>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { _domainValidation, _copyDomainConfig } from '@/apis/cdn/domain'
import { tableColumnNotRepeat, validDomain, showErrorTip } from '@/views/cdn/domain/index-domain'

import type { FormInstance } from 'element-plus/es'
import { backRoute } from '@/utils/router-jump'

const route = useRoute()
const router = useRouter()

interface DomainItem {
  domain: string
  validType: 'success' | 'error' | 'validating'
  loading: boolean
  errorType: number
  timer: any
}
const form = reactive<{
  domain: DomainItem[]
  item: DomainItem
}>({
  domain: [{ domain: '', validType: 'validating', loading: false, errorType: 0, timer: null }],
  item: {
    domain: '',
    validType: 'validating',
    loading: false,
    errorType: 0,
    timer: null,
  },
})
const inputHandle = (v, i) => {
  const valid = tableColumnNotRepeat(form.domain, v, 'domain', i) && validDomain(v.domain)
  if (valid) {
    v.validType = 'success'
  } else {
    v.validType = 'error'
  }
}

const addConfig = () => {
  form.domain.push({ ...form.item })
}

const dialog = reactive<{
  show1: boolean
  show2: boolean
  length: number
  list: { domain: string; status: boolean }[]
}>({
  show1: false,
  show2: false,
  length: 0,
  list: [],
})

const domainDom = ref<FormInstance | null>(null)
const sureCopy = async () => {
  const valid = await domainDom.value?.validate(b => b)
  if (!valid) return
  dialog.show1 = true
}

const sure = async () => {
  dialog.length = 0
  dialog.list = []
  dialog.show1 = false
  dialog.show2 = true
  for (let i = 0; i < form.domain.length; i++) {
    _copyDomainConfig({ from: +route.query.id!, domain: form.domain[i].domain })
      .then(() => {
        dialog.list.push({ domain: form.domain[i].domain, status: true })
      })
      .catch(error => {
        dialog.list.push({ domain: form.domain[i].domain, status: false })
        showErrorTip(error.response.data.msg)
      })
      .finally(() => {
        dialog.length++
      })
  }
}

const continueAdd = () => {
  dialog.show2 = false
  form.domain = [{ ...form.item }]
  nextTick(() => {
    domainDom.value!.clearValidate()
  })
}
</script>

<style lang="scss" scoped>
@import '../index-domain';

:deep(.el-form .el-form-item .el-form-item__content) {
  display: block;
}

.ml10 {
  margin-left: 10px;
}
</style>
