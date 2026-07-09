<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.createDisk.title')"
    :width="dialogClass"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <div class="form-wrap">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        :label-width="formLabelWidth"
        :model="form"
        :rules="rules"
        label-position="left"
        :validate-on-rule-change="false"
      >
        <!-- 可用区 -->
        <el-form-item :label="t('disk.createDisk.zone')">
          <div>
            <BtnsGroup v-model="zoneValue" :list="zoneBtnsGroupList" :row-item-len="zoneRowItemLen" />
            <p v-if="zoneValue.instanceCount" class="text-warning zone-desc">
              {{ t('disk.createDisk.zoneInsDesc', [zoneValue.instanceCount]) }}
            </p>
            <p v-else class="text-error zone-desc">
              {{ t('disk.createDisk.zoneNoInsDesc') }}
            </p>
          </div>
        </el-form-item>
        <!-- 计费模式 -->
        <el-form-item :label="t('disk.createDisk.costType')">
          <BtnsGroup
            v-model="costType"
            :list="COST_TYPE_BTN_GROUP_MAP"
            :style="{
              width: '130px',
            }"
            @change-value="changeCostValue"
          />
        </el-form-item>
        <!-- 云硬盘类型 -->
        <el-form-item :label="t('disk.createDisk.diskType')" prop="diskType">
          <!-- 云硬盘下拉 -->
          <el-select
            v-model="form.diskType"
            class="select-opts mr20"
            :placeholder="t('disk.createDisk.diskTypePh')"
            @change="changeDiskType"
          >
            <el-option v-for="item in diskTypeList" :key="item.id" :label="item.diskName" :value="item.id" />
          </el-select>
          <!-- 大小 -->
          <el-input-number
            v-model="form.size"
            class="size-wrap"
            :min="DATA_DISK_SIZE_MIN"
            :max="DATA_DISK_SIZE_MAX"
            @change="() => {}"
          /><span style="margin-left: 10px">GiB</span>
        </el-form-item>
        <!-- 快速创建 -->
        <el-form-item :label="t('disk.createDisk.quickCreate')" prop="snapshotId">
          <div class="fln w-full">
            <div class="w-full lineStyle">
              <el-checkbox v-if="snapshotCreateConfig.checkSnapshot" :model-value="checkSnapshot" size="large">
                {{ t('disk.createDisk.snapshotCreateDisk') }}
              </el-checkbox>
              <el-checkbox v-else v-model="checkSnapshot" size="large" @change="v => changeSnapshot(v, formRef)">
                {{ t('disk.createDisk.snapshotCreateDisk') }}
              </el-checkbox>
            </div>
            <div v-if="checkSnapshot" class="w-full">
              <!-- 快照列表 -->
              <el-select
                v-model="form.snapshotId"
                class="select-opts mr20"
                style="width: 400px"
                :placeholder="t('disk.createDisk.snapshotPh')"
              >
                <el-option v-for="item in snapshotList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </div>
          </div>
        </el-form-item>
        <!-- 硬盘名称 -->
        <el-form-item :label="t('disk.createDisk.diskName')" prop="diskName">
          <el-input
            v-model="form.diskName"
            style="width: 230px"
            :maxlength="DISK_NAME_LEN_MAX"
            :placeholder="t('disk.createDisk.diskNamePh')"
          />
          <div class="disk-name-desc">
            {{ t('disk.createDisk.diskNameCreate') }}
          </div>
        </el-form-item>
        <!-- 购买数量 -->
        <el-form-item :label="t('disk.createDisk.diskCount')" prop="diskCount">
          <el-input-number v-model="form.diskCount" :min="1" :max="CREATE_DISK_COUNT_MAX" @change="() => {}" /><span
            style="margin-left: 10px"
            >{{ t('disk.createDisk.piece') }}</span
          >
        </el-form-item>
        <!-- 购买时长 -->
        <el-form-item v-if="isTimeCost(costType.value)" :label="t('disk.createDisk.durate')" prop="duration">
          <el-select
            v-model="form.duration"
            class="select-opts"
            style="width: 400px"
            :placeholder="t('disk.createDisk.duratePh')"
          >
            <el-option v-for="item in DISK_DURATION_MAP" :key="item.value" :label="item.label" :value="item.value">
              <div class="df ac opt-wrap w-full h-full">
                <div>{{ item.label }}</div>
                <div v-if="item.more" class="more-wrap text-warning ml20">
                  {{ item.more }}
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 自动续费 -->
        <el-form-item v-if="isTimeCost(costType.value)" :label="t('disk.createDisk.autoRenew')" prop="confirmPassword">
          <el-checkbox v-model="checkRenewFlag" size="large" @change="changeRenewFlag">
            {{ t('disk.createDisk.autoRenewChecked') }}
          </el-checkbox>
        </el-form-item>
        <!-- 总价 -->
        <el-form-item :label="t('disk.createDisk.totalMoney')" prop="check" class="mb0">
          <span class="text-warning mr20">${{ price.discountMoney }} USD</span>
          <el-popover placement="top" :width="200" trigger="hover">
            <template #reference>
              <span class="pointer" style="text-decoration: underline">{{
                t('disk.createDisk.configCostDetail')
              }}</span>
            </template>

            <template #default>
              <div class="cost-wrap">
                <div class="tit mb10">
                  {{ t('disk.createDisk.configCostDetail') }}
                </div>
                <!-- 计费项 -->
                <div class="df ac jsb item">
                  <div class="key">
                    {{ t('disk.createDisk.costItem') }}
                  </div>
                  <div class="value">
                    {{ t('disk.createDisk.price') }}
                  </div>
                </div>
                <!-- 云硬盘 -->
                <div class="df ac jsb item">
                  <div class="key">
                    {{ t('disk.createDisk.disk') }}
                  </div>
                  <div class="value">${{ price.originalMoney }} USD</div>
                </div>
                <!-- 折扣价 -->
                <div class="df ac jsb item">
                  <div class="key">
                    {{ t('disk.createDisk.discountMoney') }}
                  </div>
                  <div class="value text-warning">${{ price.discountMoney }} USD</div>
                </div>
              </div>
            </template>
          </el-popover>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'
import { useCvmStore } from '@/store'
import {
  COST_TYPE_BTN_GROUP_MAP,
  DISK_DURATION_MAP,
  DISK_NAME_REGEX,
  DISK_NAME_LEN_MAX,
  DATA_DISK_SIZE_MIN,
  DATA_DISK_SIZE_MAX,
} from '@/views/cvm/disk/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useSnapshot } from '@/views/cvm/hooks/use-snapshot'
import { CREATE_DISK_COUNT_MAX } from '@/views/cvm/disk/config'
import { isTimeCost } from '@/views/cvm/disk/config'

/**
 * @desc 创建硬盘都是数据盘类型
 * @desc 创建实例的硬盘才有系统盘
 * @desc 暂时支持包年包月类型
 */

interface Form {
  size: number
  diskCount: number
  diskName: string
  diskType: number | string
  snapshotId: string
  renewFlag: number
  duration: number
}

interface PropType {
  snapshotCreateConfig?: {
    checkSnapshot: boolean // 是否快速创建
    snapshotId?: string // 快照id
    snapshotName?: string // 快照名称
    diskId?: number // 硬盘主键id
  }
}

const props = withDefaults(defineProps<PropType>(), {
  snapshotCreateConfig: () => ({ checkSnapshot: false, snapshotId: '', snapshotName: '', diskId: 0 }),
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const formLabelWidthMap = {
  [ja]: '180px',
  [en]: '160px',
  [zh]: '100px',
}

const dialogMap = {
  [ja]: '810px',
  [en]: '940px',
  [zh]: '810px',
}

const zoneRowItemLenMap = {
  [ja]: 4,
  [en]: 4,
  [zh]: 6,
}

const dialogClass = useI18nStyle(dialogMap)
const { getSnapshotList } = useSnapshot()
const { loading: comfirmLoading, createDisk, computeDiskPrice, price, listDiskPrice } = useDisk()
const { listByRegionId } = useBaseConfig()
const cvmStore = useCvmStore()
const formLabelWidth = useI18nStyle(formLabelWidthMap)
const zoneRowItemLen = useI18nStyle(zoneRowItemLenMap)

const formRef = ref<FormInstance>()

// 校验硬盘名称
const checkDiskName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!DISK_NAME_REGEX.test(value)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

const show = ref<boolean>(false) // 弹窗显示
const form = reactive<Form>({
  size: DATA_DISK_SIZE_MIN, // 大小(GB)
  diskCount: 1, // 创建云硬盘数量
  diskName: '', // 硬盘名称
  diskType: '', // 价格类型
  snapshotId: '', // 快照ID
  renewFlag: 2, // 自动续费标识( 1 自动续费 2 不自动续费)
  duration: 1, // 时长
})
const checkSnapshot = ref<boolean>(false) // 是否快速创建
const checkRenewFlag = ref<boolean>(false) // 是否自动续费
const zoneValue = ref<any>({}) // 可用区
const costType = ref<any>(COST_TYPE_BTN_GROUP_MAP[0]) // 计费模式
const rules = reactive<FormRules<Form>>({
  diskName: [{ required: true, validator: checkDiskName, trigger: 'blur' }],
  diskCount: [{ required: true, message: '', trigger: 'blur' }],
  diskType: [{ required: true, message: '', trigger: 'change' }],
  // snapshotId: [{ required: true, message: '', trigger: 'change' }],
})
const diskTypeList = ref<any[]>([]) // 硬盘类型集合
const snapshotList = ref<any[]>([]) // 快照列表
const zoneBtnsGroupList = ref<any[]>([]) // 可用区集合

const tips = computed(() => [
  {
    main: t('disk.createDisk.tipsMain'),
    sub: [t('disk.createDisk.tipsSub1'), t('disk.createDisk.tipsSub2')],
  },
])

// 切换云硬盘类型
const changeDiskType = () => {
  // 不是快速创建
  if (!props.snapshotCreateConfig.checkSnapshot) {
    getSnapshotListFn()
  }
}

// 处理可用区
const listByRegionIdFn = () => {
  const cb = (res: any) => {
    if (res.success) {
      const zoneList = res.data || []
      if (zoneList.length) {
        const zone = zoneList[0]

        // 默认取第一个
        zoneValue.value = {
          label: zone.zoneName,
          value: zone.id,
          ...zone,
        }

        zoneBtnsGroupList.value = zoneList.map(el => ({
          ...el,
          label: `${el.zoneName}（${el.instanceCount || 0}）`,
          value: el.id,
        }))
      }
    }
  }
  const params = {
    regionId: cvmStore.areaSelect.id,
  }

  listByRegionId(params, cb)
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      createDiskFn()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = async () => {
  listByRegionIdFn()
  await listDiskPriceFn()

  // 快速创建
  if (props.snapshotCreateConfig.checkSnapshot) {
    checkSnapshot.value = true
    snapshotList.value = [
      {
        id: props.snapshotCreateConfig.snapshotId,
        name: props.snapshotCreateConfig.snapshotName,
      },
    ]
    form.snapshotId = props.snapshotCreateConfig.snapshotId as string
  } else {
    getSnapshotListFn()
  }
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  costType.value = COST_TYPE_BTN_GROUP_MAP[0]

  if (!formEl) return

  form.size = DATA_DISK_SIZE_MIN
  form.diskCount = 1
  form.diskType = ''
  form.snapshotId = ''
  form.renewFlag = 2
  form.duration = 1
  for (let key in price) {
    price[key] = 0
  }
  checkSnapshot.value = false
  checkRenewFlag.value = false
  formEl.resetFields()
}

// 切换快照创建
const changeSnapshot = (v, formEl: FormInstance | undefined) => {
  if (v) {
    if (snapshotList.value.length && !form.snapshotId) {
      // 默认取第一个
      form.snapshotId = snapshotList.value[0].id
    }

    // 动态添加校验规则
    if (formEl) {
      // 清除校验样式
      formEl.clearValidate()
    }
    rules.snapshotId = [{ required: true, message: '', trigger: 'change' }]
  } else {
    delete rules.snapshotId
    form.snapshotId = ''
  }
}

// 切换计费模式
const changeCostValue = () => {
  listDiskPriceFn()
}

// 切换自动续费标识
const changeRenewFlag = value => {
  form.renewFlag = value ? 1 : 2
}

// 硬盘类型列表
const listDiskPriceFn = async () => {
  const cb = (res: any) => {
    if (res.success) {
      diskTypeList.value = res.data || []

      const diskTypeRes = diskTypeList.value.find(el => el.id === form.diskType)

      if (diskTypeRes) {
        form.diskType = diskTypeRes.id
      } else {
        // 默认取第一个
        form.diskType = diskTypeList.value.length ? diskTypeList.value[0].id : ''
      }
    } else {
      form.diskType = ''
    }
  }

  const params: any = {
    costType: costType.value.value,
    regionId: cvmStore.areaSelect.id,
  }

  // 快速创建
  if (props.snapshotCreateConfig.checkSnapshot) {
    params.diskId = props.snapshotCreateConfig.diskId
  }

  return listDiskPrice(params, cb)
}

// 获取快照列表
const getSnapshotListFn = () => {
  const params = {
    states: [1], // 快照状态 1正常
    regionId: cvmStore.areaSelect.id,
    pageIndex: 1,
    pageSize: 999,
    diskType: 2,
    diskTypeId: form.diskType, // 硬盘类型id
  }

  const cb = (res: any) => {
    if (res.success) {
      snapshotList.value = res.data.list || []

      form.snapshotId = ''
    }
  }

  getSnapshotList(params, cb)
}

// 计算磁盘价格
const computeDiskPriceFn = () => {
  const params = {
    regionId: cvmStore.areaSelect.id,
    priceId: form.diskType,
    costType: costType.value.value,
    size: form.size,
    duration: form.duration,
    diskCount: form.diskCount,
    operationType: 1,
  }

  computeDiskPrice(params)
}

// 创建磁盘
const createDiskFn = () => {
  let params: any = {}

  // 包年包月
  if (costType.value.value === 2) {
    params = {
      size: form.size,
      diskCount: form.diskCount,
      diskName: form.diskName,
      priceId: form.diskType,
      snapshotId: form.snapshotId,
      renewFlag: form.renewFlag,
      duration: form.duration,
      totalPrice: price.discountMoney,
      regionId: cvmStore.areaSelect.id,
      costType: costType.value.value,
      zoneId: zoneValue.value.id,
    }

    createDisk(params)
  } else {
    // 按量计费
    const cb = () => {
      emits('success')
      show.value = false
    }

    params = {
      size: form.size,
      diskCount: form.diskCount,
      diskName: form.diskName,
      priceId: form.diskType,
      snapshotId: form.snapshotId,
      totalPrice: price.discountMoney,
      regionId: cvmStore.areaSelect.id,
      costType: costType.value.value,
      zoneId: zoneValue.value.id,
      duration: form.duration,
    }

    createDisk(params, cb)
  }
}

// 监听计算磁盘价格
watch([() => form.diskType, () => form.size, () => form.duration, () => form.diskCount, costType], () => {
  computeDiskPriceFn()
})

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.opt-wrap {
  padding: 0 8px;

  &:hover {
    color: #0063ff;
    background: #f1f7ff;
  }

  .more-wrap {
    width: 46px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border: 1px solid #fc8c00;
    border-radius: 11px;
  }
}

.zone-desc {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
}

.disk-name-desc {
  margin-top: 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

.cost-wrap {
  width: 220px;

  .tit {
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 12px;
    color: #000;
  }

  .item {
    &:hover {
      background: #f9fafc;
    }

    height: 30px;
    padding: 0 10px;
    line-height: 30px;

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 12px;
      font-weight: 400;
      color: #000;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: rgb(0 0 0 / 88%);
    }
  }
}

:deep(.size-wrap .el-input__wrapper) {
  box-shadow: rgb(220 223 230) 0 0 0 1px inset !important;
}

.mt20 {
  margin-top: 20px;
}

.mb0 {
  margin-bottom: 0 !important;
}

.lineStyle {
  line-height: 1;
}
</style>
