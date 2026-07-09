<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('disk.renew.title')"
    width="550px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <div class="form-wrap">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="form"
        :rules="rules"
        label-position="left"
      >
        <!-- 购买时长 -->
        <el-form-item :label="t('disk.renew.durate')" prop="duration">
          <el-select
            v-model="form.duration"
            class="select-opts w-full"
            :placeholder="t('disk.renew.duratePh')"
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
        <!-- 续费后到期时间 -->
        <el-form-item :label="t('disk.renew.expirateRenewTime')">
          {{ expiredTime }}
        </el-form-item>
        <!-- 费用 -->
        <el-form-item :label="t('disk.renew.money')">
          <span class="text-warning">${{ price.discountMoney }} USD</span>
        </el-form-item>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import { FormInstance, FormRules } from 'element-plus/es'
import t from '@/utils/i18n'
import { DISK_DURATION_MAP } from '@/views/cvm/disk/config'
import { maoYunDayJs } from '@/utils/mao-yun-day-js'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useCvmStore } from '@/store'

/**
 *  @desc 仅包年包月的数据盘支持续费
 */

interface PropType {
  disk: any
}

interface Form {
  duration: number | string
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})

const { loading: comfirmLoading, computeDiskPrice, price, listDiskPrice, renewDisk } = useDisk()
const cvmStore = useCvmStore()

const formRef = ref<FormInstance>()
const show = ref<boolean>(false) // 弹窗显示
const form = reactive<Form>({
  duration: '',
})
const diskTypeList = ref<any[]>([]) // 硬盘类型集合
const rules = reactive<FormRules<Form>>({
  duration: [{ required: true, message: '', trigger: 'change' }],
})

// 过期时间
const expiredTime = computed(() => {
  let resultDate

  const duration = (form.duration || 0) as number

  if (props.disk.expiredTime) {
    const expiredDate = maoYunDayJs(props.disk.expiredTime)
    const now = maoYunDayJs()

    if (expiredDate.isBefore(now)) {
      resultDate = now.add(duration, 'month')
    } else {
      resultDate = expiredDate.add(duration, 'month')
    }
  } else {
    resultDate = maoYunDayJs().add(duration, 'month')
  }

  return resultDate.format('YYYY-MM-DD')
})

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')

      renew()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = () => {
  listDiskPriceFn()
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return

  for (let key in price) {
    price[key] = 0
  }
  formEl.resetFields()
}

// 续费硬盘
const renew = async () => {
  const params = {
    id: props.disk.id, //厂商硬盘id
    duration: form.duration, //购买云盘的时长，默认单位为月，取值范围：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 36
    totalPrice: price.discountMoney, // 总价格
  }
  renewDisk(params)
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
    operationType: 5,
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
