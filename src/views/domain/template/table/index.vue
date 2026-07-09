<template>
  <div class="domain-template bgcf pd20">
    <div class="table-head df">
      <el-button type="primary" @click="pushRoute({ path: '/domain/template/detail' })">
        {{ t('domain.template.table.933620-0') }}
      </el-button>
      <el-input
        v-model="template.query"
        clearable
        :placeholder="t('domain.template.table.933620-1')"
        maxlength="75"
        style="width: 300px; margin-left: auto"
        @clear="getData"
        @keyup.enter="getData"
      >
        <template #suffix>
          <SvgIcon name="dns-search" style="cursor: pointer" @click="getData" />
        </template>
      </el-input>
    </div>

    <CatCdnTable v-loading="template.loading" :data="template.tableData" @selection-change="tableSelect">
      <el-table-column type="selection" />
      <el-table-column prop="name" :label="t('domain.template.table.933620-2')">
        <template #default="{ row }">
          {{ row.name || row.first_name + ' ' + row.last_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="remark" :label="t('domain.template.table.933620-3')" width="200">
        <template #default="{ row }">
          <el-tooltip placement="top" effect="light">
            <template #content>
              <div style="max-width: 200px">
                {{ row.remark || '--' }}
              </div>
            </template>
            <div class="df remark" @mouseover="row.edit = true" @mouseout="row.edit = false">
              <div class="ellipsis">
                {{ row.remark || '--' }}
              </div>
              <SvgIcon name="cat-cdn-edit" class="icon-hover" @click="tableHandle('remark', row)" />
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="first_name" :label="t('domain.template.table.933620-4')">
        <template #default="{ row }">
          {{ row.first_name + ' ' + row.last_name }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="email" :label="t('domain.template.table.933620-5')" /> -->
      <el-table-column prop="phone" :label="t('domain.template.table.933620-6')" />
      <el-table-column :label="t('domain.template.table.933620-7')" fixed="right">
        <template #default="{ row }">
          <div class="df">
            <el-link class="mr20" type="primary" @click="tableHandle('edit', row)">
              {{ t('domain.template.table.933620-8') }}
            </el-link>
            <el-tooltip
              effect="light"
              :content="t('domain.template.table.933620-9')"
              placement="top"
              :disabled="row.is_default !== 2"
            >
              <el-link :disabled="row.is_default === 2" type="primary" class="mr20" @click="tableHandle('delete', row)">
                {{ t('domain.template.table.933620-10') }}
              </el-link>
            </el-tooltip>
            <el-link v-show="row.is_default === 1" type="primary" @click="tableHandle('default', row)">
              {{ t('domain.template.table.933620-11') }}
            </el-link>
            <div v-show="row.is_default === 2" class="df ac">
              <div class="mr4">
                {{ t('domain.template.table.933620-12') }}
              </div>
              <SvgIcon name="cat-cdn-success" style="color: var(--success-color)" />
            </div>
          </div>
        </template>
      </el-table-column>
    </CatCdnTable>
    <CatPagination
      v-model:pagination="template.pagination"
      :total="template.pagination.total"
      :custom-keys="['page', 'limit']"
      @change="getData"
    />

    <CatDialog
      v-model:dialog="remark.show"
      title="remark"
      width="480px"
      :loading="remark.loading"
      :disabled="!remark.form.remark.trim()"
      destroy-on-close
      @confirm="updateStatus('remark')"
    >
      <el-form :model="remark.form">
        <el-form-item prop="remark">
          <el-input
            v-model="remark.form.remark"
            show-word-limit
            type="textarea"
            :rows="3"
            :placeholder="t('domain.template.table.933620-13')"
            :maxlength="50"
          />
        </el-form-item>
      </el-form>
    </CatDialog>

    <CatDialog
      v-model:dialog="del.show"
      :title="t('domain.template.table.933620-14')"
      width="420px"
      :loading="del.loading"
      destroy-on-close
      @confirm="updateStatus('delete')"
    >
      {{ t('domain.template.table.933620-15') }}
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import {
  _getContactsTemplateList,
  _updateContactsTemplate,
  _deleteContactsTemplate,
  _getContactsTemplateDomain,
} from '@/apis/domain'
import { ElMessage } from 'element-plus'
import type { ContactsForm } from '@/apis/domain'
import type { PageParams } from '@/views/domain/common'
import t from '@/utils/i18n'
import { setSessionItemRaw } from '@/utils/storage'
import { pushRoute } from '@/utils/router-jump'
const router = useRouter()

const template = reactive<{
  query: string
  loading: boolean
  tableData: ContactsForm[]
  selectedList: ContactsForm[]
  pagination: PageParams
}>({
  query: '',
  loading: false,
  tableData: [],
  selectedList: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})

const tableSelect = v => {
  template.selectedList = v
}
const getData = () => {
  template.loading = true
  _getContactsTemplateList({ key: template.query, ...template.pagination })
    .then(res => {
      template.tableData = res.data.list
      template.pagination.total = res.data.total
      if (res.data.total >= 0) {
        setSessionItemRaw('domainTemplateTotal', res.data.total)
      }
    })
    .finally(() => {
      template.loading = false
    })
}
getData()
const tableHandle = (type: 'remark' | 'edit' | 'delete' | 'default', row: any) => {
  switch (type) {
    case 'remark':
      remark.form = { ...row }
      remark.show = true
      break
    case 'edit':
      pushRoute({
        path: '/domain/template/detail',
        query: { type: 'edit', detail: btoa(encodeURIComponent(JSON.stringify(row))) },
      })
      break
    case 'delete':
      del.form = { ...row }
      del.show = true
      break
    case 'default':
      _updateContactsTemplate({ ...row, is_default: 2 }).then(res => {
        if (res.code === 20000) {
          ElMessage.success(t('common.operationSuccess'))
          getData()
        } else {
          ElMessage.error(t('common.error_cd'))
        }
      })
      break
    default:
      break
  }
}

const remark = reactive<{
  show: boolean
  loading: boolean
  form: ContactsForm | any
}>({
  show: false,
  loading: false,
  form: { remark: '' },
})

const del = reactive<{
  show: boolean
  loading: boolean
  form: ContactsForm | any
}>({
  show: false,
  loading: false,
  form: { id: '' },
})

const updateStatus = async (type: 'delete' | 'remark') => {
  switch (type) {
    case 'delete':
      await _getContactsTemplateDomain({ id: del.form.id }).then(async res => {
        const { domains } = res.data
        if (domains.length > 0) {
          ElMessage.error(t('domain.template.table.933620-9'))
        } else {
          del.loading = true
          await _deleteContactsTemplate({ id: del.form.id })
            .then(res => {
              if (res.code === 20000) {
                ElMessage.success(t('common.deleteSuccess'))
                del.show = false
              } else {
                ElMessage.error(t('common.error_cd'))
              }
            })
            .finally(() => {
              del.loading = false
            })
        }
      })
      break
    case 'remark':
      if (remark.form.remark.trim().length > 50) {
        ElMessage.error(t('domain.template.table.933620-16', { max: 50 }))
        return
      }
      remark.loading = true
      await _updateContactsTemplate(remark.form)
        .then(() => {
          getData()
        })
        .finally(() => {
          remark.loading = false
          remark.show = false
        })
      break
    default:
      break
  }
  getData()
}
</script>

<style lang="scss" scoped>
.remark {
  text-align: center;

  .icon-hover {
    display: none;
    margin: auto;
  }

  &:hover {
    .ellipsis {
      display: none;
    }

    .icon-hover {
      display: block;
    }
  }
}
</style>
