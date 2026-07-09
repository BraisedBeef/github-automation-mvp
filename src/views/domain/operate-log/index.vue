<template>
  <div class="domain-operate-log">
    <CatTip>{{ t('domain.operate-log.216677-0') }}</CatTip>

    <div class="bgcf pd20 mt20">
      <div class="page-head df">
        <el-form :model="form" inline>
          <el-form-item :labe="t('domain.operate-log.216677-1')">
            <DateTimePicker v-model:start_time="form.time" :loading="false" :compare="false" />
          </el-form-item>
          <el-form-item :label="t('domain.operate-log.216677-2')" prop="domain">
            <el-input v-model="form.keyword" maxlength="75" style="width: 300px" />
          </el-form-item>
          <el-form-item style="margin-bottom: 20px !important">
            <el-button type="primary" @click="getData">
              {{ t('domain.operate-log.216677-3') }}
            </el-button>
            <el-button @click="resetData">
              {{ t('domain.operate-log.216677-4') }}
            </el-button>
          </el-form-item>
        </el-form>

        <CdnIconButton style="margin-left: auto" @click="exportHandle">
          <SvgIcon name="cat-cdn-download" />
        </CdnIconButton>
      </div>

      <CatCdnTable
        v-loading="data.loading"
        :data="data.tableData"
        :show-overflow-tooltip="true"
        :tooltip-options="{ popperClass: 'max-400' }"
        class="mt20"
        @selection-change="tableSelect"
      >
        <el-table-column prop="domain" :label="t('domain.operate-log.216677-2')" />
        <el-table-column prop="action" :label="t('domain.operate-log.216677-5')" />
        <el-table-column prop="detail" :label="t('domain.operate-log.216677-6')" />
        <el-table-column prop="user_name" :label="t('domain.operate-log.216677-7')" />
        <el-table-column prop="time" :label="t('domain.operate-log.216677-1')">
          <template #header>
            <div class="df ac">
              {{ t('domain.operate-log.216677-1') }}
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon style="margin: 0 5px 0 10px" name="cat-cdn-help" />
              </el-tooltip>
              <SvgIcon :name="sortIconList[sort.time_desc]" @click="sortHandle('time_desc')" />
            </div>
          </template>
          <template #default="{ row }">
            {{ row.time ? maoYunDayJs(row.time).format(FORMAT_TIME) : '-' }}
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
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { sortIconList, download } from '@/views/domain/config'
import { _getOperateLogList, _exportOperateLog } from '@/apis/domain'
import t from '@/utils/i18n'
import type { PageParams } from '@/views/domain/common'

const form = reactive<{
  time: any
  keyword: string
}>({
  time: '',
  keyword: '',
})

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

const initParams = () => {
  const p: any = {
    ...form,
    start_time: form.time ? maoYunDayJs(form.time[0]).valueOf() / 1000 : '',
    end_time: form.time ? maoYunDayJs(form.time[1]).valueOf() / 1000 : '',
    ...sort,
    ...data.pagination,
  }
  delete p.time
  delete p.total
  return p
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
  const params = initParams()
  data.loading = true
  _getOperateLogList(params)
    .then(res => {
      data.tableData = res.data.list
      data.pagination.total = res.data.total
    })
    .finally(() => {
      data.selectedData = []
      data.loading = false
    })
}
const resetData = () => {
  form.time = ''
  form.keyword = ''
  sort.time_desc = 0
  getData()
}
getData()
const exportHandle = () => {
  const params = { ...initParams(), limit: data.pagination.total }
  _exportOperateLog(params).then(res => {
    download(res.data.url)
  })
}
</script>

<style lang="scss" scoped></style>
