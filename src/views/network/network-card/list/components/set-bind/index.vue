<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('networkCard.bindIns')"
    width="1080px"
    :loading="state.comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
    @close="closeFn"
  >
    <div class="df ac jsb">
      <div>
        <span class="tip-one">{{
          t('networkCard.selectNetworkCardBindIns', [state.detail?.eniName || '', state.detail?.ipNums || '0'])
        }}</span>
        <span class="tip-two">{{
          t('networkCard.screenIns', [state.detail?.vpcName || '', state.detail?.zoneName || ''])
        }}</span>
      </div>
      <span class="text-primary close cursor-pointer" @click="state.isCollapse = !state.isCollapse">{{
        state.isCollapse ? t('networkCard.retract') : t('networkCard.expand')
      }}</span>
    </div>
    <el-collapse-transition>
      <div v-show="state.isCollapse" class="mt20">
        <div class="mb10">
          <!-- <el-input v-model="state.condition" :placeholder="t('networkCard.searchPlaceholder')" @keyup.enter="searchFn">
            <template #suffix>
            <SvgIcon name="dns-search" class="cursor-pointer" @click="searchFn" />
          </template>
          </el-input> -->
          <FilterInput
            ref="filterInputRef"
            class="filter-box"
            :placeholder="t('publicIp.searchIdOrName')"
            :filter-list="insFilterList"
            @search="searchFn"
          />
        </div>
        <el-radio-group v-model="state.insId" class="table-radio">
          <el-table
            v-loading="state.tableLoading"
            :data="state.list"
            max-height="170"
            highlight-current-row
            show-overflow-tooltip
          >
            <!-- 主机ID/名称 -->
            <el-table-column min-width="120" :label="t('networkCard.hostIdOrName')">
              <template #default="{ row }">
                <el-radio :label="row.insId">
                  <div class="text-over">
                    <span class="text-primary">{{ row.insUuid }}</span>
                    <span>/{{ row.insName }}</span>
                  </div>
                </el-radio>
              </template>
            </el-table-column>
            <!-- 所在子网ID/名称 -->
            <el-table-column :label="t('networkCard.subnetIdOrName')" min-width="120">
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-over">
                    {{ row.subnetUuid }}
                  </div>
                  <div class="text-over">
                    {{ row.subnetName }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 机型 -->
            <el-table-column :label="t('networkCard.model')" min-width="80">
              <template #default="{ row }">
                {{ row.insSpecificationName }}
              </template>
            </el-table-column>
            <!-- 网卡配额 -->
            <el-table-column :label="t('networkCard.networkCardQuota')" min-width="150">
              <template #default="{ row }">
                {{ row.insEniLimit }}
              </template>
            </el-table-column>
            <!-- 单网卡内网IP配额 -->
            <el-table-column :label="t('networkCard.networkCardIpQuota')" min-width="190">
              <template #default="{ row }">
                {{ row.eniIpLimit }}
              </template>
            </el-table-column>
          </el-table>
        </el-radio-group>
      </div>
    </el-collapse-transition>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToOne" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { getEniBindInsList, eniBindVm } from '@/apis/network/network-card'
import { message } from '@/utils/message'

const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('networkCard.networkCardTip'),
  },
])

const insFilterList = [
  { fieldName: t('privateNetwork.name'), fieldKey: 'insName' },
  { fieldName: 'ID', fieldKey: 'insUuid' },
]

const show = ref<boolean>(false) // 弹窗显示
const eniId = ref<number>(NaN) // 弹性网卡id

const filterInputRef = ref<any>()

const state = reactive<{
  comfirmLoading: boolean
  detail: any
  list: any[] // 云服务器列表
  tableLoading: boolean
  isCollapse: boolean // 是否收起
  condition: string
  insId: number
}>({
  comfirmLoading: false,
  detail: {},
  list: [],
  tableLoading: false,
  isCollapse: true,
  condition: '',
  insId: NaN,
})

// 获取云服务器列表
const getInsList = async (search = {}) => {
  const params = {
    eniId: eniId.value,
    ...search,
  }
  state.tableLoading = true
  try {
    const res = await getEniBindInsList(params)
    state.tableLoading = false
    if (res.success) {
      state.detail = res.data
      state.list = res.data?.insList || []
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.tableLoading = false
    console.log('error', err)
  }
}

const confirmHandle = async () => {
  if (!state.insId) {
    message.warning(t('networkCard.selectBindServe'))
    return
  }
  const params = { eniId: eniId.value, insId: state.insId }
  state.comfirmLoading = true
  try {
    const res = await eniBindVm(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('networkCard.bindInsSuccess'))
      closeFn()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.comfirmLoading = false
    console.log('error', err)
  }
}
// 查询
const searchFn = search => {
  getInsList(search)
}

const closeFn = () => {
  state.comfirmLoading = false
  state.detail = {}
  state.list = []
  state.tableLoading = false
  state.isCollapse = true
  state.condition = ''
  state.insId = NaN
  show.value = false
}

// 弹窗打开
const open = () => {
  filterInputRef.value.searchList = []
}

defineExpose({
  show,
  eniId,
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

.table-radio {
  width: 100%;
}

.filter-box {
  width: 100%;
}
</style>
