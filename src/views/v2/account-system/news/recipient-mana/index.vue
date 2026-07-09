<template>
  <div class="recipient-mana-v2">
    <PageBreadcrumbToolbar
      :items="[t('recipient.recipient'), t('recipient.productSubscribeMana')]"
      @doc="openHelpDoc"
    />

    <InfoNotice :text="t('subscribe.subscribeTip')" />

    <section class="recipient-mana-v2__panel">
      <div class="recipient-mana-v2__summary">
        <span class="recipient-mana-v2__recipient">
          {{ t('recipient.userName') }} {{ productSubscribe.userName || '-' }}
        </span>
        <span class="recipient-mana-v2__tag">
          {{ t('recipient.subscribe', [productSubscribe.count]) }}
        </span>
      </div>

      <div class="recipient-mana-v2__toolbar">
        <div class="recipient-mana-v2__filters">
          <el-button
            type="primary"
            class="recipient-mana-v2__manage"
            @click="openProductsubscribeDialog(productsubscribeDialogRef)"
          >
            {{ t('recipient.productSubscribeMana') }}
          </el-button>
          <el-checkbox v-model="isSendMsg" :label="t('subscribe.isSendMsg')" size="large" />
        </div>

        <div class="recipient-mana-v2__search">
          <el-input v-model="condition" :placeholder="t('subscribe.searchPlaceholder')" :prefix-icon="Search" />
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        show-pagination
        @change="paginationChange"
        @update:pagination="paginationConfig.pagination = $event"
      >
        <el-table-column prop="productId" :label="t('subscribe.productId')" min-width="180">
          <template #default="{ row }">
            {{ row.productId || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="productName" :label="t('subscribe.receivingChannels')" min-width="180">
          <template #default="{ row }">
            {{ receivingChannels(row.receivingChannels) }}
          </template>
        </el-table-column>

        <el-table-column :label="t('recipient.messageCount')" min-width="220">
          <template #default="{ row }">
            <span v-if="typeof row.messageCount === 'number'" class="recipient-mana-v2__count">
              {{ row.messageCount }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column min-width="220">
          <template #header>
            <div class="recipient-mana-v2__table-head">
              <span>{{ t('recipient.sendTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.lastInformation?.sendTime ? maoYunDayJs(row.lastInformation?.sendTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <ProductsubscribeDialog
      ref="productsubscribeDialogRef"
      :uid="uid"
      @success="
        () => {
          getSubscribeList()
          subscribeOverview()
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { documentUrl } from '@/config/base-config'
import ProductsubscribeDialog from '@/views/account-system/news/recipient/mana/components/productsubscribe-dialog.vue'
import { _getSubscribeList, _subscribeOverview } from '@/apis/account-system/news'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const route = useRoute()
const condition = ref('')
const list = ref<any[]>([])
const productSubscribe = reactive<{ count: number; products: any[]; userName: string }>({
  count: 0,
  products: [],
  userName: '',
})
const loading = ref(false)
const productsubscribeDialogRef = ref<InstanceType<typeof ProductsubscribeDialog> | null>(null)
const isSendMsg = ref(false)
const uid = ref<number>(Number(route.params.uid) as number)

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

// 显示产品订阅弹窗
const openProductsubscribeDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 接收渠道
const receivingChannels = (v: any) => {
  if (v instanceof Array) {
    return v.join('/')
  }

  return '-'
}

// 订阅管理列表
const getSubscribeList = async () => {
  try {
    loading.value = true
    const res = await _getSubscribeList({
      productId: condition.value,
      isSendMsg: isSendMsg.value,
      uid: Number(uid.value),
    })

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data?.recordCnt || 0
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 产品订阅管理
const subscribeOverview = async () => {
  try {
    loading.value = true
    const res = await _subscribeOverview({
      uid: uid.value,
    })

    if (res.success) {
      productSubscribe.count = res.data?.count || 0
      productSubscribe.products = res.data?.products || []
      productSubscribe.userName = res.data?.userName || ''
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 分页
const paginationChange = () => {
  getSubscribeList()
  subscribeOverview()
}

watch(isSendMsg, () => {
  getSubscribeList()
})

watch(condition, () => {
  getSubscribeList()
})

onMounted(() => {
  getSubscribeList()
  subscribeOverview()
})
</script>

<style lang="scss" scoped>
.recipient-mana-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.recipient-mana-v2__panel {
  padding: 20px;
  background: #fff;
}

.recipient-mana-v2__summary {
  display: flex;
  gap: 16px;
  align-items: center;
  margin: 12px 0 20px;
}

.recipient-mana-v2__recipient {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.recipient-mana-v2__tag {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  background: #ecf4ff;
}

.recipient-mana-v2__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.recipient-mana-v2__filters {
  display: flex;
  gap: 20px;
  align-items: center;
}

.recipient-mana-v2__manage {
  min-width: 126px;
  height: 36px;
}

.recipient-mana-v2__search {
  width: 332px;
}

.recipient-mana-v2__search :deep(.el-input__wrapper) {
  height: 36px;
  border-radius: 0;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.recipient-mana-v2__search :deep(.el-input__wrapper:hover),
.recipient-mana-v2__search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #06f inset;
}

.recipient-mana-v2__search :deep(.el-input__inner) {
  font-size: 14px;
  color: #191c23;
}

.recipient-mana-v2__count {
  color: #ff4d4f;
}

.recipient-mana-v2__table-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.recipient-mana-v2__table-head :deep(svg) {
  width: 16px;
  height: 16px;
  color: #191c23;
}

@media (width <= 768px) {
  .recipient-mana-v2 {
    padding: 12px;
  }

  .recipient-mana-v2__panel {
    padding: 16px;
  }

  .recipient-mana-v2__summary,
  .recipient-mana-v2__toolbar,
  .recipient-mana-v2__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .recipient-mana-v2__search {
    width: 100%;
  }
}
</style>
