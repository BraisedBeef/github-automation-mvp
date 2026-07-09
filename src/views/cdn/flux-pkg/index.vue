<template>
  <div class="flow-detail">
    <CatTabs v-model="tabType" :tabs="tabMenuList" full-container @change="changeTabType" />
    <div class="page-box pd20 mt20">
      <div class="df ac jsb">
        <el-button type="primary" @click="pushRoute('/cdn/buyFlow')">
          {{ t('buyPkg') }}
        </el-button>
        <CatTabsBox v-model="pkgType" :list="pkgTypeList" @change="changePkgType" />
      </div>
      <el-table v-loading="state.loading" :data="state.tableData" table-layout="auto" class="mt20">
        <el-table-column prop="orderNo" :label="t('oderno')">
          <template #default="{ row }">
            {{ row.orderNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="accelerationRegion" :label="t('region')">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.accelerationRegion"
              label="region"
              show-all
              :all-value="''"
              :list="fluxAreaList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(fluxAreaList, row.accelerationRegion) }}
          </template>
        </el-table-column>
        <el-table-column prop="payType" :label="t('type')">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.purchaseType"
              label="type"
              show-all
              :all-value="''"
              :list="purchaseTypeList"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(purchaseTypeList, row.payType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="tabType === 2" prop="class" :label="t('classBillingItem')">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.class"
              label="classBillingItem"
              show-all
              :all-value="-1"
              :list="resourcePkgType"
            />
          </template>
          <template #default="{ row }">
            {{ getValueMap(resourcePkgType, row.class) }}
          </template>
        </el-table-column>
        <el-table-column prop="flux" :label="t('fluxPkguse')" min-width="200">
          <template #default="{ row }">
            <el-popover effect="light" placement="top-start" trigger="hover">
              <template #reference>
                <div>
                  <div class="df el-text el-text--info">
                    <div class="mr4">
                      {{ t('usedFlux') }}
                    </div>
                    <div class="mr4">{{ getRate(row.flux - row.remainFlux, row.flux) }}%</div>
                    <div>
                      ({{ row.class ? getRequest(row.flux - row.remainFlux) : getFlux(row.flux - row.remainFlux) }}/{{
                        row.class ? getRequest(row.flux) : getFlux(row.flux)
                      }})
                    </div>
                  </div>
                  <el-progress
                    :percentage="getRate(row.flux - row.remainFlux, row.flux)"
                    :stroke-width="10"
                    :show-text="false"
                    status="success"
                    :color="row.status === 3 || row.status === 4 ? '#ccc' : ''"
                  />
                </div>
              </template>
              <template #default>
                <div class="df">
                  <div class="mr14">
                    {{ t('fluxUsedCount') }}
                  </div>
                  <div>{{ row.class ? getRequest(row.flux) : getFlux(row.flux) }}</div>
                </div>
                <div class="df">
                  <div class="mr14">
                    {{ t('fluxUsedAllCount') }}
                  </div>
                  <div>
                    {{ row.class ? getRequest(row.flux - row.remainFlux) : getFlux(row.flux - row.remainFlux) }}
                  </div>
                </div>
                <div class="df">
                  <div class="mr14">
                    {{ t('fluxUsedRate') }}
                  </div>
                  <div>{{ getRate(row.flux - row.remainFlux, row.flux) }}%</div>
                </div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="t('status')">
          <template #header>
            <CatTableHeadFilter
              v-model="tableSort.status"
              label="status"
              show-all
              :all-value="pkgType ? '3,4,5' : '1,2'"
              :list="fluxList"
            />
          </template>
          <template #default="{ row }">
            <el-text :type="row.status === 1 ? 'success' : row.status === 2 ? 'primary' : ''">
              {{ getValueMap(fluxStatusList, row.status) }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="purchaseTime" :label="t('buyTime')">
          <template #header>
            <div>
              {{ t('buyTime') }}
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon class="ml4 mr4" name="cat-cdn-help" />
              </el-tooltip>
              <SvgIcon :name="sortIcon.purchaseTime" @click="sortChange('purchaseTime')" />
            </div>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.purchaseTime * 1000, 'string', true) }}
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" :label="t('expireTime1')">
          <template #header>
            <div>
              {{ t('expireTime1') }}
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon class="ml4 mr4" name="cat-cdn-help" />
              </el-tooltip>
              <SvgIcon :name="sortIcon.expireTime" @click="sortChange('expireTime')" />
            </div>
          </template>
          <template #default="{ row }">
            {{ getDateDayjs(row.expireTime * 1000, 'string', true) }}
          </template>
        </el-table-column>
      </el-table>
      <CatPagination
        v-model:pagination="state.pagination"
        :total="state.total"
        :custom-keys="['page', 'page_size']"
        @change="getFluxData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { _getFluxDetail } from '@/apis/cdn/monitor'
import { fluxAreaList, purchaseTypeList, fluxStatusList, resourcePkgType } from '@/assets/data/common'
import { getValueMap } from '@/utils/collection-utils'
import { getRate } from '@/utils/number-utils'
import { getDateDayjs } from '@/utils/format-time'
import { getFlux, getRequest } from '@/utils/unit'
import t from '@/utils/i18n'
import type { Fluxform } from '@/apis/cdn/monitor'
import { pushRoute } from '@/utils/router-jump'

const router = useRouter()
const tabMenuList = [
  { label: t('staticAcceleration'), value: 1 },
  { label: t('wholeAcceleration'), value: 2 },
]
const tabType = ref<any>(1)
const changeTabType = () => {
  tableSort.value.order = ''
  tableSort.value.orderBy = ''
  getFluxData()
}
const pkgTypeList = [
  { label: t('validResourcePkg'), value: 0 },
  { label: t('noValidResourcePkg'), value: 1 },
]
const pkgType = ref<number>(0)
const changePkgType = v => {
  tableSort.value.order = ''
  tableSort.value.orderBy = ''
  tableSort.value.status = v.value ? '3,4,5' : '1,2'
}
const fluxList = computed(() => {
  return fluxStatusList.filter(v => {
    if (pkgType.value) {
      return v.value > 2
    } else {
      return v.value < 3
    }
  })
})

const tableSort = ref<Fluxform>({
  accelerationRegion: '',
  purchaseType: '',
  class: -1,
  orderBy: '',
  order: 'asc',
  status: '1,2',
})
interface FluxItem {
  id: number
  orderNo: string
  accelerationType: number
  accelerationRegion: number
  payType: number
  flux: number
  remainFlux: number
  purchaseTime: number
  expireTime: number
  status: number
}
const state = reactive<{
  loading: boolean
  tableData: FluxItem[]
  total: number
  pagination: {
    page: number
    page_size: number
  }
}>({
  loading: false,
  tableData: [],
  total: 0,
  pagination: {
    page: 1,
    page_size: 10,
  },
})
const getFluxData = () => {
  state.loading = true
  _getFluxDetail({
    ...tableSort.value,
    accelerationType: tabType.value,
    ...state.pagination,
  })
    .then(res => {
      state.tableData = res.data.list || []
      state.total = res.data.total || 0
    })
    .finally(() => {
      state.loading = false
    })
}

const sortIcon = reactive<{
  purchaseTime: 'sort' | 'sort-up' | 'sort-down'
  expireTime: 'sort' | 'sort-up' | 'sort-down'
}>({
  purchaseTime: 'sort-up',
  expireTime: 'sort',
})
const sortChange = (type: 'purchaseTime' | 'expireTime') => {
  tableSort.value.orderBy = type
  if (type === 'purchaseTime') {
    sortIcon.expireTime = 'sort'
  } else {
    sortIcon.purchaseTime = 'sort'
  }
  sortIcon[type] = sortIcon[type] === 'sort-down' ? 'sort-up' : 'sort-down'
  tableSort.value.order = sortIcon[type] === 'sort-down' ? 'desc' : 'asc'
}

watch(
  () => ({ ...tableSort.value }),
  () => {
    getFluxData()
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped></style>
