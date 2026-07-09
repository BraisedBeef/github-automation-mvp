<template>
  <section class="cvm-ins-public-ip-v2">
    <TableV2 v-loading="loading" :data="list" :show-pagination="false" :empty-min-height="240">
      <el-table-column min-width="220" :label="t('ins.publicIp.idName')">
        <template #default="{ row }">
          <div class="cvm-ins-public-ip-v2__id-cell">
            <div class="cvm-ins-public-ip-v2__id-link">
              {{ row.eipUuid }}
            </div>
            <div class="cvm-ins-public-ip-v2__subtext">
              {{ row.name || '-' }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="180" :label="t('ins.publicIp.ipAddress')">
        <template #default="{ row }">
          {{ row.eip || '-' }}
        </template>
      </el-table-column>

      <el-table-column min-width="180" :label="t('ins.publicIp.ipType')">
        <template #default>
          {{ t('ins.publicIp.eip') }}
        </template>
      </el-table-column>

      <el-table-column min-width="220" :label="t('ins.publicIp.costType')">
        <template #default="{ row }">
          {{ chargeTypeList.find(item => item.value === row.chargeType)?.label || '-' }}
        </template>
      </el-table-column>

      <el-table-column v-if="showEipBandwidth" min-width="180" :label="t('ins.publicIp.bandwidthLimit')">
        <template #default="{ row }"> {{ row.size }} Mbps </template>
      </el-table-column>

      <el-table-column :min-width="optsClass" :label="t('ins.publicIp.opts')">
        <template #default="{ row }">
          <div class="cvm-ins-public-ip-v2__ops">
            <button
              v-if="checkPermission(permMap.ins.CVM_UPDATE_NETWORK)"
              class="cvm-ins-public-ip-v2__link"
              :class="{ 'is-disabled': row.chargeType === 3 }"
              type="button"
              @click="row.chargeType === 3 ? undefined : adjustmentNetwork(row)"
            >
              {{ t('ins.publicIp.setNet') }}
            </button>

            <button
              v-if="checkPermission(permMap.ins.CVM_UNBIND_EIP) && row.state === 4"
              class="cvm-ins-public-ip-v2__link"
              type="button"
              @click="unbindFn(row)"
            >
              {{ t('ins.publicIp.unbind') }}
            </button>

            <button
              v-if="checkPermission(permMap.ins.CVM_BIND_ENI) && row.state === 2"
              class="cvm-ins-public-ip-v2__link"
              type="button"
              @click="bindFn(row)"
            >
              {{ t('ins.publicIp.bind') }}
            </button>
          </div>
        </template>
      </el-table-column>
    </TableV2>

    <SetAdjustingBroadband ref="setAdjustingBroadbandRef" @success="refreshView" />
    <SetBindResources ref="setBindResourcesRef" :region-id="cvmStore.areaSelect.id" @success="refreshView" />
    <SetUnbind ref="setUnbindRef" @success="refreshView" />
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { useCvmStore } from '@/store'
import { message } from '@/utils/message'
import { getIpGroupList } from '@/apis/network/public-ip'
import SetAdjustingBroadband from '@/views/network/public-ip/list/components/set-adjusting-broadband/index.vue'
import SetBindResources from '@/views/network/public-ip/list/components/set-bind-resources/index.vue'
import SetUnbind from '@/views/network/public-ip/list/components/set-unbind/index.vue'
import { chargeTypeList } from '@/views/network/public-ip/list/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const optsMap = {
  [ja]: '260',
  [en]: '220',
  [zh]: '160',
}

const optsClass = useI18nStyle(optsMap)

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const showEipBandwidth = ref(false)
const loading = ref(false)
const list = ref<any[]>([])

const setBindResourcesRef = ref<InstanceType<typeof SetBindResources>>()
const setAdjustingBroadbandRef = ref<InstanceType<typeof SetAdjustingBroadband>>()
const setUnbindRef = ref<InstanceType<typeof SetUnbind>>()

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const refreshView = () => {
  list.value = []
  loading.value = true
  setTimeout(() => {
    getList()
  }, 1500)
}

const getList = async () => {
  showEipBandwidth.value = cvmStore.areaSelect.showEipBandwidth
  if (!props.detail.id) {
    list.value = []
    loading.value = false
    return
  }

  loading.value = true
  try {
    const res = await getIpGroupList({
      insId: props.detail.id,
      regionId: cvmStore.areaSelect.id,
      pageIndex: 1,
      pageSize: 999,
    })
    loading.value = false
    if (res.success) {
      list.value = res.data?.list || []
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    loading.value = false
    console.log('error', err)
  }
}

const bindFn = row => {
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).show = true
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).eipId = row.eipId
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).eipName = row.name
}

const unbindFn = row => {
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).show = true
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).list = [row]
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).eipId = row.eipId
}

const adjustmentNetwork = row => {
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).show = true
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).detailId = row.eipId
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).enableChangeMonthly =
    row.enableChangeMonthly
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).getEipDetailFn()
}

watch(
  () => props.detail,
  newData => {
    if (newData && newData.id) getList()
  },
  { immediate: true, deep: true },
)
</script>

<style lang="scss" scoped>
.cvm-ins-public-ip-v2 {
  padding: 20px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-public-ip-v2__id-link {
  color: #06f;
}

.cvm-ins-public-ip-v2__subtext {
  margin-top: 4px;
  color: #191c23;
}

.cvm-ins-public-ip-v2__ops {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.cvm-ins-public-ip-v2__link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  &.is-disabled {
    color: #98a2b3;
    cursor: not-allowed;
  }
}

@media (width <= 768px) {
  .cvm-ins-public-ip-v2 {
    padding: 16px;
  }
}
</style>
