<template>
  <div>
    <el-row class="mb20 top-wrap" justify="space-between" :gutter="20">
      <!-- user-info -->
      <el-col :span="16">
        <el-card shadow="never" class="page-box h216" :body-style="bodyStyle">
          <div class="h-full user-info-wrap">
            <!-- name -->
            <div class="df ac mb20">
              <span class="mr20 name">{{ detail.userName }}</span
              ><el-tag>{{ t('account.subuser') }}</el-tag>
            </div>
            <el-row>
              <!-- user-info-l -->
              <el-col :span="12" class="border-r-1">
                <!-- 账号ID -->
                <div class="mb20 df ac">
                  <div class="key-wrap" :class="labelWidthClass">
                    <span class="key">{{ t('account.accountID') }}</span>
                  </div>
                  <span class="value">{{ detail.id }}</span>
                </div>

                <!-- 备注 -->
                <div class="df ac" :class="showEiditRemark ? 'mb13 mt-negative-6' : 'mb20'">
                  <div class="key-wrap" :class="labelWidthClass">
                    <span class="key">{{ t('user.remark') }}</span>
                  </div>
                  <div>
                    <template v-if="!showEiditRemark">
                      <div>
                        <span class="value mr4">{{ detail.remark || '-' }}</span>
                        <SvgIcon name="edit" @click="handleRemark" />
                      </div>
                    </template>
                    <!-- 修改备注 -->
                    <template v-else>
                      <div class="df ac">
                        <div class="edit-userName-input mr20">
                          <el-input v-model.trim="remark" maxlength="30" />
                        </div>
                        <div class="edit-userName-btn-wrap">
                          <span class="mr20 text-primary cursor-pointer" @click="changeUserInfo">{{
                            t('common.save')
                          }}</span>
                          <span class="text-primary cursor-pointer" @click="showEiditRemark = false">{{
                            t('common.cancel')
                          }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- 访问方式 -->
                <div class="df ac">
                  <div class="key-wrap df ac" :class="labelWidthClass">
                    <span class="key mr4">{{ t('user.accessMehod') }}</span>
                    <el-tooltip :content="t('user.accessMehodTooltip')" placement="top" effect="light">
                      <SvgIcon name="cat-cdn-warning" style="width: 17px; height: 17px" />
                    </el-tooltip>
                  </div>
                  <span class="value">{{ detail.accessMethod == 1 ? t('user.access') : '-' }}</span>
                </div>
              </el-col>
              <!-- user-info-r -->
              <el-col :span="12">
                <!-- 安全手机 -->
                <div class="mb20 df ac ml20">
                  <div class="key-wrap" :class="labelWidthClass">
                    <span class="key mr4">{{ t('securitySetting.securePhone') }}</span>
                  </div>
                  <div>
                    <span v-if="detail.mobile" class="value mr4">{{ detail.areaCode }}</span>
                    <span class="value mr4">{{ detail.mobile || '-' }}</span>
                    <SvgIcon name="edit" @click="openModifyPhoneDialog(modifyPhoneDialogRef)" />
                  </div>
                </div>

                <!-- 安全邮箱 -->
                <div class="mb20 df ac ml20">
                  <div class="key-wrap" :class="labelWidthClass">
                    <span class="key mr4">{{ t('securitySetting.secureEmail') }}</span>
                  </div>
                  <div>
                    <span class="value mr4">{{ detail.contactEmail }}</span>
                    <SvgIcon name="edit" @click="openModifyEmailDialog(modifyEmailDialogRef)" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card shadow="never" class="page-box h216 operate-wrap" :body-style="bodyStyle">
          <p class="title mb20">
            {{ t('user.quickOperate') }}
          </p>
          <el-row :gutter="20">
            <el-col class="mb20" :span="12">
              <div class="item text-primary cursor-pointer" @click="openSubMessageDialog(subMessageDialogRef)">
                {{ t('user.subscribeMsg') }}
              </div>
            </el-col>
            <el-col class="mb20" :span="12">
              <div class="item text-primary cursor-pointer" @click="openDeleteUserDialog(deleteUserDialogRef)">
                {{ t('user.deleteUser') }}
              </div>
            </el-col>
            <el-col class="mb20" :span="12">
              <div class="item text-primary cursor-pointer" @click="openDisableUserDialog(disableUserDialogRef)">
                {{ t('user.disableUser') }}
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <!-- bottom-wrap -->
    <el-card shadow="never" class="page-box bottom-wrap" :body-style="{ ...bodyStyle, paddingTop: 0 }">
      <CatTabs v-model="active" :tabs="tabs" @change="() => {}">
        <!-- 角色策略 -->
        <CatTabPane :value="1">
          <RoleStrategy />
        </CatTabPane>
        <!-- 服务 -->
        <CatTabPane :value="2">
          <Service />
        </CatTabPane>
        <!-- 安全 -->
        <CatTabPane :value="3">
          <Secure :detail="detail" @success="getAccessUserInfo" />
        </CatTabPane>
        <!-- api密钥 -->
        <CatTabPane :value="4">
          <ApiSecretKey :list="detail.secretList" :loading="loading" @success="getAccessUserInfo" />
        </CatTabPane>
      </CatTabs>
    </el-card>
    <!-- 修改安全手机 -->
    <ModifyPhoneDialog ref="modifyPhoneDialogRef" :user="detail" @success="getAccessUserInfo" />
    <!-- 修改安全邮箱 -->
    <ModifyEmailDialog ref="modifyEmailDialogRef" :user="detail" @success="getAccessUserInfo" />
    <!-- 订阅消息 -->
    <SubMessageDialog
      ref="subMessageDialogRef"
      :recipient="detail.userName"
      :contact-email="detail.contactEmail"
      :tg-bing="detail.tgChatId ? true : false"
      @update-detail="getAccessUserInfo"
    />
    <!-- 删除用户 -->
    <DeleteUserDialog ref="deleteUserDialogRef" :ids="[id]" :list="[detail]" />
    <!-- 禁用用户 -->
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
import RoleStrategy from './components/role-strategy.vue'
import ModifyPhoneDialog from './components/modify-phone-dialog.vue'
import ModifyEmailDialog from './components/modify-email-dialog.vue'
import DeleteUserDialog from './components/delete-user-dialog.vue'
import DisableUserDialog from './components/disable-user-dialog.vue'
import SubMessageDialog from './components/sub-message-dialog.vue'
import Secure from './components/secure.vue'
import ApiSecretKey from './components/api-secret-key.vue'
import Service from './components/service.vue'
import { _updateVcUser } from '@/apis/account-system/user'
import { message } from '@/utils/message'
import t from '@/utils/i18n'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const route = useRoute()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w160px',
  [en]: 'key-wrap-w140px',
  [zh]: 'key-wrap-w120px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const bodyStyle = { height: '100%' }
const showEiditRemark = ref<boolean>(false) // 是否修改备注
const remark = ref<string>('') // 修改备注
const active = ref(1)
const id = ref<number>(Number(route.params.id) as number) // id
const detail = ref<any>({}) // 用户详情
const tabs = [
  { label: t('user.roleStrategy'), value: 1 },
  { label: t('user.serve'), value: 2 },
  { label: t('user.safety'), value: 3 },
  { label: t('user.apiKey'), value: 4 },
]
const loading = ref<boolean>(false)

const subMessageDialogRef = ref<InstanceType<typeof SubMessageDialog>>() // 订阅消息
const deleteUserDialogRef = ref<InstanceType<typeof DeleteUserDialog>>() // 删除用户
const disableUserDialogRef = ref<InstanceType<typeof DisableUserDialog>>() // 禁用用户
const modifyPhoneDialogRef = ref<InstanceType<typeof ModifyPhoneDialog>>() // 修改安全手机
const modifyEmailDialogRef = ref<InstanceType<typeof ModifyEmailDialog>>() // 修改安全邮箱

// 点击编辑备注
const handleRemark = () => {
  showEiditRemark.value = true
}

// 显示安全邮箱弹窗
const openModifyEmailDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 显示安全手机弹窗
const openModifyPhoneDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 显示订阅消息弹窗
const openSubMessageDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 显示删除用户弹窗
const openDeleteUserDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 显示禁用用户弹窗
const openDisableUserDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 获取用户详情
const getAccessUserInfo = async () => {
  try {
    const res = await _getAccessUserInfo({
      id: id.value,
    })

    console.log(`_getStrategyList===>`, res)

    if (res.success) {
      detail.value = res.data || {}
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 修改用户信息
const changeUserInfo = async () => {
  if (!remark.value) {
    return message.warning(t('user.remarkWarn'))
  }

  const res = await _updateVcUser({
    id: Number(route.params.id) as number,
    remark: remark.value,
  })

  if (res.success) {
    message.success(t('account.changeSuccess'))
    showEiditRemark.value = false
    getAccessUserInfo()
  } else {
    message.warning(t('account.changeFail'))
  }
}

// 路由
watch(
  () => route.params.id,
  () => {
    id.value = Number(route.params.id) as number
    getAccessUserInfo()
  },
)

onMounted(() => {
  getAccessUserInfo()
})
</script>

<style lang="scss" scoped>
.top-wrap {
  .user-info-wrap {
    .name {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 24px;
      line-height: 33px;

      // font-weight: 500;
      color: var(--table-text);
    }

    .mb13 {
      margin-bottom: 13px;
    }

    .mt-negative-6 {
      margin-top: -6.5px;
    }

    .key-wrap {
      width: 120px;

      .key {
        font-family: PingFangSC, 'PingFang SC';
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
        color: var(--common-text);
      }
    }

    .key-wrap-w120px {
      width: 120px;
    }

    .key-wrap-w140px {
      width: 140px;
    }

    .key-wrap-w160px {
      width: 160px;
    }

    .value {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: var(--primary-text);
    }

    .border-r-1 {
      border-right: 1px solid var(--border-c);
    }
  }

  .operate-wrap {
    .title {
      font-family: PingFangSC, 'PingFang SC';
      font-size: 18px;
      line-height: 25px;

      // font-weight: 500;
      color: var(--primary-text);
    }

    .item {
      height: 34px;
      line-height: 34px;
      text-align: center;
      background: #f9fafc;
      border-radius: 4px;
    }
  }
}

.edit-userName-input {
  max-width: 180px;
  height: 34px;
}

.h216 {
  height: 216px;
}
</style>
