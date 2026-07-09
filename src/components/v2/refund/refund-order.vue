<template>
  <div class="refund-order-v2">
    <section class="refund-order-v2__header">
      <h1 class="refund-order-v2__title">
        {{ t('refund.refundTitle') }}
      </h1>

      <div class="refund-order-v2__alert">
        <SvgIcon name="cat-cdn-warning" class="refund-order-v2__alert-icon" />
        <span>{{ t('refund.tipsMain') }}</span>
      </div>
    </section>

    <section v-loading="listLoading" class="refund-order-v2__content">
      <div class="refund-order-v2__main">
        <h2 class="refund-order-v2__section-title">
          {{ t('refund.refundOrder') }}
        </h2>

        <div class="refund-order-v2__groups">
          <article v-for="group in refundGroups" :key="group.key" class="refund-order-v2__group">
            <div class="refund-order-v2__group-head">
              <span>{{ group.title }}</span>
              <strong>{{ formatAmountText(group.amount) }}</strong>
            </div>

            <div class="refund-order-v2__table">
              <template v-for="(row, rowIndex) in group.rows" :key="`${group.key}-${rowIndex}`">
                <div class="refund-order-v2__cell refund-order-v2__cell--label">
                  {{ row.left.label }}
                </div>
                <div class="refund-order-v2__cell refund-order-v2__cell--value">
                  {{ row.left.value }}
                </div>
                <div class="refund-order-v2__cell refund-order-v2__cell--label">
                  {{ row.right.label }}
                </div>
                <div class="refund-order-v2__cell refund-order-v2__cell--value">
                  {{ row.right.value }}
                </div>
              </template>
            </div>
          </article>
        </div>
      </div>

      <aside class="refund-order-v2__summary">
        <h2 class="refund-order-v2__section-title">
          {{ t('refund.info') }}
        </h2>

        <div class="refund-order-v2__summary-list">
          <div
            v-for="(item, index) in refundInfoList"
            :key="`${item.resourceID}-${index}`"
            class="refund-order-v2__summary-item"
          >
            <span>{{ `${t('refund.resourceID')} ${item.resourceID}` }}</span>
            <span>{{ formatAmountText(item.refundPrice) }}</span>
          </div>
        </div>

        <div class="refund-order-v2__summary-total">
          <span>{{ t('refund.price') }}</span>
          <strong>{{ formatAmountText(refundAllPrice) }}</strong>
        </div>

        <el-button class="refund-order-v2__submit" :loading="loading" type="primary" @click="submit">
          {{ t('refund.comfirm') }}
        </el-button>
      </aside>
    </section>

    <ConfirmRefund ref="confirmRefundRef" :refund-price="refundAllPrice" @refund="refund" />
  </div>
</template>

<script setup lang="ts">
import ConfirmRefund from '@/components/cvm/refund/confirm-refund.vue'
import { useRefund } from '@/views/cvm/hooks/use-refund'
import { useCvmStore, useNetworkStore } from '@/store'
import { COST_TYPE_MAP, INS_NETWORK_CHANGE_TYPE_MAP } from '@/views/cvm/ins/config'
import NP from 'number-precision'
import t from '@/utils/i18n'

NP.enableBoundaryChecking(false)

type RefundField = {
  label: string
  value: string
}

type RefundRow = {
  left: RefundField
  right: RefundField
}

type RefundGroup = {
  key: string
  title: string
  amount: number
  rows: RefundRow[]
}

interface PropType {
  loading?: boolean
  product: string
  inquiryReqParams: any
}

const props = withDefaults(defineProps<PropType>(), {
  loading: false,
  product: '',
  inquiryReqParams: () => ({}),
})

const emits = defineEmits<{
  (event: 'refund'): void
}>()

const cvmStore = useCvmStore()
const networkStore = useNetworkStore()
const { refundInstanceInquiry, loading: listLoading } = useRefund()

const refundList = ref<any>({})
const confirmRefundRef = ref<InstanceType<typeof ConfirmRefund>>()

const normalizeValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '--'
  return String(value)
}

const formatAmount = (value: unknown) => Number(value || 0).toFixed(2)
const formatAmountText = (value: unknown) => `$${formatAmount(value)} USD`

const buildRows = (fields: RefundField[]) => {
  const rows: RefundRow[] = []

  for (let i = 0; i < fields.length; i += 2) {
    rows.push({
      left: fields[i] || { label: '', value: '' },
      right: fields[i + 1] || { label: '', value: '' },
    })
  }

  return rows
}

const handleRowBandwidth = (row: any) => {
  const res = row.networkInfos?.find((el: any) => el.primaryType === 1)
  if (!res) return '--'
  return t('refund.bandwidthDesc', [INS_NETWORK_CHANGE_TYPE_MAP[res.networkChangeType], res.mainPublicBandwidth])
}

const handleRowVpc = (row: any) => {
  const res = row.networkInfos?.find((el: any) => el.primaryType === 1)
  return res?.vpcName || '--'
}

const handleRowSubnet = (row: any) => {
  const res = row.networkInfos?.find((el: any) => el.primaryType === 1)
  return res?.subNetworkName || '--'
}

const cvm = computed(() => {
  const list = refundList.value.refundInstanceInquiry ? [refundList.value.refundInstanceInquiry] : []
  return { show: list.length > 0, list }
})

const disk = computed(() => ({
  show: Boolean(refundList.value.refundDiskInquiry?.length),
  list: refundList.value.refundDiskInquiry || [],
}))

const eip = computed(() => ({
  show: Boolean(refundList.value.refundEipInquiry?.length),
  list: refundList.value.refundEipInquiry || [],
}))

const refundInfoList = computed(() => {
  const cvmRefundInfo = cvm.value.list.map((el: any) => ({
    resourceID: el.insUuid,
    refundPrice: Number(el.refundAmount || 0),
  }))

  const diskRefundInfo = disk.value.list.map((el: any) => ({
    resourceID: el.diskInsId,
    refundPrice: Number(el.refundMoney || 0),
  }))

  const eipRefundInfo = eip.value.list.map((el: any) => ({
    resourceID: el.eipUuid,
    refundPrice: Number(el.refundMoney || 0),
  }))

  return [...cvmRefundInfo, ...diskRefundInfo, ...eipRefundInfo]
})

const refundAllPrice = computed(() => {
  return refundInfoList.value.reduce((accumulator, item) => NP.plus(accumulator, item.refundPrice), 0)
})

const refundGroups = computed<RefundGroup[]>(() => {
  const groups: RefundGroup[] = []

  cvm.value.list.forEach((item: any, index: number) => {
    groups.push({
      key: `cvm-${index}-${item.insUuid}`,
      title: t('refund.cvmTitle'),
      amount: Number(item.refundAmount || 0),
      rows: buildRows([
        { label: t('refund.resourceID'), value: normalizeValue(item.insUuid) },
        { label: t('refund.orderType'), value: t('refund.returnGoods') },
        { label: t('refund.region'), value: normalizeValue(item.regionName) },
        { label: t('refund.originaPay'), value: normalizeValue(COST_TYPE_MAP[2]) },
        { label: t('refund.zone'), value: normalizeValue(item.zoneName) },
        { label: t('refund.buyNum'), value: '1' },
        { label: t('refund.insType'), value: normalizeValue(item.specificationName) },
        { label: t('refund.createTime'), value: normalizeValue(item.createTime) },
        { label: t('refund.image'), value: normalizeValue(item.imageName) },
        { label: t('refund.usedTime'), value: normalizeValue(item.usedTime) },
        { label: t('refund.storage'), value: normalizeValue(t('refund.sysDisk', [item.systemDiskTypeName])) },
        { label: t('refund.refundPrice'), value: formatAmount(item.refundAmount) },
        { label: t('refund.bandwidth'), value: handleRowBandwidth(item) },
        { label: '', value: '' },
        { label: t('refund.insName'), value: normalizeValue(item.instanceName) },
        { label: '', value: '' },
        { label: t('refund.belongNet'), value: handleRowVpc(item) },
        { label: '', value: '' },
        { label: t('refund.subnet'), value: handleRowSubnet(item) },
        { label: '', value: '' },
      ]),
    })
  })

  disk.value.list.forEach((item: any, index: number) => {
    groups.push({
      key: `disk-${index}-${item.diskInsId}`,
      title: t('refund.diskTitle'),
      amount: Number(item.refundMoney || 0),
      rows: buildRows([
        { label: t('refund.resourceID'), value: normalizeValue(item.diskInsId) },
        { label: t('refund.orderType'), value: t('refund.returnGoods') },
        { label: t('refund.diskType'), value: normalizeValue(t('refund.diskType')) },
        { label: t('refund.originaPay'), value: normalizeValue(COST_TYPE_MAP[item.costType]) },
        { label: t('refund.diskSize'), value: `${normalizeValue(item.size)}GB` },
        { label: t('refund.buyNum'), value: normalizeValue(item.count) },
        { label: t('refund.diskTypeName'), value: normalizeValue(item.diskTypeName) },
        { label: t('refund.createTime'), value: normalizeValue(item.createTime) },
        { label: t('refund.diskName'), value: normalizeValue(item.diskName) },
        { label: t('refund.usedTime'), value: normalizeValue(item.usedTime) },
        { label: t('refund.zone'), value: normalizeValue(item.zoneName) },
        { label: t('refund.refundPrice'), value: formatAmount(item.refundMoney) },
      ]),
    })
  })

  eip.value.list.forEach((item: any, index: number) => {
    groups.push({
      key: `eip-${index}-${item.eipUuid}`,
      title: t('refund.eipTitle'),
      amount: Number(item.refundMoney || 0),
      rows: buildRows([
        { label: t('refund.resourceID'), value: normalizeValue(item.eipUuid) },
        { label: t('refund.orderType'), value: t('refund.returnGoods') },
        { label: t('refund.region'), value: normalizeValue(item.regionName) },
        { label: t('refund.originaPay'), value: normalizeValue(COST_TYPE_MAP[item.costType]) },
        { label: t('refund.costType'), value: normalizeValue(COST_TYPE_MAP[item.costType]) },
        { label: t('refund.buyNum'), value: normalizeValue(item.num) },
        { label: t('refund.bandwidthLimit'), value: normalizeValue(item.maxBandwidth) },
        { label: t('refund.createTime'), value: normalizeValue(item.createTime) },
        { label: t('refund.durate'), value: item.duration ? `${item.duration}个月` : '--' },
        { label: t('refund.usedTime'), value: normalizeValue(item.useTime) },
        { label: '', value: '' },
        { label: t('refund.refundPrice'), value: formatAmount(item.refundMoney) },
      ]),
    })
  })

  return groups
})

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const submit = () => {
  changeShow(confirmRefundRef.value)
}

const refundInstanceInquiryFn = () => {
  const params =
    props.product === 'eip' ? networkStore.refundOrder.inquiryReqParams : cvmStore.refundOrder.inquiryReqParams
  const cb = (res: any) => {
    if (res.success) {
      refundList.value = res.data || {}
    }
  }
  refundInstanceInquiry(params, cb)
}

const refund = () => {
  emits('refund')
}

onMounted(() => {
  refundInstanceInquiryFn()
})

watch(
  () => props.inquiryReqParams,
  () => {
    refundInstanceInquiryFn()
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.refund-order-v2 {
  display: flex;
  flex-direction: column;
  gap: 48px;
  min-height: 100%;
  padding: 36px 40px 56px;
  margin: -16px;
  background: #fff;
}

.refund-order-v2__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: #191c23;
}

.refund-order-v2__alert {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  margin-top: 36px;
  font-size: 14px;
  line-height: 22px;
  color: #e54839;
  background: rgb(229 72 57 / 12%);
}

.refund-order-v2__alert-icon {
  width: 20px;
  height: 20px;
  color: #e54839;
}

.refund-order-v2__content {
  display: flex;
  gap: 38px;
  align-items: flex-start;
}

.refund-order-v2__main {
  flex: 1;
  min-width: 0;
}

.refund-order-v2__summary {
  width: 300px;
}

.refund-order-v2__section-title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.refund-order-v2__groups {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.refund-order-v2__group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: #191c23;
  border: 1px solid #e8ecf3;
  border-bottom: 0;
}

.refund-order-v2__group-head strong,
.refund-order-v2__summary-total strong {
  font-size: 16px;
  color: #ff720d;
}

.refund-order-v2__table {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr) 176px minmax(0, 1fr);
}

.refund-order-v2__cell {
  min-height: 44px;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 22px;
  border: 1px solid #e8ecf3;
  border-right: 0;
  border-bottom: 0;
}

.refund-order-v2__cell:nth-child(4n) {
  border-right: 1px solid #e8ecf3;
}

.refund-order-v2__cell:nth-last-child(-n + 4) {
  border-bottom: 1px solid #e8ecf3;
}

.refund-order-v2__cell--label {
  color: #828b9c;
  background: #f9fafc;
}

.refund-order-v2__cell--value {
  color: #191c23;
  word-break: break-word;
  background: #fff;
}

.refund-order-v2__summary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e8ecf3;
}

.refund-order-v2__summary-item,
.refund-order-v2__summary-total {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.refund-order-v2__summary-item span:first-child {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.refund-order-v2__summary-total {
  margin-bottom: 16px;
}

.refund-order-v2__submit {
  width: 100%;
}

@media (width <= 1200px) {
  .refund-order-v2__content {
    flex-direction: column;
  }

  .refund-order-v2__summary {
    width: 100%;
  }
}

@media (width <= 900px) {
  .refund-order-v2 {
    padding: 24px 20px 40px;
  }

  .refund-order-v2__table {
    grid-template-columns: 140px minmax(0, 1fr);
  }

  .refund-order-v2__cell:nth-child(2n) {
    border-right: 1px solid #e8ecf3;
  }

  .refund-order-v2__cell:nth-child(4n + 3),
  .refund-order-v2__cell:nth-child(4n + 4) {
    border-top: 0;
  }
}
</style>
