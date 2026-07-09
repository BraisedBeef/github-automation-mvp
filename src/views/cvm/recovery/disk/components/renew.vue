<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('recovery.disk.renew.title')"
    width="950px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('recovery.disk.renew.selectDisk', [1])">
      <div class="info df ac jsb">
        <div class="df ac mr4 cursor-pointer" @click="isShow = !isShow">
          <span>{{ t('disk.list.disk') }}{{ disk.diskName }}</span>
          <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
            <CaretRight />
          </el-icon>
        </div>
        <div>
          <span class="text-warning">${{ price.discountMoney }} USD</span>
          <!-- <span class="line-through line-through-text">${{ 0 }} USD</span> -->
        </div>
      </div>
      <el-collapse-transition>
        <div v-show="isShow">
          <el-table :data="[disk]" class="mt20 table">
            <!-- 配置 -->
            <el-table-column min-width="200" :label="t('ins.renew.config')" show-overflow-tooltip>
              <template #default="{ row }">
                <span>{{ row.diskType || '-' }}</span>
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
                <span>{{ row.expiredTime ? maoYunDayJs(row.expiredTime).format(FORMAT_TIME) : '-' }}</span>
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
              <template #default>
                <span>{{ expiredTime }}</span>
              </template>
            </el-table-column>
            <!-- 价格 -->
            <el-table-column min-width="200" :label="t('ins.renew.price')">
              <template #default>
                <div>
                  <span class="text-warning">${{ price.discountMoney }} USD</span>
                  <!-- <span class="line-through line-through-text">${{ row.originalPrice }} USD</span> -->
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-transition>
    </Collapse>

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
        <el-form-item :label="t('disk.renew.durate')" prop="duration">
          <el-select
            v-model="form.duration"
            class="select-opts"
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
        <!-- 优惠价 -->
        <el-form-item :label="t('recovery.common.preferentialPrice')">
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
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useDisk } from '@/views/cvm/hooks/use-disk'
import { useCvmStore } from '@/store'
import { CaretRight } from '@element-plus/icons-vue'

/**
 *  @desc 仅包年包月的弹性数据盘支持续费
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

const { computeDiskPrice, price, listDiskPrice, renewDisk } = useDisk()
const cvmStore = useCvmStore()

const formRef = ref<FormInstance>()

const comfirmLoading = ref<boolean>(false)
const show = ref<boolean>(false) // 弹窗显示
const isShow = ref<boolean>(true) // 是否显示
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({
  duration: '',
})
const diskTypeList = ref<any[]>([]) // 硬盘类型集合
const rules = reactive<FormRules<Form>>({
  duration: [{ required: true, message: '', trigger: 'change' }],
})

const tips = computed(() => [
  {
    main: t('recovery.disk.renew.tipsMain'),
    sub: [t('recovery.disk.renew.tipsSub1')],
  },
])

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

  return resultDate.format(FORMAT_TIME)
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
  isCollapse.value = false
  isShow.value = true
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
