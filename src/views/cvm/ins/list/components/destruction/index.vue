<template>
  <!-- 第一步 -->
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.destruction.title')"
    width="950px"
    :confirm-text="t('ins.destruction.next')"
    @confirm="confirmHandleA"
    @update:dialog="cancelA"
    @open="openA"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.destruction.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.destruction.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column min-width="180" :label="t('ins.destruction.state')">
          <template #default="{ row }">
            <StatusGroup :dot="false" :list="INS_STATE_ARR_MAP" :value="row.state" />
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="180" :label="t('ins.destruction.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.specificationInfo?.typeName }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="240" :label="t('ins.destruction.insConfig')" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="padding: 14px 0" class="table-td_tooltip">
              <p>
                <span class="mr10">{{ t('ins.destruction.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p class="text-over">{{ t('ins.destruction.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p class="text-over">{{ t('ins.destruction.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>
  </CatDialog>
  <!-- 第二步 -->
  <CatDialog
    v-model:dialog="showB"
    :title="t('ins.destruction.title')"
    width="950px"
    :confirm-text="t('ins.destruction.next')"
    @confirm="confirmHandleB"
    @update:dialog="() => {}"
    @open="() => {}"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.destruction.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.destruction.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column min-width="200" :label="t('ins.destruction.state')">
          <template #default="{ row }">
            <StatusGroup :dot="false" :list="INS_STATE_ARR_MAP" :value="row.state" />
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.destruction.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="260" :label="t('ins.destruction.insConfig')" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="padding: 14px 0" class="table-td_tooltip">
              <p>
                <span class="mr10">{{ t('ins.destruction.insConfig', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p class="text-over">{{ t('ins.destruction.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p class="text-over">{{ t('ins.destruction.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <p class="mt20 mb20 confirm-text">
      {{ t('ins.destruction.delDesc') }}
    </p>

    <div class="df ac">
      <SvgIcon style="width: 17px; height: 17px" name="cs-warning" />
      <span class="text-error ml10">{{ t('ins.destruction.noCheckDesc') }}</span>
    </div>

    <p class="mt20 df ac">
      <el-checkbox-group v-model="checked">
        <el-checkbox value="ip" name="type" label="ip" style="margin-right: 40px">
          {{ t('ins.destruction.delIpChecked') }}
        </el-checkbox>
        <el-checkbox value="dataDisk" name="type" label="dataDisk">
          {{ t('ins.destruction.delDataDiskChecked') }}
        </el-checkbox>
      </el-checkbox-group>
    </p>
  </CatDialog>
  <!-- 第三步 -->
  <CatDialog
    v-model:dialog="showC"
    :title="t('ins.destruction.title')"
    width="950px"
    :loading="comfirmLoading"
    :confirm-text="t('ins.destruction.pre')"
    :cancel-text="t('ins.destruction.close')"
    :footer="false"
    @update:dialog="cancelC"
    @open="() => {}"
  >
    <!-- tip -->
    <Tip :text="tipsC" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.destruction.selectIns', [insList.length])">
      <template #text>
        <p><span v-html="t('ins.destruction.resources1')" /></p>
      </template>

      <template #default>
        <!-- 实例 -->
        <div class="item mb20">
          <p class="len">
            {{ t('ins.destruction.selectInsC', [insList.length]) }}
          </p>
          <el-table :data="insList" class="mt20 table">
            <!-- ID/名称 -->
            <el-table-column min-width="200" :label="t('ins.destruction.idName')">
              <template #default="{ row }">
                <div class="text-primary pointer">
                  {{ row.insUuid }}
                </div>
                <div>{{ row.instanceName }}</div>
              </template>
            </el-table-column>
            <!-- 内网IP -->
            <el-table-column min-width="200" :label="t('ins.destruction.privateIp')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ handleRowMainPrivateIp(row) }}</span>
                </div>
              </template>
            </el-table-column>
            <!-- 实例类型 -->
            <el-table-column min-width="200" :label="t('ins.destruction.insType')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ row.specificationInfo?.typeName }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 云硬盘 -->
        <div class="item">
          <p class="len">
            {{ t('ins.destruction.selectDisk', [diskConfig.list.length]) }}
          </p>
          <el-table :data="diskConfig.list" class="mt20 table">
            <!-- ID/名称 -->
            <el-table-column min-width="200" :label="t('ins.destruction.idName')">
              <template #default="{ row }">
                <div class="text-primary">
                  {{ row.diskId }}
                </div>
                <div>{{ row.diskName }}</div>
              </template>
            </el-table-column>
            <!-- 属性 -->
            <el-table-column min-width="200" :label="t('ins.destruction.attr')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ DISK_TYPE_MAP[row.type] }}</span>
                </div>
              </template>
            </el-table-column>
            <!-- 配置 -->
            <el-table-column min-width="200" :label="t('ins.destruction.config')">
              <template #default="{ row }">
                <div class="df ac">
                  <span>{{ row.diskTypeName }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </Collapse>

    <p class="mt20 mb20 confirm-text">
      <span v-html="t('ins.destruction.resources2')" />
    </p>
    <p class="item-text">
      {{ t('ins.destruction.selectDisk', [diskConfig.residue || 0]) }}
    </p>
    <p class="item-text">
      {{ t('ins.destruction.selectIp', [ipConfig.residue || 0]) }}
    </p>

    <div class="cat-dialog-footer">
      <el-button plain class="cancel" @click="prevHandleC">
        {{ t('ins.destruction.pre') }}
      </el-button>
      <el-button type="primary" :loading="loading" @click="toFefund">
        <slot name="confirm">
          {{ t('ins.destruction.submit') }}
        </slot>
      </el-button>
      <el-button plain class="cancel" @click="showC = false">
        {{ t('ins.destruction.close') }}
      </el-button>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { INS_STATE_ARR_MAP, INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { useRefund } from '@/views/cvm/hooks/use-refund'
import { useIns } from '@/views/cvm/hooks/use-ins'

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()
const { setRefundOrder } = useRefund()
const { refundInstance, loading } = useIns()

const show = ref<boolean>(false)
const showB = ref<boolean>(false)
const showC = ref<boolean>(false)
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const checked = ref<string[]>([])

const tips = computed(() => [
  {
    main: t('ins.destruction.tipsMain'),
    sub: [t('ins.destruction.tipsSub1'), t('ins.destruction.tipsSub2')],
  },
])

const tipsC = computed(() => [
  {
    main: t('ins.destruction.tipsCMain'),
    sub: [t('ins.destruction.tipsCSub1'), t('ins.destruction.tipsCSub2')],
  },
])

// 硬盘
const diskConfig = computed(() => {
  console.log(`checked.value===>`, checked.value)

  const boolRes = checked.value.includes('dataDisk')
  let disks: any[] = []
  let residue: number = 0 // 保留个数

  // 勾选删除数据盘
  if (boolRes) {
    for (const ins of props.insList) {
      const diskInfos = ins.diskInfos || []
      disks = [...disks, ...diskInfos]
    }

    residue = 0
  } else {
    // 未勾选删除数据盘
    for (const ins of props.insList) {
      const diskInfos = ins.diskInfos || []
      const sysDisk = diskInfos.find(el => el.type === 1)
      if (sysDisk) {
        disks.push(sysDisk)
      }

      const dataDisks = diskInfos.filter(el => el.type !== 1) // 数据盘
      residue = residue + dataDisks.length
    }
  }

  console.log(`disks===>`, disks)

  return { list: disks, residue }
})

// ip
const ipConfig = computed(() => {
  console.log(`checked.value===>`, checked.value)

  const boolRes = checked.value.includes('ip')
  let residue: number = 0 // 保留个数

  // 勾选删除ip地址
  if (boolRes) {
    residue = 0
  } else {
    // 未勾选删除ip地址
    for (const ins of props.insList) {
      const networkInfos = ins.networkInfos || []
      for (const networkInfo of networkInfos) {
        const eips = networkInfo.eips || []
        residue = residue + eips.length
      }
    }
  }

  return { residue }
})

// 退款
const toFefund = () => {
  // 服务器ID
  const serverIds = props.insList.map(el => el.id)

  // 数据盘
  const allDisk: any[] = []
  for (const el of props.insList) {
    allDisk.push(...el.diskInfos)
  }
  const dataDiskIds = checked.value.includes('dataDisk') ? allDisk.filter(el => el.type === 2).map(el => el.id) : []

  // eip
  const allNetworkInfo: any[] = []
  const allEip: any[] = []
  for (const el of props.insList) {
    const networkInfos = el.networkInfos || []
    allNetworkInfo.push(...networkInfos)
  }
  for (const el of allNetworkInfo) {
    const eips = el.eips || []
    allEip.push(...eips)
  }
  console.log(`allNetworkInfo===>`, allNetworkInfo)
  console.log(`allEip===>`, allEip)

  const eipIds = checked.value.includes('ip') ? allEip.filter(el => Boolean(el.eipId)).map(el => el.eipId) : []

  const inquiryReqParams = {
    serverId: serverIds[0], // 服务器ID
    dataDiskIds, // 是否退还IP
    eipIds, // 是否退还云硬盘
  }
  const refundReqParams = {
    serverId: serverIds[0], // 服务器ID
    dataDiskIds, // 是否退还IP
    eipIds, // 是否退还云硬盘
  }

  // 包年包月
  if (props.insList[0].instanceChargeType === 2) {
    setRefundOrder(inquiryReqParams, refundReqParams, 'cvm_refund_order', 'ins', 'destruction')
  } else {
    // 按量计费
    const cb = () => {
      emits('success')
      show.value = false
      showB.value = false
      showC.value = false
    }
    refundInstance(false, refundReqParams, cb)
  }
}

// 主内ip地址
const handleRowMainPrivateIp = (row: any) => {
  console.log(`handleRowIp===>`, row)
  const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡

  return res ? res.mainPrivateIp : ''
}

const confirmHandleA = () => {
  showB.value = true
  show.value = false
}

const confirmHandleB = () => {
  showC.value = true
  showB.value = false
}

const prevHandleC = () => {
  showC.value = false
  showB.value = true
}

// 弹窗关闭
const cancelC = () => {
  isCollapse.value = false
}

// 弹窗打开
const openA = () => {
  checked.value = []
  isCollapse.value = false
}

// 弹窗关闭
const cancelA = () => {
  isCollapse.value = false
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.confirm-text {
  margin-bottom: 10px;
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  color: #222;
}

.item-text {
  margin-bottom: 8px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.mb10 {
  margin-bottom: 10px;
}
</style>
