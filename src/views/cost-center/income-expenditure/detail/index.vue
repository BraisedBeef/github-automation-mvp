<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <!-- 充值/充账类型 -->
    <el-table
      v-if="['1', '5'].includes(incomeType)"
      v-loading="loading"
      :data="detail.list || []"
      show-overflow-tooltip
    >
      <el-table-column prop="tradeNo" :label="t('incomeExpenditure.tradeNo')">
        <template #default>
          {{ detail.tradeNo || '-' }}
        </template>
      </el-table-column>
      <el-table-column :label="t('incomeExpenditure.subTradeNo')">
        <template #default>
          {{ detail.subTradeNo || '-' }}
        </template>
      </el-table-column>
      <el-table-column :label="t('incomeExpenditure.incomeType')">
        <template #default>
          {{ INCOME_TYPE_MAP[detail.incomeType] }}
        </template>
      </el-table-column>
      <el-table-column :label="t('incomeExpenditure.channels')">
        <template #default="{ row }">
          {{ CHANNEL_MAP[row.channel] }}
        </template>
      </el-table-column>
      <el-table-column prop="money" :label="t('incomeExpenditure.money')">
        <template #default="{ row }">
          {{ row.money }}
        </template>
      </el-table-column>
      <!-- 充值时间 -->
      <el-table-column prop="endTime" :label="t('incomeExpenditure.rechareTime')">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('incomeExpenditure.rechareTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span>{{ row.endTime ? maoYunDayJs(row.endTime).format(FORMAT_TIME) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" :label="t('incomeExpenditure.remark')">
        <template #default="{ row }">
          {{ row.remark || '-' }}
        </template>
      </el-table-column>
    </el-table>
    <!-- 扣费类型  -->
    <template v-else>
      <div class="title df ac mb20">
        <p style="margin-right: 40px">
          <span>{{ t('incomeExpenditure.deductionMoneyDesc', [COST_TYPE_MAP[detail.costType]]) }}</span
          ><span class="text-warning">${{ detail.money }} USD</span>
        </p>
        <p>
          <span>{{ t('incomeExpenditure.deductionMoneyTime') }}</span
          ><span class="value">{{ detail.transTime }}</span>
        </p>
      </div>

      <el-table v-loading="loading" :data="detail.list || []" show-overflow-tooltip>
        <el-table-column :label="t('incomeExpenditure.ins')">
          <template #default="{ row }"> {{ row.insName }}/{{ row.insId }} </template>
        </el-table-column>
        <el-table-column prop="productName" :label="t('incomeExpenditure.productName')" />
        <el-table-column prop="costItemName" :label="t('incomeExpenditure.costItemName')" />
        <el-table-column :label="t('incomeExpenditure.costType')">
          <template #default>
            {{ COST_TYPE_MAP[detail.costType] }}
          </template>
        </el-table-column>
        <!-- 开始使用时间 -->
        <el-table-column prop="beginTime" :label="t('incomeExpenditure.beginTime')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('incomeExpenditure.beginTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span>{{ row.beginTime ? maoYunDayJs(row.beginTime).format(FORMAT_TIME) : '-' }}</span>
          </template>
        </el-table-column>
        <!-- 结束使用时间 -->
        <el-table-column prop="endTime" :label="t('incomeExpenditure.endTime')">
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('incomeExpenditure.endTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <span>{{ row.endTime ? maoYunDayJs(row.endTime).format(FORMAT_TIME) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('incomeExpenditure.moneyNum')">
          <template #default="{ row }">
            <span class="text-warning">{{ row.money || 0 }}</span>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { _queryDetailList } from '@/apis/cost-center/income-expenditure'
import t from '@/utils/i18n'
import { CHANNEL_MAP, INCOME_TYPE_MAP } from '@/views/cost-center/income-expenditure/config'
import { COST_TYPE_MAP } from '@/views/cost-center/expense-bill/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

const route = useRoute()

const bodyStyle = { height: '100%' }
const id = ref<string>('')
const incomeType = ref<string>('')
const loading = ref<boolean>(false)
const detail = ref<any>({}) // 详情

// 查询收支明细详情
const queryDetailList = async () => {
  try {
    loading.value = true

    const res = await _queryDetailList({ id: id.value })
    console.log('res', res)

    if (res.success) {
      // detail.value.list = res.data?.list || []
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 监听路由
watch(
  () => route.params.id,
  () => {
    queryDetailList()
  },
)

onMounted(() => {
  id.value = route.params.id as string
  incomeType.value = route.params.incomeType as string
  queryDetailList()
})
</script>

<style lang="scss" scoped>
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;

  .key {
    color: var(--common-text);
  }

  .value {
    color: var(--primary-text);
  }
}
</style>
