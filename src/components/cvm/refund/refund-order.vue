<template>
  <div class="page">
    <div class="title mb20">
      {{ t('refund.refundTitle') }}
    </div>

    <!-- tip -->
    <Tip :text="tips" type="OneToOne" theme="danger" />

    <div v-loading="listLoading" class="df jsb">
      <!-- lt -->
      <div class="list-wrap lt">
        <Title :text="t('refund.refundOrder')" style="margin-top: 40px; margin-bottom: 24px" />
        <!-- 云服务器CVM -->
        <template v-if="cvm.show">
          <div v-for="(item, index) in cvm.list" :key="index" class="mb40">
            <p class="desc df ac jsb">
              <span>{{ t('refund.cvmTitle') }}</span>
              <span class="text-error">${{ item.refundAmount }} USD</span>
            </p>
            <el-row :gutter="20" class="info">
              <el-col :span="24" class="mb20">
                <span class="tit">{{ t('refund.base') }}</span>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.resourceID') }}
                  </div>
                  <div class="value">
                    {{ item.insUuid }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyRightClass">
                    {{ t('refund.orderType') }}
                  </div>
                  <div class="value">
                    {{ t('refund.returnGoods') }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.region') }}
                  </div>
                  <div class="value">
                    {{ item.regionName }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyRightClass">
                    {{ t('refund.originaPay') }}
                  </div>
                  <div class="value">
                    {{ COST_TYPE_MAP[2] }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.zone') }}
                  </div>
                  <div class="value">
                    {{ item.zoneName }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyRightClass">
                    {{ t('refund.buyNum') }}
                  </div>
                  <div class="value">
                    {{ 1 }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.insType') }}
                  </div>
                  <div class="value">
                    {{ item.specificationName }}
                  </div>
                </div> </el-col
              ><el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyRightClass">
                    {{ t('refund.createTime') }}
                  </div>
                  <div class="value">
                    {{ item.createTime }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.image') }}
                  </div>
                  <div class="value">
                    {{ item.imageName }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyRightClass">
                    {{ t('refund.usedTime') }}
                  </div>
                  <div class="value">
                    {{ item.usedTime }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.storage') }}
                  </div>
                  <div class="value">
                    {{ t('refund.sysDisk', [item.systemDiskTypeName]) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cvmKeyRightClass">
                    {{ t('refund.refundPrice') }}
                  </div>
                  <div class="value">
                    {{ t('refund.refundAccount', [userStore.user.id])
                    }}<span class="text-warning ml4">${{ item.refundAmount }} USD</span>
                  </div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.bandwidth') }}
                  </div>
                  <div class="value">
                    {{ handleRowBandwidth(item) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.insName') }}
                  </div>
                  <div class="value">
                    {{ item.instanceName }}
                  </div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.belongNet') }}
                  </div>
                  <div class="value">
                    {{ handleRowVpc(item) }}
                  </div>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="item df">
                  <div class="key" :style="cvmKeyClass">
                    {{ t('refund.subnet') }}
                  </div>
                  <div class="value">
                    {{ handleRowSubnet(item) }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
        <!-- 云硬盘CBS -->
        <template v-if="disk.show">
          <div v-for="(item, index) in disk.list" :key="index" class="mb40">
            <p class="desc df ac jsb">
              <span>{{ t('refund.diskTitle') }}</span>
              <span class="text-error">${{ item.refundMoney }} USD</span>
            </p>
            <el-row :gutter="20" class="info">
              <el-col :span="24" class="mb20">
                <span class="tit">{{ t('refund.base') }}</span>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsKeyClass">
                    {{ t('refund.resourceID') }}
                  </div>
                  <div class="value">
                    {{ item.diskInsId }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsRightKeyClass">
                    {{ t('refund.orderType') }}
                  </div>
                  <div class="value">
                    {{ t('refund.returnGoods') }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsKeyClass">
                    {{ t('refund.diskType') }}
                  </div>
                  <div class="value">
                    {{ t('refund.diskType') }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsRightKeyClass">
                    {{ t('refund.originaPay') }}
                  </div>
                  <div class="value">
                    {{ COST_TYPE_MAP[item.costType] }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsKeyClass">
                    {{ t('refund.diskSize') }}
                  </div>
                  <div class="value">{{ item.size }}GB</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsRightKeyClass">
                    {{ t('refund.buyNum') }}
                  </div>
                  <div class="value">
                    {{ item.count }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsKeyClass">
                    {{ t('refund.diskTypeName') }}
                  </div>
                  <div class="value">
                    {{ item.diskTypeName }}
                  </div>
                </div> </el-col
              ><el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsRightKeyClass">
                    {{ t('refund.createTime') }}
                  </div>
                  <div class="value">
                    {{ item.createTime }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsKeyClass">
                    {{ t('refund.diskName') }}
                  </div>
                  <div class="value">
                    {{ item.diskName }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsRightKeyClass">
                    {{ t('refund.usedTime') }}
                  </div>
                  <div class="value">
                    {{ item.usedTime }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsKeyClass">
                    {{ t('refund.zone') }}
                  </div>
                  <div class="value">
                    {{ item.zoneName }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="cbsRightKeyClass">
                    {{ t('refund.refundPrice') }}
                  </div>
                  <div class="value">
                    {{ t('refund.refundAccount', [userStore.user.id])
                    }}<span class="text-warning ml4">${{ item.refundMoney }} USD</span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
        <!-- 弹性公网IP -->
        <template v-if="eip.show">
          <div v-for="(item, index) in eip.list" :key="index">
            <p class="desc df ac jsb">
              <span>{{ t('refund.eipTitle') }}</span>
              <span class="text-error">${{ item.refundMoney }} USD</span>
            </p>
            <el-row :gutter="20" class="info">
              <el-col :span="24" class="mb20">
                <span class="tit">{{ t('refund.base') }}</span>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyClass">
                    {{ t('refund.resourceID') }}
                  </div>
                  <div class="value">
                    {{ item.eipUuid }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyRightClass">
                    {{ t('refund.orderType') }}
                  </div>
                  <div class="value">
                    {{ t('refund.returnGoods') }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyClass">
                    {{ t('refund.region') }}
                  </div>
                  <div class="value">
                    {{ item.regionName }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyRightClass">
                    {{ t('refund.originaPay') }}
                  </div>
                  <div class="value">
                    {{ COST_TYPE_MAP[item.costType] }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyClass">
                    {{ t('refund.costType') }}
                  </div>
                  <div class="value">
                    {{ COST_TYPE_MAP[item.costType] }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyRightClass">
                    {{ t('refund.buyNum') }}
                  </div>
                  <div class="value">
                    {{ item.num }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyClass">
                    {{ t('refund.bandwidthLimit') }}
                  </div>
                  <div class="value">
                    {{ item.maxBandwidth }}
                  </div>
                </div> </el-col
              ><el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyRightClass">
                    {{ t('refund.createTime') }}
                  </div>
                  <div class="value">
                    {{ item.createTime }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyClass">
                    {{ t('refund.durate') }}
                  </div>
                  <div class="value">
                    {{ item.duration ? `${item.duration}个月` : '' }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyRightClass">
                    {{ t('refund.usedTime') }}
                  </div>
                  <div class="value">
                    {{ item.useTime }}
                  </div>
                </div>
              </el-col>
              <el-col :span="12" />
              <el-col :span="12">
                <div class="item df">
                  <div class="key" :style="eipKeyRightClass">
                    {{ t('refund.refundPrice') }}
                  </div>
                  <div class="value">
                    {{ t('refund.refundAccount', [userStore.user.id])
                    }}<span class="text-warning ml4">${{ item.refundMoney }} USD</span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </div>
      <!-- rt -->
      <div class="detail-wrap rt">
        <Title :text="t('refund.info')" style="margin-top: 40px; margin-bottom: 24px" />

        <div v-for="(item, index) in refundInfoList" :key="index" class="item df ac jsb mb10">
          <div class="key w190">{{ t('refund.resourceID') }} {{ item.resourceID }}</div>
          <div class="value">${{ item.refundPrice }} USD</div>
        </div>

        <div class="line" />

        <div class="price df ac jsb mb20">
          <div class="key">
            {{ t('refund.price') }}
          </div>
          <div class="value text-error">${{ refundAllPrice }} USD</div>
        </div>
        <el-button class="w-full" :loading="loading" type="primary" @click="submit">
          {{ t('refund.comfirm') }}
        </el-button>
      </div>
    </div>

    <!-- 确认退款 -->
    <ConfirmRefund ref="confirmRefundRef" :refund-price="refundAllPrice" @refund="refund" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import ConfirmRefund from './confirm-refund.vue'
import Title from './title.vue'
import { useRefund } from '@/views/cvm/hooks/use-refund'
import { useCvmStore, useNetworkStore, useUserStore } from '@/store'
import { COST_TYPE_MAP, INS_NETWORK_CHANGE_TYPE_MAP } from '@/views/cvm/ins/config'
import NP from 'number-precision'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const eipKeyMap = {
  [ja]: { width: '80px' },
  [en]: { width: '130px' },
  [zh]: { width: '60px' },
}
const eipKeyRightMap = {
  [ja]: { width: '100px' },
  [en]: { width: '180px' },
  [zh]: { width: '112px' },
}
const cvmKeyMap = {
  [ja]: { width: '130px' },
  [en]: { width: '130px' },
  [zh]: { width: '70px' },
}
const cvmKeyRightMap = {
  [ja]: { width: '100px' },
  [en]: { width: '150px' },
  [zh]: { width: '112px' },
}
const cbsKeyMap = {
  [ja]: { width: '210px' },
  [en]: { width: '180px' },
  [zh]: { width: '112px' },
}
const cbsRightKeyMap = {
  [ja]: { width: '100px' },
  [en]: { width: '180px' },
  [zh]: { width: '112px' },
}

const eipKeyClass = useI18nStyle(eipKeyMap)
const eipKeyRightClass = useI18nStyle(eipKeyRightMap)
const cvmKeyClass = useI18nStyle(cvmKeyMap)
const cvmKeyRightClass = useI18nStyle(cvmKeyRightMap)
const cbsKeyClass = useI18nStyle(cbsKeyMap)
const cbsRightKeyClass = useI18nStyle(cbsRightKeyMap)

/**
 * @desc 实例/硬盘/eip的退款
 */

NP.enableBoundaryChecking(false)

interface PropType {
  loading?: boolean
  product: string
  inquiryReqParams: any
}

const props = withDefaults(defineProps<PropType>(), {
  loading: false,
  product: '',
  inquiryReqParams: {},
})
const emits = defineEmits<{
  (event: 'refund'): void
}>()

const userStore = useUserStore()
const cvmStore = useCvmStore()
const networkStore = useNetworkStore()
const { refundInstanceInquiry, loading: listLoading } = useRefund()

const refundList = ref<any>([]) // 询价
const confirmRefundRef = ref<InstanceType<typeof ConfirmRefund>>()

const tips = computed(() => [
  {
    main: t('refund.tipsMain'),
  },
])

const cvm = computed(() => {
  const show = refundList.value.refundInstanceInquiry ? true : false
  const list = show ? [refundList.value.refundInstanceInquiry] : []
  return {
    show,
    list,
  }
})

const disk = computed(() => {
  return {
    show: refundList.value.refundDiskInquiry ? true : false,
    list: refundList.value.refundDiskInquiry || [],
  }
})

const eip = computed(() => {
  return {
    show: refundList.value.refundEipInquiry ? true : false,
    list: refundList.value.refundEipInquiry || [],
  }
})

// 退款信息
const refundInfoList = computed(() => {
  const cvmRefundInfo = cvm.value.list.map(el => ({
    resourceID: el.insUuid,
    refundPrice: el.refundAmount,
  }))

  const diskRefundInfo = disk.value.list.map(el => ({
    resourceID: el.diskInsId,
    refundPrice: el.refundMoney,
  }))

  const eipRefundInfo = eip.value.list.map(el => ({
    resourceID: el.eipUuid,
    refundPrice: el.refundMoney,
  }))

  return [...cvmRefundInfo, ...diskRefundInfo, ...eipRefundInfo]
})

// 退款金额
const refundAllPrice = computed(() => {
  const totalPrice = refundInfoList.value.reduce((accumulator, item) => {
    return NP.plus(accumulator, item.refundPrice)
  }, 0)
  return totalPrice
})

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

const submit = () => {
  changeShow(confirmRefundRef.value)
}

const handleRowBandwidth = (row: any) => {
  console.log(`handleRowBandwidth===>`, row)
  const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡

  return t('refund.bandwidthDesc', [INS_NETWORK_CHANGE_TYPE_MAP[res.networkChangeType], res.mainPublicBandwidth])
}

const handleRowVpc = (row: any) => {
  console.log(`handleRowVpc===>`, row)
  const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡

  return res.vpcName
}

const handleRowSubnet = (row: any) => {
  console.log(`handleRowSubnet===>`, row)
  const res = row.networkInfos?.find(el => el.primaryType === 1) // 主网卡

  return res.subNetworkName
}

// 退款询价 (此处弹性公网ip - 包年包月退订共用，operate判断一下)
const refundInstanceInquiryFn = async () => {
  const params =
    props.product === 'eip' ? networkStore.refundOrder.inquiryReqParams : cvmStore.refundOrder.inquiryReqParams
  const cb = res => {
    if (res.success) {
      refundList.value = res.data
    }
  }
  refundInstanceInquiry(params, cb)
}

// 退款
const refund = () => {
  emits('refund')
}

onMounted(() => {
  refundInstanceInquiryFn()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: calc(100vh - 40px - 40px);
  padding: 40px 120px;
  background: #fff;

  .title {
    margin-bottom: 25px;
    font-family: PingFangSC, 'PingFang SC';

    // font-weight: 500;
    font-size: 26px;
    color: #000;
  }

  .tit-wrap {
    .reat {
      width: 3px;
      height: 16px;
      margin-right: 10px;
      background: #0063ff;
    }

    .text {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #000;
    }
  }

  .lt {
    flex: 1;
    margin-right: 40px;
  }

  .rt {
    width: 300px;
  }

  .list-wrap {
    .desc {
      margin-bottom: 15px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      color: #000;
    }

    .info {
      box-sizing: border-box;
      padding: 20px 20px 40px;

      /* height: 240px; */
      background: #f9fafc;

      .tit {
        font-family: PingFangSC, 'PingFang SC';

        // font-weight: 500;
        font-size: 14px;
        color: #000;
      }

      .item {
        margin-bottom: 10px;

        .key {
          flex-shrink: 0;

          // width: 140px;
          margin-right: 20px;
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: #999;
        }

        .value {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          color: #000;
        }
      }
    }
  }

  .detail-wrap {
    .item {
      .key {
        width: 140px;
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #999;
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        color: #000;
      }
    }

    .line {
      height: 1px;
      margin-top: 10px;
      margin-bottom: 20px;
      background-color: #eee;
    }

    .price {
      .key {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        color: #000;
      }

      .value {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 24px;
      }
    }
  }
}

.mb40 {
  margin-bottom: 40px;
}

.w190 {
  width: 190px !important;
}
</style>
