<template>
  <div class="domains-set-func">
    <div class="func-title">
      {{ t('domainSet2.funcSet') }}
    </div>
    <div class="func-content">
      <!-- 分为左右 -->
      <div class="func-left">
        <!-- TTL -->
        <div class="func-box ttl">
          <div class="func-box-header">
            <div class="func-box-title">
              {{ t('domainSet2.ttlTitle') }}
            </div>
            <el-select :model-value="info?.ttl" class="ttl-select" :disabled="loading" @change="ttlChange">
              <el-option v-for="item in TTLOption" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </div>
          <div class="func-box-tip">
            {{ t('domainSet2.ttlTip') }}
          </div>
        </div>
        <!-- 域名锁定 -->
        <div class="func-box lock">
          <div class="func-box-header">
            <div class="func-box-title">
              {{ t('domainSet2.lockTitle') }}
            </div>
            <el-switch :model-value="Boolean(info?.lockStatus === 1)" :loading="funcLoading" @click="handleLock" />
          </div>
          <div class="func-box-tip">
            {{ t('domainSet2.lockTip') }}
          </div>
          <div class="func-box-alert" :class="info?.lockStatus === 1 ? 'is-warning' : 'is-success'">
            {{ info?.lockStatus === 1 ? t('domainSet2.lockStatus1') : t('domainSet2.lockStatus0') }}
          </div>
        </div>
        <!-- 删除域名 -->
        <div class="func-box delete">
          <div class="func-box-header">
            <div class="func-box-title">
              {{ t('domainSet2.deleteTitle') }}
            </div>
            <el-button type="primary" :disabled="loading || funcLoading" @click="() => (deleteDialog = true)">
              {{ t('domainSet2.deleteTitle') }}
            </el-button>
          </div>
          <div class="func-box-tip">
            {{ t('domainSet2.deleteTip', { count: info?.parseCount || 0 }) }}
          </div>
          <div class="func-box-alert is-danger">
            {{ t('domainSet2.deleteTip2') }}
          </div>
        </div>
      </div>
      <div class="func-right">
        <!-- 暂停/开启解析 -->
        <div class="func-box status">
          <div class="func-box-header">
            <div class="func-box-title">
              {{ t('domainSet2.parseTitle') }}
            </div>
            <el-switch
              v-if="info?.status !== 3"
              :model-value="Boolean(info?.status === 1)"
              :loading="funcLoading"
              @click="changeStatus"
            />
          </div>
          <div class="func-box-tip">
            {{ t('domainSet2.parseTip') }}
          </div>
          <div v-if="info?.status === 3" class="func-box-alert is-danger">
            {{ t('domainSet2.parseStatus3') }}
          </div>
        </div>
        <!-- 域名解锁密码管理 -->
        <div class="func-box pwd">
          <div class="func-box-title">
            {{ t('domainSet2.pwdTitle') }}
          </div>
          <div class="func-box-cont-pwd">
            <el-form
              ref="func_form"
              :model="form"
              :rules="rules"
              :hide-required-asterisk="true"
              label-width="auto"
              label-position="left"
              @validate="formValidate"
            >
              <el-form-item :label="t('domainSet2.pwdLabel1')" prop="old_pwd" class="error-icon">
                <el-input
                  v-model.trim="form.old_pwd"
                  type="password"
                  autocomplete="off"
                  style="width: 360px"
                  :placeholder="t('domainSet2.pwdPlaceholder1')"
                  show-password
                />
              </el-form-item>
              <el-form-item :label="t('domainSet2.pwdLabel2')" prop="new_pwd" class="error-icon">
                <el-input
                  v-model.trim="form.new_pwd"
                  type="password"
                  autocomplete="off"
                  style="width: 360px"
                  :placeholder="t('domainSet2.pwdPlaceholder2')"
                  show-password
                />
              </el-form-item>
              <el-form-item :label="t('domainSet2.pwdLabel3')" prop="re_pwd" class="error-icon">
                <el-input
                  v-model.trim="form.re_pwd"
                  type="password"
                  autocomplete="off"
                  style="width: 360px"
                  :placeholder="t('domainSet2.pwdPlaceholder3')"
                  show-password
                />
              </el-form-item>
              <el-form-item label=" " class="bt">
                <div class="btn-wrap">
                  <el-button plain :disabled="funcLoading" @click="() => (forgetPwdDialog = true)">
                    {{ t('domainSet2.pwdForget') }}
                  </el-button>
                  <el-button
                    type="primary"
                    :loading="funcLoading"
                    :disabled="!form.old_pwd || !form.new_pwd"
                    @click="pwdConfirm(func_form)"
                  >
                    {{ t('domainSet2.pwdConfirm') }}
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
    <!-- 域名解锁(需要输入密码) -->
    <UnlockDialog v-model:dialog="unlockDialog" :domain-id="info?.id || ''" @success="finish" />
    <!-- 设置域名解锁密码 -->
    <UnlockPasswordDialog v-model:dialog="setLockPwdDialog" :domain-id="info?.id || ''" @success="finish" />
    <!-- 忘记域名锁密码 -->
    <ForgetPwdDialog
      v-model:dialog="forgetPwdDialog"
      :domain-id="info?.id || ''"
      :domain-name="info?.domainName || ''"
      @success="finish"
    />
    <!-- 删除域名 -->
    <CatDialog
      v-model:dialog="deleteDialog"
      :title="t('domainSet2.deleteTitle')"
      icon="tip-error"
      @confirm="deleteConfirm"
    >
      {{ t('domainSet2.deleteTip3') }}
    </CatDialog>
    <!-- 修改M优化:改在解析列表去了 -->
  </div>
</template>

<script setup lang="ts">
import {
  _changeDomainInfo,
  _changeDomainPassword,
  _deleteDomains,
  _domainLock,
  _changeDomainX,
} from '@/apis/dns/domain'
import { BasicInfoData } from './config'
import t from '@/utils/i18n'
import UnlockDialog from '../my-domains/unlock-dialog.vue'
import UnlockPasswordDialog from '../my-domains/unlock-password-dialog.vue'
import ForgetPwdDialog from './forget-pwd-dialog.vue'
import { _md5 } from '@/utils/md5'

import { message } from '@/utils/message'
import type { FormInstance } from 'element-plus/es'
import { replaceRoute } from '@/utils/router-jump'
const props = withDefaults(
  defineProps<{
    info: BasicInfoData | undefined
    loading?: boolean
    id?: string
  }>(),
  {},
)

const emit = defineEmits<{
  (event: 'refresh'): void
}>()
const func_form = ref()
const funcLoading = ref(false) // loading
const deleteDialog = ref(false) // 删除
const unlockDialog = ref(false) // 解锁
const setLockPwdDialog = ref(false) // 设置密码
const forgetPwdDialog = ref(false) // 忘记密码

const checkOld = async (rule: any, value: any, callback: any) => {
  callback()
}
const checkPwd = (rule: any, value: any, callback: any) => {
  callback()
}
const checkRePwd = (rule: any, value: any, callback: any) => {
  if (value !== form.value.new_pwd) {
    callback(new Error(t('domainSet2.pwdSamleValidate')))
  } else {
    callback()
  }
}
const form = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: '',
})
const rules = ref<any>({
  old_pwd: [{ validator: checkOld, trigger: 'blur' }],
  new_pwd: [{ validator: checkPwd, trigger: 'blur' }],
  re_pwd: [{ validator: checkRePwd, trigger: 'blur' }],
})

const validateErr = ref({
  old_pwd: true,
  new_pwd: true,
  re_pwd: true,
})

// const xDialog = ref(false) // M优化设置
// const xLoading = ref(false)

// const sensitivityArr = [
//   { label: t('domainSet2.highSensitivity'), value: 2 },
//   { label: t('domainSet2.lowSensitivity'), value: 1 },
//   { label: t('domainSet2.noOpen'), value: 0 },
// ]

// const xForm = ref({
//   xOptimize: false,
//   sensitivity: 0,
//   maxReturn: 1
// })

// const handleX = () => {
//   xDialog.value = true
// }

// const handleXconfirm = async () => {
//   if (!props.id) {
//     console.log('未获取到域名id');
//     return
//   }
//   try {
//     xLoading.value = true
//     const { code, data } = await _changeDomainX({
//       domainId: Number(props.id),
//       xOptimizeState: Number(xForm.value.xOptimize),
//       sensitivity: xForm.value.sensitivity,
//       maxReturn: xForm.value.maxReturn
//     })
//     xLoading.value = false
//     if (code === 200) {
//       message.success(t('common.operationSuccess'))
//       emit('refresh')
//       xDialog.value = false
//     }
//   } catch (error) {
//     console.log('修改x失败', error);
//     xLoading.value = false
//   }
// }

// watch(() => props.info, (d: any) => {
//   if (d) {
//     xForm.value.xOptimize = Boolean(d.xOptimize)
//     xForm.value.sensitivity = d.sensitivity
//     xForm.value.maxReturn = d.maxReturn
//   }
//   console.log('回显', d);

// }, { deep: true, immediate: true })

// 任一校验触发
const formValidate = (key: any, right: boolean): any => {
  validateErr.value[key] = right
  console.log('formValidate', validateErr.value)
}

// ttl
const ttlChange = async (ttl: number) => {
  if (props.info) {
    try {
      funcLoading.value = true
      const { code } = await _changeDomainInfo({
        domainId: Number(props.info.id),
        ttl,
        status: props.info.status,
        remark: props.info.remark,
      })
      funcLoading.value = false
      if (code === 200) {
        emit('refresh')
        message.success(t('common.changeSuccess'))
      }
    } catch (error) {
      funcLoading.value = false
    }
  }
}

// lock
const handleLock = async () => {
  if (!props.info) return

  // 第一步判断是否设置了密码
  try {
    if (props.info.lockPwd === 0) {
      setLockPwdDialog.value = true
      // 未设置密码, 现在设置密码
    } /*已经设置密码*/ else {
      if (props.info.lockStatus === 1) {
        // 开始解锁 -> 要输密码
        unlockDialog.value = true
      } else {
        funcLoading.value = true
        // 锁定不需要输密码
        const { code } = await _domainLock({
          type: 'lock',
          domainId: props.info.id,
          password: '',
        })
        funcLoading.value = false
        if (code === 200) {
          message.success(t('common.operationSuccess'))
          emit('refresh')
        }
      }
    }
  } catch (error) {
    funcLoading.value = false
  }
}

// 删除域名
const deleteConfirm = async () => {
  if (!props.info) return
  try {
    funcLoading.value = true
    const { code } = await _deleteDomains({
      domainId: props.info.id,
    })
    funcLoading.value = false
    if (code === 200) {
      message.success(t('common.deleteSuccess'))
      deleteDialog.value = false
      funcLoading.value = false
      replaceRoute({
        name: 'MyDomains',
      })
    }
  } catch (error) {
    funcLoading.value = false
  }
}

// 域名解析状态
const changeStatus = async () => {
  if (!props.info) return
  try {
    funcLoading.value = true
    const { code } = await _changeDomainInfo({
      domainId: Number(props.info.id),
      ttl: props.info.ttl,
      status: props.info.status === 1 ? 2 : 1,
      remark: props.info.remark,
    })
    funcLoading.value = false
    if (code === 200) {
      emit('refresh')
    }
  } catch (error) {
    funcLoading.value = false
  }
}

// 密码修改
const pwdConfirm = (formEl: FormInstance | undefined) => {
  if (!props.info) return
  if (!formEl) return
  formEl.validate(async valid => {
    if (valid) {
      console.log('submit!')
      // pwdReset(formEl);
      try {
        funcLoading.value = true
        const { code } = await _changeDomainPassword({
          domainId: Number(props.info?.id),
          originalPassword: _md5(form.value.old_pwd),
          newlPassword: _md5(form.value.new_pwd),
        })
        funcLoading.value = false
        if (code === 200) {
          message.success(t('common.changeSuccess'))
          emit('refresh')
          formEl.resetFields()
        }
      } catch (error) {
        funcLoading.value = false
      }
    } else {
      console.log('error submit!')
      funcLoading.value = false
      return false
    }
  })
}

const finish = () => {
  emit('refresh')
}

const TTLOption = [
  { label: '600', value: 600 },
  { label: '1800', value: 1800 },
  { label: '3600', value: 3600 },
]
</script>

<style scoped lang="scss">
.domains-set-func {
  color: #191c23;

  .func-title {
    display: none;
  }

  .func-content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    width: 100%;

    & > div {
      min-width: 0;
    }

    .func-left,
    .func-right {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .func-box {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      margin-bottom: 0;
      font-weight: 400;
      background: #fff;

      &.ttl {
        min-height: 0;
      }

      &.lock {
        min-height: 0;
      }

      &.delete {
        min-height: 0;
      }

      &.status {
        min-height: 0;
      }

      &.pwd {
        // flex: 1;
        min-height: 0;
      }

      &.x {
        .func-box-title {
          display: flex;
          align-items: center;

          svg {
            width: 16px;
            height: 16px;
            margin-left: 4px;
          }
        }

        :deep(.x-form) {
          .el-form-item {
            height: 22px;
            line-height: 22px;

            .el-form-item__label-wrap {
              height: 22px;
              line-height: 22px;

              .el-form-item__label {
                height: 100%;
                line-height: 22px;
              }
            }

            .el-form-item__content {
              align-items: center;
              line-height: 22px;
            }
          }
        }

        .xStatus {
          color: var(--error-color);

          &.active {
            color: var(--success-color);
          }

          svg {
            color: #555;
          }
        }
      }

      .func-box-header {
        display: flex;
        gap: 24px;
        align-items: center;
        justify-content: space-between;
        min-height: 32px;
      }

      .func-box-title {
        margin-bottom: 0;
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: #191c23;
      }

      .func-box-tip {
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;
        color: #828b9c;

        &.error {
          color: var(--error-color);
        }
      }

      .func-box-alert {
        padding: 8px 12px;
        font-size: 14px;
        line-height: 22px;

        &.is-warning {
          color: #ff720d;
          background: #fff6ed;
        }

        &.is-danger {
          color: #e54839;
          background: #fff1f0;
        }

        &.is-success {
          color: #17a676;
          background: #eaf8f2;
        }
      }

      .func-box-cont {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: var(--common-text);

        .func-box-cont-label {
          margin-right: 20px;
          font-size: 14px;
          font-weight: 400;
          color: #828b9c;
        }

        // 删除域名
        &.delete {
          // placeholder
        }
      }

      .func-box-cont-pwd {
        width: 100%;

        :deep(.el-form) {
          .el-form-item {
            margin-bottom: 20px;

            .el-form-item__label-wrap {
              // placeholder
            }

            .el-form-item__label {
              color: #828b9c;
            }

            .el-form-item__content {
              display: flex;
              min-width: 360px;

              .el-form-item__error {
                left: 0;
              }

              .btn-wrap {
                display: flex;
                gap: 20px;
                align-items: center;
                justify-content: flex-end;
                width: 100%;
              }
            }

            &.bt {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }
}

.ttl-select {
  width: 120px;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #06f;
  border-color: #06f;
}

:deep(.el-button) {
  border-radius: 0;
}
</style>
