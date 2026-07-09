<template>
  <div class="mb20">
    <div class="info df ac jsb">
      <div class="df ac mr4 cursor-pointer" @click="changeShow">
        <span>{{ t('ins.renew.server') }}{{ ins.instanceName }}</span>
        <span>{{ eipPrompt }}</span>
        <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
          <CaretRight />
        </el-icon>
      </div>
      <div>
        <span class="text-warning">${{ pay.totalDiscountMoney }} USD</span>
        <span class="line-through line-through-text">${{ pay.totalMoney }} USD</span>
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="isShow">
        <el-table :data="list" class="mt20 table">
          <!-- 配置 -->
          <el-table-column min-width="200" :label="t('ins.renew.config')" show-overflow-tooltip>
            <template #default="{ row }">
              <!-- 实例 默认选中不可取消 -->
              <div v-if="row.type === 'insConfig'">
                <el-checkbox :label="t('ins.renew.insType') + row.name" :model-value="true" />
              </div>
              <!-- 系统盘 默认选中不可取消 -->
              <div v-if="row.type === 'sysDiskConfig'">
                <el-checkbox :label="t('ins.renew.sysDisk') + row.name" :model-value="true" />
              </div>
              <!-- 数据盘 -->
              <div v-if="row.type === 'dataDiskConfig'">
                <el-checkbox
                  v-model="dataDisChecked[row.dataDiskId]"
                  :label="t('ins.renew.dataDisk') + row.name"
                  @change="emits('calcRenewPrice')"
                />
              </div>
              <!-- 公网ip -->
              <div v-if="row.type === 'ipConfig'">
                <!-- 包年包月 可取消 -->
                <el-checkbox
                  v-if="row.isTimeCost"
                  v-model="ipChecked[row.ipId]"
                  :label="t('ins.renew.eip') + row.name"
                  @change="emits('calcRenewPrice')"
                />
                <!-- 按量计费 共享流量包 禁灰  -->
                <el-checkbox v-else :label="t('ins.renew.eip') + row.name" disabled />
              </div>
              <!-- 镜像 默认选中不可取消 -->
              <div v-if="row.type === 'imageConfig'">
                <el-checkbox :label="t('ins.renew.image') + row.name" :model-value="true" />
              </div>
            </template>
          </el-table-column>
          <!-- 到期时间 -->
          <el-table-column min-width="220" :label="t('ins.renew.expiredTime')">
            <template #header>
              <div class="df ac">
                <span>{{ t('ins.renew.expiredTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <span>{{ row.expiresTime }}</span>
            </template>
          </el-table-column>
          <!-- 续费后到期时间 -->
          <el-table-column min-width="220" :label="t('ins.renew.renewExpireDate')">
            <template #header>
              <div class="df ac">
                <span>{{ t('ins.renew.renewExpireDate') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <span>{{ row.renewTime }}</span>
            </template>
          </el-table-column>
          <!-- 折扣 -->
          <!-- <el-table-column min-width="100" :label="t('ins.renew.discount')">
            <template #default="{ row }">
              <div>
                <span>{{ row.discount }}</span>
              </div>
            </template>
          </el-table-column> -->
          <!-- 价格 -->
          <el-table-column min-width="200" :label="t('ins.renew.price')">
            <template #default="{ row }">
              <div>
                <span class="text-warning">{{ row.discountPrice }}</span>
                <span class="line-through line-through-text">{{ row.originalPrice }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { CaretRight } from '@element-plus/icons-vue'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { INS_NETWORK_CHANGE_TYPE_MAP } from '@/views/cvm/ins/config'
import { isSysDisk, isDataDisk } from '@/views/cvm/disk/config'

interface PropType {
  ins: any
  time: number
  renew: any
  pay: any
  open: boolean
  insAllNum: number
}

const props = withDefaults(defineProps<PropType>(), {
  ins: () => ({}),
  time: 0,
  renew: () => ({}),
  pay: () => ({}),
  open: false,
  insAllNum: 0,
})

const emits = defineEmits<{
  (event: 'calcRenewPrice'): void
  (event: 'change', value: boolean): void
}>()

const isShow = ref<boolean>(false) // 是否显示

const dataDisChecked = ref<{
  [diskId: string]: boolean
}>({}) // 数据盘勾选

const ipChecked = ref<{
  [ipId: string]: boolean
}>({}) // 包年包月的ip勾选

const eipPrompt = computed(() => {
  const networkInfos = props.ins.networkInfos
  // 所有类型eip 按量计费 包年包月 共享流量包
  let eips: any[] = []

  for (const networkInfo of networkInfos) {
    if (networkInfo?.eips) {
      eips = [...eips, ...networkInfo.eips]
    }
  }

  // 公网ip
  const publicIps = eips.filter(el => Boolean(el.publicIp))

  let haveTime = false
  let haveFlow = false
  let havePackage = false

  for (const el of publicIps) {
    if (el.chargeType === 2) {
      haveTime = true
    } else if (el.chargeType === 1) {
      haveFlow = true
    } else if (el.chargeType === 3) {
      havePackage = true
    }
  }

  if (haveFlow && havePackage) {
    return t('ins.renew.eipPrompt1')
  } else if (haveFlow) {
    return t('ins.renew.eipPrompt3')
  } else if (havePackage) {
    return t('ins.renew.eipPrompt2')
  } else {
    return ''
  }
})

// 实例
const insConfig = computed(() => {
  const instancePrice = props.renew.instancePrice || {}
  return {
    type: 'insConfig',
    name: props.ins.specificationInfo?.typeName,
    expiresTime: maoYunDayJs(props.ins.expiresTime).format(FORMAT_TIME),
    renewTime: renewTime(props.ins.expiresTime),
    discount:
      instancePrice.discount === 1 ? t('ins.renew.noHave') : t('ins.renew.discountMuch', [instancePrice.discount || 0]), // 折扣
    discountPrice: `$${instancePrice.discountPrice || 0} USD`, // 折扣价
    originalPrice: `$${instancePrice.originalPrice || 0} USD`, // 原价
  }
})

// 系统盘
const sysDiskConfig = computed(() => {
  const systemDiskPrice = props.renew.systemDiskPrice || {}
  const diskInfos = props.ins.diskInfos || []
  const sysDisk = diskInfos.find(el => isSysDisk(el.type))

  return {
    type: 'sysDiskConfig',
    name: sysDisk?.diskTypeName,
    expiresTime: maoYunDayJs(props.ins.expiresTime).format(FORMAT_TIME),
    renewTime: renewTime(props.ins.expiresTime),
    discount:
      systemDiskPrice.discount === 1
        ? t('ins.renew.noHave')
        : t('ins.renew.discountMuch', [systemDiskPrice.discount || 0]),
    discountPrice: `$${systemDiskPrice.discountPrice || 0} USD`,
    originalPrice: `$${systemDiskPrice.originalPrice || 0} USD`,
  }
})

// 数据盘
const dataDiskConfig = computed(() => {
  const dataDiskDetailedPrice = props.renew.dataDiskDetailedPrice || []
  const diskInfos = props.ins.diskInfos || []
  const dataDisks = diskInfos
    .filter(el => isDataDisk(el.type))
    .map(el => {
      const dataDiskPrice = dataDiskDetailedPrice.find(item => item.diskId === el.id) || {}

      return {
        dataDiskId: el.id,
        type: 'dataDiskConfig',
        name: el.diskTypeName,
        expiresTime: maoYunDayJs(el.expiredTime).format(FORMAT_TIME),
        renewTime: renewTime(el.expiredTime),
        discount:
          dataDiskPrice.discount === 1
            ? t('ins.renew.noHave')
            : t('ins.renew.discountMuch', [dataDiskPrice.discount || 0]),
        discountPrice: `$${dataDiskPrice.discountPrice || 0} USD`,
        originalPrice: `$${dataDiskPrice.originalPrice || 0} USD`,
      }
    })

  return dataDisks
})

// 公网IP
const ipConfig = computed(() => {
  const eipDetailedPrice = props.renew.eipDetailedPrice || []
  const networkInfos = props.ins.networkInfos
  // 所有类型eip 按量计费 包年包月 共享流量包
  let eips: any[] = []

  for (const networkInfo of networkInfos) {
    if (networkInfo?.eips) {
      eips = [...eips, ...networkInfo.eips]
    }
  }
  // 公网ip
  const publicIps = eips.filter(el => Boolean(el.publicIp))

  return publicIps.map(el => {
    const eipPrice = eipDetailedPrice.find(item => item.eipId === el.eipId) || {}

    if (el.chargeType === 2) {
      return {
        ipId: el.eipId,
        type: 'ipConfig',
        name: `${el.publicIp}（${el.bandwidth || 0}Mbps）${INS_NETWORK_CHANGE_TYPE_MAP[el.chargeType]}`,
        expiresTime: maoYunDayJs(el.deadlineDate).format(FORMAT_TIME),
        renewTime: renewTime(el.deadlineDate),
        discount:
          eipPrice.discount === 1 ? t('ins.renew.noHave') : t('ins.renew.discountMuch', [eipPrice.discount || 0]),
        discountPrice: `$${eipPrice.discountPrice || 0} USD`,
        originalPrice: `$${eipPrice.originalPrice || 0} USD`,
        isTimeCost: true,
      }
    } else {
      return {
        ipId: el.eipId,
        type: 'ipConfig',
        name: `${el.publicIp}（${el.bandwidth || 0}Mbps）${INS_NETWORK_CHANGE_TYPE_MAP[el.chargeType]}`,
        expiresTime: t('ins.renew.eipDesc'),
        renewTime: '',
        discount: '',
        discountPrice: '',
        originalPrice: '',
        isTimeCost: false,
      }
    }
  })
})

// 镜像
const imageConfig = computed(() => {
  const imagePrice = props.renew.imagePrice || {}

  return {
    type: 'imageConfig',
    name: props.ins.imageInfo?.imageName,
    expiresTime: maoYunDayJs(props.ins.expiresTime).format(FORMAT_TIME),
    renewTime: renewTime(props.ins.expiresTime),
    discount:
      imagePrice.discount === 1 ? t('ins.renew.noHave') : t('ins.renew.discountMuch', [imagePrice.discount || 0]),
    discountPrice: `$${imagePrice.discountPrice || 0} USD`,
    originalPrice: `$${imagePrice.originalPrice || 0} USD`,
  }
})

const list = computed(() => {
  return [insConfig.value, sysDiskConfig.value, ...dataDiskConfig.value, ...ipConfig.value, imageConfig.value]
})

const changeShow = () => {
  isShow.value = !isShow.value
  emits('change', isShow.value)
}

// 续费后到期时间
const renewTime = (dateStr: string) => {
  const month = (props.time || 0) as number
  const newDate = maoYunDayJs(dateStr).add(month, 'month')
  return dateStr ? newDate.format(FORMAT_TIME) : ''
}

// 获取需要续费的数据盘id
const getRenewDataDiskId = () => {
  let ids: string[] = []
  for (const id in dataDisChecked.value) {
    const bool = dataDisChecked.value[id]
    if (bool) {
      ids.push(id)
    }
  }
  return ids
}

// 获取需要续费的公网ip的id(包年包月)
const getRenewEipId = () => {
  let ids: string[] = []
  for (const id in ipChecked.value) {
    const bool = ipChecked.value[id]
    if (bool) {
      ids.push(id)
    }
  }
  return ids
}

// 获取所有数据盘id
const getAllDataDiskId = () => {
  return Object.keys(dataDisChecked.value)
}

// 获取所有公网ip的id
const getAllEipId = () => {
  return Object.keys(ipChecked.value)
}

watch(
  () => props.open,
  v => {
    if (v) {
      // isShow.value = props.insAllNum > 1 ? false : true

      // 根据数据盘ID动态生成
      const diskInfos = props.ins.diskInfos || []
      const dataDiskIds = diskInfos.filter(el => isDataDisk(el.type)).map(el => el.id)
      dataDisChecked.value = dataDiskIds.reduce((acc, cur) => {
        acc[cur] = true
        return acc
      }, {})

      // 根据ip ID动态生成
      const networkInfos = props.ins.networkInfos
      let eips: any[] = [] // 所有类型eip 按量计费 包年包月 共享流量包

      for (const networkInfo of networkInfos) {
        if (networkInfo?.eips) {
          eips = [...eips, ...networkInfo.eips]
        }
      }

      // 公网ip
      const publicIps = eips.filter(el => Boolean(el.publicIp))

      // 包年包月
      const eipIds = publicIps.filter(el => el.chargeType === 2).map(el => el.eipId)

      ipChecked.value = eipIds.reduce((acc, cur) => {
        acc[cur] = true
        return acc
      }, {})
    } else {
      isShow.value = false
    }
  },
  {
    immediate: true,
  },
)

defineExpose({
  getRenewDataDiskId,
  getRenewEipId,
  getAllDataDiskId,
  getAllEipId,
  isShow,
})
</script>

<style lang="scss" scoped>
.line-through-text {
  margin-left: 14px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.is-reverse {
  transform: rotateZ(90deg);
}
</style>
