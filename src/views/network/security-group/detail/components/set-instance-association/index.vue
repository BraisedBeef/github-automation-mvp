<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.addInsAssociation')"
    width="1300px"
    :loading="state.comfirmLoading"
    :disabled="state.selectList.length === 0 || isAllDisabled"
    @confirm="confirmHandle"
    @update:dialog="() => {}"
    @open="open"
  >
    <div class="title">
      {{ t('securityGroup.selectBindInsOne') }}<span class="blur"> {{ route.query.name }} </span
      >{{ t('securityGroup.selectBindInsTwo') }}
    </div>
    <div class="mt20">
      <el-row v-loading="state.listLoading" justify="space-between" :gutter="20">
        <!-- 左边 - 待选择 -->
        <el-col :span="12">
          <div>
            <el-input v-model.trim="state.keyword" :placeholder="t('securityGroup.searchInsId')" @keyup.enter="getList">
              <template #suffix>
                <SvgIcon name="dns-search" class="cursor-pointer" @click="getList" />
              </template>
            </el-input>
          </div>
          <!-- 不做分页，滚动展示 -->
          <el-table
            ref="tableLeftRef"
            class="table-box mt20"
            max-height="320px"
            :data="state.exampleList"
            header-row-class-name="header-row"
            :row-class-name="tableRowClassName"
            :header-checkbox-disabled="isAllDisabled"
            @selection-change="handleRowSelectChange"
          >
            <el-table-column type="selection" width="30" :selectable="isRowSelectable" />
            <!-- ID/名称 -->
            <el-table-column prop="roleName" :label="t('securityGroup.idOrName')" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-primary">
                    <Copy :text="row.insUuid" />
                  </div>
                  <div class="text-over">
                    {{ row.instanceName }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 所属网络 -->
            <el-table-column
              prop="network"
              :label="t('securityGroup.belongingNetwork')"
              show-overflow-tooltip
              min-width="120"
            >
              <template #default="{ row }">
                <div v-if="row.vpcInsId || row.vpcName" class="table-td_tooltip">
                  <div class="text-over">
                    {{ row.vpcInsId }}
                  </div>
                  <div class="text-over">
                    {{ row.vpcName }}
                  </div>
                </div>
                <div v-else>-</div>
              </template>
            </el-table-column>
            <!-- 主IP地址 -->
            <el-table-column
              prop="ipArea"
              :label="t('securityGroup.primaryIpAddress')"
              show-overflow-tooltip
              min-width="90"
            >
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div v-if="row.mainPrivateIp" class="text-over">
                    {{ row.mainPrivateIp }}({{ t('securityGroup.within') }})
                  </div>
                  <div v-if="row.mainPublicIp" class="text-over">
                    {{ row.mainPublicIp }}({{ t('securityGroup.outside') }})
                  </div>
                  <div v-if="!row.mainPrivateIp && !row.mainPublicIp">-</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <!-- 右边 - 已选择 -->
        <el-col :span="12" style="margin-top: 54px">
          <!-- 已选择 -->
          <el-table
            class="table-box"
            max-height="320px"
            :data="state.selectList"
            header-row-class-name="header-row"
            :row-class-name="'row'"
          >
            <!-- ID/名称 -->
            <el-table-column prop="roleName" :label="t('securityGroup.idOrName')" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div class="text-primary">
                    {{ row.insUuid }}
                  </div>
                  <div class="text-over">
                    {{ row.instanceName }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <!-- 所属网络 -->
            <el-table-column
              prop="network"
              :label="t('securityGroup.belongingNetwork')"
              show-overflow-tooltip
              min-width="120"
            >
              <template #default="{ row }">
                <div v-if="row.vpcInsId || row.vpcName" class="table-td_tooltip">
                  <div class="text-over">
                    {{ row.vpcInsId }}
                  </div>
                  <div class="text-over">
                    {{ row.vpcName }}
                  </div>
                </div>
                <div v-else>-</div>
              </template>
            </el-table-column>
            <!-- 主IP地址 -->
            <el-table-column
              prop="ipArea"
              :label="t('securityGroup.primaryIpAddress')"
              show-overflow-tooltip
              min-width="90"
            >
              <template #default="{ row }">
                <div class="table-td_tooltip">
                  <div v-if="row.mainPrivateIp" class="text-over">
                    {{ row.mainPrivateIp }}({{ t('securityGroup.within') }})
                  </div>
                  <div v-if="row.mainPublicIp" class="text-over">
                    {{ row.mainPublicIp }}({{ t('securityGroup.outside') }})
                  </div>
                  <div v-if="!row.mainPrivateIp && !row.mainPublicIp">-</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="number" width="60" :label="t('securityGroup.operate')">
              <template #header>
                <EllipsisTooltip class="operate-header-tooltip" :text="t('securityGroup.operate')" />
              </template>
              <template #default="{ row }">
                <!-- 删除 -->
                <el-icon @click="deleteSelectRowList(row)">
                  <CircleCloseFilled />
                </el-icon>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </div>
    <div class="mt20">
      <!-- tip -->
      <Tip :text="tips" type="OneToMany" hide-margin-bottom />
    </div>
  </CatDialog>
</template>
<script setup lang="ts">
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { _listInstance } from '@/apis/cvm/ins'
import { message } from '@/utils/message'
import { securityGroupBindInstance } from '@/apis/network/security-group'
import EllipsisTooltip from '@/components/common/ellipsis-tooltip/index.vue'

interface PropType {
  initSelectList: any[]
  detailId: number
}

const props = withDefaults(defineProps<PropType>(), {})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const tips = computed(() => [
  {
    main: t('securityGroup.addInsAssociationMain') + t('securityGroup.addInsAssociationSub'),
    sub: [],
  },
])

const route = useRoute()

const cvmStore = useCvmStore()

const show = ref<boolean>(false) // 弹窗显示

const state = reactive<{
  comfirmLoading: boolean
  keyword: string // 搜索安全组ID/名称
  listLoading: boolean // 获取实例列表loading
  exampleList: any[] // 实例列表
  selectList: any[] // 选中列表
}>({
  comfirmLoading: false,
  keyword: '',
  listLoading: false,
  exampleList: [],
  selectList: [],
})

const tableLeftRef = ref<any>()

// 获取实例列表
const getList = async () => {
  const params: any = {
    regionId: cvmStore.areaSelect.id,
    pageIndex: 1,
    pageSize: 999,
  }
  if (state.keyword && state.keyword !== '') {
    params.instanceId = state.keyword
  }
  state.listLoading = true
  try {
    const res = await _listInstance(params)
    state.listLoading = false
    if (res.success) {
      console.log('res.data?.list', res.data?.list, props.initSelectList)
      state.exampleList = (res.data?.list || [])
        // .filter(item => {
        //   return props.initSelectList.findIndex(i => i === item.id) < 0
        // })
        .map(item => {
          const networkInfo = (item?.networkInfos || []).find(val => val.primaryType === 1)
          let isDisabled = false
          if (props.initSelectList?.findIndex(i => i === item.id) >= 0) {
            isDisabled = true
          }
          return {
            ...item,
            isDisabled,
            vpcId: networkInfo?.vpcId,
            vpcInsId: networkInfo?.vpcInsId,
            vpcName: networkInfo?.vpcName,
            mainPublicIp: networkInfo?.mainPublicIp,
            mainPrivateIp: networkInfo?.mainPrivateIp,
          }
        })
      state.selectList = state.exampleList.filter(item => props.initSelectList.findIndex(val => val === item.id) >= 0)
      console.log(state.exampleList, 'state.exampleList ')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.listLoading = false
    console.log('error', err)
  }
}
// 根据行数据中的 isDisabled 字段决定是否禁用选择
const isRowSelectable = row => {
  return !row.isDisabled
}

const isAllDisabled = computed(() => {
  // 检查是否所有行都不可选
  return state.exampleList.every(row => row.isDisabled)
})
// 设置row类名
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  if (row.isDisabled) return 'row-gray' // 禁用样式
  return state.selectList.includes(row) ? 'select-row row' : 'row'
}
// table left 选中当前行/所有行
const handleRowSelectChange = (selection: any) => {
  console.log(`handleRowSelectChange===>`, selection)
  state.selectList = selection
}

// table right 删除当前行
const deleteSelectRowList = (row: any) => {
  console.log(`deleteSelectRowList===>`, row)

  const i = state.selectList.findIndex(el => el.id === row.id)

  console.log(`deleteSelectRowList===>`, i)

  // 删除右边勾选
  if (i !== -1) {
    // console.log(`i===>`, i);

    state.selectList.splice(i, 1)
  }
  // 删除table left 勾选
  tableLeftRef.value?.toggleRowSelection(row)
}

const confirmHandle = async () => {
  const params = {
    groupId: props.detailId,
    insIds: state.selectList.map(item => item.id),
  }
  state.comfirmLoading = true
  try {
    const res = await securityGroupBindInstance(params)
    state.comfirmLoading = false
    if (res.success) {
      message.success(t('securityGroup.bindInsSuccess'))
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

// 关闭弹窗
const closeFn = () => {
  state.keyword = ''
  state.listLoading = false
  state.exampleList = []
  state.selectList = []
  show.value = false
}

// 弹窗打开
const open = () => {}

defineExpose({
  show,
  getList,
})
</script>
<style scoped lang="scss">
.title {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #000;
}

.blur {
  color: var(--active-text);
}

// 选中row
.select-row {
  td {
    .cell {
      color: var(--primary-color);

      /* background: var(--el-table-current-row-bg-color); */
      background: var(--selected-bgc) !important;
    }
  }
}

.table-box {
  border: 1px solid #ddd;
  border-radius: 4px;
}

:deep(.el-table thead .el-table__cell .cell) {
  padding-left: 10px;
}

:deep(.el-table tbody .el-table__cell .cell) {
  padding-left: 10px;
}

:deep(.row-gray) {
  background-color: #f2f2f2;

  div {
    color: #a0a0a0 !important;
  }
}
</style>
