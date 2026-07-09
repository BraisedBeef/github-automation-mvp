<template>
  <div class="cvm-ssh-key-detail-v2">
    <section class="cvm-ssh-key-detail-v2__header">
      <PageBreadcrumbToolbar
        :items="[t('sshKey.detail.backTitle'), detail.sshInsId || '-', `(${detail.sshName || '-'})`]"
        @doc="openHelpDoc"
      >
        <template #right>
          <div class="cvm-ssh-key-detail-v2__actions">
            <el-button v-if="checkPermission(permMap.sshKey.BAND_SSH)" type="primary" @click="changeShow(bindInsRef)">
              {{ t('sshKey.detail.bindIns') }}
            </el-button>
            <el-button v-if="checkPermission(permMap.sshKey.SET_SSH_NAME)" @click="changeShow(modifySshKeyRef)">
              {{ t('general.modify') }}
            </el-button>
            <el-button v-if="checkPermission(permMap.sshKey.DELETE_SSH)" :disabled="!canDelete" @click="singleRemove">
              {{ t('sshKey.list.delete') }}
            </el-button>
          </div>
        </template>
      </PageBreadcrumbToolbar>

      <section class="cvm-ssh-key-detail-v2__tabs">
        <CatTabs v-model="active" class="cvm-ssh-key-detail-v2__tabs-inner" :tabs="tabs" @change="() => {}" />
      </section>
    </section>

    <section class="cvm-ssh-key-detail-v2__content">
      <section v-loading="loadingDetail" class="cvm-ssh-key-detail-v2__card">
        <h3 class="cvm-ssh-key-detail-v2__title">
          {{ t('sshKey.detail.sshKeyInfo') }}
        </h3>

        <div class="cvm-ssh-key-detail-v2__grid">
          <div class="cvm-ssh-key-detail-v2__field">
            <div class="cvm-ssh-key-detail-v2__label">
              {{ t('sshKey.detail.name') }}
            </div>
            <div class="cvm-ssh-key-detail-v2__value cvm-ssh-key-detail-v2__value--inline">
              <span>{{ detail?.sshName || '-' }}</span>
              <SvgIcon
                v-if="checkPermission(permMap.sshKey.SET_SSH_NAME)"
                class="cvm-ssh-key-detail-v2__edit"
                name="edit"
                @click="changeShow(modifySshKeyRef)"
              />
            </div>
          </div>

          <div class="cvm-ssh-key-detail-v2__field">
            <div class="cvm-ssh-key-detail-v2__label">
              {{ t('sshKey.detail.id') }}
            </div>
            <div class="cvm-ssh-key-detail-v2__value">
              {{ detail?.sshInsId || '-' }}
            </div>
          </div>

          <div class="cvm-ssh-key-detail-v2__field">
            <div class="cvm-ssh-key-detail-v2__label">
              {{ t('sshKey.detail.desc') }}
            </div>
            <div class="cvm-ssh-key-detail-v2__value cvm-ssh-key-detail-v2__value--inline">
              <span>{{ detail?.description || '-' }}</span>
              <SvgIcon
                v-if="checkPermission(permMap.sshKey.SET_SSH_NAME)"
                class="cvm-ssh-key-detail-v2__edit"
                name="edit"
                @click="changeShow(modifySshKeyRef)"
              />
            </div>
          </div>

          <div class="cvm-ssh-key-detail-v2__field">
            <div class="cvm-ssh-key-detail-v2__label">
              {{ t('sshKey.detail.publicKey') }}
            </div>
            <div class="cvm-ssh-key-detail-v2__value cvm-ssh-key-detail-v2__value--public-key">
              <ExpandableText
                :text-style="{
                  fontSize: '14px',
                  color: '#191c23',
                  lineHeight: '22px',
                }"
                :text="detail.publicKey"
                :max-length="50"
              />
            </div>
          </div>

          <div class="cvm-ssh-key-detail-v2__field">
            <div class="cvm-ssh-key-detail-v2__label cvm-ssh-key-detail-v2__label--with-tip">
              <span>{{ t('sshKey.detail.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" />
              </el-tooltip>
            </div>
            <div class="cvm-ssh-key-detail-v2__value">
              {{ detail.createTime ? maoYunDayJs(detail.createTime).format(FORMAT_TIME) : '-' }}
            </div>
          </div>
        </div>
      </section>

      <section class="cvm-ssh-key-detail-v2__card">
        <h3 class="cvm-ssh-key-detail-v2__title">
          {{ t('sshKey.detail.bindedIns') }}
        </h3>

        <div class="cvm-ssh-key-detail-v2__toolbar">
          <el-button
            type="primary"
            :disabled="!isUnBindInsBatch(selectList.map(el => el.state))"
            @click="batchUnBindIns"
          >
            {{ t('sshKey.detail.unBindIns') }}
          </el-button>

          <el-select v-model="area" class="cvm-ssh-key-detail-v2__select" :placeholder="t('sshKey.detail.areaPh')">
            <el-option v-for="item in areaOpts" :key="item.id" :label="item.regionName" :value="item.id" />
          </el-select>

          <el-select
            v-model="zoneId"
            class="cvm-ssh-key-detail-v2__select"
            :placeholder="t('sshKey.detail.zonePh')"
            @change="listInstanceFn"
          >
            <el-option v-for="item in zoneList" :key="item.id" :label="item.zoneName" :value="item.id" />
          </el-select>
        </div>

        <TableV2 v-loading="loading" :data="list" :empty-min-height="260" @selection-change="handleRowSelectChange">
          <el-table-column type="selection" width="54" :selectable="row => isUnBindIns(row.state)" />

          <el-table-column min-width="260" :label="t('sshKey.detail.idName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="cvm-ssh-key-detail-v2__name-cell">
                <div class="cvm-ssh-key-detail-v2__link">
                  {{ row.insUuid }}
                </div>
                <div class="cvm-ssh-key-detail-v2__subtext">
                  {{ row.instanceName || '-' }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column min-width="180" :label="t('sshKey.detail.insState')">
            <template #default="{ row }">
              <StatusGroup :list="INS_STATE_ARR_MAP" :value="row.state" />
            </template>
          </el-table-column>

          <el-table-column min-width="320" :label="t('sshKey.detail.belongNet')" show-overflow-tooltip>
            <template #default="{ row }">
              {{ handleRowVpc(row) || '-' }}
            </template>
          </el-table-column>

          <el-table-column min-width="180" :label="t('sshKey.detail.privateIp')">
            <template #default="{ row }">
              {{ handleRowIp(row).mainPrivateIp || '-' }}
            </template>
          </el-table-column>

          <el-table-column min-width="140" :label="t('sshKey.detail.opts')" fixed="right">
            <template #default="{ row }">
              <DisableText
                v-if="checkPermission(permMap.sshKey.UN_BAND_SSH)"
                :disabled="!isUnBindIns(row.state)"
                :text="t('sshKey.detail.unBind')"
                disabled-type="hidden"
                @click="unBindIns(row)"
              />
            </template>
          </el-table-column>
        </TableV2>
      </section>
    </section>

    <ModifySshKey
      :id="Number(id)"
      ref="modifySshKeyRef"
      :key-name="detail.sshName"
      :description="detail.description || ''"
      @success="getSSHInfo"
    />
    <BindIns ref="bindInsRef" :ssh-key="detail" @success="handleBindSuccess" />
    <UnBindIns
      ref="unBindInsRef"
      :outside="true"
      :outside-list="unBindInsConfig.list"
      :ssh-key="detail"
      @success="handleBindSuccess"
    />
    <DeleteSshKey ref="deleteSshKeyRef" :ssh-key-list="[detail]" @success="backRoute()" />
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import ModifySshKey from '@/views/cvm/ssh-key/detail/components/modify-ssh-key.vue'
import UnBindIns from '@/views/cvm/ssh-key/list/components/un-bind-ins.vue'
import BindIns from '@/views/cvm/ssh-key/list/components/bind-ins.vue'
import DeleteSshKey from '@/views/cvm/ssh-key/list/components/delete-ssh-key.vue'
import { _getSSHInfo } from '@/apis/cvm/ssh-key'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { useCvmStore } from '@/store'
import { INS_STATE_ARR_MAP } from '@/views/cvm/ins/config'
import { isDelete, isUnBindIns, isUnBindInsBatch } from '@/views/cvm/ssh-key/config'
import { useBaseConfig } from '@/views/cvm/hooks/use-base-config'
import { useIns } from '@/views/cvm/hooks/use-ins'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { documentUrl } from '@/config/base-config'
import { backRoute } from '@/utils/router-jump'

const route = useRoute()
const cvmStore = useCvmStore()
const { listByRegionId } = useBaseConfig()
const { listInstance, loading } = useIns()

const id = ref<string>(route.params.id as string)
const active = ref(1)
const tabs = [{ label: t('sshKey.detail.base'), value: 1 }]
const detail = ref<any>({})
const loadingDetail = ref(false)
const selectList = ref<any[]>([])
const area = ref<number | undefined>()
const zoneId = ref<number | undefined>()
const list = ref<any[]>([])
const zoneList = ref<any[]>([])
const unBindInsConfig = reactive<{ list: any[] }>({
  list: [],
})

const modifySshKeyRef = ref<InstanceType<typeof ModifySshKey>>()
const unBindInsRef = ref<InstanceType<typeof UnBindIns>>()
const bindInsRef = ref<InstanceType<typeof BindIns>>()
const deleteSshKeyRef = ref<InstanceType<typeof DeleteSshKey>>()

const permConfig = reactive({
  moduleId: moduleMap.sshKey,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const areaOpts = computed(() => {
  return cvmStore.areaSelect.id ? [cvmStore.areaSelect] : []
})

const canDelete = computed(() => {
  const bindCount =
    (detail.value?.bandIngInstances?.length || 0) +
    (detail.value?.bandInstanceCount || 0) +
    (detail.value?.unBandIngInstances?.length || 0)

  return isDelete(bindCount)
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const listByRegionIdFn = () => {
  const params = {
    regionId: cvmStore.areaSelect.id,
  }

  listByRegionId(params, (res: any) => {
    if (res.success) {
      zoneList.value = res.data || []
    }
  })
}

const handleRowIp = (row: any) => {
  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1)
  const ipConfig: any = {}

  if (res) {
    ipConfig.mainPrivateIp = res.mainPrivateIp ? `${res.mainPrivateIp}` : ''
    ipConfig.mainPublicIp = res.mainPublicIp ? `${res.mainPublicIp}` : ''
  }

  return ipConfig
}

const handleRowVpc = (row: any) => {
  const networkInfos = row.networkInfos || []
  const res = networkInfos.find(el => el.primaryType === 1)

  if (res) {
    return `${res.vpcInsId}(${res.vpcName}|${res.cidrBlock})`
  }

  return ''
}

const unBindIns = (row: any) => {
  unBindInsConfig.list = [row]
  changeShow(unBindInsRef.value)
}

const batchUnBindIns = () => {
  unBindInsConfig.list = selectList.value
  changeShow(unBindInsRef.value)
}

const singleRemove = () => {
  changeShow(deleteSshKeyRef.value)
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
}

const getSSHInfo = async () => {
  try {
    loadingDetail.value = true

    const res = await _getSSHInfo({
      id: Number(id.value),
    })

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loadingDetail.value = false
  }
}

const listInstanceFn = async () => {
  const params = {
    regionId: cvmStore.areaSelect.id,
    zoneId: zoneId.value,
    sshId: Number(id.value),
  }

  listInstance(params, (res: any) => {
    if (res.success) {
      list.value = res.data?.list || []
    }
  })
}

const handleBindSuccess = () => {
  getSSHInfo()
  listInstanceFn()
}

onMounted(async () => {
  area.value = cvmStore.areaSelect.id
  permConfig.regionId = cvmStore.areaSelect.id
  await getSSHInfo()
  await listByRegionIdFn()
  listInstanceFn()
})
</script>

<style scoped lang="scss">
.cvm-ssh-key-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-ssh-key-detail-v2__header {
  display: flex;
  flex-direction: column;
  background: #fff;
}

.cvm-ssh-key-detail-v2__actions {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.cvm-ssh-key-detail-v2__tabs {
  margin-top: -1px;
}

.cvm-ssh-key-detail-v2__tabs-inner {
  :deep(.cat-tabs__header) {
    border-bottom-color: transparent;
  }
}

.cvm-ssh-key-detail-v2__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-ssh-key-detail-v2__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ssh-key-detail-v2__title {
  margin: 0 0 24px;
  font-size: 16px;
  font-weight: 600;
  line-height: 28px;
  color: #191c23;
}

.cvm-ssh-key-detail-v2__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  max-width: 1080px;
}

.cvm-ssh-key-detail-v2__field {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  align-items: start;
}

.cvm-ssh-key-detail-v2__label {
  font-size: 14px;
  line-height: 22px;
  color: #a0a8b8;
}

.cvm-ssh-key-detail-v2__label--with-tip {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-ssh-key-detail-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  word-break: break-word;
}

.cvm-ssh-key-detail-v2__value--inline {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-ssh-key-detail-v2__value--public-key {
  max-width: 980px;
}

.cvm-ssh-key-detail-v2__edit {
  color: #8c98ad;
  cursor: pointer;
}

.cvm-ssh-key-detail-v2__toolbar {
  display: inline-flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.cvm-ssh-key-detail-v2__select {
  width: 260px;
}

.cvm-ssh-key-detail-v2__name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cvm-ssh-key-detail-v2__link {
  color: #06f;
}

.cvm-ssh-key-detail-v2__subtext {
  line-height: 22px;
  color: #191c23;
}

@media (width <= 768px) {
  .cvm-ssh-key-detail-v2__card {
    padding: 16px;
  }

  .cvm-ssh-key-detail-v2__field {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .cvm-ssh-key-detail-v2__toolbar,
  .cvm-ssh-key-detail-v2__actions {
    flex-wrap: wrap;
  }

  .cvm-ssh-key-detail-v2__select {
    width: 100%;
  }
}
</style>
