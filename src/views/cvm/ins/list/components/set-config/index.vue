<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setConfig.title')"
    :width="dialogClass"
    :footer="false"
    @update:dialog="cancel"
    @open="open"
  >
    <!-- 第一步 -->
    <div v-show="step.active === 'a'" class="a-wrap">
      <!-- tip -->
      <Tip v-if="type === 'RUNNING'" :text="runningTipsA" type="OneToMany" />
      <Tip v-else :text="stopedTipsA" type="OneToOne" />

      <Collapse v-model="isCollapse" :text="t('ins.setConfig.selectIns', [insList.length])">
        <el-table :data="insList" class="mt20 table">
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.idName')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.insUuid }}
              </div>
              <div>{{ row.instanceName }}</div>
            </template>
          </el-table-column>
          <!-- 当前配置 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.curConfig')">
            <template #default="{ row }">
              <div style="padding: 14px 0">
                <p>{{ row.specificationInfo?.specificationName }}</p>
                <p>
                  ({{ row.specificationInfo?.typeName }}，{{ t('ins.setConfig.cores', [row.specificationInfo?.vcpus])
                  }}{{ row.specificationInfo?.ram }}GB）
                </p>
              </div>
            </template>
          </el-table-column>
          <!-- 当前可用区 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.curZone')">
            <template #default="{ row }">
              <div>{{ row.zoneName }}</div>
            </template>
          </el-table-column>
          <!-- 实例计费模式 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.insCostType')">
            <template #default="{ row }">
              <div>{{ COST_TYPE_MAP[row.instanceChargeType] }}</div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.opts')">
            <template #default>
              <div>{{ t('ins.setConfig.able') }}</div>
            </template>
          </el-table-column>
        </el-table>
      </Collapse>

      <div class="checked-wrap mt20 df ac">
        <!-- 核数 -->
        <div class="col1 mr20">
          <el-select
            v-model="condition.vcpus"
            class="select-opts"
            :placeholder="t('ins.setConfig.cpuPh')"
            @change="getChangeTypeSupportSpecifications"
          >
            <el-option v-for="item in INS_CPU_MAP" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
        <!-- 内存 -->
        <div class="col2 mr20">
          <el-select
            v-model="condition.ram"
            class="select-opts"
            :placeholder="t('ins.setConfig.ramPh')"
            @change="getChangeTypeSupportSpecifications"
          >
            <el-option v-for="item in INS_RAM_MAP" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </div>
        <!-- 机型 -->
        <div class="col3">
          <el-select
            v-model="condition.instanceFamilyId"
            class="select-opts"
            :placeholder="t('ins.setConfig.insTypePh')"
            @change="getChangeTypeSupportSpecifications"
          >
            <el-option v-for="item in insFamilyList" :key="item.id" :value="item.id" :label="item.familyName" />
          </el-select>
        </div>
        <!-- 仅显示支持的机型 -->
        <!-- <div class="col4">
        <el-checkbox value="1"> 仅显示支持的机型 </el-checkbox>
      </div> -->
      </div>

      <el-table v-loading="loading" :data="list" class="mt20 table" max-height="260px">
        <!-- 机型 -->
        <el-table-column min-width="200" :label="t('ins.setConfig.insType')">
          <template #default="{ row }">
            <el-radio v-model="checkedInstanceTypeId" :label="row.id" @change="() => changeInstanceType(row)">
              <div class="text-over">
                {{ row.typeName || '-' }}
              </div>
            </el-radio>
          </template>
        </el-table-column>
        <!-- 规格 -->
        <el-table-column min-width="200" :label="t('ins.setConfig.specificate')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.specificationName }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- vCPU -->
        <el-table-column min-width="200" :label="t('vCPU')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ t('ins.setConfig.cores', [row.vcpus]) }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 内存 -->
        <el-table-column min-width="200" :label="t('ins.setConfig.ram')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.ram }}GB</span>
            </div>
          </template>
        </el-table-column>
        <!-- CPU -->
        <el-table-column min-width="280" :label="t('CPU')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ row.cpuName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 内网带宽 -->
        <el-table-column min-width="200" :label="t('ins.setConfig.privateBandwidth')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ row.internalNetworkBandwidth || 0 }}Gbit/s</span>
            </div>
          </template>
        </el-table-column>
        <!-- 网络收发包 -->
        <el-table-column min-width="240" :label="t('ins.setConfig.networkReceiveSend')">
          <template #default="{ row }">
            <div class="df ac">
              <span>{{ t('ins.custom.ppsUnit', [row.maxPps]) }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <CatPagination
        v-model:pagination="paginationConfig.pagination"
        :total="paginationConfig.total"
        :custom-keys="['page', 'pageSize']"
        @change="paginationChange"
      />

      <!-- 配置费用 -->
      <div class="mb20 price df ac">
        <div class="df ac mr20">
          <span class="key mr4">{{ t('ins.setConfig.configMoney') }} </span>
          <el-tooltip :content="t('ins.setConfig.configMoneyTooltip')" placement="top" effect="light">
            <SvgIcon name="question" />
          </el-tooltip>
        </div>
        <span class="text-warning">{{ configPrice }} </span>
      </div>

      <!-- 同意强制关机 -->
      <div v-if="type === 'RUNNING'">
        <el-checkbox :model-value="checked">
          <span class="text-error">{{ t('ins.setConfig.shutdownChecked') }}</span>
        </el-checkbox>
      </div>

      <div class="cat-dialog-footer">
        <el-button type="primary" @click="nextHandleA">
          <slot name="confirm">
            {{ t('ins.setConfig.next') }}
          </slot>
        </el-button>
        <el-button plain class="cancel" @click="cancel">
          {{ t('ins.setConfig.cancelText') }}
        </el-button>
      </div>
    </div>
    <!-- 第二步 -->
    <div v-show="step.active === 'b'" class="b-wrap">
      <Tip :text="tipsB" type="OneToMany" />
      <Collapse v-model="isCollapse" :text="t('ins.setConfig.selectIns', [insList.length])">
        <el-table :data="insList" class="mt20 table">
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.idName')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.insUuid }}
              </div>
              <div>{{ row.instanceName }}</div>
            </template>
          </el-table-column>
          <!-- 当前配置 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.curConfig')">
            <template #default="{ row }">
              <div style="padding: 14px 0">
                <p>{{ row.specificationInfo?.specificationName }}</p>
                <p>
                  ({{ row.specificationInfo?.typeName }}，{{ t('ins.setConfig.cores', [row.specificationInfo?.vcpus])
                  }}{{ row.specificationInfo?.ram }}GB）
                </p>
              </div>
            </template>
          </el-table-column>
          <!-- 目标配置 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.targetConfig')">
            <template #default>
              <div style="padding: 14px 0">
                <p>{{ checkedInstanceType?.specificationName }}</p>
                <p>
                  ({{ checkedInstanceType?.typeName }}，{{ t('ins.setConfig.cores', [checkedInstanceType?.vcpus])
                  }}{{ checkedInstanceType?.ram }}GB）
                </p>
              </div>
            </template>
          </el-table-column>
          <!-- 计费时长 -->
          <el-table-column min-width="220" :label="t('ins.setConfig.billDuration')" show-overflow-tooltip>
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('ins.setConfig.billDuration') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ t('ins.setConfig.expiredDesc', [maoYunDayJs(row.expiresTime).format(FORMAT_TIME)]) }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 费用 -->
          <el-table-column min-width="200" :label="t('ins.setConfig.cost')">
            <template #default>
              <div class="text-warning">
                {{ t('ins.setConfig.refund', [refundPrice]) }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </Collapse>

      <!-- 需支付费用合计 -->
      <div class="mt20 price df ac">
        <div class="df ac mr20">
          <span class="key mr4">{{ t('ins.setConfig.costSum') }} </span>
        </div>
        <span class="text-warning">{{ payPrice }}</span>
      </div>

      <div class="cat-dialog-footer">
        <el-button plain class="cancel" @click="prevHandleB">
          {{ t('ins.expans.pre') }}
        </el-button>
        <el-button type="primary" :loading="comfirmLoading" @click="confirmHandle">
          <slot name="confirm">
            {{ t('ins.setConfig.confirmText') }}
          </slot>
        </el-button>
        <el-button plain class="cancel" @click="cancel">
          {{ t('ins.setConfig.cancelText') }}
        </el-button>
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { COST_TYPE_MAP, isTimeCost } from '@/views/cvm/ins/config'
import { INS_CPU_MAP, INS_RAM_MAP } from '@/views/cvm/ins/config'
import { _getInstanceFamily, _getChangeTypeSupportSpecifications, _changeServerTypeInquiry } from '@/apis/cvm/ins'
import { useCvmStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const dialogMap = {
  [ja]: '1040px',
  [en]: '980px',
  [zh]: '980px',
}

const dialogClass = useI18nStyle(dialogMap)

interface PropType {
  insList: any[]
  type: 'STOPPED' | 'RUNNING'
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
  type: 'STOPPED',
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { changeServerType, loading: comfirmLoading } = useIns()

const step = ref({
  active: 'a',
})
const upgrade = ref<boolean>(false) // 是否升配
const upgradeMonth = ref<number>(0) // 调整配置时长
const insFamilyList = ref<any[]>([]) // 机型族集合
const show = ref<boolean>(false) // 弹窗显示
const loading = ref<boolean>(false)
const list = ref<any[]>([]) // 配置列表
const isCollapse = ref<boolean>(false) // 是否收起
const checkedInstanceTypeId = ref<number>(0) // 规格配置
const checked = ref<boolean>(true)
const price = ref<number>(0) // 配置费用
const condition = reactive<{
  [x: string]: any
}>({
  vcpus: '', // cpu
  ram: '', // 内存
  instanceFamilyId: '', // 机型族
}) // 查询条件
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

// 实例计费类型
const instanceChargeType = computed(() => {
  return props.insList[0]?.instanceChargeType
})

// 配置费用
const configPrice = computed(() => {
  // 包年包月
  if (isTimeCost(instanceChargeType.value)) {
    if (!price.value) {
      return `$0 USD`
    } else {
      return upgrade.value ? `$${price.value} USD` : `-$${price.value} USD`
    }
  } else {
    // 包年包月
    return `$${price.value} USD`
  }
})

// 支付费用
const payPrice = computed(() => {
  // 包年包月
  if (isTimeCost(instanceChargeType.value)) {
    if (!price.value) {
      return `$0 USD`
    } else {
      return upgrade.value ? `$${price.value} USD` : `$0 USD`
    }
  } else {
    // 包年包月
    return `$0 USD`
  }
})

// 退还费用
const refundPrice = computed(() => {
  // 包年包月
  if (isTimeCost(instanceChargeType.value)) {
    if (!price.value) {
      return `$0 USD`
    } else {
      return upgrade.value ? `$0 USD` : `$${price.value} USD`
    }
  } else {
    // 包年包月
    return `$0 USD`
  }
})

// 目标规格配置
const checkedInstanceType = computed(() => {
  return list.value?.find(el => el.id === checkedInstanceTypeId.value) || {}
})

const runningTipsA = computed(() => [
  {
    main: t('ins.setConfig.tipsMain'),
    sub: [t('ins.setConfig.tipsSub1'), t('ins.setConfig.tipsSub2'), t('ins.setConfig.tipsSub3')],
  },
])

const stopedTipsA = computed(() => [
  {
    main: t('ins.setConfig.tipsMainStoped'),
  },
])

const tipsB = computed(() => [
  {
    main: t('ins.setConfig.tipsMainB'),
    sub: [t('ins.setConfig.tipsSub1B'), t('ins.setConfig.tipsSub2B'), t('ins.setConfig.tipsSub3B')],
  },
])

const nextHandleA = () => {
  if (!checkedInstanceTypeId.value) {
    return message.warning(t('ins.setConfig.checkedInstanceTypeWarning'))
  }
  step.value.active = 'b'
}

const prevHandleB = () => {
  step.value.active = 'a'
}

// 分页
const paginationChange = () => {
  getChangeTypeSupportSpecifications()
}

const confirmHandle = () => {
  changeServerTypeFn()
}

// 弹窗打开
const open = () => {
  getInstanceFamily()
  getChangeTypeSupportSpecifications()
}

// 弹窗关闭
const cancel = () => {
  show.value = false
  step.value.active = 'a'
  isCollapse.value = false

  condition.vcpus = ''
  condition.ram = ''
  condition.instanceFamilyId = ''
  price.value = 0
  upgrade.value = false

  paginationConfig.pagination = {
    pageSize: 10,
    page: 1,
  }
  paginationConfig.total = 0
}

// 切换规格
const changeInstanceType = (row: any) => {
  // 包年包月
  if (isTimeCost(instanceChargeType.value)) {
    changeServerTypeInquiry()
  } else {
    // 按量计费
    price.value = row.usageDiscountPrice
  }
}

// 购买实例-自定义配置-获取机型族
const getInstanceFamily = async () => {
  try {
    const res = await _getInstanceFamily({
      regionId: cvmStore.areaSelect.id,
      zoneId: props.insList[0]?.zoneId,
    })

    console.log(`_getInstanceFamily===>`, res)

    if (res.success) {
      insFamilyList.value = res.data || []
    }
  } catch (error) {
    console.log(error)
  }
}

// 切换服务器规格-获取可切换规格配置
const getChangeTypeSupportSpecifications = async () => {
  loading.value = true
  checkedInstanceTypeId.value = 0
  try {
    const res = await _getChangeTypeSupportSpecifications({
      instanceFamilyId: condition.instanceFamilyId,
      vcpus: condition.vcpus,
      ram: condition.ram,
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      instanceId: props.insList[0]?.id,
    })

    console.log(`_getChangeTypeSupportSpecifications===>`, res)

    if (res.success) {
      list.value = res.data?.list || []

      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 切换服务器规格=>升配/降配
const changeServerTypeFn = () => {
  // 切换服务器规格参数
  let changeServerTypeReqParams: any = {
    serverId: props.insList[0]?.id,
    instanceTypeId: checkedInstanceTypeId.value,
  }

  if (props.type === 'RUNNING') {
    changeServerTypeReqParams.isAutoStop = checked.value
  }

  // 创建预退款订单
  if (!upgrade.value) {
    changeServerTypeReqParams.createPreRefundOrder = true
  }

  // 包年包月
  if (props.insList[0].instanceChargeType === 2) {
    changeServerType(true, changeServerTypeReqParams, upgrade.value)
  } else {
    // 按量计费
    const cb = () => {
      show.value = false
      emits('success')
    }
    changeServerType(false, changeServerTypeReqParams, upgrade.value, cb)
  }
}

// 包年包月的实例询价
const changeServerTypeInquiry = async () => {
  try {
    const serverId = props.insList[0].id
    const res = await _changeServerTypeInquiry({
      instanceTypeId: checkedInstanceTypeId.value,
      serverId, // 服务器ID
    })

    console.log(`_changeServerTypeInquiry===>`, res)

    if (res.success) {
      upgrade.value = res.data.upgrade
      // 是否增配
      price.value = res.data.upgrade ? res.data.discountAmount || 0 : res.data.refundMoney || 0
      upgradeMonth.value = res.data.upgradeMonth
    } else {
      upgrade.value = false
      price.value = 0
      upgradeMonth.value = 0
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.price {
  .key {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #999;
  }
}
</style>
