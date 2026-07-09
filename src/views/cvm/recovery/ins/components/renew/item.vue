<template>
  <div class="mb20">
    <div class="info df ac jsb">
      <div class="df ac mr4 cursor-pointer" @click="isShow = !isShow">
        <span>{{ t('ins.renew.server') }}{{ ins.instanceName }}</span>
        <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
          <CaretRight />
        </el-icon>
      </div>
      <div>
        <span class="text-warning">${{ renew.totalDiscountMoney }} USD</span>
        <!-- <span class="line-through line-through-text">${{ renew.totalMoney }} USD</span> -->
      </div>
    </div>
    <el-collapse-transition>
      <div v-show="isShow">
        <el-table :data="list" class="mt20 table">
          <!-- 配置 -->
          <el-table-column min-width="200" :label="t('ins.renew.config')" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.type === 'insConfig'">{{ t('ins.renew.insType') }}{{ row.name }}</span>
              <span v-if="row.type === 'sysDiskConfig'">{{ t('ins.renew.sysDisk') }}{{ row.name }}</span>
              <span v-if="row.type === 'ipConfig'">{{ t('ins.renew.bandwidth') }}{{ row.name }}</span>
              <span v-if="row.type === 'imageConfig'">{{ t('ins.renew.image') }}{{ row.name }}</span>
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
              <span>{{ row.expiresTime || '-' }}</span>
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
              <span>{{ row.renewTime || '-' }}</span>
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
                <span class="text-warning">${{ row.discountPrice }} USD</span>
                <!-- <span class="line-through line-through-text">${{ row.originalPrice }} USD</span> -->
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

interface PropType {
  ins: any
  time: number
  renew: any
  open: boolean
  insAllNum: number
}

const props = withDefaults(defineProps<PropType>(), {
  ins: () => ({}),
  time: 0,
  renew: () => ({}),
  open: false,
  insAllNum: 0,
})

const isShow = ref<boolean>(false) // 是否显示

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
    discountPrice: instancePrice.discountPrice || 0, // 折扣价
    originalPrice: instancePrice.originalPrice || 0, // 原价
  }
})

// 系统盘
const sysDiskConfig = computed(() => {
  const systemDiskPrice = props.renew.systemDiskPrice || {}
  const diskInfos = props.ins.diskInfos || []
  const sysDisk = diskInfos.find(el => el.type === 1)

  return {
    type: 'sysDiskConfig',
    name: sysDisk?.diskTypeName,
    expiresTime: maoYunDayJs(props.ins.expiresTime).format(FORMAT_TIME),
    renewTime: renewTime(props.ins.expiresTime),
    discount:
      systemDiskPrice.discount === 1
        ? t('ins.renew.noHave')
        : t('ins.renew.discountMuch', [systemDiskPrice.discount || 0]),
    discountPrice: systemDiskPrice.discountPrice || 0,
    originalPrice: systemDiskPrice.originalPrice || 0,
  }
})

// 带宽
const ipConfig = computed(() => {
  const eipDetailedPrice = props.renew.eipDetailedPrice || []

  return eipDetailedPrice.map(el => ({
    type: 'ipConfig',
    name: `${INS_NETWORK_CHANGE_TYPE_MAP[el.chargeType]}（${el.bandwidth || 0}Mbps）`,
    expiresTime: el.chargeType === 2 ? maoYunDayJs(props.ins.expiresTime).format(FORMAT_TIME) : '-',
    renewTime: el.chargeType === 2 ? renewTime(props.ins.expiresTime) : '-',
    discount: el.discount === 1 ? t('ins.renew.noHave') : t('ins.renew.discountMuch', [el.discount || 0]),
    discountPrice: el.discountPrice || 0,
    originalPrice: el.originalPrice || 0,
  }))
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
    discountPrice: imagePrice.discountPrice || 0,
    originalPrice: imagePrice.originalPrice || 0,
  }
})

const list = computed(() => {
  return [insConfig.value, sysDiskConfig.value, ...ipConfig.value, imageConfig.value]
})

// 续费后到期时间
const renewTime = (dateStr: string) => {
  const month = (props.time || 0) as number
  const newDate = maoYunDayJs(dateStr).add(month, 'month')
  return dateStr ? newDate.format(FORMAT_TIME) : ''
}

watch(
  () => props.open,
  v => {
    if (v) {
      isShow.value = props.insAllNum > 1 ? false : true
    } else {
      isShow.value = false
    }
  },
  {
    immediate: true,
  },
)
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
