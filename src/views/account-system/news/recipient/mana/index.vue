<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" />

    <div class="df ac recipient mb20">
      <p style="margin-right: 16px">
        <span class="key">{{ t('recipient.userName') }}</span>
        <span class="value">{{ productSubscribe.userName }}</span>
      </p>
      <el-tag>{{ t('recipient.subscribe', [productSubscribe.count]) }}</el-tag>
    </div>

    <div class="df ac jsb">
      <div class="df ac mb20">
        <el-button class="mr20" type="primary" @click="openProductsubscribeDialog(productsubscribeDialogRef)">
          {{ t('recipient.productSubscribeMana') }}
        </el-button>
        <el-checkbox v-model="isSendMsg" :label="t('subscribe.isSendMsg')" size="large" />
      </div>
      <div class="search-wrap">
        <el-input v-model="condition" :placeholder="t('subscribe.searchPlaceholder')" :suffix-icon="Search" />
      </div>
    </div>

    <el-table v-loading="loading" :data="list" class="mt20 table" show-overflow-tooltip>
      <el-table-column prop="productId" :label="t('subscribe.productId')">
        <template #default="{ row }">
          <span>{{ row.productId || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="productName" :label="t('subscribe.receivingChannels')">
        <template #default="{ row }">
          <span>{{ receivingChannels(row.receivingChannels) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('recipient.messageCount')">
        <template #default="{ row }">
          <span v-if="typeof row.messageCount === 'number'" class="text-error">{{ row.messageCount }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- 最近发送时间 -->
      <el-table-column :label="t('recipient.sendTime')" min-width="220">
        <template #header>
          <div class="df ac">
            <span class="mr10">{{ t('recipient.sendTime') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          <span>{{
            row.lastInformation?.sendTime ? maoYunDayJs(row.lastInformation?.sendTime).format(FORMAT_TIME) : '-'
          }}</span>
        </template>
      </el-table-column>
    </el-table>

    <CatPagination
      v-model:pagination="paginationConfig.pagination"
      :total="paginationConfig.total"
      :custom-keys="['page', 'pageSize']"
      @change="paginationChange"
    />
    <!-- 产品订阅管理 -->
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
  </el-card>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import ProductsubscribeDialog from './components/productsubscribe-dialog.vue'
import { _getSubscribeList, _subscribeOverview } from '@/apis/account-system/news'
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

const route = useRoute()
const bodyStyle = { height: '100%' }
const condition = ref<string>('') // 查询条件
const list = ref<any[]>([]) // 列表
const productSubscribe = reactive<{ count: number; products: any[]; userName: string }>({
  count: 0,
  products: [],
  userName: '',
}) // 产品订阅详情
const loading = ref<boolean>(false)
const productsubscribeDialogRef = ref<InstanceType<typeof ProductsubscribeDialog> | null>(null)
const isSendMsg = ref<boolean>(false) // 30天内发送过消息的产品
const uid = ref<number>(Number(route.params.uid) as number) // 用户id

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const tips = computed(() => [
  {
    main: t('subscribe.subscribeTip'),
  },
])

// 显示产品订阅弹窗
const openProductsubscribeDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 接收渠道
const receivingChannels = (v: any) => {
  if (v instanceof Array) {
    return v.join('/')
  } else {
    return '-'
  }
}

// 订阅管理列表
const getSubscribeList = async () => {
  try {
    loading.value = true
    const res = await _getSubscribeList({
      productId: condition.value, // 产品ID
      isSendMsg: isSendMsg.value, // 是否查询30天内发送过消息的产品 true false
      uid: Number(uid.value), // 用户ID
    })
    console.log(`_getStrategyList===>`, res)
    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
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
    console.log(`_subscribeOverview===>`, res)
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

// 条件
watch(isSendMsg, () => {
  getSubscribeList()
})

// 条件
watch(condition, () => {
  getSubscribeList()
})

onMounted(() => {
  getSubscribeList()
  subscribeOverview()
})
</script>

<style lang="scss" scoped>
.search-wrap {
  width: 360px;
}

.recipient {
  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--common-text);
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: var(--primary-text);
  }
}
</style>
