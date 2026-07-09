<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('publicIp.bindResources')"
    width="900px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
  >
    <div class="msg mb20">
      {{ t('publicIp.eipBindCloudResources', [eipUuid, eipName]) }}
    </div>
    <div class="mb20">
      <BtnsGroup v-model="state.typeValue" :list="typeList" :style="{ width: '260px' }" @change-value="changeType" />
    </div>
    <!-- CVM实例 -->
    <div v-if="state.typeValue.value === 1">
      <div class="mb9">
        <FilterInput
          ref="filterInputOneRef"
          class="filter-box"
          :placeholder="t('publicIp.searchIns')"
          :filter-list="insFilterList"
          @search="searchFn"
        />
      </div>
      <el-radio-group v-model="state.exampleRadio">
        <el-table
          v-loading="state.exampleLoading"
          v-el-table-infinite-scroll="getPageList"
          :data="state.exampleList"
          class="mt20 table"
          max-height="170"
          :infinite-scroll-disabled="state.exampleIsLoad"
          :row-class-name="setRowClassName"
        >
          <!-- ID/实例名 -->
          <el-table-column min-width="200" :label="t('publicIp.insIdOrName')">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 禁止勾选 -->
                <el-tooltip v-if="row.eip !== ''" effect="light" placement="top">
                  <template #content>
                    <div style="max-width: 310px; word-break: break-word; white-space: normal">
                      <div>{{ t('publicIp.CVMDisableCheckTipTitle') }}</div>
                      <div>{{ t('publicIp.CVMDisableCheckTipContent') }}</div>
                    </div>
                  </template>
                  <el-radio :label="row.insId" :disabled="row.eip !== ''" class="mr12">
                    {{ '' }}
                  </el-radio>
                </el-tooltip>
                <!-- 允许勾选 -->
                <el-radio v-else :label="row.insId" :disabled="row.eip !== ''" class="mr12">
                  {{ '' }}
                </el-radio>
                <div>
                  <div class="text-primary">
                    <Copy :text="row.insUuid" />
                  </div>
                  <div><Copy :text="row.insName" /></div>
                </div>
              </div>
            </template>
          </el-table-column>
          <!-- 可用区 -->
          <el-table-column min-width="140" :label="t('publicIp.zone')">
            <template #default="{ row }">
              <div>{{ row.zoneName }}</div>
            </template>
          </el-table-column>
          <!-- 内网IP -->
          <el-table-column min-width="140" :label="t('publicIp.internalIP')">
            <template #default="{ row }">
              <TableCopy :text="row.privateIp" />
            </template>
          </el-table-column>
          <!-- 已绑定普通公网IP -->
          <el-table-column min-width="260" :label="t('publicIp.alreadyBoundOrdinaryPublicIP')">
            <template #default="{ row }">
              <p>{{ row?.eip ? row.eip : '-' }}</p>
            </template>
          </el-table-column>
        </el-table>
      </el-radio-group>
    </div>
    <!-- 弹性网卡 -->
    <div v-else>
      <div class="mb9">
        <FilterInput
          ref="filterInputTwoRef"
          class="filter-box"
          :placeholder="t('publicIp.searchIdOrName')"
          :filter-list="eniFilterList"
          @search="searchFn"
        />
      </div>
      <el-radio-group v-model="state.networkRadio">
        <el-table
          v-loading="state.networkLoading"
          v-el-table-infinite-scroll="getPageList"
          :data="state.networkList"
          class="mt20 table"
          max-height="170"
          :infinite-scroll-disabled="state.networkIsLoad"
          :row-class-name="setRowClassName"
        >
          <!-- 弹性网卡ID/名称 -->
          <el-table-column min-width="270" :label="t('publicIp.networkCardIdOrName')">
            <template #default="{ row }">
              <div class="df ac">
                <!-- 禁止勾选 -->
                <el-tooltip v-if="row.eip !== ''" effect="light" placement="top">
                  <template #content>
                    <div style="max-width: 310px; word-break: break-word; white-space: normal">
                      <div>{{ t('publicIp.EIPDisableCheckTip') }}</div>
                    </div>
                  </template>
                  <el-radio :label="row.eniId" :disabled="row.eip !== ''" class="mr12">
                    {{ '' }}
                  </el-radio>
                </el-tooltip>
                <!-- 允许勾选 -->
                <el-radio v-else :label="row.eniId" :disabled="row.eip !== ''" class="mr12">
                  {{ '' }}
                </el-radio>
                <div>
                  <div class="text-primary">
                    <Copy :text="row.eniUuid" />
                  </div>
                  <div><Copy :text="row.eniName" /></div>
                </div>
              </div>
            </template>
            <!-- <template #default="{ row }">
              <div class="df ac">
                <el-radio :label="row.eniId" class="mr12">{{ '' }}</el-radio>
                <div>
                  <div class="text-primary">{{ row.eniUuid }}</div>
                  <div>{{ row.eniName }}</div>
                </div>
              </div>
            </template> -->
          </el-table-column>
          <!-- 内网IP -->
          <el-table-column min-width="140" :label="t('publicIp.internalIP')">
            <template #default="{ row }">
              <TableCopy :text="row.privateIp" />
            </template>
          </el-table-column>
          <!-- 已绑定普通公网IP -->
          <el-table-column min-width="220" :label="t('publicIp.alreadyBoundOrdinaryPublicIP')">
            <template #default="{ row }">
              <p>{{ row?.eip ? row.eip : '-' }}</p>
            </template>
          </el-table-column>
        </el-table>
      </el-radio-group>
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { typeList, initPaginationConfig } from './config'
import { PaginationConfigType } from './type'
import { queryBindResourceList, associateEip } from '@/apis/network/public-ip'
import { message } from '@/utils/message'

interface PropType {
  regionId: number
}

const insFilterList = [
  { fieldName: t('privateNetwork.name'), fieldKey: 'insName' },
  { fieldName: 'ID', fieldKey: 'insUuid' },
]
const eniFilterList = [
  { fieldName: t('privateNetwork.name'), fieldKey: 'eniName' },
  { fieldName: 'ID', fieldKey: 'eniUuid' },
]

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const show = ref<boolean>(false) // 弹窗显示
const eipId = ref<number>(NaN) // 公网IP ID
const eipUuid = ref<number>(NaN) // 公网IP ID
const eipName = ref<string>('') // 公网ip名称

const filterInputOneRef = ref<any>()
const filterInputTwoRef = ref<any>()

const state = reactive<{
  comfirmLoading: boolean
  typeValue: { label: string; value: number } // 资源tab
  exampleList: any[] // 实例列表
  exampleLoading: boolean // 获取实例列表loading
  examplePaginationConfig: PaginationConfigType // 实例列表分页数据
  exampleRadio: any
  exampleIsLoad: boolean
  networkList: any[] // / 弹性网卡列表
  networkLoading: boolean // 获取弹性网卡列表loading
  networkPaginationConfig: PaginationConfigType // 弹性网卡分页数据
  networkRadio: any
  networkIsLoad: boolean
}>({
  comfirmLoading: false,
  typeValue: { label: t('publicIp.cvmIns'), value: 1 },
  exampleList: [],
  exampleLoading: false,
  examplePaginationConfig: { ...initPaginationConfig },
  exampleRadio: undefined,
  exampleIsLoad: false,
  networkList: [],
  networkLoading: false,
  networkPaginationConfig: { ...initPaginationConfig },
  networkRadio: undefined,
  networkIsLoad: false,
})

const changeType = (btn: any) => {
  state.typeValue = btn
  state.exampleRadio = undefined
  state.networkRadio = undefined
  state.examplePaginationConfig.pageIndex = 0
  state.networkPaginationConfig.pageIndex = 0
  getList()
}

// 搜索按钮和回车搜索
// 弹窗打开
const searchFn = search => {
  state.examplePaginationConfig.pageIndex = 0
  state.networkPaginationConfig.pageIndex = 0
  getList(search)
}

const getList = async (search = {}) => {
  const params: any = {
    regionId: props.regionId,
    resourceType: state.typeValue.value,
    ...search,
  }
  // CVM实例
  if (state.typeValue.value === 1) {
    state.exampleIsLoad = true
    state.examplePaginationConfig.pageIndex++
    params.pageIndex = state.examplePaginationConfig.pageIndex
    params.pageSize = state.examplePaginationConfig.pageSize
    state.exampleLoading = true
    try {
      const res = await queryBindResourceList(params)
      state.exampleLoading = false
      if (res.success) {
        if (state.examplePaginationConfig.pageIndex === 1) {
          state.exampleList = res.data?.list || []
        } else {
          state.exampleList.push(...(res.data?.list || []))
        }
        state.examplePaginationConfig.total = res.data?.recordCnt
        state.examplePaginationConfig.totalPage = res.data?.pageCnt
        state.exampleIsLoad = state.examplePaginationConfig.pageIndex >= state.examplePaginationConfig.totalPage
      } else {
        message.warning(res.msg)
      }
    } catch (err) {
      state.exampleLoading = false
      console.log('error', err)
    }
  } else {
    state.networkIsLoad = true
    state.networkPaginationConfig.pageIndex++
    params.pageIndex = state.networkPaginationConfig.pageIndex
    params.pageSize = state.networkPaginationConfig.pageSize
    state.networkLoading = true
    try {
      const res = await queryBindResourceList(params)
      state.networkLoading = false
      if (res.success) {
        if (state.networkPaginationConfig.pageIndex === 1) {
          state.networkList = res.data?.list || []
        } else {
          state.networkList.push(...(res.data?.list || []))
        }
        state.networkPaginationConfig.total = res.data?.recordCnt
        state.networkPaginationConfig.totalPage = res.data?.pageCnt
        state.networkIsLoad = state.networkPaginationConfig.pageIndex >= state.networkPaginationConfig.totalPage
      } else {
        message.warning(res.msg)
      }
    } catch (err) {
      state.networkLoading = false
      console.log('error', err)
    }
  }
}

const getPageList = () => {
  const params =
    state.typeValue.value === 1
      ? filterInputOneRef.value?.searchParams || {}
      : filterInputTwoRef.value?.searchParams || {}
  getList(params)
}

const confirmHandle = async () => {
  const params: any = { eipId: eipId.value, instanceType: state.typeValue.value }
  if (state.typeValue.value === 1) {
    if (!state.exampleRadio) {
      return message.warning(t('publicIp.selectBindCvmIns'))
    }
    params.insId = state.exampleRadio
  } else {
    if (!state.networkRadio) {
      return message.warning(t('publicIp.selectBindNetworkCard'))
    }
    params.eniId = state.networkRadio
    // params.privateIpId = state.networkList.find(item => item.eniId === state.networkRadio)?.privateIp;
  }
  state.comfirmLoading = true
  try {
    const res = await associateEip(params)
    if (res.success) {
      message.success(t('publicIp.bindResourceSuccess'))
      state.comfirmLoading = false
      closeFn()
      emits('success')
    } else {
      state.comfirmLoading = false
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
  console.log('params===>', params)
}

// 设置表格行置灰样式
const setRowClassName = rowData => {
  const { row } = rowData
  console.log(row)

  return row.eip !== '' ? 'row-gray' : ''
}

// 弹窗打开
const open = () => {
  state.examplePaginationConfig.pageIndex = 0
  state.networkPaginationConfig.pageIndex = 0
  filterInputOneRef.value.searchList = []
  // getList()
}

const closeFn = () => {
  state.comfirmLoading = false
  state.typeValue = { label: t('publicIp.cvmIns'), value: 1 }
  state.exampleList = []
  state.exampleLoading = false
  state.examplePaginationConfig = { ...initPaginationConfig }
  state.exampleRadio = undefined
  state.exampleIsLoad = false
  state.networkList = []
  state.networkLoading = false
  state.networkPaginationConfig = { ...initPaginationConfig }
  state.networkRadio = undefined
  state.networkIsLoad = false
  show.value = false
}

defineExpose({
  show,
  eipId,
  eipUuid,
  eipName,
})
</script>
<style scoped lang="scss">
.msg {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #555;
}

.mb9 {
  margin-bottom: 9px;
}

.mr12 {
  margin-right: 12px;
}

:deep(.el-radio-group) {
  display: block;
}

:deep(.row-gray) {
  background-color: #f2f2f2;

  div {
    color: #a0a0a0 !important;
  }
}

.filter-box {
  width: 100%;
}
</style>
