<template>
  <div>
    <PageHeader :title="t('securityGroup.securityGroup')" :back-title="''">
      <template #left>
        <AreaSelect v-model="area" @change-area="changeArea" @get-region-data="getRegionData" />
      </template>
    </PageHeader>

    <div style="padding: 20px">
      <el-card shadow="never" class="page-box" :body-style="bodyStyle">
        <div class="df ac jsb">
          <div class="btn-wrap">
            <el-button
              v-if="checkPermission(permMap.group.CREATE_SECURITY_GROUP)"
              type="primary"
              @click="changeShow(setAddRef)"
            >
              {{ t('securityGroup.add') }}
            </el-button>
            <el-button
              v-if="checkPermission(permMap.group.DELETE_SECURITY_GROUPS_BULK)"
              type=""
              :disabled="state.selectList.length === 0"
              @click="deleteListFn(setDeleteRef)"
            >
              {{ t('securityGroup.delete') }}
            </el-button>
          </div>
          <div class="search-wrap df ac">
            <FilterInput
              ref="filterInputRef"
              :placeholder="t('securityGroup.placeholder')"
              :filter-list="filterList"
              @search="searchFn"
            />
            <CdnIconButton class="ml10" :disabled="state.loading" @click="refreshFn">
              <SvgIcon name="refresh" />
            </CdnIconButton>
            <CdnIconButton class="" @click="exportTemplate">
              <SvgIcon name="cat-cdn-download" />
            </CdnIconButton>
          </div>
        </div>

        <el-table
          v-loading="state.loading"
          :data="state.list"
          class="mt20 table"
          @selection-change="handleRowSelectChange"
        >
          <el-table-column type="selection" width="40" />
          <!-- ID/名称 -->
          <el-table-column min-width="220" :label="t('securityGroup.idOrName')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-primary cursor-pointer">
                  <Copy :text="row.groupUuid" @handle-click="goDetail(row)" />
                </div>
                <TableCopy :text="row.name" />
              </div>
            </template>
          </el-table-column>
          <!-- 关联实例数 -->
          <el-table-column min-width="240" :label="t('securityGroup.associatedInsNumber')">
            <template #default="{ row }">
              <div>{{ row.insNum || 0 }}</div>
            </template>
          </el-table-column>
          <!-- 备注 -->
          <el-table-column min-width="200" :label="t('securityGroup.remark')" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="table-td_tooltip">
                <div class="text-over">
                  {{ !!row?.description ? row.description : '-' }}
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 类型 -->
          <el-table-column min-width="120" :label="t('securityGroup.type')">
            <template #default="{ row }">
              <div>{{ typeOptions.find(item => item.value === row.type)?.label }}</div>
            </template>
          </el-table-column>
          <!-- 更新时间 -->
          <el-table-column min-width="220" :label="t('securityGroup.updateTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('securityGroup.updateTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row?.updateTime ? maoYunDayJs(row?.updateTime).format(FORMAT_TIME) : '-' }}</div>
              <!--  -->
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column min-width="220" :label="t('securityGroup.createTime')">
            <template #header>
              <div class="df ac">
                <span class="mr10">{{ t('securityGroup.createTime') }}</span>
                <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-help" />
                </el-tooltip>
              </div>
            </template>
            <template #default="{ row }">
              <div>{{ row?.createTime ? maoYunDayJs(row?.createTime).format(FORMAT_TIME) : '-' }}</div>
            </template>
          </el-table-column>
          <!-- 操作 -->
          <el-table-column :min-width="operateClass" :label="t('securityGroup.operate')" fixed="right">
            <template #default="{ row }">
              <span
                v-if="checkPermission(permMap.group.MODIFY_SECURITY_GROUP_RULE)"
                class="text-primary mr20 cursor-pointer"
                @click="goDetail(row, 1)"
                >{{ t('securityGroup.modifyRules') }}</span
              >
              <span
                v-if="checkPermission(permMap.group.MANAGE_SECURITY_GROUP_INSTANCES)"
                class="text-primary mr20 cursor-pointer"
                @click="goDetail(row, 2)"
                >{{ t('securityGroup.managementExamples') }}</span
              >
              <span
                v-if="checkPermission(permMap.group.CLONE_SECURITY_GROUP)"
                class="text-primary mr20 cursor-pointer"
                @click="cloneFn(setCloneRef, row)"
                >{{ t('securityGroup.clone') }}</span
              >
              <span
                v-if="checkPermission(permMap.group.DELETE_SECURITY_GROUP_SINGLE)"
                class="text-primary cursor-pointer"
                @click="deleteFn(setDeleteRef, row)"
                >{{ t('securityGroup.delete') }}</span
              >
            </template>
          </el-table-column>
        </el-table>

        <CatPagination
          v-model:pagination="paginationConfig.pagination"
          :total="paginationConfig.total"
          :custom-keys="['page', 'pageSize']"
          @change="paginationChange"
        />
      </el-card>
    </div>
    <!-- 删除 -->
    <SetDelete ref="setDeleteRef" :region-id="area.id" @success="callbackFn" />
    <!-- 克隆 -->
    <SetClone ref="setCloneRef" :area-list="state.areaList" :region-id="area.id" @success="callbackFn" />
    <!-- 新增 -->
    <SetAdd ref="setAddRef" :template-list="state.templateList" :region-id="area.id" @success="callbackFn" />
  </div>
</template>

<script setup lang="ts">
import { maoYunDayJs, FORMAT_TIME } from '@/utils/mao-yun-day-js'
import t from '@/utils/i18n'
import { useTempStore } from '@/store'
import dayjs from 'dayjs'
import { downloadExportFiles } from '@/utils/download'
import { message } from '@/utils/message'
import FilterInput from '@/components/cvm/query-filter/filter-input.vue'
import { IPagination } from '@/views/account-system/type'
import SetDelete from './components/set-delete/index.vue'
import SetClone from './components/set-clone/index.vue'
import SetAdd from './components/set-add/index.vue'
import {
  getListSecurityGroup,
  getTemplateList,
  getExportTemplate,
  downloadSecurityGroup,
} from '@/apis/network/security-group'
import { SecurityGroupListInterface, TemplateListInterface } from './type'
import { typeOptions } from './config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.group,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam

const operateMap = {
  [ja]: '400px',
  [en]: '400px',
  [zh]: '260px',
}

const operateClass = useI18nStyle(operateMap)

const bodyStyle = { height: '100%' }
const router = useRouter()

const filterList = [
  { fieldName: 'ID', fieldKey: 'groupUuid' },
  { fieldName: t('securityGroup.name'), fieldKey: 'name' },
]

// 地区
const area = ref<{ id: number; locationId: number }>({ id: 1, locationId: 1 })

const paginationConfig = reactive<IPagination>({
  pagination: {
    pageSize: 10,
    page: 1,
  },
  total: 0,
})

const state = reactive<{
  loading: boolean
  list: SecurityGroupListInterface[] // 列表数据
  selectList: SecurityGroupListInterface[] // 选中的
  templateList: TemplateListInterface[]
  areaList: any[]
}>({
  loading: false,
  list: [],
  selectList: [],
  templateList: [{ label: t('securityGroup.custom'), value: 0 }],
  areaList: [],
})

const filterInputRef = ref<InstanceType<typeof FilterInput>>() // 条件筛选框

const setDeleteRef = ref<InstanceType<typeof SetDelete>>() // 删除
const setCloneRef = ref<InstanceType<typeof SetClone>>() // 克隆
const setAddRef = ref<InstanceType<typeof SetAdd>>() // 新增

// 选中当前行/所有行
const handleRowSelectChange = (val: SecurityGroupListInterface[]) => {
  state.selectList = val
}

const changeShow = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 获取地区列表
const getRegionData = list => {
  state.areaList = list
}

// 获取模板列表
const getTemplateListFn = async () => {
  const res = await getTemplateList()
  const arr = (res?.data || []).map(item => ({
    ...item,
    label: item.name,
    value: item.id,
  }))
  state.templateList = [...state.templateList, ...arr]
}

// 获取列表数据
const getList = async (search = filterInputRef.value?.searchParams || {}) => {
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    regionId: area?.value?.id,
    ...search,
  }
  state.loading = true
  try {
    const res = await getListSecurityGroup(params)
    state.loading = false
    if (res.success) {
      state.list = res?.data?.list || []
      paginationConfig.total = res?.data?.recordCnt || 0
    }
  } catch (err) {
    state.loading = false
    console.log('error', err)
  }
}

// 搜索的方法
const searchFn = search => {
  paginationConfig.pagination.page = 1
  getList(search)
}

// 切换地域
const changeArea = area => {
  permConfig.regionId = area.id
  refreshFn()
}

// 刷新的方法
const refreshFn = () => {
  paginationConfig.pagination.page = 1
  ;(filterInputRef.value as InstanceType<typeof FilterInput>).searchList = []
}

// 分页
const paginationChange = () => {
  getList()
}

// 新建/删除成功的回调
const callbackFn = () => {
  paginationConfig.pagination.page = 1
  getList()
}

// 克隆安全组
const cloneFn = (ins: any, row: SecurityGroupListInterface) => {
  ins.cloneData = { ...row }
  ins.show = true
}
// 删除安全组
const deleteFn = (ins: any, row: SecurityGroupListInterface) => {
  ins.show = true
  ins.ids = [row]
}
// 批量删除安全组
const deleteListFn = (ins: any) => {
  if (!state.selectList.length) {
    message.warning(t('securityGroup.selectDeleteSecurityGroup'))
    return
  }
  ins.show = true
  ins.ids = state.selectList
}
// 跳转详情页面
const goDetail = (row: SecurityGroupListInterface, type = 1) => {
  pushRoute({
    name: 'network_security_security_group_detail',
    query: { id: row.id, name: row.name, type, uuid: row.groupUuid },
  })
}

// 下载模板
const exportTemplate = async () => {
  const params = {
    pageIndex: paginationConfig.pagination.page,
    pageSize: paginationConfig.pagination.pageSize,
    regionId: area?.value?.id,
    ...filterInputRef.value?.searchParams,
  }
  // 这里还要添加筛选项
  const blob = await downloadSecurityGroup(params)
  downloadExportFiles(blob, `${t('securityGroup.securityGroup')}.xlsx`)
}

onMounted(async () => {
  useTempStore().setPageHeader(false)
  getTemplateListFn()
})

onUnmounted(() => {
  useTempStore().setPageHeader(true)
})
</script>

<style lang="scss" scoped>
.textOverFlow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}
</style>
