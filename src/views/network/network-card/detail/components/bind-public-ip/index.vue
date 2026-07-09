<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.bindPublicIp')"
    width="660px"
    :loading="state.comfirmLoading"
    :disabled="!state.eipId"
    @confirm="confirmHandle"
    @close="closeFn"
    @open="openFn"
  >
    <div>
      <div>{{ t('networkCard.selectBindPublicIp', [detail.ip]) }}</div>
      <div class="df ac jsb">
        <div>
          <span>{{ t('networkCard.youCanSelectHavePublicIp') }}</span>
          <span class="ml10 text-primary cursor-pointer" @click="addEip">{{ t('networkCard.add') }}</span>
        </div>
        <span class="text-primary cursor-pointer" @click="searchFn">{{ t('networkCard.refresh') }}</span>
      </div>
    </div>
    <div class="mt20">
      <div class="mb10">
        <el-input v-model="state.condition" :placeholder="t('networkCard.searchPlaceholder')" @keyup.enter="searchFn">
          <template #suffix>
            <SvgIcon name="dns-search" class="cursor-pointer" @click="searchFn" />
          </template>
        </el-input>
      </div>
      <el-radio-group v-model="state.eipId" class="table-radio">
        <el-table
          v-loading="state.tableLoading"
          v-el-table-infinite-scroll="getList"
          :data="state.list"
          max-height="170"
          style="overflow-y: auto"
          highlight-current-row
          :infinite-scroll-disabled="state.tableIsLoad"
          :row-class-name="setRowClassName"
        >
          <!-- ID/名称 -->
          <el-table-column min-width="100" :label="t('networkCard.idOrName')">
            <template #default="{ row }">
              <el-radio :label="row.eipId" :disabled="row.state !== 2">
                <div class="text-primary">
                  {{ row.eipUuid }}
                </div>
                <div>
                  <Copy :text="row.name" />
                </div>
              </el-radio>
            </template>
          </el-table-column>
          <!-- 弹性公网IP -->
          <el-table-column :label="t('networkCard.publicIp')">
            <template #default="{ row }">
              <div>{{ row.eip }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-radio-group>
    </div>
  </CatDialog>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { getIpGroupList, associateEip } from '@/apis/network/public-ip'
import { message } from '@/utils/message'
import { initPaginationConfig } from '../../config'
import { PaginationConfigType } from '../../type'

interface PropType {
  eniId: any
}

const props = withDefaults(defineProps<PropType>(), {})

const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const router = useRouter()

const show = ref<boolean>(false) // 弹窗显示
const detail = ref<any>({}) // 内网ip详情

const state = reactive<{
  comfirmLoading: boolean
  condition: string // 关键字
  list: any[]
  tableLoading: boolean
  eipId: number
  tableIsLoad: boolean
  paginationConfig: PaginationConfigType
}>({
  comfirmLoading: false,
  condition: '',
  list: [],
  tableLoading: false,
  eipId: NaN,
  tableIsLoad: true,
  paginationConfig: { ...initPaginationConfig },
})

// 设置表格行置灰样式
const setRowClassName = rowData => {
  const { row } = rowData
  return row.state !== 2 ? 'row-gray' : ''
}

const getList = async (isOpen?: boolean) => {
  state.paginationConfig.pageIndex++
  if (isOpen) state.paginationConfig.pageIndex = 1
  const params: any = {
    regionId: cvmStore.areaSelect.id,
    pageSize: state.paginationConfig.pageSize,
    pageIndex: state.paginationConfig.pageIndex,
  }
  if (state.condition !== '') {
    params.name = state.condition
  }
  state.tableLoading = true
  try {
    const res = await getIpGroupList(params)
    if (res.success) {
      if (state.paginationConfig.pageIndex === 1 || isOpen) {
        state.list = res.data?.list || []
      } else {
        state.list.push(...(res.data?.list || []))
      }
      state.paginationConfig.total = res.data?.recordCnt
      state.paginationConfig.totalPage = res.data?.pageCnt
      state.tableIsLoad = state.paginationConfig.pageIndex >= state.paginationConfig.totalPage
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    state.tableLoading = false
  }
}

const searchFn = () => {
  state.eipId = NaN
  state.paginationConfig.pageIndex = 0
  getList()
}

const confirmHandle = async () => {
  if (state.eipId) {
    const params = {
      eipId: state.eipId,
      instanceType: 2,
      eniId: props.eniId,
      privateIpId: detail.value.id || detail.value.internalIpId,
    }
    state.comfirmLoading = true
    try {
      const res = await associateEip(params)
      if (res.success) {
        message.success(t('networkCard.bindPublicIpSuccess'))
        closeFn()
        emits('success')
      } else {
        message.warning(res.msg)
      }
    } catch (err) {
      console.log('error', err)
    } finally {
      state.comfirmLoading = false
    }
  }
}

const addEip = () => {
  const url = router.resolve({
    name: 'network_security_public_ip_list',
  })
  window.open(url.href, '_blank')
}

const closeFn = () => {
  state.condition = ''
  state.list = []
  state.tableLoading = false
  state.eipId = NaN
  show.value = false
  state.tableIsLoad = false
  state.paginationConfig = { ...initPaginationConfig }
}

const openFn = () => {
  getList(true)
}

defineExpose({
  show,
  detail,
})
</script>
<style lang="scss" scoped>
.table-radio {
  width: 100%;
}

.ml10 {
  margin-left: 10px;
}

:deep(.el-table .el-scrollbar__wrap) {
  height: auto !important;
}

:deep(.row-gray) {
  background-color: #f2f2f2;

  div {
    color: #a0a0a0 !important;
  }
}
</style>
