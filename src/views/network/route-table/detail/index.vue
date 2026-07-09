<template>
  <div>
    <PageHeader :title="state.uuid" :back-title="t('routeTable.routeTable')">
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
          {{ t('routeTable.basicInfo') }}
        </div>
        <table>
          <tbody>
            <tr>
              <td class="pr20">
                <!-- 路由表ID -->
                <div class="item" :class="nameInputRef?.show ? 'mb13' : 'mb20'">
                  <div class="name lh21">
                    {{ t('routeTable.routeTableId') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item" :class="nameInputRef?.show ? 'mb13' : 'mb20'">
                  <div class="value">
                    <Copy :text="state.detail.rbUuid" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20 va-inherit">
                <!-- 路由表名称 -->
                <div class="item" :class="nameInputRef?.show ? 'mb38' : 'mb20'">
                  <div class="name lh21">
                    {{ t('routeTable.routeTableName') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item" :class="nameInputRef?.show ? 'mb13' : 'mb20'">
                  <div class="value">
                    <EditInput
                      ref="nameInputRef"
                      v-model="state.rbName"
                      v-loading="state.rbNameLoading"
                      :rules="nameRules"
                      :cancel-fn="cancelRbName"
                      input-style="max-width: 380px;width: 380px"
                      :max-length="60"
                      @confirm="updateRbName"
                    />
                    <p v-show="nameInputRef?.show" class="tips">
                      {{ t('privateNetwork.nameRule') }}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 所属网络 -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('routeTable.belongingNetwork') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <div class="value">
                    <span class="text-primary cursor-pointer">
                      <Copy
                        :text="state.detail.vpcUuid"
                        style="display: inline-block"
                        @handle-click="goVpc(state.detail.vpcId, state.detail.vpcUuid)"
                      />
                    </span>
                    <span>（<Copy :text="state.detail.vpcName" style="display: inline-block" />）</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 地域 -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('routeTable.area') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <div class="value">
                    {{ state.detail.regionName }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 路由表类型 -->
                <div class="item mb20">
                  <div class="name">
                    {{ t('routeTable.routeTableType') }}
                  </div>
                </div>
              </td>
              <td>
                <div class="item mb20">
                  <div class="value">
                    {{ typeList.find(item => item.value === state.detail.type)?.label }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class="pr20">
                <!-- 创建时间 -->
                <div class="item">
                  <div class="name df ac">
                    <span class="mr10">{{ t('routeTable.createTime') }}</span>
                    <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-help" />
                    </el-tooltip>
                  </div>
                </div>
              </td>
              <td>
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
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { useBaseStore, useTempStore } from '@/store'
import { getQueryRouteTableDetail, getUpdateRouteTableName } from '@/apis/network/route-table'
import { typeList } from '../list/config'
import { message } from '@/utils/message'
import dayjs from 'dayjs'
import { nameRules } from '@/views/network/private-network/list/config'
import { pushRoute } from '@/utils/router-jump'

const route = useRoute()
const router = useRouter()

const bodyStyle = { height: '100%' }

const pageTabs = [{ label: t('routeTable.basicInfo'), value: 1 }]
const pageActive = ref<number>(1)

const state = reactive<{
  id: number
  uuid: string
  loading: boolean
  rbName: string
  rbNameLoading: boolean
  detail: any
}>({
  id: 0,
  uuid: '',
  loading: false,
  rbName: '',
  rbNameLoading: false,
  detail: {},
})

const nameInputRef = ref<any>(null)

// 获取详情
const getDetail = async () => {
  const params = { rbId: state.id }
  state.loading = true
  try {
    const res = await getQueryRouteTableDetail(params)
    state.loading = false
    if (res.success) {
      state.detail = res.data
      state.rbName = res.data?.rbName
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  }
}

// 修改名称
const updateRbName = async () => {
  const params = { id: state.id, name: state.rbName }
  state.rbNameLoading = true
  try {
    const res = await getUpdateRouteTableName(params)
    state.rbNameLoading = false
    if (res.success) {
      nameInputRef.value.show = false
      getDetail()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.rbNameLoading = false
    console.log('error', err)
  }
}

// 取消修改名称
const cancelRbName = () => {
  state.rbName = state.detail.rbName
}

// 跳转vpc详情
const goVpc = (id, uuid) => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id, uuid },
  })
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  if (route.query.id) {
    state.id = Number(route.query.id) || 0
    getDetail()
  }
  console.log(route)

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

.item {
  .key-wrap {
    width: 125px;
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
}

.mt-negative-6 {
  margin-top: -6.5px;
}

.mb12 {
  margin-bottom: 12px;
}

.mb13 {
  margin-bottom: 13px;
}

.mb19 {
  margin-bottom: 19px;
}

.h20 {
  height: 20px;
}

.h21 {
  height: 21px;
  line-height: 21px;
}

.mb38 {
  margin-bottom: 38px;
}

.pr20 {
  padding-right: 20px;
}

.va-inherit {
  vertical-align: inherit;
}

:deep(.el-form-item__error) {
  min-width: 330px;
}
</style>
