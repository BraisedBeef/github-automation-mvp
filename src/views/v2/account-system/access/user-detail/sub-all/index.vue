<template>
  <div class="access-user-detail-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <section class="access-user-detail-v2__summary">
      <div class="access-user-detail-v2__profile">
        <div class="access-user-detail-v2__profile-head">
          <h2 class="access-user-detail-v2__name">
            {{ detail.userName || '-' }}
          </h2>
          <span class="access-user-detail-v2__tag">{{ t('account.subuser') }}</span>
        </div>

        <div class="access-user-detail-v2__grid">
          <div class="access-user-detail-v2__column">
            <div class="access-user-detail-v2__field">
              <div class="access-user-detail-v2__label">
                {{ t('account.accountID') }}
              </div>
              <div class="access-user-detail-v2__value">
                {{ detail.id || '-' }}
              </div>
            </div>

            <div class="access-user-detail-v2__field">
              <div class="access-user-detail-v2__label">
                {{ t('user.remark') }}
              </div>
              <div class="access-user-detail-v2__value access-user-detail-v2__value--wrap">
                <template v-if="!showEditRemark">
                  <span>{{ detail.remark || '-' }}</span>
                  <button type="button" class="access-user-detail-v2__edit-btn" @click="handleRemark">
                    <SvgIcon name="edit" />
                  </button>
                </template>
                <template v-else>
                  <div class="access-user-detail-v2__remark-edit">
                    <el-input v-model.trim="remark" maxlength="30" />
                    <button type="button" class="access-user-detail-v2__text-link" @click="changeUserInfo">
                      {{ t('common.save') }}
                    </button>
                    <button type="button" class="access-user-detail-v2__text-link" @click="showEditRemark = false">
                      {{ t('common.cancel') }}
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <div class="access-user-detail-v2__field">
              <div class="access-user-detail-v2__label access-user-detail-v2__label--inline">
                <span>{{ t('user.accessMehod') }}</span>
                <el-tooltip :content="t('user.accessMehodTooltip')" placement="top" effect="light">
                  <SvgIcon name="cat-cdn-warning" />
                </el-tooltip>
              </div>
              <div class="access-user-detail-v2__value">
                {{ detail.accessMethod == 1 ? t('user.access') : '-' }}
              </div>
            </div>
          </div>

          <div class="access-user-detail-v2__divider" />

          <div class="access-user-detail-v2__column">
            <div class="access-user-detail-v2__field">
              <div class="access-user-detail-v2__label">
                {{ t('securitySetting.securePhone') }}
              </div>
              <div class="access-user-detail-v2__value access-user-detail-v2__value--wrap">
                <span>{{ detail.areaCode || '' }}{{ detail.mobile || '-' }}</span>
                <button
                  type="button"
                  class="access-user-detail-v2__edit-btn"
                  @click="openModifyPhoneDialog(modifyPhoneDialogRef)"
                >
                  <SvgIcon name="edit" />
                </button>
              </div>
            </div>

            <div class="access-user-detail-v2__field">
              <div class="access-user-detail-v2__label">
                {{ t('securitySetting.secureEmail') }}
              </div>
              <div class="access-user-detail-v2__value access-user-detail-v2__value--wrap">
                <span>{{ detail.contactEmail || '-' }}</span>
                <button
                  type="button"
                  class="access-user-detail-v2__edit-btn"
                  @click="openModifyEmailDialog(modifyEmailDialogRef)"
                >
                  <SvgIcon name="edit" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="access-user-detail-v2__quick">
        <h3 class="access-user-detail-v2__quick-title">
          {{ t('user.quickOperate') }}
        </h3>

        <div class="access-user-detail-v2__quick-grid">
          <button
            type="button"
            class="access-user-detail-v2__quick-btn"
            @click="openSubMessageDialog(subMessageDialogRef)"
          >
            {{ t('user.subscribeMsg') }}
          </button>
          <button
            type="button"
            class="access-user-detail-v2__quick-btn"
            @click="openDeleteUserDialog(deleteUserDialogRef)"
          >
            {{ t('user.deleteUser') }}
          </button>
          <button
            type="button"
            class="access-user-detail-v2__quick-btn"
            @click="openDisableUserDialog(disableUserDialogRef)"
          >
            {{ t('user.disableUser') }}
          </button>
        </div>
      </div>
    </section>

    <div class="access-user-detail-v2__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="access-user-detail-v2__tab"
        :class="{ 'is-active': active === tab.value }"
        @click="active = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <section
      class="access-user-detail-v2__panel"
      :class="{
        'access-user-detail-v2__panel--plain': active === 3,
      }"
    >
      <RoleStrategyTab v-if="active === 1" :user-id="id" />
      <ServiceTab v-else-if="active === 2" :user-id="id" />
      <SecureTab v-else-if="active === 3" :detail="detail" @success="getAccessUserInfo" />
      <ApiSecretKeyTab v-else :user-id="id" :list="detail.secretList || []" @success="getAccessUserInfo" />
    </section>

    <ModifyPhoneDialog ref="modifyPhoneDialogRef" :user="detail" @success="getAccessUserInfo" />
    <ModifyEmailDialog ref="modifyEmailDialogRef" :user="detail" @success="getAccessUserInfo" />
    <SubMessageDialog
      ref="subMessageDialogRef"
      :recipient="detail.userName"
      :contact-email="detail.contactEmail"
      :tg-bing="detail.tgChatId ? true : false"
      @update-detail="getAccessUserInfo"
    />
    <DeleteUserDialog ref="deleteUserDialogRef" :ids="[id]" :list="[detail]" />
    <DisableUserDialog
      :id="id"
      ref="disableUserDialogRef"
      :access-method="detail.accessMethod"
      @success="getAccessUserInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { _getAccessUserInfo } from '@/apis/account-system/access/user'
import { _updateVcUser } from '@/apis/account-system/user'
import { documentUrl } from '@/config/base-config'
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import RoleStrategyTab from './components/role-strategy-tab.vue'
import ServiceTab from './components/service-tab.vue'
import SecureTab from './components/secure-tab.vue'
import ApiSecretKeyTab from './components/api-secret-key-tab.vue'
import ModifyPhoneDialog from '@/views/account-system/access/user/detail/components/modify-phone-dialog.vue'
import ModifyEmailDialog from '@/views/account-system/access/user/detail/components/modify-email-dialog.vue'
import DeleteUserDialog from '@/views/account-system/access/user/detail/components/delete-user-dialog.vue'
import DisableUserDialog from '@/views/account-system/access/user/detail/components/disable-user-dialog.vue'
import SubMessageDialog from '@/views/account-system/access/user/detail/components/sub-message-dialog.vue'

const route = useRoute()

const id = ref(Number(route.params.id) as number)
const active = ref(1)
const showEditRemark = ref(false)
const remark = ref('')
const detail = ref<any>({})
const tabs = [
  { label: t('user.roleStrategy'), value: 1 },
  { label: t('user.serve'), value: 2 },
  { label: t('user.safety'), value: 3 },
  { label: t('user.apiKey'), value: 4 },
]

const modifyPhoneDialogRef = ref<InstanceType<typeof ModifyPhoneDialog>>()
const modifyEmailDialogRef = ref<InstanceType<typeof ModifyEmailDialog>>()
const deleteUserDialogRef = ref<InstanceType<typeof DeleteUserDialog>>()
const disableUserDialogRef = ref<InstanceType<typeof DisableUserDialog>>()
const subMessageDialogRef = ref<InstanceType<typeof SubMessageDialog>>()

const breadcrumbItems = computed(() => [t('accountSystemRoutes.userList'), t('accountSystemRoutes.userDetail')])

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleRemark = () => {
  remark.value = detail.value.remark || ''
  showEditRemark.value = true
}

const openModifyEmailDialog = (ins: any) => {
  if (ins) {
    ins.show = true
  }
}

const openModifyPhoneDialog = (ins: any) => {
  if (ins) {
    ins.show = true
  }
}

const openSubMessageDialog = (ins: any) => {
  if (ins) {
    ins.show = true
  }
}

const openDeleteUserDialog = (ins: any) => {
  if (ins) {
    ins.show = true
  }
}

const openDisableUserDialog = (ins: any) => {
  if (ins) {
    ins.show = true
  }
}

const getAccessUserInfo = async () => {
  try {
    const res = await _getAccessUserInfo({
      id: id.value,
    })

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  }
}

const changeUserInfo = async () => {
  if (!remark.value) {
    return message.warning(t('user.remarkWarn'))
  }

  const res = await _updateVcUser({
    id: id.value,
    remark: remark.value,
  })

  if (res.success) {
    message.success(t('account.changeSuccess'))
    showEditRemark.value = false
    getAccessUserInfo()
  } else {
    message.warning(t('account.changeFail'))
  }
}

watch(
  () => route.params.id,
  () => {
    id.value = Number(route.params.id) as number
    active.value = 1
    showEditRemark.value = false
    getAccessUserInfo()
  },
)

onMounted(() => {
  getAccessUserInfo()
})
</script>

<style scoped lang="scss">
.access-user-detail-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.access-user-detail-v2__summary {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 16px;
}

.access-user-detail-v2__profile,
.access-user-detail-v2__quick,
.access-user-detail-v2__panel {
  padding: 20px;
  background: #fff;
}

.access-user-detail-v2__profile {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.access-user-detail-v2__profile-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.access-user-detail-v2__name {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  line-height: 36px;
  color: #191c23;
}

.access-user-detail-v2__tag {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  background: #edf4ff;
}

.access-user-detail-v2__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  gap: 0 36px;
}

.access-user-detail-v2__column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.access-user-detail-v2__divider {
  background: #e8ecf3;
}

.access-user-detail-v2__field {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.access-user-detail-v2__label {
  flex: 0 0 96px;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.access-user-detail-v2__label--inline {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.access-user-detail-v2__label--inline :deep(svg) {
  width: 16px;
  height: 16px;
  color: #8a93a6;
}

.access-user-detail-v2__value {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.access-user-detail-v2__value--wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.access-user-detail-v2__edit-btn,
.access-user-detail-v2__text-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.access-user-detail-v2__edit-btn :deep(svg) {
  width: 16px;
  height: 16px;
  color: #8a93a6;
}

.access-user-detail-v2__remark-edit {
  display: flex;
  gap: 12px;
  align-items: center;
}

.access-user-detail-v2__remark-edit :deep(.el-input) {
  width: 220px;
}

.access-user-detail-v2__quick {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.access-user-detail-v2__quick-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.access-user-detail-v2__quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.access-user-detail-v2__quick-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 52px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf3;
}

.access-user-detail-v2__tabs {
  display: inline-flex;
  flex-wrap: wrap;
}

.access-user-detail-v2__tab {
  position: relative;
  z-index: 1;
  min-width: 108px;
  padding: 8px 20px;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-right-width: 0;

  &:last-child {
    border-right-width: 1px;
  }

  &.is-active {
    z-index: 2;
    color: #06f;

    &::after {
      position: absolute;
      inset: -1px;
      pointer-events: none;
      content: '';
      border: 1px solid #06f;
    }
  }
}

.access-user-detail-v2__panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
}

.access-user-detail-v2__panel--plain {
  padding: 0;
  background: transparent;
}

@media (width <= 1200px) {
  .access-user-detail-v2__summary {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .access-user-detail-v2 {
    padding: 12px;
  }

  .access-user-detail-v2__grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .access-user-detail-v2__divider {
    display: none;
  }

  .access-user-detail-v2__field {
    flex-direction: column;
    gap: 8px;
  }

  .access-user-detail-v2__label {
    flex-basis: auto;
  }

  .access-user-detail-v2__quick-grid {
    grid-template-columns: 1fr;
  }

  .access-user-detail-v2__remark-edit {
    flex-direction: column;
    align-items: flex-start;
  }

  .access-user-detail-v2__remark-edit :deep(.el-input) {
    width: 100%;
  }
}
</style>
