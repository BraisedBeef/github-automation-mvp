<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <el-table v-loading="loading" :data="list" class="mt20 table">
      <!-- ID/名称 -->
      <el-table-column min-width="200" :label="t('ins.publicIp.idName')">
        <template #default="{ row }">
          <div class="text-primary">
            {{ row.eipUuid }}
          </div>
          <div>{{ row.name }}</div>
        </template>
      </el-table-column>
      <!-- IP地址 -->
      <el-table-column min-width="200" :label="t('ins.publicIp.ipAddress')">
        <template #default="{ row }">
          <div>{{ row.eip }}</div>
        </template>
      </el-table-column>
      <!-- IP类型 -->
      <el-table-column min-width="200" :label="t('ins.publicIp.ipType')">
        <template #default>
          <div>{{ t('ins.publicIp.eip') }}</div>
        </template>
      </el-table-column>
      <!-- 计费模式 -->
      <el-table-column min-width="210" :label="t('ins.publicIp.costType')">
        <template #default="{ row }">
          <div>{{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}</div>
        </template>
      </el-table-column>
      <!-- 带宽上限 -->
      <el-table-column v-if="showEipBandwidth" min-width="200" :label="t('ins.publicIp.bandwidthLimit')">
        <template #default="{ row }"> {{ row.size }} Mbps </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column :min-width="optsClass" :label="t('ins.publicIp.opts')">
        <template #default="{ row }">
          <span
            v-if="checkPermission(permMap.ins.CVM_UPDATE_NETWORK)"
            class="cursor-pointer mr20"
            :class="row.chargeType === 3 ? 'text-disabled' : 'text-primary'"
            @click="row.chargeType === 3 ? () => {} : adjustmentNetwork(row)"
            >{{ t('ins.publicIp.setNet') }}</span
          >
          <span
            v-if="checkPermission(permMap.ins.CVM_UNBIND_EIP) && row.state === 4"
            class="text-primary cursor-pointer"
            @click="unbindFn(row)"
            >{{ t('ins.publicIp.unbind') }}</span
          >
          <span
            v-if="checkPermission(permMap.ins.CVM_BIND_ENI) && row.state === 2"
            class="text-primary cursor-pointer"
            @click="bindFn(row)"
            >{{ t('ins.publicIp.bind') }}</span
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 调整带宽 -->
    <SetAdjustingBroadband ref="setAdjustingBroadbandRef" @success="refreshView" />
    <!-- 绑定实例 -->
    <SetBindResources ref="setBindResourcesRef" :region-id="cvmStore.areaSelect.id" @success="refreshView" />
    <!-- 解绑实例 -->
    <SetUnbind ref="setUnbindRef" @success="refreshView" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
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

const showEipBandwidth = ref<boolean>(false) // 是否显示带宽

const bodyStyle = { height: '100%' }

const loading = ref<boolean>(false)
const list = ref<any[]>([]) // 列表

const setBindResourcesRef = ref<InstanceType<typeof SetBindResources>>() // 绑定资源
const setAdjustingBroadbandRef = ref<InstanceType<typeof SetAdjustingBroadband>>() // 调整带宽
const setUnbindRef = ref<InstanceType<typeof SetUnbind>>() // 解绑弹性公网IP

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 延迟刷新更新视图
const refreshView = () => {
  list.value = []
  loading.value = true
  setTimeout(() => {
    getList()
  }, 1500)
}

const getList = async () => {
  showEipBandwidth.value = cvmStore.areaSelect.showEipBandwidth // 是否显示带宽
  // 没有实例id不允许查询，否则会导致查询出所有数据导致问题
  if (!props.detail.id) {
    list.value = []
    loading.value = false
    return
  }
  const params = { insId: props.detail.id, regionId: cvmStore.areaSelect.id, pageIndex: 1, pageSize: 999 }
  loading.value = true
  try {
    const res = await getIpGroupList(params)
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

// 绑定资源
const bindFn = row => {
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).show = true
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).eipId = row.eipId
  ;(setBindResourcesRef.value as InstanceType<typeof SetBindResources>).eipName = row.name
}

// 解绑
const unbindFn = row => {
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).show = true
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).list = [row]
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).eipId = row.eipId
}

// 调整网络
const adjustmentNetwork = row => {
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).show = true
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).detailId = row.eipId
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).enableChangeMonthly =
    row.enableChangeMonthly
  ;(setAdjustingBroadbandRef.value as InstanceType<typeof SetAdjustingBroadband>).getEipDetailFn()
}

// 监听数据变化-因为实例id通过detail接口获取，故此处需要监听获取到id后再查询公网ip数据
watch(
  () => props.detail,
  newData => {
    if (newData && newData.id) getList()
  },
  { immediate: true, deep: true },
)
</script>

<style lang="scss" scoped>
.text-disabled {
  color: var(--tip-text);
  cursor: not-allowed;
}
</style>
