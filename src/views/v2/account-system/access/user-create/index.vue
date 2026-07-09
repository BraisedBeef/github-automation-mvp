<template>
  <div class="access-user-create-v2">
    <PageBreadcrumbToolbar :items="breadcrumbItems" @doc="openHelpDoc" />

    <ProcessSteps :steps="stepList" :active="stepActive" />

    <section class="access-user-create-v2__panel">
      <div class="access-user-create-v2__body" :class="{ 'is-type-step': stepActive === 'a' }">
        <template v-if="stepActive === 'a'">
          <div class="access-user-create-v2__form-row access-user-create-v2__form-row--top">
            <div class="access-user-create-v2__form-label">
              {{ t('user.createStep1') }}
              <span class="access-user-create-v2__required">*</span>
            </div>

            <div class="access-user-create-v2__type-list">
              <button
                type="button"
                class="access-user-create-v2__type-item"
                :class="{ 'is-active': createUserType === 1 }"
                @click="handleSelectType(1)"
              >
                <span class="access-user-create-v2__type-icon">
                  <SvgIcon name="v2-account-user-outlined" />
                </span>

                <span class="access-user-create-v2__type-content">
                  <span class="access-user-create-v2__type-title">{{ t('user.accessAndMsg') }}</span>
                  <span class="access-user-create-v2__type-desc">{{ t('user.accessAndMsgDesc') }}</span>
                </span>

                <span v-if="createUserType === 1" class="access-user-create-v2__type-corner">
                  <span>✓</span>
                </span>
              </button>

              <button
                type="button"
                class="access-user-create-v2__type-item"
                :class="{ 'is-active': createUserType === 2 }"
                @click="handleSelectType(2)"
              >
                <span class="access-user-create-v2__type-icon">
                  <SvgIcon name="v2-account-message-outlined" />
                </span>

                <span class="access-user-create-v2__type-content">
                  <span class="access-user-create-v2__type-title">{{ t('user.msg') }}</span>
                  <span class="access-user-create-v2__type-desc">{{ t('user.msgDesc') }}</span>
                </span>

                <span v-if="createUserType === 2" class="access-user-create-v2__type-corner">
                  <span>✓</span>
                </span>
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="stepActive === 'b'">
          <InfoNotice :text="step2NoticeText" />

          <div class="access-user-create-v2__section access-user-create-v2__section--info">
            <div class="access-user-create-v2__form-row access-user-create-v2__form-row--top">
              <div class="access-user-create-v2__form-label">
                {{ t('user.setUserInfo') }}
              </div>

              <TableV2 class="access-user-create-v2__table-wrap" :data="[{}]" :empty-min-height="0">
                <el-table-column min-width="260">
                  <template #header>
                    <span>{{ t('user.userNames') }}</span>
                    <span class="access-user-create-v2__required">*</span>
                  </template>
                  <template #default>
                    <el-input
                      v-model.trim="userInfoForm.name"
                      maxlength="30"
                      autocomplete="off"
                      :placeholder="t('user.userNameWarn')"
                      @input="handleNameInput"
                      @blur="handleNameBlur"
                    />
                  </template>
                </el-table-column>

                <el-table-column prop="remark" :label="t('user.remark')" min-width="220">
                  <template #default>
                    <el-input
                      v-model.trim="userInfoForm.remark"
                      maxlength="50"
                      autocomplete="off"
                      :placeholder="t('user.remark')"
                    />
                  </template>
                </el-table-column>

                <el-table-column prop="phone" :label="t('user.phone')" min-width="320">
                  <template #default>
                    <div class="access-user-create-v2__phone-field">
                      <el-select v-model="phonePre" class="access-user-create-v2__phone-select">
                        <el-option label="+86" value="+86" />
                      </el-select>

                      <el-input
                        v-model="userInfoForm.phone"
                        class="access-user-create-v2__phone-input"
                        autocomplete="off"
                        :placeholder="t('user.phone')"
                        @input="handlePhoneInput"
                        @blur="handlePhoneBlur"
                      />
                    </div>
                  </template>
                </el-table-column>

                <el-table-column min-width="300">
                  <template #header>
                    <span>{{ t('user.email') }}</span>
                    <span class="access-user-create-v2__required">*</span>
                  </template>
                  <template #default>
                    <el-input
                      v-model.trim="userInfoForm.email"
                      autocomplete="off"
                      :placeholder="t('user.emailWarn')"
                      @blur="handleEmailBlur"
                    />
                  </template>
                </el-table-column>

                <el-table-column width="80" align="center">
                  <template #header>
                    {{ t('common.operation') }}
                  </template>
                  <template #default>
                    <button type="button" class="access-user-create-v2__action-link" @click="resetUserInfoForm">
                      {{ t('common.delete') || '删除' }}
                    </button>
                  </template>
                </el-table-column>
              </TableV2>
            </div>
          </div>

          <div
            v-if="createUserType === 1"
            class="access-user-create-v2__section access-user-create-v2__section--operate"
          >
            <div class="access-user-create-v2__form-row">
              <div class="access-user-create-v2__form-label">
                {{ t('user.accessMehod') }}
                <span class="access-user-create-v2__required">*</span>
              </div>

              <div class="access-user-create-v2__form-content access-user-create-v2__switch-field">
                <div class="access-user-create-v2__switch-line">
                  <el-switch v-model="userOperateForm.accessType" />
                  <span class="access-user-create-v2__switch-label">{{ t('user.maoyunAccess') }}</span>
                </div>
                <p class="access-user-create-v2__form-desc access-user-create-v2__form-desc--compact">
                  {{ t('user.accessMehodDesc') }}
                </p>
              </div>
            </div>

            <div class="access-user-create-v2__form-row">
              <div class="access-user-create-v2__form-label">
                {{ t('user.consolePwd') }}
                <span class="access-user-create-v2__required">*</span>
              </div>

              <div class="access-user-create-v2__form-content">
                <el-radio-group
                  v-model="userOperateForm.pwdType"
                  class="access-user-create-v2__radio-group"
                  @change="handlePwdTypeChange"
                >
                  <el-radio :label="1">
                    {{ t('user.autoPwd') }}
                  </el-radio>
                  <el-radio :label="0">
                    {{ t('user.customPwd') }}
                  </el-radio>
                </el-radio-group>

                <div class="access-user-create-v2__password-wrap">
                  <el-input
                    v-model.trim="userOperateForm.pwd"
                    autocomplete="off"
                    :readonly="userOperateForm.pwdType === 1"
                    :placeholder="userOperateForm.pwdType === 1 ? '' : t('user.customPwd')"
                    @focus="showPwdPanel = true"
                    @blur="showPwdPanel = false"
                  />

                  <transition name="el-zoom-in-top">
                    <div
                      v-show="showPwdPanel && userOperateForm.pwdType === 0"
                      class="access-user-create-v2__password-panel"
                    >
                      <p v-for="item in pwdRules" :key="item.desc" class="access-user-create-v2__password-item">
                        <SvgIcon :name="item.right ? 'pwd-success' : 'pwd-warning'" />
                        <span>{{ item.desc }}</span>
                      </p>
                    </div>
                  </transition>
                </div>

                <el-checkbox v-model="userOperateForm.nextResetPwd" :label="t('user.nextResetPwdDesc')" />
              </div>
            </div>

            <div class="access-user-create-v2__form-row">
              <div class="access-user-create-v2__form-label access-user-create-v2__form-label--inline">
                <span>{{ t('overview.loginProtect') }}</span>
                <el-tooltip :content="t('user.loginSecureTooltip')" placement="top" effect="light">
                  <SvgIcon name="v2-cat-cdn-warning" />
                </el-tooltip>
                <span class="access-user-create-v2__required">*</span>
              </div>

              <div class="access-user-create-v2__form-content access-user-create-v2__switch-field">
                <div class="access-user-create-v2__switch-line">
                  <el-switch v-model="userOperateForm.loginSecure" />
                </div>
              </div>
            </div>

            <div class="access-user-create-v2__form-row">
              <div class="access-user-create-v2__form-label access-user-create-v2__form-label--inline">
                <span>{{ t('overview.operateProtect') }}</span>
                <el-tooltip :content="t('user.operateSecureTooltip')" placement="top" effect="light">
                  <SvgIcon name="v2-cat-cdn-warning" />
                </el-tooltip>
              </div>

              <div class="access-user-create-v2__form-content access-user-create-v2__switch-field">
                <div class="access-user-create-v2__switch-line">
                  <el-switch v-model="userOperateForm.operateSecure" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="stepActive === 'c'">
          <InfoNotice>
            <div class="access-user-create-v2__notice-lines">
              <p>{{ t('user.createStep3MainTip') }}</p>
              <p>{{ t('user.createStep3SubTip1') }}</p>
              <p>{{ t('user.createStep3SubTip2') }}</p>
            </div>
          </InfoNotice>

          <InfoNotice variant="danger" icon-name="cat-message-warning" :text="t('user.createStep3DangerDesc')" />

          <div class="access-user-create-v2__section">
            <div class="access-user-create-v2__section-title-row">
              <h3 class="access-user-create-v2__section-title">
                {{ t('user.roleList') }}
              </h3>
              <span class="access-user-create-v2__section-subtitle">
                {{ t('user.selectRoleList', [roleList.length, selectedRoleList.length]) }}
              </span>
            </div>

            <TableV2
              ref="userRoleTableRef"
              v-loading="roleLoading"
              :data="roleList"
              :empty-min-height="180"
              row-key="id"
              @selection-change="handleRoleSelectionChange"
            >
              <el-table-column type="selection" width="40" />
              <el-table-column prop="roleName" :label="t('role.roleName')" min-width="240" />
              <el-table-column prop="id" :label="t('role.roleID')" min-width="240" />
              <el-table-column prop="strategyNum" :label="t('role.strategyNum')" min-width="160" />
            </TableV2>

            <div class="access-user-create-v2__self-key">
              <el-checkbox v-model="isSelf" :label="t('user.isSelfKey')" />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="access-user-create-v2__review-section access-user-create-v2__review-section--table">
            <h3 class="access-user-create-v2__section-title">
              {{ t('user.setUserInfo') }}
            </h3>

            <TableV2 :data="[userInfoForm]" :empty-min-height="0">
              <el-table-column prop="name" :label="t('user.userNames')" min-width="240" />
              <el-table-column prop="phone" :label="t('user.phone')" min-width="220" />
              <el-table-column prop="email" :label="t('user.email')" min-width="260" />
            </TableV2>
          </div>

          <div class="access-user-create-v2__review-section">
            <h3 class="access-user-create-v2__section-title">
              {{ t('user.accessInfo') }}
            </h3>

            <div class="access-user-create-v2__info-list">
              <div class="access-user-create-v2__info-row">
                <span>{{ t('user.accessMehod') }}</span>
                <span>{{ userOperateForm.accessType ? t('user.access') : '-' }}</span>
              </div>
              <div class="access-user-create-v2__info-row">
                <span>{{ t('user.consolePwdType') }}</span>
                <span>{{ userOperateForm.pwdType === 1 ? t('user.autoPwd') : t('user.customPwd') }}</span>
              </div>
              <div class="access-user-create-v2__info-row">
                <span>{{ t('user.nextResetPwd') }}</span>
                <span>{{ userOperateForm.nextResetPwd ? t('user.yes') : t('user.no') }}</span>
              </div>
            </div>
          </div>

          <div class="access-user-create-v2__review-section">
            <h3 class="access-user-create-v2__section-title">
              {{ t('user.subscribeInfo') }}
            </h3>

            <div class="access-user-create-v2__summary-row">
              <div class="access-user-create-v2__summary-label">
                {{ t('user.msgType') }}
              </div>

              <div class="access-user-create-v2__message-list">
                <div v-for="item in messageTypeOptions" :key="item.key" class="access-user-create-v2__message-item">
                  <span
                    class="access-user-create-v2__message-check"
                    :class="{ 'is-checked': messageCheckList[item.key] }"
                  />
                  <div class="access-user-create-v2__message-content">
                    <span class="access-user-create-v2__message-name">
                      {{ item.label }}
                    </span>
                    <p>{{ item.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="access-user-create-v2__review-section">
            <h3 class="access-user-create-v2__section-title">
              {{ t('user.permInfo') }}
            </h3>

            <TableV2 :data="selectedRoleList">
              <el-table-column prop="roleName" :label="t('role.roleName')" min-width="240" />
            </TableV2>
          </div>
        </template>
      </div>

      <div class="access-user-create-v2__footer">
        <template v-if="stepActive === 'a'">
          <el-button type="primary" @click="goTypeStepNext">
            {{ t('common.next') }}
          </el-button>
        </template>

        <template v-else-if="stepActive === 'b'">
          <el-button v-if="createUserType === 1" type="primary" @click="goInfoStepNext">
            {{ t('common.next') }}
          </el-button>
          <el-button v-else :loading="loading" type="primary" @click="submitMessageOnlyUser">
            {{ t('role.finish') }}
          </el-button>
          <el-button @click="stepActive = 'a'">
            {{ t('user.prev') }}
          </el-button>
        </template>

        <template v-else-if="stepActive === 'c'">
          <el-button @click="stepActive = 'b'">
            {{ t('user.prev') }}
          </el-button>
          <el-button type="primary" @click="goPermissionStepNext">
            {{ t('common.next') }}
          </el-button>
        </template>

        <template v-else>
          <el-button @click="stepActive = 'c'">
            {{ t('user.prev') }}
          </el-button>
          <el-button :loading="loading" type="primary" @click="submitResourceUser">
            {{ t('role.finish') }}
          </el-button>
        </template>
      </div>
    </section>

    <CatDialog
      v-model:dialog="successDialog.show"
      :title="t('user.createSuccessTit')"
      width="850px"
      destroy-on-close
      :no-cancel="true"
      @confirm="handleSuccessConfirm"
    >
      <p class="access-user-create-v2__dialog-desc">
        {{ t('user.createSuccessDesc') }}
      </p>

      <InfoNotice variant="danger" icon-name="cat-message-warning" :text="t('user.createSuccessTip')" />

      <TableV2 :data="[successDialog.detail]" class="access-user-create-v2__success-table" :empty-min-height="0">
        <el-table-column prop="userName" :label="t('user.userNames')" min-width="180" />
        <el-table-column :label="t('user.password')" min-width="260">
          <template #default="{ row }">
            <div class="access-user-create-v2__secret-cell">
              <span>{{ successDialog.showPassword ? row.password || '-' : '****' }}</span>
              <button
                type="button"
                class="access-user-create-v2__action-link"
                @click="successDialog.showPassword = !successDialog.showPassword"
              >
                {{ successDialog.showPassword ? t('user.hide') : t('user.show') }}
              </button>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('user.key')" min-width="420">
          <template #default="{ row }">
            <div v-if="row.secretId && row.secretKey">
              <p class="access-user-create-v2__secret-line">SecretId: {{ row.secretId }}</p>
              <div class="access-user-create-v2__secret-cell">
                <span>{{ successDialog.showSecretKey ? `SecretKey: ${row.secretKey}` : 'SecretKey: ****' }}</span>
                <button
                  type="button"
                  class="access-user-create-v2__action-link"
                  @click="successDialog.showSecretKey = !successDialog.showSecretKey"
                >
                  {{ successDialog.showSecretKey ? t('user.hide') : t('user.show') }}
                </button>
              </div>
            </div>
            <p v-else>-</p>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.operation')" min-width="100" align="center">
          <template #default="{ row }">
            <button type="button" class="access-user-create-v2__action-link" @click="handleCopy(row)">
              {{ t('user.copy') }}
            </button>
          </template>
        </el-table-column>
      </TableV2>
    </CatDialog>
  </div>
</template>

<script setup lang="ts">
import { randomPassword, lower, upper, digits, symbols } from 'secure-random-password'
import { storeToRefs } from 'pinia'
import { documentUrl } from '@/config/base-config'
import { _insertVcUser, _getMessageType, _getUserRoleList } from '@/apis/account-system/access/user'
import { PWD_REG, EMIAL_REG } from '@/views/auth/config'
import { useSubUserCreateStore, useUserStore } from '@/store'
import { handleCopyValue } from '@/utils/dom-utils'
import { message } from '@/utils/message'
import { backRoute } from '@/utils/router-jump'
import t from '@/utils/i18n'
import PageBreadcrumbToolbar from '@/views/v2/account-system/components/page-breadcrumb-toolbar.vue'
import ProcessSteps from '@/views/v2/account-system/components/process-steps.vue'
import InfoNotice from '@/views/v2/account-system/components/info-notice.vue'
import TableV2 from '@/views/v2/account-system/components/table-v2.vue'

interface UserInfoForm {
  name: string
  remark: string
  phone: string
  email: string
}

interface UserOperateForm {
  accessType: boolean
  pwdType: number
  pwd: string
  nextResetPwd: boolean
  loginSecure: boolean
  operateSecure: boolean
}

type MessageCheckKey = 'finance' | 'product' | 'security' | 'dynamic' | 'operation' | 'other'

const phoneReg = /^1[3-9]\d{9}$/
const accessUserStore = useSubUserCreateStore()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const breadcrumbItems = computed(() => [t('accountSystemRoutes.overview'), t('accountSystemRoutes.createUser')])
const stepActive = ref(accessUserStore.active || 'a')
const createUserType = ref<number>(accessUserStore.createUserType || 1)
const phonePre = ref('+86')
const loading = ref(false)
const roleLoading = ref(false)
const roleList = ref<any[]>([])
const userRoleTableRef = ref()
const showPwdPanel = ref(false)
const messageTypeList = ref<any[]>([])
const selectedRoleList = ref<any[]>([...(accessUserStore.selectRoleList || [])])
const isSelf = ref<boolean>(accessUserStore.isSelf || false)

const successDialog = reactive({
  show: false,
  showPassword: false,
  showSecretKey: false,
  detail: {} as any,
})

const userInfoForm = reactive<UserInfoForm>({
  name: '',
  remark: '',
  phone: '',
  email: '',
})

const userOperateForm = reactive<UserOperateForm>({
  accessType: false,
  pwdType: 0,
  pwd: '',
  nextResetPwd: false,
  loginSecure: false,
  operateSecure: false,
})

const messageCheckList = reactive<Record<MessageCheckKey, boolean>>({
  finance: false,
  product: false,
  security: false,
  dynamic: false,
  operation: false,
  other: false,
})

const messageTypeOptions = computed(() => [
  { key: 'finance', label: t('user.finance'), desc: t('user.financeDesc') },
  { key: 'product', label: t('user.product'), desc: t('user.productDesc') },
  { key: 'security', label: t('user.security'), desc: t('user.securityDesc') },
  { key: 'dynamic', label: t('user.dynamic'), desc: t('user.dynamicDesc') },
  { key: 'operation', label: t('user.operation'), desc: t('user.operationDesc') },
  { key: 'other', label: t('user.other'), desc: t('user.otherDesc') },
])

const stepList = computed(() => {
  if (createUserType.value === 2) {
    return [
      { label: t('user.createStep1'), value: 'a' },
      { label: t('user.createStep2'), value: 'b' },
    ]
  }

  return [
    { label: t('user.createStep1'), value: 'a' },
    { label: t('user.createStep2'), value: 'b' },
    { label: t('user.createStep3'), value: 'c' },
    { label: t('user.createStep4'), value: 'd' },
  ]
})

const step2NoticeText = computed(() =>
  createUserType.value === 1 ? t('user.createStep2Tip1') : t('user.createStep2Tip2'),
)

const pwdRules = ref([
  { desc: t('user.createRule1'), right: false },
  { desc: t('user.createRule2'), right: false },
  { desc: t('user.createRule3'), right: false },
  { desc: t('user.createRule4'), right: false },
])

const restoreDraft = () => {
  Object.assign(userInfoForm, {
    name: accessUserStore.createUserInfoForm?.name || '',
    remark: accessUserStore.createUserInfoForm?.remark || '',
    phone: accessUserStore.createUserInfoForm?.phone || '',
    email: accessUserStore.createUserInfoForm?.email || '',
  })

  Object.assign(userOperateForm, {
    accessType: accessUserStore.createUserOperateForm?.accessType || false,
    pwdType: accessUserStore.createUserOperateForm?.pwdType ?? 0,
    pwd: accessUserStore.createUserOperateForm?.pwd || '',
    nextResetPwd: accessUserStore.createUserOperateForm?.nextResetPwd || false,
    loginSecure: accessUserStore.createUserOperateForm?.loginSecure || false,
    operateSecure: accessUserStore.createUserOperateForm?.operateSecure || false,
  })
}

const saveDraft = () => {
  accessUserStore.setCreateUserType(createUserType.value)
  accessUserStore.setStepActive(stepActive.value)
  accessUserStore.setCreateUserInfoForm({ ...userInfoForm })
  accessUserStore.setCreateUserOperateForm({ ...userOperateForm })
  accessUserStore.setSelectRoleList([...selectedRoleList.value])
  accessUserStore.setIsSelf(isSelf.value)
}

const resetUserInfoForm = () => {
  Object.assign(userInfoForm, {
    name: '',
    remark: '',
    phone: '',
    email: '',
  })
}

const openHelpDoc = () => {
  window.open(documentUrl, '_blank')
}

const handleSelectType = (type: number) => {
  createUserType.value = type
}

const handleNameInput = (value: string) => {
  const pureValue = value.replace(/\s/g, '')
  const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/
  userInfoForm.name = regex.test(pureValue)
    ? pureValue
    : pureValue.replace(/[^\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '')
}

const handleNameBlur = () => {
  if (userInfoForm.name && userOperateForm.pwd === userInfoForm.name) {
    message.warning(t('user.userNameNotEqualPwdWarn'))
  }
}

const handlePhoneInput = (value: string) => {
  userInfoForm.phone = /^\d*$/.test(value) ? value : value.replace(/\D/g, '')
}

const handlePhoneBlur = () => {
  if (userInfoForm.phone && !phoneReg.test(userInfoForm.phone)) {
    message.warning(t('user.phoneFormatWarn'))
  }
}

const handleEmailBlur = () => {
  if (userInfoForm.email && !EMIAL_REG.test(userInfoForm.email)) {
    return message.warning(t('user.emailFormatWarn'))
  }
  if (userInfoForm.email && userInfoForm.email === user.value.email) {
    return message.warning(t('user.emailValueWarn'))
  }
}

const generatePassword = (username: string): string => {
  let password = randomPassword({
    length: 8 + Math.floor(Math.random() * 25),
    characters: lower + upper + digits + symbols,
  })

  if (password === username || !PWD_REG.test(password)) {
    password = generatePassword(username)
  }

  return password
}

const handlePwdTypeChange = (pwdType: number) => {
  userOperateForm.pwd = ''
  if (pwdType === 1) {
    userOperateForm.pwd = generatePassword(userInfoForm.name)
  }
}

const validateUserInfoBase = () => {
  if (!userInfoForm.name) {
    message.warning(t('user.userNameWarn'))
    return false
  }
  if (!userInfoForm.email) {
    message.warning(t('user.emailWarn'))
    return false
  }
  if (userInfoForm.phone && !phoneReg.test(userInfoForm.phone)) {
    message.warning(t('user.phoneFormatWarn'))
    return false
  }
  if (!EMIAL_REG.test(userInfoForm.email)) {
    message.warning(t('user.emailFormatWarn'))
    return false
  }
  return true
}

const goTypeStepNext = () => {
  stepActive.value = 'b'
  saveDraft()
}

const goInfoStepNext = () => {
  if (!validateUserInfoBase()) return
  if (!userOperateForm.pwd) {
    return message.warning(t('user.pwdWarn'))
  }
  if (!PWD_REG.test(userOperateForm.pwd)) {
    return message.warning(t('user.pwdFormatWarn'))
  }
  if (userOperateForm.pwd === userInfoForm.name) {
    return message.warning(t('user.pwdNotEqualUserNameWarn'))
  }

  stepActive.value = 'c'
  saveDraft()
}

const goPermissionStepNext = () => {
  if (!selectedRoleList.value.length) {
    return message.warning(t('user.associateRoleWarn'))
  }
  stepActive.value = 'd'
  saveDraft()
}

const buildMessageTypes = () => {
  const messageTypeMap: Record<MessageCheckKey, string> = {
    finance: 'FINANCE',
    product: 'PRODUCT_SUBSCRIBE',
    security: 'SECURITY',
    dynamic: 'DYNAMIC',
    operation: 'OPERATION',
    other: 'OTHER',
  }

  return Object.entries(messageCheckList)
    .filter(([, checked]) => checked)
    .map(([key]) => messageTypeMap[key as MessageCheckKey])
}

const submitMessageOnlyUser = async () => {
  if (!validateUserInfoBase()) return

  const params = {
    parentId: user.value.id,
    userType: 2,
    userName: userInfoForm.name,
    mobile: userInfoForm.phone,
    contactEmail: userInfoForm.email,
    remark: userInfoForm.remark,
  }

  await createUser(params)
}

const submitResourceUser = async () => {
  const params = {
    parentId: user.value.id,
    password: userOperateForm.pwd,
    userType: 1,
    userName: userInfoForm.name,
    remark: userInfoForm.remark,
    areaCode: phonePre.value,
    mobile: userInfoForm.phone,
    email: userInfoForm.email,
    accessMethod: userOperateForm.accessType ? 1 : 0,
    loginProtect: userOperateForm.loginSecure ? 1 : 0,
    operateProtect: userOperateForm.operateSecure ? 1 : 0,
    roleIds: selectedRoleList.value.map(item => item.id),
    isSecret: isSelf.value ? 1 : 0,
    resetPassword: userOperateForm.nextResetPwd ? 1 : 0,
    messageTypes: buildMessageTypes(),
  }

  await createUser(params)
}

const createUser = async (params: any) => {
  try {
    loading.value = true
    const res = await _insertVcUser(params)

    if (res.success) {
      if (createUserType.value === 1) {
        successDialog.show = true
        successDialog.detail = {
          userName: res.data?.userName,
          password: params.password,
          secretId: res.data?.secretList?.[0]?.secretId || '',
          secretKey: res.data?.secretList?.[0]?.secretKey || '',
        }
      } else {
        message.success(t('role.createSuccess'))
        backRoute()
      }

      accessUserStore.clearAll()
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const handleCopy = (detail: any) => {
  handleCopyValue(t('user.createSuccessCopy', [detail.userName, detail.password, detail.secretId, detail.secretKey]))
  message.success(t('domainSet2.copySuccess'))
}

const handleSuccessConfirm = () => {
  successDialog.show = false
  backRoute()
}

const handleRoleSelectionChange = (selection: any[]) => {
  selectedRoleList.value = selection
}

const getUserRoleList = async () => {
  try {
    roleLoading.value = true
    const res = await _getUserRoleList({ id: user.value.id, pageIndex: 1, pageSize: 9999 })
    if (res.success) {
      roleList.value = res.data?.list || []
      nextTick(() => {
        selectedRoleList.value.forEach(row => {
          const matched = roleList.value.find(item => item.id === row.id)
          if (matched) userRoleTableRef.value?.toggleRowSelection(matched, true)
        })
      })
    }
  } catch (error) {
    console.log(error)
  } finally {
    roleLoading.value = false
  }
}

const getMessageType = async () => {
  const res = await _getMessageType()
  if (res.success) {
    messageTypeList.value = res.data || []
  }
}

watch(
  () => userOperateForm.pwd,
  value => {
    if (!value) {
      pwdRules.value.forEach(item => {
        item.right = false
      })
      return
    }

    pwdRules.value[0].right = value.length > 8 && value.length < 32
    pwdRules.value[1].right = PWD_REG.test(value)
    pwdRules.value[2].right = value !== userInfoForm.name
    pwdRules.value[3].right = PWD_REG.test(value)
  },
)

watch(
  () => stepActive.value,
  value => {
    saveDraft()
    if (value === 'c' && !roleList.value.length) {
      getUserRoleList()
    }
    if (value === 'd' && !messageTypeList.value.length) {
      getMessageType()
    }
  },
)

onBeforeMount(() => {
  restoreDraft()
})

onUnmounted(() => {
  accessUserStore.clearAll()
})
</script>

<style scoped lang="scss">
.access-user-create-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;

  // padding: 16px;
  background: #f2f4f7;
}

.access-user-create-v2__panel {
  background: #fff;
}

.access-user-create-v2__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 28px 0;
}

.access-user-create-v2__body.is-type-step {
  padding-top: 26px;
}

.access-user-create-v2__section,
.access-user-create-v2__review-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.access-user-create-v2__section--info {
  gap: 0;
}

.access-user-create-v2__section--operate {
  gap: 26px;
  padding-top: 10px;
}

.access-user-create-v2__form-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: 100%;
}

.access-user-create-v2__form-row--top {
  align-items: flex-start;
}

.access-user-create-v2__form-label {
  flex: 0 0 96px;

  // padding-top: 8px;
  // font-size: 14px;
  // line-height: 22px;
  color: #828b9c;
}

.access-user-create-v2__form-label--inline {
  display: flex;
  gap: 4px;
  align-items: center;

  :deep(svg) {
    width: 13px;
    height: 13px;
    color: #828b9c;
  }
}

:deep(.el-checkbox__label) {
  /* Body/常规 */
  font-family: 'Noto Sans CJK';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: #828b9c;
  text-overflow: ellipsis;
}

.access-user-create-v2__required {
  margin-left: 2px;
  color: #e54839;
}

.access-user-create-v2__type-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
}

.access-user-create-v2__type-item {
  position: relative;
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 126px;
  padding: 20px 24px;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf3;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: #b9d3ff;
  }

  &.is-active {
    background: rgb(0 102 255 / 2%);
    border-color: #06f;
  }
}

.access-user-create-v2__type-icon {
  display: inline-flex;
  flex: 0 0 50px;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  color: #06f;
  background: rgb(0 102 255 / 8%);
  border-radius: 50%;

  :deep(svg) {
    width: 24px;
    height: 24px;
  }
}

.access-user-create-v2__type-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.access-user-create-v2__type-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #191c23;
}

.access-user-create-v2__type-desc {
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.access-user-create-v2__type-corner {
  position: absolute;
  right: -1px;
  bottom: -1px;
  display: inline-flex;
  align-items: flex-end;
  justify-content: flex-end;
  width: 24px;
  height: 24px;
  overflow: hidden;
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
  color: #fff;
  background: #06f;

  span {
    position: absolute;
    right: 2px;
    bottom: 0;
    font-size: 12px;
    line-height: 1;
  }
}

.access-user-create-v2__table-wrap,
.access-user-create-v2__form-content {
  flex: 1;
  min-width: 0;
  max-width: 940px;
}

.access-user-create-v2__phone-field {
  display: flex;
  width: 100%;
  min-width: 0;
}

.access-user-create-v2__phone-select {
  flex: 0 0 84px;
  width: 84px;
}

.access-user-create-v2__phone-input {
  flex: 1;
  min-width: 0;
}

.access-user-create-v2__form-desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: #828b9c;
}

.access-user-create-v2__form-desc--compact {
  margin-top: 10px;
  font-size: 12px;
  line-height: 20px;
}

.access-user-create-v2__radio-group {
  display: flex;
  align-items: flex-start;
  line-height: 22px;
}

.access-user-create-v2__password-wrap {
  position: relative;
  width: 240px;
  margin: 12px 0 8px;
}

.access-user-create-v2__password-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 10;
  width: 280px;
  padding: 8px 12px;
  background: #fff;
  box-shadow: 0 0 11px 0 rgb(165 196 239 / 52%);
}

.access-user-create-v2__switch-field {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.access-user-create-v2__switch-line {
  display: inline-flex;
  gap: 12px;
  align-items: center;
  min-height: 22px;
}

.access-user-create-v2__switch-label {
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.access-user-create-v2__password-item {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 0;
  font-size: 12px;
  line-height: 20px;
  color: #828b9c;

  + .access-user-create-v2__password-item {
    margin-top: 6px;
  }
}

.access-user-create-v2__notice-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 0;
  }
}

.access-user-create-v2__section-title-row {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.access-user-create-v2__section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: #191c23;
}

.access-user-create-v2__section-subtitle {
  font-size: 16px;
  line-height: 22px;
  color: #828b9c;
}

.access-user-create-v2__self-key {
  margin-top: 4px;
}

.access-user-create-v2__review-section {
  gap: 20px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e8ecf3;

  &:last-of-type {
    padding-bottom: 0;
    border-bottom: 0;
  }
}

.access-user-create-v2__review-section--table {
  gap: 16px;
}

.access-user-create-v2__review-section .access-user-create-v2__section-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.access-user-create-v2__info-list {
  display: flex;
  flex-direction: column;
  max-width: 520px;
}

.access-user-create-v2__info-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;

  + .access-user-create-v2__info-row {
    margin-top: 20px;
  }

  span:first-child {
    flex: 0 0 110px;
    font-size: 14px;
    line-height: 20px;
    color: #555;
  }

  span:last-child {
    font-size: 14px;
    line-height: 20px;
    color: #191c23;
  }
}

.access-user-create-v2__summary-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.access-user-create-v2__summary-label {
  flex: 0 0 110px;
  font-size: 14px;
  line-height: 20px;
  color: #555;
}

.access-user-create-v2__message-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
}

.access-user-create-v2__message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.access-user-create-v2__message-check {
  position: relative;
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  margin-top: 3px;
  border: 1px solid #d0d7e2;

  &.is-checked {
    background: #06f;
    border-color: #06f;
  }

  &.is-checked::after {
    position: absolute;
    top: 0;
    left: 3px;
    font-size: 12px;
    line-height: 14px;
    color: #fff;
    content: '✓';
  }
}

.access-user-create-v2__message-content {
  flex: 1;
  min-width: 0;
}

.access-user-create-v2__message-name {
  display: block;
  font-size: 14px;
  line-height: 22px;
  color: #191c23;
}

.access-user-create-v2__message-item p {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 22px;
  color: #828b9c;
}

.access-user-create-v2__footer {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px 28px 28px;
  margin-top: 22px;
  border-top: 1px solid #e8ecf3;
}

.access-user-create-v2__action-link {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  color: #1860f2;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.access-user-create-v2__dialog-desc {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 22px;
  color: #555;
}

.access-user-create-v2__success-table {
  margin-top: 16px;
}

.access-user-create-v2__secret-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.access-user-create-v2__secret-line {
  margin: 0 0 8px;
}

@media (width <= 1024px) {
  .access-user-create-v2__body {
    padding-right: 20px;
    padding-left: 20px;
  }

  .access-user-create-v2__form-row {
    flex-direction: column;
  }

  .access-user-create-v2__form-label {
    flex-basis: auto;
    padding-top: 0;
  }

  .access-user-create-v2__type-item {
    align-items: flex-start;
  }

  .access-user-create-v2__password-wrap,
  .access-user-create-v2__password-panel {
    width: 100%;
  }

  .access-user-create-v2__info-row {
    flex-direction: column;
    gap: 4px;
  }

  .access-user-create-v2__info-row span:first-child {
    flex-basis: auto;
  }

  .access-user-create-v2__summary-row {
    flex-direction: column;
    gap: 12px;
  }

  .access-user-create-v2__summary-label {
    flex-basis: auto;
  }

  .access-user-create-v2__footer {
    padding-right: 20px;
    padding-left: 20px;
  }
}

:deep(.el-radio) {
  height: auto !important;
}
</style>
