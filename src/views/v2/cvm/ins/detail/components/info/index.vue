<template>
  <div class="cvm-ins-info-v2">
    <el-row v-loading="loading" :gutter="20">
      <el-col :span="16">
        <section class="cvm-ins-info-v2__card">
          <h3 class="cvm-ins-info-v2__title">
            {{ t('ins.info.insInfo') }}
          </h3>
          <div class="cvm-ins-info-v2__grid">
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.insId') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                {{ detail.insUuid || '-' }}
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.insName') }}
              </div>
              <div class="cvm-ins-info-v2__value cvm-ins-info-v2__value--inline">
                <span>{{ detail.instanceName || '_' }}</span>
                <SvgIcon
                  v-if="checkPermission(permMap.ins.RENAME_VM)"
                  name="edit"
                  class="cvm-ins-info-v2__edit"
                  @click="changeShow(setNameRef)"
                />
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.region') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                {{ detail.regionName || '-' }}
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.zone') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                {{ detail.zoneName || '_' }}
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.sys') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                <span>{{ detail.imageInfo?.imageName || '-' }}</span>
                <button
                  v-if="checkPermission(permMap.ins.RESET_VM_SYSTEM) && isSetSystem(detail.state)"
                  class="cvm-ins-info-v2__link"
                  type="button"
                  @click="changeShow(setSystemRef)"
                >
                  {{ t('ins.info.reinstallSys') }}
                </button>
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.insConfig') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                <span>{{ insConfig }}</span>
                <button
                  v-if="checkPermission(permMap.ins.RESET_VM_UNIT) && isSetConfig(detail.state)"
                  class="cvm-ins-info-v2__link"
                  type="button"
                  @click="changeShow(setConfigRef)"
                >
                  {{ t('ins.info.setConfig') }}
                </button>
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.project') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                {{ detail.projectName || '_' }}
              </div>
            </div>
          </div>
        </section>

        <section class="cvm-ins-info-v2__card">
          <h3 class="cvm-ins-info-v2__title">
            {{ t('ins.info.costInfo') }}
          </h3>
          <div class="cvm-ins-info-v2__cost-grid">
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.insCostType') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                {{ COST_TYPE_MAP[detail.instanceChargeType] }}
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label cvm-ins-info-v2__label--tip">
                <span>{{ t('ins.info.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="cvm-ins-info-v2__help" />
                </el-tooltip>
              </div>
              <div class="cvm-ins-info-v2__value">
                {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label">
                {{ t('ins.info.netCostType') }}
              </div>
              <div class="cvm-ins-info-v2__value">
                <span>{{ networkChangeType }}</span>
                <button
                  v-if="checkPermission(permMap.ins.CVM_UPDATE_NETWORK)"
                  class="cvm-ins-info-v2__link"
                  :class="{ 'is-disabled': !isEditNetWork }"
                  type="button"
                  @click="isEditNetWork ? changeShow(setNetworkRef) : undefined"
                >
                  {{ t('ins.info.setNetCostType') }}
                </button>
              </div>
            </div>
            <div class="cvm-ins-info-v2__field">
              <div class="cvm-ins-info-v2__label cvm-ins-info-v2__label--tip">
                <span>{{ t('ins.info.expiredTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="cvm-ins-info-v2__help" />
                </el-tooltip>
              </div>
              <div class="cvm-ins-info-v2__value">
                {{ detail.expiresTime ? maoYunDayJs(detail.expiresTime).format(FORMAT_TIME) : '-' }}
              </div>
            </div>
          </div>
        </section>
      </el-col>

      <el-col :span="8">
        <section class="cvm-ins-info-v2__side">
          <div class="cvm-ins-info-v2__status">
            <div class="cvm-ins-info-v2__status-item">
              <SvgIcon name="rise" class="cvm-ins-info-v2__status-icon" />
              <span class="cvm-ins-info-v2__status-text">
                {{ currentStateText }}
              </span>
            </div>
            <span class="cvm-ins-info-v2__status-divider" />
            <div class="cvm-ins-info-v2__status-item">
              <span class="cvm-ins-info-v2__status-dot" />
              <span class="cvm-ins-info-v2__status-text">
                {{ t('ins.info.monitoring') }}
              </span>
            </div>
          </div>

          <section v-if="diskList.length" class="cvm-ins-info-v2__panel cvm-ins-info-v2__panel--hover">
            <div class="cvm-ins-info-v2__panel-head">
              <h4 class="cvm-ins-info-v2__panel-title">
                {{ t('ins.info.disk') }}
              </h4>
              <button
                v-if="checkPermission(permMap.ins.EXPAND_DISK_SIZE)"
                class="cvm-ins-info-v2__panel-link"
                type="button"
                @click="changeShow(expansRef)"
              >
                {{ t('ins.info.expans') }}
              </button>
            </div>
            <div v-for="(item, index) in diskList" :key="`disk-${index}`" class="cvm-ins-info-v2__panel-row">
              <span class="cvm-ins-info-v2__panel-label">{{ DISK_TYPE_MAP[item.type] }}</span>
              <span class="cvm-ins-info-v2__panel-value cvm-ins-info-v2__panel-value--link">{{ item.diskName }}</span>
              <span class="cvm-ins-info-v2__panel-value">{{ item.size || 0 }}GiB</span>
              <span class="cvm-ins-info-v2__panel-value">{{ item.diskTypeName }}</span>
            </div>
          </section>

          <section v-if="networkList.length" class="cvm-ins-info-v2__panel cvm-ins-info-v2__panel--hover">
            <div class="cvm-ins-info-v2__panel-head">
              <h4 class="cvm-ins-info-v2__panel-title">
                {{ t('ins.info.networkCard') }}
              </h4>
            </div>
            <div v-for="(item, index) in networkList" :key="`network-${index}`" class="cvm-ins-info-v2__panel-row">
              <span class="cvm-ins-info-v2__panel-label">{{ NETWORK_TYPE_MAP[item.primaryType] }}</span>
              <span class="cvm-ins-info-v2__panel-value cvm-ins-info-v2__panel-value--link">{{ item.vpcInsId }}</span>
              <span class="cvm-ins-info-v2__panel-value">{{ item.mainPrivateIp }}</span>
            </div>
          </section>

          <section v-if="ipList.length" class="cvm-ins-info-v2__panel cvm-ins-info-v2__panel--hover">
            <div class="cvm-ins-info-v2__panel-head">
              <h4 class="cvm-ins-info-v2__panel-title">
                {{ t('ins.info.eip') }}
              </h4>
            </div>
            <div v-for="(item, index) in ipList" :key="`ip-${index}`" class="cvm-ins-info-v2__panel-row">
              <span class="cvm-ins-info-v2__panel-value">{{ item.publicIp }}</span>
              <span class="cvm-ins-info-v2__panel-split" />
              <span class="cvm-ins-info-v2__panel-value">{{ item.bandwidth }} Mbit/s</span>
            </div>
          </section>

          <section v-if="securityGroupList.length" class="cvm-ins-info-v2__panel cvm-ins-info-v2__panel--hover">
            <div class="cvm-ins-info-v2__panel-head">
              <h4 class="cvm-ins-info-v2__panel-title">
                {{ t('ins.info.securityGroup') }}
              </h4>
            </div>
            <div
              v-for="(item, index) in securityGroupList"
              :key="`security-${index}`"
              class="cvm-ins-info-v2__panel-row"
            >
              <span class="cvm-ins-info-v2__panel-value">{{ item.groupUuid }}</span>
              <span class="cvm-ins-info-v2__panel-split" />
              <span class="cvm-ins-info-v2__panel-value">{{ item.groupName }}</span>
            </div>
          </section>
        </section>
      </el-col>
    </el-row>

    <!-- 重装系统 -->
    <SetSystem ref="setSystemRef" :ins-list="[detail]" :type="detail.state" @success="getDetail" />
    <!-- 调整配置 -->
    <SetConfig ref="setConfigRef" :ins-list="[detail]" :type="detail.state" @success="getDetail" />
    <!-- 云硬盘扩容 -->
    <Expans ref="expansRef" :ins-list="[detail]" @success="getDetail" />
    <!-- 修改名称 -->
    <SetName ref="setNameRef" :ins-list="[detail]" @success="getDetail" />
    <!-- 调整网络 -->
    <SetNetwork ref="setNetworkRef" :ins-list="[detail]" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import SetSystem from '@/views/cvm/ins/list/components/set-system/index.vue'
import SetConfig from '@/views/cvm/ins/list/components/set-config/index.vue'
import Expans from '@/views/cvm/ins/list/components/expans/index.vue'
import SetName from '@/views/cvm/ins/list/components/set-name/index.vue'
import SetNetwork from '@/views/cvm/ins/list/components/set-network/index.vue'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import {
  INS_NETWORK_CHANGE_TYPE_MAP,
  COST_TYPE_MAP,
  isSetConfig,
  isSetSystem,
  INS_STATE_MAP,
  NETWORK_TYPE_MAP,
} from '@/views/cvm/ins/config'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'

interface PropType {
  detail: any
  loading: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  detail: () => ({}),
  loading: false,
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const setSystemRef = ref<InstanceType<typeof SetSystem>>() // 重装操作系统
const setConfigRef = ref<InstanceType<typeof SetConfig>>() // 调整配置
const expansRef = ref<InstanceType<typeof Expans>>() // 云硬盘扩容
const setNameRef = ref<InstanceType<typeof SetName>>() // 修改名称
const setNetworkRef = ref<InstanceType<typeof SetNetwork>>() // 调整网络

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const insConfig = computed(() => {
  return `${props.detail.specificationInfo?.typeName} ${t('ins.config.cores', [props.detail.specificationInfo?.vcpus])} ${props.detail.specificationInfo?.ram}GB`
})

const currentStateText = computed(() => {
  return INS_STATE_MAP[props.detail.state] || '-'
})

// 网络计费模式
const networkChangeType = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡

  return res ? INS_NETWORK_CHANGE_TYPE_MAP[res.networkChangeType] || '-' : '-'
})

// 硬盘集合
const diskList = computed(() => {
  const diskInfos = props.detail.diskInfos || []
  const sysDisks = diskInfos.filter(el => el.type === 1)
  const dataDisks = diskInfos.filter(el => el.type === 2)
  return [...sysDisks, ...dataDisks]
})

// 网卡
const networkList = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const mainNetworks = networkInfos.filter(el => el.primaryType === 1)
  const subNetworks = networkInfos.filter(el => el.primaryType !== 1)
  return [...mainNetworks, ...subNetworks]
})

// ip
const ipList = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const mainNetwork = networkInfos.find(el => el.primaryType === 1)
  return mainNetwork?.eips || []
})

// 安全组
const securityGroupList = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const mainNetwork = networkInfos.find(el => el.primaryType === 1)
  return mainNetwork?.securityGroups || []
})

// 是否能点击修改计费模式
const isEditNetWork = computed(() => {
  const networkInfos = props.detail.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1) // 主网卡
  return res?.eipBindFlag
})

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const getDetail = () => {
  emits('success')
}
</script>

<style lang="scss" scoped>
.cvm-ins-info-v2__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-info-v2__card + .cvm-ins-info-v2__card {
  margin-top: 20px;
}

.cvm-ins-info-v2__title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cvm-ins-info-v2__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 56px;
}

.cvm-ins-info-v2__cost-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
}

.cvm-ins-info-v2__field {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
}

.cvm-ins-info-v2__label {
  flex: 0 0 96px;
  font-size: 14px;
  line-height: 22px;
  color: #8b95a7;
  white-space: nowrap;
}

.cvm-ins-info-v2__label--tip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-ins-info-v2__value {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-word;
}

.cvm-ins-info-v2__value--inline {
  gap: 8px;
}

.cvm-ins-info-v2__edit,
.cvm-ins-info-v2__help {
  flex-shrink: 0;
}

.cvm-ins-info-v2__edit {
  width: 18px;
  height: 18px;
  color: #191c23;
  cursor: pointer;
}

.cvm-ins-info-v2__help {
  width: 16px;
  height: 16px;
  color: #8b95a7;
}

.cvm-ins-info-v2__link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.cvm-ins-info-v2__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: transparent;
  background: white;
}

.cvm-ins-info-v2__status {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 8px 4px 2px;
  background: transparent;
}

.cvm-ins-info-v2__status-item {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.cvm-ins-info-v2__status-icon {
  width: 20px;
  height: 20px;
  color: #191c23;
}

.cvm-ins-info-v2__status-text {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cvm-ins-info-v2__status-dot {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 50%;
}

.cvm-ins-info-v2__status-divider {
  width: 1px;
  height: 24px;
  background: #d9dde5;
}

.cvm-ins-info-v2__panel {
  position: relative;
  padding: 26px 28px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe7f2;
}

.cvm-ins-info-v2__panel--hover {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::after {
    position: absolute;
    top: 50%;
    right: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    background: url('@/assets/v2/cvm/images/silder-bg.png') no-repeat right center;
    background-size: cover;
    opacity: 0;
    transition: opacity 0.2s ease;
    transform: translateY(-50%);
  }

  &:hover {
    background-color: #f4f9ff;
    border-color: #d8e8ff;
    box-shadow: 0 10px 24px rgb(32 92 178 / 10%);
  }

  &:hover::after {
    opacity: 1;
  }
}

.cvm-ins-info-v2__panel-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cvm-ins-info-v2__panel-title {
  z-index: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.cvm-ins-info-v2__panel-link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cvm-ins-info-v2__panel-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  align-items: center;
  font-size: 12px;
  line-height: 24px;
  color: #191c23;
}

.cvm-ins-info-v2__panel-row + .cvm-ins-info-v2__panel-row {
  margin-top: 10px;
}

.cvm-ins-info-v2__panel-label {
  color: #6b7280;
}

.cvm-ins-info-v2__panel-value {
  color: #191c23;
  word-break: break-word;
}

.cvm-ins-info-v2__panel-value--link {
  color: #06f;
}

.cvm-ins-info-v2__panel-split {
  width: 1px;
  height: 18px;
  background: #d9dde5;
}

@media (width <= 1280px) {
  .cvm-ins-info-v2__card {
    padding: 24px;
  }
}

@media (width <= 768px) {
  .cvm-ins-info-v2__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .cvm-ins-info-v2__field {
    flex-direction: column;
    gap: 8px;
  }

  .cvm-ins-info-v2__label {
    flex-basis: auto;
  }

  .cvm-ins-info-v2__status {
    flex-wrap: wrap;
    padding: 8px 0 2px;
  }

  .cvm-ins-info-v2__panel {
    padding: 20px 16px;
  }
}
</style>
