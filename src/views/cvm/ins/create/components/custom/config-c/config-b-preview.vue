<template>
  <div class="border-wrap mb20">
    <p class="df ac jsb top mb20">
      <span class="title">{{ t('ins.custom.netSecurityGroup') }}</span>
      <span class="text-primary cursor-pointer" @click="store.setStep('b')">{{ t('ins.custom.edit') }}</span>
    </p>

    <el-row :gutter="20" class="bottom">
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.belongNet') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ net }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.publicIP') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ publicIp }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.securityGroup') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <template v-if="securityGroup.type === 2 && securityGroup.arr.length > 1">
                    <span class="value">{{ t('ins.custom.number', [securityGroup.arr.length]) }}</span>
                    <el-popover placement="top" :width="200" trigger="hover">
                      <template #reference>
                        <span class="value ml20 pointer">{{ t('ins.custom.seeDetail') }}</span>
                      </template>
                      <template #default>
                        <p v-for="(item, index) in securityGroup.arr" :key="index" class="item">
                          {{ item }}
                        </p>
                      </template>
                    </el-popover>
                  </template>
                  <template v-if="securityGroup.type === 2 && securityGroup.arr.length === 1">
                    <span class="value">{{ securityGroup.arr[0] }}</span>
                  </template>
                  <template v-if="securityGroup.type === 1">
                    <span class="value">{{ t('ins.custom.customTemplate') }}</span>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-col>
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.subNet') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ subNet }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.bandwidthCostType') }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <div class="item mb20">
                  <span class="value">{{ chargeType }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-col>
      <el-col :span="8">
        <table class="list-table">
          <tbody>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.privateIp') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <span class="value">{{ t('ins.custom.undistributed') }}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <div class="item mb20">
                  <div class="key">
                    {{ t('ins.custom.lineType') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <span class="value">{{ lineType }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { lineTypeList } from '@/views/network/public-ip/list/components/set-buy/config'
import { PUBLIC_IP_CONFIG_LIST } from '@/views/cvm/ins/config'
import { getQueryVpcPage } from '@/apis/network/private-network'
import { getQuerySubnetPage } from '@/apis/network/subnet'
import { getListSecurityGroup } from '@/apis/network/security-group'
import { useCvmStore } from '@/store'

const { cvmInsCreateStore: store } = useIns()
const cvmStore = useCvmStore()

const securityGroupList = ref<any[]>([]) // 安全组集合

// 公网IP
const publicIp = computed(() => {
  return store.publicIpConfig?.checked ? t('ins.custom.buy') : t('ins.custom.noBuy')
})

// 安全组
const securityGroup = computed(() => {
  const type = store.securityGroupConfig?.cur
  let arr: any[] = []

  if (store.securityGroupConfig?.cur === 2) {
    const checked = store.securityGroupConfig?.already?.checked

    arr = checked.map(el => {
      const res = securityGroupList.value?.find(item => item.id === el)
      return res?.name
    })
  }

  return {
    type,
    arr,
  }
})

// 所属网络
const net = computed(() => {
  const vpcRes = store.netConfig?.vpcList?.find(el => el.id === store.netConfig?.vpcCur)
  return vpcRes ? vpcRes?.vpcName : '-'
})

// 所在子网
const subNet = computed(() => {
  const subnetRes = store.netConfig?.subnetList?.find(el => el.id === store.netConfig?.subnetCur)
  return subnetRes ? subnetRes?.subnetName : '-'
})

// 带宽计费模式
const chargeType = computed(() => {
  const checked = store.publicIpConfig?.checked
  const size = store.publicIpConfig?.size
  const publicIpChargeTypeRes = PUBLIC_IP_CONFIG_LIST?.find(el => el.value === store.publicIpConfig?.chargeTypeCur)

  const showEipBandwidth = cvmStore.areaSelect.showEipBandwidth

  if (checked) {
    if (showEipBandwidth) {
      return `${publicIpChargeTypeRes?.label}|${size}Mbps`
    } else {
      return `${publicIpChargeTypeRes?.label}`
    }
  } else {
    return '-'
  }
})

// 线路类型
const lineType = computed(() => {
  if (store.publicIpConfig.checked) {
    const lineTypeRes = lineTypeList.find(el => el.value === store.publicIpConfig.lineTypeCur)
    return lineTypeRes ? lineTypeRes?.label : '-'
  } else {
    return '-'
  }
})

// 查询VPC列表
const getQueryVpcPageFn = async () => {
  try {
    const res = await getQueryVpcPage({
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    })

    console.log(`getQueryVpcPage===>`, res)

    if (res.success) {
      store.netConfig.vpcList = res.data.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

// 查询子网列表
const getQuerySubnetPageFn = async () => {
  try {
    const params: any = {
      zoneId: store.zoneConfig.cur.id,
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    }

    if (store.netConfig.vpcCur) {
      params.vpcId = store.netConfig.vpcCur
    }

    const res = await getQuerySubnetPage(params)

    console.log(`getQuerySubnetPage===>`, res)

    if (res.success) {
      store.netConfig.subnetList = res.data.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

// 获取安全组列表
const getListSecurityGroupFn = async () => {
  try {
    const res = await getListSecurityGroup({
      regionId: store.region.id,
      pageIndex: 1,
      pageSize: 999,
    })

    console.log(`getListSecurityGroup===>`, res)

    if (res.success) {
      securityGroupList.value = res.data?.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  getQueryVpcPageFn()
  getQuerySubnetPageFn()
  getListSecurityGroupFn()
})
</script>

<style lang="scss" scoped>
.list-left {
  margin-right: 20px;
}

.border-wrap {
  padding: 20px;
  background: #f9fafc;

  .top {
    span {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }

    .title {
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 14px;
      color: #000;
    }
  }

  .bottom {
    .item {
      min-height: 21px;
    }

    .key {
      min-width: 28px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #999;
      white-space: nowrap;
    }

    .value {
      display: inline-block;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #000;
      overflow-wrap: break-word; /* 在必要时单词内部断行 */
      overflow-wrap: anywhere;
      white-space: normal; /* 允许换行 */
    }
  }
}

.pr20 {
  padding-right: 20px;
}

.list-table {
  td {
    vertical-align: top;
  }
}
</style>
