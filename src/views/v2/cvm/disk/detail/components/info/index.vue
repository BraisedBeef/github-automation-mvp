<template>
  <section v-loading="loading" class="cvm-disk-detail-info-v2__card">
    <h3 class="cvm-disk-detail-info-v2__title">
      {{ t('disk.info.diskInfo') }}
    </h3>

    <div class="cvm-disk-detail-info-v2__grid">
      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.resourceID') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.diskId || '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.diskName') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
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
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.region') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.regionName || '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.zone') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.zoneName || '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.state') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ DISK_STATE_MAP[detail.state] || '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.project') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.projectName || '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.diskType') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.diskType || '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.diskAttr') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ DISK_TYPE_MAP[detail.type] || '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.size') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          <span>{{ detail.size || 0 }}GiB</span>
          <button
            v-if="checkPermission(permMap.disk.RESET_HD_SIZE)"
            class="cvm-disk-detail-info-v2__link"
            type="button"
            @click="changeShow(expansRef)"
          >
            {{ t('disk.info.expans') }}
          </button>
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.montedIns') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          <template v-if="detail.insUuid">
            <span class="cvm-disk-detail-info-v2__text-primary">{{ detail.insUuid }}</span>
            <span>({{ detail.instanceName || t('disk.info.noNameIns') }})</span>
            <button
              v-if="isUninstall(detail.type, detail.state)"
              class="cvm-disk-detail-info-v2__link"
              type="button"
              @click="handleUninstall"
            >
              {{ t('disk.list.uninstall') }}
            </button>
          </template>
          <span v-else>{{ t('disk.info.no') }}</span>
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.insRelease') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.followVmRelease == 1 ? t('disk.info.insReleaseClose') : t('disk.info.insReleaseOpen') }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.uninstallAble') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ isUninstall(detail.type, detail.state) ? t('disk.info.yes') : t('disk.info.no') }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.costType') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          <span>{{ COST_TYPE_MAP[detail.costType] || '-' }}</span>
          <button
            v-if="
              checkPermission(permMap.disk.SET_HD_AUTO_RENEW) &&
              isSetAutoRenew(detail.type, detail.costType, detail.state)
            "
            class="cvm-disk-detail-info-v2__link"
            type="button"
            @click="autoRenew"
          >
            {{ t('disk.info.autoRenew') }}
          </button>
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label cvm-disk-detail-info-v2__label--tip">
          <span>{{ t('disk.list.expiredTime') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" class="cvm-disk-detail-info-v2__help" />
          </el-tooltip>
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.expiredTime ? maoYunDayJs(detail.expiredTime).format(FORMAT_TIME) : '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label cvm-disk-detail-info-v2__label--tip">
          <span>{{ t('disk.info.createTime') }}</span>
          <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
            <SvgIcon name="cat-cdn-help" class="cvm-disk-detail-info-v2__help" />
          </el-tooltip>
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
        </div>
      </div>

      <div class="cvm-disk-detail-info-v2__field">
        <div class="cvm-disk-detail-info-v2__label">
          {{ t('disk.info.diskSnapshot') }}
        </div>
        <div class="cvm-disk-detail-info-v2__value">
          <template v-if="detail.snapshotCount">
            {{ t('disk.info.number', [detail.snapshotCount]) || t('disk.info.noHave') }}
          </template>
          <template v-else>
            <span>{{ t('disk.info.noHave') }}</span>
            <button
              v-if="
                checkPermissionSnapshot(permMap.snapshot.CREATE_HD_SNAPSHOT) &&
                isCreateSnapshot(detail.type, detail.state)
              "
              class="cvm-disk-detail-info-v2__link"
              type="button"
              @click="changeShow(createSnapshotRef)"
            >
              {{ t('disk.info.createSnapshot') }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <CreateSnapshot ref="createSnapshotRef" :disk="detail" @success="getDetail" />
    <Expans ref="expansRef" :disk="detail" @success="getDetail" />
    <SetAutoRenew ref="setAutoRenewRef" :disk="detail" @success="getDetail" />
    <CancelAutoRenew ref="cancelAutoRenewRef" :disk="detail" @success="getDetail" />
    <Uninstall ref="uninstallRef" :disk-list="[detail]" @success="getDetail" />
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import CreateSnapshot from '@/views/cvm/disk/list/components/create-snapshot.vue'
import { _updateDisk } from '@/apis/cvm/disk'
import { DISK_STATE_MAP, DISK_TYPE_MAP, isUninstall, isSetAutoRenew, isCreateSnapshot } from '@/views/cvm/disk/config'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import Expans from '@/views/cvm/disk/list/components/expans.vue'
import SetAutoRenew from '@/views/cvm/disk/list/components/set-auto-renew.vue'
import CancelAutoRenew from '@/views/cvm/disk/list/components/cancel-auto-renew.vue'
import Uninstall from '@/views/cvm/disk/list/components/uninstall.vue'
import { message } from '@/utils/message'
import { nameRules } from '@/views/network/private-network/list/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import EditInput from '@/components/cvm/edit-input/index.vue'

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

const diskName = ref('')
const editInputRef = ref<any>(null)
const expansRef = ref<InstanceType<typeof Expans>>()
const setAutoRenewRef = ref<InstanceType<typeof SetAutoRenew>>()
const cancelAutoRenewRef = ref<InstanceType<typeof CancelAutoRenew>>()
const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>()
const uninstallRef = ref<InstanceType<typeof Uninstall>>()

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.disk,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const permConfigSnapshot = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission: checkPermissionSnapshot } = useCvmAndNetworkPermission(permConfigSnapshot)

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const autoRenew = () => {
  changeShow(props.detail.renewFlag === 1 ? cancelAutoRenewRef.value : setAutoRenewRef.value)
}

const handleUninstall = () => {
  changeShow(uninstallRef.value)
}

const getDetail = () => {
  emits('success')
}

const cancelDiskName = () => {
  diskName.value = props.detail.diskName
}

const changeDiskName = (value: string) => {
  updateDisk({
    diskName: value,
    id: props.detail.id as number,
  })
}

const updateDisk = async (params: any) => {
  try {
    const res = await _updateDisk(params)
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

<style scoped lang="scss">
.cvm-disk-detail-info-v2__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-disk-detail-info-v2__title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #191c23;
}

.cvm-disk-detail-info-v2__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 88px;
}

.cvm-disk-detail-info-v2__field {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
}

.cvm-disk-detail-info-v2__label {
  flex: 0 0 122px;
  font-size: 14px;
  line-height: 22px;
  color: #8b95a7;
  white-space: nowrap;
}

.cvm-disk-detail-info-v2__label--tip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-disk-detail-info-v2__value {
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

.cvm-disk-detail-info-v2__value--inline {
  gap: 10px;
}

.cvm-disk-detail-info-v2__help {
  width: 16px;
  height: 16px;
  color: #8b95a7;
}

.cvm-disk-detail-info-v2__link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cvm-disk-detail-info-v2__text-primary {
  color: #06f;
}
</style>
