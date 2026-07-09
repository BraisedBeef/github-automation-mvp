<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.setPwd.title')"
    width="950px"
    :loading="comfirmLoading"
    :confirm-text="t('ins.setPwd.confirmText')"
    :cancel-text="t('ins.setPwd.cancelText')"
    @confirm="confirmHandle(formRef)"
    @open="open"
    @update:dialog="cancel(formRef)"
  >
    <Collapse v-model="isCollapse" :text="t('ins.setPwd.selectIns', [insList.length, insList.length])">
      <el-table :data="insList" class="mt20 table">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.setPwd.idName')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-primary">
                {{ row.insUuid }}
              </div>
              <div>{{ row.instanceName }}</div>
            </div>
          </template>
        </el-table-column>
        <!-- 用户名 -->
        <el-table-column min-width="150" :label="t('ins.setPwd.userName')">
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ row?.imageInfo.defaultAccount }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column min-width="100" :label="t('ins.setPwd.state')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="text-over">
                {{ INS_STATE_MAP[row.state] }}
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="150" :label="t('ins.setPwd.insType')" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="table-td_tooltip">
              <div class="df ac">
                <span class="mr10 text-over" style="max-width: calc(100% - 18px)">{{
                  row.specificationInfo?.typeName
                }}</span>
                <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="300" :label="t('ins.setPwd.insConfig')" show-overflow-tooltip>
          <template #default="{ row }">
            <div style="padding: 14px 0" class="table-td_tooltip">
              <p class="text-over">
                <span class="mr10">{{ t('ins.setPwd.cores', [row.specificationInfo?.vcpus]) }}</span
                ><span class="mr10">{{ row.specificationInfo?.ram }}GB</span
                ><span class="mr10">{{ handleRowMainPublicBandwidth(row) }}Mbps</span>
              </p>
              <p class="text-over">{{ t('ins.setPwd.sysDisk') }}{{ handleRowSysDiskName(row) }}</p>
              <p class="text-over">{{ t('ins.setPwd.net') }}{{ handleRowVpcName(row) }}</p>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="formRef"
        require-asterisk-position="right"
        label-width="auto"
        :model="form"
        :rules="rules"
        label-position="left"
      >
        <!-- 新密码 -->
        <el-form-item :label="t('ins.setPwd.newPwd')" prop="newPassword" class="password-wrap">
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
        <el-form-item :label="t('ins.setPwd.confirmPwd')" prop="confirmPassword">
          <el-input v-model.trim="form.confirmPassword" :placeholder="t('login.confirmNewPwd')" show-password />
        </el-form-item>
        <!-- 自动重启 -->
        <el-form-item :label="t('ins.setPwd.autoStart')">
          <el-checkbox v-model="form.checked" size="large">
            <span class="checkbox-text">{{ t('ins.setPwd.autoStartChecked') }}</span>
          </el-checkbox>
        </el-form-item>
      </el-form>
    </div>

    <!-- tip -->
    <div class="mt15">
      <Tip :text="tips" type="OneToOne" hide-margin-bottom />
    </div>
  </CatDialog>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { message } from '@/utils/message'
import { isValidInsPwd } from '@/views/cvm/ins/config'
import { FormInstance, FormRules } from 'element-plus/es'
import PwdPanel from './pwd-panel.vue'
import { INS_STATE_MAP, INS_SYS_USER_NAME, INS_SYS_SVG_MAP } from '@/views/cvm/ins/config'
import { _batchSetPwd } from '@/apis/cvm/ins'
import { useCvmStore } from '@/store'
import { useInsTableRow } from '@/views/cvm/hooks/use-ins-table-row'

interface Form {
  newPassword: string
  confirmPassword: string
  checked: boolean
}

interface PropType {
  insList: any[]
}

const props = withDefaults(defineProps<PropType>(), {
  insList: () => [],
})
const emits = defineEmits<{
  (event: 'success'): void
}>()

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

const cvmStore = useCvmStore()
const { handleRowSysDiskName, handleRowVpcName, handleRowMainPublicBandwidth } = useInsTableRow()

const pwdPanelIdName = 'pwd-panel-setPwd'

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({
  newPassword: '',
  confirmPassword: '',
  checked: true,
})
const showPanel = ref<boolean>(false) // 密码强度显示面板
const rules = reactive<FormRules<Form>>({
  newPassword: [{ required: true, validator: checkPwd, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: checkRePwd, trigger: 'blur' }],
})
const pwdPanelHeight = ref<number>(0)

const formRef = ref<FormInstance>()

const tips = computed(() => [
  {
    main: t('ins.setPwd.tipsMain'),
  },
])

const getPwdPanelDom = () => {
  if (showPanel.value) {
    nextTick(() => {
      const pwdPanelDom = document.getElementById(pwdPanelIdName)
      pwdPanelHeight.value = (pwdPanelDom?.offsetHeight || 0) + 10
    })
  }
}

const confirmHandle = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      batchSetPwd()
    } else {
      console.log('error submit!', fields)
    }
  })
}
// 弹窗打开
const open = () => {}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  form.checked = true
}

// 批量设置云服务器密码
const batchSetPwd = async () => {
  try {
    comfirmLoading.value = true
    const serverIds = props.insList.map(el => el.id)

    const res = await _batchSetPwd({
      regionId: cvmStore.areaSelect.id,
      serverIds, // 服务器ID
      pwd: form.newPassword,
      isAutoReboot: form.checked,
    })

    console.log(`_batchSetPwd===>`, res)

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
  width: 55%;
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

.checkbox-text {
  font-family: PingFangSC, 'PingFang SC';
  font-size: 14px;
  font-weight: 400;
  color: #222;
}

.mt15 {
  margin-top: 12px;
}
</style>
