<template>
  <div>
    <CatTabs2 class="tabs mb20" :model-value="modelValue.locationId" :tabs="tabs" @change="changeTab" />
    <div class="df gap">
      <div
        v-for="(item, index) in regionList"
        :key="index"
        class="area cursor-pointer"
        :class="modelValue.id === item.id && 'area-actived'"
        @click="changeArea(item)"
      >
        {{ item.regionName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'

type AreaBtnType = {
  id: number
  locationId: number
}

type TabBtnType = {
  id: number
  locationId: number
}

interface PropType {
  modelValue: AreaBtnType
  style?: {
    [x: string]: string
  }
}

const props = withDefaults(defineProps<PropType>(), {
  modelValue: () => ({
    id: 0,
    locationId: 0,
  }),
})
const emits = defineEmits<{
  (event: 'update:modelValue', value: AreaBtnType): void
  (event: 'changeTab', value: TabBtnType): void
  (event: 'changeArea', value: AreaBtnType): void
  (event: 'getRegionData', val: any[]): void
}>()

const { getListWithRegionByWhitelist } = useBaseConfig()

const list = ref<any[]>([]) // 大区列表

// 每个地区的地域和可用区，至少要有一个，否则隐藏
const tabs = computed(() => {
  return list.value
    .filter(el => el.regionDTOS?.length)
    .filter(el => el.regionDTOS.some(item => item.zoneCount > 0))
    .map(el => ({
      label: el.location,
      value: el.id,
    }))
})

// 每个地域至少有一个可用区,否则隐藏
const regionList = computed(() => {
  return list.value.find(el => el.id === props.modelValue.locationId)?.regionDTOS || []
})

// 切换tab
const changeTab = (item: any) => {
  console.log(`changeTab===>`, item)

  const value = {
    ...props.modelValue,
    locationId: item.value,
  }

  emits('changeTab', value)
  emits('update:modelValue', value)
}

// 切换地区
const changeArea = (item: any) => {
  console.log(`changeArea===>`, item, props.modelValue)

  if (item.id !== props.modelValue.id) {
    emits('update:modelValue', item)
    emits('changeArea', item)
  }
}

// 获取大区列表及其地区
const getListWithRegionFn = async () => {
  console.log(`getListWithRegionFn+++++++++`)

  const cb = (res: any) => {
    if (res.success) {
      list.value = res.data || []

      let areaSelect: any = {} // 选中地区
      let defaultArea: any = {} // 默认地区
      let allArea: any[] = [] // 所有地区

      for (const el of list.value) {
        const regionDTOS = el.regionDTOS || []
        allArea.push(...regionDTOS)
      }

      console.log(`allArea===>`, allArea)

      // 默认值
      const area = allArea.find(item => item.isDefault === 1)
      if (area) {
        defaultArea = area
      } else {
        defaultArea = allArea[0]
      }

      // props.modelValue无值，则取默认值
      if (!props.modelValue.locationId && !props.modelValue.id) {
        areaSelect = defaultArea
      } else {
        // props.modelValue 有值 且是否有效
        const verifyRes = allArea.some(item => props.modelValue.id === item.id)
        const areaRes = allArea.find(item => props.modelValue.id === item.id)
        console.log(`verifyRes===>`, verifyRes, defaultArea)

        if (!verifyRes) {
          areaSelect = defaultArea
        } else {
          areaSelect = areaRes
        }
      }

      console.log(`areaSelect===>`, areaSelect)

      emits('update:modelValue', areaSelect)
      emits('getRegionData', res.data)
      emits('changeArea', areaSelect)
    }
  }

  getListWithRegionByWhitelist(cb)
}

onMounted(() => {
  getListWithRegionFn()
})
</script>

<style lang="scss" scoped>
.gap {
  flex-wrap: wrap;
  gap: 10px 8px;
}

.area {
  min-width: 118px;
  height: 34px;
  padding: 0 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 34px;
  color: #000;
  text-align: center;
  background: #eaebf1;
  border-radius: 4px;
}

.area-actived {
  color: #fff;
  background: #0063ff;
}
</style>
