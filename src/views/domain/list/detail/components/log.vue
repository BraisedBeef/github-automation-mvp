<template>
  <div class="domain-detail-log">
    <div class="bgcf pd20">
      <div class="d-title">
        {{ t('domain.list.detail.675613-0') }}
      </div>
      <CatTip>{{ t('domain.list.detail.675613-1') }}</CatTip>
      <CatCdnTable
        v-loading="data.loading"
        :data="data.tableData"
        :show-overflow-tooltip="true"
        :tooltip-options="{ popperClass: 'max-400' }"
        class="mt20"
        @selection-change="tableSelect"
      >
        <el-table-column prop="domain" :label="t('domain.list.detail.675613-2')" />
        <el-table-column prop="action" :label="t('domain.list.detail.675613-3')" />
        <el-table-column prop="detail" :label="t('domain.list.detail.675613-4')" />
        <el-table-column prop="user_name" :label="t('domain.list.detail.675613-5')" />
        <el-table-column prop="time" :label="t('domain.list.detail.675613-6')">
          <template #header>
            <div class="df ac">
              <div>{{ t('domain.list.detail.675613-6') }}</div>
              <el-tooltip
                :content="t('domain.list.table.367705-17')"
                placement="top"
                effect="light"
                popper-class="max-400"
              >
                <SvgIcon style="margin: 0 5px 0 10px" name="cat-cdn-help" />
              </el-tooltip>
              <SvgIcon :name="sortIconList[sort.time_desc]" @click="sortHandle('time_desc')" />
            </div>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.time, 'string', true) }}
          </template>
        </el-table-column>
      </CatCdnTable>
      <CatPagination
        v-model:pagination="data.pagination"
        :total="data.pagination.total"
        :custom-keys="['page', 'limit']"
        @change="getData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { sortIconList } from '@/views/domain/config'
import { getDateDayjs } from '@/utils/format-time'
import { _getDomainDetailLog } from '@/apis/domain'
import type { PageParams } from '@/views/domain/common'
import t from '@/utils/i18n'

const route: any = useRoute()

const sort = reactive<{
  time_desc: number
}>({
  time_desc: 1,
})
const sortHandle = key => {
  for (let k in sort) {
    if (k === key) {
      sort[k] = ++sort[k] > 2 ? 0 : sort[k]++
    } else {
      sort[k] = 0
    }
  }
  getData()
}

interface TableItem {
  action: string
  detail: string
  domain: string
  time: string
  user_name: string
}
const data = reactive<{
  loading: boolean
  tableData: TableItem[]
  selectedData: TableItem[]
  pagination: PageParams
}>({
  loading: false,
  tableData: [],
  selectedData: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
})
const tableSelect = v => {
  data.selectedData = v
}
const getData = () => {
  const p: any = {
    domain: route.query.domain,
    ...data.pagination,
    ...sort,
  }
  delete p.total
  data.loading = true
  _getDomainDetailLog(p)
    .then(res => {
      data.tableData = res.data.list
      data.pagination.total = res.data.total
    })
    .finally(() => {
      data.selectedData = []
      data.loading = false
    })
}
getData()
</script>

<style lang="scss" scoped></style>
