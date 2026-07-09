<template>
  <div>
    <el-card shadow="never" class="page-box h210 info mb20" :body-style="bodyStyle">
      <el-row class="mb20">
        <span class="title">{{ detail.info }}</span>
      </el-row>
      <!-- 策略名称 -->
      <el-row class="mb20">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="2">
          <span class="key">{{ t('strategy.strategyNames') }}</span>
        </el-col>

        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="22">
          <span class="value">{{ detail.strategyName }}</span>
        </el-col>
      </el-row>

      <!-- 角色描述 -->
      <el-row class="mb20">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="2">
          <span class="key">{{ t('strategy.description') }}</span>
        </el-col>

        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="22">
          <span class="value">{{ detail.description }}</span>
        </el-col>
      </el-row>

      <!-- 创建时间 -->
      <el-row class="mb20">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="2">
          <div class="key df ac">
            <span>{{ t('strategy.createDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" class="ml10" />
            </el-tooltip>
          </div>
        </el-col>

        <el-col :xs="21" :sm="21" :md="21" :lg="21" :xl="22">
          <span class="value">{{ detail.createDate ? maoYunDayJs(detail.createDate).format(FORMAT_TIME) : '-' }}</span>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="page-box info mb20" :body-style="{ ...bodyStyle, paddingTop: 0 }">
      <CatTabs v-model="active" :tabs="tabs" @change="handleTabChange">
        <!-- 策略摘要 -->
        <CatTabPane :value="1">
          <div class="abstract-wrap mt20">
            <div class="search-wrap mb20">
              <el-input
                v-model.trim="summary.condition"
                maxlength="30"
                :placeholder="t('strategy.abstractSearchPlaceholder')"
                :suffix-icon="Search"
              />
            </div>
            <el-table v-loading="summary.loading" :data="summary.list">
              <el-table-column prop="productName" :label="t('strategy.productName', [summary.list.length])" />
              <el-table-column prop="resourceType" :label="t('strategy.resourceType')">
                <template #default="{ row }">
                  <span class="mr4">{{ row.resourceType === 1 ? t('strategy.all') : t('strategy.specific') }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="condition" :label="t('strategy.condition')">
                <template #default="{ row }">
                  {{ row.condition || '-' }}
                </template>
              </el-table-column>
            </el-table>

            <CatPagination
              v-model:pagination="summary.paginationConfig"
              :total="summary.paginationConfig.total"
              :custom-keys="['page', 'page_size']"
              @change="getStrategySummary"
            />
          </div>
        </CatTabPane>
        <!-- 策略用法 -->
        <CatTabPane :value="2">
          <div class="usage-wrap mt20">
            <div class="df ac mb20 pointer" @click="usageDTOS.isShow = !usageDTOS.isShow">
              <el-icon :class="usageDTOS.isShow ? 'is-reverse' : ''" style="transition: 0.3s">
                <CaretRight />
              </el-icon>
              <span class="ml4 title">{{ t('strategy.usageDesc') }}</span>
            </div>
            <el-collapse-transition>
              <div v-show="usageDTOS.isShow">
                <el-table v-loading="usageDTOS.loading" :data="usageDTOS.list">
                  <el-table-column prop="roleName" :label="t('strategy.associateRole')">
                    <template #default="{ row }">
                      <span
                        class="text-primary cursor-pointer"
                        @click="
                          pushRoute({
                            name: 'access_role_detail',
                            params: { id: row.id },
                            query: {
                              title: 'strategy.detail',
                              path: route.fullPath, // 当前页面也是二级页面,返回也需要query参数
                            },
                          })
                        "
                        >{{ row.roleName || '-' }}</span
                      >
                    </template>
                  </el-table-column>

                  <el-table-column prop="createDate" :label="t('strategy.usageCreateDate')">
                    <template #header>
                      <div class="df ac">
                        <span class="mr10">{{ t('strategy.usageCreateDate') }}</span>
                        <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                          <SvgIcon name="cat-cdn-help" />
                        </el-tooltip>
                      </div>
                    </template>
                    <template #default="{ row }">
                      <span>{{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-collapse-transition>
          </div>
        </CatTabPane>
      </CatTabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Search, CaretRight } from '@element-plus/icons-vue'
import { _geStrategytDetail, _getStrategySummary } from '@/apis/account-system/access/strategy'
import t from '@/utils/i18n'

import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { pushRoute } from '@/utils/router-jump'

const route = useRoute()
const bodyStyle = { height: '100%' }
const detail = ref<any>({}) // 策略详情
// 策略摘要
const summary = reactive<{
  loading: boolean
  condition: string
  paginationConfig: IPagination
  list: any[]
}>({
  loading: false,
  condition: '', //策略摘要查询条件
  paginationConfig: {
    pagination: {
      pageSize: 10,
      page: 1,
    },
    total: 0,
  },
  list: [], // 列表
})
const active = ref(1)
const tabs = [
  { label: t('strategy.abstract'), value: 1 },
  { label: t('strategy.usage'), value: 2 },
]

// 策略用法
const usageDTOS = reactive<{
  loading: boolean
  list: any[]
  isShow: boolean
}>({
  loading: false,
  list: [], // 列表
  isShow: true, // 是否显示详情
})

const id = ref<string>(route.params.id as string) // id

// tab 切换
const handleTabChange = item => {
  console.log(`handleTabChange===>`, item)

  if (item.value === 1) {
    getStrategySummary()
  }
}

// 获取策略详情
const geStrategytDetail = async () => {
  try {
    usageDTOS.loading = true
    const res = await _geStrategytDetail({ id: id.value })

    console.log(`geStrategytDetail===>`, res)

    if (res.success) {
      detail.value = res.data || {}
      usageDTOS.list = res.data?.strategyUsageDTOS
    }
  } catch (error) {
    console.log(error)
  } finally {
    usageDTOS.loading = false
  }
}

// 获取策略摘要
const getStrategySummary = async () => {
  try {
    summary.loading = true
    const res = await _getStrategySummary({
      id: id.value,
      condition: summary.condition,
      pageIndex: summary.paginationConfig.pagination.page,
      pageSize: summary.paginationConfig.pagination.pageSize,
    })

    console.log(`_getStrategySummary===>`, res)
    if (res.success) {
      summary.list = res.data?.list
      summary.paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    summary.loading = false
  }
}
// 路由
watch(
  () => route.params.id,
  () => {
    id.value = route.params.id as string
    geStrategytDetail()
  },
)
// 条件
watch(
  () => summary.condition,
  () => {
    getStrategySummary()
  },
)

onMounted(() => {
  id.value = route.params.id as string
  geStrategytDetail()
  getStrategySummary()
})
</script>

<style lang="scss" scoped>
.info {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 18px;
    line-height: 25px;

    // font-weight: 500;
    color: var(--table-text);

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--common-text);
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
    }
  }
}

.abstract-wrap {
  .search-wrap {
    width: 360px;
    height: 34px;
    border-radius: 4px;
  }
}

.usage-wrap {
  .title {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--table-text);
  }
}

:deep(.el-tabs__item) {
  /* height: 48px; */
  display: flex;
  align-items: start;
  font-size: 16px;
}

.h210 {
  max-height: 210px;
}

.h380 {
  min-height: 380px;
}

.is-reverse {
  transform: rotateZ(90deg);
}
</style>
