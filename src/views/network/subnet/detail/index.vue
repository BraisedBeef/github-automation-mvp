<template>
  <div>
    <PageHeader :title="state.uuid" :back-title="t('subnet.subnet')">
      <template #right>
        <div />
      </template>
    </PageHeader>
    <div class="df jsb ac tabs-wrap">
      <!-- tabs -->
      <div class="df">
        <CatTabs v-model="pageActive" class="tabs" :tabs="pageTabs" />
      </div>
    </div>

    <div style="padding: 20px">
      <el-card v-loading="state.loading" shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('subnet.basicInfo') }}
        </div>
        <table class="detail-wrap w-full">
          <tbody>
            <tr>
              <td :class="nameInputRef?.show ? 'va-inherit pr20' : 'pr20'">
                <!-- 名称 -->
                <div class="item" :class="nameInputRef?.show ? 'mb45' : 'mb20'">
                  <div class="name h21">
                    {{ t('subnet.subnetName') }}
                  </div>
                </div>
              </td>
              <td class="w-50 min-w-596 pr20">
                <div class="item" :class="nameInputRef?.show ? 'mb13 mt-negative-7' : 'mb20'">
                  <div class="value">
                    <EditInput
                      ref="nameInputRef"
                      v-model="state.subnetName"
                      v-loading="state.subnetNameLoading"
                      :rules="nameRules"
                      :cancel-fn="cancelSubName"
                      input-style="max-width: 380px;width: 380px"
                      :max-length="60"
                      @confirm="updateSubName"
                    />
                    <p v-show="nameInputRef?.show" class="tips">
                      {{ t('privateNetwork.nameRule') }}
                    </p>
                  </div>
                </div>
              </td>
              <td :class="nameInputRef?.show ? 'va-inherit pr20' : 'pr20'">
                <!-- 地域 -->
                <div class="item" :class="nameInputRef?.show ? 'mb45' : 'mb20'">
                  <div class="name">
                    {{ t('subnet.area') }}
                  </div>
                </div>
              </td>
              <td :class="nameInputRef?.show ? 'va-inherit pr20' : 'pr20'">
                <div class="item" :class="nameInputRef?.show ? 'mb45' : 'mb20'">
                  <div class="value">
                    {{ state.detail.regionName }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- ID -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('subnet.subnetId') }}
                  </div>
                </div>
              </td>
              <td class="w-50 pr20">
                <div class="item mb20">
                  <div class="value">
                    <Copy :text="state.detail.subnetUuid" />
                  </div>
                </div>
              </td>
              <td class="pr20">
                <!-- 可用区 -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('subnet.usableArea') }}
                  </div>
                </div>
              </td>
              <td class="w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ state.detail.zoneName }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- CIDR -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('subnet.subnetCidr') }}
                  </div>
                </div>
              </td>
              <td class="w-50 pr20">
                <div class="item mb20">
                  <div class="value">
                    {{ state.detail.cidr }}
                  </div>
                </div>
              </td>
              <td class="pr20">
                <!-- 默认子网 -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('subnet.defaultSubnet') }}
                  </div>
                </div>
              </td>
              <td class="w-50">
                <div class="item mb20">
                  <div class="value">
                    {{ IS_DEFAULT_LIST.find(item => item.value === state.detail.defaultSubnet)?.label }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 所属网络 -->
                <div class="item">
                  <div class="name">
                    {{ t('subnet.belongingNetwork') }}
                  </div>
                </div>
              </td>
              <td class="w-50 pr20">
                <div class="item">
                  <div class="value text-primary cursor-pointer">
                    <Copy
                      :text="state.detail.vpcName"
                      @handle-click="goPrivateNetword(state.detail.vpcId, state.detail.vpcUuid)"
                    />
                  </div>
                </div>
              </td>
              <td class="pr20">
                <!-- 创建时间 -->
                <div class="item">
                  <div class="name df ac">
                    <span class="mr10">{{ t('subnet.createTime') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" />
                    </el-tooltip>
                  </div>
                </div>
              </td>
              <td class="w-50">
                <div class="item">
                  <div class="value">
                    {{ state.detail.createTime ? maoYunDayJs(state.detail.createTime).format(FORMAT_TIME) : '-' }}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </el-card>
    </div>

    <div style="padding: 0 20px 20px">
      <el-card v-loading="state.loading" shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="tit mb20">
          {{ t('subnet.includeResources') }}
        </div>
        <el-row class="detail-wrap w-full" :gutter="20">
          <el-col :span="8">
            <div class="item">
              <div class="key-wrap mb12">
                <span>{{ t('subnet.basicCloudResources') }}</span>
              </div>
              <div class="value-wrap">
                {{ t('subnet.not') }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="item">
              <div class="key-wrap mb12">
                <span>{{ t('subnet.networkResource') }}</span>
              </div>
              <div class="value-wrap df ac jsb">
                <span>{{ t('subnet.elasticNetworkCard') }}</span>
                <span>{{ state.detail.eniNum }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="item">
              <div class="key-wrap mb12">
                <span>{{ t('subnet.networkConnections') }}</span>
              </div>
              <div class="value-wrap">
                {{ t('subnet.not') }}
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { useBaseStore, useTempStore } from '@/store'
import { getQuerySubnetDetail, getUpdateSubnetName } from '@/apis/network/subnet'
import { IS_DEFAULT_LIST } from '../list/config'
import { message } from '@/utils/message'
import dayjs from 'dayjs'
import { nameRules } from '@/views/network/private-network/list/config'
import { pushRoute } from '@/utils/router-jump'

const route = useRoute()
const router = useRouter()

const bodyStyle = { height: '100%' }

const pageTabs = [{ label: t('subnet.basicInfo'), value: 1 }]
const pageActive = ref<number>(1)

const state = reactive<{
  id: number
  uuid: string
  loading: boolean
  subnetName: string
  subnetNameLoading: boolean
  detail: any
}>({
  id: 0,
  uuid: '',
  loading: false,
  subnetName: '',
  subnetNameLoading: false,
  detail: {},
})

const nameInputRef = ref<any>(null)

// 获取子网详情
const getDetail = async () => {
  if (!state.id) return
  const params = { subnetId: state.id }
  state.loading = true
  try {
    const res = await getQuerySubnetDetail(params)
    state.loading = false
    if (res.success) {
      state.detail = res.data
      state.subnetName = res.data?.subnetName || ''
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

// 跳转私有网络
const goPrivateNetword = (id: number, uuid: string) => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id, uuid },
  })
}

// 更新子网名称
const updateSubName = async () => {
  const params = {
    subnetId: state.id,
    subnetName: state.subnetName,
  }
  state.subnetNameLoading = true
  try {
    const res = await getUpdateSubnetName(params)
    state.subnetNameLoading = false
    if (res.success) {
      nameInputRef.value.show = false
      getDetail()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.subnetNameLoading = false
    console.log('error', err)
  }
}

// 取消更新子网名称
const cancelSubName = () => {
  state.subnetName = state.detail.subnetName
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  if (route.query?.id) {
    state.id = Number(route.query.id)
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

  // font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #000;
}

.detail-wrap {
  /* margin-top: 40px; */

  /* margin-bottom: 40px; */

  .item {
    .key-wrap {
      min-width: 125px;
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

    .h21 {
      height: 21px;
      line-height: 21px;
    }
  }

  .mt-negative-7 {
    margin-top: -7px;
  }

  .mb13 {
    margin-bottom: 13px;
  }

  .mb12 {
    margin-bottom: 12px;
  }

  .mb19 {
    margin-bottom: 19px;
  }

  .mb12 {
    margin-bottom: 12px;
  }

  .pr20 {
    padding-right: 20px;
  }

  .w-50 {
    width: 50%;
  }

  .min-w-596 {
    min-width: 596px;
  }

  .va-inherit {
    vertical-align: inherit;
  }

  .mb45 {
    margin-bottom: 45px;
  }
}

:deep(.el-form-item__error) {
  min-width: 330px;
}
</style>
