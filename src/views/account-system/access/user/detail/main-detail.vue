<template>
  <div>
    <el-row class="mb20 top-wrap" justify="space-between" :gutter="20">
      <!-- user-info -->
      <el-col :span="16">
        <el-card shadow="never" class="page-box h180" :body-style="bodyStyle">
          <div class="h-full user-info-wrap">
            <!-- name -->
            <div class="df ac mb20">
              <div class="df ac">
                <span class="mr20 name">{{ detail.userName || detail.email }}</span
                ><el-tag>{{ t('overview.mainUser') }}</el-tag>
              </div>
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
                  <!-- <span class="value mr4">{{ detail.remark || '-' }}</span> -->
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
              </el-col>
              <!-- user-info-r -->
              <el-col :span="12">
                <!-- 安全邮箱 联系邮箱暂时不用-->
                <div class="mb20 df ac ml20">
                  <div class="key-wrap df ac" :class="labelWidthClass">
                    <span class="key mr4">{{ t('securitySetting.secureEmail') }}</span>
                  </div>
                  <!-- <span class="value">{{ detail.contactEmail}}</span> -->
                  <div>
                    <span class="value mr4">{{ detail.contactEmail }}</span>
                    <SvgIcon name="edit" @click="openModifyEmailDialog(modifyEmailDialogRef)" />
                  </div>
                </div>

                <!-- 上次登录IP -->
                <div class="mb20 df ac ml20">
                  <div class="key-wrap" :class="labelWidthClass">
                    <span class="key mr4">{{ t('user.lastLoginIp') }}</span>
                  </div>
                  <span class="value">{{ detail.lastLoginIp }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card shadow="never" class="page-box h180 operate-wrap" :body-style="bodyStyle">
          <!-- 快捷操作 -->
          <p class="title mb20">
            {{ t('user.quickOperate') }}
          </p>
          <el-row :gutter="20">
            <el-col class="mb20" :span="12">
              <div class="item text-primary cursor-pointer" @click="openSubMessageDialog(subMessageDialogRef)">
                {{ t('user.subscribeMsg') }}
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改安全邮箱 -->
    <ModifyEmailDialog ref="modifyEmailDialogRef" :user="detail" @success="getAccessUserInfo" />
    <!-- 订阅消息 -->
    <SubMessageDialog
      ref="subMessageDialogRef"
      :recipient="detail.email"
      :contact-email="detail.contactEmail"
      :tg-bing="detail.tgChatId ? true : false"
      @update-detail="getAccessUserInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { _getAccessUserInfo } from '@/apis/account-system/access/user'
import SubMessageDialog from './components/sub-message-dialog.vue'
import { message } from '@/utils/message'
import { _updateVcUser } from '@/apis/account-system/user'
import t from '@/utils/i18n'
import ModifyEmailDialog from './components/modify-email-dialog.vue'
import { useI18nStyle } from '@/hooks/use-i18n-style'
import { LANGUAGE_MAP } from '@/config/constant-config'

const route = useRoute()

const ja = LANGUAGE_MAP.ja.i18nParam
const en = LANGUAGE_MAP.en.i18nParam
const zh = LANGUAGE_MAP.zh.i18nParam
const labelWidthClassMap = {
  [ja]: 'key-wrap-w160px',
  [en]: 'key-wrap-w120px',
  [zh]: 'key-wrap-w120px',
}

const labelWidthClass = useI18nStyle(labelWidthClassMap)

const bodyStyle = { height: '100%' }
const showEiditRemark = ref<boolean>(false) // 是否修改备注
const remark = ref<string>('') // 修改备注
const id = ref<number>(Number(route.params.id) as number) // id
const detail = ref<any>({}) // 用户详情

const subMessageDialogRef = ref<InstanceType<typeof SubMessageDialog>>() // 订阅消息
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

// 订阅消息弹窗展示
const openSubMessageDialog = (ins: any) => {
  if (!ins) return
  ins.show = true
}

// 获取用户详情
const getAccessUserInfo = async () => {
  const res = await _getAccessUserInfo({
    id: id.value,
  })

  console.log(`_getStrategyList===>`, res)

  if (res.success) {
    detail.value = res.data || {}
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

.h180 {
  height: 180px;
}
</style>
