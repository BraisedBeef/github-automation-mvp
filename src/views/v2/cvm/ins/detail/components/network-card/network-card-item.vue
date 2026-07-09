<template>
  <section class="cvm-ins-network-card-item-v2">
    <div class="cvm-ins-network-card-item-v2__head">
      <button class="cvm-ins-network-card-item-v2__summary" type="button" @click="isShow = !isShow">
        <el-icon class="cvm-ins-network-card-item-v2__arrow" :class="{ 'is-open': isShow }">
          <CaretRight />
        </el-icon>
        <span class="cvm-ins-network-card-item-v2__summary-text">
          {{ networkinfo.eniName }} | {{ networkinfo.eniUuid }}({{
            primaryTypeOpts.find(item => item.value === networkinfo.primaryType)?.label
          }})
        </span>
      </button>

      <div class="cvm-ins-network-card-item-v2__actions">
        <button
          v-if="checkPermission(permMap.ins.CVM_ASSIGNMENT_INTRANET_IP)"
          class="cvm-ins-network-card-item-v2__link"
          :class="{ 'is-disabled': networkinfo.eips.length >= props.maxIpNums }"
          type="button"
          @click="assignIp(networkinfo.eniId, setDistributeIPRef, true)"
        >
          {{ t('ins.networkCard.allocatePrivateIp') }}
        </button>

        <button
          v-if="checkPermission(permMap.ins.CVM_UNBIND_ENI)"
          class="cvm-ins-network-card-item-v2__link"
          :class="{ 'is-disabled': networkinfo.primaryType !== 2 }"
          type="button"
          @click="unbindFn"
        >
          {{ t('ins.networkCard.unBind') }}
        </button>
      </div>
    </div>

    <el-collapse-transition v-loading="state.loading">
      <div v-show="isShow" class="cvm-ins-network-card-item-v2__body">
        <TableV2 :data="networkinfo.eips" :show-pagination="false" :empty-min-height="160">
          <el-table-column min-width="180" :label="t('ins.networkCard.privateIp')">
            <template #default="{ row }">
              {{ row.internalIp || '-' }}
            </template>
          </el-table-column>

          <el-table-column min-width="150" :label="t('ins.networkCard.type')">
            <template #default="{ row }">
              {{ eniPrivateIpIpOpts.find(item => item.value === row?.internalIpType)?.label }}
            </template>
          </el-table-column>

          <el-table-column min-width="240" :label="t('ins.networkCard.eip')">
            <template #default="{ row }">
              <div v-if="row.publicIp && row.publicIp !== ''" class="cvm-ins-network-card-item-v2__ip-cell">
                <div>{{ row.publicIp }}</div>
                <button
                  v-if="checkPermission(permMap.ins.CVM_UNBIND_EIP)"
                  class="cvm-ins-network-card-item-v2__inline-link"
                  type="button"
                  @click="unbindEipFn(row)"
                >
                  {{ t('networkCard.unbound') }}
                </button>
                <div>{{ row.eipName }}</div>
              </div>
              <div v-else class="cvm-ins-network-card-item-v2__ip-cell">
                <span>{{ t('ins.networkCard.no') }}</span>
                <button
                  v-if="checkPermission(permMap.ins.CVM_BIND_EIP)"
                  class="cvm-ins-network-card-item-v2__inline-link"
                  type="button"
                  @click="assignEIp(row)"
                >
                  {{ t('ins.networkCard.bind') }}
                </button>
              </div>
            </template>
          </el-table-column>

          <el-table-column min-width="160" :label="t('ins.networkCard.notes')">
            <template #default="{ row }">
              {{ row.remark || '-' }}
            </template>
          </el-table-column>

          <el-table-column min-width="160" :label="t('ins.networkCard.opts')">
            <template #default="{ row }">
              <button
                v-if="row.internalIpType === 2 && checkPermission(permMap.ins.CVM_RELEASE_INTRANET_IP)"
                class="cvm-ins-network-card-item-v2__inline-link"
                type="button"
                @click="releaseFn(row)"
              >
                {{ t('ins.networkCard.release') }}
              </button>
            </template>
          </el-table-column>
        </TableV2>
      </div>
    </el-collapse-transition>

    <SetDistributeIP
      ref="setDistributeIPRef"
      :detail="networkCarDetail"
      :subnet-detail="subnetDetail"
      :ip-list="ipList"
      @success="refreshLoading"
    />
    <UnBindNetworkCard ref="unBindNetworkCardRef" :networkinfo="networkinfo" @success="refreshLoading" />
    <BindPublicIp ref="bindPublicIpRef" :eni-id="networkinfo.eniId" @success="refreshLoading" />

    <CatDialog
      v-model:dialog="showRelease"
      :title="t('ins.networkCard.releaseInternalIpTitle')"
      :loading="releaseLoading"
      width="550px"
      @confirm="handleRelease"
      @close="closeRelease"
    >
      <p>{{ t('ins.networkCard.releaseInternalIpDesc') }}</p>
    </CatDialog>

    <CatDialog
      v-model:dialog="state.showUnbind"
      :title="t('networkCard.confirmEip')"
      :loading="state.unbindLoading"
      width="560px"
      @confirm="handleUnbind"
      @close="closeUnbind"
    >
      <p>{{ t('networkCard.confirmEipTip') }}</p>
    </CatDialog>
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { CaretRight } from '@element-plus/icons-vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { primaryTypeOpts } from '@/views/network/network-card/list/config'
import { eniPrivateIpIpOpts } from '@/views/network/network-card/detail/config'
import SetDistributeIP from '@/views/network/network-card/detail/components/set-distribute-ip/index.vue'
import { getQuerySubnetDetail } from '@/apis/network/subnet'
import { getEniDetail, delIp, getEniPrivateIpList } from '@/apis/network/network-card'
import UnBindNetworkCard from '@/views/cvm/ins/detail/components/network-card/un-bind-network-card.vue'
import BindPublicIp from '@/views/network/network-card/detail/components/bind-public-ip/index.vue'
import { message } from '@/utils/message'
import { GetEipDetailReq } from '@/apis/network/type/public-ip'
import { disassociateEip } from '@/apis/network/public-ip'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  networkinfo: any
  maxIpNums: number
}

const props = withDefaults(defineProps<PropType>(), {})
const listInstanceDetail = inject('listInstanceDetailFn') as () => void

const isShow = ref(true)
const setDistributeIPRef = ref<InstanceType<typeof SetDistributeIP>>()
const unBindNetworkCardRef = ref<InstanceType<typeof UnBindNetworkCard>>()
const bindPublicIpRef = ref<InstanceType<typeof BindPublicIp>>()

const networkCarDetail = ref<any>(undefined)
const subnetDetail = ref<any>(undefined)
const ipList = ref<any>([])

const state = reactive({
  loading: false,
  unbindId: NaN,
  showUnbind: false,
  unbindLoading: false,
})

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const assignEIp = row => {
  ;(bindPublicIpRef.value as InstanceType<typeof BindPublicIp>).show = true
  ;(bindPublicIpRef.value as InstanceType<typeof BindPublicIp>).detail = row
}

const unbindEipFn = (row: any) => {
  state.unbindId = row.eipId
  state.showUnbind = true
}

const handleUnbind = async () => {
  const params: GetEipDetailReq = { eipId: state.unbindId as number }
  state.unbindLoading = true
  try {
    const res = await disassociateEip(params)
    if (res.success) {
      message.success(t('publicIp.unbindPublicIpSuccess'))
      closeUnbind()
      refreshLoading()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
    state.unbindLoading = false
  }
}

const refreshLoading = () => {
  state.loading = true
  setTimeout(() => {
    listInstanceDetail()
    state.loading = false
  }, 4000)
}

const closeUnbind = () => {
  state.unbindId = NaN
  state.showUnbind = false
  state.unbindLoading = false
}

const assignIp = (eniId, ins: any, subnetKey = false) => {
  if (props.networkinfo.eips.length >= props.maxIpNums) return
  if (!networkCarDetail.value) {
    getDetail(eniId, ins, subnetKey)
  } else {
    ins.show = true
    if (ins?.detail) ins.detail = networkCarDetail.value
  }
}

const getDetail = async (eniId, ins, subnetKey) => {
  ins.loading = true
  try {
    const res = await getEniDetail({ eniId })
    if (res.success) {
      networkCarDetail.value = res.data
      if (ins?.detail) ins.detail = networkCarDetail.value
      if (!subnetDetail.value && subnetKey) {
        getSubnetDetail(res.data.subnetId, ins)
        getIpList(eniId)
      } else {
        ins.show = true
        ins.loading = false
      }
    } else {
      ins.loading = false
    }
  } catch (err) {
    console.log('error', err)
    ins.loading = false
  }
}

const getIpList = async eniId => {
  try {
    const res = await getEniPrivateIpList({ eniId })
    if (res.success) {
      ipList.value = (res.data || []).map(item => ({
        ...item,
        loading: false,
        editRemark: item.remark === '' ? '-' : item.remark,
      }))
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  }
}

const getSubnetDetail = async (subnetId, ins) => {
  try {
    const res = await getQuerySubnetDetail({ subnetId })
    subnetDetail.value = res.data
    ins.show = true
  } catch (err) {
    console.log('error', err)
  } finally {
    ins.loading = false
  }
}

const releaseId = ref<number>(NaN)
const showRelease = ref(false)
const releaseLoading = ref(false)

const releaseFn = row => {
  releaseId.value = row.internalIpId
  showRelease.value = true
}

const handleRelease = async () => {
  releaseLoading.value = true
  try {
    const res = await delIp({ eniId: props.networkinfo.eniId, privateIpId: releaseId.value })
    releaseLoading.value = false
    if (res.success) {
      message.success(res.msg)
      closeRelease()
      listInstanceDetail()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    releaseLoading.value = false
    console.log('error', err)
  }
}

const closeRelease = () => {
  releaseId.value = NaN
  showRelease.value = false
}

const unbindFn = () => {
  if (props.networkinfo.primaryType === 1) return
  changeShow(unBindNetworkCardRef.value)
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}
</script>

<style lang="scss" scoped>
.cvm-ins-network-card-item-v2 {
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-network-card-item-v2 + .cvm-ins-network-card-item-v2 {
  margin-top: 20px;
}

.cvm-ins-network-card-item-v2__head {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 16px;
  background: #eff4fc;
}

.cvm-ins-network-card-item-v2__summary {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 0;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cvm-ins-network-card-item-v2__summary-text {
  overflow: hidden;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cvm-ins-network-card-item-v2__arrow {
  color: #6b7280;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(90deg);
  }
}

.cvm-ins-network-card-item-v2__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.cvm-ins-network-card-item-v2__link,
.cvm-ins-network-card-item-v2__inline-link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cvm-ins-network-card-item-v2__link.is-disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.cvm-ins-network-card-item-v2__body {
  padding: 0;
}

.cvm-ins-network-card-item-v2__ip-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  align-items: center;
}

@media (width <= 1024px) {
  .cvm-ins-network-card-item-v2__head {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }
}
</style>
