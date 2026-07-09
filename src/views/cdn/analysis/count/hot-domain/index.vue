<template>
  <div class="count-domain">
    <CatTabsBox v-model="order_by" :list="tabList as any" @change="changeTab" />

    <el-table v-loading="loading" :data="state.tableData" table-layout="auto" class="mt20">
      <el-table-column prop="rank" :label="t('rank')" />
      <el-table-column prop="domain" :label="t('domain')" />
      <el-table-column v-if="order_by == 0" prop="total_flux" :label="t('allFlux')" />
      <el-table-column v-if="order_by == 0" prop="flux_rate" :label="t('fluxRateTitle')" />
      <el-table-column v-if="order_by == 1" prop="top_bindwidth" :label="t('topBandwidth')" />
      <el-table-column v-if="order_by == 1" prop="top_bindwidth_time" :label="t('topTimePoint')" />
      <el-table-column v-if="order_by == 2" prop="flux_hit_rate" :label="t('aveFluxHitRate')" />
      <el-table-column v-if="order_by == 3" prop="total_requests" :label="t('allRequestTitle')" />
      <el-table-column v-if="order_by == 3" prop="requests_rate" :label="t('requestRateTitle')" />
      <el-table-column v-if="order_by == 5" prop="top_back_source_bindwidth" :label="t('pullBandwidthTop')" />
      <el-table-column v-if="order_by == 5" prop="top_back_source_bindwidth_time" :label="t('pullTopTimePoint')" />
      <el-table-column v-if="order_by == 4" prop="total_back_source_flux" :label="t('pullAllFlux')" />
      <el-table-column v-if="order_by == 4" prop="back_source_flux_rate" :label="t('pullFluxConstract')" />
      <el-table-column v-if="order_by == 6" prop="top_back_source_requests" :label="t('allPullRes')" />
      <el-table-column v-if="order_by == 6" prop="back_source_requests_rate" :label="t('pullResConstract')" />
    </el-table>

    <CatPagination
      v-model:pagination="state.pagination"
      :custom-keys="['page', 'page_size']"
      :total="state.total"
      @change="getHotDomainPageData"
    />
  </div>
</template>

<script setup lang="ts">
import { _getStaticDomain, _getAllDomain, _exportStaticDomain, _exportAllDomain } from '@/apis/cdn/count'
import { getFlux, bpsToMbps } from '@/utils/unit'
import { getDateDayjs } from '@/utils/format-time'
import { downloadExportFiles } from '@/utils/download'
import t from '@/utils/i18n'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'

const order_by = ref<number>(0)
const tabList = computed(() => [
  {
    label: t('fluxRank'),
    value: 0,
  },
  {
    label: t('bandwidthRank'),
    value: 1,
  },
  {
    label: t('fluxHitRank'),
    value: 2,
  },
  {
    label: t('resRank'),
    value: 3,
  },
  {
    label: t('pullBandRank'),
    value: 5,
  },
  {
    label: t('pullFluxRank'),
    value: 4,
  },
  {
    label: t('pullResRank'),
    value: 6,
  },
])
const changeTab = async v => {
  order_by.value = v.value
  state.tableData = []
  loading.value = true
  state.pagination.page = 1
  await getData(type.value, { ...searchForm.value, order_by: order_by.value }).finally(() => {
    loading.value = false
  })
}

interface HotDomainItem {
  ank: number
  omain: string
  otal_flux: number
  lux_rate: number
  lux_hit_rate: number
  op_bindwidth: number
  op_bindwidth_time: number
  otal_requests: number
  equests_rate: number
  op_back_source_bindwidth: number
  op_back_source_bindwidth_time: number
  otal_back_source_flux: number
  ack_source_flux_rate: number
  op_back_source_requests: number
  ack_source_requests_rate: number
}
const state = reactive<{
  tableData: HotDomainItem[]
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
const loading = ref<boolean>(false)
const getData = async (pageType, form) => {
  searchForm.value = form
  type.value = pageType
  let rowData
  if (pageType === '0,1,2') {
    await _getStaticDomain({
      ...form,
      page: state.pagination.page,
      page_size: state.pagination.page_size,
    }).then(res => {
      rowData = res.data?.data || []
      // state.tableData = res.data?.data||[]
      state.total = res.data?.total || 0
    })
  } else {
    await _getAllDomain({
      ...form,
      page: state.pagination.page,
      page_size: state.pagination.page_size,
    }).then(res => {
      rowData = res.data?.data || []
      state.total = res.data?.total || 0
    })
  }
  state.tableData = rowData.map(v => {
    for (let key in v) {
      let key_arr = key.split('_')
      let key_type = key_arr[key_arr.length - 1]
      if (key_type === 'time') {
        v[key] = getDateDayjs(v[key] * 1000, 'string', true)
      } else if (key_type === 'flux') {
        v[key] = getFlux(v[key])
      } else if (key_type === 'bindwidth') {
        v[key] = bpsToMbps(v[key]) + 'Mbps'
      } else if (key_type === 'rate') {
        v[key] = +(v[key] * 100).toFixed(2) + '%'
      } else if (key_type === 'requests') {
        v[key] = v[key] + t('countUnit', { num: v[key] })
      }
    }
    return v
  })
}

//获取域名排行数据-分页
const getHotDomainPageData = () => {
  loading.value = true
  getData(type.value, { ...searchForm.value }).finally(() => {
    loading.value = false
  })
}
// 重置分页
const resetPage = () => {
  console.log('resetPage')
  return new Promise(resolve => {
    state.pagination.page = 1
    resolve(true)
  })
}

const searchForm = ref<any>(null)
const type = ref<any>(null)
//导出数据
const download = async params => {
  let f
  if (type.value === '0,1,2') {
    f = await _exportStaticDomain(params)
  } else {
    f = await _exportAllDomain(params)
  }
  const f_name = decodeURIComponent(
    `${type.value === '3' ? 'ecdn' : 'cdn'}_${t('domainRank')}_${getDateDayjs(maoYunDayJs(), 'number')}.xlsx`,
  )
  downloadExportFiles(f, f_name)
}

defineExpose({ getData, order_by, download, resetPage })
</script>

<style lang="scss" scoped></style>
