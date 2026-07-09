<template>
  <CatDialog
    v-model:dialog="show"
    class="subscribe-edit-v2-dialog"
    :title="t('subscribe.subscribeEdit')"
    width="880px"
    destroy-on-close
    :loading="editDialog.loading"
    footer-align="end"
    @confirm="confirmHandle"
    @update:dialog="closeHandle"
    @open="open"
  >
    <div class="subscribe-edit-v2">
      <div class="subscribe-edit-v2__body">
        <div class="subscribe-edit-v2__section">
          <div class="subscribe-edit-v2__label" :class="labelWidthClass">
            {{ t('subscribe.productId') }}
          </div>
          <div class="subscribe-edit-v2__content">
            <div class="subscribe-edit-v2__product">
              {{ productIds.join('，') }}
            </div>
          </div>
        </div>

        <div class="subscribe-edit-v2__section">
          <div class="subscribe-edit-v2__label" :class="labelWidthClass">
            {{ t('subscribe.receivingMode') }}
          </div>
          <div class="subscribe-edit-v2__content subscribe-edit-v2__content--stack">
            <div class="subscribe-edit-v2__switch-line">
              <el-switch v-model="editDialog.notDisturb" />
              <span class="subscribe-edit-v2__switch-text">{{ t('subscribe.notDisturbCheck') }}</span>
            </div>
            <p class="subscribe-edit-v2__desc">
              {{ t('subscribe.notDisturbDesc') }}
            </p>
          </div>
        </div>

        <div class="subscribe-edit-v2__section">
          <div class="subscribe-edit-v2__label" :class="labelWidthClass">
            {{ t('subscribe.receivingChannels') }}
          </div>
          <div class="subscribe-edit-v2__content">
            <div class="subscribe-edit-v2__channels">
              <el-checkbox-group v-model="editDialog.channels">
                <el-checkbox :label="'MAIL'">
                  {{ RECEIVING_CHANNELS_MAP.MAIL }}
                </el-checkbox>
                <el-checkbox :label="'TG'">
                  {{ RECEIVING_CHANNELS_MAP.TG }}
                </el-checkbox>
              </el-checkbox-group>

              <button
                v-if="editDialog.channels.includes('TG')"
                class="subscribe-edit-v2__contact-link"
                type="button"
                @click="pushRoute({ name: 'access_user_list' })"
              >
                <span>{{ t('subscribe.modifyUser') }}</span>
                <SvgIcon name="share" />
              </button>
            </div>
          </div>
        </div>

        <div class="subscribe-edit-v2__section subscribe-edit-v2__section--table">
          <div class="subscribe-edit-v2__label" :class="labelWidthClass">
            {{ t('user.messageRecipient') }}
          </div>
          <div class="subscribe-edit-v2__content subscribe-edit-v2__content--full">
            <TableV2
              ref="tableRef"
              max-height="284"
              :data="users"
              class="subscribe-edit-v2__table"
              show-overflow-tooltip
              @selection-change="v => (editDialog.selectUserList = v)"
            >
              <el-table-column type="selection" width="56" />

              <el-table-column prop="userName" :label="t('user.userName')" min-width="164">
                <template #default="{ row }">
                  {{ row.userName || '-' }}
                </template>
              </el-table-column>

              <el-table-column prop="accountType" :label="t('user.accountType')" min-width="164">
                <template #default="{ row }">
                  <span>{{ formatAccountType(row) }}</span>
                </template>
              </el-table-column>

              <el-table-column prop="mobile" :label="t('subscribe.phone')" min-width="164">
                <template #default="{ row }">
                  <div class="subscribe-edit-v2__status-cell" :class="{ 'is-empty': !getPhoneValue(row) }">
                    <SvgIcon :name="getPhoneValue(row) ? 'cat-message-success' : 'cat-message-warning'" />
                    <span>{{ getPhoneValue(row) || t('subscribe.noSet') }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="email" :label="t('user.email')" min-width="194">
                <template #default="{ row }">
                  <div class="subscribe-edit-v2__status-cell" :class="{ 'is-empty': !row.contactEmail }">
                    <SvgIcon :name="row.contactEmail ? 'cat-message-success' : 'cat-message-warning'" />
                    <span>{{ row.contactEmail || t('subscribe.noSet') }}</span>
                  </div>
                </template>
              </el-table-column>
            </TableV2>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="subscribe-edit-v2__footer">
        <el-button plain :disabled="editDialog.loading" @click="show = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" :loading="editDialog.loading" @click="confirmHandle">
          {{ t('common.submit') }}
        </el-button>
      </div>
    </template>
  </CatDialog>
</template>

<script setup lang="ts">
import { _getUserList } from '@/apis/account-system/access/user'
import { _updateBatchProductSubscribe, _updateProductSubscribe } from '@/apis/account-system/news'
import { LANGUAGE_MAP } from '@/config/constant-config'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { pushRoute } from '@/utils/router-jump'
import { RECEIVING_CHANNELS_MAP } from '@/views/account-system/config'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const props = withDefaults(
  defineProps<{
    type: string
    notDisturb: boolean
    list: any[]
    channels: string[]
  }>(),
  { type: 'single', notDisturb: false, list: () => [], channels: () => [] },
)

const emits = defineEmits<{
  (event: 'success'): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'subscribe-edit-v2__label--wide',
  [en]: 'subscribe-edit-v2__label--wide',
  [zh]: 'subscribe-edit-v2__label--base',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const show = ref(false)
const allUserList = ref<any[]>([])
const tableRef = ref<any>(null)

const editDialog = reactive<{
  type: string
  loading: boolean
  notDisturb: boolean
  list: any[]
  selectUserList: any[]
  channels: string[]
}>({
  type: '',
  loading: false,
  notDisturb: false,
  list: [],
  selectUserList: [],
  channels: [],
})

const open = () => {
  editDialog.notDisturb = props.notDisturb
  editDialog.channels = [...props.channels]
  editDialog.selectUserList = []

  nextTick(() => {
    tableRef.value?.clearSelection?.()

    if (props.type === 'single') {
      users.value.forEach(row => {
        if (row.subscribe) {
          tableRef.value?.toggleRowSelection?.(row, true)
        }
      })
    }
  })
}

const closeHandle = () => {}

const productIds = computed(() => {
  const all = props.list.map(el => el.messageTypeDesc)
  return all.filter((item, index) => all.indexOf(item) === index)
})

const users = computed(() => {
  if (props.type === 'single') {
    const list = props.list.filter(el => el.users.length).map(el => el.users)
    const all: any[] = []

    for (let i = 0; i < list.length; i++) {
      for (let x = 0; x < list[i].length; x++) {
        all.push(list[i][x])
      }
    }

    return all.reduce((acc, currentValue) => {
      const isIdExists = acc.some(item => item.uid === currentValue.uid)
      if (!isIdExists) {
        acc.push(currentValue)
      }
      return acc
    }, [])
  }

  return allUserList.value
})

const formatAccountType = (row: any) => {
  if (row.accountType == 1) return t('overview.mainUser')
  if (row.userType == 1) return t('overview.subUser')
  if (row.userType == 2) return t('user.messageRecipient')
  return '-'
}

const getPhoneValue = (row: any) => row.mobile || row.mobil || ''

const confirmHandle = () => {
  if (!editDialog.selectUserList.length) {
    return message.warning(t('subscribe.userNameWarn'))
  }

  props.type === 'single' ? updateProductSubscribe() : updateBatchProductSubscribe()
}

const updateProductSubscribe = async () => {
  const notDisturb = editDialog.notDisturb ? 1 : 0
  const receivingChannels = editDialog.channels.toString()
  const uids = editDialog.selectUserList.map(el => el.uid)
  const subMessageType = props.list[0].messageType

  try {
    editDialog.loading = true
    const res = await _updateProductSubscribe({
      notDisturb,
      receivingChannels,
      uids,
      subMessageType,
    })

    if (res.success) {
      show.value = false
      message.success(t('user.subscribeSuccess'))
      emits('success')
    } else {
      message.warning(t('user.subscribeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    editDialog.loading = false
  }
}

const updateBatchProductSubscribe = async () => {
  const notDisturb = editDialog.notDisturb ? 1 : 0
  const receivingChannels = editDialog.channels.toString()
  const uids = editDialog.selectUserList.map(el => el.id)
  const subMessageTypes = props.list.map(el => el.messageType)

  try {
    editDialog.loading = true
    const res = await _updateBatchProductSubscribe({
      notDisturb,
      receivingChannels,
      uids,
      subMessageTypes,
    })

    if (res.success) {
      show.value = false
      message.success(t('user.subscribeSuccess'))
      emits('success')
    } else {
      message.warning(t('user.subscribeFail'))
    }
  } catch (error) {
    console.log(error)
  } finally {
    editDialog.loading = false
  }
}

const getUserList = async () => {
  try {
    const res = await _getUserList({
      pageIndex: 1,
      pageSize: 999,
      condition: '',
    })

    if (res.success) {
      allUserList.value = res.data?.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  getUserList()
})

defineExpose({
  show,
})
</script>

<style scoped lang="scss">
.subscribe-edit-v2 {
  color: #191c23;
}

.subscribe-edit-v2__body {
  padding: 24px;
}

.subscribe-edit-v2__section {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.subscribe-edit-v2__section + .subscribe-edit-v2__section {
  margin-top: 24px;
}

.subscribe-edit-v2__section--table {
  align-items: stretch;
}

.subscribe-edit-v2__label {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: flex-end;
  min-height: 22px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.subscribe-edit-v2__label--base {
  width: 70px;
}

.subscribe-edit-v2__label--wide {
  width: 110px;
}

.subscribe-edit-v2__content {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
}

.subscribe-edit-v2__content--stack {
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.subscribe-edit-v2__content--full {
  display: block;
}

.subscribe-edit-v2__product {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.subscribe-edit-v2__switch-line {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 22px;
}

.subscribe-edit-v2__switch-text,
.subscribe-edit-v2__desc {
  font-size: 14px;
  line-height: 22px;
}

.subscribe-edit-v2__desc {
  color: #828b9c;
}

.subscribe-edit-v2__channels {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.subscribe-edit-v2__contact-link {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #06f;
  cursor: pointer;
  background: transparent;
  border: 0;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.subscribe-edit-v2__table {
  width: 100%;
  margin-top: 2px;

  :deep(.account-table-v2__table .el-table__header-wrapper th.el-table__cell) {
    padding: 0 16px;
  }

  :deep(.account-table-v2__table .el-table__body-wrapper td.el-table__cell) {
    padding: 0 16px;
  }

  :deep(.account-table-v2__table .cell) {
    width: 100%;
  }

  :deep(.el-checkbox) {
    --el-checkbox-input-width: 16px;
    --el-checkbox-input-height: 16px;
  }
}

.subscribe-edit-v2__status-cell {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #191c23;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.subscribe-edit-v2__status-cell.is-empty {
  color: #191c23;
}

.subscribe-edit-v2__footer {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid #e8ecf3;
}

.subscribe-edit-v2-dialog {
  :deep(.el-dialog) {
    margin-top: 159px;
  }

  :deep(.el-dialog__header) {
    padding: 24px;
    margin: 0;
    border-bottom: 1px solid #e8ecf3;

    .custom-header {
      align-items: center;
      width: auto;
      color: #191c23;

      span {
        max-width: none;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
      }
    }
  }

  :deep(.dialog-close) {
    top: 24px;
    right: 24px;
    width: 24px !important;
    height: 24px !important;
    color: #191c23;
  }

  :deep(.dialog-body) {
    font-family: 'Noto Sans CJK', 'PingFang SC', sans-serif;
  }

  :deep(.cat-dialog-footer) {
    padding: 0;
  }

  :deep(.el-switch) {
    --el-switch-on-color: #06f;
    --el-switch-off-color: #dcdfe6;

    height: 20px;
  }

  :deep(.el-switch__core) {
    min-width: 34px !important;
    height: 20px;
    border: 0;
    border-radius: 12px;
  }

  :deep(.el-switch__action) {
    width: 16px;
    height: 16px;
  }

  :deep(.el-switch.is-checked .el-switch__action) {
    left: calc(100% - 17px);
  }

  :deep(.el-checkbox-group) {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  :deep(.el-checkbox) {
    margin-right: 0;
  }

  :deep(.el-checkbox__label) {
    padding-left: 8px;
    font-size: 14px;
    line-height: 22px;
    color: #191c23;
  }

  :deep(.el-button) {
    min-width: 76px;
    height: 34px;
    padding: 6px 12px;
    border-radius: 0;
  }
}
</style>
