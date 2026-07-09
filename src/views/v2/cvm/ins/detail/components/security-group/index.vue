<template>
  <section class="cvm-ins-security-group-v2">
    <section class="cvm-ins-security-group-v2__card cvm-ins-security-group-v2__card--left">
      <div class="cvm-ins-security-group-v2__card-head">
        <h3 class="cvm-ins-security-group-v2__title">
          {{ t('networkCard.bindSecurityGroup') }}
        </h3>
        <div class="cvm-ins-security-group-v2__head-actions">
          <button
            v-if="props.eniId && checkPermission(permMap.eni.ENI_EDIT_SECURITY_GROUP_SORT)"
            class="cvm-ins-security-group-v2__head-link"
            type="button"
            @click="getSortFn"
          >
            {{ t('networkCard.sort') }}
          </button>
          <button
            v-if="props.eniId && checkPermission(permMap.eni.ENI_BIND_SECURITY_GROUP)"
            class="cvm-ins-security-group-v2__head-link"
            type="button"
            @click="configFn"
          >
            {{ t('networkCard.configuration') }}
          </button>
        </div>
      </div>

      <TableV2
        v-if="!state.sortKey"
        v-loading="state.securityGroupLoading"
        :data="state.securityGroupList"
        :show-pagination="false"
        :empty-min-height="240"
      >
        <el-table-column min-width="120" :label="t('networkCard.priority')">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="t('networkCard.securityGroupIdOrName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cvm-ins-security-group-v2__sg-cell">
              <div class="cvm-ins-security-group-v2__sg-link">
                {{ row.sgUuid }}
              </div>
              <div class="cvm-ins-security-group-v2__sg-name">
                {{ row.sgName }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="120" :label="t('networkCard.operate')">
          <template #default="{ row }">
            <el-tooltip
              v-if="state.securityGroupList.length <= 1 && checkPermission(permMap.eni.ENI_UNBIND_SECURITY_GROUP)"
              effect="light"
              :content="t('networkCard.mustBindOneSecurityGroup')"
            >
              <span class="cvm-ins-security-group-v2__link is-disabled">
                {{ t('networkCard.unbound') }}
              </span>
            </el-tooltip>
            <button
              v-if="checkPermission(permMap.eni.ENI_UNBIND_SECURITY_GROUP) && state.securityGroupList.length > 1"
              class="cvm-ins-security-group-v2__link"
              type="button"
              @click="unbindFn(row)"
            >
              {{ t('networkCard.unbound') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>

      <div v-else class="cvm-ins-security-group-v2__sort">
        <TableV2 :data="state.securityGroupList" :show-pagination="false" class="cvm-ins-security-group-v2__sort-table">
          <el-table-column width="56">
            <template #default>
              <button class="cvm-ins-security-group-v2__drag" type="button">
                <el-icon><Sort /></el-icon>
              </button>
            </template>
          </el-table-column>

          <el-table-column min-width="220" :label="t('networkCard.securityGroupIdOrName')">
            <template #default="{ row }">
              <div class="cvm-ins-security-group-v2__sg-cell">
                <div class="cvm-ins-security-group-v2__sg-link">
                  {{ row.sgUuid }}
                </div>
                <div class="cvm-ins-security-group-v2__sg-name">
                  {{ row.sgName }}
                </div>
              </div>
            </template>
          </el-table-column>
        </TableV2>

        <div class="cvm-ins-security-group-v2__sort-actions">
          <el-button v-loading="state.sortLoading" type="primary" @click="handleSort">
            {{ t('networkCard.save') }}
          </el-button>
          <el-button v-loading="state.sortLoading" @click="cancleSort">
            {{ t('networkCard.cancel') }}
          </el-button>
        </div>
      </div>
    </section>

    <section class="cvm-ins-security-group-v2__card cvm-ins-security-group-v2__card--right">
      <h3 class="cvm-ins-security-group-v2__title">
        {{ t('networkCard.rulePreview') }}
      </h3>

      <BtnsGroup v-model="state.ruleTab" :list="ruleTabList" :style="{ width: '160px' }" />

      <div class="cvm-ins-security-group-v2__preview-list">
        <div v-for="item in state.securityGroupList" :key="item.sgId" class="cvm-ins-security-group-v2__preview-item">
          <button class="cvm-ins-security-group-v2__preview-head" type="button" @click="toggleCollapse(item.sgId)">
            <div class="cvm-ins-security-group-v2__preview-head-main">
              <el-icon
                class="cvm-ins-security-group-v2__preview-arrow"
                :class="{ 'is-open': state.collapseItem === item.sgId }"
              >
                <CaretRight />
              </el-icon>
              <span class="cvm-ins-security-group-v2__sg-link">{{ item.sgUuid }}</span>
              <span class="cvm-ins-security-group-v2__separator">|</span>
              <span class="cvm-ins-security-group-v2__sg-name-inline">{{ item.sgName }}</span>
            </div>

            <button
              v-if="
                state.ruleTab.value === 1
                  ? checkPermission(permMap.eni.ENI_EDIT_SECURITY_GROUP_IN)
                  : checkPermission(permMap.eni.ENI_EDIT_SECURITY_GROUP_OUT)
              "
              class="cvm-ins-security-group-v2__head-link"
              type="button"
              @click.stop="goSecurityGroup(item)"
            >
              {{ t('networkCard.edit') }}
            </button>
          </button>

          <div v-if="state.collapseItem === item.sgId" class="cvm-ins-security-group-v2__preview-body">
            <TableV2
              :data="state.ruleTab.value === 1 ? item.ingressRules : item.egressRules"
              :show-pagination="false"
              :empty-min-height="200"
            >
              <el-table-column
                min-width="180"
                :label="state.ruleTab.value === 1 ? t('networkCard.source') : t('networkCard.target')"
              >
                <template #default="{ row }">
                  <div v-if="row.type === 2" class="cvm-ins-security-group-v2__sg-cell">
                    <div class="cvm-ins-security-group-v2__sg-link">
                      {{ row.remoteGroupId }}
                    </div>
                    <div class="cvm-ins-security-group-v2__sg-name">
                      {{ row.remoteGroupName || '' }}
                    </div>
                  </div>
                  <div v-else-if="row.type === 3" class="cvm-ins-security-group-v2__sg-cell">
                    <div class="cvm-ins-security-group-v2__sg-link">
                      {{ row.remoteAddressGroupId }}
                    </div>
                    <div class="cvm-ins-security-group-v2__sg-name">
                      {{ row.remoteAddressGroupName || '' }}
                    </div>
                  </div>
                  <div v-else>
                    {{ row.remoteIpPrefix }}
                  </div>
                </template>
              </el-table-column>

              <el-table-column min-width="160" :label="t('networkCard.portProtocol')">
                <template #default="{ row }">
                  {{ row.protocol }}{{ row.multiport && row.multiport !== '' ? `:${row.multiport}` : '' }}
                </template>
              </el-table-column>

              <el-table-column min-width="120" :label="t('networkCard.strategy')">
                <template #default="{ row }">
                  <span class="cvm-ins-security-group-v2__strategy" :class="{ 'is-allow': row.action === 'allow' }">
                    {{ actionMap.get(row.action) }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column min-width="180" :label="t('networkCard.notes')" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row.description || '-' }}
                </template>
              </el-table-column>
            </TableV2>
          </div>
        </div>
      </div>
    </section>

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
  </section>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { CaretRight, Sort } from '@element-plus/icons-vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { ruleTabList } from '@/views/network/network-card/detail/config'
import { actionMap } from '@/views/network/security-group/list/config'
import { getEniRefSg, eniUpdateSg } from '@/apis/network/network-card'
import SetSecurityGroup from '@/views/cvm/ins/list/components/set-security-group/index.vue'
import Sortable from 'sortablejs'
import { permMap, moduleMap, useCvmAndNetworkPermission } from '@/hooks/permission/use-cvm-and-network-permission'
import { useCvmStore } from '@/store'
import { pushRoute } from '@/utils/router-jump'

interface PropType {
  eniId: any
}

const props = withDefaults(defineProps<PropType>(), {})
const cvmStore = useCvmStore()

const permConfig = reactive({
  moduleId: moduleMap.eni,
  regionId: cvmStore.areaSelect.id,
})
const { checkPermission } = useCvmAndNetworkPermission(permConfig)

const state = reactive<{
  securityGroupList: any[]
  securityGroupIdList: number[]
  securityGroupLoading: boolean
  ruleTab: { label: string; value: number }
  sortKey: boolean
  securtyGroupSortList: any[]
  showUnbind: boolean
  unbindId: number
  unbindLoading: boolean
  sortLoading: boolean
  sortTable: any
  collapseItem: string | number
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

const setSecurityGroupRef = ref<InstanceType<typeof SetSecurityGroup>>()

const getEniRefSgList = async () => {
  state.securityGroupLoading = true
  try {
    const res = await getEniRefSg({ eniId: props.eniId })
    state.securityGroupLoading = false
    if (res.success) {
      state.securityGroupList = res.data || []
      state.securityGroupIdList = state.securityGroupList.map(item => item.sgId)
      if (!state.collapseItem && state.securityGroupList.length) {
        state.collapseItem = state.securityGroupList[0].sgId
      }
    } else {
      message.warning(res.msg)
    }
  } catch (err) {
    state.securityGroupLoading = false
    console.log('error', err)
  }
}

const configFn = () => {
  ;(setSecurityGroupRef.value as InstanceType<typeof SetSecurityGroup>).show = true
  ;(setSecurityGroupRef.value as InstanceType<typeof SetSecurityGroup>).eniId = props.eniId
}

const getSortFn = () => {
  state.securtyGroupSortList = [...state.securityGroupList]
  state.sortKey = true
  nextTick(() => {
    const el = document.querySelector('.cvm-ins-security-group-v2__sort-table .el-table__body-wrapper tbody')
    if (!el) return
    state.sortTable = new Sortable(el, {
      handle: '.cvm-ins-security-group-v2__drag',
      draggable: '.el-table__row',
      onEnd(customEvent) {
        const oldIndex = customEvent.oldIndex
        const newIndex = customEvent.newIndex
        const currRow = state.securtyGroupSortList.splice(oldIndex, 1)[0]
        state.securtyGroupSortList.splice(newIndex, 0, currRow)
        state.securityGroupList = [...state.securtyGroupSortList]
      },
    })
  })
}

const cancleSort = () => {
  state.sortKey = false
  state.securtyGroupSortList = [...state.securityGroupList]
  state.sortTable = null
}

const handleSort = async () => {
  state.sortLoading = true
  try {
    const res = await eniUpdateSg({
      eniId: props.eniId,
      sgIds: state.securtyGroupSortList.map(item => item.sgId),
    })
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

const unbindFn = row => {
  state.unbindId = row.sgId
  state.showUnbind = true
}

const handleUnbind = async () => {
  state.unbindLoading = true
  try {
    const res = await eniUpdateSg({
      eniId: props.eniId,
      sgIds: state.securityGroupIdList.filter(item => Number(item) !== Number(state.unbindId)),
    })
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

const closeUnbind = () => {
  state.unbindId = NaN
  state.showUnbind = false
}

const goSecurityGroup = item => {
  pushRoute({
    name: 'network_security_security_group_detail',
    query: { id: item.sgId, name: item.sgName, uuid: item.sgUuid },
  })
}

const toggleCollapse = (sgId: number) => {
  state.collapseItem = state.collapseItem === sgId ? '' : sgId
}

onBeforeMount(() => {
  if (props.eniId) {
    getEniRefSgList()
  }
})
</script>

<style lang="scss" scoped>
.cvm-ins-security-group-v2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

.cvm-ins-security-group-v2__card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-security-group-v2__card-head {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.cvm-ins-security-group-v2__title {
  margin: 0 0 24px;
  font-size: 18px;
  font-weight: 600;
  line-height: 28px;
  color: #191c23;
}

.cvm-ins-security-group-v2__card-head .cvm-ins-security-group-v2__title {
  margin-bottom: 0;
}

.cvm-ins-security-group-v2__head-actions {
  display: flex;
  gap: 24px;
  align-items: center;
}

.cvm-ins-security-group-v2__head-link,
.cvm-ins-security-group-v2__link {
  padding: 0;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.cvm-ins-security-group-v2__link.is-disabled {
  color: #98a2b3;
  cursor: not-allowed;
}

.cvm-ins-security-group-v2__sg-link {
  color: #06f;
}

.cvm-ins-security-group-v2__sg-name,
.cvm-ins-security-group-v2__sg-name-inline {
  color: #191c23;
}

.cvm-ins-security-group-v2__sg-name {
  margin-top: 4px;
}

.cvm-ins-security-group-v2__sort-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
}

.cvm-ins-security-group-v2__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #98a2b3;
  cursor: move;
  background: transparent;
  border: 0;
}

.cvm-ins-security-group-v2__preview-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.cvm-ins-security-group-v2__preview-item {
  background: #fff;
  border: 1px solid #e8ecf3;
}

.cvm-ins-security-group-v2__preview-head {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 62px;
  padding: 0 16px;
  text-align: left;
  background: #fff;
  border: 0;
}

.cvm-ins-security-group-v2__preview-head-main {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.cvm-ins-security-group-v2__preview-arrow {
  color: #98a2b3;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(90deg);
  }
}

.cvm-ins-security-group-v2__separator {
  color: #98a2b3;
}

.cvm-ins-security-group-v2__preview-body {
  border-top: 1px solid #e8ecf3;
}

.cvm-ins-security-group-v2__strategy {
  color: #ef4444;

  &.is-allow {
    color: #12b76a;
  }
}

@media (width <= 1024px) {
  .cvm-ins-security-group-v2 {
    grid-template-columns: minmax(0, 1fr);
  }

  .cvm-ins-security-group-v2__card {
    padding: 20px;
  }
}

:deep(.btn-wrap .btn:first-child) {
  border-radius: 0 !important;
}

:deep(.btn-wrap .btn:last-child) {
  border-radius: 0 !important;
}
</style>
