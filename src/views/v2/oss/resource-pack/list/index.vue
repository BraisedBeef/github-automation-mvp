<template>
  <div>
    <header class="cdn-domain-list-v2__hero">
      <PageBreadcrumbToolbar :items="[t('oss.resourcePackM')]" />
    </header>
    <div class="v2-oss-resource-pack-list">
      <div class="df jsb flex-wrap mt20">
        <div class="btn-wrap mr20">
          <!-- 购买资源包 -->
          <el-button type="primary" class="mb20" @click="buyResourcePack">
            {{ $t('oss.buyResourcePack') }}
          </el-button>
        </div>
        <CatTabsBox v-model="search.status" :list="resPackTypeList" @change="getList" />
      </div>

      <TableV2
        v-loading="loading"
        :data="dataList"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        show-pagination
        @change="paginationChange"
        @update:pagination="paginationConfig.pagination = $event"
        @selection-change="handleRowSelectChange"
      >
        <!-- <el-table-column type="selection" width="40" /> -->
        <el-table-column min-width="290" :show-overflow-tooltip="{ effect: 'light' }">
          <template #header>
            <TableHeadFilter
              ref="statesThFilterRef"
              v-model="search.class"
              :label="t('oss.buyPack.column1')"
              tip=""
              show-all
              :list="tableFilterConfig.class.opts"
              :field-key="tableFilterConfig.class.fieldKey"
              :field-type="tableFilterConfig.class.fieldType"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <div class="">
              <p>{{ row.packageName }}</p>
              <p>{{ row.orderNo }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="160" :show-overflow-tooltip="{ effect: 'light' }" prop="regionName">
          <template #header>
            <TableHeadFilter
              ref="statesThFilterRef"
              v-model="search.region"
              :label="t('oss.buyPack.column2')"
              tip=""
              :list="tableFilterConfig.region.opts"
              :field-key="tableFilterConfig.region.fieldKey"
              :field-type="tableFilterConfig.region.fieldType"
              @change="tableCheckFilterFn"
            />
          </template>
        </el-table-column>
        <el-table-column min-width="100" prop="source">
          <template #header>
            <TableHeadFilter
              ref="statesThFilterRef"
              v-model="search.source"
              :label="t('oss.buyPack.column3')"
              tip=""
              show-all
              :list="tableFilterConfig.source.opts"
              :field-key="tableFilterConfig.source.fieldKey"
              :field-type="tableFilterConfig.source.fieldType"
              @change="tableCheckFilterFn"
            />
          </template>
        </el-table-column>
        <el-table-column min-width="120">
          <template #header>
            <TableHeadFilter
              ref="statesThFilterRef"
              v-model="search.billingCategory"
              :label="t('oss.buyPack.column4')"
              tip=""
              show-all
              :list="tableFilterConfig.billingCategory.opts"
              :field-key="tableFilterConfig.billingCategory.fieldKey"
              :field-type="tableFilterConfig.billingCategory.fieldType"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <div class="df ac">
              {{ row.className }}
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="130">
          <template #header>
            <div class="df ac">
              <span>{{ $t('oss.buyPack.column5') }}</span>
              <el-tooltip :content="$t('oss.buyPack.columnDesc1')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.spec }}
          </template>
        </el-table-column>
        <el-table-column min-width="320" :show-overflow-tooltip="{ effect: 'light' }">
          <template #header>
            <div class="df ac">
              <span>{{ $t('oss.buyPack.column6') }}</span>
              <el-tooltip placement="top" effect="light">
                <template #content>
                  <ul>
                    <li style="list-style: inside">
                      {{ $t('oss.buyPack.columnDesc2') }}
                    </li>
                    <li style="list-style: inside">
                      {{ $t('oss.buyPack.columnDesc3') }}
                    </li>
                  </ul>
                </template>
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div>
              <div class="mr4">
                {{ row.usageDesc }}
              </div>
              <el-progress
                :percentage="getRate(row.usageRate, row.amountTotal)"
                :stroke-width="10"
                :show-text="false"
                status="success"
                :color="row.status === 3 || row.status === 4 ? '#ccc' : ''"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="140">
          <template #header>
            <TableHeadFilter
              ref="statesThFilterRef"
              v-model="search.renewalType"
              :label="t('oss.buyPack.column7')"
              tip=""
              show-all
              :list="tableFilterConfig.renewalType.opts"
              :field-key="tableFilterConfig.renewalType.fieldKey"
              :field-type="tableFilterConfig.renewalType.fieldType"
              @change="tableCheckFilterFn"
            />
          </template>
          <template #default="{ row }">
            <div class="df ac">
              {{ row.renewalType }}
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="220">
          <template #header>
            <div class="df ac">
              <span>{{ t('oss.buyPack.column8') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
              <div class="ml10" />
              <SvgIcon
                :name="
                  search.orderBy === 'startTime'
                    ? !search.sortOrder
                      ? 'sort'
                      : search.sortOrder === 'asc'
                        ? 'sort-up'
                        : 'sort-down'
                    : 'sort'
                "
                @click="sortOrdersChange('startTime')"
              />
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row.startTime ? maoYunDayJs(row.startTime * 1000).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="220">
          <template #header>
            <div class="df ac">
              <span>{{ t('oss.buyPack.column9') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="ml10" />
              </el-tooltip>
              <div class="ml10" />
              <SvgIcon
                :name="
                  search.orderBy === 'expirationTime'
                    ? !search.sortOrder
                      ? 'sort'
                      : search.sortOrder === 'asc'
                        ? 'sort-up'
                        : 'sort-down'
                    : 'sort'
                "
                @click="sortOrdersChange('expirationTime')"
              />
            </div>
          </template>
          <template #default="{ row }">
            <div>{{ row.expirationTime ? maoYunDayJs(row.expirationTime * 1000).format(FORMAT_TIME) : '-' }}</div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <!-- <el-table-column fixed="right" :width="operationWidth" :label="$t('oss.operation')">
        <template #default="{}">
          <div class="df ac" style="gap: 24px">
            <DisableText :disabled="false" :text="t('oss.buyPack.renewType')" @click="renewModel.show = true" />
            <el-tooltip placement="bottom" effect="light">
              <template #content>
                <div class="more-list df fdc">
                  <el-button link color="#999999">{{ t('oss.buyPack.renewType1') }}</el-button>
                </div>
              </template>
              <el-link type="primary"
                >{{ t('more') }}
                <SvgIcon name="cat-cdn-select-more" class="ml4" />
              </el-link>
            </el-tooltip>
          </div>
        </template>
      </el-table-column> -->
      </TableV2>
    </div>
    <RenewDialog v-model:show="renewModel.show" />
  </div>
</template>

<script lang="ts" setup>
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import { getResourcePackListApi } from '@/apis/oss/resource-pack'
import t from '@/utils/i18n'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import { IPagination } from '@/views/account-system/type'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

import RenewDialog from './com/renew-dialog.vue'
import { getRate } from '@/utils/number-utils'
import { pushRoute } from '@/utils/router-jump'
const resPackTypeList = [
  { label: t('oss.buyPack.validPack'), value: 1 },
  { label: t('oss.buyPack.invalidPack'), value: 4 },
]

const dataList = ref([])
const selectList = ref<any[]>([]) // 选中的
const loading = ref(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const renewModel = ref({
  show: false,
  currRow: null,
})

const tableFilterConfig = {
  class: {
    opts: [
      { label: t('oss.buyPack.standardStoragePack'), value: 0 },
      { label: t('oss.buyPack.publicDownstreamTrafficPack'), value: 2 },
      // { label: t('oss.buyPack.globalAccelerationTrafficPack'), value: 3 },
      { label: t('oss.buyPack.standardStorageRequestPack'), value: 1 },
    ],
    fieldKey: 'class',
    fieldType: 'check' as const,
  },
  region: {
    opts: [
      { label: t('oss.all'), value: 0 },
      { label: t('oss.buyPack.region1'), value: 'oversea' },
    ],
    fieldKey: 'region',
    fieldType: 'select' as const,
  },
  source: {
    opts: [
      { label: t('oss.all'), value: 0 },
      { label: t('oss.buyPack.prePay'), value: 'prepaid' },
      { label: t('oss.buyPack.platformGift'), value: 'gift' },
    ],
    fieldKey: 'source',
    fieldType: 'select' as const,
  },
  billingCategory: {
    opts: [
      { label: t('oss.buyPack.categoryLabel1'), value: 0 },
      { label: t('oss.buyPack.categoryLabel3'), value: 1 },
      { label: t('oss.buyPack.categoryLabel2'), value: 2 },
    ],
    fieldKey: 'billingCategory',
    fieldType: 'check' as const,
  },
  renewalType: {
    opts: [
      { label: t('oss.manualRenewal'), value: 'manual' },
      // { label: t('oss.autoRenewal'), value: 'auto' },
    ],
    fieldKey: 'renewalType',
    fieldType: 'check' as const,
  },
}

const search = ref({
  class: [], // 资源包名称/子产品ID
  region: 'all', // 地域
  source: 0, // 来源
  billingCategory: [], // 计费项
  renewalType: [], // 续费类型
  sortOrder: '', // asc升序 desc降序
  orderBy: '',
  status: 1, // 状态 1有效 4无效
})

const buyResourcePack = () => {
  pushRoute({
    name: 'oss_res_create',
    query: {
      isDefaultCreate: 'true',
    },
  })
}

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
}
const paginationChange = e => {
  paginationConfig.pagination.page = e.page
  paginationConfig.pagination.pageSize = e.pageSize
  getList()
}
const tableCheckFilterFn = (val: any) => {
  console.log('val===>', val)
  getList()
}
const sortOrdersChange = key => {
  search.value.sortOrder = search.value.sortOrder === 'desc' ? 'asc' : 'desc'
  search.value.orderBy = key
  getList()
}
const getList = async () => {
  const params = {
    class: search.value.class.length > 0 ? search.value.class.join(',') : -1,
    region: search.value.region,
    source: search.value.source,
    order: search.value.sortOrder,
    orderBy: search.value.orderBy,
    billingCategory: search.value.billingCategory.join(','),
    renewalType: search.value.renewalType.join(','),
    status: search.value.status,
  }
  const res = await getResourcePackListApi({ ...paginationConfig.pagination, ...params })
  dataList.value = res.data.packages || []
  paginationConfig.total = res.data.total
}
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.v2-oss-resource-pack-list {
  padding: 20px;
  margin-top: 20px;
  background-color: #fff;
}
</style>
