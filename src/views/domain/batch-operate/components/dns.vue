<template>
  <div class="dns bgcf pd20">
    <div class="d-title">
      {{ t('domain.batch-operate.819752-0') }}
    </div>
    <DomainChoose ref="domainRef" v-model="domain" />

    <div class="d-title">
      {{ t('domain.batch-operate.819752-1') }}
    </div>

    <el-form :model="form" label-position="left" label-width="auto" class="mt20">
      <el-form-item :label="t('domain.batch-operate.819752-2')">
        <CatRadioGroup v-model="form.type" :list="dnsTypeList" />
      </el-form-item>
      <el-form-item v-if="form.type === 0" label="&nbsp;">
        <div>
          <div v-for="servers in name_servers" :key="servers" class="mt10">
            {{ t('domain.batch-operate.819752-3', { servers }) }}
          </div>
        </div>
      </el-form-item>
      <el-form-item v-if="form.type === 1" label="&nbsp;">
        <el-form ref="dnsListRef" :model="dnsList" label-position="left" label-width="auto">
          <el-form-item
            v-for="(dns1, dnsi1) in dnsList"
            :key="'dns1' + dnsi1"
            prop="value"
            :label="'DNS' + (dnsi1 + 1)"
            :rules="{
              validator: () => checkOrdinaryDomain(dns1.value),
              trigger: 'change',
              message: dns1.value ? t('domain.batch-operate.819752-4') : '',
            }"
            class="mb10"
          >
            <el-input v-model="dns1.value" style="width: 400px" />
            <el-link v-if="dnsi1 > 1" type="primary" class="ml10" @click="dnsList.splice(dnsi1, 1)">
              {{ t('domain.batch-operate.819752-5') }}
            </el-link>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item v-if="form.type === 1" label="&nbsp;">
        <el-link type="primary" @click="addDNS">
          {{ t('domain.batch-operate.819752-6') }}
        </el-link>
      </el-form-item>
    </el-form>

    <div class="border-btn">
      <el-button type="primary" :loading="sendLoading" @click="send">
        {{ t('domain.batch-operate.819752-7') }}
      </el-button>
    </div>

    <CatDialog
      v-model:dialog="verify.show"
      :disabled="verify.table.length === 0"
      :loading="verify.loading"
      :title="t('domain.batch-operate.819752-8')"
      width="900px"
      destroy-on-close
      @confirm="verifyHandle"
    >
      <div style="font-size: 16px; color: var(--common-text)">
        {{ t('domain.batch-operate.819752-9') }}
      </div>
      <CatCdnTable :data="verify.table" class="mt20" :show-overflow-tooltip="true">
        <el-table-column prop="domain" :label="t('domain.batch-operate.819752-10')" />
        <el-table-column :label="t('domain.batch-operate.819752-11')">
          <template #default="{ row }">
            <span v-show="row.is_owner === 1">{{ dnsList.map(v => v.value).join(';') }}</span>
            <el-text v-show="row.is_owner === 2" type="danger">
              {{ t('domain.batch-operate.819752-12') }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="domain" :label="t('domain.batch-operate.819752-13')">
          <template #default="{ $index }">
            <el-link type="primary" @click="verify.table.splice($index, 1)">
              {{ t('domain.batch-operate.819752-14') }}
            </el-link>
          </template>
        </el-table-column>
      </CatCdnTable>
      <div class="mt20" style="font-weight: 700">
        {{ t('domain.batch-operate.819752-15') }}
      </div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import DomainChoose from './domain-choose.vue'
import { dnsTypeList } from '@/views/domain/config'
import { _getDomainList, _updateDns, _domainOwnership } from '@/apis/domain'
import { checkOrdinaryDomain } from '@/views/cdn/domain/index-domain'
import { ElMessage } from 'element-plus'
import t from '@/utils/i18n'
import { _getItem } from '@/utils/storage'
import { DOMAIN_DICT } from '@/config/constant-config'

const domain = ref('')
const domainRef = ref<any>(null)

const form = reactive({ type: 1 })

const name_servers = ref<string[]>([])
onMounted(() => {
  name_servers.value = _getItem(DOMAIN_DICT)?.name_servers || []
})

const dnsList = ref<{ value: string }[]>([{ value: '' }, { value: '' }])
const dnsListRef = ref<any>(null)
const addDNS = () => {
  if (dnsList.value.length === 13) {
    ElMessage.error(t('domain.batch-operate.819752-16'))
    return
  }
  dnsList.value.push({ value: '' })
}
watchEffect(() => {
  if (form.type === 0) {
    dnsList.value = name_servers.value.map(v => ({ value: v }))
  } else {
    dnsList.value = [{ value: '' }, { value: '' }]
  }
})

const sendLoading = ref(false)
const send = async () => {
  if (!(await domainRef.value.domainRef.validate(b => b))) return
  if (form.type === 1) {
    if (!(await dnsListRef.value.validate(b => b))) return
  }
  _domainOwnership({ domains: domain.value.trim().split('\n') }).then(res => {
    verify.table = res.data.list
    verify.show = true
  })
}

const verify = reactive<{
  show: boolean
  loading: boolean
  table: any[]
}>({
  show: false,
  loading: false,
  table: [],
})
const verifyHandle = () => {
  if (!verify.table.every(v => v.is_owner === 1)) {
    ElMessage.error(t('domain.batch-operate.819752-17'))
    return
  }
  const params = {
    ids: verify.table.map(v => v.id),
  }
  dnsList.value.forEach((v, i) => {
    params['ns' + (i + 1)] = v.value
  })
  verify.loading = true
  _updateDns(params)
    .then(() => {
      ElMessage.success(t('domain.batch-operate.819752-18'))
    })
    .finally(() => {
      verify.show = false
      verify.loading = false
      verify.table = []
      domain.value = ''
      dnsList.value = [{ value: '' }, { value: '' }]
      domainRef.value.domainRef.resetFields()
      dnsListRef.value.resetFields()
    })
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';
</style>
