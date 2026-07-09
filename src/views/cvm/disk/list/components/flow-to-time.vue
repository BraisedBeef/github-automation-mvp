<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.flowToTime.title')"
    width="680px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <Collapse v-model="isCollapse" :text="t('disk.flowToTime.selectDisk', [1])">
      <el-table :data="[disk]" class="mt20 table" max-height="600px">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('disk.flowToTime.idName')">
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
        <el-table-column min-width="150" :label="t('disk.flowToTime.costType')">
          <template #default="{ row }">
            <span>{{ COST_TYPE_MAP[row.costType] }}</span>
          </template>
        </el-table-column>
        <!-- 创建/到期时间 -->
        <el-table-column min-width="220" :label="t('disk.flowToTime.createTime')" show-overflow-tooltip>
          <template #header>
            <div class="df ac">
              <span class="mr10">{{ t('disk.flowToTime.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            <div class="text-over">
              {{
                t('disk.flowToTime.createTimeFormat', [
                  row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '',
                ])
              }}
            </div>
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
        <!-- 购买时长 -->
        <el-form-item :label="t('disk.flowToTime.durate')" prop="duration">
          <el-select
            v-model="form.duration"
            class="select-opts w-full"
            :placeholder="t('disk.flowToTime.selectDuratePh')"
            @change="diskPrice"
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
        <el-form-item :label="t('disk.flowToTime.autoRenew')">
          <el-checkbox v-model="form.check" :label="t('disk.flowToTime.autoRenewDesc')" size="large" />
        </el-form-item>

        <!-- 费用 -->
        <el-form-item :label="t('disk.flowToTime.money')">
          <span class="text-warning">${{ price.discountMoney }} USD</span>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { FormInstance, FormRules } from 'element-plus/es'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { DISK_DURATION_MAP } from '@/views/cvm/disk/config'
import { useDisk } from '@/views/cvm/hooks/use-disk'

interface Form {
  duration: number | string
  check: boolean
}

interface PropType {
  disk: any
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})
defineEmits<{
  (event: 'success'): void
}>()

const { loading: comfirmLoading, computeDiskPrice, price, diskConvertOnDemandToSubscription } = useDisk()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({
  duration: '',
  check: false,
})

const rules = reactive<FormRules<Form>>({
  duration: [{ required: true, message: '', trigger: 'change' }],
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      diskConvertOnDemandToSubscriptionFn()
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  isCollapse.value = false
  form.check = false
  formEl.resetFields()
}

// 计算磁盘价格
const diskPrice = async () => {
  const params = {
    regionId: props.disk.regionId,
    priceId: props.disk.diskTypeId,
    costType: props.disk.costType,
    size: props.disk.size,
    duration: form.duration,
    diskCount: 1,
    operationType: 9,
    id: props.disk.id,
  }

  const bool = Object.values(params).every(el => Boolean(el))
  console.log(`diskPrice bool ===>`, Object.values(params), bool)

  if (!bool) return
  computeDiskPrice(params)
}

// 按量计费转包年包月-创建预订单
const diskConvertOnDemandToSubscriptionFn = async () => {
  const id = props.disk.id

  const params: any = {
    id,
    duration: form.duration,
    renewFlag: form.check,
  }
  diskConvertOnDemandToSubscription(params)
}

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
</style>
