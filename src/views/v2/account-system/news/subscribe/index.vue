<template>
  <div class="subscribe-v2">
    <PageToolbar :title="t('accountSystemRoutes.subscribe')" @doc="openHelpDoc" />

    <InfoNotice :text="t('subscribe.subscribeTip')" />

    <section class="subscribe-v2__panel">
      <div class="subscribe-v2__actions">
        <el-button
          :type="selectedLeafRows.length ? 'primary' : undefined"
          class="subscribe-v2__batch-button"
          @click="handleBatchEdit"
        >
          {{ t('subscribe.batchEdit') }}
        </el-button>
      </div>

      <TableV2
        v-loading="loading"
        :data="visibleRows"
        grouped
        row-key="id"
        show-overflow-tooltip
        :span-method="tableSpanMethod"
        :row-class-name="getRowClassName"
        @row-click="handleRowClick"
      >
        <el-table-column prop="messageTypeDesc" :label="t('subscribe.productId')" min-width="320">
          <template #header>
            <div class="subscribe-v2__head-name">
              <el-checkbox
                :model-value="isAllLeafSelected"
                :indeterminate="isLeafSelectionIndeterminate"
                @change="toggleSelectAll"
              />
              <span>{{ t('subscribe.productId') }}</span>
            </div>
          </template>
          <template #default="{ row }">
            <div
              class="subscribe-v2__name-cell"
              :class="{
                'subscribe-v2__name-cell--child': isChildRow(row),
              }"
            >
              <button
                class="subscribe-v2__expand-button"
                :class="{ 'is-hidden': !isGroupRow(row) }"
                type="button"
                @click.stop="toggleGroup(row)"
              >
                <SvgIcon
                  name="table-tree-arrow"
                  class="subscribe-v2__expand-icon"
                  :class="{ 'is-expanded': isExpanded(row.id) }"
                />
              </button>
              <el-checkbox
                :model-value="isRowSelected(row)"
                :indeterminate="isGroupIndeterminate(row)"
                @change="value => toggleRowSelected(row, value)"
                @click.stop
              />
              <span>{{ row.messageTypeDesc || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('subscribe.receivingChannels')" min-width="180">
          <template #default="{ row }">
            <span v-if="!isGroupRow(row)">
              {{ formatChannels(row.channels) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column :label="t('subscribe.userName')" min-width="220">
          <template #default="{ row }">
            <span v-if="!isGroupRow(row)">
              {{ formatUserNames(row.userNames) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column :label="t('subscribe.notDisturb')" min-width="160">
          <template #default="{ row }">
            <span v-if="!isGroupRow(row)">
              <el-switch
                :model-value="row.notDisturb == 1"
                @change="value => handleChangeSwitch(row, value)"
                @click.stop
              />
            </span>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.operation')" min-width="140">
          <template #default="{ row }">
            <button
              v-if="!isGroupRow(row)"
              class="subscribe-v2__edit"
              type="button"
              @click.stop="handleSingleEdit(row)"
            >
              {{ t('common.edit') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </section>

    <CatDialog
      v-model:dialog="tgBindDialog.showConfirmBind"
      class="dialog"
      :title="t('subscribe.tgSet')"
      width="600px"
      destroy-on-close
      :loading="tgBindDialog.loading"
      @confirm="tgBindConfirmHandle"
    >
      <el-row class="text mb20">
        {{ t('subscribe.tgSetDesc') }}
      </el-row>
      <el-input v-model="tgBindDialog.targetUid" />
    </CatDialog>

    <CatDialog
      v-model:dialog="tgBindDialog.showEmailVerify"
      class="dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :confirm-text="t('subscribe.know')"
      :no-cancel="true"
      @confirm="tgBindDialog.showEmailVerify = false"
    >
      <el-row class="text">
        {{ t('subscribe.tgBindSuccessDesc') }}
      </el-row>
    </CatDialog>

    <ModifySubDialog
      ref="modifySubDialogRef"
      :type="editDialog.type"
      :not-disturb="editDialog.notDisturb"
      :list="editDialog.list"
      :channels="editDialog.channels"
      @success="getSubscribeManaList()"
    />
  </div>
</template>

<script setup lang="ts">
import { _getSubscribeManaList, _telegramBind, _updateDisturb } from '@/apis/account-system/news'
import type { TelegramBindReq } from '@/apis/account-system/news/type'
import { documentUrl } from '@/config/base-config'
import { useUserStore } from '@/store'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import PageToolbar from '@/views/v2/account-system/components/page-toolbar.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'
import { useTableV2GroupedRows } from '@/views/v2/account-system/components/use-table-v2-grouped-rows'
import ModifySubDialog from '@/views/v2/account-system/news/subscribe/components/modify-sub-dialog-v2.vue'

type SubscribeRow = {
  id: string
  parentId?: string
  rowType?: 'group' | 'child'
  messageTypeDesc?: string
  messageType?: string
  productId?: string
  channels?: string[]
  userNames?: string[]
  users?: Array<{ uid: number }>
  notDisturb?: number
  items?: SubscribeRow[]
  subRows?: SubscribeRow[]
}

const route = useRoute()
const userStore = useUserStore()

const list = ref<SubscribeRow[]>([])
const loading = ref(false)
const timeId = ref<number | null>(null)
const modifySubDialogRef = ref<InstanceType<typeof ModifySubDialog> | null>(null)

const editDialog = reactive<{
  type: string
  notDisturb: boolean
  list: SubscribeRow[]
  channels: string[]
}>({
  type: '',
  notDisturb: true,
  list: [],
  channels: [],
})

const tgBindDialog = reactive<{
  loading: boolean
  showConfirmBind: boolean
  showEmailVerify: boolean
  telegramId: string
  chatId: string
  targetUid: string
}>({
  loading: false,
  showConfirmBind: false,
  showEmailVerify: false,
  telegramId: '',
  chatId: '',
  targetUid: '',
})

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const formatChannels = (channels?: string[]) => {
  return channels?.length ? channels.join('/') : '-'
}

const formatUserNames = (userNames?: string[]) => {
  return userNames?.length ? userNames.join(',') : '-'
}

const normalizeRows = (rows: any[], parentId = ''): SubscribeRow[] => {
  return (rows || []).map((row, index) => {
    const currentId = parentId ? `${parentId}-${index}` : `${index}`
    const { items, children, ...groupRest } = row || {}
    const childRows = (items || children || []).map((child: any, childIndex: number) => {
      const { items: childItems, children: childChildren, ...childRest } = child || {}

      return {
        ...childRest,
        items: childItems,
        id: `${currentId}-${childIndex}`,
        parentId: currentId,
        rowType: 'child' as const,
      }
    })

    return {
      ...groupRest,
      id: currentId,
      rowType: childRows.length ? 'group' : 'child',
      subRows: childRows.length ? childRows : undefined,
    }
  })
}

// This page is the reference example for grouped TableV2 usage:
// - normalize backend tree data into `subRows`
// - let `useTableV2GroupedRows` manage expand/select state
// - keep the first column custom so grouped rows can match Figma precisely
const {
  visibleRows,
  selectedLeafRows,
  isAllLeafSelected,
  isLeafSelectionIndeterminate,
  isGroupRow,
  isChildRow,
  isExpanded,
  isRowSelected,
  isGroupIndeterminate,
  toggleGroup,
  toggleRowSelected,
  toggleSelectAll,
  setExpandedGroupIds,
  resetSelection,
} = useTableV2GroupedRows(list, {
  getChildren: row => row.subRows,
})

const tableSpanMethod = ({ row, columnIndex }) => {
  if (!isGroupRow(row)) {
    return [1, 1]
  }

  if (columnIndex === 0) {
    return [1, 1]
  }

  if (columnIndex === 1) {
    return [1, 4]
  }

  return [0, 0]
}

const getRowClassName = ({ row }) => {
  return isGroupRow(row) ? 'subscribe-v2__row--group' : 'subscribe-v2__row--child'
}

const showDialog = (ins: InstanceType<typeof ModifySubDialog> | null) => {
  if (!ins) return
  ins.show = true
}

const handleRowClick = (row: SubscribeRow) => {
  if (!isGroupRow(row)) return
  toggleGroup(row)
}

const handleSingleEdit = (row: SubscribeRow) => {
  showDialog(modifySubDialogRef.value)
  editDialog.list = [row]
  editDialog.type = 'single'
  editDialog.notDisturb = row.notDisturb == 1
  editDialog.channels = row.channels || []
}

const handleBatchEdit = () => {
  const leafRows = selectedLeafRows.value.filter(row => !isGroupRow(row))

  if (!leafRows.length) {
    message.warning(t('subscribe.productIdWarn'))
    return
  }

  showDialog(modifySubDialogRef.value)
  editDialog.list = leafRows
  editDialog.type = 'batch'
  editDialog.notDisturb = false
  editDialog.channels = ['TG', 'MAIL']
}

const handleChangeSwitch = async (row: SubscribeRow, value: string | number | boolean) => {
  const previousValue = row.notDisturb == 1
  const nextValue = Boolean(value)
  const uids = row.users?.map(item => item.uid) || []

  row.notDisturb = nextValue ? 1 : 0

  try {
    const res = await _updateDisturb({
      productId: row.productId,
      notDisturb: nextValue ? 1 : 0,
      uids,
    })

    if (!res.success) {
      row.notDisturb = previousValue ? 1 : 0
      message.warning(res.msg || t('user.subscribeFail'))
    }
  } catch (error) {
    row.notDisturb = previousValue ? 1 : 0
    console.log(error)
  }
}

const getSubscribeManaList = async () => {
  try {
    loading.value = true
    const res = await _getSubscribeManaList({
      productId: '',
      isSendMsg: false,
    })

    if (res.success) {
      list.value = normalizeRows(res.data || [])
      setExpandedGroupIds(list.value.filter(row => isGroupRow(row)).map(row => row.id))
      resetSelection()
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const telegramBind = async (telegramBindParams: TelegramBindReq) => {
  try {
    tgBindDialog.loading = true
    const res = await _telegramBind(telegramBindParams)
    if (res.success) {
      tgBindDialog.showConfirmBind = false
      tgBindDialog.showEmailVerify = true
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    tgBindDialog.loading = false
  }
}

const tgBindConfirmHandle = () => {
  if (!tgBindDialog.targetUid) {
    message.warning(t('subscribe.tgSetDesc'))
    return
  }

  telegramBind({
    telegramId: tgBindDialog.telegramId,
    chatId: tgBindDialog.chatId,
    targetUid: tgBindDialog.targetUid,
  })
}

watch(
  () => userStore.user,
  value => {
    if (value?.tgAccount) {
      return
    }
  },
)

onMounted(() => {
  getSubscribeManaList()

  const telegramId = route.query.telegramId as string
  const chatId = route.query.chatId as string

  if (telegramId && chatId) {
    if (telegramId !== userStore.user.tgChatId && chatId !== userStore.user.tgAccount) {
      tgBindDialog.telegramId = telegramId
      tgBindDialog.chatId = chatId
      tgBindDialog.showConfirmBind = true
    }
  }
})

onBeforeUnmount(() => {
  if (timeId.value) {
    clearInterval(timeId.value)
  }
})
</script>

<style scoped lang="scss">
.subscribe-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.subscribe-v2__panel {
  padding: 20px;
  background: #fff;
}

.subscribe-v2__actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.subscribe-v2__head-name {
  display: flex;
  gap: 12px;
  align-items: center;
}

.subscribe-v2__batch-button {
  min-width: 86px;
  height: 34px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 400;
  border-radius: 0;
}

.subscribe-v2__edit {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  &:hover {
    color: #3385ff;
  }
}

.subscribe-v2__name-cell {
  display: flex;
  gap: 12px;
  align-items: center;
  height: 100%;
  min-height: 56px;
}

.subscribe-v2__name-cell--child {
  padding-left: 42px;
}

.subscribe-v2__expand-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
  padding: 0;
  color: #191c23;
  cursor: pointer;
  background: transparent;
  border: 0;

  &.is-hidden {
    visibility: hidden;
  }
}

.subscribe-v2__expand-icon {
  width: 6px;
  height: 10px;
  transition: transform 0.2s ease;

  &.is-expanded {
    transform: rotate(90deg);
  }
}

.subscribe-v2__panel :deep(.account-table-v2__table .el-table__header-wrapper th.el-table__cell) {
  padding: 0 16px;
}

.subscribe-v2__panel :deep(.account-table-v2__table .el-table__row) {
  cursor: default;
}

@media (width <= 768px) {
  .subscribe-v2 {
    padding: 12px;
  }

  .subscribe-v2__panel {
    padding: 16px;
  }
}
</style>
