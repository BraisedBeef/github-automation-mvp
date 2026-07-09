<template>
  <div>
    <el-card shadow="never" class="page-box" :body-style="bodyStyle">
      <el-button
        v-if="checkPermission(permMap.eni.ENI_ASSIGNMENT_INTRANET_IP)"
        type="primary"
        @click="changeShow(setDistributeIPRef)"
      >
        {{ t('networkCard.allocationInternalIP') }}
      </el-button>
      <el-table v-loading="state.ipLoading" :data="state.ipList" class="mt20 table">
        <!-- 内网IP -->
        <el-table-column min-width="160" :label="t('networkCard.internalIP')">
          <template #default="{ row }">
            <Copy :text="row.ip" />
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column min-width="120" :label="t('networkCard.type')">
          <template #default="{ row }">
            <div>{{ eniPrivateIpIpOpts.find(item => item.value === row.type)?.label }}</div>
          </template>
        </el-table-column>
        <!-- 弹性公网IP -->
        <el-table-column min-width="180" :label="t('networkCard.publicIp')">
          <template #default="{ row }">
            <div v-if="row.eip && row.eip !== ''" class="df ac">
              <Copy :text="row.eip" />
              <span
                v-if="checkPermission(permMap.eni.ENI_UNBIND_EIP)"
                class="ml10 text-primary cursor-pointer"
                @click="unbindFn(row)"
                >{{ t('networkCard.unbound') }}</span
              >
            </div>
            <div v-if="!row.eip">
              <span>{{ t('networkCard.notHave') }}</span>
              <span
                v-if="checkPermission(permMap.eni.ENI_BIND_EIP)"
                class="ml10 text-primary cursor-pointer"
                @click="bindFn(row)"
                >{{ t('networkCard.bind') }}</span
              >
            </div>
          </template>
        </el-table-column>
        <!-- 备注 -->
        <el-table-column min-width="260" :label="t('networkCard.notes')" show-overflow-tooltip>
          <template #default="{ row, $index }">
            <div class="table-td_tooltip" style="width: 100%">
              <TableEditInput
                :ref="
                  (el: any) => {
                    editRemarkList[$index] = el
                  }
                "
                v-model="row.editRemark"
                v-loading="row.loading"
                :cancel-fn="cancelRemark(row)"
                input-style="max-width: 260px;width: 260px"
                @confirm="val => updateRemark(val, row, $index)"
              />
            </div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column min-width="140" :label="t('networkCard.operate')">
          <template #default="{ row }">
            <span
              v-if="row.type === 2 && checkPermission(permMap.eni.ENI_RELEASE_INTRANET_IP)"
              class="text-primary cursor-pointer"
              :class="row.eip && row.eip !== '' ? 'disabled-btn' : ''"
              @click="releaseFn(row)"
              >{{ t('networkCard.release') }}</span
            >
            <!-- 苏杰说暂时不做修改主ip功能 -->
            <!-- <el-tooltip effect="light" v-else-if="props.detail.primaryType === 2" :content="t('networkCard.expandNetworkCardCannotEdit')">
              <span class="text-primary disabled-btn">{{ t('networkCard.editPrimaryIp') }}</span>
            </el-tooltip>
            <span v-else class="text-primary cursor-pointer" @click="editPrimaryIP(row)">{{ t('networkCard.editPrimaryIp') }}</span> -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改主IP -->
    <SetEditIP ref="setEditIPRef" :detail="props.detail" :reserve-ip-list="state.reserveIpList" />
    <!-- 分配内网IP -->
    <SetDistributeIP
      ref="setDistributeIPRef"
      :detail="props.detail"
      :ip-list="state.ipList"
      :subnet-detail="state.subnetDetail"
      @success="getIpList"
    />
    <!-- 绑定弹性公网ip -->
    <BindPublicIp ref="bindPublicIpRef" :eni-id="eniId" @success="loadingRefresh" />
    <!-- 释放此内网IP确认框 -->
    <CatDialog
      v-model:dialog="state.showRelease"
      :title="t('networkCard.confirmReleaseInternalIP')"
      :loading="state.releaseLoading"
      width="520px"
      @confirm="handleRelease"
      @close="closeRelease"
    >
      <p>{{ t('networkCard.confirmReleaseInternalIPTip') }}</p>
    </CatDialog>
    <!-- 解绑弹性公网IP确认框 -->
    <CatDialog
      v-model:dialog="state.showUnbind"
      :title="t('networkCard.confirmEip')"
      :loading="state.unbindLoading"
      width="600px"
      @confirm="handleUnbind"
      @close="closeUnbind"
    >
      <p>
        {{ t('networkCard.confirmEipTip') }}
      </p>
    </CatDialog>
  </div>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import SetEditIP from '../set-edit-ip/index.vue'
import SetDistributeIP from '../set-distribute-ip/index.vue'
import BindPublicIp from '../bind-public-ip/index.vue'
import { getEniPrivateIpList, updateIp, delIp, eniUnbindVm } from '@/apis/network/network-card'
import { getQuerySubnetDetail } from '@/apis/network/subnet'
import { eniPrivateIpIpOpts } from '../../config'
import { disassociateEip } from '@/apis/network/public-ip'
import { GetEipDetailReq } from '@/apis/network/type/public-ip'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.eni,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

interface PropType {
  eniId: any
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const bodyStyle = { height: '100%' }

const state = reactive<{
  ipList: any[] // 内网ip列表
  ipLoading: boolean
  subnetDetail: any // 子网详情
  reserveIpList: any[] // 子网预留和已用ip列表
  showRelease: boolean // 释放内网ip弹窗显示key
  releaseId: number // 当前要释放的内网ip
  releaseLoading: boolean
  showUnbind: boolean // 解绑弹性公网ip弹窗显示key
  unbindId: number // 当前要解绑的弹性公网ip
  unbindLoading: boolean
}>({
  ipList: [],
  ipLoading: false,
  subnetDetail: {},
  reserveIpList: [],
  showRelease: false,
  releaseId: NaN,
  releaseLoading: false,
  showUnbind: false,
  unbindId: NaN,
  unbindLoading: false,
})

const setEditIPRef = ref<InstanceType<typeof SetEditIP>>() // 修改主IP
const setDistributeIPRef = ref<InstanceType<typeof SetDistributeIP>>() // 分配内网IP
const bindPublicIpRef = ref<InstanceType<typeof BindPublicIp>>() // 绑定弹性公网ip

// loading刷新页面显示
const loadingRefresh = () => {
  state.ipLoading = true
  setTimeout(() => {
    getIpList()
  }, 4000)
}

// 查询网卡内网IP列表
const getIpList = async () => {
  const params = { eniId: props.eniId }
  state.ipLoading = true
  try {
    const res = await getEniPrivateIpList(params)
    if (res.success) {
      state.ipList = (res.data || []).map(item => ({
        ...item,
        loading: false,
        editRemark: item.remark === '' ? '-' : item.remark,
      }))
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.ipLoading = false
  }
}

// 查询子网详情
const getSubnetDetail = async () => {
  const params = { subnetId: props.detail.subnetId }
  try {
    const res = await getQuerySubnetDetail(params)
    state.subnetDetail = res.data
    state.reserveIpList = [...(res.data?.reserveIpList || []), ...(res.data?.useIpList || [])]
  } catch (err) {
    console.log('error', err)
  }
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const editRemarkList = ref<any[]>([])
// 取消修改备注
const cancelRemark = row => {
  row.editRemark = row.remark === '' ? '-' : row.remark
}

// 修改备注
const updateRemark = async (val, row, index) => {
  const params = { eniId: props.eniId, privateIpId: row.id, remark: val }
  row.loading = true
  try {
    const res = await updateIp(params)
    row.loading = false
    if (res.success) {
      editRemarkList.value[index].show = false
      getIpList()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    row.loading = false
    console.log('error', err)
  }
}

// 修改主IP
const editPrimaryIP = row => {
  ;(setEditIPRef.value as InstanceType<typeof SetEditIP>).show = true
  ;(setEditIPRef.value as InstanceType<typeof SetEditIP>).editData = { ...row }
}

// 释放
const releaseFn = row => {
  if (row.eip && row.eip !== '') return // 绑定了弹性网卡的需要先解绑
  state.releaseId = row.id
  state.showRelease = true
}
// 确认释放内网ip
const handleRelease = async () => {
  const params = { eniId: props.eniId, privateIpId: state.releaseId }
  state.releaseLoading = true
  try {
    const res = await delIp(params)
    state.releaseLoading = false
    if (res.success) {
      message.success(t('networkCard.releaseSuccess'))
      closeRelease()
      getIpList()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.releaseLoading = false
    console.log('error', err)
  }
}
// 取消释放内网ip
const closeRelease = () => {
  state.releaseId = NaN
  state.showRelease = false
}

// 绑定弹性公网ip
const bindFn = row => {
  ;(bindPublicIpRef.value as InstanceType<typeof BindPublicIp>).show = true
  ;(bindPublicIpRef.value as InstanceType<typeof BindPublicIp>).detail = row
}

// 解绑
const unbindFn = row => {
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
      loadingRefresh()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
    state.unbindLoading = false
  }
}
// 取消解绑弹性公网ip
const closeUnbind = () => {
  state.unbindId = NaN
  state.showUnbind = false
  state.unbindLoading = false
}

const initFn = () => {
  getIpList()
  getSubnetDetail()
}

onMounted(() => {
  initFn()
})
</script>
<style lang="scss" scoped>
.disabled-btn {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #0063ff;
  cursor: not-allowed;
  opacity: 0.5;
}

.ml10 {
  margin-left: 10px;
}

.origin-text {
  color: #fc8c00;
}

:deep(.edit-input) {
  height: auto;
}
</style>
