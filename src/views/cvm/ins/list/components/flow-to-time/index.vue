<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.flowToTime.title')"
    width="660px"
    :loading="comfirmLoading"
    :confirm-text="t('ins.flowToTime.convertNow')"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('ins.flowToTime.selectIns', [1])">
      <el-table :data="insList" class="mt20 table" max-height="600px">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.flowToTime.idName')">
          <template #default="{ row }">
            <div class="text-primary text-over">
              {{ row.insUuid }}
            </div>
            <div class="text-over">
              {{ row.instanceName }}
            </div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.flowToTime.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="200" :label="t('ins.flowToTime.insConfig')" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="padding: 14px 0" class="table-td_tooltip">
              <p class="text-over">
                <span class="mr10">{{ t('ins.powerOn.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p class="text-over">{{ t('ins.powerOn.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p class="text-over">{{ t('ins.powerOn.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
        <!-- 转换后到期时间 -->
        <el-table-column min-width="220" :label="t('ins.flowToTime.convertExpiredTime')">
          <template #header>
            <div class="df ac table-header-ellipsis">
              <el-tooltip
                :content="t('ins.flowToTime.convertExpiredTime')"
                :disabled="!convertExpiredTimeHeaderOverflow"
                placement="top"
                effect="light"
              >
                <span
                  ref="convertExpiredTimeHeaderRef"
                  class="mr10 table-header-ellipsis__text"
                  @mouseenter="updateConvertExpiredTimeHeaderOverflow"
                >
                  {{ t('ins.flowToTime.convertExpiredTime') }}
                </span>
              </el-tooltip>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default>
            <div>{{ expiredTime }}</div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="form"
        :rules="rules"
        label-position="left"
      >
        <!-- 续费时长 -->
        <el-form-item :label="t('ins.flowToTime.renewTime')" prop="duration">
          <el-select
            v-model="form.duration"
            class="select-opts w-full"
            :placeholder="t('ins.flowToTime.selectDuratePh')"
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
        <el-form-item :label="t('ins.flowToTime.autoRenew')">
          <el-checkbox
            v-model="form.check"
            class="auto-renew-checkbox"
            :label="t('ins.flowToTime.autoRenewDesc')"
            size="large"
          />
        </el-form-item>

        <!-- 存储 -->
        <el-form-item :label="t('ins.flowToTime.storage')">
          <template #label>
            <div class="df ac" style="line-height: 34px">
              <span class="mr4">
                {{ t('ins.flowToTime.storage') }}
              </span>
              <el-tooltip :content="t('ins.flowToTime.storageTip')" placement="top">
                <el-icon class="table-header_icon">
                  <SvgIcon name="cat-cdn-warning" />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <template #default>
            {{ t('ins.flowToTime.storageDesc') }}
          </template>
        </el-form-item>

        <!-- 费用 -->
        <el-form-item :label="t('ins.flowToTime.money')">
          <span class="text-warning">${{ price }} USD</span>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { DISK_DURATION_MAP } from '@/views/cvm/disk/config'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { _modifyInstancesChargeTypeInquiry } from '@/apis/cvm/ins'
import { useIns } from '@/views/cvm/hooks/use-ins'

interface Form {
  duration: number | string
  check: boolean
}

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const { modifyInstancesChargeType, loading: comfirmLoading } = useIns()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const isCollapse = ref<boolean>(false) // 是否收起
const convertExpiredTimeHeaderRef = ref<HTMLElement>()
const convertExpiredTimeHeaderOverflow = ref(false)
const form = reactive<Form>({
  duration: '',
  check: false,
})
const price = ref<number>(0)

const rules = reactive<FormRules<Form>>({
  duration: [{ required: true, message: '', trigger: 'change' }],
})

const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const expiredTime = computed(() => {
  const months = Number(form.duration) || 0

  // 获取当前时间并添加指定月份
  return maoYunDayJs().add(months, 'month').format(FORMAT_TIME)
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      modifyInstancesChargeTypeFn()
    } else {
      console.log('error submit!', fields)
    }
  })
}
const updateConvertExpiredTimeHeaderOverflow = () => {
  requestAnimationFrame(() => {
    const el = convertExpiredTimeHeaderRef.value
    convertExpiredTimeHeaderOverflow.value = !!el && el.scrollWidth > el.clientWidth
  })
}

let convertExpiredTimeHeaderResizeObserver: ResizeObserver | undefined

const observeConvertExpiredTimeHeader = async () => {
  await nextTick()

  convertExpiredTimeHeaderResizeObserver?.disconnect()
  if (convertExpiredTimeHeaderRef.value) {
    convertExpiredTimeHeaderResizeObserver = new ResizeObserver(updateConvertExpiredTimeHeaderOverflow)
    convertExpiredTimeHeaderResizeObserver.observe(convertExpiredTimeHeaderRef.value)
    convertExpiredTimeHeaderResizeObserver.observe(
      convertExpiredTimeHeaderRef.value.parentElement || convertExpiredTimeHeaderRef.value,
    )
  }

  updateConvertExpiredTimeHeaderOverflow()
}

// 弹窗打开
const open = () => {
  observeConvertExpiredTimeHeader()
}

onMounted(() => {
  observeConvertExpiredTimeHeader()
})

onUnmounted(() => {
  convertExpiredTimeHeaderResizeObserver?.disconnect()
})

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  isCollapse.value = false
  form.check = false
  formEl.resetFields()
}

// 服务器续费-询价
const instanceRenewInquiry = async () => {
  try {
    const instanceId = props.insList[0].id

    const params: any = {
      instanceId,
      period: form.duration,
      autoRenew: form.check,
      instanceChangeType: 2,
    }

    const res = await _modifyInstancesChargeTypeInquiry(params)

    console.log(`_modifyInstancesChargeTypeInquiry===>`, res)

    if (res.success) {
      price.value = res.data?.totalDiscountAmount || 0
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

// 按量计费转包年包月-创建预订单
const modifyInstancesChargeTypeFn = async () => {
  const instanceId = props.insList[0].id

  const params: any = {
    instanceId,
    period: form.duration,
    autoRenew: form.check,
    instanceChangeType: 2,
  }
  modifyInstancesChargeType(params)
}

watch(form, () => {
  instanceRenewInquiry()
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

:deep(.auto-renew-checkbox) {
  align-items: center;
  max-width: 100%;
  height: auto;

  .el-checkbox__label {
    flex: 1;
    min-width: 0;
    line-height: 20px;
    word-break: break-word;
    white-space: normal;
  }
}

.table-header-ellipsis {
  width: 100%;
  min-width: 0;

  .table-header-ellipsis__text {
    display: block;
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
