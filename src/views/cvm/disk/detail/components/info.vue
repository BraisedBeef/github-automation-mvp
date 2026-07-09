<template>
  <el-card v-loading="loading" shadow="never" class="page-box mb20" :body-style="bodyStyle">
    <div class="tit mb20">
      {{ t('disk.info.diskInfo') }}
    </div>
    <div class="detail-wrap w-full mb20">
      <ItemList>
        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 资源ID -->
              <div class="item" :class="editInputRef?.show ? 'mb44' : 'mb20'">
                <div class="key-wrap">
                  {{ t('disk.info.resourceID') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item" :class="editInputRef?.show ? 'mb44' : 'mb20'">
                <div class="value">
                  {{ detail.diskId || '-' }}
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 云硬盘名称 -->
              <div class="item" :class="editInputRef?.show ? 'mb44' : 'mb20'">
                <div class="key-wrap">
                  {{ t('disk.info.diskName') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item" :class="editInputRef?.show ? 'mb13 mt-negative-6' : 'mb20'">
                <div class="value diskName">
                  <EditInput
                    ref="editInputRef"
                    :show-edit-icon="checkPermission(permMap.disk.RENAME_HD) as boolean"
                    :rules="nameRules"
                    :model-value="diskName"
                    :cancel-fn="cancelDiskName"
                    input-style="max-width: 380px;width: 380px"
                    :max-length="60"
                    @confirm="changeDiskName"
                  />
                  <p v-show="editInputRef?.show" class="tips">
                    {{ t('privateNetwork.nameRule') }}
                  </p>
                </div>
              </div>
            </template>
          </Item>
        </div>

        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 地域 -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.region') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ detail.regionName || '-' }}
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 可用区 -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.zone') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ detail.zoneName || '-' }}
                </div>
              </div>
            </template>
          </Item>
        </div>

        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 状态-->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.state') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ DISK_STATE_MAP[detail.state] || '-' }}
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 所属项目-->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.project') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ '-' }}
                </div>
              </div>
            </template>
          </Item>
        </div>

        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 硬盘类型-->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.diskType') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ detail.diskType || '-' }}
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 硬盘属性-->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.diskAttr') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ DISK_TYPE_MAP[detail.type] || '-' }}
                </div>
              </div>
            </template>
          </Item>
        </div>

        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 云硬盘容量 -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.size') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  <span> {{ detail.size || 0 }}GiB</span>
                  <span
                    v-if="checkPermission(permMap.disk.RESET_HD_SIZE)"
                    class="text-primary ml20 cursor-pointer"
                    @click="changeShow(expansRef)"
                    >{{ t('disk.info.expans') }}</span
                  >
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 已挂载实例 -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.montedIns') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value df ac">
                  <template v-if="detail.insUuid">
                    <span class="text-primary">{{ detail.insUuid }}</span>
                    <span>（{{ detail.instanceName || t('disk.info.noNameIns') }}）</span>
                    <DisableText
                      class="ml20"
                      :disabled="!isUninstall(detail.type, detail.state)"
                      :text="t('disk.list.uninstall')"
                      disabled-type="hidden"
                      @click="handleUninstall"
                    />
                  </template>
                  <span v-else>
                    {{ t('disk.info.no') }}
                  </span>
                </div>
              </div>
            </template>
          </Item>
        </div>

        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 是否随实例释放 -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.insRelease') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ detail.followVmRelease == 1 ? t('disk.info.insReleaseClose') : t('disk.info.insReleaseOpen') }}
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 是否可卸载 -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.uninstallAble') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  {{ isUninstall(detail.type, detail.state) ? t('disk.info.yes') : t('disk.info.no') }}
                </div>
              </div>
            </template>
          </Item>
        </div>

        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 计费模式  -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.costType') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value df ac">
                  <span>{{ COST_TYPE_MAP[detail.costType] || '-' }}</span>
                  <DisableText
                    v-if="checkPermissionSnapshot(permMap.disk.SET_HD_AUTO_RENEW)"
                    class="ml20"
                    :disabled="!isSetAutoRenew(detail.type, detail.costType, detail.state)"
                    :text="t('disk.info.autoRenew')"
                    disabled-type="hidden"
                    @click="autoRenew"
                  />
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 到期时间  -->
              <div class="item">
                <div class="key-wrap df ac">
                  <span>{{ t('disk.list.expiredTime') }}</span
                  ><el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" class="ml10" />
                  </el-tooltip>
                </div>
              </div>
            </template>
            <template #value>
              <div class="item">
                <div class="value">
                  {{ detail.expiredTime ? maoYunDayJs(detail.expiredTime).format(FORMAT_TIME) : '-' }}
                </div>
              </div>
            </template>
          </Item>
        </div>

        <div class="df">
          <Item style="width: 50%">
            <template #key>
              <!-- 创建时间  -->
              <div class="item">
                <div class="key-wrap df ac">
                  <span>
                    {{ t('disk.info.createTime') }}
                  </span>
                  <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                    <SvgIcon name="cat-cdn-help" class="ml10" />
                  </el-tooltip>
                </div>
              </div>
            </template>
            <template #value>
              <div class="item">
                <div class="value">
                  {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
                </div>
              </div>
            </template>
          </Item>
          <Item style="width: 50%">
            <template #key>
              <!-- 本硬盘快照  -->
              <div class="item mb20">
                <div class="key-wrap">
                  {{ t('disk.info.diskSnapshot') }}
                </div>
              </div>
            </template>
            <template #value>
              <div class="item mb20">
                <div class="value">
                  <span v-if="detail.snapshotCount">{{
                    t('disk.info.number', [detail.snapshotCount]) || t('disk.info.noHave')
                  }}</span>
                  <template v-else>
                    <span>{{ t('disk.info.noHave') }}</span>
                    <span
                      v-if="
                        checkPermissionSnapshot(permMap.snapshot.CREATE_HD_SNAPSHOT) &&
                        isCreateSnapshot(detail.type, detail.state)
                      "
                      class="text-primary ml20 cursor-pointer"
                      @click="changeShow(createSnapshotRef)"
                      >{{ t('disk.info.createSnapshot') }}</span
                    >
                  </template>
                </div>
              </div>
            </template>
          </Item>
        </div>
      </ItemList>
    </div>

    <!-- 创建快照 -->
    <CreateSnapshot ref="createSnapshotRef" :disk="detail" @success="getDetail" />
    <!-- 云硬盘扩容 -->
    <Expans ref="expansRef" :disk="detail" @success="getDetail" />
    <!-- 自动续费 -->
    <SetAutoRenew ref="setAutoRenewRef" :disk="detail" @success="getDetail" />
    <!-- 取消自动续费 -->
    <CancelAutoRenew ref="cancelAutoRenewRef" :disk="detail" @success="getDetail" />
    <!-- 卸载 -->
    <Uninstall ref="uninstallRef" :disk-list="[detail]" @success="getDetail" />
  </el-card>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import CreateSnapshot from '../../list/components/create-snapshot.vue'
import { _updateDisk } from '@/apis/cvm/disk'
import { DISK_STATE_MAP, DISK_TYPE_MAP, isUninstall, isSetAutoRenew, isCreateSnapshot } from '@/views/cvm/disk/config'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import Expans from '../../list/components/expans.vue'
import SetAutoRenew from '../../list/components/set-auto-renew.vue'
import CancelAutoRenew from '../../list/components/cancel-auto-renew.vue'
import Uninstall from '../../list/components/uninstall.vue'
import { message } from '@/utils/message'
import { nameRules } from '@/views/network/private-network/list/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
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

const bodyStyle = { height: '100%' }

const diskName = ref<string>('') // 硬盘名称
const editInputRef = ref<any>(null)
const expansRef = ref<InstanceType<typeof Expans>>() // 云硬盘扩容
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>() // 自动续费
const cancelAutoRenewRef = ref<InstanceType<typeof CancelAutoRenew>>() // 取消自动续费
const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>() // 创建快照
const uninstallRef = ref<InstanceType<typeof Uninstall>>() // 卸载

const cvmStore = useCvmStore()
// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.disk,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)
// 厂商权限配置
const permConfigSnapshot = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission: checkPermissionSnapshot } = useCvmAndNetworkPermission(permConfigSnapshot)

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 自动续费
const autoRenew = () => {
  changeShow(props.detail.renewFlag === 1 ? cancelAutoRenewRef.value : setAutoRenewRef.value)
}

// 卸载
const handleUninstall = () => {
  changeShow(uninstallRef.value)
}

const getDetail = () => {
  emits('success')
}

// 取消修改名称
const cancelDiskName = () => {
  diskName.value = props.detail.diskName
}
// 输入硬盘名称
const changeDiskName = (value: string) => {
  const params = {
    diskName: value,
    id: props.detail.id as number,
  }
  updateDisk(params)
}

// 修改硬盘名称
const updateDisk = async (params: any) => {
  try {
    const res = await _updateDisk(params)

    console.log(`_updateDisk===>`, res)

    if (res.success) {
      message.success(res.msg)
      if (editInputRef.value) {
        editInputRef.value.show = false
      }
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  }
}

watch(
  () => props.detail,
  () => {
    diskName.value = props.detail.diskName
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss" scoped>
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
  .list-left {
    margin-right: 20px;
  }

  .list-right {
    // placeholder
  }

  .item {
    .key-wrap {
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

    .diskName {
      :deep(.el-form-item__error) {
        width: 400px;
      }
    }
  }
}

.edit-userName-input {
  max-width: 180px;
  height: 34px;
}

.mb13 {
  margin-bottom: 13px;
}

.mt-negative-6 {
  margin-top: -6.5px;
}

.pr20 {
  padding-right: 20px;
}

.w-50 {
  width: 50%;
}

.mb44 {
  margin-bottom: 44px;
}
</style>
