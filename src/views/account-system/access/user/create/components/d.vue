<template>
  <div class="d-wrap">
    <!-- user-info -->
    <div class="mb20">
      <el-table :data="[createUserInfoForm]" :highlight-current-row="false">
        <el-table-column prop="name" :label="t('user.userNames')" />
        <!-- <el-table-column prop="remark" label="备注"> </el-table-column> -->
        <el-table-column prop="phone" :label="t('user.phone')" />
        <el-table-column prop="email" :label="t('user.email')" />
      </el-table>
    </div>

    <!-- form -->
    <el-row class="form-wrap">
      <el-col :span="24" class="title mb20">
        {{ t('user.accessInfo') }}
      </el-col>
      <!-- 访问方式 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.accessMehod') }}</span>
        </div>
        <div>
          <span class="value">{{ createUserOperateForm.accessType ? t('user.access') : '-' }}</span>
        </div>
      </el-col>
      <!-- 控制台密码类型 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.consolePwdType') }}</span>
        </div>
        <div>
          <span class="value">{{
            createUserOperateForm.accessType === 1 ? t('user.autoPwd') : t('user.customPwd')
          }}</span>
        </div>
      </el-col>
      <!-- 需要重置密码 -->
      <el-col :span="24" class="df mb20">
        <div :class="labelWidthClass">
          <span class="key">{{ t('user.nextResetPwd') }}</span>
        </div>
        <div>
          <span class="value">{{ createUserOperateForm.nextResetPwd ? t('user.yes') : t('user.no') }}</span>
        </div>
      </el-col>
    </el-row>

    <!-- form -->
    <el-row class="form-wrap">
      <el-col :span="24" class="title mb20">
        {{ t('user.subscribeInfo') }}
      </el-col>
      <!-- 可接收消息类型 -->
      <el-col :span="24" class="mb20">
        <div class="df">
          <div :class="labelWidthClass">
            <span class="key">{{ t('user.msgType') }}</span>
          </div>

          <div>
            <!-- 财务消息 -->
            <div class="mb10">
              <el-checkbox v-model="checkList.finance" :label="t('user.finance')" name="type" />
              <p class="sub-text mt6">
                {{ t('user.financeDesc') }}
              </p>
            </div>
            <!-- 产品消息 -->
            <div class="mb10">
              <el-checkbox v-model="checkList.product" :label="t('user.product')" name="type" />
              <p class="sub-text mt6">
                {{ t('user.productDesc') }}
              </p>
            </div>
            <!-- 安全消息 -->
            <div class="mb10">
              <el-checkbox v-model="checkList.security" :label="t('user.security')" name="type" />
              <p class="sub-text mt6">
                {{ t('user.securityDesc') }}
              </p>
            </div>
            <!-- 猫云动态 -->
            <div class="mb10">
              <el-checkbox v-model="checkList.dynamic" :label="t('user.dynamic')" name="type" />
              <p class="sub-text mt6">
                {{ t('user.dynamicDesc') }}
              </p>
            </div>
            <!-- 运维消息 -->
            <div class="mb10">
              <el-checkbox v-model="checkList.operation" :label="t('user.operation')" name="type" />
              <p class="sub-text mt6">
                {{ t('user.operationDesc') }}
              </p>
            </div>
            <!-- 其他消息 -->
            <div class="mb10">
              <el-checkbox v-model="checkList.other" :label="t('user.other')" name="type" />
              <p class="sub-text mt6">
                {{ t('user.otherDesc') }}
              </p>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 权限信息 -->
    <div class="mb20 auth-wrap">
      <p class="title mb20">
        {{ t('user.permInfo') }}
      </p>
      <el-table :data="selectRoleList" :highlight-current-row="false">
        <el-table-column prop="roleName" :label="t('role.roleName')" />
        <!-- <el-table-column prop="number" label="角色载体"> </el-table-column> -->
      </el-table>
    </div>

    <div v-if="type === 1" class="btn-wrap">
      <el-button @click="emits('changeStep', 'c')">
        {{ t('user.prev') }}
      </el-button>
      <el-button :loading="loading" type="primary" @click="complete">
        {{ t('role.finish') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSubUserCreateStore, useUserStore } from '@/store'
import { storeToRefs } from 'pinia'
import { _getMessageType } from '@/apis/account-system/access/user'
import t from '@/utils/i18n'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

interface PropType {
  type: number
  loading: boolean
}

interface CheckList {
  finance: boolean
  product: boolean
  security: boolean
  dynamic: boolean
  operation: boolean
  other: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  type: 1,
  loading: false,
})
const { type } = toRefs(props)
const accessUserStore = useSubUserCreateStore()
const { createUserInfoForm, createUserOperateForm, selectRoleList, isSelf } = storeToRefs(accessUserStore)
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const emits = defineEmits<{
  (event: 'changeStep', stepStatus: string): void
  (event: 'create', params: any): void
}>()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w400px',
  [en]: 'key-wrap-w250px',
  [zh]: 'key-wrap-w150px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const messageTypelist = ref<any[]>([]) // 消息类型列表

// 消息类型
const checkList = reactive<CheckList>({
  finance: false, // 财务消息
  product: false, // 产品消息
  security: false, // 安全消息
  dynamic: false, // 动态消息
  operation: false, // 运维消息
  other: false, // 其他消息
})

// 完成
const complete = () => {
  const messageTypes: any[] = []

  const messageTypeMap = {
    finance: 'FINANCE',
    product: 'PRODUCT_SUBSCRIBE',
    security: 'SECURITY',
    dynamic: 'DYNAMIC',
    operation: 'OPERATION',
    other: 'OTHER',
  }

  for (const key in checkList) {
    if (checkList[key]) {
      messageTypes.push(messageTypeMap[key])
    }
  }

  const params = {
    parentId: user.value.id,
    password: createUserOperateForm.value.pwd,
    userType: 1,
    userName: createUserInfoForm.value.name,
    remark: createUserInfoForm.value.remark,
    areaCode: '+86',
    mobile: createUserInfoForm.value.phone,
    email: createUserInfoForm.value.email,
    accessMethod: createUserOperateForm.value.accessType ? 1 : 0,
    loginProtect: createUserOperateForm.value.loginSecure ? 1 : 0,
    operateProtect: createUserOperateForm.value.operateSecure ? 1 : 0,
    roleIds: selectRoleList.value.map(el => el.id),
    isSecret: isSelf.value ? 1 : 0,
    resetPassword: createUserOperateForm.value.nextResetPwd ? 1 : 0,
    messageTypes,
  }

  emits('create', params)
}

// 可接受消息类型列表
const getMessageType = async () => {
  const res = await _getMessageType()
  console.log(`_getMessageType===>`, res)
  if (res.success) {
    // messageTypelist.value = res.data || []
    const data = res.data || []

    messageTypelist.value = data.map(el => ({
      ...el,
      check: false,
    }))
  }
}

onMounted(() => {
  getMessageType()
})
</script>

<style lang="scss" scoped>
.d-wrap {
  .form-wrap {
    .title {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 16px;
      line-height: 22px;

      // font-weight: 500;
      color: var(--primary-text);
    }

    .sub-text {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--sub-text);
    }

    .key-wrap-w150px {
      flex-shrink: 0; // 禁止收缩
      width: 150px;
    }

    .key-wrap-w250px {
      flex-shrink: 0; // 禁止收缩
      width: 250px;
    }

    .key-wrap-w400px {
      flex-shrink: 0; // 禁止收缩
      width: 400px;
    }

    .key {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--common-text);
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
    }
  }

  .auth-wrap {
    font-family: PingFangSC, 'PingFang SC';
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    color: var(--primary-text);
  }
}

.btn-wrap {
  margin-top: 40px;
}
</style>
