<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('recovery.eip.renew.title')"
    width="950px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('recovery.eip.renew.selectEip', [1])">
      <div class="info df ac jsb">
        <div class="df ac mr4 cursor-pointer" @click="isShow = !isShow">
          <span>EIP{{ list[0].name }}</span>
          <el-icon :class="isShow ? 'is-reverse' : ''" style="transition: 0.3s">
            <CaretRight />
          </el-icon>
        </div>
        <div>
          <span class="text-warning">${{ state.eipPrice.discountMoney || 0 }} USD</span>
        </div>
      </div>

      <div class="msg mb20 mt20">
        {{ t('publicIp.selectEipNumber') }}
      </div>

      <el-collapse-transition>
        <div v-show="isShow">
          <el-table :data="list" class="mb20 table">
            <!-- 网络计费模式/带宽 -->
            <el-table-column min-width="220" :label="t('publicIp.networkBillingMode')">
              <template #default="{ row }">
                <p>{{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}</p>
                <p>{{ row?.size }} Mps</p>
              </template>
            </el-table-column>
            <!-- 到期时间 -->
            <el-table-column min-width="220" :label="t('publicIp.expirationDate')">
              <template #header>
                <div class="df ac">
                  <span class="mr10">{{ t('publicIp.expirationDate') }}</span>
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" />
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <div>
                  {{
                    row?.deadlineTime && row.chargeType === 2 ? maoYunDayJs(row?.deadlineTime).format(FORMAT_TIME) : '-'
                  }}
                </div>
              </template>
            </el-table-column>
            <!-- 续费后到期时间 -->
            <el-table-column min-width="220" :label="t('publicIp.afterRenewalExpirationDate')">
              <template #header>
                <div class="df ac">
                  <span class="mr10">{{ t('publicIp.afterRenewalExpirationDate') }}</span>
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" />
                  </el-tooltip>
                </div>
              </template>
              <template #default="{ row }">
                <p>{{ row.expirationTime ? maoYunDayJs(row.expirationTime).format(FORMAT_TIME) : '-' }}</p>
              </template>
            </el-table-column>
            <!-- 价格 -->
            <el-table-column min-width="200" :label="t('ins.renew.price')">
              <template #default>
                <div>
                  <span class="text-warning">${{ state.eipPrice.discountMoney || 0 }} USD</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-collapse-transition>

      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="state.form"
        :rules="rules"
        label-position="left"
      >
        <!-- 购买时长 -->
        <el-form-item :label="t('publicIp.purchaseDuration')" prop="period">
          <div>
            <el-select
              v-model="state.form.period"
              class="select-opts"
              :placeholder="t('publicIp.purchaseDurationPlaceholder')"
              @change="getQueryEipPrice"
            >
              <el-option
                v-for="item in purchaseDurationOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <div class="df ac opt-wrap w-full h-full">
                  <div>{{ item.label }}</div>
                  <!-- 暂时没有做折扣，此处4.0折扣显示隐藏 -->
                  <!-- <div class="select-msg">{{ item.msg }}</div> -->
                </div>
              </el-option>
            </el-select>
          </div>
        </el-form-item>
        <!-- 优惠价 -->
        <el-form-item :label="t('recovery.common.preferentialPrice')">
          <span class="text-warning">${{ state.eipPrice.discountMoney || 0 }} USD</span>
        </el-form-item>
      </el-form>
      <p class="mt20">
        <el-checkbox v-model="state.form.autoRenewFlag">
          {{ t('publicIp.renewTip') }}
        </el-checkbox>
      </p>
    </Collapse>
  </CatDialog>
</template>
<script lang="ts" setup>
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { purchaseDurationOptions } from '@/views/network/public-ip/list/components/set-buy/config'
import { chargeTypeList, calculateDaysFromNow } from '@/views/network/public-ip/list/config'
import { queryEipPrice } from '@/apis/network/public-ip'
import { usePublicIp } from '@/views/network/public-ip/hooks/use-public-ip'
import { CaretRight } from '@element-plus/icons-vue'

const cvmStore = useCvmStore()

const { renewNetwork } = usePublicIp()

const isCollapse = ref<boolean>(false) // 是否收起
const isShow = ref<boolean>(true) // 是否显示
const show = ref<boolean>(false)
const list = ref<any[]>([])
const eipId = ref<number>(0)
const formRef = ref<any>()

const state = reactive<{
  comfirmLoading: boolean
  form: { period: number | string; autoRenewFlag: boolean }
  eipPrice: any
}>({
  comfirmLoading: false,
  form: { period: '', autoRenewFlag: false },
  eipPrice: {},
})

const rules = {
  period: [{ required: true, message: '', trigger: 'blur' }],
}

const tips = computed(() => [
  {
    main: t('recovery.eip.renew.tipsMain'),
    sub: [t('recovery.eip.renew.tipsSub1')],
  },
])

// 查询价格
const getQueryEipPrice = async () => {
  list.value = list.value.map(i => {
    const totalDay = calculateDaysFromNow(i.deadlineTime, state.form.period as number) // 计算续费后到期时间
    i.expirationTime = i.deadlineTime + totalDay
    return i
  })

  const eipInfo = list.value[0]
  const params: any = {
    chargeType: 2,
    regionId: cvmStore.areaSelect.id,
    size: eipInfo?.size,
    num: 1,
    period: state.form.period || 1,
    autoRenew: state.form.autoRenewFlag,
    lineType: eipInfo?.lineType,
  }
  try {
    const res = await queryEipPrice(params)
    if (res.success) {
      state.eipPrice = res.data
    } else {
      state.eipPrice = {}
    }
  } catch (err) {
    console.log('error', err)
  }
}

const confirmHandle = async () => {
  await formRef.value?.validate()
  const params: any = {
    eipId: eipId.value,
    period: state.form.period,
    autoRenewFlag: state.form.autoRenewFlag ? 2 : 1,
  }
  renewNetwork(params)
}

const closeFn = () => {
  state.comfirmLoading = false
  state.form = { period: '', autoRenewFlag: false }
  formRef.value.resetFields()
  show.value = false
  isCollapse.value = false
  isShow.value = true
}

const open = () => {
  // 自动续费 - 赋值
  if (list.value.length > 0) {
    state.form.autoRenewFlag = list.value[0]?.renewFlag === 2 ? true : false
  }
  getQueryEipPrice()
}

defineExpose({
  show,
  list,
  eipId,
})
</script>
<style lang="scss" scoped>
.msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #555;
}

.mb9 {
  margin-bottom: 9px;
}

.mb18 {
  margin-bottom: 18px;
}

.w406 {
  width: 406px;
}

.w-100 {
  width: 100%;
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
