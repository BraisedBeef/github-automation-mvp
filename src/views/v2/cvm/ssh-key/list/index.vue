<template>
  <div class="cvm-ssh-key-list-v2">
    <PageBreadcrumbToolbar :items="[t('sshKey.list.sshkey')]" @doc="openHelpDoc">
      <template #title-extra>
        <div class="cvm-ssh-key-list-v2__area">
          <AreaSelect v-model="area" @change-area="changeArea" />
        </div>
      </template>
    </PageBreadcrumbToolbar>

    <section class="cvm-ssh-key-list-v2__panel">
      <div class="cvm-ssh-key-list-v2__toolbar">
        <div class="cvm-ssh-key-list-v2__actions">
          <el-button
            v-if="checkPermission(permMap.sshKey.CREATE_SSH)"
            type="primary"
            @click="changeShow(createSshKeyRef)"
          >
            {{ t('sshKey.list.create') }}
          </el-button>
          <el-button
            v-if="checkPermission(permMap.sshKey.DELETE_SSH)"
            :type="selectList.length ? 'primary' : ''"
            :disabled="
              !isDeleteBatch(
                selectList.map(el => el.bandIngInstances.length + el.bandInstanceCount + el.unBandIngInstances.length),
              )
            "
            @click="batchRemove"
          >
            {{ t('sshKey.list.delete') }}
          </el-button>
        </div>

        <div class="cvm-ssh-key-list-v2__tools">
          <FilterInput
            ref="filterInputRef"
            class="cvm-ssh-key-list-v2__filter"
            :placeholder="t('sshKey.list.listPh')"
            :filter-list="iptFilterConfig"
            @search="searchFn"
          />
          <CdnIconButton class="cvm-ssh-key-list-v2__icon-btn" @click="refresh">
            <SvgIcon name="refresh" />
          </CdnIconButton>
        </div>
      </div>

      <TableV2
        v-loading="loading"
        :data="list"
        :total="paginationConfig.total"
        :pagination="paginationConfig.pagination"
        :empty-min-height="420"
        show-pagination
        @selection-change="handleRowSelectChange"
        @change="paginationChange"
      >
        <el-table-column type="selection" width="54" />

        <el-table-column min-width="320" :label="t('sshKey.list.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-ssh-key-list-v2__name-cell">
              <div class="cvm-ssh-key-list-v2__link">
                <Copy :text="row.sshInsId" style="display: inline-block" @handle-click="toDetail(row)" />
              </div>
              <div class="cvm-ssh-key-list-v2__subtext">
                <Copy :text="row.sshName" />
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="160" :label="t('sshKey.list.bindIns')">
          <template #default="{ row }">
            {{ row.bandInstanceCount || 0 }}
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="t('sshKey.list.bindCustImage')">
          <template #default="{ row }">
            {{ row.bandImageCount || 0 }}
          </template>
        </el-table-column>

        <el-table-column min-width="220">
          <template #header>
            <div class="cvm-ssh-key-list-v2__time-head">
              <span>{{ t('sshKey.list.createTime') }}</span>
              <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                <SvgIcon name="cat-cdn-help" class="cvm-ssh-key-list-v2__time-icon" />
              </el-tooltip>
            </div>
          </template>
          <template #default="{ row }">
            {{ row.createTime ? maoYunDayJs(row.createTime).format(FORMAT_TIME) : '-' }}
          </template>
        </el-table-column>

        <el-table-column :min-width="optsClass" fixed="right" :label="t('sshKey.list.opts')">
          <template #default="{ row }">
            <div class="cvm-ssh-key-list-v2__ops">
              <DisableText
                v-if="checkPermission(permMap.sshKey.UN_BAND_SSH)"
                :disabled="row.bandInstanceCount <= 0"
                :text="t('sshKey.list.unbindIns')"
                disabled-type="hidden"
                @click="unBindIns(row)"
              />
              <DisableText
                v-if="checkPermission(permMap.sshKey.BAND_SSH)"
                :text="t('sshKey.list.bindIns')"
                disabled-type="hidden"
                @click="bindIns(row)"
              />
              <DisableText
                v-if="checkPermission(permMap.sshKey.DELETE_SSH)"
                :disabled="
                  !isDelete(row.bandIngInstances.length + row.bandInstanceCount + row.unBandIngInstances.length)
                "
                :text="t('sshKey.list.delete')"
                disabled-type="hidden"
                @click="singleRemove(row)"
              />
            </div>
          </template>
        </el-table-column>
      </TableV2>

      <BindIns ref="bindInsRef" :ssh-key="sshKey" @success="listSSh" />
      <UnBindIns ref="unBindInsRef" :ssh-key="sshKey" @success="listSSh" />
      <CreateSshKey ref="createSshKeyRef" @success="listSSh" />
      <DeleteSshKey ref="deleteSshKeyRef" :ssh-key-list="removeConfig.list" @success="listSSh" />
    </section>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import BindIns from '@/views/cvm/ssh-key/list/components/bind-ins.vue'
import UnBindIns from '@/views/cvm/ssh-key/list/components/un-bind-ins.vue'
import CreateSshKey from '@/views/cvm/ssh-key/list/components/create-ssh-key.vue'
import DeleteSshKey from '@/views/cvm/ssh-key/list/components/delete-ssh-key.vue'
import { AreaSelectType, useCvmStore } from '@/store'
import { useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _listSSh } from '@/apis/cvm/ssh-key'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { isDelete, isDeleteBatch } from '@/views/cvm/ssh-key/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { pushRoute } from '@/utils/router-jump'
import { documentUrl } from '@/config/base-config'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const optsMap = {
  [ja]: '420px',
  [en]: '320px',
  [zh]: '220px',
}

const optsClass = useI18nStyle(optsMap)

const defaultIptFilterConfig = [
  { fieldName: t('sshKey.list.sshUuid'), fieldKey: 'sshUuid' },
  { fieldName: t('sshKey.list.sshName'), fieldKey: 'sshName' },
]

const cvmStore = useCvmStore()
const { filterInputRef, iptFilterConfig, resetIptFn } = useFilter({}, defaultIptFilterConfig)

const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})
const list = ref<any[]>([])
const loading = ref(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const sshKey = ref<any>({})
const selectList = ref<any[]>([])
const removeConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
}>({
  type: 'single',
  list: [],
})

const bindInsRef = ref<InstanceType<typeof BindIns>>()
const unBindInsRef = ref<InstanceType<typeof UnBindIns>>()
const createSshKeyRef = ref<InstanceType<typeof CreateSshKey>>()
const deleteSshKeyRef = ref<InstanceType<typeof DeleteSshKey>>()

const permConfig = reactive({
  moduleId: moduleMap.sshKey,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const searchFn = (search: any) => {
  paginationConfig.pagination.page = 1
  listSSh(search)
}

const refresh = () => {
  resetIptFn()
}

const changeArea = area => {
  permConfig.regionId = area.id
}

const toDetail = (row: any) => {
  pushRoute({
    name: 'ssh_key_detail',
    params: {
      id: row.id,
    },
  })
}

const bindIns = (row: any) => {
  sshKey.value = row
  changeShow(bindInsRef.value)
}

const unBindIns = (row: any) => {
  sshKey.value = row
  changeShow(unBindInsRef.value)
}

const singleRemove = (row: any) => {
  removeConfig.type = 'single'
  removeConfig.list = [row]
  changeShow(deleteSshKeyRef.value)
}

const batchRemove = () => {
  if (!selectList.value.length) return
  removeConfig.type = 'batch'
  removeConfig.list = selectList.value
  changeShow(deleteSshKeyRef.value)
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

const handleRowSelectChange = (selection: any) => {
  selectList.value = selection
}

const paginationChange = () => {
  listSSh()
}

const listSSh = async (search = filterInputRef.value?.searchParams || {}) => {
  try {
    loading.value = true

    const res = await _listSSh({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      regionId: cvmStore.areaSelect.id,
      ...search,
    })

    if (res.success) {
      list.value = res.data?.list || []
      paginationConfig.total = res.data.recordCnt
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

watch(
  () => cvmStore.areaSelect.id,
  () => {
    resetIptFn()
    listSSh()
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style scoped lang="scss">
.cvm-ssh-key-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cvm-ssh-key-list-v2__area {
  display: inline-flex;
  margin-left: 12px;
}

.cvm-ssh-key-list-v2__panel {
  padding: 20px;
  background: #fff;
}

.cvm-ssh-key-list-v2__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.cvm-ssh-key-list-v2__actions,
.cvm-ssh-key-list-v2__tools,
.cvm-ssh-key-list-v2__ops {
  display: inline-flex;
  gap: 12px;
  align-items: center;
}

.cvm-ssh-key-list-v2__filter {
  min-width: 520px;
}

.cvm-ssh-key-list-v2__icon-btn {
  flex: 0 0 auto;
}

.cvm-ssh-key-list-v2__name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cvm-ssh-key-list-v2__link {
  color: #06f;
}

.cvm-ssh-key-list-v2__subtext {
  line-height: 22px;
  color: #191c23;
}

.cvm-ssh-key-list-v2__time-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.cvm-ssh-key-list-v2__time-icon {
  color: #a0a8b8;
}

@media (width <= 1200px) {
  .cvm-ssh-key-list-v2__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .cvm-ssh-key-list-v2__tools {
    width: 100%;
  }

  .cvm-ssh-key-list-v2__filter {
    width: 100%;
    min-width: 0;
  }
}

@media (width <= 768px) {
  .cvm-ssh-key-list-v2__panel {
    padding: 16px;
  }

  .cvm-ssh-key-list-v2__actions,
  .cvm-ssh-key-list-v2__tools,
  .cvm-ssh-key-list-v2__ops {
    flex-wrap: wrap;
  }
}
</style>
