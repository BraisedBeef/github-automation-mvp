<template>
  <div class="mb20">
    <!-- top -->
    <div class="top df ac jsb">
      <div class="lt df ac" @click="isShow = !isShow">
        <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
          <CaretRight />
        </el-icon>
        <span class="cursor-pointer ml4">
          {{ networkinfo.eniName }} | {{ networkinfo.eniUuid }}({{
            primaryTypeOpts.find(item => item.value === networkinfo.primaryType)?.label
          }})
        </span>
      </div>
      <div class="rt df ac jsb">
        <!-- 分配内网IP -->
        <span
          v-if="checkPermission(permMap.ins.CVM_ASSIGNMENT_INTRANET_IP)"
          class="text-primary cursor-pointer mr10"
          :class="
            networkinfo.eips.length < props.maxIpNums ? 'text-primary cursor-pointer' : 'text-primary disabled-btn'
          "
          @click="assignIp(networkinfo.eniId, setDistributeIPRef, true)"
          >{{ t('ins.networkCard.allocatePrivateIp') }}</span
        >
        <!-- 解绑 -->
        <span
          v-if="checkPermission(permMap.ins.CVM_UNBIND_ENI)"
          :class="networkinfo.primaryType === 2 ? 'text-primary cursor-pointer' : 'text-primary disabled-btn'"
          @click="unbindFn"
          >{{ t('ins.networkCard.unBind') }}</span
        >
      </div>
    </div>
    <el-collapse-transition v-loading="state.loading">
      <!-- bottom -->
      <div v-show="isShow" class="bottom">
        <el-table :data="networkinfo.eips" class="mt20 table">
          <!-- 内网IP -->
          <el-table-column min-width="200" :label="t('ins.networkCard.privateIp')">
            <template #default="{ row }">
              <div>{{ row.internalIp || '-' }}</div>
            </template>
          </el-table-column>
          <!-- 类型 -->
          <el-table-column min-width="200" :label="t('ins.networkCard.type')">
            <template #default="{ row }">
              <div>
                {{ eniPrivateIpIpOpts.find(item => item.value === row?.internalIpType)?.label }}
              </div>
            </template>
          </el-table-column>
          <!-- 弹性公网IP -->
          <el-table-column min-width="200" :label="t('ins.networkCard.eip')">
            <template #default="{ row }">
              <div v-if="row.publicIp && row.publicIp !== ''">
                <span>{{ row.publicIp }}</span>
                <span
                  v-if="checkPermission(permMap.ins.CVM_UNBIND_EIP)"
                  class="ml10 text-primary cursor-pointer"
                  @click="unbindEipFn(row)"
                  >{{ t('networkCard.unbound') }}</span
                >
                <div>{{ row.eipName }}</div>
              </div>
              <div v-else>
                <span>{{ t('ins.networkCard.no') }}</span>
                <span
                  v-if="checkPermission(permMap.ins.CVM_BIND_EIP)"
                  class="ml10 text-primary cursor-pointer"
                  @click="assignEIp(row)"
                  >{{ t('ins.networkCard.bind') }}</span
                >
              </div>
            </template>
          </el-table-column>
          <!-- 备注 -->
          <el-table-column min-width="200" :label="t('ins.networkCard.notes')">
            <template #default="{ row }">
              {{ row.remark || '-' }}
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column width="200" :label="t('ins.networkCard.opts')">
            <template #default="{ row }">
              <!-- 释放内网IP -->
              <span
                v-if="row.internalIpType === 2 && checkPermission(permMap.ins.CVM_RELEASE_INTRANET_IP)"
                class="text-primary cursor-pointer"
                @click="releaseFn(row)"
                >{{ t('ins.networkCard.release') }}</span
              >
              <!-- 苏杰说暂时不做修改主ip功能 -->
              <!-- <el-tooltip v-else-if="networkinfo.primaryType === 2" :content="t('ins.networkCard.noModify')">
                <span class="text-primary disabled-btn">{{ t('ins.networkCard.modifyPrimaryIp') }}</span>
              </el-tooltip>
              <span v-else class="text-primary cursor-pointer" @click="assignIp(networkinfo.eniId, setEditIPRef)">{{
                t('ins.networkCard.modifyPrimaryIp')
              }}</span> -->
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-collapse-transition>

    <!-- 分配内网IP -->
    <SetDistributeIP
      ref="setDistributeIPRef"
      :detail="networkCarDetail"
      :subnet-detail="subnetDetail"
      :ip-list="ipList"
      @success="refreshLoading"
    />
    <!-- 解绑弹性网卡 -->
    <UnBindNetworkCard ref="unBindNetworkCardRef" :networkinfo="networkinfo" @success="refreshLoading" />
    <!-- 修改主IP -->
    <!-- <SetEditIP ref="setEditIPRef" :detail="networkCarDetail" /> -->
    <!-- 绑定弹性公网ip -->
    <BindPublicIp ref="bindPublicIpRef" :eni-id="networkinfo.eniId" @success="refreshLoading" />
    <!-- 释放此内网IP确认框 -->
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

    <!-- 解绑弹性公网IP确认框 -->
    <CatDialog
      v-model:dialog="state.showUnbind"
      :title="t('networkCard.confirmEip')"
      :loading="state.unbindLoading"
      width="560px"
      @confirm="handleUnbind"
      @close="closeUnbind"
    >
      <p>
        {{ t('networkCard.confirmEipTip') }}
      </p>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { CaretRight } from '@element-plus/icons-vue'
import { primaryTypeOpts } from '@/views/network/network-card/list/config'
import { eniPrivateIpIpOpts } from '@/views/network/network-card/detail/config'
import SetDistributeIP from '@/views/network/network-card/detail/components/set-distribute-ip/index.vue'
import { getQuerySubnetDetail } from '@/apis/network/subnet'
import { getEniDetail, delIp, getEniPrivateIpList } from '@/apis/network/network-card'
import UnBindNetworkCard from './un-bind-network-card.vue'
import SetEditIP from '@/views/network/network-card/detail/components/set-edit-ip/index.vue'
import BindPublicIp from '@/views/network/network-card/detail/components/bind-public-ip/index.vue'
import { message } from '@/utils/message'
import { GetEipDetailReq } from '@/apis/network/type/public-ip'
import { disassociateEip } from '@/apis/network/public-ip'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  networkinfo: any
  maxIpNums: number // 最大分配内网IP个数
}

const props = withDefaults(defineProps<PropType>(), {})

const listInstanceDetail = inject('listInstanceDetailFn') as () => void

const isShow = ref<boolean>(true) // 是否显示详情

const setDistributeIPRef = ref<InstanceType<typeof SetDistributeIP>>() // 分配内网IP
const unBindNetworkCardRef = ref<InstanceType<typeof UnBindNetworkCard>>() // 解绑弹性网卡
const setEditIPRef = ref<InstanceType<typeof SetEditIP>>() // 修改主IP
const bindPublicIpRef = ref<InstanceType<typeof BindPublicIp>>() // 绑定弹性公网ip

const networkCarDetail = ref<any>(undefined)
const subnetDetail = ref<any>(undefined)
const ipList = ref<any>([])

const state = reactive<{
  loading: boolean
  unbindId: number
  showUnbind: boolean
  unbindLoading: boolean
}>({
  loading: false,
  unbindLoading: false,
  unbindId: NaN,
  showUnbind: false,
})

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 绑定弹性公网ip
const assignEIp = row => {
  ;(bindPublicIpRef.value as InstanceType<typeof BindPublicIp>).show = true
  ;(bindPublicIpRef.value as InstanceType<typeof BindPublicIp>).detail = row
}
// 解绑弹性公网ip
const unbindEipFn = (row: any) => {
  state.unbindId = row.eipId
  state.showUnbind = true
}

// 确认解绑弹性公网ip
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
// 取消解绑弹性公网ip
const closeUnbind = () => {
  state.unbindId = NaN
  state.showUnbind = false
  state.unbindLoading = false
}

// 分配内网ip的方法
const assignIp = (eniId, ins: any, subnetKey = false) => {
  if (props.networkinfo.eips.length >= props.maxIpNums) return
  if (!networkCarDetail.value) {
    getDetail(eniId, ins, subnetKey)
  } else {
    ins.show = true
    if (ins?.detail) ins.detail = networkCarDetail.value
  }
}
// 获取弹性网卡详情
const getDetail = async (eniId, ins, subnetKey) => {
  ins.loading = true
  const params = { eniId }
  try {
    const res = await getEniDetail(params)
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

// 查询网卡内网IP列表
const getIpList = async eniId => {
  const params = { eniId }
  try {
    const res = await getEniPrivateIpList(params)
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

// 查询子网详情
const getSubnetDetail = async (subnetId, ins) => {
  const params = { subnetId }
  try {
    const res = await getQuerySubnetDetail(params)
    subnetDetail.value = res.data
    ins.show = true
  } catch (err) {
    console.log('error', err)
  } finally {
    ins.loading = false
  }
}

// 释放
const releaseId = ref<number>(NaN)
const showRelease = ref<boolean>(false)
const releaseLoading = ref<boolean>(false)
const releaseFn = row => {
  releaseId.value = row.internalIpId
  showRelease.value = true
}
// 确认释放内网ip
const handleRelease = async () => {
  const params = { eniId: props.networkinfo.eniId, privateIpId: releaseId.value }
  releaseLoading.value = true
  try {
    const res = await delIp(params)
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
// 取消释放内网ip
const closeRelease = () => {
  releaseId.value = NaN
  showRelease.value = false
}

// 解绑
const unbindFn = () => {
  if (props.networkinfo.primaryType === 1) return
  changeShow(unBindNetworkCardRef.value)
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}
</script>

<style lang="scss" scoped>
.top {
  height: 50px;
  background: #f9fafc;
  border-radius: 4px;

  .lt {
    padding-left: 20px;

    span {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }
  }

  .rt {
    padding-right: 20px;

    // width: 200px;
    padding-left: 20px;

    span {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
    }
  }
}

.table {
  :deep(.el-table__header-wrapper) {
    th {
      background-color: #fff !important;
    }
  }
}

.is-reverse {
  transform: rotateZ(90deg);
}

.disabled-btn {
  cursor: not-allowed;
  opacity: 0.5;
}

.mr10 {
  margin-right: 10px;
}
</style>
