<template>
  <div>
    <el-card shadow="never" class="page-box" :body-style="bodyStyle">
      <div class="df ac">
        <div class="btn-wrap">
          <el-button
            v-if="checkPermission(permMap.group.ADD_INSTANCE_TO_SECURITY_GROUP)"
            type="primary"
            @click="addAssociation"
          >
            {{ t('securityGroup.addAssociation') }}
          </el-button>
          <el-button
            v-if="checkPermission(permMap.group.REMOVE_INSTANCES_FROM_SECURITY_GROUP_BULK)"
            type=""
            :disabled="state.selectList.length === 0"
            @click="batchRemoval"
          >
            {{ t('securityGroup.batchRemoval') }}
          </el-button>
        </div>
      </div>
      <el-table
        v-loading="state.exampleLoading"
        :data="state.exampleList"
        class="mt20 table"
        @selection-change="handleExampleSelectChange"
      >
        <el-table-column type="selection" width="40" :selectable="selectableFn" />
        <!-- 实例ID/名称 -->
        <el-table-column min-width="200" :label="t('securityGroup.insIdOrName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-primary cursor-pointer">
                <Copy :text="row.insUuid" @handle-click="goExample(row.insId, row.insUuid, row.insName)" />
              </div>
              <div class="text-over">
                {{ row.insName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 所属网络 -->
        <el-table-column min-width="250" :label="t('securityGroup.belongingNetwork')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-primary cursor-pointer text-over" @click="goNetwork(row.vpcId, row.vpcUuid)">
                {{ row.vpcUuid }}
              </div>
              <div class="text-over">
                {{ row.vpcName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 主IP地址 -->
        <el-table-column min-width="200" :label="t('securityGroup.primaryIpAddress')">
          <template #default="{ row }">
            <!-- 内网IP -->
            <div v-if="row.privateIp" class="df ac">
              <Copy :text="row.privateIp || '-'" />&nbsp;({{ t('securityGroup.within') }})
            </div>
            <!-- 外网IP -->
            <div v-if="row.publicIp" class="df ac">
              <Copy :text="row.publicIp || '-'" />&nbsp;({{ t('securityGroup.outside') }})
            </div>
            <div v-if="!row.privateIp && !row.publicIp">-</div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column min-width="150" :label="t('securityGroup.operate')">
          <template #default="{ row }">
            <span
              v-if="checkPermission(permMap.group.REMOVE_INSTANCE_FROM_SECURITY_GROUP_SINGLE)"
              class="text-primary cursor-pointer"
              @click="removeSecurityGroup(row)"
              >{{ t('securityGroup.removeSecurityGroup') }}</span
            >
          </template>
        </el-table-column>
      </el-table>
      <CatPagination
        v-model:pagination="pageConfig.pagination"
        :total="pageConfig.total"
        :custom-keys="['page', 'pageSize']"
        @change="getList"
      />
    </el-card>
    <!-- 新增实例关联 -->
    <SetInstanceAssociation
      ref="setInstanceAssociationRef"
      :init-select-list="state.exampleIdList"
      :detail-id="props.detailId"
      @success="initFn"
    />
    <!-- 移出安全组 -->
    <SetRemoveInstance ref="setRemoveInstanceRef" :detail-id="props.detailId" @success="initFn" />
  </div>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { IPagination } from '@/views/account-system/type'
import SetInstanceAssociation from '../set-instance-association/index.vue'
import SetRemoveInstance from '../set-remove-instance/index.vue'
import { getSecurityGroupInstancesList } from '@/apis/network/security-group'
import { message } from '@/utils/message'

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

interface PropType {
  detailId: number
}

const props = withDefaults(defineProps<PropType>(), {})

const bodyStyle = { height: '100%' }

const router = useRouter()

const state = reactive<{
  exampleList: any[] // 关联实例列表数据
  exampleIdList: any[] // 关联实例id列表
  exampleLoading: boolean
  selectList: any[] // 选中的关联实例列表
}>({
  exampleList: [],
  exampleIdList: [],
  exampleLoading: false,
  selectList: [],
})

const pageConfig = reactive<IPagination>({
  pagination: { pageSize: 10, page: 1 },
  total: 0,
})
// 查询网卡允许绑定的实例列表
const getList = async () => {
  const params = {
    groupId: props.detailId,
    pageSize: pageConfig.pagination.pageSize,
    pageIndex: pageConfig.pagination.page,
  }
  state.exampleLoading = true
  try {
    const res = await getSecurityGroupInstancesList(params)
    state.exampleLoading = false
    if (res.success) {
      state.exampleList = res.data?.list || []
      state.exampleIdList = state.exampleList.map(item => item.insId)
      pageConfig.total = res.data?.recordCnt || 0
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.exampleLoading = false
    console.log('error', err)
  }
}

const setInstanceAssociationRef = ref<InstanceType<typeof SetInstanceAssociation>>() // 新增实例关联
const setRemoveInstanceRef = ref<InstanceType<typeof SetRemoveInstance>>() // 移出安全组

// 新增关联
const addAssociation = () => {
  ;(setInstanceAssociationRef.value as InstanceType<typeof SetInstanceAssociation>).show = true
  ;(setInstanceAssociationRef.value as InstanceType<typeof SetInstanceAssociation>).getList()
}

// 移出安全组
const removeSecurityGroup = row => {
  ;(setRemoveInstanceRef.value as InstanceType<typeof SetRemoveInstance>).show = true
  ;(setRemoveInstanceRef.value as InstanceType<typeof SetRemoveInstance>).instanceList = [row]
}

// 批量移除
const batchRemoval = () => {
  ;(setRemoveInstanceRef.value as InstanceType<typeof SetRemoveInstance>).show = true
  ;(setRemoveInstanceRef.value as InstanceType<typeof SetRemoveInstance>).instanceList = state.selectList
}

const handleExampleSelectChange = val => {
  // 选择表格数据
  state.selectList = val
}

// 判断是否可选
const selectableFn = row => {
  return row.groupCount > 1
}

// 跳转实例详情
const goExample = (id, uuid, name) => {
  pushRoute({
    name: 'ins_detail',
    params: {
      id: uuid,
      uuid,
      name,
    },
  })
}

// 跳转所属网络
const goNetwork = (id, uuid) => {
  pushRoute({
    name: 'network_security_private_network_detail',
    query: { id, uuid },
  })
}

const initFn = () => {
  pageConfig.pagination.page = 1
  state.selectList = []
  state.exampleLoading = true
  setTimeout(() => {
    getList()
  }, 2500)
}

onMounted(() => {
  getList()
})
</script>
<style lang="scss" scoped>
:deep(.el-table__body .el-checkbox .el-checkbox__input.is-disabled .el-checkbox__inner) {
  background-image: none;
}

:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}
</style>
