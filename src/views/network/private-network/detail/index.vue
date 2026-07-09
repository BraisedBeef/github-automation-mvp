<template>
  <div>
    <PageHeader :title="state.uuid" :back-title="t('privateNetwork.privateNetwork')">
      <template #right>
        <div />
      </template>
    </PageHeader>
    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="pageActive" class="tabs" :tabs="pageTabs" @change="() => {}" />
      </div>
    </div>

    <div style="padding: 20px">
      <el-card v-loading="state.loading" shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('privateNetwork.basicInfo') }}
        </div>
        <div class="detail-wrap w-full df">
          <div class="detail-warp_left">
            <div class="item mb20">
              <div class="name lh21">
                {{ 'ID' }}
              </div>
            </div>
            <div class="item" :class="nameInputRef?.show ? 'mb46' : 'mb20'">
              <div class="name lh21">
                {{ t('privateNetwork.name') }}
              </div>
            </div>
            <div class="item mb20">
              <div class="name">
                {{ 'IPv4 CIDR' }}
              </div>
            </div>
            <div class="item" :class="dnsInputRef?.show ? 'mb13' : ''">
              <div class="name">
                {{ 'DNS' }}
              </div>
            </div>
          </div>
          <div class="detail-warp_right">
            <div class="item mb20">
              <div class="value">
                <Copy :text="state.detail.vpcUuid" />
              </div>
            </div>
            <div class="item" :class="nameInputRef?.show ? 'mb13' : 'mb19'">
              <div :class="nameInputRef?.show ? 'value mt-negative-6' : 'value'">
                <EditInput
                  ref="nameInputRef"
                  v-model="state.vpcName"
                  v-loading="state.vpcNameLoading"
                  :cancel-fn="cancelVpcName"
                  :rules="nameRules"
                  :confirm-text="t('general.confirm')"
                  input-style="max-width: 380px;width: 380px"
                  :max-length="60"
                  @confirm="updateVpcName"
                />
                <p v-show="nameInputRef?.show" class="tips">
                  {{ t('privateNetwork.nameRule') }}
                </p>
              </div>
            </div>
            <div class="item mb20">
              <div class="value">{{ state.detail.cidrBlock }} {{ `(${t('privateNetwork.host')})` }}</div>
            </div>

            <div class="item df" :class="dnsInputRef?.show ? 'mb13' : ''">
              <div :class="dnsInputRef?.show ? 'value mt-negative-6' : 'value'">
                <!-- DNS编辑没有接口  暂时不处理 -->
                <!-- <EditInput
                  ref="dnsInputRef"
                  v-model="state.dnsServerSet"
                  v-loading="state.dnsServerSetLoading"
                  :maxLength="999"
                  @update:modelValue="updateDnsServerSet"
                />
                <p class="tips" v-show="dnsInputRef?.show">{{ t('privateNetwork.dnsTip') }}</p> -->
                <div class="value">
                  {{ state.dnsServerSet }}
                </div>
              </div>
            </div>
            <!-- Domain Name  接口没有此字段  暂时不处理-->
            <!-- <div class="item df" :class="domainInputRef?.show ? '-mb7' : ''">
              <div class="key-wrap">
                {{ 'Domain Name' }}
              </div>
              <div :class="domainInputRef?.show ? 'value mt-negative-6' : 'value'">
                <EditInput ref="domainInputRef" />
                <p class="tips" v-show="domainInputRef?.show">{{ t('privateNetwork.nameRule') }}</p>
              </div>
            </div> -->
          </div>
        </div>
      </el-card>
    </div>

    <div style="padding: 0 20px 20px">
      <el-card v-loading="state.loading" shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('privateNetwork.includeResources') }}
        </div>
        <el-row class="detail-wrap w-full" :gutter="20">
          <el-col :span="8">
            <div class="item mb20">
              <div class="key-wrap mb12">
                <span>{{ t('privateNetwork.networkResource') }}</span>
              </div>
              <div
                class="value-wrap df ac jsb"
                :class="state.detail?.subnetNum > 0 ? 'cursor-pointer' : ''"
                @click="handleClickSubnet"
              >
                <span>{{ t('privateNetwork.subnet') }}</span>
                <span>{{ state.detail.subnetNum }}</span>
              </div>
            </div>
            <div class="item">
              <div class="key-wrap mb12">
                <span>{{ t('privateNetwork.networkConnections') }}</span>
              </div>
              <div class="value-wrap">
                {{ t('privateNetwork.not') }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="item mb20">
              <div class="key-wrap mb12">
                <span>{{ t('privateNetwork.networkResource') }}</span>
              </div>
              <div
                class="value-wrap df ac jsb"
                :class="state.detail?.rbNum > 0 ? 'cursor-pointer' : ''"
                @click="handleClickRoutingTable"
              >
                <span>{{ t('privateNetwork.routingTable') }}</span>
                <span>{{ state.detail.rbNum }}</span>
              </div>
            </div>
            <div class="item">
              <div class="key-wrap mb12">
                <span>{{ t('privateNetwork.basicCloudResources') }}</span>
              </div>
              <div class="value-wrap">
                {{ t('privateNetwork.not') }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="item">
              <div class="key-wrap mb12">
                <span>{{ t('privateNetwork.networkResource') }}</span>
              </div>
              <div
                class="value-wrap df ac jsb"
                :class="state.detail?.eniNum > 0 ? 'cursor-pointer' : ''"
                @click="handleClickEni"
              >
                <span>{{ t('privateNetwork.elasticNetworkCard') }}</span>
                <span>{{ state.detail.eniNum }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore, useTempStore } from '@/store'
import t from '@/utils/i18n'
import { getQueryVpcDetail, getUpdateVpcName } from '@/apis/network/private-network'
import { message } from '@/utils/message'
import { nameRules } from '@/views/network/private-network/list/config'
import { documentUrl } from '@/config/base-config'

const route = useRoute()

const bodyStyle = { height: '100%' }

const pageTabs = [{ label: t('privateNetwork.basicInfo'), value: 1 }]
const pageActive = ref<number>(1)

const state = reactive<{
  id: number
  uuid: string
  loading: boolean
  vpcName: string
  vpcNameLoading: boolean
  dnsServerSet: string
  dnsServerSetLoading: boolean
  domain: string
  detail: any
}>({
  id: 0,
  uuid: '',
  loading: false,
  vpcName: '',
  vpcNameLoading: false,
  dnsServerSet: '',
  dnsServerSetLoading: false,
  domain: '',
  detail: {},
})

const nameInputRef = ref()
const dnsInputRef = ref<any>()
const domainInputRef = ref<any>()

// 获取私有网络详情
const getDetail = async () => {
  if (!state.id) return
  const params = { vpcId: state.id }
  state.loading = true
  try {
    const res = await getQueryVpcDetail(params)
    state.loading = false
    if (res.success) {
      state.detail = res.data
      state.vpcName = res.data.vpcName
      state.dnsServerSet = res.data.dnsServerSet
      // -------- 还缺少Domain Name字段 --------------
    } else {
      message.warning(res.msg)
    }
  } catch (e) {
    state.loading = false
  }
}

// 编辑名称
const updateVpcName = async () => {
  const params = {
    vpcId: state.id,
    vpcName: state.vpcName,
  }
  // 发送修改请求
  state.vpcNameLoading = true
  try {
    const res = await getUpdateVpcName(params)
    state.vpcNameLoading = false
    if (res.success) {
      nameInputRef.value.show = false
      getDetail()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.vpcNameLoading = false
    console.log('error', err)
  }
}
// 取消编辑名称
const cancelVpcName = () => {
  state.vpcName = state.detail.vpcName
}

// 编辑DNS
const updateDnsServerSet = async () => {
  const params = {
    ...state.detail,
    dnsServerSet: state.dnsServerSet,
  }
  // --------------发送修改请求-----------------------
  state.dnsServerSetLoading = true
  console.log('params', params, dnsInputRef.value.show)
  state.dnsServerSetLoading = false
  dnsInputRef.value.show = false
  getDetail()
}

// 点击子网
const handleClickSubnet = () => {
  if (!state.detail?.subnetNum || state.detail?.subnetNum === 0) return
  const origin = window.location.origin
  window.open(origin + `/network/subnet/list?vpcUuid=${state.detail.vpcUuid}`, '_blank')
}

// 点击路由表
const handleClickRoutingTable = () => {
  if (!state.detail?.rbNum || state.detail?.rbNum === 0) return
  const origin = window.location.origin
  window.open(origin + `/network/route-table/list?vpcUuid=${state.detail.vpcUuid}`, '_blank')
}

// 点击弹性网卡
const handleClickEni = () => {
  if (!state.detail?.eniNum || state.detail?.eniNum === 0) return
  const origin = window.location.origin
  window.open(origin + `/network/network-card/list?vpcUuid=${state.detail.vpcUuid}`, '_blank')
}

onMounted(async () => {
  console.log(route.query, 'route.query')

  useTempStore().setPageHeader(false)
  if (route.query.id) {
    state.id = Number(route.query.id) || 0
    getDetail()
  }
  state.uuid = (route.query.uuid || '') as string
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.tabs-wrap {
  /* margin-left: -20px; */

  /* width: calc(100% + 40px); */

  /* margin-top: -20px; */
  box-sizing: border-box;
  background: #fff;

  :deep(.cat-tabs__header) {
    /* padding-left: 8px; */
    border-color: transparent;
  }
}

.tit {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 16px;

  // ---------- bug  YFW-54  修改 -----------
  // // font-weight: 500;
  font-weight: 600;
  line-height: 22px;
  color: #000;
}

.detail-wrap {
  /* margin-top: 40px; */
  margin-bottom: 14px;

  .detail-warp_left {
    margin-right: 20px;
  }

  .item {
    .key-wrap {
      min-width: 125px; // 解决多语言时换行的问题
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
    }

    .name {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #999;
      white-space: nowrap;
    }

    .lh21 {
      line-height: 21px;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
      overflow-wrap: break-word; /* 在必要时单词内部断行 */
      overflow-wrap: anywhere;
      white-space: normal; /* 允许换行 */
    }

    .value-wrap {
      height: 40px;
      padding: 0 16px;
      font-family: PingFangSC, 'PingFang SC';

      // font-weight: 500;
      font-size: 16px;
      line-height: 40px;
      color: #000;
      background: #f1f7ff;
    }
  }

  .tips {
    margin-top: 10px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 17px;
    color: #999;
    text-align: left;
  }

  .mt-negative-6 {
    margin-top: -6.5px;
  }

  .mb13 {
    margin-bottom: 13px;
  }

  .-mb7 {
    margin-bottom: -7px;
  }

  .mb12 {
    margin-bottom: 12px;
  }

  .mb46 {
    margin-bottom: 46px;
  }

  .mb19 {
    margin-bottom: 19px;
  }
}
</style>
