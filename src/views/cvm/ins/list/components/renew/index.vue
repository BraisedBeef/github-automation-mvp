<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.renew.title')"
    width="950px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="close"
    @open="open"
  >
    <Collapse
      v-model="isCollapse"
      :collapse-fn="false"
      :text="t('ins.renew.selectIns', [insList.length])"
      @change="changeCollapse"
    >
      <RenewItem
        v-for="item in insList"
        :key="item.id"
        :ref="
          r => {
            renewItemRef[item.id] = r
          }
        "
        :ins="item"
        :time="time"
        :renew="renewFn(item.id)"
        :pay="payFn(item.id)"
        :open="show"
        :ins-all-num="insList.length"
        @calc-renew-price="payInquiry"
        @change="changeRenewItem"
      />
    </Collapse>

    <ItemList ref="itemListRef">
      <!-- 续费时长 -->
      <Item>
        <template #key>
          <div class="renew-time df ac h-full">
            {{ t('ins.renew.renewTime') }}
          </div>
        </template>
        <template #value>
          <el-select
            v-model="time"
            class="select-opts"
            :placeholder="t('ins.renew.selectPh')"
            @change="changeRenewTime"
          >
            <el-option v-for="item in INS_DURATION_MAP" :key="item.value" :label="item.label" :value="item.value">
              <div class="df ac opt-wrap w-full h-full">
                <div>{{ item.label }}</div>
                <div v-if="item.more" class="more-wrap text-warning ml20">
                  {{ item.more }}
                </div>
              </div>
            </el-option>
          </el-select>
        </template>
      </Item>
      <!-- 合计 -->
      <Item>
        <template #key>
          {{ t('ins.renew.total') }}
        </template>
        <template #value>
          <span class="text-warning">${{ totalPrice.totalDiscountMoney }} USD</span>
          <span class="line-through line-through-text">${{ totalPrice.totalMoney }} USD</span>
        </template>
      </Item>
    </ItemList>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import RenewItem from './renew-item.vue'
import { INS_DURATION_MAP } from '@/views/cvm/ins/config'
import { _instanceRenewInquiry } from '@/apis/cvm/ins'
import { useIns } from '@/views/cvm/hooks/use-ins'
import NP from 'number-precision'

NP.enableBoundaryChecking(false)

/**
 * @desc 实例续费数量为1
 */

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})

const { instanceRenew, loading: comfirmLoading } = useIns()

const show = ref<boolean>(false) // 弹窗显示
const isCollapse = ref<boolean>(false) // 是否收起
const time = ref<number>(1)
const instanceRenewList = ref<any[]>([]) // 续费产品价格配置集合
const instancePayList = ref<any[]>([]) // 支付产品价格配置集合
const checked = ref<boolean>(false)
const isShowChecked = ref<boolean>(false) // 是否有包年包月eip
const itemListRef = ref<any>(null)
const renewItemRef = ref<{ [id: string]: any }>({})
let payInquiryRequestId = 0
let renewInquiryRequestId = 0

const changeCollapse = (e: boolean) => {
  for (const renewItemkey in renewItemRef.value) {
    renewItemRef.value[renewItemkey].isShow = !e
  }
}

const changeRenewItem = (e: boolean) => {
  if (renewItemRef.value) {
    const equalRes = Object.values(renewItemRef.value).every(el => el.isShow === e)
    if (equalRes) {
      isCollapse.value = !e
    }
  }
}

// 初始化Collapse RenewItem展开值
const initCollapseAndRenewItem = () => {
  isCollapse.value = props.insList.length > 1 ? true : false
  for (const renewItemkey in renewItemRef.value) {
    renewItemRef.value[renewItemkey].isShow = props.insList.length > 1 ? false : true
  }
}

const renewFn = (id: number) => {
  const res = instanceRenewList.value.find(el => el.instanceId === id) || {}

  return res
}

const payFn = (id: number) => {
  const res = instancePayList.value.find(el => el.instanceId === id) || {}

  return res
}

const resetInquiryList = () => {
  payInquiryRequestId += 1
  renewInquiryRequestId += 1
  renewItemRef.value = {}
  instanceRenewList.value = []
  instancePayList.value = []
}

const renewInsListKey = computed(() => props.insList.map(item => item.id).join(','))

const refreshInquiry = async () => {
  resetInquiryList()
  await nextTick()
  itemListRef.value?.calcMaxKeyWidth()
  initCollapseAndRenewItem()
  payInquiry()
  renewInquiry()
}

// 总价
const totalPrice = computed(() => {
  let totalDiscountMoney = 0
  let totalMoney = 0

  for (const el of instancePayList.value) {
    totalDiscountMoney = NP.plus(totalDiscountMoney, el.totalDiscountMoney || 0)
    totalMoney = NP.plus(totalMoney, el.totalMoney || 0)
  }

  return {
    totalDiscountMoney,
    totalMoney,
  }
})

// 续费
const confirmHandle = () => {
  const serverIds = props.insList.map(el => el.id)
  const dataDiskIds: string[] = []
  const eipIds: string[] = []

  for (const renewItemkey in renewItemRef.value) {
    dataDiskIds.push(...renewItemRef.value[renewItemkey].getRenewDataDiskId())
    eipIds.push(...renewItemRef.value[renewItemkey].getRenewEipId())
  }

  const params = {
    renewMonth: time.value,
    serverIds, // 服务器ID
    eipIds, // IP id
    dataDiskIds, // 数据盘id
  }
  instanceRenew(params)
}

// 弹窗打开
const open = () => {
  refreshInquiry()
}

// 弹窗关闭
const close = () => {
  time.value = 1
  isCollapse.value = false
  checked.value = false
  isShowChecked.value = false
  resetInquiryList()
}

// 续费日期更新
const changeRenewTime = () => {
  payInquiry()
  renewInquiry()
}

watch(renewInsListKey, () => {
  if (show.value) {
    refreshInquiry()
  }
})

// 支付产品的询价
const payInquiry = async () => {
  const requestId = ++payInquiryRequestId
  const dataDiskIds: string[] = []
  const eipIds: string[] = []

  for (const renewItemkey in renewItemRef.value) {
    dataDiskIds.push(...renewItemRef.value[renewItemkey].getRenewDataDiskId())
    eipIds.push(...renewItemRef.value[renewItemkey].getRenewEipId())
  }

  const renewEip = eipIds.length ? true : false

  try {
    const serverIds = props.insList.map(el => el.id)

    const params: any = {
      renewMonth: time.value,
      serverIds, // 服务器ID
      renewEip,
      dataDiskIds, // 数据盘id
      eipIds, // IP id
    }

    const res = await _instanceRenewInquiry(params)

    if (requestId !== payInquiryRequestId) return

    console.log(`_instanceRenewInquiry===>`, res)

    if (res.success) {
      instancePayList.value = res.data || []
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

// 续费产品的询价
const renewInquiry = async () => {
  const requestId = ++renewInquiryRequestId
  const dataDiskIds: string[] = []
  const eipIds: string[] = []

  for (const renewItemkey in renewItemRef.value) {
    dataDiskIds.push(...renewItemRef.value[renewItemkey].getAllDataDiskId())
    eipIds.push(...renewItemRef.value[renewItemkey].getAllEipId())
  }

  const renewEip = eipIds.length ? true : false

  try {
    const serverIds = props.insList.map(el => el.id)

    const params: any = {
      renewMonth: time.value,
      serverIds, // 服务器ID
      renewEip,
      dataDiskIds, // 数据盘id
      eipIds, // IP id
    }

    const res = await _instanceRenewInquiry(params)

    if (requestId !== renewInquiryRequestId) return

    console.log(`_instanceRenewInquiry===>`, res)

    if (res.success) {
      instanceRenewList.value = res.data || []
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.time {
  margin-right: 44px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }

  .more-wrap {
    width: 46px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border: 1px solid #fc8c00;
    border-radius: 11px;
  }
}

.line-through-text {
  margin-left: 14px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.renew-time {
  white-space: nowrap;
}
</style>
