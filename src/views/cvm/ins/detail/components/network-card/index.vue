<template>
  <el-card shadow="never" class="page-box" :body-style="bodyStyle">
    <div class="btn-wrap mb20">
      <!-- 绑定弹性网卡 !!!服务器绑定网卡限制只能绑定限定个数的网卡 -->
      <el-button
        v-if="checkPermission(permMap.ins.CVM_BIND_ENI)"
        :disabled="detail?.networkInfos.length >= maxEniNums"
        type="primary"
        @click="bindFn"
      >
        {{ t('ins.networkCard.bindNetCard') }}
      </el-button>
    </div>

    <NetworkCardItem
      v-for="item in detail?.networkInfos || []"
      :key="item.eniId"
      :networkinfo="item"
      :max-ip-nums="maxIpNums"
    />

    <!-- 绑定弹性网卡弹窗 -->
    <BindNetworkCard ref="bindNetworkCardRef" :ins-detail="props.detail" @success="listInstanceDetail" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import NetworkCardItem from './network-card-item.vue'
import BindNetworkCard from '../../../list/components/bind-network-card/index.vue'
import { InsBindEniListReq } from '@/apis/network/type/network-card'
import { getInsBindEniList } from '@/apis/network/network-card'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const maxEniNums = ref<number>(0)
const maxIpNums = ref<number>(0)

const bodyStyle = { height: '100%' }

const listInstanceDetail = inject('listInstanceDetailFn') as () => void

const bindNetworkCardRef = ref<InstanceType<typeof BindNetworkCard>>()

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const bindFn = () => {
  ;(bindNetworkCardRef.value as InstanceType<typeof BindNetworkCard>).show = true
}

onMounted(() => {
  maxEniNums.value = props.detail?.maxEniCount || 0 // 实例允许绑定最大弹性网卡个数
  maxIpNums.value = props.detail?.maxEniIpCount || 0 // 实例 - 弹性网卡 - 允许绑定最大内网IP个数
})
</script>

<style lang="scss" scoped></style>
