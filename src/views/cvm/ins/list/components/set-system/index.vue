<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setSystem.title')"
    width="950px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.setSystem.selectIns', [insList.length])">
      <el-table :data="insList" class="mt20 table mb20">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.setSystem.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.setSystem.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 操作系统 -->
        <el-table-column min-width="350" :label="t('ins.setSystem.sys')">
          <template #default="{ row }">
            <div>{{ row.imageInfo.imageName }}</div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="200" :label="t('ins.setSystem.insConfig')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                <span class="mr4">{{ handleRowSysDiskName(row) }}</span>
                <span>{{ row.specificationInfo?.ram }}GB</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <!-- 立即关机 -->
    <el-checkbox v-if="type === 'RUNNING'" :model-value="checked" size="large">
      <span class="text-error">{{ t('ins.setSystem.shutdownChecked') }}</span>
    </el-checkbox>

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form ref="formRef" label-width="auto" :model="form" :rules="rules" label-position="left">
        <!-- 登录方式 -->
        <el-form-item :label="t('ins.setSystem.loginType')" prop="loginType" class="login-type-wrap">
          <div class="df jsb ac w-full">
            <BtnsGroup v-model="loginType" :list="btnsGroupList" :style="btnsGroupListStyle" />
            <span
              v-if="loginType.value === 2"
              class="text-primary cursor-pointer"
              @click="pushRoute({ name: 'ssh_key' })"
              >{{ t('ins.setSystem.createSshKey') }}</span
            >
          </div>
        </el-form-item>
        <template v-if="loginType.value === 1">
          <!-- 新密码 -->
          <el-form-item :label="t('ins.setSystem.newPwd')" prop="newPassword" class="password-wrap">
            <el-input
              v-model.trim="form.newPassword"
              :placeholder="t('domainSet2.pwdPlaceholder2')"
              show-password
              @focus="
                () => {
                  showPanel = true
                  getPwdPanelDom()
                }
              "
              @blur="showPanel = false"
            />
            <!-- 密码强度提示 -->
            <PwdPanel
              v-show="showPanel"
              :id="pwdPanelIdName"
              :value="form.newPassword"
              class="pwd-panel"
              :platform="insList[0]?.imageInfo.platform"
              :platform-default-name="insList[0]?.imageInfo.defaultAccount || ''"
              :style="{
                top: `-${pwdPanelHeight}px`,
              }"
            />
          </el-form-item>
          <!-- 确认密码 -->
          <el-form-item :label="t('ins.setSystem.confirmPwd')" prop="confirmPassword" class="mb0">
            <el-input v-model.trim="form.confirmPassword" :placeholder="t('login.confirmNewPwd')" show-password />
          </el-form-item>
        </template>
        <template v-else>
          <!-- SSH密钥 -->
          <el-form-item :label="t('ins.setSystem.sshkey')" prop="sshKey" class="mb0">
            <div class="w-full">
              <el-select v-model="form.sshKey" class="select-opts w-full" :placeholder="t('ins.setSystem.sshkeyPh')">
                <el-option v-for="item in sshKeyList" :key="item.id" :value="item.id" :label="item.sshName" />
              </el-select>
            </div>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { FormInstance, FormRules } from 'element-plus/es'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'
import { _listSSh } from '@/apis/cvm/ssh-key'
import { _resetInstanceImage } from '@/apis/cvm/ins'
import { useCvmStore } from '@/store'

import { INS_SYS_SVG_MAP, isValidInsPwd, WINDOWS } from '@/views/cvm/ins/config'
import PwdPanel from '../set-pwd/pwd-panel.vue'
import { pushRoute } from '@/utils/router-jump'

interface Form {
  newPassword: string
  confirmPassword: string
  sshKey: string
}

interface PropType {
  insList: any[]
  type: 'STOPPED' | 'RUNNING'
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
  type: 'STOPPED',
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

const cvmStore = useCvmStore()
const { handleRowSysDiskName } = useInsTableRow()

// 校验密码
const checkPwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!isValidInsPwd(props.insList[0]?.imageInfo.defaultAccount, value, props.insList[0]?.imageInfo.platform)) {
    callback(new Error(t('common.formatErr')))
  } else {
    callback()
  }
}

// 校验二次密码
const checkRePwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (value !== form.newPassword) {
    callback(new Error(t('myDomains.samePwdValidate')))
  } else {
    callback()
  }
}

const pwdPanelIdName = 'pwd-panel-setSystem'

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({
  newPassword: '',
  confirmPassword: '',
  sshKey: '',
})
const checked = ref<boolean>(true)
const loginType = ref<any>({
  label: t('ins.setSystem.setPwd'),
  value: 1,
})
const sshKeyList = ref<any[]>([]) // ssh key列表
const showPanel = ref<boolean>(false) // 密码强度显示面板
const pwdPanelHeight = ref<number>(0)
const rules = reactive<FormRules<Form>>({
  newPassword: [{ required: true, validator: checkPwd, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: checkRePwd, trigger: 'blur' }],
  sshKey: [{ required: true, message: '', trigger: 'change' }],
})

const formRef = ref<FormInstance>()

const tips = computed(() => [
  {
    main: t('ins.setSystem.tipsMain'),
    sub: [t('ins.setSystem.tipsSub1'), t('ins.setSystem.tipsSub2')],
  },
])

const btnsGroupList = computed(() => {
  // Windows 隐藏密钥tab
  const res = props.insList[0].imageInfo.platform === WINDOWS
  return res
    ? [
        {
          label: t('ins.setSystem.setPwd'),
          value: 1,
        },
      ]
    : [
        {
          label: t('ins.setSystem.setPwd'),
          value: 1,
        },
        {
          label: t('ins.setSystem.associateSshKey'),
          value: 2,
        },
      ]
})

const btnsGroupListStyle = computed(() => {
  // Windows 隐藏密钥tab
  return btnsGroupList.value.length === 2
    ? {
        width: '150px',
      }
    : {
        width: '130px',
      }
})

const getPwdPanelDom = () => {
  if (showPanel.value) {
    nextTick(() => {
      const pwdPanelDom = document.getElementById(pwdPanelIdName)
      console.log(`pwdPanelDom?.offsetHeight==>`, pwdPanelDom?.offsetHeight)

      pwdPanelHeight.value = (pwdPanelDom?.offsetHeight || 0) + 10
    })
  }
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      resetInstanceImage()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = () => {
  listSSh()
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  loginType.value = {
    label: t('ins.setSystem.setPwd'),
    value: 1,
  }
  if (!formEl) return
  formEl.resetFields()
}

// 分页查询秘钥列表
const listSSh = async () => {
  try {
    const res = await _listSSh({
      pageIndex: 1,
      pageSize: 999,
      regionId: cvmStore.areaSelect.id,
    })

    console.log(`_listSSh===>`, res)

    if (res.success) {
      sshKeyList.value = res.data?.list || []
    }
  } catch (error) {
    console.log(error)
  }
}

// 重装服务器镜像
const resetInstanceImage = async () => {
  comfirmLoading.value = true

  let params: any = {
    serverId: props.insList[0].id, // 服务器ID
  }

  if (loginType.value.value === 1) {
    params.pwd = form.newPassword
  } else {
    params.keyNameId = form.sshKey
  }

  if (props.type === 'RUNNING') {
    params.isAutoStop = checked.value
  }

  try {
    const res = await _resetInstanceImage(params)

    console.log(`_resetInstanceImage===>`, res)

    if (res.success) {
      message.success(res.msg)
      show.value = false
      emits('success')
    } else {
      message.warning(res.msg)
    }
  } catch (error) {
    console.log(error)
  } finally {
    comfirmLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.form-wrap {
  width: 500px;
}

.pwd-panel {
  left: 50%;

  /* top: 0px; */

  /* bottom: 50px; */
  transform: translateX(-50%);
}

.password-wrap {
  position: relative;
}

.mb0 {
  margin-bottom: 0 !important;
}
</style>
