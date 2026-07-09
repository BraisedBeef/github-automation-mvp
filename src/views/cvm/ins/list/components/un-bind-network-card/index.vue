<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.unbindNetworkCard')"
    width="700px"
    :disabled="!state.checked"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @open="open"
    @close="closeFn"
    @cancel="cancelFn"
  >
    <div>
      <div v-if="state.key === 1">
        <div class="mb20">
          {{ t('networkCard.placeSelectUnbindNetworkCard') }}
        </div>
        <!-- <el-input v-model="state.search" :placeholder="t('networkCard.searchIdOrName')" class="mt20" /> -->
        <FilterInput
          ref="filterInputTwoRef"
          class="filter-box"
          :placeholder="t('publicIp.searchIdOrName')"
          :filter-list="eniFilterList"
          @search="searchFn"
        />
        <!--  -->
        <el-radio-group v-model="state.checked" class="radio-table" @change="changeRadio">
          <el-table
            :data="Object.keys(state.searchObj)?.length > 0 ? state.searchData : state.list"
            class="mt20 table"
            show-overflow-tooltip
            :row-class-name="setRowClassName"
          >
            <!-- 名称 -->
            <el-table-column min-width="200" :label="t('networkCard.name')">
              <template #default="{ row }">
                <el-radio :label="row.eniId" :disabled="row.primaryType === 1">
                  <div>{{ row.eniUuid }}</div>
                  <div>{{ row.eniName }}</div>
                </el-radio>
              </template>
            </el-table-column>
            <!-- 所属子网 -->
            <el-table-column min-width="120" :label="t('networkCard.belongingSubnet')">
              <template #default="{ row }">
                <span>{{ row.subNetworkInsId }}</span>
              </template>
            </el-table-column>
            <!-- 网卡内网IP数 -->
            <el-table-column min-width="200" :label="t('networkCard.networkCardIpNumber')">
              <template #default="{ row }">
                <!-- 只有一个内网IP，直接显示 -->
                <TableCopy v-if="row?.eips?.length === 1" :text="row.eips[0]?.internalIp || '-'" />
                <!-- 含有多个内网IP显示数量，悬浮气泡显示所有IP -->
                <el-tooltip v-else-if="row?.eips?.length > 1" effect="light" placement="right">
                  <template #content>
                    <div v-for="(item, index) in row?.eips" :key="index">
                      <Copy :text="item?.internalIp || '-'" />
                    </div>
                  </template>
                  <span class="text-primary" style="cursor: pointer">{{ row.eips.length || '-' }}</span>
                </el-tooltip>
                <div v-else>0</div>
              </template>
            </el-table-column>
          </el-table>
        </el-radio-group>
      </div>
      <div v-else class="desc-wrap">
        <div class="item df ac mb20">
          <div class="key">
            {{ t('networkCard.networkCardIdOrName') }}
          </div>
          <div class="value">{{ state.selectItem?.eniId }}({{ state.selectItem?.eniName }})</div>
        </div>
        <div class="item df ac">
          <div class="key">
            {{ t('networkCard.insId') }}
          </div>
          <div class="value">
            {{ insDetail.id }}
          </div>
        </div>
      </div>
      <!-- tip -->
      <div class="mt20">
        <Tip :text="tips" type="OneToOne" hide-margin-bottom />
      </div>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { eniUnbindVm } from '@/apis/network/network-card'

interface PropType {
  insDetail: any
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('networkCard.unbindNetworkCardMsg'),
  },
])

const show = ref<boolean>(false) // 弹窗显示
const state = reactive<{
  comfirmLoading: boolean
  list: any[] // 可以解绑的弹性网卡列表
  search: string // 弹性网卡列表筛选值
  checked: number // 选中的弹性网卡id
  selectItem: any // 选中的弹性网卡信息
  key: number // 当前显示的内容
  searchObj: { [x: string]: any }
  searchData: any[]
}>({
  comfirmLoading: false,
  list: [],
  search: '',
  checked: NaN,
  selectItem: {},
  key: 1,
  searchObj: {},
  searchData: [],
})

const eniFilterList = [
  { fieldName: 'ID', fieldKey: 'eniUuid' },
  { fieldName: t('privateNetwork.name'), fieldKey: 'eniName' },
]

const searchFn = data => {
  state.searchObj = data || {} // 搜索条件集合
  const keys = Object.keys(data)
  const values = Object.values(data)
  if (!keys.length) return (state.searchData = [])
  state.searchData =
    state.list?.filter(item => {
      return keys.every((i, v) => item[i].indexOf(values[v]) >= 0)
    }) || []
  state.checked = NaN // 筛选的同时删除当前check
}

const changeRadio = val => {
  state.selectItem = state.list.find(item => item.eniId === val)
}

const confirmHandle = async () => {
  if (!state.checked) return message.warning(t('networkCard.placeSelectUnbindNetworkCard'))
  if (state.key === 1) {
    state.key = 2
  } else {
    console.log('eniId===>', state.checked)
    const params = { insId: props.insDetail.id, eniId: state.checked }
    state.comfirmLoading = true
    try {
      const res = await eniUnbindVm(params)
      if (res.success) {
        message.success(t('networkCard.unbindNetworkCardSuccess'))
        initFn()
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

// 设置表格行置灰样式（主网卡只做展示并禁用，只能操作附属网卡）
const setRowClassName = rowData => {
  console.log(rowData)

  const { row } = rowData
  return row.primaryType === 1 ? 'row-gray' : ''
}
// 弹窗打开
const open = () => {
  // 解绑弹性网卡区分主网卡和辅助网卡，只能解绑辅助网卡
  state.list = props.insDetail?.networkInfos || []
}

const initFn = () => {
  state.key = 1
  state.comfirmLoading = false
  state.list = []
  state.search = ''
  state.checked = NaN
  state.selectItem = {}
  show.value = false
  state.searchData = []
}

const cancelFn = () => {
  closeFn(true)
}

const closeFn = key => {
  if (state.key === 1 || key) {
    initFn()
  } else {
    state.key = 1
    show.value = true
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.desc-wrap {
  .key {
    width: 105px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #999;
  }

  .value {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    color: #000;
  }
}

.radio-table {
  width: 100%;
}

:deep(.row-gray) {
  background-color: #f2f2f2;

  div,
  span {
    color: #a0a0a0 !important;
  }
}
</style>
