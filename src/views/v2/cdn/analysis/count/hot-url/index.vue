<template>
  <div class="count-hoturl">
    <!-- <CatTabsBox v-model="type" :list="[
      { label: t('resURLlist'), value: 0 },
      { label: t('fluxURLlist'), value: 1 },
    ]" @change="changeTab" /> -->

    <TableV2 :data="state.tableData" table-layout="auto" class="mt20">
      <el-table-column prop="rank" :label="t('rank')" />
      <el-table-column prop="url" label="URL" />
      <!-- <el-table-column prop="flux" :label="t('flux')" v-if="type" />
      <el-table-column prop="requests" :label="t('requestCount')" v-else /> -->
    </TableV2>
    <CatPagination
      v-model:pagination="state.pagination"
      :custom-keys="['page', 'page_size']"
      :total="state.total"
      @change="changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { _getStaticHotUrl, _getAllHotUrl, _exportStaticHotUrl, _exportAllHotUrl } from '@/apis/cdn/count'
import { getFlux } from '@/utils/unit'
import { downloadExportFiles } from '@/utils/download'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface TableDataItem {
  rank: number
  url: string
  requests: number
  flux: number
}
const state = reactive<{
  tableData: TableDataItem[]
  pagination: {
    page: number
    page_size: number
  }
  total: number
}>({
  tableData: [],
  pagination: {
    page: 1,
    page_size: 10,
  },
  total: 0,
})

const getData = async (pageType, form) => {
  searchForm.value = form
  downloadType.value = pageType
  let rawData
  if (pageType === '0,1,2') {
    await _getStaticHotUrl(form, state.pagination).then(res => {
      rawData = res.data?.data || []
      state.total = res.data?.total || 0
    })
  } else {
    await _getAllHotUrl(form, state.pagination).then(res => {
      rawData = res.data?.data || []
      state.total = res.data?.total || 0
    })
  }
  state.tableData = rawData.map(v => ({
    ...v,
    flux: getFlux(v.flux),
    requests: v.requests + t('countUnit', { num: v.requests }),
  }))
}

const type = ref<number>(1)
const emit = defineEmits(['search'])
// const changeTab = () => {
//   emit('search')
// }

const searchForm = ref<any>(null)
const downloadType = ref<any>(null)
//导出数据
const download = async params => {
  let f
  if (downloadType.value === '0,1,2') {
    f = await _exportStaticHotUrl(params)
  } else {
    f = await _exportAllHotUrl(params)
  }
  const f_name = decodeURIComponent(
    `${downloadType.value === '3' ? 'ecdn' : 'cdn'}_${t('hotTop100Analysis')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
  )
  downloadExportFiles(f, f_name)
}

const changePage = v => {
  emit('search')
}

defineExpose({ getData, type, download })
</script>

<style lang="scss" scoped></style>
