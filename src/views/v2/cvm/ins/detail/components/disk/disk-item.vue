<template>
  <section class="cvm-ins-disk-item-v2">
    <div class="cvm-ins-disk-item-v2__head">
      <button class="cvm-ins-disk-item-v2__summary" type="button" @click="isShow = !isShow">
        <span class="cvm-ins-disk-item-v2__summary-text">
          {{ disk.diskId }} | {{ disk.diskName }}_{{ DISK_TYPE_MAP[disk.type] }}
        </span>
        <el-icon class="cvm-ins-disk-item-v2__arrow" :class="{ 'is-open': isShow }">
          <CaretRight />
        </el-icon>
      </button>

      <div class="cvm-ins-disk-item-v2__actions">
        <button class="cvm-ins-disk-item-v2__link" type="button" @click="toMonitor(disk.id)">
          {{ t('ins.disk.seeMonitor') }}
        </button>
        <DisableText
          v-if="checkPermission(permMap.ins.CREATE_DISK_SNAPSHOT)"
          :disabled="!isCreateSnapshot(disk.type, disk.state)"
          :text="t('ins.disk.createSnapshot')"
          disabled-type="hidden"
          @click="changeShow(createSnapshotRef)"
        />
        <DisableText
          v-if="checkPermission(permMap.ins.EXPAND_DISK_SIZE)"
          :disabled="!isExpans(disk.state)"
          :text="t('ins.disk.expans')"
          disabled-type="hidden"
          @click="changeShow(expansRef)"
        />
        <DisableText
          v-if="checkPermission(permMap.ins.DETACH_DISK_FROM_VM)"
          :disabled="!isUninstall(disk.type, disk.state)"
          :text="t('ins.disk.uninstall')"
          disabled-type="hidden"
          @click="changeShow(uninstallRef)"
        />
        <DisableText
          v-if="checkPermission(permMap.ins.DESTROY_OR_REFUND_DISK)"
          :disabled="!isDestruction(disk.type, disk.state)"
          :text="t('ins.disk.destruction')"
          disabled-type="hidden"
          @click="changeShow(destructionRef)"
        />
      </div>
    </div>

    <el-collapse-transition>
      <div v-show="isShow" class="cvm-ins-disk-item-v2__body">
        <div class="cvm-ins-disk-item-v2__grid">
          <div class="cvm-ins-disk-item-v2__column">
            <div class="cvm-ins-disk-item-v2__field" :class="{ 'is-editing': editInputRef?.show }">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.name') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                <EditInput
                  ref="editInputRef"
                  :show-edit-icon="checkPermission(permMap.ins.DISK_RENAME) as boolean"
                  :rules="nameRules"
                  :model-value="diskName"
                  :cancel-fn="cancelDiskName"
                  input-style="max-width: 380px;width: 380px"
                  :max-length="60"
                  @confirm="changeDiskName"
                />
              </div>
            </div>

            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.size') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                {{ disk.size || 0 }}
              </div>
            </div>

            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.startDisk') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                {{ disk.type === 1 ? t('ins.disk.yes') : t('ins.disk.no') }}
              </div>
            </div>

            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.region') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                {{ disk.regionName || '-' }}
              </div>
            </div>

            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.costType') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                {{ COST_TYPE_MAP[disk.costType] || '-' }}
              </div>
            </div>
          </div>

          <div class="cvm-ins-disk-item-v2__column">
            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.resourceID') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value cvm-ins-disk-item-v2__value--link">
                {{ disk.diskId || '-' }}
              </div>
            </div>

            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.type') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                {{ disk.diskTypeName || '-' }}
              </div>
            </div>

            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label">
                {{ t('ins.disk.zone') }}
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                {{ disk.zoneName || '-' }}
              </div>
            </div>

            <div class="cvm-ins-disk-item-v2__field">
              <div class="cvm-ins-disk-item-v2__label cvm-ins-disk-item-v2__label--with-tip">
                <span>{{ t('ins.disk.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="cvm-ins-disk-item-v2__tip-icon" />
                </el-tooltip>
              </div>
              <div class="cvm-ins-disk-item-v2__value">
                {{ disk.createTime ? maoYunDayJs(disk.createTime).format(FORMAT_TIME) : '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-collapse-transition>

    <CreateSnapshot ref="createSnapshotRef" :disk="{ ...disk, diskType: disk.diskTypeName }" @success="getDetail" />
    <Expans ref="expansRef" :disk="disk" @success="getDetail" />
    <Uninstall ref="uninstallRef" :disk-list="[disk]" @success="getDetail" />
    <Destruction ref="destructionRef" :disk-list="[disk]" @success="getDetail" />
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { CaretRight } from '@element-plus/icons-vue'
import { DISK_TYPE_MAP, isExpans, isUninstall, isDestruction, isCreateSnapshot } from '@/views/cvm/disk/config'
import Expans from '@/views/cvm/disk/list/components/expans.vue'
import CreateSnapshot from '@/views/cvm/disk/list/components/create-snapshot.vue'
import Uninstall from '@/views/cvm/disk/list/components/uninstall.vue'
import Destruction from '@/views/cvm/disk/list/components/destruction.vue'
import { _updateDisk } from '@/apis/cvm/disk'
import { message } from '@/utils/message'
import { COST_TYPE_MAP } from '@/views/cvm/ins/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { nameRules } from '@/views/network/private-network/list/config'
import { pushRoute } from '@/utils/router-jump'

interface PropType {
  disk: any
}

const props = withDefaults(defineProps<PropType>(), {
  disk: () => ({}),
})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const diskName = ref('')
const editInputRef = ref<any>(null)
const isShow = ref(true)

const expansRef = ref<InstanceType<typeof Expans>>()
const createSnapshotRef = ref<InstanceType<typeof CreateSnapshot>>()
const uninstallRef = ref<InstanceType<typeof Uninstall>>()
const destructionRef = ref<InstanceType<typeof Destruction>>()

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.ins,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const getDetail = () => {
  emits('success')
}

const toMonitor = (id: number) => {
  pushRoute({
    name: 'disk_detail',
    params: {
      id,
    },
    query: {
      active: 5,
    },
  })
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const cancelDiskName = () => {
  diskName.value = props.disk.diskName
}

const changeDiskName = (value: string) => {
  updateDisk({
    diskName: value,
    id: props.disk.id as number,
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
  () => props.disk,
  () => {
    diskName.value = props.disk.diskName
  },
)

onMounted(() => {
  diskName.value = props.disk.diskName
})
</script>

<style lang="scss" scoped>
.cvm-ins-disk-item-v2 {
  // border: 1px solid #e8ecf3;
  background: #fff;
}

.cvm-ins-disk-item-v2 + .cvm-ins-disk-item-v2 {
  margin-top: 16px;
}

.cvm-ins-disk-item-v2__head {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 16px;
  background: #eff4fc;
}

.cvm-ins-disk-item-v2__summary {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 0;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cvm-ins-disk-item-v2__summary-text {
  overflow: hidden;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cvm-ins-disk-item-v2__arrow {
  color: #6b7280;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(90deg);
  }
}

.cvm-ins-disk-item-v2__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  font-size: 14px;
}

.cvm-ins-disk-item-v2__link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cvm-ins-disk-item-v2__body {
  padding: 16px 0;
}

.cvm-ins-disk-item-v2__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 80px;
}

.cvm-ins-disk-item-v2__column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-ins-disk-item-v2__field {
  display: flex;
  gap: 40px;
  align-items: flex-start;

  &.is-editing {
    margin-top: -6px;
  }
}

.cvm-ins-disk-item-v2__label {
  flex: 0 0 124px;
  font-size: 14px;
  line-height: 22px;
  color: #8b95a7;
}

.cvm-ins-disk-item-v2__label--with-tip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-ins-disk-item-v2__tip-icon {
  color: #8b95a7;
}

.cvm-ins-disk-item-v2__value {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-word;
}

.cvm-ins-disk-item-v2__value--link {
  color: #06f;
}

@media (width <= 1024px) {
  .cvm-ins-disk-item-v2__head {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .cvm-ins-disk-item-v2__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
  }
}

@media (width <= 768px) {
  .cvm-ins-disk-item-v2__field {
    flex-direction: column;
    gap: 8px;
  }

  .cvm-ins-disk-item-v2__label {
    flex-basis: auto;
  }
}
</style>
