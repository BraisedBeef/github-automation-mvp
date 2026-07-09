<template>
  <CatDialog
    :dialog="dialog"
    :title="state.type === 4 ? t('myDomains.getBackDomain') : t('common.addDomains')"
    width="550px"
    :close-on-click-modal="false"
    @update:dialog="(v: boolean) => !v && close()"
  >
    <div class="content">
      <template v-if="state.type !== 4">
        <el-form ref="dns_form" :model="state.form" label-position="left" label-width="auto" @validate="formValidate">
          <el-form-item
            :hide-required-asterisk="false"
            prop="name"
            :label="t('columns.domain')"
            class="name error-icon"
            :rules="state.rules.name"
          >
            <el-input
              v-model.trim="state.form.name"
              :max-length="63"
              :disabled="state.type === 3"
              style="width: 360px"
              :placeholder="t('myDomains.addDomainPlaceholder')"
            />
          </el-form-item>

          <!-- Type1: tip提示 -->
          <template v-if="state.type === 1">
            <el-form-item label=" " class="fi">
              <!-- 国内 -->
              <div v-if="baseStore.projectType == '1'" class="dns-add-tip">
                <div>{{ t('myDomains.addDomainTip1') }}</div>
                <div>{{ t('myDomains.addDomainTip2') }}</div>
                <div>{{ t('myDomains.addDomainTip3') }}</div>
                <div>
                  {{ t('myDomains.addDomainTip4') }}<span @click="authentication">{{ t('myDomains.verifyNow') }}</span>
                </div>
              </div>
              <!-- 国外 -->
              <div v-else class="dns-add-tip">
                <div>{{ t('myDomains.addDomainTip1') }}</div>
              </div>
            </el-form-item>
          </template>
          <!-- Type3: 提示取回域名 -->
          <template v-if="state.type === 3">
            <el-form-item label=" " class="item-3">
              <span>{{ state.form.name }}</span
              >{{ t('myDomains.addDomainTip7') }}
            </el-form-item>
          </template>
        </el-form>
      </template>

      <!-- 准备取回 -->
      <template v-if="state.type === 2">
        <div v-show="state.form.name && domainReg.test(state.form.name)" class="type2-tip">
          {{ t('myDomains.addDomainTip6a') }}
          <span>{{ fn(state.form.name) }}</span>
          {{ t('myDomains.addDomainTip6b') }}
        </div>
        <div class="type2-box">
          <el-form label-position="left" label-width="auto" class="form-2">
            <el-form-item v-for="(item, index) in boxConfig" :key="index" :label="item.label">
              {{ state.box[item.key] }}
            </el-form-item>
          </el-form>
        </div>
      </template>
      <!-- Type4: 进行取回域名 -->
      <template v-if="state.type === 4">
        <div class="type4-box-blue">
          <SvgIcon name="tip-error" />
          <div>{{ t('myDomains.addDomainTip8') }}</div>
        </div>
        <el-form label-position="left" label-width="auto" class="form-2">
          <el-form-item :label="t('columns.domain')" class="d">
            {{ state.form.name }}
          </el-form-item>
          <el-form-item :label="t('myDomains.fetchMethod')" class="backup">
            <div>
              <el-radio-group :model-value="1">
                <el-radio :label="1">
                  {{ t('myDomains.fetchTxt') }}
                </el-radio>
              </el-radio-group>
              <div class="type4-info-item-tip">
                {{ t('myDomains.addDomainTip9') }}
              </div>
            </div>
          </el-form-item>
        </el-form>

        <div class="type4-box">
          <el-form label-position="left" label-width="auto" class="form-2">
            <el-form-item v-for="(item, index) in boxConfig" :key="index" :label="item.label">
              {{ state.box[item.key] }}
            </el-form-item>
          </el-form>
        </div>
        <div class="type4-refresh">
          <span>
            {{ t('myDomains.addDomainTip10') }}
            <el-link type="primary" :disabled="state.loading" @click="handleRefresh">
              {{ t('common.refresh') }}
            </el-link>
          </span>
        </div>
        <div class="type4-result">
          {{ state.type4ErrorMsg }}
        </div>
      </template>
    </div>
    <!-- 按钮 -->
    <template #footer>
      <div class="cat-dialog-footer">
        <!-- 1.添加域名 -->
        <template v-if="state.type === 1">
          <el-button type="primary" :loading="state.loading" :disabled="!state.form.name" @click="domainAddValidate">
            {{ t('common.add') }}
          </el-button>
          <el-button @click="close">
            {{ t('common.cancel') }}
          </el-button>
        </template>
        <!-- 2.TXT校验 -->
        <template v-else-if="state.type === 2">
          <el-button
            :loading="state.loading"
            type="primary"
            :disabled="!state.form.name || !!state.txtCount"
            @click="txtValidate"
          >
            {{ t('common.add') }}
          </el-button>
          <el-button plain @click="close">
            {{ t('common.cancel') }}
          </el-button>
        </template>
        <!-- 3.准备取回域名 -->
        <template v-else-if="state.type === 3">
          <el-button type="primary" :disabled="!state.form.name" @click="toGetBack">
            {{ t('myDomains.fetchConfirm') }}
          </el-button>
          <el-button @click="clearDomain">
            {{ t('myDomains.fetchCancel') }}
          </el-button>
        </template>
        <!-- 4.正在取回域名 -->
        <template v-else>
          <el-button :disabled="state.loading" :loading="state.loading" type="primary" @click="getBackDomain">
            {{ t('common.confirm') }}
          </el-button>
          <el-button :disabled="state.loading" @click="handleBack">
            {{ t('common.back') }}
          </el-button>
        </template>
      </div>
    </template>
  </CatDialog>
</template>

<script setup lang="ts">
import { _addChildDomain, _addDomain, _addDomainValidate, _getBackDomain, _getDomainTxtInfo } from '@/apis/dns/domain'
import { useBaseStore } from '@/store'
import CatDialog from '@/components/common/cat-dialog/index.vue'
import t from '@/utils/i18n'

import { message } from '@/utils/message'
import { notify } from '@/utils/notification'
import { pushRoute } from '@/utils/router-jump'
const baseStore = useBaseStore()
const props = withDefaults(
  defineProps<{
    dialog: boolean
  }>(),
  {
    dialog: false,
  },
)
const emit = defineEmits<{
  (event: 'update:dialog', dialog: boolean): void
  (event: 'success'): void
}>()
// const domainReg = /^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}(?::\d{1,5})?$/;
const domainReg = /^(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}(?::\d{1,5})?$/
// 域名校验
const domainValidate = (rule: any, value: string, callback: (error?: string | Error) => void) => {
  if (!value) {
    callback(new Error(t('myDomains.addDomainEmpty')))
  } else if (value.length > 63) {
    state.form.name = state.form.name.trim().substring(0, 63)
  } else if (!domainReg.test(value)) {
    callback(new Error(t('myDomains.addDomainFormat')))
  } else {
    callback()
  }
}

const state = reactive<{
  loading: boolean
  form: { name: string }
  rules: { name: any[] }
  type: 1 | 2 | 3 | 4 // 1: 显示tip  2:添加子域名(txt校验) 3:提示取回域名 4:进行取回域名
  box: {
    [x: string]: string
    hostRecord: string // 主机记录
    recordType: string // 记录类型
    recordValue: string // 记录值
  }
  txtTimer: any
  txtCount: number
  type4ErrorMsg: string
}>({
  loading: false,
  form: { name: '' },
  rules: { name: [{ validator: domainValidate, trigger: 'blur' }] },
  type: 1,
  box: {
    hostRecord: '', // 主机记录
    recordType: '', // 记录类型
    recordValue: '', // 记录值
  },
  txtTimer: null,
  txtCount: 0,
  type4ErrorMsg: '',
})
const boxConfig = [
  { label: t('columns.hostRecord'), key: 'hostRecord' },
  { label: t('columns.recordType'), key: 'recordType' },
  { label: t('columns.recordValue'), key: 'recordValue' },
]
const dns_form = ref()

const validateErr = ref({
  name: true,
})

// 任一校验触发
const formValidate = (key: any, right: boolean): any => {
  validateErr.value[key] = right
  console.log('formValidate', validateErr.value, key, right)
}

const fn = name => {
  if (!name) return ''
  let _: string = ''
  const a = name.split('.')
  if (a.length > 1) {
    _ = a[a.length - 2] + '.' + a[a.length - 1]
  } else {
    _ = name
  }
  return _
}

// 添加域名(进行校验)
const domainAddValidate = async () => {
  try {
    await (dns_form.value as any).validateField()
    state.loading = true
    const { code, data } = await _addDomainValidate({
      domain: state.form.name.trim(),
    })
    state.loading = false
    const validateCode = data.code
    switch (validateCode) {
      case 200:
        // 校验通过, 直接添加
        addDomain()
        break
      case 10:
        // 准备去取回域名了, 获取一下txt信息
        state.type = 3
        break
      case 11:
        // 添加子域名
        getTXTvalidateInfo(2)
        break
      default:
        console.log('500了')
        notify.error({
          message: data.message,
          offset: 100,
          duration: 5000,
        })
        break
    }
  } catch (error) {
    state.loading = false
    console.log('校验失败', error)
  }
}

// 添加域名
const addDomain = async () => {
  try {
    state.loading = true
    const { code } = await _addDomain({ domain: state.form.name })
    state.loading = false
    if (code === 200) {
      message.success(t('common.addSuccess'))
      close()
      emit('success')
      state.form.name = ''
    }
  } catch (error) {
    state.loading = false
    console.log('添加域名失败')
  }
}

//TXT 校验
const txtValidate = async () => {
  try {
    if (!domainReg.test(state.form.name)) return
    if (state.txtCount) return
    // 开始验证
    state.loading = true
    const { code } = await _addChildDomain({ domain: state.form.name })
    state.loading = false
    if (code === 200) {
      message.success(t('common.addSuccess'))
      close()
      emit('success')
      state.form.name = ''
    } else {
      console.log('验证失败了')
      // 验证失败
      state.txtCount = 30
      state.txtTimer = setInterval(() => {
        --state.txtCount
        if (state.txtCount === 0) {
          clearTxtTimer()
        }
      }, 1000)
    }
  } catch (error) {
    console.log('txt校验失败', error)
    state.loading = false
  }
}

// 清除txt校验定时器
const clearTxtTimer = () => {
  clearInterval(state.txtTimer)
  state.txtCount = 0
  state.txtTimer = null
}
// 去取回域名
const toGetBack = () => {
  if (!domainReg.test(state.form.name)) return
  getTXTvalidateInfo(1)
}

// 刷新
const handleRefresh = () => {
  getTXTvalidateInfo(1)
}

// 取回域名
const getBackDomain = async () => {
  try {
    state.loading = true
    const { code, msg } = await _getBackDomain({ domain: state.form.name })
    state.loading = false
    if (code === 200) {
      message.success(t('common.addSuccess'))
      close()
      emit('success')
      state.form.name = ''
    } else {
      state.type4ErrorMsg = msg
    }
  } catch (error: any) {
    console.log('catch', error)
    state.loading = false
  }
}

// 更换其它域名
const clearDomain = () => {
  dns_form.value?.resetFields()
  state.type = 1
}

// 返回: 取消取回域名
const handleBack = () => {
  state.type4ErrorMsg = ''
  state.type = 3
}

// 获取TXT校验信息
const getTXTvalidateInfo = async (type: 1 | 2) => {
  try {
    state.loading = true
    const { code, data } = await _getDomainTxtInfo({
      domain: state.form.name,
      type,
    })
    state.loading = false
    if (code === 200) {
      state.box = data || {}
      if (type === 1) {
        // 取回
        state.type = 4
      } else {
        // txt校验
        state.type = 2
      }
    }
  } catch (error) {
    state.loading = false
  }
}

// 去认证
const authentication = () => {
  // pushRoute({
  //   name: "Authentication",
  // });
}

const close = () => {
  if (state.loading) return
  clearTxtTimer()
  dns_form.value?.resetFields()
  validateErr.value.name = true
  emit('update:dialog', false)
}

onUnmounted(() => {
  clearTxtTimer()
  dns_form.value?.resetFields()
})
watch(
  () => props.dialog,
  (d: boolean) => {
    clearDomain()
    if (d) {
      state.form.name = ''
      // state.type = 4
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.content {
  :deep(.el-form) {
    .el-form-item {
      .el-form-item__content {
        display: block;
      }

      .el-form-item__error {
        position: initial;
      }

      &.name {
        margin-bottom: 10px;
      }

      &.item-3 {
        margin-bottom: 0;

        .el-form-item__content {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          color: #555;

          span {
            color: var(--primary-color);
          }
        }
      }

      &.fi {
        margin-bottom: -14px;

        .dns-add-tip {
          font-family: PingFangSC, 'PingFang SC';
          font-size: 12px;
          font-weight: 400;
          line-height: 17px;
          color: rgb(85 85 85 / 75%);
        }
      }
    }
  }

  :deep(.form-2) {
    .el-form-item {
      margin-bottom: 12px;

      .el-form-item__label {
        height: 20px;
        line-height: 20px;
      }

      .el-form-item__label-wrap {
        height: 20px;
        line-height: 20px;
      }

      .el-form-item__content {
        line-height: 20px;
        word-break: break-all;
        white-space: normal;
      }

      &.backup {
        .el-form-item__content {
          height: auto;

          .el-radio-group {
            margin-top: -7px;
          }

          .type4-info-item-tip {
            margin-top: 2px;
            font-family: PingFangSC, 'PingFang SC';
            font-size: 12px;
            font-weight: 400;
            line-height: 17px;
            color: #999;
          }
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .type2-tip {
    margin-top: 18px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #555;
    word-break: break-all;

    span {
      color: var(--primary-color);
    }
  }

  .type2-box,
  .type4-box {
    width: 100%;
    padding: 12px;
    margin-top: 16px;
    background-color: #f9fafc;

    .type2-box-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      & > div:first-child {
        flex-shrink: 0;
        align-self: baseline;
        width: 100px;
        color: #999;
      }

      & > div:last-child {
        flex-shrink: 0;
        max-width: calc(100% - 100px);
        color: #000;
        word-break: break-all;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .type4-box-blue {
    display: flex;
    align-items: center;
    padding: 7px 12px;
    margin-bottom: 20px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: var(--error-color);
    background-color: var(--error-box-bgc);
    border-radius: 4px;

    svg {
      align-self: baseline;
      width: 14px;
      height: 14px;
      margin-top: 2px;
      margin-right: 8px;
    }
  }

  .type4-refresh {
    display: flex;
    align-items: center;
    margin-top: 12px;
    font-family: 'PingFang SC-Regular', 'PingFang SC';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    color: #555;

    span {
      display: flex;
      align-items: center;
    }

    .el-link {
      flex-shrink: 0;
      align-self: baseline;
      margin-left: 20px;
      user-select: none;
    }
  }

  .type4-result {
    padding-top: 4px;
    font-size: 12px;
    color: var(--error-color);
  }
}
</style>
