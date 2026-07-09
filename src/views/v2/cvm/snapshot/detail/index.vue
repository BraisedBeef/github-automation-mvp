<template>
  <div v-if="detail?.id" class="cvm-snapshot-detail-v2">
    <section class="cvm-snapshot-detail-v2__header">
      <PageBreadcrumbToolbar
        :items="[t('snapshot.list.snapshot'), detail.snapshotId || '-', `(${detail.name || '-'})`]"
        @doc="openHelpDoc"
      >
        <template #right>
          <div class="cvm-snapshot-detail-v2__actions">
            <el-button
              v-if="checkPermission(permMap.snapshot.ROLLBACK_SNAPSHOT)"
              :disabled="!isRollBack(detail.state)"
              @click="changeShow(rollBackRef)"
            >
              {{ t('snapshot.detail.rollBack') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.snapshot.EXPUNGE_SNAPSHOT)"
              :disabled="!isDelete(detail.state)"
              @click="changeShow(deleteRef)"
            >
              {{ t('snapshot.detail.delete') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.snapshot.CREATE_HD_FROM_SNAPSHOT)"
              :disabled="!isCreateDisk(detail.state, detail.diskType)"
              type="primary"
              @click="createDisk(detail)"
            >
              {{ t('snapshot.detail.createDisk') }}
            </el-button>
          </div>
        </template>
      </PageBreadcrumbToolbar>

      <section class="cvm-snapshot-detail-v2__tabs">
        <CatTabs v-model="active" class="cvm-snapshot-detail-v2__tabs-inner" :tabs="tabs" @change="() => {}" />
      </section>
    </section>

    <section class="cvm-snapshot-detail-v2__content">
      <section class="cvm-snapshot-detail-v2__card">
        <h3 class="cvm-snapshot-detail-v2__title">
          {{ t('snapshot.detail.info') }}
        </h3>

        <div class="cvm-snapshot-detail-v2__grid">
          <div class="cvm-snapshot-detail-v2__field">
            <div class="cvm-snapshot-detail-v2__label">
              {{ t('snapshot.detail.region') }}
            </div>
            <div class="cvm-snapshot-detail-v2__value">
              {{ detail.regionName || '-' }}
            </div>
          </div>

          <div class="cvm-snapshot-detail-v2__field">
            <div class="cvm-snapshot-detail-v2__label">
              {{ t('snapshot.detail.diskType') }}
            </div>
            <div class="cvm-snapshot-detail-v2__value">
              {{ DISK_TYPE_MAP[detail.diskType] || '-' }}
            </div>
          </div>

          <div class="cvm-snapshot-detail-v2__field">
            <div class="cvm-snapshot-detail-v2__label">
              {{ t('snapshot.detail.diskMountIns') }}
            </div>
            <div class="cvm-snapshot-detail-v2__value">
              {{ detail.insUuid || '-' }}
            </div>
          </div>

          <div class="cvm-snapshot-detail-v2__field">
            <div class="cvm-snapshot-detail-v2__label">
              {{ t('snapshot.detail.bindDisk') }}
            </div>
            <div class="cvm-snapshot-detail-v2__value">
              {{ detail.diskName || '-' }}
            </div>
          </div>

          <div class="cvm-snapshot-detail-v2__field">
            <div class="cvm-snapshot-detail-v2__label cvm-snapshot-detail-v2__label--tip">
              <span>{{ t('snapshot.detail.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cvm-snapshot-detail-v2__tip-icon" />
              </el-tooltip>
            </div>
            <div class="cvm-snapshot-detail-v2__value">
              {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
            </div>
          </div>
        </div>
      </section>
    </section>

    <RollBack ref="rollBackRef" :snapshot-list="[detail]" @success="getDetail" />
    <Delete ref="deleteRef" :snapshot-list="[detail]" @success="getDetail" />
    <CreateDisk ref="createDiskRef" :snapshot-create-config="snapshotCreateConfig" @success="getDetail" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import RollBack from '@/views/cvm/snapshot/list/components/roll-back.vue'
import Delete from '@/views/cvm/snapshot/list/components/delete.vue'
import { _getDetail } from '@/apis/cvm/snapshot'
import { DISK_TYPE_MAP } from '@/views/cvm/disk/config'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import CreateDisk from '@/views/cvm/disk/list/components/create-disk.vue'
import { isDelete, isRollBack, isCreateDisk } from '@/views/cvm/snapshot/config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { documentUrl } from '@/config/base-config'

const route = useRoute()
const id = ref<string>(route.params.id as string)
const active = ref(1)
const tabs = [{ label: t('snapshot.detail.base'), value: 1 }]
const detail = ref<any>({})
const loading = ref(false)

const snapshotCreateConfig = reactive<{
  checkSnapshot: boolean
  snapshotId?: string
  snapshotName?: string
}>({
  checkSnapshot: false,
  snapshotId: '',
  snapshotName: '',
})

const rollBackRef = ref<InstanceType<typeof RollBack>>()
const deleteRef = ref<InstanceType<typeof Delete>>()
const createDiskRef = ref<InstanceType<typeof CreateDisk>>()

const cvmStore = useCvmStore()
const permConfig = reactive({
  moduleId: moduleMap.snapshot,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const createDisk = (row: any) => {
  snapshotCreateConfig.checkSnapshot = true
  snapshotCreateConfig.snapshotId = row.snapshotId
  snapshotCreateConfig.snapshotName = row.name
  changeShow(createDiskRef.value)
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const getDetail = async () => {
  try {
    loading.value = true
    const res = await _getDetail({ id: id.value })
    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.cvm-snapshot-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-snapshot-detail-v2__header {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  background: #fff;
}

.cvm-snapshot-detail-v2__actions {
  display: inline-flex;
  flex-wrap: wrap;

  // gap: 12px;
  align-items: center;
}

.cvm-snapshot-detail-v2__tabs {
  margin-top: -1px;
}

.cvm-snapshot-detail-v2__tabs-inner {
  :deep(.cat-tabs__header) {
    border-bottom-color: transparent;
  }
}

.cvm-snapshot-detail-v2__content {
  padding: 0;
}

.cvm-snapshot-detail-v2__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-snapshot-detail-v2__title {
  margin: 0 0 24px;
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  color: #191c23;
}

.cvm-snapshot-detail-v2__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 72px;
}

.cvm-snapshot-detail-v2__field {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  min-width: 0;
}

.cvm-snapshot-detail-v2__label {
  flex: 0 0 120px;
  font-size: 14px;
  line-height: 22px;
  color: #98a2b3;
  white-space: nowrap;
}

.cvm-snapshot-detail-v2__label--tip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-snapshot-detail-v2__tip-icon {
  color: #98a2b3;
}

.cvm-snapshot-detail-v2__value {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-word;
}

@media (width <= 768px) {
  .cvm-snapshot-detail-v2__card {
    padding: 20px 16px;
  }

  .cvm-snapshot-detail-v2__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .cvm-snapshot-detail-v2__field {
    flex-direction: column;
    gap: 8px;
  }

  .cvm-snapshot-detail-v2__label {
    flex-basis: auto;
  }
}
</style>
