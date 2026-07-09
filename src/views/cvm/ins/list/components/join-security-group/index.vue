<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('securityGroup.joinSecurityGroup')"
    width="760px"
    :loading="comfirmLoading"
    @confirm="confirmHandle"
    @update:dialog="cancel"
    @open="open"
  >
    <p class="df ac jsb mb20">
      <span class="len">{{ t('securityGroup.selectedInsNumber', [insList.length || 0]) }}</span>
      <span class="text-primary close cursor-pointer" @click="isCollapse = !isCollapse">{{
        isCollapse ? t('securityGroup.retract') : t('securityGroup.expand')
      }}</span>
    </p>
    <ElCollapseTransition>
      <div v-show="isCollapse">
        <el-table :data="insList" class="mt20 table">
          <!-- ID/名称 -->
          <el-table-column min-width="200" :label="t('securityGroup.idOrName')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.insUuid }}
              </div>
              <div>{{ row.instanceName }}</div>
            </template>
          </el-table-column>
          <!-- IP地址 -->
          <el-table-column min-width="200" :label="t('securityGroup.ipAddress')">
            <template #default="{ row }">
              <div class="df ac">
                <span>{{ row.specificationInfo?.typeName }}</span>
              </div>
            </template>
          </el-table-column>
          <!-- 网络计费模式/带宽 -->
          <el-table-column min-width="300" :label="t('securityGroup.networkBillingMode')">
            <template #default="{ row }">
              <div style="padding: 14px 0">
                <p>
                  <span class="mr10">{{ row.specificationInfo?.vcpus }}{{ t('securityGroup.pit') }}</span
                  ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                  ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
                </p>
                <p>{{ t('securityGroup.systemDisk') }}{{ handleRowSysDiskName(row) }}</p>
                <p>{{ t('securityGroup.network') }}{{ handleRowVpcName(row) }}</p>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </ElCollapseTransition>

    <div class="search-wrap mt20">
      <p class="desc">
        {{ t('securityGroup.selectCurrentLocationSecurityGroup') }}
      </p>
      <el-input v-model="condition" :placeholder="t('securityGroup.searchSecurityGroupIdOrName')">
        <template #suffix>
          <SvgIcon name="dns-search" class="cursor-pointer" @click="searchSecurityGroupList" />
        </template>
      </el-input>
    </div>

    <el-radio-group v-model="checked" class="table-radio">
      <el-table
        v-loading="loading"
        v-el-table-infinite-scroll="getPageList"
        :data="securityGroupList"
        class="mt20 mb20 table"
        max-height="200"
        :infinite-scroll-disabled="securityGroupIsLoad"
        :row-class-name="tableRowClassName"
      >
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('securityGroup.idOrName')">
          <template #default="{ row }">
            <el-radio :label="row.id" :disabled="row.isDisabled">
              <div class="text-over">{{ row.groupUuid }}/{{ row.name || '-' }}</div>
            </el-radio>
          </template>
        </el-table-column>
        <!-- 备注 -->
        <el-table-column min-width="200" :label="t('securityGroup.remark')">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-radio-group>
    <!-- tip -->
    <Tip :text="tips" type="OneToOne" hide-margin-bottom />
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { useCvmStore } from '@/store'
import { message } from '@/utils/message'
import { ElCollapseTransition } from 'element-plus'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { getListSecurityGroup, securityGroupBindInstance } from '@/apis/network/security-group'
import { initPaginationConfig } from './config'
import { PaginationConfigType } from './type'

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()

const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const isCollapse = ref<boolean>(true) // 是否收起
const checked = ref<number>(NaN)
const condition = ref<string>('') // 查询条件
const securityGroupList = ref<any[]>([]) // 安全组列表
const securityGroupIsLoad = ref<boolean>(true)
const sGPaginationConfig = ref<PaginationConfigType>({ ...initPaginationConfig })
const selectGroupIdList = ref<any[]>([]) // 当前已存在的安全组列表

const tips = computed(() => [
  {
    main: t('securityGroup.joinSecurityGroupTip'),
  },
])

const getSecurityGroupList = async () => {
  const params = {
    pageSize: sGPaginationConfig.value.pageSize,
    pageIndex: sGPaginationConfig.value.pageIndex,
    regionId: cvmStore.areaSelect.id,
    name: condition.value,
  }
  loading.value = true
  try {
    const res = await getListSecurityGroup(params)
    if (res.success) {
      if (sGPaginationConfig.value.pageIndex === 1) {
        securityGroupList.value = (res.data?.list || []).map(item => {
          const isDisabled = selectGroupIdList.value.includes(item.id)
          return { ...item, isDisabled }
        })
      } else {
        securityGroupList.value = [...securityGroupList.value, ...(res.data?.list || [])].map(item => {
          const isDisabled = selectGroupIdList.value.includes(item.id)
          return { ...item, isDisabled }
        })
      }
      sGPaginationConfig.value.totalPage = res.data?.pageCnt || 0
      sGPaginationConfig.value.total = res.data?.recordCnt || 0
      securityGroupIsLoad.value = sGPaginationConfig.value.pageIndex >= sGPaginationConfig.value.totalPage
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    loading.value = false
  }
}

const getPageList = () => {
  sGPaginationConfig.value.pageIndex++
  getSecurityGroupList()
}

const searchSecurityGroupList = () => {
  sGPaginationConfig.value.pageIndex = 1
  getSecurityGroupList()
}

// 设置row类名
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  console.log(row, '333')

  if (row.isDisabled) return 'row-gray' // 禁用样式
}

const confirmHandle = async () => {
  if (!checked.value) {
    return message.warning(t('securityGroup.placeCheckSecurityGroup'))
  }
  const params = { groupId: checked.value, insIds: props.insList.map(item => item.id) }
  comfirmLoading.value = true
  try {
    const res = await securityGroupBindInstance(params)
    if (res.success) {
      message.success(t('securityGroup.joinSecurityGroupSuccess'))
      cancel()
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    console.log('error', err)
  } finally {
    comfirmLoading.value = false
  }
}
// 弹窗打开
const open = () => {
  selectGroupIdList.value = props.insList
    .map(item => item.networkInfos.map(el => el.securityGroups.map(item => item.groupId)).flat())
    .flat()
  getSecurityGroupList()
  console.log(selectGroupIdList.value, 'selectGroupIdList.value ')
}

// 弹窗关闭
const cancel = () => {
  condition.value = ''
  isCollapse.value = true
  checked.value = NaN
  securityGroupList.value = []
  securityGroupIsLoad.value = true
  sGPaginationConfig.value = { ...initPaginationConfig }
  show.value = false
}

// 条件
// watch(condition, () => {})

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.len {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #555;
}

.close {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #0063ff;
}

.search-wrap {
  .desc {
    margin-bottom: 20px;
    font-family: PingFangSC, 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #000;
  }
}

.table-radio {
  width: 100%;
}

:deep(.row-gray) {
  background-color: #f2f2f2;

  div {
    color: #a0a0a0 !important;
  }
}
</style>
