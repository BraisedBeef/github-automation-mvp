<template>
  <div class="contacts pd20 bgcf">
    <div class="d-title df ac">
      <div class="mr20">
        {{ t('domain.list.detail.493846-0') }}
      </div>
      <el-link type="primary" @click="getContactsList">
        {{ t('domain.list.detail.493846-1') }}
      </el-link>
    </div>
    <el-form :model="form" label-width="auto" label-position="left" class="mt20">
      <el-form-item :label="t('domain.list.detail.493846-2')">
        {{ form.last_name }}
      </el-form-item>
      <el-form-item :label="t('domain.list.detail.493846-3')">
        {{ form.first_name }}
      </el-form-item>
      <el-form-item :label="t('domain.list.detail.493846-4')">
        {{ form.country }}
      </el-form-item>
      <el-form-item :label="t('domain.list.detail.493846-5')">
        {{ form.province }}
      </el-form-item>
      <el-form-item :label="t('domain.list.detail.493846-6')">
        {{ form.city }}
      </el-form-item>
      <el-form-item :label="t('domain.list.detail.493846-7')">
        {{ form.address }}
      </el-form-item>
      <el-form-item :label="t('domain.list.detail.493846-8')">
        {{ form.postal_code }}
      </el-form-item>
      <!-- <el-form-item :label="t('domain.list.detail.493846-9')">{{ form.email }}</el-form-item> -->
    </el-form>

    <CatDialog
      v-model:dialog="contacts.show"
      :loading="contacts.loading"
      :title="t('domain.list.detail.493846-10')"
      width="920px"
      :confirm-text="t('domain.list.detail.493846-11')"
      destroy-on-close
      @confirm="updateContacts"
    >
      <div class="dialog-head df">
        <el-button type="primary" @click="pushRoute('/domain/template/table')">
          {{ t('domain.list.detail.493846-12') }}
        </el-button>
        <el-input v-model="contacts.query" :placeholder="t('domain.list.detail.493846-13')" maxlength="256">
          <template #suffix>
            <SvgIcon name="dns-search" style="cursor: pointer" @click="getContactsList" />
          </template>
        </el-input>
      </div>
      <el-table v-loading="contacts.loading" :data="contacts.table" show-overflow-tooltip class="mt20">
        <el-table-column width="55px">
          <template #default="{ row }">
            <el-radio v-model="row.check" @click="clickHandle(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="t('domain.list.detail.493846-14')" />
        <el-table-column prop="remark" :label="t('domain.list.detail.493846-15')">
          <template #default="{ row }">
            <div style="width: 100px" @mouseover="row.edit = true" @mouseout="row.edit = false">
              <div v-if="!row.edit">
                {{ row.remark || '--' }}
              </div>
              <SvgIcon v-else name="cat-cdn-edit" class="icon-hover" @click="editRemark(row)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="first_name" :label="t('domain.list.detail.493846-16')">
          <template #default="{ row }">
            {{ row.first_name + ' ' + row.last_name }}
          </template>
        </el-table-column>
        <el-table-column prop="email" :label="t('domain.list.detail.493846-17')" />
        <el-table-column prop="phone" :label="t('domain.list.detail.493846-18')" />
      </el-table>
      <CatPagination
        v-model:pagination="contacts.pagination"
        :total="contacts.pagination.total"
        :custom-keys="['page', 'limit']"
        @change="getData"
      />
    </CatDialog>

    <CatDialog
      v-model:dialog="remark.show"
      :loading="remark.loading"
      title="remark"
      width="480px"
      :disabled="!remark.form.remark"
      destroy-on-close
      @confirm="updateRemark"
    >
      <el-form :model="remark.form">
        <el-form-item prop="remark">
          <el-input v-model="remark.form.remark" :placeholder="t('domain.list.detail.493846-19')" maxlength="200" />
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="tip.show"
      :loading="tip.loading"
      :title="t('domain.list.detail.493846-20')"
      width="550px"
      destroy-on-close
      @confirm="updateTemplate"
    >
      <div>{{ t('domain.list.detail.493846-21') }}</div>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import {
  _getDomainContacts,
  _getContactsTemplateList,
  _updateContactsTemplate,
  _updateDomainContacts,
} from '@/apis/domain'
import type { PageParams } from '@/views/domain/common'
import { ElMessage } from 'element-plus'
import t from '@/utils/i18n'
import { getSessionItemRaw } from '@/utils/storage'
import { pushRoute } from '@/utils/router-jump'

const router: any = useRouter()
const route: any = useRoute()

interface ContactsInfo {
  address: string
  city: string
  company: string
  country: string
  email: string
  fax: string
  first_name: string
  last_name: string
  phone: string
  postal_code: string
  province: string
}
const form = ref<ContactsInfo>({
  address: '',
  city: '',
  company: '',
  country: '',
  email: '',
  fax: '',
  first_name: '',
  last_name: '',
  phone: '',
  postal_code: '',
  province: '',
})
const getData = () => {
  const info = JSON.parse(getSessionItemRaw('domain_detail_info') || '{}')
  _getDomainContacts({ id: info.id }).then(res => {
    if (res.code === 20000) {
      if (res.data) {
        form.value = res.data
      }
    } else {
      ElMessage.error(t('domain.list.detail.493846-22'))
    }
  })
}
getData()

const remark = reactive<{
  show: boolean
  loading: boolean
  form: any
}>({
  show: false,
  loading: false,
  form: { remark: '', id: '' },
})
const editRemark = row => {
  remark.form = { ...row }
  remark.show = true
}
const updateRemark = () => {
  remark.loading = true
  _updateContactsTemplate(remark.form)
    .then(() => {
      getContactsList()
    })
    .finally(() => {
      remark.loading = false
      remark.show = false
    })
}

const contacts = reactive<{
  show: boolean
  query: string
  loading: boolean
  table: any[]
  pagination: PageParams
}>({
  show: false,
  query: '',
  loading: false,
  table: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})
const getContactsList = () => {
  contacts.show = true
  contacts.loading = true
  _getContactsTemplateList({ key: contacts.query.trim(), ...contacts.pagination })
    .then(res => {
      contacts.table = res.data.list.map(v => ({ ...v, check: false }))
      contacts.pagination.total = res.data.total
    })
    .finally(() => {
      contacts.loading = false
    })
}
const clickHandle = row => {
  contacts.table.forEach(v => {
    if (v.id === row.id) {
      v.check = true
    } else {
      v.check = false
    }
  })
}
const updateContacts = () => {
  if (!contacts.table.some(v => v.check === '')) {
    ElMessage.error(t('domain.list.detail.493846-23'))
    return
  }
  if (JSON.parse(sessionStorage.domain_detail_info).privacy === 1) {
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
  contacts.loading = true
  tip.loading = true
  _updateDomainContacts({
    ids: [+route.query.id],
    contact_temp_id: contacts.table.find(v => v.check === '').id,
    privacy: 2,
  })
    .then(() => {
      getData()
    })
    .finally(() => {
      contacts.loading = false
      contacts.show = false
      tip.loading = false
      tip.show = false
      contacts.table = []
    })
}
</script>

<style lang="scss" scoped>
@import '@/views/domain/config';

.dialog-head {
  .el-input {
    width: 360px;
    margin-left: auto;
  }
}
</style>
