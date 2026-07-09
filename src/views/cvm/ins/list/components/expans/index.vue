<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.expans.title')"
    :width="dialogClass"
    :confirm-text="t('ins.expans.next')"
    :footer="false"
    @update:dialog="cancel"
    @open="open"
  >
    <!-- 第一步 -->
    <div v-show="step.active === 'a'" class="a-wrap">
      <CatStep
        v-model="step.active"
        :step-item-style="{
          minWidth: '180px',
        }"
        class="df"
        :steps="step.steps"
        :v-change="false"
      />

      <!-- tip -->
      <!-- <Tip :text="tips" type="OneToMany" /> -->

      <Collapse v-model="isCollapse" :text="t('ins.expans.selectIns', [insList.length])">
        <el-table :data="insList" class="mt20 table">
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('ins.expans.idName')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.insUuid }}
              </div>
              <div>{{ row.instanceName }}</div>
            </template>
          </el-table-column>
          <!-- 实例类型 -->
          <el-table-column min-width="200" :label="t('ins.expans.insType')">
            <template #default="{ row }">
              <div class="df ac">
                <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
                <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
              </div>
            </template>
          </el-table-column>
          <!-- 实例配置 -->
          <el-table-column min-width="300" :label="t('ins.expans.insConfig')">
            <template #default="{ row }">
              <div style="padding: 14px 0">
                <p>
                  <span class="mr10">{{ t('ins.expans.cores', [row.specificationInfo?.vcpus]) }}</span
                  ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                  ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
                </p>
                <p>{{ t('ins.expans.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
                <p>{{ t('ins.expans.net') }}{{ handleRowVpcName(row) }}</p>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </Collapse>

      <div class="search-wrap mt20">
        <p class="mb10 key">
          {{ t('ins.expans.searchDesc') }}
        </p>

        <el-input v-model="condition" :placeholder="t('ins.expans.searchPh')">
          <template #suffix>
            <SvgIcon name="dns-search" class="cursor-pointer" @click="() => {}" />
          </template>
        </el-input>
      </div>

      <el-table v-loading="loading" :data="diskList" class="mt20 table" max-height="300">
        <!-- ID/云硬盘名 -->
        <el-table-column min-width="200" :label="t('ins.expans.diskIdName')">
          <template #default="{ row }">
            <el-radio v-model="checkedDiskId" :label="row.id" @change="changeDisk">
              <div class="text-primary">
                {{ row.diskId }}
              </div>
              <div>
                {{ row.diskName }}
              </div>
            </el-radio>
          </template>
        </el-table-column>
        <!-- 配置 -->
        <el-table-column min-width="200" :label="t('ins.expans.config')">
          <template #default="{ row }">
            <div>
              <span class="mr4">{{ row.diskTypeName }}</span>
            </div>
            <div>
              <span>{{ DISK_TYPE_MAP[row.type] }}</span>
              <span>{{ row.size }}GiB</span>
            </div>
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column min-width="200" :label="t('ins.expans.costType')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ COST_TYPE_MAP[row.costType] }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="cat-dialog-footer">
        <el-button type="primary" @click="nextHandleA">
          <slot name="confirm">
            {{ t('ins.expans.next') }}
          </slot>
        </el-button>
        <el-button plain class="cancel" @click="cancel">
          {{ t('ins.expans.close') }}
        </el-button>
      </div>
    </div>
    <!-- 第二步 -->
    <div v-show="step.active === 'b'" class="b-wrap">
      <!-- tip -->
      <Tip :text="tipsB" type="OneToOne" />
      <CatStep
        v-model="step.active"
        :step-item-style="{
          minWidth: '180px',
        }"
        class="df mt20"
        :steps="step.steps"
        :v-change="false"
      />

      <Collapse v-model="isCollapse" :text="t('ins.expans.selectDisk', [insList.length])">
        <el-table :data="[disk]" class="mt20 mb20 table">
          <!-- 云硬盘ID/名称 -->
          <el-table-column min-width="200" :label="t('ins.expans.diskIdName')">
            <template #default="{ row }">
              <div class="text-primary text-over">
                {{ row.diskId }}
              </div>
              <div class="text-over">
                {{ row.diskName }}
              </div>
            </template>
          </el-table-column>
          <!-- 计费模式 -->
          <el-table-column min-width="200" :label="t('ins.expans.costType')">
            <template #default="{ row }">
              <span>{{ COST_TYPE_MAP[row.costType] }}</span>
            </template>
          </el-table-column>
          <!-- 创建/到期时间 -->
          <el-table-column min-width="220" show-overflow-tooltip>
            <template #header>
              <div class="df ac">
                <span>{{ t('ins.expans.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="text-over">
                {{
                  t('ins.expans.createTimeDesc', [
                    row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '',
                  ])
                }}
              </div>
              <div v-if="isTimeCost(row.costType)" class="text-over">
                {{
                  t('ins.expans.expiredTimeDesc', [
                    row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '',
                  ])
                }}
              </div>
            </template>
          </el-table-column>

          <!-- 数据备份点 -->
          <!-- <el-table-column min-width="200" :label="t('数据备份点')">
            <template #default="{ row }">
              <div>-</div>
            </template>
          </el-table-column> -->
          <!-- 关联实例 -->
          <el-table-column min-width="200" :label="t('ins.expans.associateIns')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.insUuid }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </Collapse>
      <div class="df">
        <div class="list-left">
          <div class="item mb20">
            <div class="key">
              {{ t('ins.expans.curSize') }}
            </div>
          </div>
          <div class="item mb20">
            <div class="key h106">
              {{ t('ins.expans.targetSize') }}
            </div>
          </div>
          <div class="item">
            <div class="key">
              {{ t('ins.expans.money') }}
            </div>
          </div>
        </div>
        <div class="list-right">
          <div class="item mb20">
            <div class="value">{{ disk.size }}GiB</div>
          </div>
          <div class="item mb20">
            <div class="value slider-wrap">
              <el-slider
                v-model="diskSize"
                :show-stops="false"
                :min="slideConfig.min"
                :max="slideConfig.max"
                :marks="slideConfig.marks"
                :format-tooltip="value => value + 'GiB'"
              />
              <div style="margin-top: 40px">
                <el-input-number
                  v-model="diskSize"
                  :min="slideConfig.min"
                  :max="slideConfig.max"
                  @change="() => {}"
                /><span style="margin-left: 10px">GiB</span>
              </div>
            </div>
          </div>
          <div class="item">
            <el-popover placement="top" :width="200" trigger="hover">
              <template #reference>
                <div class="value text-warning display-inline-block">${{ price.discountMoney }} USD</div>
              </template>

              <template #default>
                <div class="cost-wrap">
                  <!-- 收费项 -->
                  <div class="df ac jsb mb20">
                    <div class="key">
                      {{ t('ins.expans.feeItem') }}
                    </div>
                    <div class="value">
                      {{ t('ins.expans.disk') }}
                    </div>
                  </div>
                  <!-- 价格 -->
                  <div class="df ac jsb">
                    <div class="key">
                      {{ t('ins.expans.price') }}
                    </div>
                    <div class="value text-warning">${{ price.discountMoney }} USD</div>
                  </div>
                </div>
              </template>
            </el-popover>
          </div>
        </div>
      </div>

      <div class="cat-dialog-footer">
        <el-button plain class="cancel" @click="prevHandleB">
          {{ t('ins.expans.pre') }}
        </el-button>
        <el-button type="primary" @click="nextHandleB">
          <slot name="confirm">
            {{ t('ins.expans.next') }}
          </slot>
        </el-button>
        <el-button plain class="cancel" @click="cancel">
          {{ t('ins.expans.close') }}
        </el-button>
      </div>
    </div>
    <!-- 第三步 -->
    <div v-show="step.active === 'c'" class="c-wrap">
      <CatStep
        v-model="step.active"
        :step-item-style="{
          minWidth: '180px',
        }"
        class="df jc mt20"
        :steps="step.steps"
        :v-change="false"
      />
      <!-- tip -->
      <Tip :text="tipsC" type="OneToOne" hide-margin-bottom />

      <div class="cat-dialog-footer">
        <el-button plain class="cancel" @click="prevHandleC">
          {{ t('ins.expans.pre') }}
        </el-button>
        <el-button type="primary" @click="confirmHandleC">
          <slot name="confirm">
            {{ t('ins.expans.confirm') }}
          </slot>
        </el-button>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { useCvmStore } from '@/store'
import { COST_TYPE_MAP, INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { DISK_TYPE_MAP, isTimeCost } from '@/views/cvm/disk/config'
import {
  isExpans,
  SYS_DISK_SIZE_MAX,
  SYS_DISK_SIZE_MIN,
  DATA_DISK_SIZE_MAX,
  DATA_DISK_SIZE_MIN,
} from '@/views/cvm/disk/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '920px',
  [en]: '860px',
  [zh]: '760px',
}

const dialogClass = useI18nStyle(dialogMap)

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()
const { loading, computeDiskPrice, price, listDiskPrice, resizeDisk } = useDisk()

const step = ref({
  active: 'a',
  steps: [
    { label: t('ins.expans.stepA'), value: 'a' },
    { label: t('ins.expans.stepB'), value: 'b' },
    { label: t('ins.expans.stepC'), value: 'c' },
  ],
})
const show = ref<boolean>(false) // 弹窗显示
const isCollapse = ref<boolean>(false) // 是否收起
const checkedDiskId = ref<number>(0) // 选中硬盘id
const disk = ref<any>({}) // 选中硬盘
const condition = ref<string>('') // 查询条件
const diskSize = ref<number>(0)
const diskTypeList = ref<any[]>([]) // 硬盘类型集合

const tips = computed(() => [
  {
    main: t('ins.expans.tipsMain'),
    sub: [t('ins.expans.tipsSub1'), t('ins.expans.tipsSub2'), t('ins.expans.tipsSub3')],
  },
])

const tipsB = computed(() => [
  {
    main: t('ins.expans.tipsBMain'),
  },
])

const tipsC = computed(() => [
  {
    main: t('ins.expans.tipsCMain'),
  },
])

const slideConfig = computed(() => {
  return {
    marks:
      disk.value.type === 1
        ? {
            [SYS_DISK_SIZE_MIN]: `${SYS_DISK_SIZE_MIN}GiB`,
            [SYS_DISK_SIZE_MAX]: {
              style: {
                marginLeft: '-25px',
              },
              label: `${SYS_DISK_SIZE_MAX}GiB`,
            },
          }
        : {
            [DATA_DISK_SIZE_MIN]: `${DATA_DISK_SIZE_MIN}GiB`,
            [DATA_DISK_SIZE_MAX]: {
              style: {
                marginLeft: '-25px',
              },
              label: `${DATA_DISK_SIZE_MAX}GiB`,
            },
          },
    min: disk.value.type === 1 ? SYS_DISK_SIZE_MIN : DATA_DISK_SIZE_MIN,
    max: disk.value.type === 1 ? SYS_DISK_SIZE_MAX : DATA_DISK_SIZE_MAX,
  }
})

// 硬盘列表
const diskList = computed(() => {
  return props.insList[0]?.diskInfos?.filter(el => isExpans(el.state)) || []
})

// 切换硬盘
const changeDisk = (v: any) => {
  console.log(`changeDisk===>`, v)

  disk.value = diskList.value.find(el => el.id === v) || {}
}

const nextHandleA = () => {
  if (!checkedDiskId.value) {
    return message.warning(t('ins.expans.diskWarning'))
  }

  step.value.active = 'b'
  diskSize.value = disk.value.size || 0
}

const nextHandleB = () => {
  if (!diskSize.value) {
    return message.warning(t('ins.expans.targetSizeWarning'))
  }

  if (diskSize.value <= disk.value.size) {
    return message.warning(t('ins.expans.targetSizeWarning2'))
  }

  step.value.active = 'c'
}

const prevHandleB = () => {
  step.value.active = 'a'
}

const prevHandleC = () => {
  step.value.active = 'b'
}

const confirmHandleC = () => {
  resizeDiskFn()
}

// 弹窗打开
const open = () => {
  listDiskPriceFn()
}

// 弹窗关闭
const cancel = () => {
  show.value = false
  step.value.active = 'a'
  checkedDiskId.value = 0
  condition.value = ''
  isCollapse.value = false
}

// 扩容硬盘
const resizeDiskFn = async () => {
  const params = {
    id: disk.value.id, // 厂商硬盘id
    diskSize: diskSize.value, // 扩容大小
    regionId: cvmStore.areaSelect.id, // 扩容大小
  }

  // 包年包月
  if (disk.value.costType === 2) {
    resizeDisk(true, params)
  } else {
    // 按量计费
    const cb = () => {
      show.value = false
      step.value.active = 'a'
    }
    resizeDisk(false, params, cb)
  }
}

// 计算磁盘价格
const diskPrice = async () => {
  const params = {
    regionId: disk.value.regionId,
    priceId: disk.value.diskTypeId,
    costType: disk.value.costType,
    size: diskSize.value - disk.value.size, // 需减去初始化大小
    diskCount: 1,
    operationType: 6,
    id: checkedDiskId.value,
  }

  const bool = Object.values(params).every(el => Boolean(el))
  // console.log(`diskPrice bool ===>`, Object.values(params), bool)

  if (!bool) return
  computeDiskPrice(params)
}

// 硬盘类型列表
const listDiskPriceFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      diskTypeList.value = res.data || []
    }
  }

  const params = {
    costType: 2,
    regionId: cvmStore.areaSelect.id,
  }

  listDiskPrice(params, cb)
}

watch(diskSize, () => {
  if (disk.value.size >= diskSize.value) {
    Object.keys(price).forEach(el => (price[el] = 0))
  } else {
    diskPrice()
  }
})

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.search-wrap {
  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }
}

:deep(.step-item-left) {
  width: 100% !important;
}

.list-left {
  margin-right: 20px;
}

.b-wrap {
  .item {
    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;

      // width: 105px;
    }

    .slider-wrap {
      width: 600px;

      .el-slider {
        margin-top: 0;
        margin-left: 12px;
      }
    }
  }
}

.cost-wrap {
  width: 172px;

  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: rgb(153 153 153 / 88%);
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: rgb(0 0 0 / 88%);
  }
}

.display-inline-block {
  display: inline-block;
}

.h106 {
  height: 106px;
}
</style>
