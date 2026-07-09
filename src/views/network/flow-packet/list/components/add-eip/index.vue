<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('flowPacket.addEipTwo')"
    width="950px"
    :loading="comfirmLoading"
    :disabled="state.eipList.length === 0"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
    @close="closeFn"
  >
    <div class="p-y-4 df">
      <div class="list-wrap-left mr20">
        <div class="key">
          {{ t('flowPacket.flowPacketLabel') }}
        </div>
        <div class="key lh34 mt20">
          {{ t('flowPacket.eip') }}
        </div>
      </div>
      <div class="list-wrap-right">
        <div class="value">
          {{ detailData.pkgUuid }}
        </div>
        <div class="btn-value mt20">
          {{ t('flowPacket.publicIp') }}
        </div>
      </div>
    </div>
    <div class="mt20">
      <span class="tip-one">{{ t('flowPacket.selectToAddEip') }}</span>
    </div>
    <div class="mt17">
      <div class="mb10">
        <FilterInput
          ref="filterInputRef"
          class="filter-box"
          :placeholder="t('flowPacket.searchEipIdorName')"
          :filter-list="insFilterList"
          @search="searchFn"
        />
      </div>
      <el-table
        v-loading="state.tableLoading"
        v-el-table-infinite-scroll="getPageList"
        :data="state.list"
        max-height="170"
        highlight-current-row
        show-overflow-tooltip
        :infinite-scroll-disabled="state.tableIsLoad"
        @selection-change="handleRowSelectChange"
      >
        <el-table-column type="selection" width="40" />
        <!-- ID/名称 -->
        <el-table-column min-width="240" :label="t('flowPacket.idOrName')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <p class="text-primary">
                {{ row.eipUuid }}
              </p>
              <p class="text-over">
                {{ row.name }}
              </p>
            </div>
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column :label="t('flowPacket.state')" min-width="100">
          <template #default="{ row }">
            <span>{{ typeList.find(item => item.value === row.state)?.label }}</span>
          </template>
        </el-table-column>
        <!-- 公网IP地址 -->
        <el-table-column :label="t('flowPacket.eipAddress')" min-width="160">
          <template #default="{ row }">
            {{ row.eip }}
          </template>
        </el-table-column>
        <!-- 计费模式 -->
        <el-table-column :label="t('flowPacket.chargeType')" min-width="150">
          <template #default="{ row }">
            {{ chargeTypeList.find(item => item.value === row.chargeType)?.label }}
          </template>
        </el-table-column>
        <!-- 带宽上限 -->
        <el-table-column :label="t('flowPacket.maxBandwidth')" min-width="150">
          <template #default="{ row }">
            {{ row.size ? `${row.size} Mbps` : '' }}
          </template>
        </el-table-column>
        <!-- 线路类型 -->
        <el-table-column :label="t('flowPacket.lineType')" min-width="120">
          <template #default="{ row }">
            {{ lineTypeList.find(item => item.value === row.lineType)?.label }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="mt20 select-num-box">
      {{ t('flowPacket.selectedNumberObject', [state.eipList.length]) }}
    </div>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToMany" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { initPaginationConfig } from '../../config'
import { PaginationConfigType } from '../../type'
import { pageEipAllowedShareTrafficPackage, shareTrafficPackageAddEip } from '@/apis/network/flow-packet'
import { typeList, chargeTypeList, lineTypeList } from '@/views/network/public-ip/list/config'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('flowPacket.addEipTipOne'),
    sub: [t('flowPacket.addEipTipTwo'), t('flowPacket.addEipTipThree'), t('flowPacket.addEipTipFour')],
  },
])

const insFilterList = [
  { fieldName: t('flowPacket.name'), fieldKey: 'eipName' },
  { fieldName: 'ID', fieldKey: 'eipUuid' },
]

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const detailData = ref<any>({}) // 流量包

const filterInputRef = ref<any>()

const state = reactive<{
  tableIsLoad: boolean
  list: any[] // eip列表
  tableLoading: boolean
  eipList: number[] | string[] // 选中的eip列表
  paginationConfig: PaginationConfigType
}>({
  tableIsLoad: false,
  list: [],
  tableLoading: false,
  eipList: [],
  paginationConfig: { ...initPaginationConfig },
})

// 获取eip列表
const getEipList = async (search = {}) => {
  const params = {
    pkgId: detailData.value.id,
    pageIndex: state.paginationConfig.pageIndex,
    pageSize: state.paginationConfig.pageSize,
    ...search,
  }
  state.tableLoading = true
  try {
    const res = await pageEipAllowedShareTrafficPackage(params)
    if (res.success) {
      if (state.paginationConfig.pageIndex === 1) {
        state.list = res.data?.list || []
      } else {
        state.list.push(...(res.data?.list || []))
      }
      state.paginationConfig.total = res.data?.recordCnt
      state.paginationConfig.totalPage = res.data?.pageCnt
      state.tableIsLoad = state.paginationConfig.pageIndex >= state.paginationConfig.totalPage
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('err', err)
  } finally {
    state.tableLoading = false
  }
}

// 选择列表数据
const handleRowSelectChange = selection => {
  state.eipList = selection
}

const confirmHandle = async () => {
  if (!state.eipList.length) {
    return message.warning(t('flowPacket.pleaseSelectEip'))
  }
  const params = {
    pkgId: detailData.value.id,
    eipIds: state.eipList.map(item => item.eipId),
  }
  comfirmLoading.value = true
  try {
    const res = await shareTrafficPackageAddEip(params)
    if (res.success) {
      message.success(t('flowPacket.addEipSuccess'))
      closeFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('err', err)
  } finally {
    comfirmLoading.value = false
  }
}

// 分页
const getPageList = () => {
  state.paginationConfig.pageIndex++
  getEipList(filterInputRef.value?.searchParams)
}

// 查询
const searchFn = search => {
  state.paginationConfig.pageIndex = 1
  getEipList(search)
}

const closeFn = () => {
  state.tableIsLoad = false
  state.list = []
  state.tableLoading = false
  state.eipList = []
  state.paginationConfig = { ...initPaginationConfig }
  show.value = false
}

// 弹窗打开
const open = () => {
  filterInputRef.value.searchList = []
}

defineExpose({
  show,
  detailData,
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

.mt17 {
  margin-top: 17px;
}

.mb10 {
  margin-bottom: 10px;
}

.tip-one {
  color: #555;
}

.tip-two {
  margin-left: 10px;
}

.confirm-box {
  font-family: PingFangSC, 'PingFang SC';

  // font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #000;
}

.select-num-box {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: bold;
  line-height: 20px;
  color: #000;
  text-align: left;
}

.table-radio {
  width: 100%;
}

.filter-box {
  width: 100%;
}

.mr20 {
  margin-right: 20px;
}

.key {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  color: #999;
  text-align: left;
}

.lh34 {
  height: 34px;
  line-height: 34px;
}

.value {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  color: #000;
  text-align: left;
}

.btn-value {
  min-width: 90px;
  height: 34px;
  padding: 0 10px;
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 34px;
  color: #fff;
  text-align: center;
  background: #0063ff;
  border-radius: 4px;
}

.p-y-4 {
  padding: 4px 0;
}

//   .checkout-box{
//     width: 16px;
//     height: 16px;
//     border: 1px solid #CCCCCC;
//     box-sizing: border-box;
//     position: relative;
//     border-radius: 100%;
//     &::before{
//         content: '';
//         position: absolute;
//         left: 50%;
//         top: 50%;
//         transform: translate(-50%, -50%);
//         width: 5px;
//         height: 5px;
//         border-radius: 100%;
//         background-color: #fff;
//     }

//     &.active{
//         border-color: #0063FF;
//         background-color: #0063FF;
//     }
//   }
.ml10 {
  margin-left: 10px;
}
</style>
