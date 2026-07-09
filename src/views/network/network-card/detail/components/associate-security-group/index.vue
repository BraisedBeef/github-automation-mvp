<template>
  <div class="df">
    <el-card shadow="never" class="page-box flex1" :body-style="bodyStyle">
      <div class="df ac jsb">
        <div class="tit">
          {{ t('networkCard.bindSecurityGroup') }}
        </div>
        <div class="df ac">
          <span
            v-if="props.eniId && checkPermission(permMap.eni.ENI_EDIT_SECURITY_GROUP_SORT)"
            class="text-primary cursor-pointer"
            @click="getSortFn"
            >{{ t('networkCard.sort') }}</span
          >
          <span
            v-if="props.eniId && checkPermission(permMap.eni.ENI_BIND_SECURITY_GROUP)"
            class="text-primary cursor-pointer ml20"
            @click="configFn"
            >{{ t('networkCard.configuration') }}</span
          >
        </div>
      </div>
      <!-- 没排序 -->
      <el-table
        v-if="!state.sortKey"
        v-loading="state.securityGroupLoading"
        :data="state.securityGroupList"
        class="mt20 table"
      >
        <!-- 优先级 -->
        <el-table-column min-width="200" :label="t('networkCard.priority')">
          <template #default="{ $index }">
            <div>{{ $index + 1 }}</div>
          </template>
        </el-table-column>
        <!-- 安全组ID/名称 -->
        <el-table-column min-width="200" :label="t('networkCard.securityGroupIdOrName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-primary cursor-pointer">
                {{ row.sgUuid }}
              </div>
              <div class="text-over">
                {{ row.sgName }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column min-width="140" :label="t('networkCard.operate')">
          <template #default="{ row }">
            <el-tooltip
              v-if="state.securityGroupList.length <= 1 && checkPermission(permMap.eni.ENI_UNBIND_SECURITY_GROUP)"
              effect="light"
              :content="t('networkCard.mustBindOneSecurityGroup')"
            >
              <span class="text-primary disabled-btn">{{ t('networkCard.unbound') }}</span>
            </el-tooltip>
            <span
              v-if="checkPermission(permMap.eni.ENI_UNBIND_SECURITY_GROUP) && state.securityGroupList.length > 1"
              class="text-primary cursor-pointer"
              @click="unbindFn(row)"
              >{{ t('networkCard.unbound') }}</span
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 排序时 -->
      <div v-else>
        <el-table :data="state.securityGroupList" class="mt20 sort-table" row-key="id">
          <el-table-column min-width="48" :label="t('')">
            <div class="handle-move">
              <el-icon><Sort /></el-icon>
            </div>
          </el-table-column>
          <el-table-column min-width="200" :label="t('networkCard.securityGroupIdOrName')">
            <template #default="{ row }">
              <div class="text-primary">
                {{ row.sgUuid }}
              </div>
              <div>{{ row.sgName }}</div>
            </template>
          </el-table-column>
        </el-table>
        <div class="mt20">
          <el-button v-loading="state.sortLoading" type="primary" @click="handleSort">
            {{ t('networkCard.save') }}
          </el-button>
          <el-button v-loading="state.sortLoading" @click="cancleSort">
            {{ t('networkCard.cancel') }}
          </el-button>
        </div>
      </div>
    </el-card>
    <!-- 右边 -->
    <el-card shadow="never" class="page-box flex1 ml20" :body-style="bodyStyle">
      <div class="tit mb20">
        {{ t('networkCard.rulePreview') }}
      </div>
      <BtnsGroup v-model="state.ruleTab" :list="ruleTabList" :style="{ width: '160px' }" />
      <el-collapse v-model="state.collapseItem" accordion class="mt20">
        <el-collapse-item v-for="item in state.securityGroupList" :key="item.sgId" :name="item.sgId">
          <template #title>
            <div class="df ac jsb w-100">
              <div class="df ac ml5">
                <el-icon :class="state.collapseItem === item.sgId ? 'is-reverse' : ''" style="transition: 0.3s">
                  <CaretRight />
                </el-icon>
                <span class="text-primary cursor-pointer ml10">{{ item.sgUuid }}</span>
                <span class="mx10">|</span>
                <span>{{ item.sgName }}</span>
              </div>
              <span
                v-if="
                  state.ruleTab.value === 1
                    ? checkPermission(permMap.eni.ENI_EDIT_SECURITY_GROUP_IN)
                    : checkPermission(permMap.eni.ENI_EDIT_SECURITY_GROUP_OUT)
                "
                class="text-primary cursor-pointer mr10"
                @click="goSecurityGroup(item)"
                >{{ t('networkCard.edit') }}</span
              >
            </div>
          </template>
          <el-table :data="state.ruleTab.value === 1 ? item.ingressRules : item.egressRules" class="mt20 table">
            <!-- 目标 -->
            <el-table-column
              min-width="200"
              :label="state.ruleTab.value === 1 ? t('networkCard.source') : t('networkCard.target')"
            >
              <template #default="{ row }">
                <div v-if="row.type === 2">
                  <div class="text-primary cursor-pointer">
                    {{ row.remoteGroupId }}
                  </div>
                  <div>{{ row.remoteGroupName || '' }}</div>
                </div>
                <div v-else-if="row.type === 3">
                  <div class="text-primary cursor-pointer">
                    {{ row.remoteAddressGroupId }}
                  </div>
                  <div>{{ row.remoteAddressGroupName || '' }}</div>
                </div>
                <div v-else>
                  {{ row.remoteIpPrefix }}
                </div>
              </template>
            </el-table-column>
            <!-- 端口协议 -->
            <el-table-column min-width="200" :label="t('networkCard.portProtocol')">
              <template #default="{ row }">
                <div>{{ row.protocol }}{{ row.multiport && row.multiport !== '' ? `:${row.multiport}` : '' }}</div>
              </template>
            </el-table-column>
            <!-- 策略 -->
            <el-table-column min-width="200" :label="t('networkCard.strategy')">
              <template #default="{ row }">
                <div>{{ actionMap.get(row.action) }}</div>
              </template>
            </el-table-column>
            <!-- 备注 -->
            <el-table-column min-width="200" :label="t('networkCard.notes')" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="table-to_tooltip">
                  <div class="text-over">
                    {{ row.description || '-' }}
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-card>
    <SetSecurityGroup
      ref="setSecurityGroupRef"
      :init-select-list="state.securityGroupIdList"
      @success="getEniRefSgList"
    />
    <CatDialog
      v-model:dialog="state.showUnbind"
      :title="t('networkCard.confirm')"
      :loading="state.unbindLoading"
      @confirm="handleUnbind"
      @close="closeUnbind"
    >
      <p>{{ t('networkCard.confirmUnbindSecurityGroup') }}</p>
    </CatDialog>
  </div>
</template>
<script lang="ts" setup>
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { CaretRight } from '@element-plus/icons-vue'
import { ruleTabList } from '../../config'
import { actionMap } from '../../../../security-group/list/config'
import { getEniRefSg } from '@/apis/network/network-card'
import SetSecurityGroup from '@/views/cvm/ins/list/components/set-security-group/index.vue'
import { eniUpdateSg } from '@/apis/network/network-card'
import { Sort } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'

import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

const cvmStore = useCvmStore()

// 厂商权限配置
const permConfig = reactive({
  moduleId: moduleMap.eni,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

interface PropType {
  eniId: any
}

const props = withDefaults(defineProps<PropType>(), {})

const bodyStyle = { height: '100%' }

const router = useRouter()

const state = reactive<{
  securityGroupList: any[] // 关联安全组列表
  securityGroupIdList: number[] // 关联安全组列表id集合
  securityGroupLoading: boolean
  ruleTab: { label: string; value: number }
  sortKey: boolean // 排序key
  securtyGroupSortList: any[] // 安全组排序列表
  showUnbind: boolean // 解绑安全组弹窗显示key
  unbindId: number // 要解绑的安全组id
  unbindLoading: boolean // 解绑安全组loading
  sortLoading: boolean
  sortTable: any
  collapseItem: string
}>({
  securityGroupList: [],
  securityGroupIdList: [],
  securityGroupLoading: false,
  ruleTab: ruleTabList[0],
  sortKey: false,
  securtyGroupSortList: [],
  showUnbind: false,
  unbindId: NaN,
  unbindLoading: false,
  sortLoading: false,
  sortTable: null,
  collapseItem: '',
})

const setSecurityGroupRef = ref<InstanceType<typeof SetSecurityGroup>>() // 配置关联安全组

// 获取关联安全组
const getEniRefSgList = async () => {
  const params = { eniId: props.eniId }
  state.securityGroupLoading = true
  try {
    const res = await getEniRefSg(params)
    state.securityGroupLoading = false
    if (res.success) {
      state.securityGroupList = res.data || []
      state.securityGroupIdList = state.securityGroupList.map(item => item.sgId)
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.securityGroupLoading = false
    console.log('error', err)
  }
}

// 配置关联安全组
const configFn = () => {
  ;(setSecurityGroupRef.value as InstanceType<typeof SetSecurityGroup>).show = true
  ;(setSecurityGroupRef.value as InstanceType<typeof SetSecurityGroup>).eniId = props.eniId
}

// 开启排序
const getSortFn = () => {
  state.securtyGroupSortList = [...state.securityGroupList]
  state.sortKey = true
  nextTick(() => {
    const el = document.querySelector('.sort-table .el-table__body-wrapper tbody')
    state.sortTable = new Sortable(el, {
      handle: '.handle-move',
      draggable: '.el-table__row',
      onEnd(customEvent) {
        const oldIndex = customEvent.oldIndex
        const newIndex = customEvent.newIndex
        const currRow = state.securtyGroupSortList.splice(oldIndex, 1)[0]
        state.securtyGroupSortList.splice(newIndex, 0, currRow)
      },
    })
  })
}

// 取消排序
const cancleSort = () => {
  state.sortKey = false
  state.securtyGroupSortList = [...state.securityGroupList]
  state.sortTable = null
}

// 保存排序
const handleSort = async () => {
  const params = {
    eniId: props.eniId,
    sgIds: state.securtyGroupSortList.map(item => item.sgId),
  }
  state.sortLoading = true
  try {
    const res = await eniUpdateSg(params)
    state.sortLoading = false
    if (res.success) {
      message.success(t('networkCard.sortSuccess'))
      state.sortKey = false
      getEniRefSgList()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.sortLoading = false
    console.log('error', err)
  }
}

// 解绑安全组
const unbindFn = row => {
  state.unbindId = row.sgId
  state.showUnbind = true
}
// 确认解绑安全组
const handleUnbind = async () => {
  const params = {
    eniId: props.eniId,
    sgIds: state.securityGroupIdList.filter(item => Number(item) !== Number(state.unbindId)),
  }
  state.unbindLoading = true
  try {
    const res = await eniUpdateSg(params)
    state.unbindLoading = false
    if (res.success) {
      message.success(t('networkCard.unbindSuccess'))
      closeUnbind()
      getEniRefSgList()
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.unbindLoading = false
    console.log('error', err)
  }
}
// 取消解绑安全组
const closeUnbind = () => {
  state.unbindId = NaN
  state.showUnbind = false
}

// 跳转安全组规则
const goSecurityGroup = item => {
  pushRoute({
    name: 'network_security_security_group_detail',
    query: { id: item.sgId, name: item.sgName, uuid: item.sgUuid },
  })
}

onBeforeMount(() => {
  if (props.eniId) {
    getEniRefSgList()
  }
})
</script>
<style lang="scss" scoped>
.flex1 {
  flex: 1;
}

.w-100 {
  width: 100%;
}

.mx10 {
  margin: 0 10px;
}

.ml5 {
  margin-left: 5px;
}

.ml10 {
  margin-left: 10px;
}

:deep(.el-collapse-item__header) {
  border-right: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;

  &.is-active {
    border-right: 1px solid #fff;
    border-left: 1px solid #fff;
  }
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

.mr20 {
  margin-right: 20px;
}

.disabled-btn {
  cursor: not-allowed;
  opacity: 0.5;
}

.is-reverse {
  transform: rotateZ(90deg);
}

:deep(.el-collapse-item__arrow) {
  display: none;
}

:deep(.el-collapse-item.is-active .el-collapse-item__wrap) {
  border-bottom: none;
}

:deep(.el-table .el-tooltip) {
  text-overflow: initial;
}
</style>
