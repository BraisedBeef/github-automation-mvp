<template>
  <section class="user-detail-key-tab">
    <InfoNotice class="user-detail-key-tab__notice">
      <div>
        <div>{{ t('user.keyTip1') }}</div>
        <div>{{ t('user.keyTip2') }}</div>
      </div>
    </InfoNotice>

    <div class="user-detail-key-tab__actions">
      <el-button type="primary" @click="generateSecretKey">
        {{ t('account.createKey') }}
      </el-button>
    </div>

    <TableV2
      :data="pagedList"
      :pagination="pagination"
      :total="list.length"
      show-pagination
      @change="handlePaginationChange"
      @update:pagination="handlePaginationChange"
    >
      <el-table-column min-width="340" :label="t('user.key')">
        <template #default="{ row }">
          <div class="user-detail-key-tab__secret">
            <div>SecretId: {{ row.secretId || '-' }}</div>
            <div>SecretKey: ******</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="220">
        <template #header>
          <div class="user-detail-key-tab__table-head">
            <span>{{ t('user.createDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.createDate ? maoYunDayJs(row.createDate).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>
      <el-table-column min-width="220">
        <template #header>
          <div class="user-detail-key-tab__table-head">
            <span>{{ t('user.accessDate') }}</span>
            <el-tooltip :content="t('common.time_zone_desc')" placement="top" effect="light">
              <SvgIcon name="cat-cdn-help" />
            </el-tooltip>
          </div>
        </template>
        <template #default="{ row }">
          {{ row.accessDate ? maoYunDayJs(row.accessDate).format(FORMAT_TIME) : '-' }}
        </template>
      </el-table-column>
      <el-table-column min-width="140" :label="t('user.status')">
        <template #default="{ row }">
          <div class="user-detail-key-tab__status" :class="row.state == 1 ? 'is-success' : 'is-error'">
            <span class="user-detail-key-tab__dot" />
            <span>{{ row.state == 1 ? t('user.startUp') : t('user.disabled') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="120" :label="t('common.operation')">
        <template #default="{ row }">
          <div class="user-detail-key-tab__operations">
            <button type="button" class="user-detail-key-tab__link" @click="handleOperateChange('disable', row)">
              {{ t('user.disable') }}
            </button>
            <button type="button" class="user-detail-key-tab__link" @click="handleOperateChange('delete', row)">
              {{ t('common.delete') }}
            </button>
          </div>
        </template>
      </el-table-column>
    </TableV2>

    <CatDialog
      v-model:dialog="operate.showDelete"
      class="user-detail-key-tab__dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :confirm-text="t('common.delete')"
      :loading="operateLoading"
      @confirm="confirmHandleDelete"
    >
      <el-row class="user-detail-key-tab__dialog-text">
        {{ t('user.deleteKeyDesc') }}
      </el-row>
    </CatDialog>

    <CatDialog
      v-model:dialog="operate.showDisable"
      class="user-detail-key-tab__dialog"
      :title="t('role.hint')"
      width="600px"
      destroy-on-close
      :confirm-text="t('user.disable')"
      :loading="operateLoading"
      @confirm="confirmHandleDisable"
    >
      <el-row class="user-detail-key-tab__dialog-text user-detail-key-tab__dialog-text--mb">
        {{ t('user.disableKeyDesc') }}
      </el-row>
      <el-row class="user-detail-key-tab__dialog-text user-detail-key-tab__dialog-text--error">
        {{ t('user.disableKeyaAccessDate')
        }}{{ operate.row.accessDate ? maoYunDayJs(operate.row.accessDate).format(FORMAT_TIME) : '-' }}
      </el-row>
    </CatDialog>

    <CatDialog
      v-model:dialog="create.show"
      class="user-detail-key-tab__dialog"
      :title="t('account.createKey')"
      width="640px"
      destroy-on-close
      :confirm-text="t('common.confirm')"
      :close-on-click-modal="false"
      :no-cancel="true"
      :disabled="!create.check"
      :show-close="false"
      @confirm="confirmHandleCreate"
      @update:dialog="closeHandleCreate"
    >
      <InfoNotice>
        <div>
          <div>{{ t('user.createKeyTip') }}</div>
          <div>SecretId: {{ create.detail.secretId || '-' }}</div>
          <div>SecretKey: {{ create.detail.secretKey || '-' }}</div>
        </div>
      </InfoNotice>
      <div class="user-detail-key-tab__create-check">
        <el-checkbox v-model="create.check" :label="t('user.createKeyCheck')" name="type" />
      </div>
    </CatDialog>
  </section>
</template>

<script setup lang="ts">
import { _generateSecretKey, _setSecretKeyStatus } from '@/apis/account-system/access/user'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { FORMAT_TIME, maoYunDayJs } from '@/utils/mao-yun-day-js'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

const props = withDefaults(
  defineProps<{
    userId: number
    list?: any[]
  }>(),
  {
    list: () => [],
  },
)

const emit = defineEmits<{
  (event: 'success'): void
}>()

const pagination = reactive({
  page: 1,
  pageSize: 10,
})

const create = reactive<{
  check: boolean
  show: boolean
  detail: any
}>({
  check: false,
  show: false,
  detail: {},
})

const operate = reactive<{
  showDelete: boolean
  showDisable: boolean
  row: any
}>({
  showDelete: false,
  showDisable: false,
  row: {},
})

const operateLoading = ref(false)

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return props.list.slice(start, start + pagination.pageSize)
})

const handlePaginationChange = value => {
  pagination.page = value.page
  pagination.pageSize = value.pageSize
}

const closeHandleCreate = () => {
  create.detail = {}
  create.check = false
}

const confirmHandleCreate = () => {
  if (create.check) {
    create.show = false
  }
}

const handleOperateChange = (type: 'delete' | 'disable', row: any) => {
  operate.row = row
  if (type === 'delete') {
    operate.showDelete = true
  } else {
    operate.showDisable = true
  }
}

const generateSecretKey = async () => {
  const res = await _generateSecretKey({
    id: props.userId,
  })

  if (res.success) {
    create.detail = res.data || {}
    create.show = true
    emit('success')
  } else {
    message.warning(t('user.createFail'))
  }
}

const setSecretKeyStatus = async (id: number, state: number) => {
  try {
    operateLoading.value = true
    const res = await _setSecretKeyStatus({
      id,
      state,
    })

    if (res.success) {
      if (state === 2) {
        message.success(t('common.deleteSuccess'))
        operate.showDelete = false
      } else {
        message.success(t('common.disableSuccess'))
        operate.showDisable = false
      }
      emit('success')
    } else {
      if (state === 2) {
        message.warning(t('role.deleteFail'))
      } else {
        message.warning(t('user.disableFail'))
      }
    }
  } catch (error) {
    console.log(error)
  } finally {
    operateLoading.value = false
  }
}

const confirmHandleDelete = () => {
  setSecretKeyStatus(operate.row.id, 2)
}

const confirmHandleDisable = () => {
  setSecretKeyStatus(operate.row.id, 3)
}

watch(
  () => props.list.length,
  () => {
    const maxPage = Math.max(1, Math.ceil(props.list.length / pagination.pageSize))
    if (pagination.page > maxPage) {
      pagination.page = maxPage
    }
  },
)
</script>

<style scoped lang="scss">
.user-detail-key-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-detail-key-tab__actions {
  display: flex;
  justify-content: flex-start;
}

.user-detail-key-tab__secret {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-detail-key-tab__table-head {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.user-detail-key-tab__status {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  &.is-success {
    color: #01a66f;
  }

  &.is-error {
    color: #e54839;
  }
}

.user-detail-key-tab__dot {
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
}

.user-detail-key-tab__operations {
  display: inline-flex;
  gap: 20px;
  align-items: center;
}

.user-detail-key-tab__link {
  padding: 0;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.user-detail-key-tab__dialog-text {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.user-detail-key-tab__dialog-text--mb {
  margin-bottom: 20px;
}

.user-detail-key-tab__dialog-text--error {
  color: #e54839;
}

.user-detail-key-tab__create-check {
  margin-top: 16px;
}
</style>
