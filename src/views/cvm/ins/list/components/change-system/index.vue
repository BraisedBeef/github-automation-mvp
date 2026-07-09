<template>
  <CatDialog
    v-model:dialog="show"
    :title="t('ins.changeSystem.title')"
    width="1050px"
    :loading="comfirmLoading"
    @confirm="confirmHandle(formRef)"
    @update:dialog="cancel(formRef)"
    @open="open"
  >
    <!-- tip -->
    <Tip :text="tips" type="OneToMany" />

    <Collapse v-model="isCollapse" :text="t('ins.changeSystem.curConfig')">
      <el-table :data="insList" class="mt20 table mb20">
        <!-- ID/名称 -->
        <el-table-column min-width="200" :label="t('ins.changeSystem.idName')">
          <template #default="{ row }">
            <div class="text-primary">
              {{ row.insUuid }}
            </div>
            <div>{{ row.instanceName }}</div>
          </template>
        </el-table-column>
        <!-- 实例类型 -->
        <el-table-column min-width="200" :label="t('ins.changeSystem.insType')">
          <template #default="{ row }">
            <div class="df ac">
              <span class="mr10">{{ row.specificationInfo?.typeName }}</span>
              <SvgIcon style="width: 17px; height: 17px" :name="INS_SYS_SVG_MAP[row.imageInfo.platform]?.actived" />
            </div>
          </template>
        </el-table-column>
        <!-- 操作系统 -->
        <el-table-column min-width="300" :label="t('ins.changeSystem.sys')">
          <template #default="{ row }">
            <div>{{ row.imageInfo.imageName }}</div>
          </template>
        </el-table-column>
        <!-- 实例配置 -->
        <el-table-column min-width="300" :label="t('ins.changeSystem.insConfig')">
          <template #default="{ row }">
            <div>
              <span class="mr4">{{ handleRowSysDiskName(row) }}</span>
              <span>{{ row.specificationInfo?.ram }}GB</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </Collapse>

    <!-- 立即关机 -->
    <el-checkbox v-if="type === 'RUNNING'" :model-value="checked" size="large">
      <span class="text-error">{{ t('ins.changeSystem.shutdownChecked') }}</span>
    </el-checkbox>

    <!-- form -->
    <div class="form-wrap mt20">
      <el-form
        ref="formRef"
        label-width="auto"
        :model="form"
        :rules="rules"
        label-position="left"
        require-asterisk-position="right"
        :validate-on-rule-change="false"
      >
        <!-- 镜像类型 -->
        <el-form-item :label="t('ins.changeSystem.imageType')">
          <BtnsGroup
            v-model="imageType"
            :list="IMAGE_TYPE_ARR_MAP"
            :style="{
              width: '130px',
            }"
            @change-value="changeImageType(formRef)"
          />
        </el-form-item>
        <!-- 目标镜像 -->
        <el-form-item :label="t('ins.changeSystem.targetType')" prop="image" class="mb20">
          <div class="df jsb ac w-full">
            <!-- 镜像平台 -->
            <el-select
              v-model="form.platform"
              style="width: 300px"
              class="mr20"
              :placeholder="t('ins.changeSystem.sshkeyPh')"
              @change="changePlatform"
            >
              <el-option v-for="item in platformOpts" :key="item" :value="item" :label="item" />
            </el-select>
            <!-- 镜像 -->
            <el-select
              v-model="form.image"
              style="width: 300px"
              :placeholder="t('ins.changeSystem.sshkeyPh')"
              @change="changeImage"
            >
              <template v-for="item in imageOpts" :key="item.id">
                <el-tooltip
                  v-if="isDisabled(item)"
                  effect="light"
                  :content="t('ins.changeSystem.imageDisableDesc')"
                  placement="top"
                >
                  <el-option :disabled="isDisabled(item)" :value="item.id" :label="item.imageName" />
                </el-tooltip>
                <el-option v-else :disabled="isDisabled(item)" :value="item.id" :label="item.imageName" />
              </template>
            </el-select>
            <!-- </el-form-item> -->
          </div>
        </el-form-item>
        <!-- 登录方式 -->
        <el-form-item :label="t('ins.changeSystem.loginType')" prop="loginType" class="login-type-wrap mb20">
          <div class="df jsb ac w-full">
            <BtnsGroup v-model="loginType" :list="loginTypeGroupList" :style="loginTypeGroupListStyle" />
            <span
              v-if="loginType.value === 2"
              class="text-primary cursor-pointer"
              @click="pushRoute({ name: 'ssh_key' })"
              >{{ t('ins.changeSystem.createSshKey') }}</span
            >
          </div>
        </el-form-item>
        <template v-if="loginType.value === 1">
          <!-- 新密码 -->
          <el-form-item :label="t('ins.changeSystem.newPwd')" prop="newPassword" class="password-wrap mb20">
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
              key="pwd-panel-changeSystem"
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
          <el-form-item :label="t('ins.changeSystem.confirmPwd')" prop="confirmPassword" class="mb0">
            <el-input v-model.trim="form.confirmPassword" :placeholder="t('login.confirmNewPwd')" show-password />
          </el-form-item>
        </template>
        <template v-else>
          <!-- SSH密钥 -->
          <el-form-item :label="t('ins.changeSystem.sshkey')" prop="sshKey" class="mb0">
            <div class="w-full">
              <el-select v-model="form.sshKey" class="w-full" :placeholder="t('ins.changeSystem.sshkeyPh')">
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
import { useCvmStore } from '@/store'

import { INS_SYS_SVG_MAP, isValidInsPwd, WINDOWS } from '@/views/cvm/ins/config'
import { IMAGE_TYPE_ARR_MAP } from '@/views/cvm/image/config'
import PwdPanel from '../set-pwd/pwd-panel.vue'
import { _groupImages } from '@/apis/cvm/image'
import { _changeServerOs } from '@/apis/cvm/ins'
import { isSysDisk } from '@/views/cvm/disk/config'
import { pushRoute } from '@/utils/router-jump'

interface Form {
  newPassword: string
  confirmPassword: string
  sshKey: string
  image: string
  platform: string
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

const pwdPanelIdName = 'pwd-panel-changeSystem'
// 校验密码
const checkPwd = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback('')
  } else if (!isValidInsPwd(platformDefaultName.value, value, form.platform)) {
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

const show = ref<boolean>(false) // 弹窗显示
const comfirmLoading = ref<boolean>(false)
const isCollapse = ref<boolean>(false) // 是否收起
const form = reactive<Form>({
  newPassword: '',
  confirmPassword: '',
  sshKey: '',
  image: '',
  platform: '',
})
const checked = ref<boolean>(true)
const loginType = ref<any>({
  label: t('ins.changeSystem.setPwd'),
  value: 1,
})
const imageType = ref<any>(IMAGE_TYPE_ARR_MAP[0])
const imageList = ref<any[]>([]) // 镜像集合
const sshKeyList = ref<any[]>([]) // ssh key 集合
const showPanel = ref<boolean>(false) // 密码强度显示面板
const pwdPanelHeight = ref<number>(0)
const rules = reactive<FormRules<Form>>({
  image: [{ required: true, message: '', trigger: 'change' }],
  newPassword: [{ required: true, validator: checkPwd, trigger: 'change' }],
  confirmPassword: [{ required: true, validator: checkRePwd, trigger: 'change' }],
  sshKey: [{ required: true, message: '', trigger: 'change' }],
})
const platformDefaultName = ref<string>('') // 镜像平台默认名称

const formRef = ref<FormInstance>()

const tips = computed(() => [
  {
    main: t('ins.changeSystem.tipsMain'),
    sub: [t('ins.changeSystem.tipsSub1'), t('ins.changeSystem.tipsSub2'), t('ins.changeSystem.tipsSub3')],
  },
])

// 镜像平台
const platformOpts = computed(() => {
  return imageList.value.map(el => el.platform)
})

// 镜像
const imageOpts = computed(() => {
  return imageList.value.find(el => el.platform === form.platform)?.images || []
})

const loginTypeGroupList = computed(() => {
  // Windows 隐藏密钥tab
  const res = form.platform === WINDOWS
  if (res) {
    loginType.value = {
      label: t('ins.changeSystem.setPwd'),
      value: 1,
    }
  }
  // Windows 隐藏密钥tab
  return res
    ? [
        {
          label: t('ins.changeSystem.setPwd'),
          value: 1,
        },
      ]
    : [
        {
          label: t('ins.changeSystem.setPwd'),
          value: 1,
        },
        {
          label: t('ins.changeSystem.associateSshKey'),
          value: 2,
        },
      ]
})

const loginTypeGroupListStyle = computed(() => {
  // Windows 隐藏密钥tab
  return loginTypeGroupList.value.length === 2
    ? {
        width: '150px',
      }
    : {
        width: '130px',
      }
})

// 当前系统盘内存小于所选镜像创建时所需容量
const isDisabled = raw => {
  const sysDisk = props.insList[0].diskInfos.filter(el => isSysDisk(el.type))?.[0]
  const sysDiskSize = sysDisk?.size

  return sysDiskSize - raw?.minDiskSize < 0
}

// 切换镜像类型
const changeImageType = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  form.platform = ''
  formEl.resetFields()
  groupImages()
}

// 切换镜像平台
const changePlatform = v => {
  console.log(`changePlatform==>`, v.value)
  form.image = ''
}

// 切换镜像
const changeImage = v => {
  console.log(`changeImage==>`, v)
  platformDefaultName.value = imageOpts.value.find(el => el.id === v)?.defaultAccount
}

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
      changeServerOs()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 弹窗打开
const open = () => {
  const imageInfo: any = props.insList[0]?.imageInfo
  imageType.value = IMAGE_TYPE_ARR_MAP[imageInfo?.imageType === 1 ? 0 : 1]
  form.platform = imageInfo?.platform
  form.image = imageInfo?.id
  listSSh()
  groupImages()
}

// 弹窗关闭
const cancel = (formEl: FormInstance | undefined) => {
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

// 切换服务器镜像
const changeServerOs = async () => {
  comfirmLoading.value = true

  let params: any = {
    serverId: props.insList[0].id, // 服务器ID
    imageType: imageType.value.value,
    imageId: form.image,
  }

  if (loginType.value.value === 1) {
    params.pwd = form.newPassword
  } else {
    params.keyId = form.sshKey
  }

  if (props.type === 'RUNNING') {
    params.isAutoStop = checked.value
  }

  try {
    const res = await _changeServerOs(params)

    console.log(`_changeServerOs===>`, res)

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

// 根据镜像类型获取镜像列表
const groupImages = async () => {
  try {
    const res = await _groupImages({
      regionId: cvmStore.areaSelect.id,
      imageType: imageType.value.value, // 1 公共镜像 2 私有镜像
    })

    console.log(`groupImages===>`, res)

    if (res.success) {
      imageList.value = res.data || []

      if (form.platform && form.image) {
        const imageOpts = imageList.value.find(el => el.platform === form.platform)?.images || []
        platformDefaultName.value = imageOpts.find(el => el.id === form.image)?.defaultAccount || ''
      } else {
        platformDefaultName.value = ''
      }
    }
  } catch (error) {
    console.log(error)
  }
}

defineExpose({
  show,
})
</script>

<style lang="scss" scoped>
.form-wrap {
  width: 700px;
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
