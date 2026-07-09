<template>
  <div class="info bgcf pd20">
    <div class="d-title">
      {{ t('domain.batch-operate.332643-0') }}
    </div>
    <CatTip class="mt20" type="danger">
      {{ t('domain.batch-operate.332643-1') }}
    </CatTip>
    <DomainChoose ref="domainRef" v-model="domain" exclude />

    <div class="d-title">
      {{ t('domain.batch-operate.332643-2') }}
    </div>
    <CatTip class="mt20" type="danger">
      {{ t('domain.batch-operate.332643-3') }}
    </CatTip>
    <el-table :data="tempalte.table" show-overflow-tooltip class="mt20">
      <el-table-column width="60">
        <template #default="{ row }">
          <el-radio v-model="row.check" @click="clickHandle(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="name" :label="t('domain.batch-operate.332643-4')">
        <template #default="{ row }">
          {{ row.name || '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" :label="t('domain.batch-operate.332643-5')">
        <template #default="{ row }">
          {{ row.remark || '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="name" :label="t('domain.batch-operate.332643-6')">
        <template #default="{ row }">
          {{ row.last_name + ' ' + row.first_name }}
        </template>
      </el-table-column>
      <el-table-column prop="email" :label="t('domain.batch-operate.332643-7')" />
      <el-table-column prop="phone" :label="t('domain.batch-operate.332643-8')" />
    </el-table>
    <CatPagination
      v-model:pagination="tempalte.pagination"
      :total="tempalte.pagination.total"
      :custom-keys="['page', 'limit']"
      @change="getContactsTemplateList"
    />

    <div class="d-title">
      {{ t('domain.batch-operate.332643-9') }}
    </div>
    <div class="mt20 mb10 df ac">
      <el-checkbox v-model="privacy" :true-label="1" :false-label="2">
        {{ t('domain.batch-operate.332643-10') }}
      </el-checkbox>
      <el-tooltip effect="light" popper-class="max-400" :content="t('domain.batch-operate.332643-11')" placement="top">
        <SvgIcon name="cat-cdn-warning" class="ml10" />
      </el-tooltip>
    </div>
    <el-text type="info">
      {{ t('domain.batch-operate.332643-12') }}
    </el-text>
    <div class="border-btn">
      <el-button type="primary" @click="send">
        {{ t('domain.batch-operate.332643-13') }}
      </el-button>
    </div>

    <CatDialog
      v-model:dialog="verify.show"
      :loading="verify.loading"
      :title="t('domain.batch-operate.332643-14')"
      width="900px"
      destroy-on-close
      @confirm="verifyHandle"
    >
      <div style="font-size: 16px; color: var(--common-text)">
        {{ t('domain.batch-operate.332643-15') }}
      </div>
      <CatCdnTable :data="verify.table" class="mt20" :show-overflow-tooltip="true">
        <el-table-column prop="domain" :label="t('domain.batch-operate.332643-16')" />
        <el-table-column prop="contact_template_name" :label="t('domain.batch-operate.332643-17')">
          <template #default="{ row }">
            <span v-show="row.is_owner === 1">{{ row.contact_template_name || '--' }}</span>
            <el-text v-show="row.is_owner === 2" type="danger">
              {{ t('domain.batch-operate.332643-18') }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column :label="t('domain.batch-operate.332643-19')">
          <template #default="{ row }">
            <span v-show="row.is_owner === 1"> {{ tempalte.table.find(v => v.check === '')?.name || '--' }}</span>
            <el-text v-show="row.is_owner === 2" type="danger">
              {{ t('domain.batch-operate.332643-18') }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column :label="t('domain.batch-operate.332643-10')">
          <template #default="{ row }">
            <span v-show="row.is_owner === 1">{{
              privacy === 1 ? t('domain.batch-operate.332643-20') : t('domain.batch-operate.332643-21')
            }}</span>
            <el-text v-show="row.is_owner === 2" type="danger">
              {{ t('domain.batch-operate.332643-18') }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="domain" :label="t('domain.batch-operate.332643-22')">
          <template #default="{ $index }">
            <el-link type="primary" @click="verify.table.splice($index, 1)">
              {{ t('domain.batch-operate.332643-23') }}
            </el-link>
          </template>
        </el-table-column>
      </CatCdnTable>
      <div class="mt20" style="font-weight: 700">
        {{ t('domain.batch-operate.332643-24') }}
      </div>
    </CatDialog>

    <CatDialog
      v-model:dialog="tip.show"
      :loading="tip.loading"
      :title="t('domain.batch-operate.332643-25')"
      width="550px"
      destroy-on-close
      @confirm="updateTemplate"
    >
      {{ t('domain.batch-operate.332643-26') }}
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import DomainChoose from './domain-choose.vue'
import { _getDomainList, _domainOwnership, _getContactsTemplateList, _updateDomainContacts } from '@/apis/domain'
import type { PageParams } from '@/views/domain/common'
import { ElMessage } from 'element-plus'
import t from '@/utils/i18n'

const domain = ref('')
const domainRef = ref<any>(null)
const tempalte = reactive<{
  loading: boolean
  table: any[]
  pagination: PageParams
}>({
  loading: false,
  table: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})
const clickHandle = row => {
  tempalte.table.forEach(v => {
    if (v.id === row.id) {
      v.check = true
    } else {
      v.check = false
    }
  })
}
const getContactsTemplateList = () => {
  const { total, ...rest } = tempalte.pagination
  _getContactsTemplateList(rest as any).then(res => {
    tempalte.table = res.data.list.map(v => ({ ...v, check: false }))
    tempalte.pagination.total = res.data.total
  })
}
getContactsTemplateList()

const privacy = ref(1)

const send = async () => {
  if (!(await domainRef.value.domainRef.validate(b => b))) return
  if (!tempalte.table.some(v => v.check === '')) {
    ElMessage.error(t('domain.batch-operate.332643-27'))
    return
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
    ElMessage.error(t('domain.batch-operate.332643-28'))
    return
  }
  if (verify.table.some(v => v.privacy === 1)) {
    tip.show = true
    return
  }
  updateTemplate()
}

const tip = reactive({
  show: false,
  loading: false,
})
const updateTemplate = () => {
  verify.loading = true
  tip.loading = true
  _updateDomainContacts({
    ids: verify.table.map(v => v.id),
    contact_temp_id: tempalte.table.find(v => v.check === '').id,
    privacy: privacy.value,
  }).finally(() => {
    verify.loading = false
    verify.show = false
    tip.loading = false
    tip.show = false
    verify.table = []
  })
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';
</style>
