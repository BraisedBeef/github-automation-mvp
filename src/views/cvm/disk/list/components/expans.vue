<template>
  <!-- 第一步 -->
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.expans.title')"
    :width="dialogClass"
    :loading="comfirmLoading"
    :footer="false"
    @update:dialog="() => {}"
    @open="open"
  >
    <div class="a-wrap">
      <!-- tip -->
      <Tip :text="tips" type="OneToOne" />
      <CatStep
        v-model="step.active"
        :step-item-style="{
          minWidth: '180px',
        }"
        class="df mt20"
        :steps="step.steps"
        :v-change="false"
      />
      <ElCollapseTransition>
        <div v-show="isCollapse">
          <el-table :data="[disk]" class="mb20 table">
            <!-- 云硬盘ID/名称 -->
            <el-table-column min-width="200" :label="t('disk.expans.idName')">
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-primary text-over">
                    {{ row.diskId }}
                  </div>
                  <div class="text-over">
                    {{ row.diskName }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 计费模式 -->
            <el-table-column min-width="150" :label="t('disk.expans.costType')" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-over">
                    {{ COST_TYPE_MAP[row.costType] }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 创建/到期时间 包年包月 -->
            <el-table-column
              v-if="isTimeCost(props.disk.costType)"
              min-width="220"
              :label="t('disk.expans.time')"
              show-overflow-tooltip
            >
              <template #header>
                <div class="df ac">
                  <span>{{ t('disk.expans.time') }}</span>
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" class="ml10" />
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-over">
                    {{
                      t('disk.expans.createTime', [
                        row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '',
                      ])
                    }}
                  </div>
                  <div class="text-over">
                    {{
                      t('disk.expans.expiresTime', [
                        row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '',
                      ])
                    }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 创建时间 按量计费 -->
            <el-table-column v-else min-width="220" :label="t('disk.expans.time_create')" show-overflow-tooltip>
              <template #header>
                <div class="df ac">
                  <span>{{ t('disk.expans.time_create') }}</span>
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" class="ml10" />
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-over">
                    {{
                      t('disk.expans.createTime', [
                        row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '',
                      ])
                    }}
                  </div>
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
            <el-table-column min-width="150" :label="t('disk.expans.associateIns')" show-overflow-tooltip>
              <template #header>
                <el-tooltip
                  :content="t('disk.expans.associateIns')"
                  :disabled="!associateInsHeaderOverflow"
                  placement="top"
                  effect="light"
                >
                  <span
                    ref="associateInsHeaderRef"
                    class="table-header-ellipsis"
                    @mouseenter="updateAssociateInsHeaderOverflow"
                  >
                    {{ t('disk.expans.associateIns') }}
                  </span>
                </el-tooltip>
              </template>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-primary">
                    {{ row.insUuid }}
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </ElCollapseTransition>
      <div class="df">
        <div class="list-left">
          <div class="item mb20">
            <div class="key">
              {{ t('disk.expans.curSize') }}
            </div>
          </div>
          <div class="item mb20 h46">
            <div class="key lh32">
              {{ t('disk.expans.targetSize') }}
            </div>
          </div>
          <div class="item">
            <div class="key">
              {{ t('disk.expans.money') }}
            </div>
          </div>
        </div>
        <div class="list-right">
          <div class="item mb20">
            <div class="value">{{ disk.size }}GiB</div>
          </div>
          <div class="item mb32">
            <div class="value slider-wrap df ac">
              <el-slider
                v-model="diskSize"
                :show-stops="false"
                :min="disk.size || slideConfig.min"
                :max="slideConfig.max"
                :marks="slideConfig.marks"
                :format-tooltip="value => value + 'GiB'"
              />
              <div class="df ac ml20">
                <el-input-number
                  v-model="diskSize"
                  :min="disk.size || slideConfig.min"
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
                      {{ t('disk.expans.feeItem') }}
                    </div>
                    <div class="value">
                      {{ t('disk.expans.disk') }}
                    </div>
                  </div>
                  <!-- 价格 -->
                  <div class="df ac jsb">
                    <div class="key">
                      {{ t('disk.expans.price') }}
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
        <el-button type="primary" @click="nextHandleA">
          <slot name="confirm">
            {{ t('disk.expans.next') }}
          </slot>
        </el-button>
        <el-button plain class="cancel" @click="show = false">
          {{ t('disk.expans.close') }}
        </el-button>
      </div>
    </div>
  </CatDialog>
  <!-- 第二步 -->
  <CatDialog
    v-model:dialog="showB"
    :title="t('disk.expans.title')"
    width="760px"
    :loading="comfirmLoading"
    :footer="false"
    @update:dialog="() => {}"
  >
    <div>
      <CatStep
        v-model="step.active"
        :step-item-style="{
          minWidth: '180px',
        }"
        class="df mt20 mb20"
        :steps="step.steps"
        :v-change="false"
      />
      <!-- tip -->
      <Tip :text="tipsB" type="OneToOne" hide-margin-bottom />

      <div class="cat-dialog-footer">
        <el-button plain class="cancel" @click="prevHandleB">
          {{ t('disk.expans.pre') }}
        </el-button>
        <el-button type="primary" :loading="comfirmLoading" @click="confirmHandleB">
          <slot name="confirm">
            {{ t('disk.expans.confirm') }}
          </slot>
        </el-button>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { ElCollapseTransition } from 'element-plus'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useCvmStore } from '@/store'
import {
  SYS_DISK_SIZE_MAX,
  SYS_DISK_SIZE_MIN,
  DATA_DISK_SIZE_MAX,
  DATA_DISK_SIZE_MIN,
  isTimeCost,
} from '@/views/cvm/disk/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { _debounce } from '@/utils/timing-utils'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '760px',
  [en]: '800px',
  [zh]: '820px',
}

const dialogClass = useI18nStyle(dialogMap)

interface PropType {
  disk: any
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const { loading: comfirmLoading, computeDiskPrice, price, listDiskPrice, resizeDisk } = useDisk()
const cvmStore = useCvmStore()

const diskTypeList = ref<any[]>([]) // 硬盘类型集合
const step = ref({
  active: 'a',
  steps: [
    { label: t('disk.expans.stepA'), value: 'a' },
    { label: t('disk.expans.stepB'), value: 'b' },
  ],
})
const show = ref<boolean>(false) // 弹窗显示
const showB = ref<boolean>(false) // 弹窗显示
const isCollapse = ref<boolean>(true) // 是否收起
const diskSize = ref<number>(0) // 扩容大小
const associateInsHeaderRef = ref<HTMLElement>()
const associateInsHeaderOverflow = ref(false)

const tips = computed(() => [
  {
    main: t('disk.expans.tipsMain'),
  },
])

const tipsB = computed(() => [
  {
    main: t('disk.expans.tipsBMain'),
  },
])

const slideConfig = computed(() => {
  return {
    marks:
      props.disk.type === 1
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
    min: props.disk.type === 1 ? SYS_DISK_SIZE_MIN : DATA_DISK_SIZE_MIN,
    max: props.disk.type === 1 ? SYS_DISK_SIZE_MAX : DATA_DISK_SIZE_MAX,
  }
})

const nextHandleA = () => {
  if (!diskSize.value) {
    return message.warning(t('disk.expans.targetSizeWarning'))
  }

  if (diskSize.value <= props.disk.size) {
    return message.warning(t('disk.expans.targetSizeWarning2'))
  }

  show.value = false
  showB.value = true
  step.value.active = 'b'
}

const prevHandleB = () => {
  showB.value = false
  show.value = true
  step.value.active = 'a'
}

const confirmHandleB = () => {
  resizeDiskFn()
}

// 弹窗打开
const open = () => {
  diskSize.value = props.disk.size || 0

  listDiskPriceFn()
  observeAssociateInsHeader()
}

const updateAssociateInsHeaderOverflow = () => {
  requestAnimationFrame(() => {
    const el = associateInsHeaderRef.value
    associateInsHeaderOverflow.value = !!el && el.scrollWidth > el.clientWidth
  })
}

let associateInsHeaderResizeObserver: ResizeObserver | undefined

const observeAssociateInsHeader = async () => {
  await nextTick()

  associateInsHeaderResizeObserver?.disconnect()
  if (associateInsHeaderRef.value) {
    associateInsHeaderResizeObserver = new ResizeObserver(updateAssociateInsHeaderOverflow)
    associateInsHeaderResizeObserver.observe(associateInsHeaderRef.value)
    associateInsHeaderResizeObserver.observe(associateInsHeaderRef.value.parentElement || associateInsHeaderRef.value)
  }

  updateAssociateInsHeaderOverflow()
}

onMounted(() => {
  observeAssociateInsHeader()
})

onUnmounted(() => {
  associateInsHeaderResizeObserver?.disconnect()
})

// 扩容硬盘
const resizeDiskFn = async () => {
  const params = {
    id: props.disk.id, // 厂商硬盘id
    diskSize: diskSize.value, // 扩容大小
    regionId: props.disk.regionId, // 区域id
  }

  // 包年包月
  if (isTimeCost(props.disk.costType)) {
    resizeDisk(true, params)
  } else {
    // 按量计费
    const cb = () => {
      emits('success')
      show.value = false
      showB.value = false
      step.value.active = 'a'
    }
    resizeDisk(false, params, cb)
  }
}

// 计算磁盘价格
const diskPrice = async () => {
  const params = {
    regionId: props.disk.regionId,
    priceId: props.disk.diskTypeId,
    costType: props.disk.costType,
    size: diskSize.value - props.disk.size, // 需减去初始化大小
    diskCount: 1,
    operationType: 6,
    id: props.disk.id,
  }

  const bool = Object.values(params).every(el => Boolean(el))
  console.log(`diskPrice bool ===>`, Object.values(params), bool)

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

// 计算当前云硬盘扩容价格
const setDishPrice = _debounce(() => {
  if (props.disk.size >= diskSize.value) {
    Object.keys(price).forEach(el => (price[el] = 0))
  } else {
    diskPrice()
  }
}, 500)

watch(diskSize, setDishPrice)

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
:deep(.step-item-left) {
  width: 100% !important;
}

.a-wrap {
  margin-top: 20px;

  .item {
    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
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

.list-left {
  margin-right: 20px;
}

.h46 {
  height: 46px;
}

.display-inline-block {
  display: inline-block;
}

.ml20 {
  margin-left: 20px;
}

.mb32 {
  margin-bottom: 32px;
}

.lh32 {
  line-height: 32px;
}

.table-header-ellipsis {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
