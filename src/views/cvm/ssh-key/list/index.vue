<template>
  <div>
    <PageHeader :title="t('sshKey.list.sshkey')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" />
      </template>
    </PageHeader>
    <div style="padding: 20px">
      <div style="padding: 20px" class="page-box">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <!-- 创建 -->
            <el-button
              v-if="checkPermission(permMap.sshKey.CREATE_SSH)"
              type="primary"
              @click="changeShow(createSshKeyRef)"
            >
              {{ t('sshKey.list.create') }}
            </el-button>
            <!-- 删除 -->
            <el-button
              v-if="checkPermission(permMap.sshKey.DELETE_SSH)"
              :disabled="
                !isDeleteBatch(
                  selectList.map(
                    el => el.bandIngInstances.length + el.bandInstanceCount + el.unBandIngInstances.length,
                  ),
                )
              "
              @click="batchRemove"
            >
              {{ t('sshKey.list.delete') }}
            </el-button>
          </div>

          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('sshKey.list.listPh')"
              :filter-list="iptFilterConfig"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" @click="refresh">
              <SvgIcon name="refresh" />
            </CdnIconButton>
          </div>
        </div>

        <el-table v-loading="loading" :data="list" class="mt20 table" @selection-change="handleRowSelectChange">
          <el-table-column type="selection" width="40" />
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('sshKey.list.idName')">
            <template #default="{ row }">
              <div class="text-primary pointer">
                <Copy :text="row.sshInsId" @handle-click="toDetail(row)" />
              </div>
              <div><Copy :text="row.sshName" /></div>
            </template>
          </el-table-column>
          <!-- 绑定实例 -->
          <el-table-column min-width="200" :label="t('sshKey.list.bindIns')">
            <template #default="{ row }">
              <div>{{ row.bandInstanceCount || 0 }}</div>
            </template>
          </el-table-column>
          <!-- 绑定自定义镜像 -->
          <el-table-column min-width="200" :label="t('sshKey.list.bindCustImage')">
            <template #default="{ row }">
              <div>{{ row.bandImageCount || 0 }}</div>
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('sshKey.list.createTime')">
            <template #header>
              <div class="df ac">
                <span>{{ t('sshKey.list.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" class="ml10" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row.createTime ? maoYunDayJs(row?.createTime).format(FORMAT_TIME) : '-' }}</div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column :min-width="optsClass" :label="t('sshKey.list.opts')" fixed="right">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 绑定实例 -->
                <span
                  v-if="checkPermission(permMap.sshKey.BAND_SSH)"
                  class="text-primary mr20 cursor-pointer"
                  @click="bindIns(row)"
                  >{{ t('sshKey.list.bindIns') }}</span
                >
                <!-- 解绑实例 -->
                <DisableText
                  v-if="checkPermission(permMap.sshKey.UN_BAND_SSH)"
                  :class="row.bandInstanceCount <= 0 ? '' : 'mr20'"
                  :disabled="row.bandInstanceCount <= 0"
                  :text="t('sshKey.list.unbindIns')"
                  disabled-type="hidden"
                  @click="unBindIns(row)"
                />
                <!-- 删除 -->
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
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="paginationChange"
        />

        <!-- 绑定实例 -->
        <BindIns ref="bindInsRef" :ssh-key="sshKey" @success="listSSh" />
        <!-- 解绑实例 -->
        <UnBindIns ref="unBindInsRef" :ssh-key="sshKey" @success="listSSh" />
        <!-- 创建密钥 -->
        <CreateSshKey ref="createSshKeyRef" @success="listSSh" />
        <!-- 删除密钥 -->
        <DeleteSshKey ref="deleteSshKeyRef" :ssh-key-list="removeConfig.list" @success="listSSh" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import { IPagination } from '@/views/account-system/type'
import BindIns from './components/bind-ins.vue'
import UnBindIns from './components/un-bind-ins.vue'
import CreateSshKey from './components/create-ssh-key.vue'
import DeleteSshKey from './components/delete-ssh-key.vue'

import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import { _listSSh } from '@/apis/cvm/ssh-key'
import { useCvmStore } from '@/store'
import { useFilter } from '@/components/cvm/query-filter/use-filter'
import { AreaSelectType } from '@/store/cvm'
import { isDelete, isDeleteBatch } from '@/views/cvm/ssh-key/config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useCvmAndNetworkPermission, moduleMap, permMap } from '@/hooks/permission/use-cvm-and-network-permission'
import { pushRoute } from '@/utils/router-jump'

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const optsMap = {
  [ja]: '420px',
  [en]: '320px',
  [zh]: '200px',
}

const optsClass = useI18nStyle(optsMap)

const defaultIptFilterConfig = [
  { fieldName: t('sshKey.list.sshUuid'), fieldKey: 'sshUuid' },
  { fieldName: t('sshKey.list.sshName'), fieldKey: 'sshName' },
]

const cvmStore = useCvmStore()
const { filterInputRef, iptFilterConfig, resetIptFn } = useFilter({}, defaultIptFilterConfig)

// 地区
const area = ref<AreaSelectType>({
  id: 0,
  locationId: 0,
})
const list = ref<any[]>([]) // 列表
const loading = ref<boolean>(false)
const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})
const sshKey = ref<any>({}) // sshKey
const selectList = ref<any[]>([]) // 选中的
// 删除配置
const removeConfig = reactive<{
  type: 'single' | 'batch'
  list: any[]
}>({
  type: 'single',
  list: [],
})

const bindInsRef = ref<InstanceType<typeof BindIns>>() // 绑定实例
const unBindInsRef = ref<InstanceType<typeof UnBindIns>>() // 解绑实例
const createSshKeyRef = ref<InstanceType<typeof CreateSshKey>>() // 创建密钥
const deleteSshKeyRef = ref<InstanceType<typeof DeleteSshKey>>() // 删除密钥

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.sshKey,
  regionId: 0,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

// 搜索框搜索项同步到表格的筛选项中
const searchFn = (search: any) => {
  console.log(`searchFn===>`, search)

  paginationConfig.pagination.page = 1
  listSSh(search)
}

const refresh = () => {
  resetIptFn()
  // listSSh()
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
}

// 跳转详情
const toDetail = (row: any) => {
  console.log(`toDetail===>`, row.accountType, row.userType)

  const id = row.id

  pushRoute({
    name: 'ssh_key_detail',
    params: {
      id,
    },
  })
}

// 绑定实例
const bindIns = (row: any) => {
  sshKey.value = row
  changeShow(bindInsRef.value)
}

// 解绑实例
const unBindIns = (row: any) => {
  sshKey.value = row
  changeShow(unBindInsRef.value)
}

// 删除
const singleRemove = (row: any) => {
  removeConfig.type = 'single'
  removeConfig.list = [row]
  changeShow(deleteSshKeyRef.value)
}

// 批量删除
const batchRemove = () => {
  if (selectList.value.length) {
    removeConfig.type = 'batch'
    removeConfig.list = selectList.value
    changeShow(deleteSshKeyRef.value)
  }
}

// 弹窗展示
const changeShow = (ins: any) => {
  if (!ins) return

  ins.show = true
}

// 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  selectList.value = selection
}

// 分页
const paginationChange = () => {
  listSSh()
}

// 分页查询秘钥列表
const listSSh = async (search = filterInputRef.value?.searchParams || {}) => {
  try {
    loading.value = true

    const res = await _listSSh({
      pageIndex: paginationConfig.pagination.page,
      pageSize: paginationConfig.pagination.pageSize,
      regionId: cvmStore.areaSelect.id,
      ...search,
    })

    console.log(`_listSSh===>`, res)

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

onMounted(async () => {
  useTempStore().setPageHeader(false)
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
@use '@/views/cvm/style/common';
</style>
