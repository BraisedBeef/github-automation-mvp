<template>
  <CatDialog
    v-model:dialog="renew.show"
    :disabled="renew.loading || renew.table.length === 0"
    :title="t('domain.components.632963-0')"
    width="80%"
    destroy-on-close
    @confirm="renewHandle"
  >
    <CatCdnTable :data="renew.table" :show-overflow-tooltip="true">
      <el-table-column prop="domain" :label="t('domain.components.632963-1')" />
      <!-- 注册时间 -->
      <el-table-column prop="register_time" :label="t('domain.components.632963-2')">
        <template #header>
          <div class="df ac">
            {{ t('domain.components.632963-2') }}
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon class="ml10" name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.register_time ? maoYunDayJs(row.register_time).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>
      <!-- 到期时间 -->
      <el-table-column prop="expired" :label="t('domain.components.632963-3')">
        <template #header>
          <div class="df ac">
            {{ t('domain.components.632963-3') }}
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon class="ml10" name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.expired ? maoYunDayJs(row.expired).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>
      <!-- 剩余期限 -->
      <el-table-column prop="left_days" :label="t('domain.components.632963-4')">
        <!-- <template #default="{ row }">{{ left_days||'--' }}</template> -->
      </el-table-column>
      <!-- 续费时长 -->
      <el-table-column prop="renew_years" :label="t('domain.components.632963-5')">
        <template #default="{ row }">
          <span v-if="row.is_owner === 1">{{ renewList.find(v => v.value === props.year)?.label }}</span>
          <el-text v-else type="danger">
            {{ t('domain.components.632963-6') }}
          </el-text>
        </template>
      </el-table-column>
      <!-- 续费后到期时间 -->
      <el-table-column prop="expired_after_renew" :label="t('domain.components.632963-7')">
        <template #header>
          <div class="df ac">
            {{ t('domain.components.632963-7') }}
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon class="ml10" name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.expired_after_renew ? maoYunDayJs(row.expired_after_renew).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" :label="t('domain.components.632963-8')">
        <template #default="{ row }">
          <el-text v-if="row.is_owner === 1" type="warning"> ${{ row.amount }}USD </el-text>
          <el-text v-else type="danger">
            {{ t('domain.components.632963-6') }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column :label="t('domain.components.632963-9')" fixed="right">
        <template #default="{ $index }">
          <el-link :disabled="renew.table.length <= 1" type="primary" @click="renew.table.splice($index, 1)">
            {{ t('domain.components.632963-10') }}
          </el-link>
        </template>
      </el-table-column>
    </CatCdnTable>
    <!-- <CatPagination
      v-model:pagination="renew.pagination"
      :total="renew.pagination.total"
      @change="getRenewList"
      :custom-keys="['page', 'limit']"
    /> -->
  </CatDialog>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { message } from '@/utils/message'
import { _domainOwnership, _renewDomain, _renewDomainSign } from '@/apis/domain'
import t from '@/utils/i18n'
import { usePreProductOrder } from '@/views/cost-center/hooks/use-pre-product-order'
const router = useRouter()

const props = withDefaults(
  defineProps<{
    dialog: boolean
    domainList: string[]
    year: number
    auto_renew: number
  }>(),
  {
    dialog: false,
    domainList: () => [],
    year: 1,
    auto_renew: 1,
  },
)
const emit = defineEmits<{
  (event: 'update:dialog', value: boolean): void
}>()

const renewList = reactive([{ label: t('domain.components.632963-11'), value: 1 }])
const renew = reactive<any>({
  show: false,
  loading: false,
  table: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
})
// 监听props.dialog变化, 打开弹窗时请求域名信息
watch(
  () => props.dialog,
  () => {
    renew.show = props.dialog

    if (props.dialog && props.domainList.length > 0) getRenewList()
  },
)
// 监听lock.show变化, 关闭弹窗时清空数据
watch(
  () => renew.show,
  () => {
    if (!renew.show) {
      renew.table = []
      renew.loading = false
      emit('update:dialog', false)
    }
  },
)

// 获取域名续费列表
const getRenewList = async () => {
  renew.loading = true
  const { data, code } = await _domainOwnership({ domains: props.domainList })
  if (code === 20000) {
    renew.table = data.list
    renew.pagination.total = data.total
  } else {
    message.error(data.message || t('domain.components.632963-12'))
  }
  renew.loading = false
}

const { toPrePayOrder } = usePreProductOrder()
// 续费预订单提交
const renewHandle = async () => {
  if (!renew.table.every(v => v.is_owner === 1)) {
    message.error(t('domain.components.632963-13'))
    return
  }
  try {
    let _fn, datas
    // TODO 不同的修改方式会产生不同的操作记录，需要做区分
    // if (renew.table.length === 1) {
    //   // 续费单个域名
    //   _fn = _renewDomainSign
    //   datas ={
    //     id: renew.table[0].id
    //   }
    // } else {
    // 续费多个域名
    _fn = _renewDomain
    datas = {
      ids: renew.table.map(v => v.id),
    }
    // }
    const { data, message, code } = await _fn({
      ...datas,
      year: props.year,
      auto_renew: props.auto_renew,
    })

    if (code === 20000) {
      renew.show = false
      toPrePayOrder(data.order_no, 'domain')
    } else {
      message.error(message || t('domain.components.632963-14'))
    }
  } catch (error) {
    message.error(t('common.error_cd'))
  }
}
</script>
