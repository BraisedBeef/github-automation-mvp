<template>
  <section class="cvm-ins-network-card-v2">
    <div class="cvm-ins-network-card-v2__toolbar">
      <el-button
        v-if="checkPermission(permMap.ins.CVM_BIND_ENI)"
        :disabled="detail?.networkInfos.length >= maxEniNums"
        type="primary"
        @click="bindFn"
      >
        {{ t('ins.networkCard.bindNetCard') }}
      </el-button>
    </div>

    <div class="cvm-ins-network-card-v2__list">
      <NetworkCardItem
        v-for="item in detail?.networkInfos || []"
        :key="item.eniId"
        :networkinfo="item"
        :max-ip-nums="maxIpNums"
      />
    </div>

    <BindNetworkCard ref="bindNetworkCardRef" :ins-detail="props.detail" @success="listInstanceDetail" />
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import NetworkCardItem from './network-card-item.vue'
import BindNetworkCard from '@/views/cvm/ins/list/components/bind-network-card/index.vue'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  detail: any
}

const props = withDefaults(defineProps<PropType>(), {})

const maxEniNums = ref(0)
const maxIpNums = ref(0)
const listInstanceDetail = inject('listInstanceDetailFn') as () => void
const bindNetworkCardRef = ref<InstanceType<typeof BindNetworkCard>>()

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const bindFn = () => {
  ;(bindNetworkCardRef.value as InstanceType<typeof BindNetworkCard>).show = true
}

onMounted(() => {
  maxEniNums.value = props.detail?.maxEniCount || 0
  maxIpNums.value = props.detail?.maxEniIpCount || 0
})
</script>

<style lang="scss" scoped>
.cvm-ins-network-card-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-network-card-v2__list {
  display: flex;
  flex-direction: column;
}

@media (width <= 768px) {
  .cvm-ins-network-card-v2 {
    padding: 16px;
  }
}
</style>
