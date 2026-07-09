<template>
  <el-card v-loading="state.detailLoading" shadow="never" class="page-box" :body-style="bodyStyle">
    <div class="tit" :class="nameInputRef?.show ? 'mb12' : 'mb20'">
      {{ t('networkCard.basicInfo') }}
    </div>
    <table>
      <tbody>
        <tr>
          <td class="pr20 va-inherit">
            <!-- 名称 -->
            <div class="item" :class="nameInputRef?.show ? 'mb32' : 'mb20'">
              <div class="name">
                {{ t('networkCard.name') }}
              </div>
            </div>
          </td>
          <td>
            <div class="item" :class="nameInputRef?.show ? 'mb13' : 'mb20'">
              <div class="value">
                <EditInput
                  ref="nameInputRef"
                  v-model="state.name"
                  v-loading="state.nameLoading"
                  :rules="nameRules"
                  :cancel-fn="cancelName"
                  input-style="max-width: 380px;width: 380px"
                  :max-length="60"
                  @confirm="updateName"
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
            <!-- ID -->
            <div class="item mb20">
              <div class="name">
                {{ 'ID' }}
              </div>
            </div>
          </td>
          <td>
            <div class="item mb20">
              <div class="value">
                <!--  -->
                <Copy :text="state.detail.eniUuid" />
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="pr20">
            <!-- 地域 -->
            <div class="item mb20">
              <div class="name">
                {{ t('networkCard.region') }}
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
            <!-- 可用区 -->
            <div class="item mb20">
              <div class="name">
                {{ t('networkCard.zone') }}
              </div>
            </div>
          </td>
          <td>
            <div class="item mb20">
              <div class="value">
                {{ state.detail.zoneName }}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="pr20">
            <!-- 所属网络 -->
            <div class="item mb20">
              <div class="name">
                {{ t('networkCard.belongingNetwork') }}
              </div>
            </div>
          </td>
          <td>
            <div class="item mb20">
              <div class="value">
                <span class="text-primary cursor-pointer">
                  <Copy :text="state.detail.vpcUuid" style="display: inline-block" @handle-click="goVpc" />
                </span>
                <span>（<Copy :text="state.detail.vpcName" style="display: inline-block" />）</span>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="pr20">
            <!-- 所属子网 -->
            <div class="item mb20">
              <div class="name">
                {{ t('networkCard.belongingSubnet') }}
              </div>
            </div>
          </td>
          <td>
            <div class="item mb20">
              <div class="value">
                <span class="text-primary cursor-pointer">
                  <Copy :text="state.detail.subnetUuid" style="display: inline-block" @handle-click="goSubnet" />
                </span>
                <span>（<Copy :text="state.detail.subnetName" style="display: inline-block" />）</span>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="pr20">
            <!-- 绑定云服务器 -->
            <div class="item mb20">
              <div class="name">
                {{ t('networkCard.bindIns') }}
              </div>
            </div>
          </td>
          <td>
            <div class="item mb20">
              <div class="value">
                <span
                  v-if="!!state.detail.resourceId"
                  class="text-primary cursor-pointer mr20"
                  @click="goExample(state.detail.resourceId, state.detail.resourceUuid, state.detail.resourceName)"
                  >{{ state.detail.resourceName }}</span
                >
                <span
                  v-if="!state.detail.resourceId && checkPermission(permMap.eni.ENI_BIND_INSTANCE)"
                  class="text-primary cursor-pointer"
                  @click="bindFn"
                  >{{ t('networkCard.bind') }}</span
                >
                <el-tooltip
                  v-else-if="state.detail.primaryType === 1 && checkPermission(permMap.eni.ENI_UNBIND_INSTANCE)"
                  effect="light"
                  :content="t('networkCard.mainNetworkCardCannotUnbind')"
                >
                  <span class="disabled-btn">{{ t('networkCard.unbindIns') }}</span>
                </el-tooltip>
                <span v-else>
                  <span
                    v-if="checkPermission(permMap.eni.ENI_UNBIND_INSTANCE) && !!state.detail.resourceId"
                    class="text-primary cursor-pointer"
                    @click="unbindFn"
                    >{{ t('networkCard.unbindIns') }}</span
                  >
                </span>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="pr20">
            <!-- 创建时间 -->
            <div class="item mb20">
              <div class="name df ac">
                <span class="mr10">{{ t('networkCard.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </div>
          </td>
          <td>
            <div class="item mb20">
              <div class="value">
                {{ state.detail.createTime ? maoYunDayJs(state.detail.createTime).format(FORMAT_TIME) : '-' }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- 绑定 -->
    <SetBind ref="setBindRef" @success="getDetail" />
    <!-- 解除绑定 -->
    <SetUnbind ref="setUnbindRef" @success="getDetail" />
  </el-card>
</template>
<script lang="ts" setup>
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import dayjs from 'dayjs'
import { message } from '@/utils/message'
import SetBind from '../../../list/components/set-bind/index.vue'
import SetUnbind from '../../../list/components/set-unbind/index.vue'
import { getEniDetail } from '@/apis/network/network-card'
import { updateEni } from '@/apis/network/network-card'

import { setInitTimeFormat } from '../../config'
import { nameRules } from '@/views/network/private-network/list/config'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'
const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.eni,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

interface PropType {
  eniId: any
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'getDetail', params: any): void
}>()

const router = useRouter()

const bodyStyle = { height: '100%' }

const state = reactive<{
  detail: any
  detailLoading: boolean
  name: string
  nameLoading: boolean
}>({
  detail: {},
  detailLoading: false,
  name: '',
  nameLoading: false,
})

// 获取详情
const getDetail = async () => {
  const params = { eniId: props.eniId }
  state.detailLoading = true
  try {
    const res = await getEniDetail(params)
    state.detailLoading = false
    if (res.success) {
      state.detail = res.data
      state.name = res.data?.name || ''
      emits('getDetail', state.detail)
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.detailLoading = false
    console.log('error', err)
  }
}

const nameInputRef = ref<any>()
// 更新名称
const updateName = async () => {
  const params = {
    eniId: props.eniId,
    eniName: state.name,
  }
  state.nameLoading = true
  try {
    const res = await updateEni(params)
    state.nameLoading = false
    if (res.success) {
      nameInputRef.value.show = false
      getDetail()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.nameLoading = false
    console.log('error', err)
  }
}

// 取消更新名称
const cancelName = () => {
  state.name = state.detail.name
}

const setBindRef = ref<InstanceType<typeof SetBind>>() // 绑定实例
const bindFn = () => {
  ;(setBindRef.value as InstanceType<typeof SetBind>).show = true
  ;(setBindRef.value as InstanceType<typeof SetBind>).eniId = props.eniId
}

const setUnbindRef = ref<InstanceType<typeof SetUnbind>>() // 解除绑定
const unbindFn = () => {
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).show = true
  ;(setUnbindRef.value as InstanceType<typeof SetUnbind>).detail = state.detail
}

// 跳转私有网络
const goVpc = () => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id: state.detail.vpcId, uuid: state.detail.vpcUuid },
  })
}

// 跳转子网
const goSubnet = () => {
  pushRoute({
    name: 'network_security_subnet_detail',
    query: { id: state.detail.subnetId, uuid: state.detail.subnetUuid },
  })
}

// 跳转云服务器详情
const goExample = (id, uuid, name) => {
  pushRoute({
    name: 'ins_detail',
    params: {
      id: uuid,
      uuid,
      name,
    },
  })
}

onMounted(() => {
  getDetail()
})
</script>
<style lang="scss" scoped>
.tit {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 16px;
  line-height: 22px;
  color: #000;
}

.detail-warp_left {
  margin-right: 20px;
}

.detail-warp_right {
  // placeholder
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

.disabled-btn {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #0063ff;
  cursor: not-allowed;
  opacity: 0.5;
}

.mt-negative-6 {
  margin-top: -6px;
}

.mb13 {
  margin-bottom: 10px;
}

.flex1 {
  flex: 1;
}

.ml20 {
  margin-left: 20px;
}

.mx10 {
  margin: 0 10px;
}

.w-100 {
  width: 100%;
}

.mr10 {
  margin-right: 10px;
}

.mr20 {
  margin-right: 20px;
}

.mb17 {
  margin-bottom: 17px;
}

.pr20 {
  padding-right: 20px;
}

.mb32 {
  margin-bottom: 32px;
}

.mb12 {
  margin-bottom: 12px;
}

.va-inherit {
  vertical-align: inherit;
}

:deep(.el-form-item__error) {
  min-width: 330px;
}
</style>
